import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  const PlansDropdown = () => (
    <div style={{ position: 'relative' }}
      onMouseEnter={() => setPlansOpen(true)}
      onMouseLeave={() => setTimeout(() => setPlansOpen(false), 150)}
    >
      <Link to="/plans" className={isActive('/plans')} onClick={() => setMenuOpen(false)}
        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        Plans <span style={{ fontSize: '10px', opacity: 0.6 }}>▾</span>
      </Link>
      {plansOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: '0', background: '#0d1117',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
          padding: '8px', minWidth: '180px', zIndex: 1000,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', marginTop: '0px',
        }}>
          <Link to="/plans" onClick={() => { setMenuOpen(false); setPlansOpen(false); }} style={{
            display: 'block', padding: '10px 14px', borderRadius: '8px',
            color: 'inherit', textDecoration: 'none', fontSize: '14px', fontWeight: 600,
          }}>📶 Browse Plans</Link>
          <Link to="/find-order" onClick={() => { setMenuOpen(false); setPlansOpen(false); }} style={{
            display: 'block', padding: '10px 14px', borderRadius: '8px',
            color: 'inherit', textDecoration: 'none', fontSize: '14px', fontWeight: 600,
          }}>🔍 Find My Order</Link>
        </div>
      )}
    </div>
  );

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <img
            src="/esimconnect-logo.svg"
            alt="eSIMConnect"
            style={{ height: '44px', width: 'auto', display: 'block' }}
          />
        </Link>

        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {user ? (
            <>
              <PlansDropdown />
              <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/purchases" className={isActive('/purchases')} onClick={() => setMenuOpen(false)}>
                My Purchases
              </Link>
              <Link to="/itinerary" className={isActive('/itinerary')} onClick={() => setMenuOpen(false)}>
                Itinerary
              </Link>
              <Link to="/saved-itineraries" className={isActive('/saved-itineraries')} onClick={() => setMenuOpen(false)}>
                Saved Trips
              </Link>
              <Link to="/terms" className={isActive('/terms')} onClick={() => setMenuOpen(false)}>
                T&C
              </Link>
              <button className={styles.signOutBtn} onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className={styles.ctaBtn} onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
              <Link to="/login" className={styles.loginBtn} onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
              <PlansDropdown />
              <Link to="/itinerary" className={isActive('/itinerary')} onClick={() => setMenuOpen(false)}>
                Itinerary
              </Link>
              <Link to="/terms" className={isActive('/terms')} onClick={() => setMenuOpen(false)}>
                T&C
              </Link>
            </>
          )}
        </div>

        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}
