'use client';
import { useState } from 'react';
import styles from '../app/page.module.css';

export default function Flashcard({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const colors = [
    'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(244, 63, 94, 0.15))',
    'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(56, 189, 248, 0.15))',
    'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.15))',
    'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(167, 139, 250, 0.15))',
    'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.15))',
  ];

  const getCardColor = (word) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = word.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const cardStyle = { background: getCardColor(card.english_word || '') };

  return (
    <div className={styles.flashcardContainer} onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`${styles.flashcard} ${isFlipped ? styles.flipped : ''}`}>
        <div className={styles.cardFace} style={cardStyle}>
          {card.is_learned && (
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }} className={`${styles.badge} ${styles.badgeLearned}`}>
              Learned
            </div>
          )}
          <div className={styles.cardContent}>
            <div className={styles.word}>{card.english_word}</div>
          </div>
          <div className={styles.hint}>Click to flip</div>
        </div>
        <div className={`${styles.cardFace} ${styles.cardBack}`} style={cardStyle}>
          <div className={styles.cardContent}>
            <div className={styles.meaning}>{card.vietnamese_meaning}</div>
            {card.example_sentence && (
              <div className={styles.example}>{card.example_sentence}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
