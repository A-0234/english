/**
 * A vocabulary entry stored in the learner's library.
 */
export type Word = {
  /** Stable unique identifier. */
  id: string;
  /** The English word or phrase. */
  word: string;
  /** The Chinese meaning of the word. */
  definition: string;
  /** Comma separated synonyms. */
  synonyms: string;
  /** Example sentence using the word. */
  example: string;
  /** User defined category, e.g. "Verbs". */
  category: string;
  /** Part of speech. */
  part: string;
  /** Difficulty label. */
  difficulty: string;
  /** Free-form notes. */
  notes: string;
  /** Whether the learner starred this word. */
  favorite: boolean;
  /** Spaced-repetition stage. */
  level: Level;
  /** Current review interval in days. */
  interval: number;
  /** Timestamp (ms) when the card becomes due. */
  due: number;
  /** Timestamp (ms) when the word was added. */
  created: number;
  /** How many times the card was reviewed. */
  reviews: number;
};

/** Learning stage of a word. */
export type Level = 'New' | 'Learning' | 'Mastered';

/** Rating given to a flashcard: 0 = hard, 1 = good, 2 = easy. */
export type Rating = 0 | 1 | 2;

/** A single spaced-repetition review event. */
export type ReviewEvent = {
  /** Timestamp (ms) of the review. */
  date: number;
  /** The rating the learner gave. */
  rating: Rating;
  /** Id of the reviewed word. */
  id: string;
};

/** The result of one completed quiz. */
export type QuizResult = {
  /** Timestamp (ms) when the quiz finished. */
  date: number;
  /** Number of correct answers. */
  correct: number;
  /** Number of questions asked. */
  total: number;
};

/** Direction of quiz questions. */
export type QuizType = 'meaning' | 'word';

/** User preferences. */
export type Settings = {
  /** Active color theme. */
  theme: 'light' | 'dark';
  /** Number of questions per quiz. */
  quizLength: number;
  /** Default quiz direction. */
  quizType: QuizType;
};

/** The full persisted application state. */
export type Db = {
  words: Word[];
  reviews: ReviewEvent[];
  quizzes: QuizResult[];
  settings: Settings;
};

/** Form values used when creating or editing a word. */
export type WordDraft = {
  word: string;
  definition: string;
  example: string;
  category: string;
  part: string;
  difficulty: string;
  synonyms: string;
  notes: string;
};

/** Identifier of a screen in the app. */
export type ViewId = 'dashboard' | 'library' | 'review' | 'quiz' | 'speaking' | 'stats' | 'settings';

/** One question presented during a quiz. */
export type QuizQuestion = {
  /** The word this question is about. */
  word: Word;
  /** The prompt shown to the learner. */
  prompt: string;
  /** The correct answer text. */
  answer: string;
  /** All answer options, including the correct one. */
  options: string[];
};
