import type { Db, Word } from './wordnest-types.js';
import { buildHeatmap, calcStreak } from './wordnest-utils.js';
import { WordRow } from './word-row.js';
import styles from './wordnest.module.css';

export type DashboardViewProps = {
  /** The current database. */
  db: Db;
  /** Start a review session. */
  onStartReview: () => void;
  /** Open the library view. */
  onOpenLibrary: () => void;
  /** Open the add-word dialog. */
  onAddWord: () => void;
  /** Speak a word aloud. */
  onSpeak: (word: Word) => void;
};

/**
 * Overview screen with progress stats, streak heatmap and recent words.
 * @param props the dashboard data and callbacks.
 * @returns the rendered dashboard.
 */
export function DashboardView({ db, onStartReview, onOpenLibrary, onAddWord, onSpeak }: DashboardViewProps) {
  const total = db.words.length;
  const mastered = db.words.filter((w) => w.level === 'Mastered').length;
  const due = db.words.filter((w) => w.due <= Date.now()).length;
  const correct = db.quizzes.reduce((sum, q) => sum + q.correct, 0);
  const attempted = db.quizzes.reduce((sum, q) => sum + q.total, 0);
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : null;
  const pct = total ? Math.round((mastered / total) * 100) : 0;
  const recent = db.words.slice().sort((a, b) => b.created - a.created).slice(0, 5);
  const cells = buildHeatmap(db.reviews, 28);

  return (
    <section>
      <div className={`${styles.grid} ${styles.stats}`}>
        <div className={`${styles.card} ${styles.stat}`}>
          <span className={styles.muted}>Total words</span>
          <div className={styles.num}>{total}</div>
          <span className={styles.small}>in your library</span>
        </div>
        <div className={`${styles.card} ${styles.stat}`}>
          <span className={styles.muted}>Mastered</span>
          <div className={styles.num}>{mastered}</div>
          <span className={styles.small}>{pct}%</span>
        </div>
        <div className={`${styles.card} ${styles.stat}`}>
          <span className={styles.muted}>Due today</span>
          <div className={styles.num}>{due}</div>
          <span className={styles.small}>ready to review</span>
        </div>
        <div className={`${styles.card} ${styles.stat}`}>
          <span className={styles.muted}>Accuracy</span>
          <div className={styles.num}>{accuracy === null ? '—' : `${accuracy}%`}</div>
          <span className={styles.small}>from quizzes</span>
        </div>
      </div>

      <div className={`${styles.grid} ${styles.homegrid}`}>
        <div className={`${styles.card} ${styles.hero}`}>
          <h2>Ready for a quick review?</h2>
          <p>
            {total
              ? `${due} card${due === 1 ? ' is' : 's are'} ready. Keep your streak going!`
              : 'Add some vocabulary to begin.'}
          </p>
          <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={onStartReview}>
            Start review →
          </button>
        </div>
        <div className={styles.card}>
          <h3>Your progress</h3>
          <div className={styles.progress}>
            <i style={{ width: `${pct}%` }} />
          </div>
          <p className={`${styles.muted} ${styles.small}`}>
            {mastered} mastered of {total} words
          </p>
          <div className={styles.sectionHead}>
            <h2>Streak</h2>
            <span className={styles.pill}>{calcStreak(db.reviews)} days</span>
          </div>
          <div className={styles.heatmap}>
            {cells.map((cell) => (
              <div
                key={cell.label}
                className={`${styles.heat} ${cell.count >= 5 ? styles.high : cell.count ? styles.on : ''}`}
                title={`${cell.label}: ${cell.count} reviews`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.sectionHead}>
        <h2>Recently added</h2>
        <button type="button" className={styles.btn} onClick={onOpenLibrary}>
          View library
        </button>
      </div>
      <div className={styles.wordList}>
        {recent.length ? (
          recent.map((word) => <WordRow key={word.id} word={word} onSpeak={onSpeak} />)
        ) : (
          <div className={styles.empty}>
            <p>No words yet. Add your first word!</p>
            <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={onAddWord}>
              ＋ Add word
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
