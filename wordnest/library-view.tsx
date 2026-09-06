import { useMemo, useRef, useState } from 'react';
import type { Word } from './wordnest-types.js';
import { WordRow } from './word-row.js';
import styles from './wordnest.module.css';

export type LibraryViewProps = {
  /** All words in the library. */
  words: Word[];
  /** Speak a word aloud. */
  onSpeak: (word: Word) => void;
  /** Toggle the favorite star. */
  onToggleFavorite: (word: Word) => void;
  /** Open the edit dialog. */
  onEdit: (word: Word) => void;
  /** Delete a word. */
  onDelete: (word: Word) => void;
  /** Open the add dialog. */
  onAdd: () => void;
  /** Import a backup file. */
  onImport: (file: File) => void;
  /** Remove every word. */
  onClearAll: () => void;
};

/**
 * Searchable, filterable list of every word the learner has saved.
 * @param props the library data and callbacks.
 * @returns the rendered library screen.
 */
export function LibraryView({
  words,
  onSpeak,
  onToggleFavorite,
  onEdit,
  onDelete,
  onAdd,
  onImport,
  onClearAll,
}: LibraryViewProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(
    () => Array.from(new Set(words.map((w) => w.category).filter(Boolean))).sort(),
    [words]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return words.filter((w) => {
      const matchesQuery =
        !q ||
        [w.word, w.definition, w.example, w.synonyms, w.notes].some((field) =>
          (field || '').toLowerCase().includes(q)
        );
      return matchesQuery && (!category || w.category === category) && (!level || w.level === level);
    });
  }, [words, query, category, level]);

  return (
    <section>
      <div className={styles.toolbar}>
        <input
          className={`${styles.input} ${styles.search}`}
          placeholder="Search words, meanings, examples..."
          aria-label="Search vocabulary"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className={`${styles.select} ${styles.filterSelect}`}
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className={`${styles.select} ${styles.levelSelect}`}
          aria-label="Filter by level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="">All levels</option>
          <option>New</option>
          <option>Learning</option>
          <option>Mastered</option>
        </select>
        <button type="button" className={styles.btn} onClick={onAdd}>
          ＋ Add
        </button>
      </div>

      <div className={styles.sectionHead}>
        <h2>
          {filtered.length} word{filtered.length === 1 ? '' : 's'}
        </h2>
        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={() => fileRef.current?.click()}>
            Import
          </button>
          <button type="button" className={`${styles.btn} ${styles.danger}`} onClick={onClearAll}>
            Clear all
          </button>
        </div>
      </div>

      <div className={styles.wordList}>
        {filtered.length ? (
          filtered.map((word) => (
            <WordRow
              key={word.id}
              word={word}
              onSpeak={onSpeak}
              onToggleFavorite={onToggleFavorite}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className={styles.empty}>No words match your filters.</div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onImport(file);
          event.target.value = '';
        }}
      />
    </section>
  );
}
