'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import styles from './Modal.module.css';

export default function FlashcardModal({ initialData, onSave, onCancel }) {
  const isEdit = !!initialData;
  const [word, setWord] = useState(initialData?.english_word || '');
  const [meaning, setMeaning] = useState(initialData?.vietnamese_meaning || '');
  const [example, setExample] = useState(initialData?.example_sentence || '');
  const [isLearned, setIsLearned] = useState(initialData?.is_learned || false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word || !meaning) return;
    
    setLoading(true);
    let data, error;

    if (isEdit) {
      const res = await supabase
        .from('flashcards')
        .update({ english_word: word, vietnamese_meaning: meaning, example_sentence: example, is_learned: isLearned })
        .eq('id', initialData.id)
        .select();
      data = res.data;
      error = res.error;
    } else {
      const res = await supabase
        .from('flashcards')
        .insert([{ english_word: word, vietnamese_meaning: meaning, example_sentence: example }])
        .select();
      data = res.data;
      error = res.error;
    }
      
    setLoading(false);
    
    if (error) {
      alert(`Error ${isEdit ? 'updating' : 'adding'} flashcard!`);
      console.error(error);
    } else if (data) {
      onSave(data[0]);
      if (!isEdit) {
        setWord('');
        setMeaning('');
        setExample('');
      }
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div 
        className={styles.modalContent} 
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: '#18181b', opacity: 1, zIndex: 10000 }} // Fallback inline styles to guarantee it's not transparent
      >
        <h2 className={styles.title}>
          {isEdit ? 'Edit Word' : 'Add New Word'}
        </h2>
        <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>English Word</label>
          <input 
            type="text" 
            value={word} 
            onChange={(e) => setWord(e.target.value)} 
            required 
            placeholder="e.g. Serendipity"
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Vietnamese Meaning / Extra Info</label>
          <textarea 
            value={meaning} 
            onChange={(e) => setMeaning(e.target.value)} 
            required 
            placeholder={"e.g. Sự tình cờ may mắn (n)\n- pronunciation: ...\n- synonyms: ..."}
            className={styles.textarea}
          ></textarea>
        </div>
        <div className={styles.formGroup}>
          <label>Example Sentence (Optional)</label>
          <textarea 
            value={example} 
            onChange={(e) => setExample(e.target.value)} 
            placeholder="They found each other by pure serendipity."
            className={styles.textarea}
            style={{ minHeight: '80px' }}
          ></textarea>
        </div>
        
        {isEdit && (
          <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ marginBottom: 0 }}>Learned Status:</label>
            <div 
              className={`${styles.toggleSwitch} ${isLearned ? styles.active : ''}`}
              onClick={() => setIsLearned(!isLearned)}
            />
            <span style={{ fontSize: '0.85rem', color: isLearned ? '#10b981' : 'var(--text-secondary)' }}>
              {isLearned ? 'Learned' : 'Not Learned'}
            </span>
          </div>
        )}

        <div className={styles.btnGroup}>
          {onCancel && (
            <button type="button" onClick={onCancel} className={`${styles.btn} ${styles.btnSecondary}`}>
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary}`}>
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="30 70" strokeLinecap="round" />
                </svg>
                {isEdit ? 'Saving...' : 'Adding...'}
              </>
            ) : (isEdit ? 'Save Changes' : 'Add Flashcard')}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}
