'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import AddFlashcard from '../../components/AddFlashcard';
import EditFlashcard from '../../components/EditFlashcard';
import styles from './page.module.css';

export default function ManageFlashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        fetchFlashcards();
      }
    };
    checkAuth();
  }, [router]);

  // Close modals on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (editingCard) setEditingCard(null);
        if (showAddForm) setShowAddForm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingCard, showAddForm]);

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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) return;
    
    setDeletingId(id);
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id);
      
    setDeletingId(null);
    
    if (error) {
      alert('Error deleting flashcard');
      console.error(error);
    } else {
      setFlashcards(flashcards.filter(card => card.id !== id));
    }
  };

  const handleUpdate = (updatedCard) => {
    setFlashcards(flashcards.map(card => card.id === updatedCard.id ? updatedCard : card));
    setEditingCard(null);
  };

  const handleAdd = (newCard) => {
    setFlashcards([newCard, ...flashcards]);
    setShowAddForm(false);
  };

  const filteredFlashcards = flashcards.filter(card => 
    card.english_word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.vietnamese_meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const learnedCount = flashcards.filter(c => c.is_learned).length;

  return (
    <main className={styles.manageContainer}>
      <div className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1>Manage Cards</h1>
            {!loading && (
              <span className={styles.cardCount}>
                {learnedCount}/{flashcards.length} learned
              </span>
            )}
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            + Add New Word
          </button>
        </div>
        <div className={styles.searchContainer} style={{ marginTop: '1rem' }}>
          <input
            type="text"
            placeholder="Search flashcards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {showAddForm && (
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setShowAddForm(false); }}>
          <div className={styles.addFormContainer}>
             <AddFlashcard onAdd={handleAdd} onCancel={() => setShowAddForm(false)} />
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {loading ? (
          <div className={styles.emptyState}>
            <svg width="32" height="32" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="30 70" strokeLinecap="round" />
            </svg>
            Loading flashcards...
          </div>
        ) : filteredFlashcards.length > 0 ? (
          filteredFlashcards.map((card, index) => (
            <div key={card.id} className={styles.card} style={{ '--i': index }}>
              <div>
                <div className={styles.itemWord}>
                  {card.english_word}
                  {card.is_learned && (
                    <span style={{ 
                      marginLeft: '0.5rem', 
                      fontSize: '0.7rem', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '9999px', 
                      background: 'rgba(16, 185, 129, 0.15)', 
                      color: 'var(--success-color)', 
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      fontWeight: 600,
                      letterSpacing: '0.03em'
                    }}>
                      ✓ Learned
                    </span>
                  )}
                </div>
                <div className={styles.itemMeaning}>{card.vietnamese_meaning}</div>
                {card.example_sentence && (
                  <div className={styles.itemExample}>"{card.example_sentence}"</div>
                )}
              </div>
              <div className={styles.actions}>
                <button 
                  onClick={() => setEditingCard(card)} 
                  className={`${styles.btn} ${styles.editBtn}`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(card.id)} 
                  disabled={deletingId === card.id}
                  className={`${styles.btn} ${styles.deleteBtn}`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  {deletingId === card.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No flashcards found.</p>
          </div>
        )}
      </div>

      {editingCard && (
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setEditingCard(null); }}>
          <div className={styles.modalContent}>
            <EditFlashcard 
              initialData={editingCard} 
              onUpdate={handleUpdate} 
              onCancel={() => setEditingCard(null)} 
            />
          </div>
        </div>
      )}
    </main>
  );
}
