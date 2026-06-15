'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import styles from '../app/page.module.css';

export default function EditFlashcard({ initialData, onUpdate, onCancel }) {
  const [word, setWord] = useState(initialData.english_word || '');
  const [meaning, setMeaning] = useState(initialData.vietnamese_meaning || '');
  const [example, setExample] = useState(initialData.example_sentence || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word || !meaning) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('flashcards')
      .update({ english_word: word, vietnamese_meaning: meaning, example_sentence: example })
      .eq('id', initialData.id)
      .select();
      
    setLoading(false);
    
    if (error) {
      alert('Error updating flashcard!');
      console.error(error);
    } else if (data) {
      onUpdate(data[0]);
    }
  };

  return (
    <div className={styles.addFormContainer}>
      <h2>Edit Flashcard</h2>
      <form onSubmit={handleSubmit} className={styles.addForm}>
        <div className={styles.formGroup}>
          <label>English Word</label>
          <input 
            type="text" 
            value={word} 
            onChange={(e) => setWord(e.target.value)} 
            required 
            placeholder="e.g. Serendipity"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Vietnamese Meaning</label>
          <input 
            type="text" 
            value={meaning} 
            onChange={(e) => setMeaning(e.target.value)} 
            required 
            placeholder="e.g. Sự tình cờ may mắn"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Example Sentence (Optional)</label>
          <textarea 
            value={example} 
            onChange={(e) => setExample(e.target.value)} 
            rows="2"
            placeholder="They found each other by pure serendipity."
          ></textarea>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="button" onClick={onCancel} className={`${styles.btn} ${styles.btnSecondary}`} style={{ flex: 1 }}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex: 1 }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
