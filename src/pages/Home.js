import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from './Home.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.bgGrad}></div>
        <div className={`${styles.orb} ${styles.orb1}`}></div>
        <div className={`${styles.orb} ${styles.orb2}`}></div>
        <div className={styles.grid}></div>
      </div>

      <Navbar />

      <main className={styles.hero}>
        <div className={styles.badge}>
          <span className={styles.badgeDot}></span>
          Instant eSIM · 190+ Countries
        </div>

        <h1 className={styles.headline}>
          Travel the world.<br />
          <em>Stay connected.</em>
        </h1>

        <p className={styles.sub}>
          Affordable eSIM data plans, virtual phone numbers, and AI travel tools — 
          all in one app. Activate in 60 seconds.
        </p>

        <div className={styles.actions}>
          <Link to="/plans" className={styles.primaryBtn}>
            Browse Plans →
          </Link>
          <Link to="/register" className={styles.secondaryBtn}>
            Create Free Account
          </Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statNum}>190<span>+</span></div>
            <div className={styles.statLabel}>Countries</div>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.stat}>
            <div className={styles.statNum}>60<span>s</span></div>
            <div className={styles.statLabel}>Activation</div>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.stat}>
            <div className={styles.statNum}>$8<span>+</span></div>
            <div className={styles.statLabel}>From SGD</div>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.stat}>
            <div className={styles.statNum}>24<span>/7</span></div>
            <div className={styles.statLabel}>Support</div>
          </div>
        </div>
      </main>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>© 2026 Kairos Ventures Pte. Ltd. · Singapore</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/terms" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Terms &amp; Conditions</Link>
          <a href="mailto:support@esimconnect.world" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Contact</a>
        </div>
      </footer>
    </div>
  );
}
