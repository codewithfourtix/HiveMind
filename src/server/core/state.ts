// All game state lives in Devvit's free Redis (KV only). We store each map as a
// single JSON blob and read-modify-write it. Daily-post traffic is low enough
// that this is simple and safe; there is no external database.

import type { BoardEntry, GameResult } from '../../shared/types/game';
import { canonicalize, matchCluster } from './cluster';
import { getDailyPrompt, type Prompt } from './prompts';

// Minimal structural view of the Devvit Redis client — just what state needs.
// Keeps this module testable with a plain in-memory mock.
export type RedisLike = {
  get(key: string): Promise<string | null | undefined>;
  set(key: string, value: string): Promise<unknown>;
};

export type RoundConfig = { prompt: string; emoji: string; date: string };
export type Cluster = { label: string; count: number };
export type AnswersMap = Record<string, Cluster>;
export type UserRecord = { clusterKey: string; answerLabel: string };
export type StreakRecord = { count: number; lastDate: string; score: number };

const BOARD_SIZE = 6;

const kConfig = (postId: string) => `hm:config:${postId}`;
const kAnswers = (postId: string) => `hm:answers:${postId}`;
const kUser = (postId: string, userId: string) => `hm:user:${postId}:${userId}`;
const kStreak = (userId: string) => `hm:streak:${userId}`;

export const todayUTC = (d = new Date()): string => d.toISOString().slice(0, 10);

// ---- round config ---------------------------------------------------------

export async function roundConfigMaybeGet(
  redis: RedisLike,
  postId: string
): Promise<RoundConfig | undefined> {
  const raw = await redis.get(kConfig(postId));
  return raw ? (JSON.parse(raw) as RoundConfig) : undefined;
}

export async function roundConfigNew(
  redis: RedisLike,
  postId: string,
  prompt: Prompt = getDailyPrompt()
): Promise<RoundConfig> {
  const config: RoundConfig = { prompt: prompt.text, emoji: prompt.emoji, date: todayUTC() };
  await redis.set(kConfig(postId), JSON.stringify(config));
  return config;
}

export async function roundConfigGetOrCreate(
  redis: RedisLike,
  postId: string
): Promise<RoundConfig> {
  return (await roundConfigMaybeGet(redis, postId)) ?? (await roundConfigNew(redis, postId));
}

// ---- answers --------------------------------------------------------------

async function answersGet(redis: RedisLike, postId: string): Promise<AnswersMap> {
  const raw = await redis.get(kAnswers(postId));
  return raw ? (JSON.parse(raw) as AnswersMap) : {};
}

/** Record a raw answer; returns the cluster key it landed in. */
async function answersAdd(
  redis: RedisLike,
  postId: string,
  raw: string
): Promise<{ clusterKey: string; label: string }> {
  const answers = await answersGet(redis, postId);
  const key = matchCluster(canonicalize(raw), Object.keys(answers));
  const label = raw.trim().replace(/\s+/g, ' ');
  const existing = answers[key];
  if (existing) {
    existing.count += 1;
  } else {
    answers[key] = { label: label || key, count: 1 };
  }
  await redis.set(kAnswers(postId), JSON.stringify(answers));
  return { clusterKey: key, label: answers[key]!.label };
}

export function totalPlayers(answers: AnswersMap): number {
  return Object.values(answers).reduce((sum, c) => sum + c.count, 0);
}

/**
 * Dev/demo helper: inject a batch of raw answers straight into a post's board,
 * running each through the same clustering as real submissions (no user records).
 * Returns the new total. Used by the mod-only "Seed demo answers" menu action.
 */
export async function seedAnswers(
  redis: RedisLike,
  postId: string,
  raws: string[]
): Promise<number> {
  const answers = await answersGet(redis, postId);
  for (const raw of raws) {
    const key = matchCluster(canonicalize(raw), Object.keys(answers));
    const label = raw.trim().replace(/\s+/g, ' ');
    const existing = answers[key];
    if (existing) existing.count += 1;
    else answers[key] = { label: label || key, count: 1 };
  }
  await redis.set(kAnswers(postId), JSON.stringify(answers));
  return totalPlayers(answers);
}

export function computeResult(answers: AnswersMap, clusterKey: string): GameResult {
  const sorted = Object.entries(answers).sort((a, b) => b[1].count - a[1].count);
  const total = totalPlayers(answers);
  const mine = answers[clusterKey];
  const clusterCount = mine?.count ?? 0;
  const rank = sorted.findIndex(([k]) => k === clusterKey) + 1;
  const topCount = sorted[0]?.[1].count ?? 0;
  return {
    answerLabel: mine?.label ?? clusterKey,
    clusterCount,
    totalPlayers: total,
    percent: total > 0 ? Math.round((clusterCount / total) * 100) : 0,
    rank: rank || 1,
    isHiveMind: rank === 1 && total > 1 && clusterCount === topCount,
    isRogue: clusterCount === 1 && total > 1,
  };
}

export function buildBoard(answers: AnswersMap, myKey?: string): BoardEntry[] {
  return Object.entries(answers)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, BOARD_SIZE)
    .map(([key, c]) => ({ label: c.label, count: c.count, isMine: key === myKey }));
}

// ---- per-user record ------------------------------------------------------

export async function userRecordGet(
  redis: RedisLike,
  postId: string,
  userId: string
): Promise<UserRecord | undefined> {
  const raw = await redis.get(kUser(postId, userId));
  return raw ? (JSON.parse(raw) as UserRecord) : undefined;
}

async function userRecordSet(
  redis: RedisLike,
  postId: string,
  userId: string,
  record: UserRecord
): Promise<void> {
  await redis.set(kUser(postId, userId), JSON.stringify(record));
}

// ---- streaks & score ------------------------------------------------------

export async function streakGet(redis: RedisLike, userId: string): Promise<StreakRecord> {
  const raw = await redis.get(kStreak(userId));
  return raw ? (JSON.parse(raw) as StreakRecord) : { count: 0, lastDate: '', score: 0 };
}

async function streakBump(
  redis: RedisLike,
  userId: string,
  addScore: number
): Promise<StreakRecord> {
  const s = await streakGet(redis, userId);
  const today = todayUTC();
  if (s.lastDate !== today) {
    const yesterday = todayUTC(new Date(Date.now() - 86_400_000));
    s.count = s.lastDate === yesterday ? s.count + 1 : 1;
    s.lastDate = today;
  }
  if (s.count === 0) s.count = 1;
  s.score += addScore;
  await redis.set(kStreak(userId), JSON.stringify(s));
  return s;
}

// ---- high-level: submit an answer -----------------------------------------

export async function submitAnswer(
  redis: RedisLike,
  postId: string,
  userId: string,
  raw: string
): Promise<{ result: GameResult; board: BoardEntry[]; streak: StreakRecord }> {
  // Idempotent: one answer per player per post. If they already played, return
  // their live standing without mutating anything or re-bumping the streak.
  const prior = await userRecordGet(redis, postId, userId);
  if (prior) {
    const answers = await answersGet(redis, postId);
    return {
      result: computeResult(answers, prior.clusterKey),
      board: buildBoard(answers, prior.clusterKey),
      streak: await streakGet(redis, userId),
    };
  }

  const { clusterKey, label } = await answersAdd(redis, postId, raw);
  await userRecordSet(redis, postId, userId, { clusterKey, answerLabel: label });
  const answers = await answersGet(redis, postId);
  const result = computeResult(answers, clusterKey);
  const streak = await streakBump(redis, userId, result.percent);
  return { result, board: buildBoard(answers, clusterKey), streak };
}

export async function loadForUser(
  redis: RedisLike,
  postId: string,
  userId: string | undefined
): Promise<{
  answers: AnswersMap;
  record: UserRecord | undefined;
  streak: StreakRecord;
}> {
  const answers = await answersGet(redis, postId);
  const record = userId ? await userRecordGet(redis, postId, userId) : undefined;
  const streak = userId
    ? await streakGet(redis, userId)
    : { count: 0, lastDate: '', score: 0 };
  return { answers, record, streak };
}
