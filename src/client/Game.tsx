import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BoardEntry, GameResult, InitResponse, SubmitResponse } from '../shared/types/game';

type Phase = 'loading' | 'input' | 'revealed' | 'error';

type Data = {
  prompt: string;
  emoji: string;
  totalPlayers: number;
  streak: number;
  score: number;
  result?: GameResult | undefined;
  board?: BoardEntry[] | undefined;
};

function identity(result: GameResult): { icon: string; title: string; blurb: string } {
  if (result.totalPlayers <= 1) {
    return {
      icon: '🌱',
      title: "You're the seed",
      blurb: 'First one in — every hive starts with a single bee.',
    };
  }
  if (result.isHiveMind) {
    return {
      icon: '👑',
      title: 'You ARE the Hive Mind',
      blurb: 'You landed on the single most popular answer.',
    };
  }
  if (result.isRogue) {
    return {
      icon: '🦄',
      title: 'Rogue Thinker',
      blurb: 'Nobody else said this. A mind of your own.',
    };
  }
  return {
    icon: '🐝',
    title: 'Part of the swarm',
    blurb: 'You think like a healthy chunk of the hive.',
  };
}

const Header: React.FC<{ streak: number; score: number }> = ({ streak, score }) => (
  <header className="flex w-full max-w-md items-center justify-between px-1 py-2">
    <div className="flex items-center gap-2">
      <span className="text-2xl">🐝</span>
      <span className="text-lg font-extrabold tracking-tight text-amber-200">Hive Mind</span>
    </div>
    <div className="flex items-center gap-3 text-sm font-semibold">
      <span className="rounded-full bg-white/5 px-2.5 py-1 text-amber-100" title="Day streak">
        <span className="hm-flame">🔥</span> {streak}
      </span>
      <span className="rounded-full bg-white/5 px-2.5 py-1 text-amber-100" title="Hive score">
        ⭐ {score}
      </span>
    </div>
  </header>
);

const PromptCard: React.FC<{ emoji: string; prompt: string }> = ({ emoji, prompt }) => (
  <div className="hm-pop mt-2 w-full max-w-md rounded-2xl border border-amber-500/20 bg-white/5 p-5 text-center shadow-lg">
    <div className="mb-2 text-5xl">{emoji}</div>
    <p className="text-xl font-bold leading-snug text-amber-50">{prompt}</p>
  </div>
);

const Board: React.FC<{ board: BoardEntry[] }> = ({ board }) => {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 60);
    return () => clearTimeout(t);
  }, []);
  const max = Math.max(1, ...board.map((b) => b.count));
  return (
    <div className="mt-4 flex w-full max-w-md flex-col gap-2">
      {board.map((entry, i) => (
        <div key={i} className="hm-bar flex h-11 items-center px-3">
          <div
            className={`hm-bar-fill ${entry.isMine ? 'mine' : ''}`}
            style={{ width: grown ? `${(entry.count / max) * 100}%` : '0%' }}
          />
          <span className="relative z-10 flex-1 truncate font-semibold text-amber-50">
            {entry.isMine && <span className="mr-1">➤</span>}
            {entry.label}
          </span>
          <span className="relative z-10 ml-2 font-bold tabular-nums text-amber-200">
            {entry.count}
          </span>
        </div>
      ))}
    </div>
  );
};

const ResultView: React.FC<{ data: Data; onShare: () => void; shared: boolean }> = ({
  data,
  onShare,
  shared,
}) => {
  const result = data.result!;
  const id = identity(result);
  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <div className="hm-pop mt-3 flex flex-col items-center">
        <div className="hm-hero-num text-6xl font-black text-amber-300">{result.percent}%</div>
        <p className="mt-1 text-sm text-amber-100/80">
          of the hive said{' '}
          <span className="font-bold text-amber-100">“{result.answerLabel}”</span>
        </p>
      </div>

      <div className="hm-fade mt-4 flex w-full items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
        <span className="text-4xl">{id.icon}</span>
        <div>
          <div className="text-lg font-extrabold text-amber-100">{id.title}</div>
          <div className="text-sm text-amber-100/70">{id.blurb}</div>
        </div>
      </div>

      {data.board && <Board board={data.board} />}

      <p className="mt-4 text-center text-sm text-amber-100/60">
        {result.totalPlayers} {result.totalPlayers === 1 ? 'bee has' : 'bees have'} answered · come
        back tomorrow for a new prompt
      </p>

      <button
        onClick={onShare}
        className="mt-3 w-full rounded-xl bg-amber-400 py-3 font-bold text-amber-950 transition active:scale-[0.98]"
      >
        {shared ? '✓ Copied result' : '📋 Share your result'}
      </button>
    </div>
  );
};

const InputView: React.FC<{
  onSubmit: (answer: string) => void;
  submitting: boolean;
  error: string;
}> = ({ onSubmit, submitting, error }) => {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  const submit = () => {
    if (value.trim() && !submitting) onSubmit(value.trim());
  };
  return (
    <div className="mt-5 flex w-full max-w-md flex-col items-center">
      <p className="mb-2 text-center text-sm text-amber-100/70">
        Type the answer you think <span className="font-bold">most Redditors</span> will give.
      </p>
      <input
        ref={ref}
        value={value}
        maxLength={60}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="one short answer…"
        className={`w-full rounded-xl border border-amber-500/30 bg-white/5 px-4 py-3 text-center text-lg font-semibold text-amber-50 outline-none placeholder:text-amber-100/30 focus:border-amber-400 ${error ? 'hm-shake' : ''}`}
      />
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      <button
        onClick={submit}
        disabled={!value.trim() || submitting}
        className="mt-3 w-full rounded-xl bg-amber-400 py-3 font-bold text-amber-950 transition active:scale-[0.98] disabled:opacity-40"
      >
        {submitting ? 'Joining the hive…' : 'Join the hive'}
      </button>
    </div>
  );
};

export const Game: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('loading');
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shared, setShared] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setShowBanner(!window.location.hostname.endsWith('devvit.net'));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/init');
        const json = (await res.json()) as InitResponse;
        if (json.status === 'error') {
          setError(json.message);
          setPhase('error');
          return;
        }
        setData({
          prompt: json.prompt,
          emoji: json.emoji,
          totalPlayers: json.totalPlayers,
          streak: json.streak,
          score: json.score,
          result: json.result,
          board: json.board,
        });
        setPhase(json.hasAnswered ? 'revealed' : 'input');
      } catch {
        setError('Could not reach the hive. Please reload.');
        setPhase('error');
      }
    })();
  }, []);

  const handleSubmit = useCallback(async (answer: string) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });
      const json = (await res.json()) as SubmitResponse;
      if (json.status === 'error') {
        setSubmitError(json.message);
        setSubmitting(false);
        return;
      }
      setData((prev) =>
        prev
          ? {
              ...prev,
              result: json.result,
              board: json.board,
              streak: json.streak,
              score: json.score,
              totalPlayers: json.result.totalPlayers,
            }
          : prev
      );
      setPhase('revealed');
    } catch {
      setSubmitError('Network error — try again.');
    } finally {
      setSubmitting(false);
    }
  }, []);

  const shareText = useMemo(() => {
    if (!data?.result) return '';
    const id = identity(data.result);
    return `🧠 Hive Mind\n${data.prompt}\nI think like ${data.result.percent}% of the hive ${id.icon} ${id.title}\n🔥 Streak: ${data.streak}\n${window.location.href}`;
  }, [data]);

  const onShare = useCallback(() => {
    if (!shareText) return;
    navigator.clipboard?.writeText(shareText).then(
      () => {
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      },
      () => setShared(false)
    );
  }, [shareText]);

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto px-4 pb-8">
      {showBanner && (
        <div className="mb-2 w-full rounded-b-lg bg-amber-600/90 p-2 text-center text-xs text-amber-950">
          Backend runs on your test subreddit — open the post there to play with live data.
        </div>
      )}

      {data && <Header streak={data.streak} score={data.score} />}

      {phase === 'loading' && (
        <div className="mt-24 flex flex-col items-center gap-3 text-amber-200">
          <span className="animate-bounce text-5xl">🐝</span>
          <span className="font-semibold">Waking the hive…</span>
        </div>
      )}

      {phase === 'error' && (
        <div className="mt-24 flex flex-col items-center gap-3 text-center text-amber-100">
          <span className="text-5xl">😵</span>
          <p className="max-w-xs">{error}</p>
        </div>
      )}

      {phase !== 'loading' && phase !== 'error' && data && (
        <>
          <PromptCard emoji={data.emoji} prompt={data.prompt} />
          {phase === 'input' && (
            <InputView onSubmit={handleSubmit} submitting={submitting} error={submitError} />
          )}
          {phase === 'revealed' && <ResultView data={data} onShare={onShare} shared={shared} />}
        </>
      )}
    </div>
  );
};
