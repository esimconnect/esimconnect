// src/components/Navbar.js
// Updated: language toggle added (Session 5)
// Assumes: animated SVG globe logo already in place from Session 4

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import LanguageToggle from './LanguageToggle';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLang();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <nav className={styles.navbar}>
      {/* ── Logo ── */}
      <Link to="/" className={styles.logoLink}>
        {/* Paste your existing SVG globe inline here — unchanged from Session 4 */}
        <svg
          className={styles.logoSvg}
          viewBox="0 0 200 60"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="esimconnect"
        >
          {/* Globe circle */}
          <circle cx="30" cy="30" r="22" fill="none" stroke="#38b6ff" strokeWidth="1.5" opacity="0.9" />
          {/* Latitude lines */}
          <ellipse cx="30" cy="30" rx="22" ry="9" fill="none" stroke="#38b6ff" strokeWidth="1" opacity="0.4" />
          <ellipse cx="30" cy="30" rx="22" ry="17" fill="none" stroke="#38b6ff" strokeWidth="0.7" opacity="0.25" />
          {/* Longitude lines */}
          <line x1="30" y1="8" x2="30" y2="52" stroke="#38b6ff" strokeWidth="1" opacity="0.4" />
          <line x1="8" y1="30" x2="52" y2="30" stroke="#38b6ff" strokeWidth="1" opacity="0.4" />
          {/* Signal dot */}
          <circle cx="30" cy="30" r="3" fill="#38b6ff" opacity="0.9" />
          <circle cx="30" cy="30" r="3" fill="#38b6ff" opacity="0.4">
            <animate attributeName="r" values="3;9;3" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
          </circle>
          {/* Wordmark */}
          <text
            x="60"
            y="37"
            fontFamily="'Segoe UI', system-ui, sans-serif"
            fontSize="21"
            fontWeight="700"
            fill="#e0e8f0"
            letterSpacing="-0.5"
          >
            eSim<tspan fill="#38b6ff">connect</tspan>
          </text>
        </svg>
      </Link>

      {/* ── Desktop nav links ── */}
      <div className={styles.navLinks}>
        <Link to="/plans" className={styles.navLink}>{t('nav_plans')}</Link>
        <Link to="/itinerary" className={styles.navLink}>{t('nav_itinerary')}</Link>

        {user ? (
          <>
            <Link to="/dashboard" className={styles.navLink}>{t('nav_dashboard')}</Link>
            <Link to="/purchases" className={styles.navLink}>{t('nav_purchases')}</Link>
            <Link to="/wallet" className={styles.navLink}>{t('nav_wallet')}</Link>
            <button onClick={handleLogout} className={styles.navBtn}>{t('nav_logout')}</button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.navLink}>{t('nav_login')}</Link>
            <Link to="/register" className={`${styles.navLink} ${styles.registerBtn}`}>{t('nav_register')}</Link>
          </>
        )}

        {/* ── Language toggle — always visible ── */}
        <LanguageToggle />
      </div>

      {/* ── Mobile hamburger ── */}
      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
      >
        <span className={`${styles.bar} ${menuOpen ? styles.barTopOpen : ''}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.barMidOpen : ''}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.barBotOpen : ''}`} />
      </button>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/plans" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('nav_plans')}</Link>
          <Link to="/itinerary" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('nav_itinerary')}</Link>

          {user ? (
            <>
              <Link to="/dashboard" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('nav_dashboard')}</Link>
              <Link to="/purchases" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('nav_purchases')}</Link>
              <Link to="/wallet" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('nav_wallet')}</Link>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className={styles.mobileLink}
              >{t('nav_logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('nav_login')}</Link>
              <Link to="/register" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{t('nav_register')}</Link>
            </>
          )}

          {/* Language toggle in mobile menu too */}
          <div className={styles.mobileLangRow}>
            <LanguageToggle />
          </div>
        </div>
      )}
    </nav>
  );
}
