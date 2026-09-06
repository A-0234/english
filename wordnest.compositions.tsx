import { MemoryRouter } from 'react-router-dom';
import { Wordnest } from './wordnest.js';
import { WordFormModal } from './word-form-modal.js';
import { QuizView } from './quiz-view.js';
import { createWord } from './wordnest-store.js';

/** The full WordNest app with its seeded starter vocabulary. */
export const WordnestApp = () => (
  <MemoryRouter>
    <Wordnest />
  </MemoryRouter>
);

/** The add-word dialog, where the definition holds the Chinese meaning. */
export const AddWordDialog = () => (
  <WordFormModal editing={false} onSave={() => {}} onClose={() => {}} />
);

const quizWords = [
  { word: 'curious', definition: '好奇的' },
  { word: 'achieve', definition: '实现；达到' },
  { word: 'reliable', definition: '可靠的' },
  { word: 'vivid', definition: '生动的；鲜明的' },
].map((w) =>
  createWord({
    ...w,
    example: '',
    category: 'General',
    part: 'Adjective',
    difficulty: 'Beginner',
    synonyms: '',
    notes: '',
  })
);

/** A quiz asking for the Chinese meaning of an English word. */
export const QuizEnglishToChinese = () => (
  <QuizView words={quizWords} length={4} type="meaning" onFinish={() => {}} onAddWord={() => {}} />
);

/** A quiz asking for the English word behind a Chinese meaning. */
export const QuizChineseToEnglish = () => (
  <QuizView words={quizWords} length={4} type="word" onFinish={() => {}} onAddWord={() => {}} />
);
