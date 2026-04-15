import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import styles from './Wallet.module.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const TOP_UP_AMOUNTS = [10, 20, 50, 100, 'Other'];

function TopUpForm({ userId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState(20);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finalAmount = custom ? parseFloat(custom) : amount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!finalAmount || finalAmount < 5) {
      setError('Minimum top-up is SGD 5.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(finalAmount * 100), currency: 'sgd' }),
      });
      const { clientSecret, error: backendError } = await res.json();
      if (backendError) throw new Error(backendError);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (stripeError) throw new Error(stripeError.message);

      if (paymentIntent.status === 'succeeded') {
        await supabase.from('wallet_topups').insert({
          user_id: userId,
          amount_sgd: finalAmount,
          stripe_payment_intent_id: paymentIntent.id,
          status: 'succeeded',
        });

        const { data: profile } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', userId)
          .single();

        await supabase
          .from('profiles')
          .update({ wallet_balance: (profile.wallet_balance || 0) + finalAmount })
          .eq('id', userId);

        onSuccess(finalAmount);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.amountGrid}>
        {TOP_UP_AMOUNTS.map(a => (
          <button
            key={a}
            type="button"
            className={`${styles.amountBtn} ${
              a === 'Other'
                ? custom ? styles.amountBtnActive : ''
                : amount === a && !custom ? styles.amountBtnActive : ''
            }`}
            onClick={() => {
              if (a === 'Other') {
                setAmount(0);
                setCustom('');
                setTimeout(() => document.getElementById('customAmount')?.focus(), 100);
              } else {
                setAmount(a);
                setCustom('');
              }
            }}
          >
            {a === 'Other' ? 'Other' : `SGD ${a}`}
          </button>
        ))}
      </div>

      <div className={styles.customWrap}>
        <label className={styles.label}>Or enter custom amount (SGD)</label>
        <input
          id="customAmount"
          type="number"
          min="5"
          max="1000"
          placeholder="e.g. 35"
          value={custom}
          onChange={e => { setCustom(e.target.value); setAmount(0); }}
          className={styles.input}
        />
      </div>

      <div className={styles.cardWrap}>
        <label className={styles.label}>Card Details</label>
        <div className={styles.cardElement}>
          <CardElement options={{
            style: {
              base: {
                color: '#ffffff',
                fontSize: '16px',
                '::placeholder': { color: '#666' },
              },
              invalid: { color: '#ff4d4d' },
            }
          }} />
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button
        type="submit"
        disabled={loading || !stripe}
        className={styles.payBtn}
      >
        {loading ? 'Processing...' : `Top Up SGD ${finalAmount || '—'}`}
      </button>
    </form>
  );
}

export default function Wallet() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [topups, setTopups] = useState([]);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }
    setUser(user);

    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();
    if (profile) setBalance(profile.wallet_balance || 0);

    const { data: history } = await supabase
      .from('wallet_topups')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (history) setTopups(history);

    setLoading(false);
  };

  const handleSuccess = (amount) => {
    setSuccess(amount);
    setBalance(prev => prev + amount);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main className={styles.main}>

        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>

        <h1 className={styles.title}>eWallet</h1>

        {/* Balance Card */}
        <div className={styles.balanceCard}>
          <div className={styles.balanceLabel}>Current Balance</div>
          <div className={styles.balanceAmount}>SGD {parseFloat(balance).toFixed(2)}</div>
          <div className={styles.balanceSub}>Used for VoIP calls and data top-ups</div>
        </div>

        {/* Success Banner */}
        {success && (
          <div className={styles.successBanner}>
            ✅ SGD {success.toFixed(2)} added to your wallet successfully!
          </div>
        )}

        {/* Top Up Form */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Top Up Balance</h2>
          <Elements stripe={stripePromise}>
            <TopUpForm userId={user?.id} onSuccess={handleSuccess} />
          </Elements>
        </div>

        {/* Top-up History */}
        {topups.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Top-up History</h2>
            <div className={styles.historyList}>
              {topups.map(t => (
                <div key={t.id} className={styles.historyRow}>
                  <div>
                    <div className={styles.historyAmount}>+ SGD {parseFloat(t.amount_sgd).toFixed(2)}</div>
                    <div className={styles.historyDate}>{new Date(t.created_at).toLocaleDateString()}</div>
                  </div>
                  <span className={`${styles.badge} ${t.status === 'succeeded' ? styles.badgeGreen : styles.badgeGrey}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
