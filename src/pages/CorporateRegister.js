import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import styles from './CorporateRegister.module.css';

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function CorporateRegister() {
  const navigate = useNavigate();

  // Step 1 = company details, Step 2 = admin account
  const [step, setStep] = useState(1);

  // Company details
  const [companyName, setCompanyName] = useState('');
  const [uen, setUen] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Admin account
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Step 1 validation ────────────────────────────────────────
  function handleCompanyNext(e) {
    e.preventDefault();
    setError('');
    if (!companyName.trim()) return setError('Company name is required.');
    if (!contactEmail.trim()) return setError('Contact email is required.');
    setStep(2);
  }

  // ── Step 2: register Supabase user then call backend ─────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');

    setLoading(true);
    try {
      // 1. Register with Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (authErr) throw authErr;

      const userId = authData?.user?.id;
      if (!userId) throw new Error('User creation failed — please try again.');

      // 2. Call backend to create corporate record + upgrade profile
      const res = await fetch(`${BACKEND}/corporate/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName.trim(),
          uen: uen.trim() || null,
          contact_email: contactEmail.trim(),
          user_id: userId,
          full_name: fullName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      navigate('/corporate/dashboard', { state: { corp_id: data.corp_id } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoMark}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0f172a"/>
              <path d="M8 16 C8 11.6 11.6 8 16 8 C20.4 8 24 11.6 24 16" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 16 C12 13.8 13.8 12 16 12 C18.2 12 20 13.8 20 16" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="16" cy="16" r="2" fill="#38bdf8"/>
            </svg>
          </div>
          <h1 className={styles.title}>Corporate Account</h1>
          <p className={styles.subtitle}>Set up your company's eSIM portal</p>
        </div>

        {/* Progress */}
        <div className={styles.progress}>
          <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ''}`}>
            <span className={styles.stepNum}>1</span>
            <span className={styles.stepLabel}>Company</span>
          </div>
          <div className={styles.progressLine}/>
          <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ''}`}>
            <span className={styles.stepNum}>2</span>
            <span className={styles.stepLabel}>Admin Account</span>
          </div>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* ── Step 1: Company ─────────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleCompanyNext} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Company Name *</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Acme Pte Ltd"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                UEN <span className={styles.optional}>(optional)</span>
              </label>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. 202312345A"
                value={uen}
                onChange={e => setUen(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Contact Email *</label>
              <input
                className={styles.input}
                type="email"
                placeholder="accounts@company.com"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.infoBox}>
              <span className={styles.infoIcon}>ℹ</span>
              <p>
                You'll create the <strong>admin account</strong> in the next step.
                Staff are invited separately from the dashboard.
              </p>
            </div>

            <button type="submit" className={styles.primaryBtn}>
              Continue →
            </button>

            <p className={styles.loginLink}>
              Already have an account?{' '}
              <span className={styles.link} onClick={() => navigate('/login')}>Sign in</span>
            </p>
          </form>
        )}

        {/* ── Step 2: Admin Account ────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.companyPill}>
              <span className={styles.pillIcon}>🏢</span>
              {companyName}
              <button
                type="button"
                className={styles.pillEdit}
                onClick={() => setStep(1)}
              >
                Edit
              </button>
            </div>

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
              <label className={styles.label}>Work Email *</label>
              <input
                className={styles.input}
                type="email"
                placeholder="jane@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.fieldRow}>
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
            </div>

            <div className={styles.benefitsGrid}>
              {[
                ['💳', 'One corporate wallet', 'Top up once, staff spend freely'],
                ['📧', 'Email invitations', 'Onboard staff in seconds'],
                ['📊', 'Full order history', 'Export monthly statements'],
              ].map(([icon, title, desc]) => (
                <div key={title} className={styles.benefitCard}>
                  <span className={styles.benefitIcon}>{icon}</span>
                  <strong>{title}</strong>
                  <span>{desc}</span>
                </div>
              ))}
            </div>

            <button type="submit" className={styles.primaryBtn} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Corporate Account'}
            </button>

            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
