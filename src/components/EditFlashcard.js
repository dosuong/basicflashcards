'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import styles from '../app/page.module.css';

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
    <div className={styles.addFormContainer}>
      <h2 style={{ 
        marginBottom: '2rem', 
        fontSize: '1.75rem', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #818cf8, #c084fc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 700
      }}>
        Edit Word
      </h2>
      <form onSubmit={handleSubmit} className={styles.addForm}>
        <div className={styles.formGroup}>
          <label>English Word</label>
          <input 
            type="text" 
            value={word} 
            onChange={(e) => setWord(e.target.value)} 
            required 
          />
        </div>
        <div className={styles.formGroup}>
          <label>Vietnamese Meaning / Extra Info</label>
          <textarea 
            value={meaning} 
            onChange={(e) => setMeaning(e.target.value)} 
            required 
            rows="5"
          ></textarea>
        </div>
        <div className={styles.formGroup}>
          <label>Example Sentence (Optional)</label>
          <textarea 
            value={example} 
            onChange={(e) => setExample(e.target.value)} 
            rows="3"
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
            style={{ margin: 0, cursor: 'pointer', fontSize: '0.95rem', color: isLearned ? 'var(--success-color)' : 'var(--text-secondary)', transition: 'color 0.2s', fontWeight: 500 }}
          >
            {isLearned ? '✓ Marked as Learned' : 'Mark as Learned'}
          </label>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="button" onClick={onCancel} className={`${styles.btn} ${styles.btnSecondary}`} style={{ flex: 1 }}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex: 1 }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="30 70" strokeLinecap="round" />
                </svg>
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
