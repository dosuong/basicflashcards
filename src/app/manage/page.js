'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import EditFlashcard from '../../components/EditFlashcard';
import styles from './page.module.css';

export default function ManageFlashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
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

  const filteredFlashcards = flashcards.filter(card => 
    card.english_word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.vietnamese_meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className={styles.manageContainer}>
      <div className={styles.header}>
        <h1>Manage Cards</h1>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search flashcards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.grid}>
        {loading ? (
          <div className={styles.emptyState}>Loading flashcards...</div>
        ) : filteredFlashcards.length > 0 ? (
          filteredFlashcards.map((card) => (
            <div key={card.id} className={styles.card}>
              <div>
                <div className={styles.itemWord}>{card.english_word}</div>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <div className={styles.modalOverlay}>
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
