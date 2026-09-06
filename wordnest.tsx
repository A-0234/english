import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Db, Rating, Settings, ViewId, Word, WordDraft } from './wordnest-types.js';
import { createWord, defaultDb, loadDb, parseBackup, saveDb } from './wordnest-store.js';
import { nextInterval } from './wordnest-utils.js';
import { DashboardView } from './dashboard-view.js';
import { LibraryView } from './library-view.js';
import { ReviewView } from './review-view.js';
import { QuizView } from './quiz-view.js';
import { SpeakingView } from './speaking-view.js';
import { StatsView } from './stats-view.js';
import { SettingsView } from './settings-view.js';
import { WordFormModal } from './word-form-modal.js';
import logo from './assets/logo.jpeg';
import styles from './wordnest.module.css';

const navItems: { id: ViewId; icon: string; label: string; subtitle: string }[] = [
  { id: 'dashboard', icon: '⌂', label: 'Dashboard', subtitle: 'Build your English, one word at a time.' },
  { id: 'library', icon: '▤', label: 'Library', subtitle: 'Manage and organize your vocabulary.' },
  { id: 'review', icon: '◈', label: 'Review', subtitle: 'Review due cards with spaced repetition.' },
  { id: 'quiz', icon: '?', label: 'Quiz', subtitle: 'Test yourself and strengthen recall.' },
  { id: 'speaking', icon: '🗣', label: 'Speaking', subtitle: 'Practice speaking and check your pronunciation.' },
  { id: 'stats', icon: '▥', label: 'Stats', subtitle: 'See how your learning is progressing.' },
  { id: 'settings', icon: '⚙', label: 'Settings', subtitle: 'Customize your learning experience.' },
];

/**
 * Convert a stored word back into editable form values.
 * @param word the word to edit.
 * @returns the matching draft.
 */
function toDraft(word: Word): WordDraft {
  return {
    word: word.word,
    definition: word.definition,
    example: word.example,
    category: word.category,
    part: word.part,
    difficulty: word.difficulty,
    synonyms: word.synonyms,
    notes: word.notes,
  };
}

/**
 * WordNest — an English vocabulary trainer with spaced repetition, quizzes and
 * speaking practice. Each word pairs an English term with its Chinese meaning.
 * @returns the rendered application.
 */
export function Wordnest() {
  const [db, setDb] = useState<Db>(() => loadDb());
  const [view, setView] = useState<ViewId>('dashboard');
  const [editing, setEditing] = useState<Word | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [queue, setQueue] = useState<Word[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  useEffect(() => {
    saveDb(db);
  }, [db]);

  useEffect(() => {
    document.documentElement.dataset.theme = db.settings.theme;
  }, [db.settings.theme]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((message: string) => setToast(message), []);

  const speak = useCallback(
    (word: Word) => {
      if (!('speechSynthesis' in window)) {
        notify('Text-to-speech is not supported here');
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.82;
      window.speechSynthesis.speak(utterance);
    },
    [notify]
  );

  const startReview = useCallback(() => {
    const due = db.words.filter((w) => w.due <= Date.now()).sort((a, b) => a.due - b.due);
    setQueue(due.length ? due : db.words.slice(0, 10));
    setQueueIndex(0);
    setView('review');
  }, [db.words]);

  const openAdd = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((word: Word) => {
    setEditing(word);
    setModalOpen(true);
  }, []);

  const saveWord = useCallback(
    (draft: WordDraft) => {
      setDb((prev) => {
        if (editing) {
          return {
            ...prev,
            words: prev.words.map((w) =>
              w.id === editing.id
                ? {
                    ...w,
                    word: draft.word.trim(),
                    definition: draft.definition.trim(),
                    example: draft.example.trim(),
                    category: draft.category.trim() || 'General',
                    part: draft.part,
                    difficulty: draft.difficulty,
                    synonyms: draft.synonyms.trim(),
                    notes: draft.notes.trim(),
                  }
                : w
            ),
          };
        }
        return { ...prev, words: [...prev.words, createWord(draft)] };
      });
      setModalOpen(false);
      setEditing(null);
      notify(editing ? 'Word updated' : 'Word added');
    },
    [editing, notify]
  );

  const deleteWord = useCallback(
    (word: Word) => {
      setDb((prev) => ({ ...prev, words: prev.words.filter((w) => w.id !== word.id) }));
      setQueue((prev) => prev.filter((w) => w.id !== word.id));
      notify('Word deleted');
    },
    [notify]
  );

  const toggleFavorite = useCallback((word: Word) => {
    setDb((prev) => ({
      ...prev,
      words: prev.words.map((w) => (w.id === word.id ? { ...w, favorite: !w.favorite } : w)),
    }));
  }, []);

  const rateCard = useCallback(
    (rating: Rating) => {
      const card = queue[queueIndex];
      if (!card) return;
      const interval = nextInterval(rating, card.interval);
      const reviews = card.reviews + 1;
      const level = rating === 0 ? 'Learning' : interval >= 7 ? 'Mastered' : reviews > 1 ? 'Learning' : 'New';
      setDb((prev) => ({
        ...prev,
        words: prev.words.map((w) =>
          w.id === card.id ? { ...w, interval, reviews, level, due: Date.now() + interval * 86400000 } : w
        ),
        reviews: [...prev.reviews, { date: Date.now(), rating, id: card.id }],
      }));
      setQueueIndex((i) => i + 1);
    },
    [queue, queueIndex]
  );

  const recordQuiz = useCallback((correct: number, total: number) => {
    setDb((prev) => ({ ...prev, quizzes: [...prev.quizzes, { date: Date.now(), correct, total }] }));
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wordnest-backup.json';
    link.click();
    URL.revokeObjectURL(link.href);
    notify('Backup exported');
  }, [db, notify]);

  const importData = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const restored = parseBackup(JSON.parse(String(reader.result)));
          if (!restored) throw new Error('invalid');
          setDb(restored);
          notify('Backup imported');
        } catch {
          notify('That file is not a valid WordNest backup');
        }
      };
      reader.readAsText(file);
    },
    [notify]
  );

  const clearAll = useCallback(() => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Delete all vocabulary? This cannot be undone.')) return;
    setDb((prev) => ({ ...prev, words: [], reviews: [], quizzes: [] }));
    setQueue([]);
    notify('All vocabulary deleted');
  }, [notify]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setDb((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const toggleTheme = useCallback(() => {
    setDb((prev) => ({
      ...prev,
      settings: { ...prev.settings, theme: prev.settings.theme === 'dark' ? 'light' : 'dark' },
    }));
  }, []);

  const active = useMemo(() => navItems.find((item) => item.id === view) ?? navItems[0], [view]);

  const go = (id: ViewId) => {
    if (id === 'review') {
      startReview();
    } else {
      setView(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <img src={logo} alt="WordNest logo" className={styles.logoMark} /> WordNest
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? styles.active : undefined}
              onClick={() => go(item.id)}
            >
              <b>{item.icon}</b> {item.label}
            </button>
          ))}
        </nav>
        <div className={styles.sideBottom}>
          <button type="button" className={styles.themeBtn} onClick={toggleTheme}>
            {db.settings.theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.top}>
          <div className={styles.title}>
            <h1>{active.label}</h1>
            <p>{active.subtitle}</p>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={exportData}>
              Export
            </button>
            <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={openAdd}>
              ＋ Add word
            </button>
          </div>
        </div>

        {view === 'dashboard' && (
          <DashboardView
            db={db}
            onStartReview={startReview}
            onOpenLibrary={() => setView('library')}
            onAddWord={openAdd}
            onSpeak={speak}
          />
        )}
        {view === 'library' && (
          <LibraryView
            words={db.words}
            onSpeak={speak}
            onToggleFavorite={toggleFavorite}
            onEdit={openEdit}
            onDelete={deleteWord}
            onAdd={openAdd}
            onImport={importData}
            onClearAll={clearAll}
          />
        )}
        {view === 'review' && (
          <ReviewView queue={queue} index={queueIndex} onRate={rateCard} onAddWord={openAdd} />
        )}
        {view === 'quiz' && (
          <QuizView
            words={db.words}
            length={db.settings.quizLength}
            type={db.settings.quizType}
            onFinish={recordQuiz}
            onAddWord={openAdd}
          />
        )}
        {view === 'speaking' && <SpeakingView words={db.words} onSpeak={speak} onAddWord={openAdd} />}
        {view === 'stats' && <StatsView db={db} />}
        {view === 'settings' && (
          <SettingsView
            settings={db.settings}
            onChange={updateSettings}
            onToggleTheme={toggleTheme}
            onExport={exportData}
            onImport={importData}
            onClearAll={clearAll}
          />
        )}
      </main>

      <nav className={styles.mobileNav}>
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            type="button"
            className={view === item.id ? styles.active : undefined}
            onClick={() => go(item.id)}
          >
            <b>{item.icon}</b>
            {item.label}
          </button>
        ))}
      </nav>

      {modalOpen && (
        <WordFormModal
          initial={editing ? toDraft(editing) : undefined}
          editing={!!editing}
          onSave={saveWord}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

export { defaultDb };
