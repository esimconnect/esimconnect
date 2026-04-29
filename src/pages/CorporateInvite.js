import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import styles from './CorporateInvite.module.css';

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function CorporateInvite() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [invite, setInvite] = useState(null);
  const [inviteError, setInviteError] = useState('');
  const [loadingInvite, setLoadingInvite] = useState(true);

  // Form
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Validate token on mount ───────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BACKEND}/corporate/invite/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setInvite(data);
      } catch (err) {
        setInviteError(err.message);
      } finally {
        setLoadingInvite(false);
      }
    })();
  }, [token]);

  // ── Accept invite ─────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');

    setLoading(true);
    try {
      // 1. Register Supabase user
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (authErr) throw authErr;

      const userId = authData?.user?.id;
      if (!userId) throw new Error('Account creation failed — please try again.');

      // 2. Accept invite on backend (marks invite accepted + upgrades profile)
      const res = await fetch(`${BACKEND}/corporate/invite/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      navigate('/dashboard', { state: { welcomeCorp: invite.company_name } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Loading / error states ────────────────────────────────────
  if (loadingInvite) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.loadingState}>Checking your invite…</div>
        </div>
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.errorState}>
            <span className={styles.errorIcon}>⚠️</span>
            <h2>Invite Invalid</h2>
            <p>{inviteError}</p>
            <button className={styles.primaryBtn} onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.companyBadge}>
            <span className={styles.companyIcon}>🏢</span>
            <span className={styles.companyName}>{invite.company_name}</span>
          </div>
          <h1 className={styles.title}>You're Invited</h1>
          <p className={styles.subtitle}>
            Complete your account to join <strong>{invite.company_name}</strong> on esimconnect.
          </p>
        </div>

        {/* Pre-filled email notice */}
        <div className={styles.emailNotice}>
          <span className={styles.emailIcon}>✉️</span>
          <div>
            <div className={styles.emailLabel}>Signing up as</div>
            <div className={styles.emailValue}>{invite.email}</div>
          </div>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Your Full Name</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Jane Tan"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password *</label>
            <input
              className={styles.input}
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm Password *</label>
            <input
              className={styles.input}
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.perksBox}>
            {[
              ['📦', 'Order eSIM plans charged to your company wallet — no expense claims'],
              ['🌍', 'Access to 190+ countries, instant QR delivery'],
              ['📊', 'Your purchase history visible to your company admin'],
            ].map(([icon, text]) => (
              <div key={text} className={styles.perkRow}>
                <span className={styles.perkIcon}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Creating account…' : 'Accept & Join'}
          </button>
        </form>
      </div>
    </div>
  );
}
