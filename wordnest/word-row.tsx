import type { Word } from './wordnest-types.js';
import styles from './wordnest.module.css';

export type WordRowProps = {
  /** The word to display. */
  word: Word;
  /** Called when the learner wants to hear the word. */
  onSpeak: (word: Word) => void;
  /** Called when the star is toggled. */
  onToggleFavorite?: (word: Word) => void;
  /** Called when the edit action is used. */
  onEdit?: (word: Word) => void;
  /** Called when the delete action is used. */
  onDelete?: (word: Word) => void;
};

/**
 * A single row in the vocabulary list, showing the English word with its
 * Chinese meaning and quick actions.
 * @param props the row configuration.
 * @returns the rendered row.
 */
export function WordRow({ word, onSpeak, onToggleFavorite, onEdit, onDelete }: WordRowProps) {
  return (
    <div className={styles.wordRow}>
      <button
        type="button"
        className={styles.icon}
        title="Listen"
        aria-label={`Listen to ${word.word}`}
        onClick={() => onSpeak(word)}
      >
        🔊
      </button>
      <div className={styles.wordMain}>
        <div className={styles.word}>{word.word}</div>
        <div className={styles.meaning}>{word.definition || '—'}</div>
      </div>
      <span className={styles.pill}>{word.level}</span>
      <div className={styles.rowActions}>
        {onToggleFavorite && (
          <button
            type="button"
            className={`${styles.icon} ${word.favorite ? styles.fav : ''}`}
            title="Favorite"
            aria-label={`Favorite ${word.word}`}
            onClick={() => onToggleFavorite(word)}
          >
            {word.favorite ? '★' : '☆'}
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            className={styles.icon}
            title="Edit"
            aria-label={`Edit ${word.word}`}
            onClick={() => onEdit(word)}
          >
            ✎
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className={styles.icon}
            title="Delete"
            aria-label={`Delete ${word.word}`}
            onClick={() => onDelete(word)}
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}
