// src/components/Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import styles from './Navbar.module.css';
import { useLang } from '../lib/i18n';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className={styles.nav} ref={menuRef}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <svg width="120" height="52" viewBox="0 0 340 110" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 10px rgba(0,200,255,0.5))' }}>
            {/* Globe */}
            <circle cx="52" cy="55" r="40" fill="none" stroke="#00c8ff" strokeWidth="2.5" />
            <ellipse cx="52" cy="55" rx="16" ry="40" fill="none" stroke="#00c8ff" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="12" y1="55" x2="92" y2="55" stroke="#00c8ff" strokeWidth="1.5" />
            <ellipse cx="52" cy="55" rx="40" ry="13" fill="none" stroke="#00c8ff" strokeWidth="1.2" strokeDasharray="3 3" />
            {/* Orbiting SIM chips */}
            <g className={styles.nb_sim1}>
              <rect x="42" y="10" width="20" height="14" rx="3" fill="#00c8ff" opacity="0.9" />
              <rect x="45" y="13" width="14" height="8" rx="1" fill="#0d1117" />
            </g>
            <g className={styles.nb_sim2}>
              <rect x="84" y="48" width="18" height="13" rx="3" fill="#bf5af2" opacity="0.9" />
              <rect x="87" y="51" width="12" height="7" rx="1" fill="#0d1117" />
            </g>
            {/* Brand text */}
            <text x="108" y="50" fontFamily="'Exo 2', sans-serif" fontWeight="900" fontSize="33" fill="#ffffff" letterSpacing="-0.5">eSIM</text>
            <text x="108" y="80" fontFamily="'Exo 2', sans-serif" fontWeight="400" fontSize="22" fill="#00c8ff" letterSpacing="2">connect</text>
          </svg>
        </Link>

        {/* Desktop nav links — MyItinerary first */}
        <div className={styles.links}>
          <Link to="/itinerary" className={styles.link}>{t('nav_itinerary')}</Link>
          <Link to="/plans" className={styles.link}>{t('nav_plans')}</Link>
          {user && <Link to="/purchases" className={styles.link}>{t('nav_purchases')}</Link>}
          {user && <Link to="/dashboard" className={styles.link}>{t('nav_dashboard')}</Link>}
          {user && <Link to="/wallet" className={styles.link}>{t('nav_wallet')}</Link>}
          {!user && <Link to="/login" className={styles.link}>{t('nav_login')}</Link>}
          {!user && <Link to="/register" className={styles.link}>{t('nav_register')}</Link>}
          {user && (
            <button onClick={handleLogout} className={styles.logoutBtn}>{t('nav_logout')}</button>
          )}
          <LanguageToggle />
        </div>

        {/* Mobile hamburger */}
        <button className={styles.burger} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/itinerary" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('nav_itinerary')}</Link>
          <Link to="/plans" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('nav_plans')}</Link>
          {user && <Link to="/purchases" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('nav_purchases')}</Link>}
          {user && <Link to="/dashboard" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('nav_dashboard')}</Link>}
          {user && <Link to="/wallet" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('nav_wallet')}</Link>}
          {!user && <Link to="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('nav_login')}</Link>}
          {!user && <Link to="/register" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('nav_register')}</Link>}
          {user && <button onClick={() => { handleLogout(); setMenuOpen(false); }} className={styles.mobileLink} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'inherit', width: '100%', padding: '12px 20px', fontSize: '15px' }}>{t('nav_logout')}</button>}
          <div className={styles.mobileLangRow}><LanguageToggle /></div>
        </div>
      )}
    </nav>
  );
}
