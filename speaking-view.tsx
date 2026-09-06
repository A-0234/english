import { useEffect, useRef, useState } from 'react';
import type { Word } from './wordnest-types.js';
import { similarity } from './wordnest-utils.js';
import styles from './wordnest.module.css';

export type SpeakingViewProps = {
  /** Words available for speaking practice. */
  words: Word[];
  /** Speak a word aloud with text-to-speech. */
  onSpeak: (word: Word) => void;
  /** Open the add-word dialog. */
  onAddWord: () => void;
};

type RecognitionResult = { transcript: string };
type RecognitionEvent = { results: RecognitionResult[][] };
type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
};
type RecognitionCtor = new () => Recognition;

/**
 * Read the browser's speech recognition constructor when available.
 * @returns the constructor, or undefined when unsupported.
 */
function getRecognition(): RecognitionCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
}

/**
 * Speaking practice screen — hear the word, say it back, get a match score.
 * @param props the practice words and callbacks.
 * @returns the rendered speaking screen.
 */
export function SpeakingView({ words, onSpeak, onAddWord }: SpeakingViewProps) {
  const [index, setIndex] = useState(0);
  const [heard, setHeard] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const supported = useRef(!!getRecognition());
  const current = words[Math.min(index, Math.max(0, words.length - 1))];

  useEffect(() => {
    setHeard('');
    setScore(null);
    setError('');
  }, [current?.id]);

  if (!current) {
    return (
      <section className={`${styles.card} ${styles.speakingCard}`}>
        <div className={styles.empty}>
          <h2>🗣️ Speaking practice</h2>
          <p>Add a word first, then practice saying it out loud.</p>
          <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={onAddWord}>
            ＋ Add word
          </button>
        </div>
      </section>
    );
  }

  const listen = () => {
    const Ctor = getRecognition();
    if (!Ctor) {
      setError('Speech recognition is not supported by this browser.');
      return;
    }
    const recognition = new Ctor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    setError('');
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setHeard(transcript);
      setScore(similarity(transcript, current.word));
    };
    recognition.onerror = () => {
      setError('Could not understand the recording. Try again in a quiet place.');
      setScore(null);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const move = (dir: number) => setIndex((i) => (i + dir + words.length) % words.length);
  const pct = score === null ? null : Math.round(score * 100);
  const tone = score === null ? '' : score >= 0.9 ? styles.good : score >= 0.65 ? styles.warn : styles.bad;
  const verdict = score === null ? '' : score >= 0.9 ? 'Excellent!' : score >= 0.65 ? 'Pretty close!' : 'Try again.';

  return (
    <section className={`${styles.card} ${styles.speakingCard}`}>
      <div className={styles.sectionHead}>
        <h2>🗣️ Speaking practice</h2>
        <span className={styles.pill}>{supported.current ? 'Microphone ready' : 'Recognition unavailable'}</span>
      </div>
      <p className={styles.muted}>
        Listen to the word, then say it yourself. Your browser compares what it hears with the target word.
      </p>

      <div className={styles.speakingStage}>
        <div className={styles.pill}>{current.category || 'Vocabulary'}</div>
        <div className={styles.speakTarget}>{current.word}</div>
        <div className={`${styles.muted} ${styles.speakZh}`}>{current.definition}</div>
        <div className={styles.actions} style={{ justifyContent: 'center', marginTop: 18 }}>
          <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => onSpeak(current)}>
            🔊 Listen
          </button>
          <button type="button" className={styles.btn} onClick={listen} disabled={listening}>
            {listening ? '🎙️ Listening…' : '🎙️ I speak'}
          </button>
        </div>
      </div>

      <div className={styles.heardBox}>
        <div className={`${styles.muted} ${styles.small}`}>What the browser heard</div>
        <div className={styles.heardText}>{heard || '—'}</div>
        <div className={`${styles.pronResult} ${tone}`}>
          {error || (pct === null ? '' : `${verdict} ${pct}% match`)}
        </div>
      </div>

      <div className={styles.sectionHead}>
        <h3>Pronunciation tips</h3>
      </div>
      <ul className={styles.muted}>
        <li>Use a quiet place and speak clearly at a normal speed.</li>
        <li>Browser speech recognition is an approximation, not a professional pronunciation score.</li>
        <li>If recognition is unavailable, you can still use Listen to hear the target.</li>
      </ul>

      <div className={styles.speakingFoot}>
        <button type="button" className={styles.btn} onClick={() => move(-1)}>
          ← Previous
        </button>
        <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => move(1)}>
          Next →
        </button>
      </div>
    </section>
  );
}
