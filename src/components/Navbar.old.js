import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
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

  const isActive = (path) => location.pathname === path ? styles.active : '';

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          eSIM<span>Connect</span>
          <span className={styles.dot}></span>
        </Link>

        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {user ? (
            <>
              <Link to="/register" className={styles.ctaBtn} onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
              <Link to="/login" className={styles.loginBtn} onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/plans" className={isActive('/plans')} onClick={() => setMenuOpen(false)}>
                Plans
              </Link>
              <Link to="/purchases" className={isActive('/purchases')} onClick={() => setMenuOpen(false)}>
                My Purchases
              </Link>
              <Link to="/itinerary" className={isActive('/itinerary')} onClick={() => setMenuOpen(false)}>
                Itinerary
              <Link to='/saved-itineraries' className={isActive('/saved-itineraries')} onClick={() => setMenuOpen(false)}>
                Saved Trips
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
              <Link to="/plans" className={isActive('/plans')} onClick={() => setMenuOpen(false)}>
                Plans
              </Link>
              <Link to="/purchases" className={isActive('/purchases')} onClick={() => setMenuOpen(false)}>
                My Purchases
              </Link>
              <Link to="/itinerary" className={isActive('/itinerary')} onClick={() => setMenuOpen(false)}>
                Itinerary
              <Link to='/saved-itineraries' className={isActive('/saved-itineraries')} onClick={() => setMenuOpen(false)}>
                Saved Trips
              </Link>
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
