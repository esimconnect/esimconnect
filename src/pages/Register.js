import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import styles from './Auth.module.css';
import { useLang } from '../lib/i18n';

export default function Register() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data?.user?.identities?.length === 0) {
      setError('An account with this email already exists. Please sign in or check your inbox.');
      setLoading(false);
    } else {
      setConfirmed(true);
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <h1 className={styles.title}>Check your email</h1>
              <p className={styles.sub}>
                We sent a confirmation link to <strong>{email}</strong>.<br />
                Click it to activate your account, then sign in.
              </p>
            </div>
            <button
              className={styles.submitBtn}
              style={{ marginTop: '24px' }}
              onClick={() => navigate('/login')}
            >
              {t('auth_login')} →
            </button>
            <p className={styles.switchText} style={{ marginTop: '16px' }}>
              Didn't receive it? Check your spam folder or{' '}
              <span
                style={{ color: 'var(--accent)', cursor: 'pointer' }}
                onClick={() => setConfirmed(false)}
              >
                try again
              </span>
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h1 className={styles.title}>{t('auth_register')}</h1>
            <p className={styles.sub}>Join eSIM Connect — travel smarter</p>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.field}>
              <label>{t('auth_name')}</label>
              <input
                type="text"
                placeholder="David Lim"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
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
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '8px 0' }}>
              <input type='checkbox' id='terms' checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ marginTop: '3px', accentColor: 'var(--accent)', width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }} />
              <label htmlFor='terms' style={{ fontSize: '13px', color: 'var(--muted)', cursor: 'pointer', lineHeight: '1.5' }}>
                I agree to the <a href='/terms' target='_blank' rel='noopener noreferrer' style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Terms and Conditions</a>
              </label>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading || !agreedToTerms} style={{ opacity: agreedToTerms ? 1 : 0.5 }}>
              {loading ? <span className={styles.spinner}></span> : `${t('auth_register')} →`}
            </button>
          </form>
          <p className={styles.switchText}>
            {t('auth_have_account')} <Link to="/login">{t('auth_login')}</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
