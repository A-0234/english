import type { ReviewEvent } from './wordnest-types.js';

/**
 * Randomly shuffle an array without mutating the input.
 * @param items the array to shuffle.
 * @returns a new shuffled array.
 */
export function shuffle<T>(items: T[]): T[] {
  return items
    .map((item) => [Math.random(), item] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([, item]) => item);
}

/**
 * Normalise a spoken or written phrase for comparison.
 * @param value raw text.
 * @returns lowercased text with punctuation and extra spaces removed.
 */
export function normalizeSpeech(value: string): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Levenshtein edit distance between two strings.
 * @param a first string.
 * @param b second string.
 * @returns the number of single-character edits needed.
 */
export function levenshtein(a: string, b: string): number {
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[b.length];
}

/**
 * Approximate similarity between what was heard and the target phrase.
 * @param heard the recognised speech.
 * @param target the expected word or phrase.
 * @returns a score between 0 and 1.
 */
export function similarity(heard: string, target: string): number {
  const a = normalizeSpeech(heard);
  const b = normalizeSpeech(target);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const A = a.split(' ');
  const B = b.split(' ');
  const max = Math.max(A.length, B.length);
  let hits = 0;
  A.forEach((x) => {
    const match = B.some(
      (y) => y === x || levenshtein(x, y) <= Math.max(1, Math.floor(Math.max(x.length, y.length) * 0.2))
    );
    if (match) hits += 1;
  });
  return hits / max;
}

/**
 * Count consecutive days (ending today) that contain at least one review.
 * @param reviews all recorded review events.
 * @returns the current streak length in days.
 */
export function calcStreak(reviews: ReviewEvent[]): number {
  const days = new Set(reviews.map((r) => new Date(r.date).toDateString()));
  let count = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (days.has(cursor.toDateString())) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

/** A single day cell in the activity heatmap. */
export type HeatCell = {
  /** Localised date label. */
  label: string;
  /** Number of reviews on that day. */
  count: number;
};

/**
 * Build heatmap cells for the last N days.
 * @param reviews all recorded review events.
 * @param days how many days to include.
 * @returns cells ordered oldest to newest.
 */
export function buildHeatmap(reviews: ReviewEvent[], days: number): HeatCell[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const cells: HeatCell[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(now.getTime() - i * 86400000);
    const start = day.getTime();
    const end = start + 86400000;
    cells.push({
      label: day.toLocaleDateString(),
      count: reviews.filter((r) => r.date >= start && r.date < end).length,
    });
  }
  return cells;
}

/**
 * Compute the next review interval for a rated card.
 * @param rating 0 = hard, 1 = good, 2 = easy.
 * @param interval the card's current interval in days.
 * @returns the next interval in days.
 */
export function nextInterval(rating: 0 | 1 | 2, interval: number): number {
  if (rating === 0) return 0.5;
  if (rating === 1) return Math.max(1, interval ? Math.round(interval * 2) : 2);
  return Math.max(3, interval ? Math.round(interval * 3) : 4);
}
