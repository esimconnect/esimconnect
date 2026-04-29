import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import styles from './Dashboard.module.css';
import { useLang } from '../lib/i18n';
import { subscribeToPush, unsubscribeFromPush, isPushSubscribed } from '../lib/pushNotifications';

export default function Dashboard() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [esims, setEsims] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview | referral | reseller
  const [resellerData, setResellerData] = useState(null);
  const [isReseller, setIsReseller] = useState(false);
  const [referralData, setReferralData] = useState(null);
  const [referralCopied, setReferralCopied] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setUser(user);
    await Promise.all([
      fetchProfile(user.id),
      fetchEsims(user.id),
      fetchOrders(user.id),
    ]);
    // Check current push subscription state
    const subscribed = await isPushSubscribed();
    setPushEnabled(subscribed);
    // Fetch referral + reseller data in parallel
    await Promise.all([fetchReferralData(), fetchResellerData()]);
    setLoading(false);
  };

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, wallet_balance, referral_code, referral_credit_earned')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  const fetchEsims = async (userId) => {
    const { data } = await supabase
      .from('esims')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setEsims(data);
  };

  const fetchOrders = async (userId) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setOrders(data);
  };

  const fetchReferralData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/referral/my-stats`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReferralData(data);
      }
    } catch (err) {
      console.error('fetchReferralData:', err.message);
    }
  };

  const fetchResellerData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/reseller/my-stats`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResellerData(data);
        setIsReseller(true);
      }
      // 403 = not a reseller, silently ignore
    } catch (err) {
      console.error('fetchResellerData:', err.message);
    }
  };

  const copyReferralCode = async () => {
    const code = referralData?.referral_code || profile?.referral_code;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(`https://esimconnect.world?ref=${code}`);
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2500);
    } catch {
      alert(`Your referral link: https://esimconnect.world?ref=${code}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handlePushToggle = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush(user.id);
        setPushEnabled(false);
      } else {
        await subscribeToPush(user.id);
        setPushEnabled(true);
      }
    } catch (err) {
      alert(err.message);
    }
    setPushLoading(false);
  };

  const activeEsims = esims.filter(e => e.status === 'active');

  const statusBadge = (status) => {
    const map = {
      active: { color: '#00c8ff', bg: 'rgba(0,200,255,0.1)' },
      expired: { color: '#888', bg: 'rgba(255,255,255,0.05)' },
      pending: { color: '#f5a623', bg: 'rgba(245,166,35,0.1)' },
      paid: { color: '#4cd964', bg: 'rgba(76,217,100,0.1)' },
    };
    const s = map[status] || map['pending'];
    const label = status === 'completed' ? t('status_completed')
      : status === 'pending' ? t('status_pending')
      : status === 'failed' ? t('status_failed')
      : status;
    return (
      <span style={{
        background: s.bg, color: s.color,
        padding: '2px 10px', borderRadius: '20px',
        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase'
      }}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Traveller';

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('dash_welcome')}, {firstName} 👋</h1>
            <p className={styles.email}>{user?.email}</p>
          </div>
          <button className={styles.signOutBtn} onClick={handleSignOut}>{t('nav_logout')}</button>
        </div>

        {/* Stats Grid */}
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📱</div>
            <div className={styles.cardTitle}>Active eSIMs</div>
            <div className={styles.cardValue}>{activeEsims.length}</div>
            <div className={styles.cardSub}>{esims.length} total purchased</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>💰</div>
            <div className={styles.cardTitle}>{t('wallet_title')}</div>
            <div className={styles.cardValue}>
              {t('sgd')} {parseFloat(profile?.wallet_balance ?? 0).toFixed(2)}
            </div>
            <div className={styles.cardSub}>{t('dash_balance')}</div>
            <button
              className={styles.topUpBtn}
              onClick={() => navigate('/wallet')}
            >
              + {t('dash_topup')}
            </button>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>{pushEnabled ? '🔔' : '🔕'}</div>
            <div className={styles.cardTitle}>Notifications</div>
            <div className={styles.cardValue} style={{ fontSize: '16px', marginTop: '8px' }}>
              {pushEnabled ? 'Enabled' : 'Disabled'}
            </div>
            <div className={styles.cardSub}>Order & wallet alerts</div>
            <button
              className={styles.topUpBtn}
              onClick={handlePushToggle}
              disabled={pushLoading}
              style={{
                background: pushEnabled
                  ? 'rgba(255,80,80,0.15)'
                  : 'rgba(0,200,255,0.15)',
                color: pushEnabled ? '#ff5050' : '#00c8ff',
                borderColor: pushEnabled ? '#ff5050' : '#00c8ff',
              }}
            >
              {pushLoading ? '...' : pushEnabled ? 'Turn Off' : 'Enable'}
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '32px',
          borderBottom: '1px solid var(--border)', paddingBottom: '0',
        }}>
          {['overview', 'referral', ...(isReseller ? ['reseller'] : [])].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
                fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '14px',
                padding: '10px 18px', cursor: 'pointer', textTransform: 'capitalize',
                transition: 'all .2s', marginBottom: '-1px',
              }}
            >
              {tab === 'overview' ? '📊 Overview'
                : tab === 'referral' ? '🔗 Referral'
                : '🏢 Reseller Portal'}
            </button>
          ))}
        </div>

        {/* ── REFERRAL TAB ── */}
        {activeTab === 'referral' && (() => {
          const refCode = referralData?.referral_code || profile?.referral_code;
          const shareUrl = refCode ? `https://esimconnect.world?ref=${refCode}` : null;
          return (
            <div style={{ marginBottom: '32px' }}>
              {/* Summary cards */}
              <div className={styles.grid} style={{ marginBottom: '24px' }}>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>👥</div>
                  <div className={styles.cardTitle}>Friends Referred</div>
                  <div className={styles.cardValue}>{referralData?.total_referrals ?? 0}</div>
                  <div className={styles.cardSub}>Unique sign-ups via your link</div>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>💳</div>
                  <div className={styles.cardTitle}>Credit Earned</div>
                  <div className={styles.cardValue}>SGD {parseFloat(referralData?.credit_earned_sgd ?? profile?.referral_credit_earned ?? 0).toFixed(2)}</div>
                  <div className={styles.cardSub}>SGD 2.00 per first purchase</div>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>🎟️</div>
                  <div className={styles.cardTitle}>Your Code</div>
                  <div className={styles.cardValue} style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
                    {refCode || '—'}
                  </div>
                  <div className={styles.cardSub}>Share to earn SGD 2 per referral</div>
                </div>
              </div>

              {/* Share link box */}
              {shareUrl && (
                <div style={{
                  background: 'rgba(0,200,255,0.05)',
                  border: '1px solid rgba(0,200,255,0.2)',
                  borderRadius: '16px', padding: '20px 24px',
                  marginBottom: '24px',
                }}>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', fontWeight: 600 }}>
                    🔗 YOUR REFERRAL LINK
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                  }}>
                    <div style={{
                      flex: 1, fontFamily: 'var(--font-mono)', fontSize: '13px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                      borderRadius: '10px', padding: '10px 14px', wordBreak: 'break-all',
                      color: 'var(--accent)',
                    }}>
                      {shareUrl}
                    </div>
                    <button
                      onClick={copyReferralCode}
                      style={{
                        background: referralCopied ? 'rgba(76,217,100,0.15)' : 'rgba(0,200,255,0.15)',
                        color: referralCopied ? '#4cd964' : 'var(--accent)',
                        border: `1px solid ${referralCopied ? '#4cd964' : 'rgba(0,200,255,0.4)'}`,
                        borderRadius: '10px', padding: '10px 20px',
                        fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                        whiteSpace: 'nowrap', transition: 'all .2s',
                      }}
                    >
                      {referralCopied ? '✓ Copied!' : '📋 Copy Link'}
                    </button>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted2)', marginTop: '12px' }}>
                    You earn <strong style={{ color: 'var(--accent)' }}>SGD 2.00</strong> wallet credit when a friend makes their first purchase using your link.
                  </div>
                </div>
              )}

              {/* Referred users list */}
              {referralData?.referred_users?.length > 0 ? (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>
                    Referred Friends
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {referralData.referred_users.map((u, i) => (
                      <div key={i} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px', padding: '12px 18px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div style={{ fontWeight: 600 }}>👤 {u.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          Joined {new Date(u.joined_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)',
                  borderRadius: '16px', padding: '40px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔗</div>
                  <div style={{ fontWeight: 700, marginBottom: '6px' }}>No referrals yet</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    Share your link above and earn SGD 2.00 for each friend who buys a plan.
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── RESELLER PORTAL TAB ── */}
        {activeTab === 'reseller' && isReseller && resellerData && (() => {
          const { reseller, stats, orders: resellerOrders } = resellerData;
          return (
            <div style={{ marginBottom: '32px' }}>
              {/* Summary cards */}
              <div className={styles.grid} style={{ marginBottom: '24px' }}>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>🛒</div>
                  <div className={styles.cardTitle}>Total Orders</div>
                  <div className={styles.cardValue}>{stats.total_orders}</div>
                  <div className={styles.cardSub}>Attributed to your code</div>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>💰</div>
                  <div className={styles.cardTitle}>Commission This Month</div>
                  <div className={styles.cardValue}>SGD {stats.month_commission_sgd}</div>
                  <div className={styles.cardSub}>{reseller.commission_pct}% commission rate</div>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>🏆</div>
                  <div className={styles.cardTitle}>Total Commission</div>
                  <div className={styles.cardValue}>SGD {stats.total_commission_sgd}</div>
                  <div className={styles.cardSub}>{stats.active_customers} active customers</div>
                </div>
              </div>

              {/* Share link */}
              <div style={{
                background: 'rgba(0,200,255,0.05)',
                border: '1px solid rgba(0,200,255,0.2)',
                borderRadius: '16px', padding: '20px 24px', marginBottom: '24px',
              }}>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', fontWeight: 600 }}>
                  🔗 YOUR RESELLER LINK — {reseller.code}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '13px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '10px 14px',
                  color: 'var(--accent)', wordBreak: 'break-all',
                }}>
                  {reseller.share_url}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted2)', marginTop: '10px' }}>
                  Share this link. Customers who purchase via your link are attributed to your account.
                </div>
              </div>

              {/* Orders table — read-only, anonymised */}
              {resellerOrders?.length > 0 ? (
                <div onContextMenu={e => e.preventDefault()}>
                  <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>
                    Attributed Orders
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%', borderCollapse: 'collapse',
                      fontSize: '13px', userSelect: 'none',
                    }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)', textAlign: 'left' }}>
                          {['Customer', 'Plan', 'Country', 'Price', 'Commission', 'Date', 'Type'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resellerOrders.map((o, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 600 }}>{o.customer_name}</td>
                            <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{o.package_title}</td>
                            <td style={{ padding: '10px 12px' }}>{o.country_name}</td>
                            <td style={{ padding: '10px 12px' }}>SGD {o.price_sgd}</td>
                            <td style={{ padding: '10px 12px', color: '#4cd964', fontWeight: 700 }}>SGD {o.commission_sgd}</td>
                            <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>
                              {new Date(o.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                background: o.is_new ? 'rgba(0,200,255,0.1)' : 'rgba(255,255,255,0.05)',
                                color: o.is_new ? 'var(--accent)' : 'var(--muted)',
                                padding: '2px 8px', borderRadius: '10px',
                                fontSize: '11px', fontWeight: 700,
                              }}>
                                {o.is_new ? 'New' : 'Return'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)',
                  borderRadius: '16px', padding: '40px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>📊</div>
                  <div style={{ fontWeight: 700, marginBottom: '6px' }}>No orders yet</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    Share your reseller link to start earning commission.
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── OVERVIEW TAB content below ── */}
        {activeTab === 'overview' && <>

        {/* Active eSIMs */}
        {esims.length > 0 ? (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
              My eSIMs
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {esims.map(esim => (
                <div key={esim.id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '28px' }}>{esim.country_flag || '🌍'}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{esim.country_name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{esim.plan_name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '2px' }}>{t('plans_data')}</div>
                      <div style={{ fontWeight: 700 }}>
                        {esim.is_unlimited ? '∞' : `${esim.data_remaining_gb ?? esim.data_total_gb}${t('gb')}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '2px' }}>Expires</div>
                      <div style={{ fontWeight: 700 }}>
                        {esim.expires_at ? new Date(esim.expires_at).toLocaleDateString() : '—'}
                      </div>
                    </div>
                    {statusBadge(esim.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Recent Orders */}
        {orders.length > 0 ? (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
              {t('dash_recent')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {orders.map(order => (
                <div key={order.id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>
                      {t('purchases_order')} #{order.order_code || '—'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontWeight: 700 }}>
                      {t('sgd')} {parseFloat(order.price_sgd || 0).toFixed(2)}
                    </div>
                    {statusBadge(order.status || 'pending')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Empty State */}
        {esims.length === 0 && orders.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🌍</div>
            <h3>Ready to travel?</h3>
            <p>{t('dash_no_orders')}</p>
            <button className={styles.browsePlansBtn} onClick={() => navigate('/plans')}>
              {t('home_cta_browse')} →
            </button>
          </div>
        )}

        </>}

      </main>
    </div>
  );
}
