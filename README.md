# 🧠 Hive Mind

**Can you think like the rest of Reddit?**

Hive Mind is a daily social guessing game built on Reddit's Developer Platform
(Devvit). Each day a prompt drops in the post — _"Name something you'd take to a
desert island"_ — and you submit **one** answer. You don't score by being right;
you score by **matching the crowd**. The more Redditors who said the same thing
as you, the more of the Hive Mind you are.

It's Family Feud meets Reddit's collective unconscious.

---

## 🎣 The hook

- **Come back daily** — a fresh prompt every day, plus a 🔥 streak and a running
  ⭐ hive-score that grows the more days you play.
- **Instant, satisfying reveal** — submit and watch the "hive board" of the
  community's top answers animate in, with your answer highlighted.
- **An identity every round** — 👑 _You ARE the Hive Mind_ (top answer), 🐝 _Part
  of the swarm_, or 🦄 _Rogue Thinker_ (nobody else said it). All shareable.
- **Every answer is user-generated** — the game board _is_ the community. The
  more people play, the smarter and funnier it gets.

## 🧩 The clever bit: smart matching

People phrase the same idea a hundred ways. Hive Mind collapses them into one
cluster **entirely locally** — no external API, no key, no cloud:

- strips emoji, punctuation and accents
- removes filler words (`a`, `the`, `to`, …)
- light singularization (`dogs` → `dog`)
- typo-tolerant merging via bounded edit distance

So `Pizza`, `🍕 pizza!`, `PIZZA` and `pizzas` all land in one hive — and
`icecream` merges with `ice cream`. The matcher lives behind a single
`canonicalize()` seam in
[`src/server/core/cluster.ts`](src/server/core/cluster.ts) — swap in embeddings
later without touching the rest of the app.

## 🏗️ Architecture

```
src/
  client/        React 19 + Vite UI (builds to /webroot)  ──fetch──┐
  server/        Express on @devvit/server                          │
    core/                                                           │
      prompts.ts   daily prompt bank                                │
      cluster.ts   local "smart matching" engine                    ▼
      state.ts     all game state in Devvit Redis (KV, JSON blobs)
  devvit/        main.tsx — post creation + loading preview
  shared/        types shared by client & server
```

- **Client ↔ server**: `GET /api/init`, `POST /api/submit`.
- **Storage**: Devvit's free Redis only — round config, clustered answers,
  per-user answer lock, and streaks. No external database.
- **Live standings**: a player's percent, rank and the board are recomputed from
  current data on every load, so your standing shifts as more bees answer.

## 🎯 Built for the judging criteria

| Criterion       | How Hive Mind delivers                                             |
| --------------- | ----------------------------------------------------------------- |
| Delightful UX   | one-tap play, animated honeycomb reveal, warm hive theme          |
| Polish          | typed end-to-end, graceful errors, mobile-first                   |
| Reddity         | it's literally about Reddit's hive mind; every answer is UGC       |
| Hook            | daily prompt + streaks + shareable identity                       |
| User content    | the entire board is community-generated                           |

## ▶️ Run it

Prereqs: Node 22+, a Reddit account, and the Devvit CLI (`npm i -g devvit`).

```bash
npm install
npm run login          # authenticate with Reddit (paste the code)
npm run devvit:init    # register the app on Reddit
# create a private test subreddit, then put its name in the
# "dev:devvit" script in package.json (replace YOUR_SUBREDDIT_NAME)
npm run dev            # runs preflight checks, then starts playtest
```

Then open your test subreddit → the "…" menu → **Hive Mind: New daily round** to
create a post, and play.

## 🛠️ Tech

React 19 · Vite 6 · TypeScript · Express 5 · Tailwind CSS 4 · Devvit (Reddit
Developer Platform) · Redis.

## 📄 License

MIT — see [LICENSE](LICENSE).
