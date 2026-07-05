import type { IncomingMessage, ServerResponse } from 'node:http';
import { once } from 'node:events';
import { context, reddit, redis } from '@devvit/web/server';
import type { InitResponse, SubmitResponse } from '../shared/types/game';
import { getDailyPrompt, samplesForPrompt } from './core/prompts';
import {
  buildBoard,
  computeResult,
  loadForUser,
  roundConfigGetOrCreate,
  roundConfigNew,
  seedAnswers,
  submitAnswer,
  totalPlayers,
} from './core/state';

const API_INIT = '/api/init';
const API_SUBMIT = '/api/submit';
const MENU_POST_CREATE = '/internal/menu/post-create';
const MENU_SEED = '/internal/menu/seed';
const ON_APP_INSTALL = '/internal/on-app-install';

export async function serverOnRequest(req: IncomingMessage, rsp: ServerResponse): Promise<void> {
  const path = (req.url ?? '').split('?')[0];
  try {
    switch (path) {
      case API_INIT:
        return writeJSON(200, await onInit(), rsp);
      case API_SUBMIT:
        return writeJSON(200, await onSubmit(req), rsp);
      case MENU_POST_CREATE:
        return writeJSON(200, await onMenuNewPost(), rsp);
      case MENU_SEED:
        return writeJSON(200, await onSeed(), rsp);
      case ON_APP_INSTALL:
        return writeJSON(200, await onAppInstall(), rsp);
      default:
        return writeJSON(404, { status: 'error', message: 'not found' }, rsp);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'server error';
    console.error(`server error on ${path}:`, err);
    writeJSON(200, { status: 'error', message }, rsp);
  }
}

// ---- webview API ----------------------------------------------------------

async function onInit(): Promise<InitResponse> {
  const postId = context.postId;
  if (!postId) return { status: 'error', message: 'No post context.' };

  const config = await roundConfigGetOrCreate(redis, postId);
  const { answers, record, streak } = await loadForUser(redis, postId, context.userId);
  const hasAnswered = !!record;

  return {
    status: 'success',
    prompt: config.prompt,
    emoji: config.emoji,
    totalPlayers: totalPlayers(answers),
    hasAnswered,
    streak: streak.count,
    score: streak.score,
    ...(hasAnswered
      ? {
          result: computeResult(answers, record!.clusterKey),
          board: buildBoard(answers, record!.clusterKey),
        }
      : {}),
  };
}

async function onSubmit(req: IncomingMessage): Promise<SubmitResponse> {
  const postId = context.postId;
  const userId = context.userId;
  if (!postId) return { status: 'error', message: 'No post context.' };
  if (!userId) return { status: 'error', message: 'You must be logged in to play.' };

  const body = await readJSON<{ answer?: unknown }>(req).catch(() => ({ answer: '' }));
  const answer = typeof body.answer === 'string' ? body.answer.trim() : '';
  if (!answer) return { status: 'error', message: 'Type an answer first.' };
  if (answer.length > 60) return { status: 'error', message: 'Keep it short — 60 characters max.' };

  await roundConfigGetOrCreate(redis, postId);
  const { result, board, streak } = await submitAnswer(redis, postId, userId, answer);
  return { status: 'success', result, board, streak: streak.count, score: streak.score };
}

// ---- menu item + install trigger (server-side post creation) --------------

async function onMenuNewPost(): Promise<{
  showToast: { text: string; appearance: 'success' | 'neutral' };
  navigateTo: string;
}> {
  const prompt = getDailyPrompt();
  const post = await reddit.submitCustomPost({ title: `🧠 Hive Mind — ${prompt.text}` });
  await roundConfigNew(redis, post.id, prompt);
  return {
    showToast: { text: 'New Hive Mind round posted!', appearance: 'success' },
    navigateTo: post.url,
  };
}

async function onSeed(): Promise<{
  showToast: { text: string; appearance: 'success' | 'neutral' };
}> {
  const postId = context.postId;
  if (!postId) {
    return { showToast: { text: 'Open a Hive Mind post, then seed it.', appearance: 'neutral' } };
  }
  const config = await roundConfigGetOrCreate(redis, postId);
  const samples = samplesForPrompt(config.prompt);
  if (samples.length === 0) {
    return { showToast: { text: 'No samples for this prompt.', appearance: 'neutral' } };
  }
  const total = await seedAnswers(redis, postId, samples);
  return {
    showToast: { text: `Seeded ${samples.length} answers — ${total} total. Reload the post.`, appearance: 'success' },
  };
}

async function onAppInstall(): Promise<Record<string, never>> {
  const prompt = getDailyPrompt();
  const post = await reddit.submitCustomPost({ title: `🧠 Hive Mind — ${prompt.text}` });
  await roundConfigNew(redis, post.id, prompt);
  return {};
}

// ---- http helpers ---------------------------------------------------------

function writeJSON(status: number, json: unknown, rsp: ServerResponse): void {
  const body = JSON.stringify(json);
  rsp.writeHead(status, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'application/json',
  });
  rsp.end(body);
}

async function readJSON<T>(req: IncomingMessage): Promise<T> {
  const chunks: Uint8Array[] = [];
  req.on('data', (chunk: Uint8Array) => chunks.push(chunk));
  await once(req, 'end');
  return JSON.parse(`${Buffer.concat(chunks)}`) as T;
}
