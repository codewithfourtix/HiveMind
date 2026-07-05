// "Smart matching": collapse the many ways people phrase the same answer into a
// single canonical cluster key, entirely locally — no external API, no key, no
// network. This is the engine that makes Hive Mind feel like it *understands*
// that "pizza", "🍕 Pizza!" and "a slice of pizza" are all the same thing.
//
// There is a deliberate seam here: swap `canonicalize` for an embeddings-backed
// matcher later without touching the rest of the app.

const FILLERS = new Set([
  'a',
  'an',
  'the',
  'some',
  'my',
  'of',
  'is',
  'to',
  'go',
  'i',
  'would',
  'like',
  'just',
  'really',
]);

/** Strip emoji, punctuation and diacritics; keep letters, digits and spaces. */
function stripToWords(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // drops emoji, punctuation, symbols
    .replace(/\s+/g, ' ')
    .trim();
}

/** Very light singularizer for the final token. Conservative on purpose. */
function singularize(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (/(ses|xes|zes|ches|shes)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

/** Turn a raw answer into a canonical cluster key. */
export function canonicalize(raw: string): string {
  const cleaned = stripToWords(raw);
  if (!cleaned) return '';
  const tokens = cleaned.split(' ').filter((t) => !FILLERS.has(t));
  const kept = tokens.length ? tokens : cleaned.split(' ');
  const singular = kept.map(singularize);
  return singular.join(' ').trim();
}

/** Levenshtein distance, capped early for speed. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return 3;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array<number>(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1]! + 1, prev[j]! + 1, prev[j - 1]! + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n]!;
}

/**
 * Find the existing cluster key that a new answer belongs to, or return the new
 * key if it starts its own cluster. Exact canonical match wins; otherwise a
 * near-miss (typo) within edit distance 1 on longer words is merged.
 */
export function matchCluster(key: string, existingKeys: string[]): string {
  if (!key) return key;
  if (existingKeys.includes(key)) return key;
  for (const existing of existingKeys) {
    const minLen = Math.min(key.length, existing.length);
    if (minLen >= 5 && levenshtein(key, existing) <= 1) return existing;
  }
  return key;
}
