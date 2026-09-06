import { useRef } from 'react';
import type { Settings } from './wordnest-types.js';
import styles from './wordnest.module.css';

export type SettingsViewProps = {
  /** Current preferences. */
  settings: Settings;
  /** Apply a preference change. */
  onChange: (patch: Partial<Settings>) => void;
  /** Toggle light/dark theme. */
  onToggleTheme: () => void;
  /** Download a JSON backup. */
  onExport: () => void;
  /** Import a JSON backup. */
  onImport: (file: File) => void;
  /** Delete all vocabulary. */
  onClearAll: () => void;
};

/**
 * Preferences and data management screen.
 * @param props the settings and callbacks.
 * @returns the rendered settings screen.
 */
export function SettingsView({ settings, onChange, onToggleTheme, onExport, onImport, onClearAll }: SettingsViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <section className={styles.card}>
      <h2>Settings</h2>

      <div className={styles.sectionHead}>
        <h3>Quiz length</h3>
        <select
          className={`${styles.select} ${styles.settingSelect}`}
          aria-label="Quiz length"
          value={settings.quizLength}
          onChange={(e) => onChange({ quizLength: Number(e.target.value) })}
        >
          {[5, 10, 15, 20].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.sectionHead}>
        <h3>Default quiz type</h3>
        <select
          className={`${styles.select} ${styles.settingSelect}`}
          aria-label="Quiz type"
          value={settings.quizType}
          onChange={(e) => onChange({ quizType: e.target.value as Settings['quizType'] })}
        >
          <option value="meaning">English → 中文</option>
          <option value="word">中文 → English</option>
        </select>
      </div>

      <div className={styles.sectionHead}>
        <h3>Theme</h3>
        <button type="button" className={styles.btn} onClick={onToggleTheme}>
          Toggle theme
        </button>
      </div>

      <hr className={styles.divider} />

      <h3>Data</h3>
      <p className={styles.muted}>Your vocabulary is stored only in this browser using localStorage.</p>
      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={onExport}>
          Export backup
        </button>
        <button type="button" className={styles.btn} onClick={() => fileRef.current?.click()}>
          Import backup
        </button>
        <button type="button" className={`${styles.btn} ${styles.danger}`} onClick={onClearAll}>
          Delete all vocabulary
        </button>
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
