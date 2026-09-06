import { useCallback, useEffect, useState } from 'react';
import type { QuizQuestion, QuizType, Word } from './wordnest-types.js';
import { buildQuiz } from './wordnest-quiz.js';
import styles from './wordnest.module.css';

export type QuizViewProps = {
  /** All words available for quizzing. */
  words: Word[];
  /** Number of questions per quiz. */
  length: number;
  /** Direction of the quiz. */
  type: QuizType;
  /** Called once when a quiz finishes. */
  onFinish: (correct: number, total: number) => void;
  /** Open the add-word dialog. */
  onAddWord: () => void;
};

/**
 * Multiple-choice quiz. The correct answer is always among the options and a
 * question is only shown once both of its sides have content.
 * @param props the quiz configuration and callbacks.
 * @returns the rendered quiz screen.
 */
export function QuizView({ words, length, type, onFinish, onAddWord }: QuizViewProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const start = useCallback(() => {
    setQuestions(buildQuiz(words, type, length));
    setIndex(0);
    setCorrect(0);
    setPicked(null);
    setDone(false);
  }, [words, type, length]);

  useEffect(() => {
    start();
  }, [start]);

  const current = questions[index];

  const choose = (option: string) => {
    if (picked !== null || !current) return;
    setPicked(option);
    const isRight = option === current.answer;
    const nextCorrect = isRight ? correct + 1 : correct;
    if (isRight) setCorrect(nextCorrect);
    window.setTimeout(() => {
      if (index + 1 >= questions.length) {
        setDone(true);
        onFinish(nextCorrect, questions.length);
      } else {
        setIndex(index + 1);
        setPicked(null);
      }
    }, 850);
  };

  if (!questions.length) {
    return (
      <section className={`${styles.quiz} ${styles.card}`}>
        <div className={styles.score}>
          <div className={styles.scoreNum}>0</div>
          <h2>Not enough words yet</h2>
          <p className={styles.muted}>
            {type === 'word'
              ? 'Add words with a Chinese meaning to quiz 中文 → English.'
              : 'Add a word with its Chinese meaning to start a quiz.'}
          </p>
          <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={onAddWord}>
            Add word
          </button>
        </div>
      </section>
    );
  }

  if (done) {
    const total = questions.length;
    return (
      <section className={`${styles.quiz} ${styles.card}`}>
        <div className={styles.score}>
          <div className={styles.scoreNum}>{Math.round((correct / total) * 100)}%</div>
          <h2>Quiz complete</h2>
          <p className={styles.muted}>
            {correct} of {total} correct
          </p>
          <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={start}>
            Try again
          </button>
        </div>
      </section>
    );
  }

  if (!current) return null;

  return (
    <section className={`${styles.quiz} ${styles.card}`}>
      <div className={styles.quizMeta}>
        <span>
          Question {index + 1} / {questions.length}
        </span>
        <span>Score {correct}</span>
      </div>
      <div className={styles.progress}>
        <i style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>
      <div className={styles.quizBody}>
        <div className={`${styles.muted} ${styles.small}`}>
          {type === 'word' ? 'What English word matches this meaning?' : 'What is the Chinese meaning of this word?'}
        </div>
        <div className={styles.quizQuestion}>{current.prompt}</div>
        <div className={styles.options}>
          {current.options.map((option) => {
            const revealed = picked !== null;
            const isAnswer = option === current.answer;
            const state = revealed && isAnswer ? styles.correct : revealed && option === picked ? styles.wrong : '';
            return (
              <button
                key={option}
                type="button"
                className={`${styles.option} ${state}`}
                disabled={revealed}
                onClick={() => choose(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
        <p className={`${styles.muted} ${styles.quizFeedback}`}>
          {picked === null ? '' : picked === current.answer ? 'Correct!' : `The answer was: ${current.answer}`}
        </p>
      </div>
    </section>
  );
}
