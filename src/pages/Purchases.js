import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import styles from './Dashboard.module.css';
import { useLang } from '../lib/i18n';

export default function Purchases() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [esims, setEsims] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('esims');

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }
    setUser(user);
    await Promise.all([fetchEsims(user.id), fetchOrders(user.id)]);
    setLoading(false);
  };

  const fetchEsims = async (userId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setEsims(data.map(o => ({
      id: o.id,
      country_flag: null,
      country_name: o.country_name,
      plan_name: o.package_title,
      status: o.status || 'active',
      validity_days: o.validity_days,
      data_total_gb: parseFloat(o.data_amount) || null,
      data_used_gb: 0,
      data_remaining_gb: parseFloat(o.data_amount) || null,
      is_unlimited: o.data_amount === 'Unlimited',
      activated_at: o.created_at,
      expires_at: null,
      qr_code_url: o.qr_url,
      iccid: o.iccid,
    })));
  };

  const fetchOrders = async (userId) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const statusColor = (status) => {
    const map = {
      active: { color: '#00c8ff', bg: 'rgba(0,200,255,0.1)' },
      expired: { color: '#888', bg: 'rgba(255,255,255,0.05)' },
      pending: { color: '#f5a623', bg: 'rgba(245,166,35,0.1)' },
      paid: { color: '#4cd964', bg: 'rgba(76,217,100,0.1)' },
      failed: { color: '#ff6b6b', bg: 'rgba(255,80,80,0.1)' },
      completed: { color: '#4cd964', bg: 'rgba(76,217,100,0.1)' },
    };
    return map[status] || map['pending'];
  };

  const StatusBadge = ({ status }) => {
    const s = statusColor(status);
    const label = status === 'completed' ? t('status_completed')
      : status === 'pending' ? t('status_pending')
      : status === 'failed' ? t('status_failed')
      : status;
    return (
      <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
        {label}
      </span>
    );
  };

  const DataBar = ({ used, total, unlimited }) => {
    if (unlimited) return <div style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700 }}>Unlimited Data</div>;
    if (!total) return null;
    const pct = Math.min(100, ((used || 0) / total) * 100);
    const color = pct > 95 ? '#ff6b6b' : pct > 80 ? '#f5a623' : '#00c8ff';
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
          <span>{(used || 0).toFixed(1)}{t('gb')} used</span>
          <span>{total}{t('gb')} total</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: pct + '%', background: color, borderRadius: '3px', transition: 'width 0.3s' }}></div>
        </div>
      </div>
    );
  };

  if (loading) return <div className={styles.loadingPage}><div className={styles.spinner}></div></div>;

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('purchases_title')}</h1>
            <p style={{ fontSize: '14px', color: 'var(--muted)' }}>Your eSIMs and order history</p>
          </div>
          <button onClick={() => navigate('/plans')} style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            color: '#000', border: 'none', borderRadius: '12px', padding: '10px 22px',
            fontWeight: 800, fontSize: '14px', fontFamily: 'var(--font-head)', cursor: 'pointer'
          }}>+ {t('plans_buy')}</button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          {['esims', 'orders'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? 'rgba(0,200,255,0.1)' : 'rgba(255,255,255,0.04)',
              border: "1px solid " + (activeTab === tab ? 'rgba(0,200,255,0.3)' : 'var(--border)'),
              color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
              borderRadius: '10px', padding: '8px 20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer'
            }}>
              {tab === 'esims' ? `My eSIMs (${esims.length})` : `${t('purchases_order')}s (${orders.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'esims' && (
          esims.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📱</div>
              <h3>No eSIMs yet</h3>
              <p>{t('purchases_empty')}</p>
              <button className={styles.browsePlansBtn} onClick={() => navigate('/plans')}>{t('home_cta_browse')} →</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {esims.map(esim => (
                <div key={esim.id} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '36px' }}>{esim.country_flag || '🌍'}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '18px' }}>{esim.country_name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{esim.plan_name}</div>
                      </div>
                    </div>
                    <StatusBadge status={esim.status} />
                  </div>
                  <DataBar used={esim.data_used_gb} total={esim.data_total_gb} unlimited={esim.is_unlimited} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                    {[
                      { label: t('plans_validity'), value: esim.validity_days + ' ' + t('days') },
                      { label: 'Activated', value: esim.activated_at ? new Date(esim.activated_at).toLocaleDateString() : '—' },
                      { label: 'Expires', value: esim.expires_at ? new Date(esim.expires_at).toLocaleDateString() : '—' },
                      { label: 'Data Left', value: esim.is_unlimited ? '∞' : (esim.data_remaining_gb || 0).toFixed(1) + t('gb') },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {esim.qr_code_url && (
                    <div style={{
                      background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.15)',
                      borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap'
                    }}>
                      <img src={esim.qr_code_url} alt="eSIM QR Code"
                        style={{ width: '120px', height: '120px', borderRadius: '8px', background: '#fff', padding: '8px' }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '6px' }}>Install eSIM</div>
                        <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }}>
                          Scan this QR code in Settings - Mobile Data - Add eSIM
                        </div>
                        <a href={esim.qr_code_url} download style={{
                          background: 'rgba(0,200,255,0.1)', border: '1px solid rgba(0,200,255,0.25)',
                          color: 'var(--accent)', borderRadius: '8px', padding: '7px 16px',
                          fontSize: '12px', fontWeight: 700, textDecoration: 'none'
                        }}>Download QR</a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'orders' && (
          orders.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🧾</div>
              <h3>No orders yet</h3>
              <p>{t('purchases_empty')}</p>
              <button className={styles.browsePlansBtn} onClick={() => navigate('/plans')}>{t('home_cta_browse')} →</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.map(order => (
                <div key={order.id} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  borderRadius: '16px', padding: '20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{t('purchases_order')} {order.order_code || '—'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                      {new Date(order.created_at).toLocaleDateString()} · {order.payment_method || 'Card'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '16px' }}>{t('sgd')} {parseFloat(order.price_sgd || 0).toFixed(2)}</div>
                    </div>
                    <StatusBadge status={order.status || 'completed'} />
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </main>
    </div>
  );
}
