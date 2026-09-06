import type { Db, Word, WordDraft } from './wordnest-types.js';

const KEY = 'wordnest-v1';

/**
 * Generate a unique id, falling back when crypto.randomUUID is unavailable.
 * @returns a unique string id.
 */
function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `w-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Create a fresh word entry from draft values.
 * @param draft the form values for the new word.
 * @returns a fully initialised word ready for spaced repetition.
 */
export function createWord(draft: WordDraft): Word {
  return {
    id: uid(),
    word: draft.word.trim(),
    definition: draft.definition.trim(),
    synonyms: draft.synonyms.trim(),
    example: draft.example.trim(),
    category: draft.category.trim() || 'General',
    part: draft.part,
    difficulty: draft.difficulty,
    notes: draft.notes.trim(),
    favorite: false,
    level: 'New',
    interval: 0,
    due: Date.now(),
    created: Date.now(),
    reviews: 0,
  };
}

/** An empty draft used to reset the add/edit form. */
export const emptyDraft: WordDraft = {
  word: '',
  definition: '',
  example: '',
  category: '',
  part: 'Noun',
  difficulty: 'Beginner',
  synonyms: '',
  notes: '',
};

const seedWords: WordDraft[] = [
  {
    word: 'curious',
    definition: '好奇的',
    example: 'She was curious about the new machine.',
    category: 'General',
    part: 'Adjective',
    difficulty: 'Intermediate',
    synonyms: 'inquisitive, eager',
    notes: '',
  },
  {
    word: 'achieve',
    definition: '实现；达到',
    example: 'He worked hard to achieve his goal.',
    category: 'Verbs',
    part: 'Verb',
    difficulty: 'Intermediate',
    synonyms: 'accomplish, attain',
    notes: '',
  },
  {
    word: 'reliable',
    definition: '可靠的',
    example: 'This source is reliable.',
    category: 'General',
    part: 'Adjective',
    difficulty: 'Intermediate',
    synonyms: 'dependable, trustworthy',
    notes: '',
  },
  {
    word: 'vivid',
    definition: '生动的；鲜明的',
    example: 'She has a vivid memory of the trip.',
    category: 'General',
    part: 'Adjective',
    difficulty: 'Advanced',
    synonyms: 'bright, striking',
    notes: '',
  },
  {
    word: 'improve',
    definition: '改善；提高',
    example: 'Reading daily can improve your vocabulary.',
    category: 'Verbs',
    part: 'Verb',
    difficulty: 'Beginner',
    synonyms: 'enhance, better',
    notes: '',
  },
];

/**
 * Build the default database, seeded with starter vocabulary.
 * @returns a new database instance.
 */
export function defaultDb(): Db {
  return {
    words: seedWords.map(createWord),
    reviews: [],
    quizzes: [],
    settings: { theme: 'light', quizLength: 5, quizType: 'meaning' },
  };
}

/** Shape of words saved by older versions that had a separate mandarin field. */
type LegacyWord = Partial<Word> & { mandarin?: string };

/**
 * Normalise a stored word, migrating the legacy separate `mandarin` field
 * into `definition` so the definition always holds the Chinese meaning.
 * @param raw a word as read from storage.
 * @returns a valid word entry.
 */
function migrateWord(raw: LegacyWord): Word {
  const chinese = (raw.mandarin ?? '').trim();
  const definition = chinese || (raw.definition ?? '').trim();
  return {
    id: raw.id ?? uid(),
    word: raw.word ?? '',
    definition,
    synonyms: raw.synonyms ?? '',
    example: raw.example ?? '',
    category: raw.category || 'General',
    part: raw.part ?? 'Other',
    difficulty: raw.difficulty ?? 'Beginner',
    notes: raw.notes ?? '',
    favorite: !!raw.favorite,
    level: raw.level ?? 'New',
    interval: raw.interval ?? 0,
    due: raw.due ?? Date.now(),
    created: raw.created ?? Date.now(),
    reviews: raw.reviews ?? 0,
  };
}

/**
 * Load the database from localStorage, falling back to seeded defaults.
 * @returns the persisted database or a freshly seeded one.
 */
export function loadDb(): Db {
  if (typeof localStorage === 'undefined') return defaultDb();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultDb();
    const parsed = JSON.parse(raw) as Partial<Db> & { words?: LegacyWord[] };
    if (!parsed || !Array.isArray(parsed.words)) return defaultDb();
    const words = parsed.words.map(migrateWord);
    return {
      words: words.length ? words : defaultDb().words,
      reviews: parsed.reviews ?? [],
      quizzes: parsed.quizzes ?? [],
      settings: { theme: 'light', quizLength: 5, quizType: 'meaning', ...parsed.settings },
    };
  } catch {
    return defaultDb();
  }
}

/**
 * Persist the database to localStorage.
 * @param db the database to save.
 */
export function saveDb(db: Db): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // storage full or unavailable — state stays in memory for this session
  }
}

/**
 * Validate and normalise an imported backup object.
 * @param value parsed JSON from a backup file.
 * @returns the migrated database, or null when the file is not a backup.
 */
export function parseBackup(value: unknown): Db | null {
  const candidate = value as (Partial<Db> & { words?: LegacyWord[] }) | null;
  if (!candidate || !Array.isArray(candidate.words)) return null;
  return {
    words: candidate.words.map(migrateWord),
    reviews: candidate.reviews ?? [],
    quizzes: candidate.quizzes ?? [],
    settings: { theme: 'light', quizLength: 5, quizType: 'meaning', ...candidate.settings },
  };
}
