'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import styles from './Modal.module.css';

export default function EditFlashcard({ initialData, onUpdate, onCancel }) {
  const [word, setWord] = useState(initialData.english_word);
  const [meaning, setMeaning] = useState(initialData.vietnamese_meaning);
  const [example, setExample] = useState(initialData.example_sentence || '');
  const [isLearned, setIsLearned] = useState(initialData.is_learned || false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setWord(initialData.english_word);
    setMeaning(initialData.vietnamese_meaning);
    setExample(initialData.example_sentence || '');
    setIsLearned(initialData.is_learned || false);
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word || !meaning) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('flashcards')
      .update({ english_word: word, vietnamese_meaning: meaning, example_sentence: example, is_learned: isLearned })
      .eq('id', initialData.id)
      .select();
      
    setLoading(false);
    
    if (error) {
      alert('Error updating flashcard!');
      console.error(error);
    } else if (data && data.length > 0) {
      onUpdate(data[0]);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>
          Edit Word
        </h2>
        <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>English Word</label>
          <input 
            type="text" 
            value={word} 
            onChange={(e) => setWord(e.target.value)} 
            required 
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Vietnamese Meaning / Extra Info</label>
          <textarea 
            value={meaning} 
            onChange={(e) => setMeaning(e.target.value)} 
            required 
            className={styles.textarea}
          ></textarea>
        </div>
        <div className={styles.formGroup}>
          <label>Example Sentence (Optional)</label>
          <textarea 
            value={example} 
            onChange={(e) => setExample(e.target.value)} 
            className={styles.textarea}
            style={{ minHeight: '80px' }}
          ></textarea>
        </div>
        <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div 
            className={`${styles.toggleSwitch} ${isLearned ? styles.active : ''}`}
            onClick={() => setIsLearned(!isLearned)}
            role="switch"
            aria-checked={isLearned}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsLearned(!isLearned); }}}
          ></div>
          <label 
            onClick={() => setIsLearned(!isLearned)} 
            style={{ margin: 0, cursor: 'pointer', fontSize: '0.95rem', color: isLearned ? 'var(--success-color, #10b981)' : 'var(--text-secondary, #a1a1aa)', transition: 'color 0.2s', fontWeight: 500 }}
          >
            {isLearned ? '✓ Marked as Learned' : 'Mark as Learned'}
          </label>
        </div>
        <div className={styles.btnGroup}>
          <button type="button" onClick={onCancel} className={`${styles.btn} ${styles.btnSecondary}`}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary}`}>
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="30 70" strokeLinecap="round" />
                </svg>
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}
