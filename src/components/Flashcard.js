'use client';
import { useState, useEffect } from 'react';
import styles from '../app/page.module.css';

export default function Flashcard({ card, onToggleLearned, slideDirection }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [justLearned, setJustLearned] = useState(false);

  // Reset flip when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card.id]);

  // Keyboard: Space to flip
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === ' ') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const colors = [
    'linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(244, 63, 94, 0.12))',
    'linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(56, 189, 248, 0.12))',
    'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(52, 211, 153, 0.12))',
    'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(167, 139, 250, 0.12))',
    'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(251, 191, 36, 0.12))',
    'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(129, 140, 248, 0.12))',
  ];

  const getCardColor = (word) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = word.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const cardStyle = { background: getCardColor(card.english_word || '') };

  const handleToggleLearned = (e) => {
    e.stopPropagation();
    if (!card.is_learned) {
      setJustLearned(true);
      setTimeout(() => setJustLearned(false), 600);
    }
    if (onToggleLearned) onToggleLearned(card);
  };

  const slideClass = slideDirection === 'left' ? styles.slideLeft : 
                     slideDirection === 'right' ? styles.slideRight : '';

  return (
    <div className={`${styles.flashcardContainer} ${slideClass}`} onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`${styles.flashcard} ${isFlipped ? styles.flipped : ''}`}>
        <div className={styles.cardFace} style={cardStyle}>
          <button 
            className={`${styles.starBtn} ${card.is_learned ? styles.learned : ''} ${justLearned ? styles.justLearned : ''}`}
            onClick={handleToggleLearned}
            title={card.is_learned ? "Mark as Not Learned" : "Mark as Learned"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={card.is_learned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
          <div className={styles.cardContent}>
            <div className={styles.word}>{card.english_word}</div>
          </div>
          <div className={styles.hint}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
            Tap to flip
          </div>
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
