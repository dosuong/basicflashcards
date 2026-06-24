'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          Cardify
        </Link>

        <div className={styles.actions}>
          {user ? (
            <>
              <Link 
                href="/manage" 
                className={`${styles.btn} ${styles.manageBtn} ${pathname === '/manage' ? styles.active : ''}`}
              >
                Manage
              </Link>
              <button onClick={handleLogout} className={`${styles.btn} ${styles.logoutBtn}`}>
                Logout
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              className={`${styles.btn} ${styles.loginBtn} ${pathname === '/login' ? styles.active : ''}`}
            >
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
