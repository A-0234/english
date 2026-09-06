import { render, screen, fireEvent } from '@testing-library/react';
import { buildQuestion, buildQuiz } from './wordnest-quiz.js';
import { createWord, parseBackup } from './wordnest-store.js';
import { nextInterval } from './wordnest-utils.js';
import { QuizView } from './quiz-view.js';
import type { Word } from './wordnest-types.js';

const make = (word: string, definition: string): Word =>
  createWord({
    word,
    definition,
    example: '',
    category: 'General',
    part: 'Noun',
    difficulty: 'Beginner',
    synonyms: '',
    notes: '',
  });

const words = [make('curious', '好奇的'), make('achieve', '实现'), make('reliable', '可靠的'), make('vivid', '生动的')];

describe('quiz generation', () => {
  it('always includes the correct answer among the options', () => {
    for (let i = 0; i < 50; i += 1) {
      const question = buildQuestion(words[0], words, 'meaning');
      expect(question.options).toContain(question.answer);
      expect(question.options.length).toBeLessThanOrEqual(4);
      expect(new Set(question.options).size).toBe(question.options.length);
    }
  });

  it('skips words that have no Chinese meaning', () => {
    const incomplete = [...words, make('blank', '')];
    const quiz = buildQuiz(incomplete, 'meaning', 10);
    expect(quiz.every((q) => q.answer.trim().length > 0)).toBe(true);
    expect(quiz).toHaveLength(4);
  });
});

describe('QuizView', () => {
  it('scores a correct answer and reveals feedback', () => {
    render(<QuizView words={words} length={1} type="meaning" onFinish={() => {}} onAddWord={() => {}} />);
    const prompt = screen.getByText(/What is the Chinese meaning/i);
    expect(prompt).toBeInTheDocument();
    const target = words.find((w) => screen.queryByText(w.word));
    fireEvent.click(screen.getByRole('button', { name: target!.definition }));
    expect(screen.getByText('Correct!')).toBeInTheDocument();
  });
});

describe('storage', () => {
  it('migrates legacy words so the definition holds the Chinese meaning', () => {
    const restored = parseBackup({ words: [{ word: 'curious', definition: 'wanting to know', mandarin: '好奇的' }] });
    expect(restored?.words[0].definition).toBe('好奇的');
  });
});

describe('spaced repetition', () => {
  it('shortens the interval on hard and grows it on easy', () => {
    expect(nextInterval(0, 8)).toBeLessThan(1);
    expect(nextInterval(2, 4)).toBeGreaterThan(4);
  });
});
