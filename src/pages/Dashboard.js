import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
    } else {
      setUser(user);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              Welcome back! 👋
            </h1>
            <p className={styles.email}>{user?.email}</p>
          </div>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📱</div>
            <div className={styles.cardTitle}>My eSIMs</div>
            <div className={styles.cardValue}>0</div>
            <div className={styles.cardSub}>Active plans</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📞</div>
            <div className={styles.cardTitle}>Virtual Number</div>
            <div className={styles.cardValue}>—</div>
            <div className={styles.cardSub}>Not activated</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>💰</div>
            <div className={styles.cardTitle}>eWallet</div>
            <div className={styles.cardValue}>SGD 0.00</div>
            <div className={styles.cardSub}>Available balance</div>
          </div>
        </div>

        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🌍</div>
          <h3>Ready to travel?</h3>
          <p>Browse our eSIM plans and get connected in 60 seconds.</p>
          <button
            className={styles.browsePlansBtn}
            onClick={() => navigate('/plans')}
          >
            Browse Plans →
          </button>
        </div>
      </main>
    </div>
  );
}
