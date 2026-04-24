import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import styles from './Auth.module.css';
import { useLang } from '../lib/i18n';

export default function FindMyOrder() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login?redirect=/find-order');
      return;
    }
    setUser(user);
    await fetchOrders(user.email);
    setLoading(false);
  };

  const fetchOrders = async (email) => {
    const { data, error: dbError } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', email.toLowerCase().trim())
      .order('created_at', { ascending: false });

    if (dbError) {
      setError(t('error'));
    } else {
      setOrders(data || []);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <div className={styles.spinner}></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card} style={{ maxWidth: '520px' }}>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
            <h1 className={styles.title}>{t('find_title')}</h1>
            <p className={styles.sub} style={{ fontSize: '13px' }}>
              Showing orders for <strong>{user?.email}</strong>
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)',
              borderRadius: '10px', padding: '12px 16px', color: '#ff3b30',
              fontSize: '13px', marginBottom: '16px', textAlign: 'center',
            }}>{error}</div>
          )}

          {orders.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 20px',
              background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛒</div>
              <div style={{ fontWeight: 700, marginBottom: '8px' }}>{t('find_not_found')}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>
                No orders found for this account yet.
              </div>
              <button onClick={() => navigate('/plans')} style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                border: 'none', borderRadius: '10px', padding: '12px 24px',
                color: '#000', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
              }}>{t('home_cta_browse')} →</button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', textAlign: 'center' }}>
                Found <strong style={{ color: 'var(--accent)' }}>{orders.length}</strong> order{orders.length !== 1 ? 's' : ''}
              </div>

              {orders.map((order, i) => (
                <div key={i} style={{
                  background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.2)',
                  borderRadius: '14px', padding: '16px 20px', marginBottom: '14px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>
                        🌍 {order.country_name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {order.package_title} · {order.data_amount} · {order.validity_days} {t('days')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                        {t('confirm_order')}: {order.order_code} · {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '14px' }}>
                        {t('sgd')} {parseFloat(order.price_sgd || 0).toFixed(2)}
                      </div>
                      <span style={{
                        background: 'rgba(76,217,100,0.1)', color: '#4cd964',
                        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                      }}>
                        {(order.status === 'completed' ? t('status_completed') : order.status || t('status_completed')).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {order.qr_url && (
                    <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
                      <img src={order.qr_url} alt="eSIM QR Code"
                        style={{ width: '150px', height: '150px', borderRadius: '10px', background: '#fff', padding: '8px' }} />
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
                        {t('confirm_qr')}
                      </div>
                      {order.iccid && (
                        <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'monospace', marginTop: '4px' }}>
                          {t('confirm_iccid')}: {order.iccid}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            <button onClick={() => navigate('/purchases')} style={{
              background: 'rgba(0,200,255,0.1)', border: '1px solid rgba(0,200,255,0.3)',
              borderRadius: '12px', padding: '12px', color: 'var(--accent)',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            }}>{t('purchases_title')} →</button>
            <button onClick={() => navigate('/plans')} style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px', padding: '12px', color: 'inherit',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
            }}>{t('home_cta_browse')}</button>
          </div>

        </div>
      </main>
    </div>
  );
}
