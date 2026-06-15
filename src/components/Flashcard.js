'use client';
import { useState } from 'react';
import styles from '../app/page.module.css';

export default function Flashcard({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className={styles.flashcardContainer} onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`${styles.flashcard} ${isFlipped ? styles.flipped : ''}`}>
        <div className={styles.cardFace}>
          <div className={styles.word}>{card.english_word}</div>
          <div className={styles.hint}>Click to flip</div>
        </div>
        <div className={`${styles.cardFace} ${styles.cardBack}`}>
          <div className={styles.meaning}>{card.vietnamese_meaning}</div>
          {card.example_sentence && (
            <div className={styles.example}>"{card.example_sentence}"</div>
          )}
        </div>
      </div>
    </div>
  );
}
