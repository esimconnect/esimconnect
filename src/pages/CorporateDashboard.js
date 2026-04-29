import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import styles from './CorporateDashboard.module.css';

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function CorporateDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  // Auth + profile state
  const [userId, setUserId] = useState(null);
  const [corpId, setCorpId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dashboard data
  const [corp, setCorp] = useState(null);
  const [staff, setStaff] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalSpend, setTotalSpend] = useState('0.00');

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteError, setInviteError] = useState('');

  // ── Load user + profile ───────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('corp_id, corp_role, is_corporate')
        .eq('id', user.id)
        .single();

      if (!profile?.is_corporate || !profile?.corp_id || profile?.corp_role !== 'admin') {
        navigate('/dashboard');
        return;
      }
      setCorpId(profile.corp_id);
    })();
  }, [navigate]);

  // ── Fetch dashboard data ──────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    if (!corpId || !userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/corporate/dashboard?corp_id=${corpId}&user_id=${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCorp(data.corp);
      setStaff(data.staff || []);
      setPendingInvites(data.pending_invites || []);
      setOrders(data.orders || []);
      setTotalSpend(data.total_spend || '0.00');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [corpId, userId]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // ── Send invite ───────────────────────────────────────────────
  async function handleInvite(e) {
    e.preventDefault();
    setInviteMsg(''); setInviteError('');
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    try {
      const res = await fetch(`${BACKEND}/corporate/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corp_id: corpId, email: inviteEmail.trim(), invited_by_user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInviteMsg(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
      fetchDashboard();
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  }

  // ── CSV export ────────────────────────────────────────────────
  function exportCSV() {
    const rows = [
      ['Order Code', 'Staff Name', 'Country', 'Plan', 'Amount (SGD)', 'Status', 'Date'],
      ...orders.map(o => [
        o.order_code,
        o.customer_name || '—',
        o.country_name || '—',
        o.package_title || '—',
        o.price_sgd,
        o.status,
        new Date(o.created_at).toLocaleDateString('en-SG'),
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corp-orders-${corp?.company_name?.replace(/\s/g, '-') || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading && !corp) return <div className={styles.loading}>Loading…</div>;
  if (error) return <div className={styles.errorPage}>{error}</div>;
  if (!corp) return null;

  const isPending = corp.approval_status === 'pending';

  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div className={styles.page}>
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.corpName}>{corp.company_name}</div>
          <div className={styles.corpMeta}>Corporate Portal</div>
        </div>

        <nav className={styles.nav}>
          {[
            ['overview',  '📊', 'Overview'],
            ['staff',     '👥', 'Staff'],
            ['orders',    '📦', 'Orders'],
            ['wallet',    '💳', 'Wallet'],
          ].map(([id, icon, label]) => (
            <button
              key={id}
              className={`${styles.navBtn} ${tab === id ? styles.navActive : ''}`}
              onClick={() => setTab(id)}
            >
              <span className={styles.navIcon}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
          ← Back to My Account
        </button>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className={styles.main}>

        {/* ── Pending approval banner ─────────────────────────────── */}
        {isPending && (
          <div style={{
            background: '#fffbeb', border: '1.5px solid #f59e0b',
            borderRadius: '14px', padding: '18px 24px',
            marginBottom: '28px', display: 'flex', gap: '14px', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.95rem', marginBottom: '4px' }}>
                Account Pending Approval
              </div>
              <div style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5 }}>
                Your corporate account is currently under review. We aim to approve all applications
                within <strong>48 hours</strong>. You will receive an email confirmation once approved.
                You will not be able to top up the wallet or place orders until your account is approved.
              </div>
            </div>
          </div>
        )}

        {/* ══ OVERVIEW ══════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Overview</h2>

            <div className={styles.statsGrid}>
              {[
                { label: 'Corporate Wallet', value: `SGD ${parseFloat(corp.wallet_balance || 0).toFixed(2)}`, accent: true },
                { label: 'Total Staff', value: staff.length },
                { label: 'Total Orders', value: completedOrders.length },
                { label: 'Total Spend', value: `SGD ${totalSpend}` },
              ].map(({ label, value, accent }) => (
                <div key={label} className={`${styles.statCard} ${accent ? styles.accentCard : ''}`}>
                  <div className={styles.statValue}>{value}</div>
                  <div className={styles.statLabel}>{label}</div>
                </div>
              ))}
            </div>

            {/* Quick invite */}
            <div className={styles.quickInvite}>
              <h3 className={styles.subTitle}>Invite a Staff Member</h3>
              <form onSubmit={handleInvite} className={styles.inviteRow}>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="staff@company.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  required
                />
                <button type="submit" className={styles.primaryBtn} disabled={inviteLoading}>
                  {inviteLoading ? 'Sending…' : 'Send Invite'}
                </button>
              </form>
              {inviteMsg && <p className={styles.successMsg}>{inviteMsg}</p>}
              {inviteError && <p className={styles.errorMsg}>{inviteError}</p>}
            </div>

            {/* Pending invites */}
            {pendingInvites.length > 0 && (
              <div className={styles.pendingBox}>
                <h3 className={styles.subTitle}>Pending Invites ({pendingInvites.length})</h3>
                <div className={styles.pendingList}>
                  {pendingInvites.map(inv => (
                    <div key={inv.id} className={styles.pendingRow}>
                      <span className={styles.pendingEmail}>{inv.email}</span>
                      <span className={styles.pendingDate}>
                        Sent {new Date(inv.created_at).toLocaleDateString('en-SG')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ STAFF ════════════════════════════════════════════════ */}
        {tab === 'staff' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Staff Members</h2>
              <button className={styles.primaryBtn} onClick={() => setTab('overview')}>
                + Invite Staff
              </button>
            </div>

            {staff.length === 0 ? (
              <div className={styles.emptyState}>No staff members yet. Invite your first team member.</div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map(s => (
                      <tr key={s.id}>
                        <td>
                          <div className={styles.staffName}>{s.full_name || '—'}</div>
                        </td>
                        <td>
                          <span className={`${styles.roleBadge} ${s.corp_role === 'admin' ? styles.adminBadge : ''}`}>
                            {s.corp_role}
                          </span>
                        </td>
                        <td>{new Date(s.created_at).toLocaleDateString('en-SG')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ ORDERS ═══════════════════════════════════════════════ */}
        {tab === 'orders' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Staff Orders</h2>
              {orders.length > 0 && (
                <button className={styles.outlineBtn} onClick={exportCSV}>
                  ↓ Export CSV
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <div className={styles.emptyState}>No orders yet.</div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Staff</th>
                      <th>Plan</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td className={styles.mono}>{o.order_code}</td>
                        <td>{o.customer_name || '—'}</td>
                        <td>
                          <div className={styles.planCell}>
                            <span className={styles.planName}>{o.package_title}</span>
                            <span className={styles.planCountry}>{o.country_name}</span>
                          </div>
                        </td>
                        <td className={styles.amount}>SGD {parseFloat(o.price_sgd).toFixed(2)}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles[o.status]}`}>{o.status}</span>
                        </td>
                        <td>{new Date(o.created_at).toLocaleDateString('en-SG')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ WALLET ═══════════════════════════════════════════════ */}
        {tab === 'wallet' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Corporate Wallet</h2>
            <div className={styles.walletCard}>
              <div className={styles.walletLabel}>Available Balance</div>
              <div className={styles.walletBalance}>
                SGD {parseFloat(corp.wallet_balance || 0).toFixed(2)}
              </div>
              <p className={styles.walletNote}>
                Staff purchases are automatically deducted from this balance.
                Top up via bank transfer or contact us at{' '}
                <a href="mailto:hello@esimconnect.world">hello@esimconnect.world</a>.
              </p>
            </div>

            <div className={styles.walletStats}>
              <div className={styles.wStat}>
                <span className={styles.wStatVal}>SGD {totalSpend}</span>
                <span className={styles.wStatLabel}>Total Spent</span>
              </div>
              <div className={styles.wStat}>
                <span className={styles.wStatVal}>{completedOrders.length}</span>
                <span className={styles.wStatLabel}>Completed Orders</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
