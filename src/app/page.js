'use client';

import { useEffect, useState, useRef } from 'react';
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

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
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
      {loading ? (
        <div className={styles.emptyState}>Loading flashcards...</div>
      ) : flashcards.length > 0 ? (
        <>
          <div 
            onTouchStart={handleTouchStart} 
            onTouchMove={handleTouchMove} 
            onTouchEnd={handleTouchEnd}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <Flashcard key={flashcards[currentIndex].id} card={flashcards[currentIndex]} />
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
              {currentIndex + 1} / {flashcards.length}
            </span>
            <button 
              onClick={handleNext} 
              disabled={currentIndex === flashcards.length - 1}
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
          <p>No flashcards found. {user && 'Add some to get started!'}</p>
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
