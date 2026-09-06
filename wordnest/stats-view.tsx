import type { Db, Level } from './wordnest-types.js';
import { buildHeatmap } from './wordnest-utils.js';
import styles from './wordnest.module.css';

export type StatsViewProps = {
  /** The current database. */
  db: Db;
};

const levels: Level[] = ['New', 'Learning', 'Mastered'];

/**
 * Progress statistics — totals, level breakdown and a 28 day activity heatmap.
 * @param props the stats data.
 * @returns the rendered stats screen.
 */
export function StatsView({ db }: StatsViewProps) {
  const attempts = db.quizzes.length;
  const correct = db.quizzes.reduce((sum, q) => sum + q.correct, 0);
  const best = attempts ? Math.max(...db.quizzes.map((q) => Math.round((q.correct / q.total) * 100))) : null;
  const max = Math.max(1, db.words.length);
  const cells = buildHeatmap(db.reviews, 28);

  return (
    <section>
      <div className={`${styles.grid} ${styles.stats}`}>
        <div className={`${styles.card} ${styles.stat}`}>
          <span className={styles.muted}>Reviews</span>
          <div className={styles.num}>{db.reviews.length}</div>
        </div>
        <div className={`${styles.card} ${styles.stat}`}>
          <span className={styles.muted}>Quiz attempts</span>
          <div className={styles.num}>{attempts}</div>
        </div>
        <div className={`${styles.card} ${styles.stat}`}>
          <span className={styles.muted}>Correct answers</span>
          <div className={styles.num}>{correct}</div>
        </div>
        <div className={`${styles.card} ${styles.stat}`}>
          <span className={styles.muted}>Best quiz</span>
          <div className={styles.num}>{best === null ? '—' : `${best}%`}</div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.cardBlock}`}>
        <h3>Library by level</h3>
        {levels.map((level) => {
          const count = db.words.filter((w) => w.level === level).length;
          return (
            <div key={level} className={styles.barRow}>
              <b>{level}</b>
              <div className={styles.progress}>
                <i style={{ width: `${(count / max) * 100}%` }} />
              </div>
              <span>{count}</span>
            </div>
          );
        })}
      </div>

      <div className={`${styles.card} ${styles.cardBlock}`}>
        <h3>Review activity</h3>
        <p className={`${styles.muted} ${styles.small}`}>Last 28 days</p>
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
    </section>
  );
}
