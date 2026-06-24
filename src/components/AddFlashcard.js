'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import styles from '../app/page.module.css';

export default function AddFlashcard({ onAdd, onCancel }) {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word || !meaning) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('flashcards')
      .insert([{ english_word: word, vietnamese_meaning: meaning, example_sentence: example }])
      .select();
      
    setLoading(false);
    
    if (error) {
      alert('Error adding flashcard!');
      console.error(error);
    } else if (data) {
      onAdd(data[0]);
      setWord('');
      setMeaning('');
      setExample('');
    }
  };

  return (
    <div>
      <h2 style={{ 
        marginBottom: '2rem', 
        fontSize: '1.75rem', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #818cf8, #c084fc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 700
      }}>
        Add New Word
      </h2>
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
          <label>Vietnamese Meaning / Extra Info</label>
          <textarea 
            value={meaning} 
            onChange={(e) => setMeaning(e.target.value)} 
            required 
            rows="5"
            placeholder={"e.g. Sự tình cờ may mắn (n)\n- pronunciation: ...\n- synonyms: ..."}
          ></textarea>
        </div>
        <div className={styles.formGroup}>
          <label>Example Sentence (Optional)</label>
          <textarea 
            value={example} 
            onChange={(e) => setExample(e.target.value)} 
            rows="3"
            placeholder="They found each other by pure serendipity."
          ></textarea>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {onCancel && (
            <button type="button" onClick={onCancel} className={`${styles.btn} ${styles.btnSecondary}`} style={{ flex: 1 }}>
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex: 1 }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="30 70" strokeLinecap="round" />
                </svg>
                Adding...
              </span>
            ) : 'Add Flashcard'}
          </button>
        </div>
      </form>
    </div>
  );
}
