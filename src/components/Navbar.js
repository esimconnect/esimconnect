import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          eSIM<span>Connect</span>
          <span className={styles.dot}></span>
        </Link>

        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          <Link to="/plans" className={location.pathname === '/plans' ? styles.active : ''}>
            Plans
          </Link>
          <Link to="/login" className={styles.loginBtn}>Sign In</Link>
          <Link to="/register" className={styles.ctaBtn}>Get Started</Link>
        </div>

        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}
