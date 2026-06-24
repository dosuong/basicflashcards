'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import Flashcard from '../components/Flashcard';
import AddFlashcard from '../components/AddFlashcard';
import styles from './page.module.css';

export default function Home() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('unlearned');
  const [slideDirection, setSlideDirection] = useState(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    fetchFlashcards();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchFlashcards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching flashcards:', error);
    } else {
      setFlashcards(data || []);
    }
    setLoading(false);
  };

  const filteredFlashcards = flashcards.filter(card => {
    if (filter === 'learned') return card.is_learned;
    if (filter === 'unlearned') return !card.is_learned;
    return true;
  });

  // Compute stats
  const learnedCount = flashcards.filter(c => c.is_learned).length;
  const unlearnedCount = flashcards.filter(c => !c.is_learned).length;
  const totalCount = flashcards.length;

  // Adjust index if filter changes
  useEffect(() => {
    if (currentIndex >= filteredFlashcards.length) {
      setCurrentIndex(Math.max(0, filteredFlashcards.length - 1));
    }
  }, [filter, filteredFlashcards.length, currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredFlashcards.length - 1) {
      setSlideDirection('left');
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, filteredFlashcards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setSlideDirection('right');
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger when typing in inputs/textareas
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'Escape':
          if (showAddForm) {
            setShowAddForm(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, showAddForm]);

  // Clear slide direction after animation
  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => setSlideDirection(null), 400);
      return () => clearTimeout(timer);
    }
  }, [slideDirection, currentIndex]);

  const handleAdd = (newCard) => {
    setFlashcards([newCard, ...flashcards]);
    setShowAddForm(false);
    setCurrentIndex(0);
  };

  const toggleLearnedStatus = async (card) => {
    const targetCard = card || filteredFlashcards[currentIndex];
    if (!targetCard) return;

    const newStatus = !targetCard.is_learned;
    
    // Optimistic update
    setFlashcards(flashcards.map(c => c.id === targetCard.id ? { ...c, is_learned: newStatus } : c));
    
    // Auto-advance logic for Unlearned tab
    if (filter === 'unlearned' && newStatus === true) {
      setTimeout(() => {
        if (currentIndex >= filteredFlashcards.length - 1 && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      }, 300);
    } else {
      if (currentIndex >= filteredFlashcards.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }

    await supabase
      .from('flashcards')
      .update({ is_learned: newStatus })
      .eq('id', targetCard.id);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swipe Left -> Next
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swipe Right -> Prev
      handlePrev();
    }
    
    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <main className={styles.mainLayout}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Basic Flashcards</h1>
        </div>
        <div className={styles.headerRight}>
          <Link href="/manage" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}>
            Manage Deck
          </Link>
        </div>
      </header>

      <div className={styles.contentWrapper}>
        <div className={styles.dashboardControls}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${filter === 'unlearned' ? styles.active : ''}`}
              onClick={() => setFilter('unlearned')}
            >
              Not Learned
            </button>
            <button 
              className={`${styles.tab} ${filter === 'learned' ? styles.active : ''}`}
              onClick={() => setFilter('learned')}
            >
              Learned
            </button>
            <button 
              className={`${styles.tab} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              All Cards
            </button>
          </div>

          {/* Progress Stats */}
          {!loading && totalCount > 0 && (
            <div className={styles.progressStats}>
              <div className={styles.statItem}>
                <span className={`${styles.statDot} ${styles.statDotLearned}`}></span>
                Learned: <span className={styles.statValue}>{learnedCount}</span>
              </div>
              <div className={styles.statItem}>
                <span className={`${styles.statDot} ${styles.statDotUnlearned}`}></span>
                Remaining: <span className={styles.statValue}>{unlearnedCount}</span>
              </div>
              <div className={styles.statItem}>
                <span className={`${styles.statDot} ${styles.statDotTotal}`}></span>
                Total: <span className={styles.statValue}>{totalCount}</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.cardArea}>
          {loading ? (
            /* Skeleton Loading */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div className={styles.skeletonCard}></div>
              <div className={styles.skeletonControls}>
                <div className={styles.skeletonBtn}></div>
                <div className={styles.skeletonCounter}></div>
                <div className={styles.skeletonBtn}></div>
              </div>
            </div>
          ) : filteredFlashcards.length > 0 ? (
            <>
              <div 
                onTouchStart={handleTouchStart} 
                onTouchMove={handleTouchMove} 
                onTouchEnd={handleTouchEnd}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <Flashcard 
                  key={filteredFlashcards[currentIndex].id} 
                  card={filteredFlashcards[currentIndex]} 
                  onToggleLearned={toggleLearnedStatus}
                  slideDirection={slideDirection}
                />
              </div>
              
              <div className={styles.controls}>
                <button 
                  onClick={handlePrev} 
                  disabled={currentIndex === 0}
                  className={styles.iconBtn}
                  aria-label="Previous card"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <span className={styles.counter}>
                  {currentIndex + 1} / {filteredFlashcards.length}
                </span>
                <button 
                  onClick={handleNext} 
                  disabled={currentIndex === filteredFlashcards.length - 1}
                  className={styles.iconBtn}
                  aria-label="Next card"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>

              {/* Keyboard hints - desktop only */}
              <div className={styles.keyboardHint}>
                <span><kbd className={styles.kbdKey}>←</kbd> <kbd className={styles.kbdKey}>→</kbd> navigate</span>
                <span><kbd className={styles.kbdKey}>Space</kbd> flip</span>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <div className={styles.emptyTitle}>No flashcards found</div>
              <p className={styles.emptyText}>
                {user ? 'Add some words to get started!' : 'Check back later for new cards.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {user && (
        <button 
          onClick={() => setShowAddForm(true)}
          className={styles.floatingAddBtn}
          title="Add New Word"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      )}

      {user && showAddForm && (
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setShowAddForm(false); }}>
          <div className={styles.addFormContainer}>
             <AddFlashcard onAdd={handleAdd} onCancel={() => setShowAddForm(false)} />
          </div>
        </div>
      )}
    </main>
  );
}
