import type { QuizQuestion, QuizType, Word } from './wordnest-types.js';
import { shuffle } from './wordnest-utils.js';

/**
 * Read the prompt/answer side of a word for a given quiz direction.
 * @param word the word to read.
 * @param type the quiz direction.
 * @returns the English word or the Chinese meaning.
 */
function answerOf(word: Word, type: QuizType): string {
  return type === 'word' ? word.word : word.definition;
}

/**
 * Read the side of the word shown as the question.
 * @param word the word to read.
 * @param type the quiz direction.
 * @returns the prompt text.
 */
function promptOf(word: Word, type: QuizType): string {
  return type === 'word' ? word.definition : word.word;
}

/**
 * Build one multiple-choice question.
 *
 * The correct answer is always included: distractors are picked first, then the
 * answer is added and the combined list is shuffled. Duplicate option texts are
 * removed so the same answer can never appear twice.
 *
 * @param word the word being tested.
 * @param pool all words available as distractors.
 * @param type the quiz direction.
 * @returns a question with up to four options.
 */
export function buildQuestion(word: Word, pool: Word[], type: QuizType): QuizQuestion {
  const answer = answerOf(word, type);
  const distractors = shuffle(
    Array.from(
      new Set(
        pool
          .filter((candidate) => candidate.id !== word.id)
          .map((candidate) => answerOf(candidate, type))
          .filter((text) => text && text !== answer)
      )
    )
  ).slice(0, 3);
  return {
    word,
    prompt: promptOf(word, type),
    answer,
    options: shuffle([answer, ...distractors]),
  };
}

/**
 * Build a full quiz from the learner's library.
 *
 * Words missing the side needed for the selected direction are skipped, so a
 * quiz never shows a blank prompt or a blank answer.
 *
 * @param words the full vocabulary library.
 * @param type the quiz direction.
 * @param length how many questions to generate at most.
 * @returns the generated questions, empty when not enough words qualify.
 */
export function buildQuiz(words: Word[], type: QuizType, length: number): QuizQuestion[] {
  const usable = words.filter((word) => promptOf(word, type).trim() && answerOf(word, type).trim());
  if (!usable.length) return [];
  const count = Math.min(Math.max(1, length), usable.length);
  return shuffle(usable)
    .slice(0, count)
    .map((word) => buildQuestion(word, usable, type));
}
