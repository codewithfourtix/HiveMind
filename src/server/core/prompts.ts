// The daily prompt bank. Each post picks one prompt at creation time and stores
// it in the post config, so a single post always shows the same prompt.

export type Prompt = { text: string; emoji: string };

export const PROMPTS: Prompt[] = [
  { text: 'Name something you would take to a desert island.', emoji: '🏝️' },
  { text: 'Name a food that is better cold than hot.', emoji: '🥶' },
  { text: 'Name the first animal that comes to mind.', emoji: '🦊' },
  { text: 'Name a color that is NOT the rainbow.', emoji: '🎨' },
  { text: 'Name a superpower everyone secretly wants.', emoji: '🦸' },
  { text: 'Name something you always lose.', emoji: '🔍' },
  { text: 'Name a movie everyone has seen.', emoji: '🎬' },
  { text: 'Name a country you would move to tomorrow.', emoji: '✈️' },
  { text: 'Name a snack you cannot stop eating.', emoji: '🍿' },
  { text: 'Name the most useless kitchen gadget.', emoji: '🍳' },
  { text: 'Name a word that just sounds funny.', emoji: '😂' },
  { text: 'Name something that is overrated.', emoji: '🙄' },
  { text: 'Name a fictional place you wish were real.', emoji: '🗺️' },
  { text: 'Name the best pizza topping.', emoji: '🍕' },
  { text: 'Name an app you check first thing in the morning.', emoji: '📱' },
  { text: 'Name a smell that brings back memories.', emoji: '👃' },
  { text: 'Name something you would ban forever.', emoji: '🚫' },
  { text: 'Name a hobby you wish you had time for.', emoji: '🎯' },
  { text: 'Name the greatest board game of all time.', emoji: '🎲' },
  { text: 'Name a drink that fixes a bad day.', emoji: '🥤' },
  { text: 'Name an animal that would rule the world.', emoji: '👑' },
  { text: 'Name something you do that nobody knows about.', emoji: '🤫' },
  { text: 'Name a song everyone knows the words to.', emoji: '🎵' },
  { text: 'Name the scariest thing in the ocean.', emoji: '🌊' },
  { text: 'Name a chore you secretly enjoy.', emoji: '🧹' },
  { text: 'Name a fruit that is a perfect 10.', emoji: '🍓' },
  { text: 'Name something humans will laugh at in 50 years.', emoji: '🔮' },
  { text: 'Name the ultimate comfort movie.', emoji: '🛋️' },
  { text: 'Name a small thing that makes your whole day better.', emoji: '☀️' },
  { text: 'Name an emoji you overuse.', emoji: '💬' },
];

/** Deterministic "prompt of the day" so every post created today shares a theme. */
export function getDailyPrompt(seed = new Date()): Prompt {
  const start = Date.UTC(seed.getUTCFullYear(), 0, 0);
  const now = Date.UTC(seed.getUTCFullYear(), seed.getUTCMonth(), seed.getUTCDate());
  const dayOfYear = Math.floor((now - start) / 86_400_000);
  const idx = ((dayOfYear % PROMPTS.length) + PROMPTS.length) % PROMPTS.length;
  return PROMPTS[idx] ?? PROMPTS[0]!;
}
