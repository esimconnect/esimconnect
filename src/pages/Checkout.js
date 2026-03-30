import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import styles from './Auth.module.css';
import AffiliateBar from '../components/AffiliateBar';

const WORKER_URL = 'https://claude-proxy.davidlimyk.workers.dev';

const MOCK_COUNTRIES = [
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
];

const STEP_LABELS = ['Details', 'Add-ons', 'Cart', 'Payment', 'Success'];

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const plan = state?.plan;
  const country = state?.country;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);

  // Step 1 — Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Step 2 — Add-ons
  const [cart, setCart] = useState([]);
  const [extraCountry, setExtraCountry] = useState('');
  const [extraPlans, setExtraPlans] = useState([]);
  const [loadingExtra, setLoadingExtra] = useState(false);
  const [virtualNumber, setVirtualNumber] = useState(false);

  // Step 4 — Payment
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Pre-fill if logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setEmail(data.user.email || '');
        setName(data.user.user_metadata?.full_name || '');
      }
    });
  }, []);

  // Init cart with original plan
  useEffect(() => {
    if (plan && country) {
      setCart([{ ...plan, country, cartId: 'main' }]);
    }
  }, []);

  if (!plan) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.card} style={{ maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ marginBottom: '12px' }}>No plan selected</h2>
            <button className={styles.submitBtn} onClick={() => navigate('/plans')}>← Browse Plans</button>
          </div>
        </main>
      </div>
    );
  }

  const cartTotal = cart.reduce((sum, item) => {
    if (item.cartId === 'virtual') return sum + 5.00;
    return sum + parseFloat(item.price_sgd || 0);
  }, 0);

  const fetchExtraPlans = async (code) => {
    if (!code) return;
    setLoadingExtra(true);
    try {
      const res = await fetch(`${WORKER_URL}/airalo/packages?country=${code}`);
      const json = await res.json();
      if (json.data?.[0]?.operators?.[0]?.packages) {
        const countryMeta = MOCK_COUNTRIES.find(c => c.code === code);
        setExtraPlans(json.data[0].operators[0].packages.map(pkg => ({
          ...pkg,
          plan_name: pkg.title,
          data_gb: (pkg.amount / 1024).toFixed(0),
          validity_days: pkg.day,
          price_sgd: (pkg.price * 1.35).toFixed(2),
          country_code: code,
          country: countryMeta,
        })));
      }
    } catch (e) {
      setExtraPlans([]);
    }
    setLoadingExtra(false);
  };

  const addToCart = (item) => {
    const cartId = item.id + '-' + Date.now();
    setCart(prev => [...prev, { ...item, cartId }]);
  };

  const removeFromCart = (cartId) => {
    if (cartId === 'virtual') setVirtualNumber(false);
    setCart(prev => prev.filter(i => i.cartId !== cartId));
  };

  const toggleVirtualNumber = () => {
    if (virtualNumber) {
      setVirtualNumber(false);
      setCart(prev => prev.filter(i => i.cartId !== 'virtual'));
    } else {
      setVirtualNumber(true);
      setCart(prev => [...prev, {
        cartId: 'virtual',
        plan_name: 'Virtual Number',
        data_gb: null,
        validity_days: 30,
        price_sgd: '5.00',
        country: { flag: '📱', name: 'Virtual' },
        isVirtual: true,
      }]);
    }
  };

  const handleDetailsNext = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !agreedToTerms) return;
    setStep(1);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 16 || cardExpiry.length < 5 || cardCvc.length < 3 || !cardName.trim()) {
      setError('Please fill in all card details.');
      return;
    }
    setError(null);
    handleConfirmOrder();
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = 'EC-' + Date.now();
      const results = [];

      for (const item of cart) {
        if (item.isVirtual) {
          results.push({
            order_code: 'VN-' + Date.now(),
            isVirtual: true,
            plan_name: 'Virtual Number',
            country: { name: 'Virtual', flag: '📱' },
          });
          continue;
        }

        const res = await fetch(`${WORKER_URL}/airalo/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            package_id: item.id,
            user_email: email,
            user_name: name,
          }),
        });
        const json = await res.json();
        if (!json.data) throw new Error('Order failed for ' + item.plan_name);

        const o = json.data;

        await supabase.from('orders').insert({
          user_id: user?.id || null,
          package_id: item.id,
          package_title: item.plan_name,
          country_code: item.country_code || item.country?.iso_code || item.country?.code,
          country_name: item.country?.name,
          validity_days: item.validity_days,
          data_amount: item.data_gb + ' GB',
          price_sgd: item.price_sgd,
          order_code: o.order_code,
          iccid: o.iccid,
          qr_code: o.qr_code,
          qr_url: o.qr_url,
          customer_email: email,
          customer_name: name,
          session_id: sessionId,
          status: 'completed',
        });

        results.push({ ...o, plan_name: item.plan_name, country: item.country });
      }

      setOrders(results);
      setStep(4);
    } catch (err) {
      setError('Something went wrong: ' + err.message);
    }
    setLoading(false);
  };

  const formatCard = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');

  const formatExpiry = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    return cleaned.length >= 3 ? cleaned.slice(0, 2) + '/' + cleaned.slice(2) : cleaned;
  };

  const StepIndicator = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '28px' }}>
      {STEP_LABELS.slice(0, 4).map((label, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: i <= step ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
              color: i <= step ? '#000' : 'var(--muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700,
            }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '10px', color: i === step ? 'var(--accent)' : 'var(--muted)', fontWeight: i === step ? 700 : 400 }}>
              {label}
            </span>
          </div>
          {i < 3 && <div style={{ width: '20px', height: '1px', background: i < step ? 'var(--accent)' : 'rgba(255,255,255,0.15)', marginBottom: '14px' }} />}
        </React.Fragment>
      ))}
    </div>
  );

  const CartItemRow = ({ item }) => (
    <div style={{
      background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.2)',
      borderRadius: '12px', padding: '12px 16px', display: 'flex',
      alignItems: 'center', gap: '12px', marginBottom: '10px',
    }}>
      <span style={{ fontSize: '24px' }}>{item.country?.flag || item.country?.flag_emoji || '🌍'}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.country?.name}</div>
        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
          {item.isVirtual ? 'Virtual Number · 30 days' : `${item.plan_name} · ${item.data_gb}GB · ${item.validity_days} days`}
        </div>
      </div>
      <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '14px', marginRight: '6px' }}>
        SGD {item.isVirtual ? '5.00' : item.price_sgd}
      </div>
      <button onClick={() => removeFromCart(item.cartId)} style={{
        background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)',
        borderRadius: '8px', color: '#ff3b30', width: '28px', height: '28px',
        cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>✕</button>
    </div>
  );

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card} style={{ maxWidth: '520px' }}>

          {step < 4 && <StepIndicator />}

          {/* ── STEP 0: DETAILS ── */}
          {step === 0 && (
            <>
              <h2 style={{ marginBottom: '6px', fontWeight: 800 }}>Your Details</h2>
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px' }}>
                We'll send your eSIM QR code to this email.
              </p>
              <CartItemRow item={cart[0] || { ...plan, country, cartId: 'main' }} />
              <form onSubmit={handleDetailsNext} className={styles.form} style={{ marginTop: '20px' }}>
                <div className={styles.field}>
                  <label>Full Name</label>
                  <input type="text" placeholder="John Smith" value={name}
                    onChange={e => setName(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label>Email Address</label>
                  <input type="email" placeholder="your@email.com" value={email}
                    onChange={e => setEmail(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '8px 0 20px' }}>
                  <input type="checkbox" id="terms" checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    style={{ marginTop: '3px', accentColor: 'var(--accent)', width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }} />
                  <label htmlFor="terms" style={{ fontSize: '13px', color: 'var(--muted)', cursor: 'pointer', lineHeight: 1.5 }}>
                    I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Terms & Conditions</a>
                  </label>
                </div>
                <button type="submit" className={styles.submitBtn}
                  disabled={!name || !email || !agreedToTerms}
                  style={{ opacity: name && email && agreedToTerms ? 1 : 0.5 }}>
                  Continue to Add-ons →
                </button>
              </form>
            </>
          )}

          {/* ── STEP 1: ADD-ONS ── */}
          {step === 1 && (
            <>
              <h2 style={{ marginBottom: '6px', fontWeight: 800 }}>Enhance Your Trip</h2>
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '24px' }}>
                Optional extras — skip to continue.
              </p>

              {/* Extra eSIM */}
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px', padding: '16px', marginBottom: '14px',
              }}>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>📶 Add Another eSIM Plan</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>Visiting multiple countries?</div>
                <select
                  style={{
                    width: '100%', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px', padding: '10px 12px', color: '#ffffff', fontSize: '14px', marginBottom: '10px',
                  }}
                  value={extraCountry}
                  onChange={e => { setExtraCountry(e.target.value); fetchExtraPlans(e.target.value); }}
                >
                  <option value="">Select a country...</option>
                  {MOCK_COUNTRIES
                    .filter(c => !cart.some(ci => (ci.country_code || ci.country?.code) === c.code))
                    .map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                </select>
                {loadingExtra && <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Loading plans...</div>}
                {extraPlans.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {extraPlans.map(pkg => (
                      <div key={pkg.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.15)',
                        borderRadius: '10px', padding: '10px 14px',
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{pkg.plan_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{pkg.data_gb}GB · {pkg.validity_days} days</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '13px' }}>SGD {pkg.price_sgd}</span>
                          <button
                            onClick={() => { addToCart(pkg); setExtraPlans([]); setExtraCountry(''); }}
                            style={{
                              background: 'var(--accent)', border: 'none', borderRadius: '8px',
                              color: '#000', fontWeight: 700, fontSize: '12px', padding: '6px 12px', cursor: 'pointer',
                            }}>Add</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Virtual Number */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${virtualNumber ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '14px', padding: '16px', marginBottom: '14px', cursor: 'pointer',
                }}
                onClick={toggleVirtualNumber}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>📱 Virtual Number</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Calls & SMS while abroad · SGD 5.00/month</div>
                    <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px' }}>Coming Soon — Reserve yours</div>
                  </div>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                    background: virtualNumber ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                    border: '2px solid ' + (virtualNumber ? 'var(--accent)' : 'rgba(255,255,255,0.2)'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#000', fontWeight: 700, fontSize: '14px',
                  }}>
                    {virtualNumber ? '✓' : ''}
                  </div>
                </div>
              </div>

              {/* Hotel Affiliate */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,180,0,0.08), rgba(255,100,0,0.08))',
                border: '1px solid rgba(255,180,0,0.2)',
                borderRadius: '14px', padding: '16px', marginBottom: '24px',
              }}>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>🏨 Find Hotels for Your Trip</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
                  Compare thousands of hotels, guesthouses and apartments.
                </div>
                <a href="https://www.booking.com" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-block', background: 'rgba(255,180,0,0.15)',
                    border: '1px solid rgba(255,180,0,0.3)', borderRadius: '8px',
                    padding: '8px 16px', color: '#ffb400', fontWeight: 700,
                    fontSize: '13px', textDecoration: 'none',
                  }}>
                  Browse Hotels on Booking.com →
                </a>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(0)} style={{
                  flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px', padding: '14px', color: 'inherit', fontWeight: 600,
                  fontSize: '14px', cursor: 'pointer',
                }}>← Back</button>
                <button onClick={() => setStep(2)} className={styles.submitBtn} style={{ flex: 2 }}>
                  Review Cart ({cart.length} item{cart.length !== 1 ? 's' : ''}) →
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: CART REVIEW ── */}
          {step === 2 && (
            <>
              <h2 style={{ marginBottom: '6px', fontWeight: 800 }}>Your Cart</h2>
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '24px' }}>
                Review your items — tap ✕ to remove any.
              </p>

              {cart.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '32px', color: 'var(--muted)',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '14px', marginBottom: '24px',
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛒</div>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>Your cart is empty</div>
                  <div style={{ fontSize: '13px' }}>Go back to add plans</div>
                </div>
              ) : (
                <>
                  {cart.map(item => <CartItemRow key={item.cartId} item={item} />)}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px',
                    marginTop: '4px', marginBottom: '24px',
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>Total</span>
                    <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '20px' }}>
                      SGD {cartTotal.toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(1)} style={{
                  flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px', padding: '14px', color: 'inherit', fontWeight: 600,
                  fontSize: '14px', cursor: 'pointer',
                }}>← Back</button>
                <button
                  onClick={() => setStep(3)}
                  className={styles.submitBtn}
                  style={{ flex: 2, opacity: cart.length === 0 ? 0.4 : 1 }}
                  disabled={cart.length === 0}>
                  Proceed to Payment →
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: PAYMENT ── */}
          {step === 3 && (
            <>
              <h2 style={{ marginBottom: '6px', fontWeight: 800 }}>Payment</h2>
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '24px' }}>
                Total: <strong style={{ color: 'var(--accent)' }}>SGD {cartTotal.toFixed(2)}</strong>
              </p>

              {error && (
                <div style={{
                  background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)',
                  borderRadius: '10px', padding: '12px 16px', color: '#ff3b30',
                  fontSize: '13px', marginBottom: '16px',
                }}>{error}</div>
              )}

              <form onSubmit={handlePaymentSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label>Name on Card</label>
                  <input type="text" placeholder="John Smith" value={cardName}
                    onChange={e => setCardName(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label>Card Number</label>
                  <input type="text" placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCard(e.target.value))}
                    maxLength={19} required />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label>Expiry</label>
                    <input type="text" placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                      maxLength={5} required />
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label>CVC</label>
                    <input type="text" placeholder="123"
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      maxLength={3} required />
                  </div>
                </div>
                <div style={{
                  background: 'rgba(76,217,100,0.07)', border: '1px solid rgba(76,217,100,0.2)',
                  borderRadius: '10px', padding: '10px 14px', fontSize: '12px',
                  color: '#4cd964', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  🔒 Payments are encrypted and secure
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setStep(2)} style={{
                    flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px', padding: '14px', color: 'inherit', fontWeight: 600,
                    fontSize: '14px', cursor: 'pointer',
                  }}>← Back</button>
                  <button type="submit" className={styles.submitBtn} style={{ flex: 2 }} disabled={loading}>
                    {loading
                      ? <span className={styles.spinner}></span>
                      : `Get My eSIM · SGD ${cartTotal.toFixed(2)} →`}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── STEP 4: SUCCESS ── */}
          {step === 4 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '56px', marginBottom: '12px' }}>🎉</div>
                <h2 style={{ fontWeight: 800, marginBottom: '8px' }}>You're all set!</h2>

        {/* ── Affiliate partners ── */}
        <AffiliateBar context="success" />                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                  Your eSIM QR code(s) have been sent to <strong>{email}</strong>
                </p>
              </div>

              {orders.map((o, i) => (
                <div key={i} style={{
                  background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.2)',
                  borderRadius: '14px', padding: '16px 20px', marginBottom: '14px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>
                        {o.country?.flag || o.country?.flag_emoji || '🌍'} {o.plan_name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Order: {o.order_code}</div>
                    </div>
                    {!o.isVirtual && o.iccid && (
                      <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'monospace', textAlign: 'right', maxWidth: '140px', wordBreak: 'break-all' }}>
                        {o.iccid}
                      </div>
                    )}
                  </div>
                  {o.isVirtual ? (
                    <div style={{
                      background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.2)',
                      borderRadius: '10px', padding: '12px', textAlign: 'center',
                      color: '#ffb400', fontSize: '13px', fontWeight: 600,
                    }}>
                      📱 Virtual Number reserved — we'll contact you at launch!
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <img
                        src={o.qr_url}
                        alt="eSIM QR Code"
                        style={{ width: '160px', height: '160px', borderRadius: '12px', background: '#fff', padding: '8px' }}
                      />
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
                        Scan with your device camera to install eSIM
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Register nudge for guests */}
              {!user && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0,200,255,0.08), rgba(123,47,255,0.08))',
                  border: '1px solid rgba(0,200,255,0.25)',
                  borderRadius: '16px', padding: '20px', marginBottom: '16px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔐</div>
                  <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '6px' }}>Save your eSIM forever</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                    Create a free account to re-download your QR codes anytime, track orders, and get 5 free itinerary searches.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button onClick={() => navigate('/register')} style={{
                      background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                      border: 'none', borderRadius: '10px', padding: '12px',
                      color: '#000', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
                    }}>Create Free Account →</button>
                    <button onClick={() => navigate('/login')} style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px', padding: '10px', color: 'inherit',
                      fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                    }}>Already have an account? Sign In</button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                <button className={styles.submitBtn} onClick={() => navigate('/purchases')}>
                  View My Purchases →
                </button>
                <button onClick={() => navigate('/itinerary')} style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px', padding: '14px', color: 'inherit',
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}>
                  Back to Itinerary Planner
                </button>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
