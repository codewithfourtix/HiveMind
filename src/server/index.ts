import express from 'express';
import { createServer, getContext, getServerPort } from '@devvit/server';
import { getRedis } from '@devvit/redis';
import { InitResponse, SubmitResponse } from '../shared/types/game';
import {
  buildBoard,
  computeResult,
  loadForUser,
  roundConfigGetOrCreate,
  submitAnswer,
  totalPlayers,
} from './core/state';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

const router = express.Router();

router.get('/api/init', async (_req, res): Promise<void> => {
  const { postId, userId } = getContext();
  const redis = getRedis();

  if (!postId) {
    res.status(400).json({ status: 'error', message: 'postId missing from context' });
    return;
  }

  try {
    const config = await roundConfigGetOrCreate(redis, postId);
    const { answers, record, streak } = await loadForUser(redis, postId, userId);
    const hasAnswered = !!record;

    const body: InitResponse = {
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
    res.json(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Init failed';
    console.error(`init error for ${postId}:`, error);
    res.status(500).json({ status: 'error', message });
  }
});

router.post('/api/submit', async (req, res): Promise<void> => {
  const { postId, userId } = getContext();
  const redis = getRedis();
  const answer = typeof req.body?.answer === 'string' ? req.body.answer : '';

  if (!postId) {
    res.status(400).json({ status: 'error', message: 'postId missing from context' });
    return;
  }
  if (!userId) {
    res.status(400).json({ status: 'error', message: 'You must be logged in to play.' });
    return;
  }
  const trimmed = answer.trim();
  if (!trimmed) {
    res.status(400).json({ status: 'error', message: 'Type an answer first.' });
    return;
  }
  if (trimmed.length > 60) {
    res.status(400).json({ status: 'error', message: 'Keep it short — 60 characters max.' });
    return;
  }

  try {
    await roundConfigGetOrCreate(redis, postId);

    // One answer per player per post.
    const existing = await loadForUser(redis, postId, userId);
    if (existing.record) {
      const result = computeResult(existing.answers, existing.record.clusterKey);
      const body: SubmitResponse = {
        status: 'success',
        result,
        board: buildBoard(existing.answers, existing.record.clusterKey),
        streak: existing.streak.count,
        score: existing.streak.score,
      };
      res.json(body);
      return;
    }

    const { result, board, streak } = await submitAnswer(redis, postId, userId, trimmed);
    const body: SubmitResponse = {
      status: 'success',
      result,
      board,
      streak: streak.count,
      score: streak.score,
    };
    res.json(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Submit failed';
    console.error(`submit error for ${postId}:`, error);
    res.status(500).json({ status: 'error', message });
  }
});

app.use(router);

const port = getServerPort();
const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port, () => console.log(`http://localhost:${port}`));
