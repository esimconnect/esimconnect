import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import styles from './Dashboard.module.css';
import { useLang } from '../lib/i18n';

export default function Dashboard() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [esims, setEsims] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  };

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, wallet_balance')
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
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
        </div>

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

      </main>
    </div>
  );
}
