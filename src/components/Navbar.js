import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import LanguageToggle from './LanguageToggle';
import styles from './Navbar.module.css';

const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLang();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? styles.ctaBtn : '';
  const isAdmin = user?.email === ADMIN_EMAIL;

  const PlansDropdown = () => (
    <div style={{ position: 'relative' }}
      onMouseEnter={() => setPlansOpen(true)}
      onMouseLeave={() => setTimeout(() => setPlansOpen(false), 150)}
    >
      <Link to="/plans" className={isActive('/plans')} onClick={() => setMenuOpen(false)}
        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {t('nav_plans')} <span style={{ fontSize: '10px', opacity: 0.6 }}>▾</span>
      </Link>
      {plansOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: '0', background: '#0d1117',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
          padding: '8px', minWidth: '180px', zIndex: 1000,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <Link to="/plans" onClick={() => { setMenuOpen(false); setPlansOpen(false); }} style={{
            display: 'block', padding: '10px 14px', borderRadius: '8px',
            color: 'inherit', textDecoration: 'none', fontSize: '14px', fontWeight: 600,
          }}>📶 {t('nav_plans')}</Link>
          <Link to="/find-order" onClick={() => { setMenuOpen(false); setPlansOpen(false); }} style={{
            display: 'block', padding: '10px 14px', borderRadius: '8px',
            color: 'inherit', textDecoration: 'none', fontSize: '14px', fontWeight: 600,
          }}>🔍 {t('find_title')}</Link>
        </div>
      )}
    </div>
  );

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={() => setMenuOpen(false)} style={{ overflow: 'visible' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 96" role="img"
            style={{ height: '88px', width: 'auto', display: 'block', filter: 'drop-shadow(0 4px 14px rgba(26,106,255,0.5))' }}>
            <defs>
              <radialGradient id="nb_gG" cx="38%" cy="32%" r="62%">
                <stop offset="0%" stopColor="#1a4a8a"/>
                <stop offset="45%" stopColor="#0a2255"/>
                <stop offset="100%" stopColor="#040e28"/>
              </radialGradient>
              <radialGradient id="nb_haloG" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1a6aff" stopOpacity="0.22"/>
                <stop offset="100%" stopColor="#1a6aff" stopOpacity="0"/>
              </radialGradient>
              <linearGradient id="nb_wG" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff"/>
                <stop offset="50%" stopColor="#a8d8ff"/>
                <stop offset="100%" stopColor="#5aaeff"/>
              </linearGradient>
              <clipPath id="nb_gc">
                <circle cx="48" cy="48" r="38"/>
              </clipPath>
              <style>{`
                @keyframes nb_orbit5G {
                  from { transform: rotate(0deg) translateX(44px) rotate(0deg); }
                  to   { transform: rotate(360deg) translateX(44px) rotate(-360deg); }
                }
                .nb_5g_icon {
                  animation: nb_orbit5G 6s linear infinite;
                  transform-origin: 48px 48px;
                  transform-box: view-box;
                }
              `}</style>
            </defs>

            {/* Globe halo + body */}
            <circle cx="48" cy="48" r="46" fill="url(#nb_haloG)"/>
            <circle cx="48" cy="48" r="38" fill="url(#nb_gG)" stroke="#3a8aff" strokeWidth="1.5"/>
            <g clipPath="url(#nb_gc)">
              <ellipse cx="48" cy="48" rx="38" ry="38" fill="none" stroke="#1a6aff" strokeWidth="0.5" strokeOpacity="0.45"/>
              <ellipse cx="48" cy="48" rx="23" ry="38" fill="none" stroke="#1a6aff" strokeWidth="0.5" strokeOpacity="0.4"/>
              <ellipse cx="48" cy="48" rx="10" ry="38" fill="none" stroke="#1a6aff" strokeWidth="0.5" strokeOpacity="0.4"/>
              <ellipse cx="48" cy="48" rx="38" ry="4"  fill="none" stroke="#1a6aff" strokeWidth="0.6" strokeOpacity="0.55"/>
              <ellipse cx="48" cy="37" rx="34" ry="3.5" fill="none" stroke="#1a6aff" strokeWidth="0.5" strokeOpacity="0.4"/>
              <ellipse cx="48" cy="59" rx="34" ry="3.5" fill="none" stroke="#1a6aff" strokeWidth="0.5" strokeOpacity="0.4"/>
            </g>

            {/* Globe text */}
            <text x="48" y="46" fontFamily="Arial, Helvetica, sans-serif" fontSize="12" fontWeight="700"
              fill="url(#nb_wG)" textAnchor="middle" letterSpacing="-0.3">
              <tspan fontWeight="300">e</tspan>Sim<tspan fontWeight="300">connect</tspan>
            </text>
            <text x="48" y="57" fontFamily="Arial, Helvetica, sans-serif" fontSize="4.5"
              fill="#60b0ff" textAnchor="middle" letterSpacing="1.5">150+ COUNTRIES</text>

            {/* Orbit track */}
            <circle cx="48" cy="48" r="44" fill="none" stroke="#1a6aff" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="3 4"/>

            {/* Single unboxed 5G text orbiting clockwise */}
            <g className="nb_5g_icon">
              <text x="48" y="51" fontFamily="Arial, Helvetica, sans-serif" fontSize="9" fontWeight="900"
                fill="#00c8ff" textAnchor="middle" letterSpacing="0.5"
                style={{ textShadow: '0 0 6px rgba(0,200,255,0.8)' }}>5G</text>
            </g>

            {/* Brand name */}
            <text x="104" y="55" fontFamily="Arial, Helvetica, sans-serif" fontSize="24" fontWeight="700"
              fill="#ffffff" letterSpacing="-0.5">
              <tspan fontWeight="300" fill="#00c8ff">e</tspan>SIM<tspan fontWeight="300" fill="#00c8ff">connect</tspan>
            </text>
          </svg>
        </Link>

        {/* Nav links */}
        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {user ? (
            <>
              <Link to="/itinerary" className={isActive('/itinerary')} onClick={() => setMenuOpen(false)}>
                {t('nav_itinerary')}
              </Link>
              <PlansDropdown />
              <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}>
                {t('nav_dashboard')}
              </Link>
              <Link to="/purchases" className={isActive('/purchases')} onClick={() => setMenuOpen(false)}>
                {t('nav_purchases')}
              </Link>
              <Link to="/saved-itineraries" className={isActive('/saved-itineraries')} onClick={() => setMenuOpen(false)}>
                Saved Trips
              </Link>
              <Link to="/terms" className={isActive('/terms')} onClick={() => setMenuOpen(false)}>
                T&C
              </Link>
              {/* Admin link — only visible to admin account */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={isActive('/admin')}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    color: '#00c8c8',
                    fontWeight: 700,
                    border: '1px solid rgba(0,200,200,0.3)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '13px',
                  }}
                >
                  ⚙️ Admin
                </Link>
              )}
              <button className={styles.signOutBtn} onClick={handleSignOut}>
                {t('nav_logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/itinerary" className={isActive('/itinerary')} onClick={() => setMenuOpen(false)}>
                {t('nav_itinerary')}
              </Link>
              <PlansDropdown />
              <Link to="/terms" className={isActive('/terms')} onClick={() => setMenuOpen(false)}>
                T&C
              </Link>
              <Link to="/register" className={styles.ctaBtn} onClick={() => setMenuOpen(false)}>
                {t('nav_register')}
              </Link>
              <Link to="/login" className={styles.loginBtn} onClick={() => setMenuOpen(false)}>
                {t('nav_login')}
              </Link>
            </>
          )}
          <LanguageToggle />
        </div>

        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>

      </div>
    </nav>
  );
}
