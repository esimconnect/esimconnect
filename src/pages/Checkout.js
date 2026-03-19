import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import styles from './Auth.module.css';

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const plan = state?.plan;
  const country = state?.country;

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNotify = async (e) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from('waitlist').insert({ email });
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card} style={{ maxWidth: '480px', textAlign: 'center' }}>

          {/* Plan summary */}
          {plan && (
            <div style={{
              background: 'rgba(0,200,255,0.06)',
              border: '1px solid rgba(0,200,255,0.2)',
              borderRadius: '14px',
              padding: '16px 20px',
              marginBottom: '28px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <span style={{ fontSize: '32px' }}>
                {plan.countries?.flag_emoji || country?.flag_emoji || '🌍'}
              </span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '15px' }}>
                  {plan.countries?.name || country?.name}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>
                  {plan.plan_name} · {plan.data_gb}GB · {plan.validity_days} days
                </div>
                <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '16px' }}>
                  SGD {plan.price_sgd}
                </div>
              </div>
            </div>
          )}

          {/* Coming Soon */}
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🚀</div>
          <h1 className={styles.title}>Checkout Coming Soon</h1>
          <p className={styles.sub} style={{ marginBottom: '28px' }}>
            We're putting the finishing touches on our payment system.
            Leave your email and we'll notify you the moment we go live.
          </p>

          {submitted ? (
            <div style={{
              background: 'rgba(76,217,100,0.1)',
              border: '1px solid rgba(76,217,100,0.3)',
              borderRadius: '12px',
              padding: '16px',
              color: '#4cd964',
              fontWeight: 700,
              fontSize: '15px'
            }}>
              ✅ You're on the list! We'll email you at launch.
            </div>
          ) : (
            <form onSubmit={handleNotify} className={styles.form}>
              <div className={styles.field}>
                <label>Your Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className={styles.spinner}></span> : 'Notify Me at Launch →'}
              </button>
            </form>
          )}

          <button
            onClick={() => navigate('/plans')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              fontSize: '13px',
              marginTop: '20px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ← Back to Plans
          </button>

        </div>
      </main>
    </div>
  );
}