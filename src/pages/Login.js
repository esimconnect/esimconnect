import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import styles from './Auth.module.css';
import { useLang } from '../lib/i18n';

export default function Login() {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email address above first, then click Forgot Password.');
      return;
    }
    setResetLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'https://esimconnect.world/dashboard',
    });
    setResetLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const fromItinerary = new URLSearchParams(location.search).get('from') === 'itinerary';
      if (fromItinerary) {
        navigate('/login-success');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.sub}>Sign in to your eSIM Connect account</p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label>{t('auth_email')}</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label>{t('auth_password')}</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner}></span> : `${t('auth_login')} →`}
            </button>

            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                style={{
                  background: 'none', border: 'none', color: '#38bdf8',
                  fontSize: '0.83rem', cursor: 'pointer', padding: 0,
                  textDecoration: 'underline',
                }}
              >
                {resetLoading ? 'Sending…' : 'Forgot password?'}
              </button>
            </div>
            {resetSent && (
              <p style={{ color: '#34d399', fontSize: '0.85rem', margin: '8px 0 0', textAlign: 'center' }}>
                ✅ Password reset email sent — check your inbox.
              </p>
            )}
          </form>

          <p className={styles.switchText}>
            {t('auth_no_account')} <Link to="/register">{t('auth_register')}</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
