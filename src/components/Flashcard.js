'use client';
import { useState } from 'react';
import styles from '../app/page.module.css';

export default function Flashcard({ card, onToggleLearned }) {
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
          <button 
            className={`${styles.starBtn} ${card.is_learned ? styles.learned : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleLearned) onToggleLearned(card);
            }}
            title={card.is_learned ? "Mark as Not Learned" : "Mark as Learned"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={card.is_learned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
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
