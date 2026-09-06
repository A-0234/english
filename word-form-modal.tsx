import { useEffect, useState } from 'react';
import type { WordDraft } from './wordnest-types.js';
import { emptyDraft } from './wordnest-store.js';
import styles from './wordnest.module.css';

export type WordFormModalProps = {
  /** Values to prefill, or undefined when adding a new word. */
  initial?: WordDraft;
  /** True when editing an existing word. */
  editing: boolean;
  /** Called with the submitted draft. */
  onSave: (draft: WordDraft) => void;
  /** Called when the dialog is dismissed. */
  onClose: () => void;
};

const parts = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Phrase', 'Other'];
const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

/**
 * Modal form for adding or editing a vocabulary word. The definition field
 * holds the Chinese meaning of the English word.
 * @param props the dialog configuration.
 * @returns the rendered modal.
 */
export function WordFormModal({ initial, editing, onSave, onClose }: WordFormModalProps) {
  const [draft, setDraft] = useState<WordDraft>(initial ?? emptyDraft);

  useEffect(() => {
    setDraft(initial ?? emptyDraft);
  }, [initial]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (key: keyof WordDraft) => (value: string) => setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div
      className={styles.modal}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.modalBox} role="dialog" aria-modal="true" aria-label={editing ? 'Edit word' : 'Add word'}>
        <div className={styles.modalHead}>
          <h2>{editing ? 'Edit word' : 'Add word'}</h2>
          <button type="button" className={styles.icon} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.word.trim() || !draft.definition.trim()) return;
            onSave(draft);
          }}
        >
          <div className={styles.formgrid}>
            <div className={styles.field}>
              <label htmlFor="fWord">English word *</label>
              <input
                id="fWord"
                className={styles.input}
                required
                placeholder="e.g. curious"
                value={draft.word}
                onChange={(e) => set('word')(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="fDef">中文意思 / Chinese meaning *</label>
              <input
                id="fDef"
                className={styles.input}
                required
                placeholder="例如：好奇的"
                value={draft.definition}
                onChange={(e) => set('definition')(e.target.value)}
              />
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label htmlFor="fEx">Example sentence</label>
              <textarea
                id="fEx"
                className={styles.textarea}
                rows={3}
                placeholder="She was curious about the strange sound."
                value={draft.example}
                onChange={(e) => set('example')(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="fCat">Category</label>
              <input
                id="fCat"
                className={styles.input}
                placeholder="General, verbs, school..."
                value={draft.category}
                onChange={(e) => set('category')(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="fPart">Part of speech</label>
              <select
                id="fPart"
                className={styles.select}
                value={draft.part}
                onChange={(e) => set('part')(e.target.value)}
              >
                {parts.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="fDiff">Difficulty</label>
              <select
                id="fDiff"
                className={styles.select}
                value={draft.difficulty}
                onChange={(e) => set('difficulty')(e.target.value)}
              >
                {difficulties.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="fSyn">Synonyms</label>
              <input
                id="fSyn"
                className={styles.input}
                placeholder="eager, inquisitive"
                value={draft.synonyms}
                onChange={(e) => set('synonyms')(e.target.value)}
              />
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label htmlFor="fNotes">Notes</label>
              <textarea
                id="fNotes"
                className={styles.textarea}
                rows={2}
                value={draft.notes}
                onChange={(e) => set('notes')(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.modalFoot}>
            <button type="button" className={styles.btn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={`${styles.btn} ${styles.primary}`}>
              Save word
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
