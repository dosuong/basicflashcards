'use client';

import { useEffect, useState, useRef } from 'react';
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

  // Adjust index if filter changes
  useEffect(() => {
    if (currentIndex >= filteredFlashcards.length) {
      setCurrentIndex(Math.max(0, filteredFlashcards.length - 1));
    }
  }, [filter, filteredFlashcards.length, currentIndex]);

  const handleNext = () => {
    if (currentIndex < filteredFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

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
    <main className={styles.container}>
      <div className={styles.topBar}>
        <div></div>
        <Link href="/manage" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}>
          Manage Deck
        </Link>
      </div>

      <div className={styles.tabs} style={{ marginTop: '1rem' }}>
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

      {loading ? (
        <div className={styles.emptyState}>Loading flashcards...</div>
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
        </>
      ) : (
        <div className={styles.emptyState}>
          <p>No flashcards found in this category. {user && 'Add some to get started!'}</p>
        </div>
      )}

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
        <div className={styles.modalOverlay}>
          <div className={styles.addFormContainer}>
             <AddFlashcard onAdd={handleAdd} onCancel={() => setShowAddForm(false)} />
          </div>
        </div>
      )}
    </main>
  );
}
