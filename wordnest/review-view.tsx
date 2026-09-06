import { useEffect, useState } from 'react';
import type { Rating, Word } from './wordnest-types.js';
import styles from './wordnest.module.css';

export type ReviewViewProps = {
  /** The queue of cards due for review. */
  queue: Word[];
  /** Index of the card being shown. */
  index: number;
  /** Called when a card is rated. */
  onRate: (rating: Rating) => void;
  /** Open the add-word dialog. */
  onAddWord: () => void;
};

/**
 * Flashcard review screen driven by spaced repetition.
 * Space flips the card, keys 1/2/3 rate it.
 * @param props the review queue and callbacks.
 * @returns the rendered review screen.
 */
export function ReviewView({ queue, index, onRate, onAddWord }: ReviewViewProps) {
  const [flipped, setFlipped] = useState(false);
  const card = queue[index];

  useEffect(() => {
    setFlipped(false);
  }, [index, card?.id]);

  useEffect(() => {
    if (!card) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        setFlipped((f) => !f);
      }
      if (event.key === '1') onRate(0);
      if (event.key === '2') onRate(1);
      if (event.key === '3') onRate(2);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [card, onRate]);

  if (!card) {
    return (
      <section className={styles.flashWrap}>
        <div className={styles.card}>
          <div className={styles.empty}>
            <h2>All caught up 🎉</h2>
            <p>No cards are due right now. Come back later or add more vocabulary.</p>
            <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={onAddWord}>
              ＋ Add word
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.flashWrap}>
      <div className={styles.quizMeta}>
        <span>{queue.length - index} due</span>
        <span>
          Card <b>{index + 1}</b> / {queue.length}
        </span>
      </div>
      <div
        className={`${styles.flash} ${flipped ? styles.flipped : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Flip card"
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setFlipped((f) => !f);
        }}
      >
        <div className={styles.flashInner}>
          <div className={styles.face}>
            <span className={styles.pill}>{card.category || 'Vocabulary'}</span>
            <div className={styles.flashWord}>{card.word}</div>
            <p className={styles.muted}>Tap to reveal</p>
          </div>
          <div className={`${styles.face} ${styles.back}`}>
            <span className={styles.pill}>{card.part || 'Meaning'}</span>
            <div className={styles.flashDefinition}>{card.definition}</div>
            {card.example && <p className={styles.flashExample}>{card.example}</p>}
          </div>
        </div>
      </div>
      <div className={styles.reviewButtons}>
        <button type="button" className={styles.hard} onClick={() => onRate(0)}>
          Hard
        </button>
        <button type="button" className={styles.okay} onClick={() => onRate(1)}>
          Good
        </button>
        <button type="button" className={styles.easy} onClick={() => onRate(2)}>
          Easy
        </button>
      </div>
    </section>
  );
}
