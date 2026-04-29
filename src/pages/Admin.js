import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import styles from './Admin.module.css';

const BACKEND = process.env.REACT_APP_BACKEND_URL;
const TABS = ['Orders', 'Users', 'Wallet Top-ups', 'Usage Logs', 'Resellers', 'Reseller Sales', 'Analytics', 'Corporate'];

// ── Country list for reseller form ───────────────────────────────────────────
const COUNTRIES = [
  { iso: 'AU', name: 'Australia' }, { iso: 'BD', name: 'Bangladesh' },
  { iso: 'BR', name: 'Brazil' },    { iso: 'KH', name: 'Cambodia' },
  { iso: 'CA', name: 'Canada' },    { iso: 'CN', name: 'China' },
  { iso: 'EG', name: 'Egypt' },     { iso: 'FR', name: 'France' },
  { iso: 'DE', name: 'Germany' },   { iso: 'HK', name: 'Hong Kong' },
  { iso: 'IN', name: 'India' },     { iso: 'ID', name: 'Indonesia' },
  { iso: 'JP', name: 'Japan' },     { iso: 'KE', name: 'Kenya' },
  { iso: 'KR', name: 'South Korea' },{ iso: 'MY', name: 'Malaysia' },
  { iso: 'MX', name: 'Mexico' },    { iso: 'NL', name: 'Netherlands' },
  { iso: 'NZ', name: 'New Zealand' },{ iso: 'NG', name: 'Nigeria' },
  { iso: 'PK', name: 'Pakistan' },  { iso: 'PH', name: 'Philippines' },
  { iso: 'SG', name: 'Singapore' }, { iso: 'ZA', name: 'South Africa' },
  { iso: 'ES', name: 'Spain' },     { iso: 'LK', name: 'Sri Lanka' },
  { iso: 'TW', name: 'Taiwan' },    { iso: 'TH', name: 'Thailand' },
  { iso: 'AE', name: 'UAE' },       { iso: 'GB', name: 'United Kingdom' },
  { iso: 'US', name: 'United States' },{ iso: 'VN', name: 'Vietnam' },
];

// ── Helper: get auth token ────────────────────────────────────────────────────
async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

// ── Helper: API call with admin token ────────────────────────────────────────
async function adminFetch(path, options = {}) {
  const token = await getToken();
  const res = await fetch(`${BACKEND}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div className={styles.statCard} style={{ borderTopColor: accent }}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    completed: styles.badgeGreen,
    succeeded: styles.badgeGreen,
    pending:   styles.badgeAmber,
    failed:    styles.badgeRed,
    active:    styles.badgeGreen,
    inactive:  styles.badgeGrey,
    gifted:    styles.badgeCyan,
  };
  return <span className={`${styles.badge} ${map[status] || styles.badgeGrey}`}>{status}</span>;
}

// ═══════════════════════════════════════════════════════════════
// ORDERS TAB
// ═══════════════════════════════════════════════════════════════
function OrdersTab() {
  const [orders, setOrders]     = useState([]);
  const [filter, setFilter]     = useState('all');
  const [loading, setLoading]   = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    adminFetch('/admin/orders')
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const saveStatus = async (id) => {
    try {
      await adminFetch(`/admin/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: editStatus }),
      });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: editStatus } : o));
      setEditingId(null);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((s, o) => s + parseFloat(o.price_sgd || 0), 0);

  if (loading) return <div className={styles.loading}>Loading orders…</div>;

  return (
    <div>
      <div className={styles.tabHeader}>
        <div className={styles.filterRow}>
          {['all', 'completed', 'pending', 'failed'].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter(f)}
            >{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        <div className={styles.tabMeta}>
          {filtered.length} orders · SGD {totalRevenue.toFixed(2)} revenue
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order Code</th><th>Customer</th><th>Country</th>
              <th>Plan</th><th>Price</th><th>Method</th>
              <th>Reseller</th><th>Status</th><th>Date</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id}>
                <td><code>{o.order_code}</code></td>
                <td>
                  <div className={styles.cellPrimary}>{o.customer_name || '—'}</div>
                  <div className={styles.cellSub}>{o.customer_email || o.guest_email || '—'}</div>
                </td>
                <td>{o.country_name}</td>
                <td>
                  <div className={styles.cellPrimary}>{o.package_title}</div>
                  <div className={styles.cellSub}>{o.data_amount} · {o.validity_days}d</div>
                </td>
                <td>SGD {parseFloat(o.price_sgd || 0).toFixed(2)}</td>
                <td><Badge status={o.payment_method || 'card'} /></td>
                <td>{o.reseller_code ? <code className={styles.resellerCode}>{o.reseller_code}</code> : '—'}</td>
                <td>
                  {editingId === o.id ? (
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value)}
                      className={styles.inlineSelect}
                    >
                      <option value="completed">completed</option>
                      <option value="pending">pending</option>
                      <option value="failed">failed</option>
                    </select>
                  ) : (
                    <Badge status={o.status} />
                  )}
                </td>
                <td className={styles.cellSub}>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  {editingId === o.id ? (
                    <div className={styles.actionRow}>
                      <button className={styles.btnSave} onClick={() => saveStatus(o.id)}>Save</button>
                      <button className={styles.btnCancel} onClick={() => setEditingId(null)}>✕</button>
                    </div>
                  ) : (
                    <button className={styles.btnEdit} onClick={() => { setEditingId(o.id); setEditStatus(o.status); }}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════
function UsersTab() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null);
  const [creditAmt, setCreditAmt] = useState('');
  const [giftForm, setGiftForm] = useState({ country_name: '', package_title: '', data_amount: '', validity_days: '', price_sgd: '0' });
  const [busy, setBusy]         = useState(false);
  const [toast, setToast]       = useState('');

  useEffect(() => {
    adminFetch('/admin/users')
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email     || '').toLowerCase().includes(search.toLowerCase())
  );

  const addCredits = async () => {
    if (!creditAmt || isNaN(creditAmt) || parseFloat(creditAmt) <= 0) return alert('Enter a valid amount');
    setBusy(true);
    try {
      await adminFetch('/admin/add-credits', {
        method: 'POST',
        body: JSON.stringify({ user_id: modal.user.id, amount: parseFloat(creditAmt) }),
      });
      setUsers(prev => prev.map(u =>
        u.id === modal.user.id
          ? { ...u, wallet_balance: (parseFloat(u.wallet_balance || 0) + parseFloat(creditAmt)).toFixed(2) }
          : u
      ));
      showToast(`SGD ${creditAmt} added to ${modal.user.full_name || modal.user.email}`);
      setModal(null); setCreditAmt('');
    } catch (err) { alert('Error: ' + err.message); }
    setBusy(false);
  };

  const giftPlan = async () => {
    if (!giftForm.package_title || !giftForm.country_name) return alert('Fill in country and plan title');
    setBusy(true);
    try {
      await adminFetch('/admin/gift-plan', {
        method: 'POST',
        body: JSON.stringify({
          user_id:        modal.user.id,
          customer_email: modal.user.email,
          customer_name:  modal.user.full_name,
          ...giftForm,
        }),
      });
      showToast(`Free plan gifted to ${modal.user.full_name || modal.user.email}`);
      setModal(null);
      setGiftForm({ country_name: '', package_title: '', data_amount: '', validity_days: '', price_sgd: '0' });
    } catch (err) { alert('Error: ' + err.message); }
    setBusy(false);
  };

  const resetPassword = async () => {
    setBusy(true);
    try {
      await adminFetch('/admin/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email: modal.user.email }),
      });
      showToast(`Password reset email sent to ${modal.user.email}`);
      setModal(null);
    } catch (err) { alert('Error: ' + err.message); }
    setBusy(false);
  };

  if (loading) return <div className={styles.loading}>Loading users…</div>;

  return (
    <div>
      {toast && <div className={styles.toast}>{toast}</div>}
      <div className={styles.tabHeader}>
        <input
          className={styles.searchInput}
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.tabMeta}>{filtered.length} users</div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Wallet (SGD)</th>
              <th>Reseller Code</th><th>Joined</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td className={styles.cellPrimary}>{u.full_name || '—'}</td>
                <td className={styles.cellSub}>{u.email || '—'}</td>
                <td><strong>SGD {parseFloat(u.wallet_balance || 0).toFixed(2)}</strong></td>
                <td>{u.preferred_reseller_code ? <code className={styles.resellerCode}>{u.preferred_reseller_code}</code> : '—'}</td>
                <td className={styles.cellSub}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actionRow}>
                    <button className={styles.btnPrimary} onClick={() => setModal({ type: 'credits', user: u })}>+ Credits</button>
                    <button className={styles.btnSecondary} onClick={() => setModal({ type: 'gift', user: u })}>Gift Plan</button>
                    <button className={styles.btnWarning} onClick={() => setModal({ type: 'reset', user: u })}>Reset PWD</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setModal(null)}>✕</button>

            {modal.type === 'credits' && (
              <>
                <h3 className={styles.modalTitle}>Add Wallet Credits</h3>
                <p className={styles.modalSub}>User: <strong>{modal.user.full_name || modal.user.email}</strong></p>
                <p className={styles.modalSub}>Current balance: <strong>SGD {parseFloat(modal.user.wallet_balance || 0).toFixed(2)}</strong></p>
                <div className={styles.formGroup}>
                  <label>Amount (SGD)</label>
                  <input
                    type="number" min="1" step="0.01"
                    placeholder="e.g. 10.00"
                    value={creditAmt}
                    onChange={e => setCreditAmt(e.target.value)}
                    className={styles.formInput}
                  />
                </div>
                <button className={styles.btnPrimary} onClick={addCredits} disabled={busy}>
                  {busy ? 'Adding…' : 'Add Credits'}
                </button>
              </>
            )}

            {modal.type === 'gift' && (
              <>
                <h3 className={styles.modalTitle}>Gift a Free Plan</h3>
                <p className={styles.modalSub}>User: <strong>{modal.user.full_name || modal.user.email}</strong></p>
                {[
                  { label: 'Country Name', key: 'country_name', placeholder: 'e.g. Japan' },
                  { label: 'Plan Title', key: 'package_title', placeholder: 'e.g. 5GB 30-day Japan' },
                  { label: 'Data Amount', key: 'data_amount', placeholder: 'e.g. 5GB' },
                  { label: 'Validity (days)', key: 'validity_days', placeholder: 'e.g. 30' },
                ].map(f => (
                  <div className={styles.formGroup} key={f.key}>
                    <label>{f.label}</label>
                    <input
                      placeholder={f.placeholder}
                      value={giftForm[f.key]}
                      onChange={e => setGiftForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className={styles.formInput}
                    />
                  </div>
                ))}
                <button className={styles.btnPrimary} onClick={giftPlan} disabled={busy}>
                  {busy ? 'Gifting…' : 'Gift Plan'}
                </button>
              </>
            )}

            {modal.type === 'reset' && (
              <>
                <h3 className={styles.modalTitle}>Send Password Reset</h3>
                <p className={styles.modalSub}>A reset email will be sent to:</p>
                <p className={styles.modalEmail}>{modal.user.email}</p>
                <p className={styles.modalSub}>The user clicks the link to set a new password. You will not see or set their password.</p>
                <button className={styles.btnWarning} onClick={resetPassword} disabled={busy}>
                  {busy ? 'Sending…' : 'Send Reset Email'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WALLET TOP-UPS TAB
// ═══════════════════════════════════════════════════════════════
function WalletTab() {
  const [topups, setTopups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/admin/wallet-topups')
      .then(setTopups)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = topups.filter(t => t.status === 'succeeded')
                      .reduce((s, t) => s + parseFloat(t.amount_sgd || 0), 0);

  if (loading) return <div className={styles.loading}>Loading…</div>;

  return (
    <div>
      <div className={styles.tabHeader}>
        <div className={styles.tabMeta}>{topups.length} top-ups · SGD {total.toFixed(2)} total</div>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>User</th><th>Amount (SGD)</th><th>Stripe PI</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {topups.map(t => (
              <tr key={t.id}>
                <td>{t.profiles?.full_name || t.user_id}</td>
                <td><strong>SGD {parseFloat(t.amount_sgd).toFixed(2)}</strong></td>
                <td><code className={styles.piCode}>{t.stripe_payment_intent_id?.slice(-12) || '—'}</code></td>
                <td><Badge status={t.status} /></td>
                <td className={styles.cellSub}>{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// USAGE LOGS TAB
// ═══════════════════════════════════════════════════════════════
function UsageTab() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/admin/usage-logs')
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Loading…</div>;

  return (
    <div>
      <div className={styles.tabHeader}>
        <div className={styles.tabMeta}>{logs.length} log entries</div>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Action</th><th>Type</th><th>User / IP</th><th>Date</th></tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td>{l.action || '—'}</td>
                <td><Badge status={l.type || 'guest'} /></td>
                <td className={styles.cellSub}>{l.user_id || l.ip_address || '—'}</td>
                <td className={styles.cellSub}>{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RESELLERS TAB
// ═══════════════════════════════════════════════════════════════
function ResellersTab() {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [busy, setBusy]           = useState(false);
  const [toast, setToast]         = useState('');

  const blankForm = {
    name: '', short_name: '', country_iso: '', commission_pct: 10,
    discount_value: 0, discount_type: 'percent', attribution_months: 0,
    start_date: new Date().toISOString().split('T')[0],
    notes: '', user_id: '', is_active: true,
  };
  const [form, setForm] = useState(blankForm);
  const [emailLookup, setEmailLookup] = useState('');
  const [emailLookupStatus, setEmailLookupStatus] = useState('');

  const lookupUserByEmail = async () => {
    if (!emailLookup.trim()) return;
    setEmailLookupStatus('searching');
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = await res.json();
      const match = users.find(u => (u.email || '').toLowerCase() === emailLookup.trim().toLowerCase());
      if (match) {
        setForm(p => ({ ...p, user_id: match.id }));
        setEmailLookupStatus('found');
      } else {
        setEmailLookupStatus('not_found');
      }
    } catch (err) {
      setEmailLookupStatus('not_found');
    }
  };

  const load = useCallback(() => {
    adminFetch('/admin/resellers')
      .then(setResellers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const suggested = name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8);
    setForm(prev => ({ ...prev, name, short_name: suggested }));
  };

  const handleCountryChange = (e) => {
    setForm(prev => ({ ...prev, country_iso: e.target.value }));
  };

  const codePreview = form.country_iso && form.short_name
    ? `${form.country_iso.toUpperCase()}-${form.short_name.toUpperCase()}-#####`
    : '—';

  const startEdit = (r) => {
    setEditId(r.id);
    setForm({
      name: r.name, short_name: r.short_name, country_iso: r.country_iso,
      commission_pct: r.commission_pct, discount_value: r.discount_value,
      discount_type: r.discount_type, attribution_months: r.attribution_months,
      start_date: r.start_date, notes: r.notes || '',
      user_id: r.user_id || '', is_active: r.is_active,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => {
    setShowForm(false); setEditId(null); setForm(blankForm);
  };

  const submit = async () => {
    if (!form.name || !form.short_name || !form.country_iso) {
      return alert('Name, short name and country are required');
    }
    setBusy(true);
    try {
      const payload = { ...form, user_id: form.user_id || null };
      if (editId) {
        await adminFetch(`/admin/resellers/${editId}`, {
          method: 'PUT', body: JSON.stringify(payload),
        });
        showToast('Reseller updated');
      } else {
        await adminFetch('/admin/resellers', {
          method: 'POST', body: JSON.stringify(payload),
        });
        showToast('Reseller created');
      }
      cancelForm(); load();
    } catch (err) { alert('Error: ' + err.message); }
    setBusy(false);
  };

  const deactivate = async (id, name) => {
    if (!window.confirm(`Deactivate ${name}? Their code will stop working at checkout.`)) return;
    try {
      await adminFetch(`/admin/resellers/${id}`, { method: 'DELETE' });
      showToast(`${name} deactivated`);
      load();
    } catch (err) { alert('Error: ' + err.message); }
  };

  if (loading) return <div className={styles.loading}>Loading…</div>;

  return (
    <div>
      {toast && <div className={styles.toast}>{toast}</div>}

      {showForm && (
        <div className={styles.resellerForm}>
          <h3 className={styles.formTitle}>{editId ? 'Edit Reseller' : 'Create New Reseller'}</h3>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Full Name *</label>
              <input className={styles.formInput} value={form.name} onChange={handleNameChange} placeholder="e.g. John Smith" />
            </div>
            <div className={styles.formGroup}>
              <label>Short Name (used in code) *</label>
              <input className={styles.formInput} value={form.short_name}
                onChange={e => setForm(p => ({ ...p, short_name: e.target.value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,8) }))}
                placeholder="e.g. JOHN" maxLength={8} />
            </div>
            <div className={styles.formGroup}>
              <label>Country *</label>
              <select className={styles.formInput} value={form.country_iso} onChange={handleCountryChange}>
                <option value="">Select country…</option>
                {COUNTRIES.map(c => <option key={c.iso} value={c.iso}>{c.name} ({c.iso})</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Code Preview</label>
              <div className={styles.codePreview}>{editId ? '(code is locked after creation)' : codePreview}</div>
            </div>
            <div className={styles.formGroup}>
              <label>Commission % (you pay reseller)</label>
              <input type="number" className={styles.formInput} value={form.commission_pct}
                onChange={e => setForm(p => ({ ...p, commission_pct: e.target.value }))} min="0" max="100" />
            </div>
            <div className={styles.formGroup}>
              <label>Customer Discount Value</label>
              <input type="number" className={styles.formInput} value={form.discount_value}
                onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))} min="0" step="0.01" />
            </div>
            <div className={styles.formGroup}>
              <label>Discount Type</label>
              <select className={styles.formInput} value={form.discount_type}
                onChange={e => setForm(p => ({ ...p, discount_type: e.target.value }))}>
                <option value="percent">Percent (% off)</option>
                <option value="fixed_sgd">Fixed (SGD off)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Attribution Window (months)</label>
              <select className={styles.formInput} value={form.attribution_months}
                onChange={e => setForm(p => ({ ...p, attribution_months: parseInt(e.target.value) }))}>
                <option value={0}>Lifetime (activity-based)</option>
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input type="date" className={styles.formInput} value={form.start_date}
                onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label>Link to User Account — lookup by email</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <input
                  className={styles.formInput}
                  value={emailLookup}
                  onChange={e => { setEmailLookup(e.target.value); setEmailLookupStatus(''); }}
                  placeholder="Enter reseller's account email…"
                  style={{ flex: 1, marginBottom: 0 }}
                />
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={lookupUserByEmail}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {emailLookupStatus === 'searching' ? 'Searching…' : 'Look Up'}
                </button>
              </div>
              {emailLookupStatus === 'found' && (
                <div style={{ fontSize: '12px', color: '#4cd964', marginBottom: '6px' }}>
                  ✓ User found — UUID auto-filled below
                </div>
              )}
              {emailLookupStatus === 'not_found' && (
                <div style={{ fontSize: '12px', color: '#ff5050', marginBottom: '6px' }}>
                  ✗ No user found with that email
                </div>
              )}
              <input
                className={styles.formInput}
                value={form.user_id}
                onChange={e => setForm(p => ({ ...p, user_id: e.target.value }))}
                placeholder="User UUID (auto-filled after lookup, or paste manually)"
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label>Internal Notes</label>
              <textarea className={styles.formInput} rows={2} value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Any notes for your reference" />
            </div>
            {editId && (
              <div className={styles.formGroup}>
                <label>Status</label>
                <select className={styles.formInput} value={form.is_active ? 'true' : 'false'}
                  onChange={e => setForm(p => ({ ...p, is_active: e.target.value === 'true' }))}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button className={styles.btnPrimary} onClick={submit} disabled={busy}>
              {busy ? 'Saving…' : editId ? 'Save Changes' : 'Create Reseller'}
            </button>
            <button className={styles.btnCancel} onClick={cancelForm}>Cancel</button>
          </div>
        </div>
      )}

      <div className={styles.tabHeader}>
        {!showForm && (
          <button className={styles.btnPrimary} onClick={() => setShowForm(true)}>
            + New Reseller
          </button>
        )}
        <div className={styles.tabMeta}>{resellers.length} resellers</div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Code</th><th>Name</th><th>Country</th><th>Commission</th>
              <th>Customer Discount</th><th>Attribution</th><th>Start Date</th>
              <th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resellers.map(r => (
              <tr key={r.id}>
                <td><code className={styles.resellerCode}>{r.code}</code></td>
                <td className={styles.cellPrimary}>{r.name}</td>
                <td>{r.country_iso}</td>
                <td>{r.commission_pct}%</td>
                <td>
                  {r.discount_value > 0
                    ? r.discount_type === 'percent'
                      ? `${r.discount_value}% off`
                      : `SGD ${parseFloat(r.discount_value).toFixed(2)} off`
                    : 'None'}
                </td>
                <td>{r.attribution_months === 0 ? 'Lifetime' : `${r.attribution_months}mo`}</td>
                <td className={styles.cellSub}>{r.start_date}</td>
                <td><Badge status={r.is_active ? 'active' : 'inactive'} /></td>
                <td>
                  <div className={styles.actionRow}>
                    <button className={styles.btnEdit} onClick={() => startEdit(r)}>Edit</button>
                    {r.is_active && (
                      <button className={styles.btnDanger} onClick={() => deactivate(r.id, r.name)}>Deactivate</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RESELLER SALES TAB
// ═══════════════════════════════════════════════════════════════
function ResellerSalesTab() {
  const [data, setData]             = useState({ orders: [], summary: [] });
  const [referralData, setReferralData] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState('summary');

  useEffect(() => {
    Promise.all([
      adminFetch('/admin/reseller-sales'),
      adminFetch('/admin/referral-stats'),
    ]).then(([sales, referrals]) => {
      setData(sales);
      setReferralData(referrals || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    const rows = [
      ['Reseller Code', 'Reseller Name', 'Commission %', 'Total Orders', 'Total Revenue SGD', 'Commission Owed SGD'],
      ...data.summary.map(s => [
        s.reseller_code, s.reseller_name, s.commission_pct,
        s.total_orders, s.total_revenue_sgd, s.total_commission_sgd,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `reseller-sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <div className={styles.loading}>Loading…</div>;

  const totalRevenue    = data.summary.reduce((s, r) => s + parseFloat(r.total_revenue_sgd    || 0), 0);
  const totalCommission = data.summary.reduce((s, r) => s + parseFloat(r.total_commission_sgd || 0), 0);

  return (
    <div>
      <div className={styles.tabHeader}>
        <div className={styles.filterRow}>
          <button className={`${styles.filterBtn} ${view === 'summary'   ? styles.filterBtnActive : ''}`} onClick={() => setView('summary')}>Summary</button>
          <button className={`${styles.filterBtn} ${view === 'orders'    ? styles.filterBtnActive : ''}`} onClick={() => setView('orders')}>All Orders</button>
          <button className={`${styles.filterBtn} ${view === 'referrals' ? styles.filterBtnActive : ''}`} onClick={() => setView('referrals')}>USR- Referrals</button>
        </div>
        <div className={styles.actionRow}>
          <div className={styles.tabMeta}>
            SGD {totalRevenue.toFixed(2)} revenue · SGD {totalCommission.toFixed(2)} commission owed
          </div>
          <button className={styles.btnSecondary} onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      {view === 'summary' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th><th>Reseller</th><th>Commission %</th>
                <th>Orders</th><th>Revenue (SGD)</th><th>Commission Owed (SGD)</th>
              </tr>
            </thead>
            <tbody>
              {data.summary.map(s => (
                <tr key={s.reseller_code}>
                  <td><code className={styles.resellerCode}>{s.reseller_code}</code></td>
                  <td className={styles.cellPrimary}>{s.reseller_name}</td>
                  <td>{s.commission_pct}%</td>
                  <td>{s.total_orders}</td>
                  <td>SGD {parseFloat(s.total_revenue_sgd).toFixed(2)}</td>
                  <td><strong className={styles.commissionAmt}>SGD {parseFloat(s.total_commission_sgd).toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'orders' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order Code</th><th>Reseller</th><th>Customer</th>
                <th>Plan</th><th>Price</th><th>Discount</th>
                <th>Net Price</th><th>Commission</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map(o => (
                <tr key={o.id}>
                  <td><code>{o.order_code}</code></td>
                  <td><code className={styles.resellerCode}>{o.reseller_code}</code></td>
                  <td>{o.customer_name || '—'}</td>
                  <td>{o.package_title}</td>
                  <td>SGD {parseFloat(o.price_sgd || 0).toFixed(2)}</td>
                  <td>{parseFloat(o.discount_sgd || 0) > 0 ? `-SGD ${parseFloat(o.discount_sgd).toFixed(2)}` : '—'}</td>
                  <td>SGD {o.net_price_sgd}</td>
                  <td><strong className={styles.commissionAmt}>SGD {o.commission_sgd}</strong></td>
                  <td className={styles.cellSub}>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'referrals' && (
        <div>
          <div className={styles.tabMeta} style={{ marginBottom: '16px' }}>
            User referral codes (USR- prefix) — SGD 2.00 wallet credit per first referred purchase
          </div>
          {referralData.length === 0 ? (
            <div className={styles.emptyState}>No referral activity yet</div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Referral Code</th><th>User</th><th>Email</th>
                    <th>Friends Referred</th><th>Credit Earned (SGD)</th>
                  </tr>
                </thead>
                <tbody>
                  {referralData.map(r => (
                    <tr key={r.referral_code}>
                      <td><code className={styles.resellerCode}>{r.referral_code}</code></td>
                      <td className={styles.cellPrimary}>{r.full_name || '—'}</td>
                      <td className={styles.cellSub}>{r.email || '—'}</td>
                      <td>{r.referred_count}</td>
                      <td><strong className={styles.commissionAmt}>SGD {parseFloat(r.referral_credit_earned || 0).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS TAB
// ═══════════════════════════════════════════════════════════════
function AnalyticsTab() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState('month');

  useEffect(() => {
    adminFetch('/admin/orders')
      .then(data => setOrders(data.filter(o => o.status === 'completed')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filterByPeriod = (data) => {
    const now = new Date();
    return data.filter(o => {
      const d = new Date(o.created_at);
      if (period === 'today') return d.toDateString() === now.toDateString();
      if (period === 'week')  { const w = new Date(now); w.setDate(now.getDate() - 7);  return d >= w; }
      if (period === 'month') { const m = new Date(now); m.setDate(now.getDate() - 30); return d >= m; }
      if (period === 'year')  { const y = new Date(now); y.setFullYear(now.getFullYear() - 1); return d >= y; }
      return true;
    });
  };

  const filtered = filterByPeriod(orders);

  const totalRevenue    = filtered.reduce((s, o) => s + parseFloat(o.price_sgd || 0), 0);
  const totalDiscount   = filtered.reduce((s, o) => s + parseFloat(o.discount_sgd || 0), 0);
  const netRevenue      = totalRevenue - totalDiscount;
  const resellerOrders  = filtered.filter(o => o.reseller_code);
  const resellerRevenue = resellerOrders.reduce((s, o) => s + parseFloat(o.price_sgd || 0), 0);
  const walletOrders    = filtered.filter(o => o.payment_method === 'wallet').length;
  const cardOrders      = filtered.filter(o => o.payment_method === 'card').length;
  const corpOrders      = filtered.filter(o => o.payment_method === 'corp_wallet').length;

  const last30 = [...Array(30)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const dayOrders = orders.filter(o => new Date(o.created_at).toDateString() === d.toDateString());
    const rev = dayOrders.reduce((s, o) => s + parseFloat(o.price_sgd || 0), 0);
    return { label, rev, count: dayOrders.length };
  });
  const maxRev = Math.max(...last30.map(d => d.rev), 1);

  const last12 = [...Array(12)].map((_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (11 - i));
    const y = d.getFullYear(); const m = d.getMonth();
    const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    const monthOrders = orders.filter(o => {
      const od = new Date(o.created_at);
      return od.getFullYear() === y && od.getMonth() === m;
    });
    const rev = monthOrders.reduce((s, o) => s + parseFloat(o.price_sgd || 0), 0);
    return { label, rev, count: monthOrders.length };
  });
  const maxMonthRev = Math.max(...last12.map(d => d.rev), 1);

  const byCountry = {};
  filtered.forEach(o => {
    const c = o.country_name || 'Unknown';
    if (!byCountry[c]) byCountry[c] = { revenue: 0, orders: 0 };
    byCountry[c].revenue += parseFloat(o.price_sgd || 0);
    byCountry[c].orders++;
  });
  const topCountries = Object.entries(byCountry)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10);
  const maxCountryRev = Math.max(...topCountries.map(([, v]) => v.revenue), 1);

  const byPlan = {};
  filtered.forEach(o => {
    const p = o.package_title || 'Unknown';
    if (!byPlan[p]) byPlan[p] = { revenue: 0, orders: 0 };
    byPlan[p].revenue += parseFloat(o.price_sgd || 0);
    byPlan[p].orders++;
  });
  const topPlans = Object.entries(byPlan)
    .sort((a, b) => b[1].orders - a[1].orders)
    .slice(0, 8);

  const thisYear  = new Date().getFullYear();
  const ytdRev    = orders.filter(o => new Date(o.created_at).getFullYear() === thisYear)
                          .reduce((s, o) => s + parseFloat(o.price_sgd || 0), 0);
  const lastYtdRev = orders.filter(o => new Date(o.created_at).getFullYear() === thisYear - 1)
                           .reduce((s, o) => s + parseFloat(o.price_sgd || 0), 0);

  const exportCSV = () => {
    const rows = [
      ['Date', 'Order Code', 'Customer', 'Country', 'Plan', 'Price SGD', 'Discount SGD', 'Net SGD', 'Payment', 'Reseller Code'],
      ...filtered.map(o => [
        new Date(o.created_at).toLocaleDateString(),
        o.order_code, o.customer_name || o.guest_email || '',
        o.country_name, o.package_title,
        parseFloat(o.price_sgd || 0).toFixed(2),
        parseFloat(o.discount_sgd || 0).toFixed(2),
        (parseFloat(o.price_sgd || 0) - parseFloat(o.discount_sgd || 0)).toFixed(2),
        o.payment_method, o.reseller_code || '',
      ]),
    ];
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `esimconnect-revenue-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <div className={styles.loading}>Loading analytics…</div>;

  return (
    <div>
      <div className={styles.tabHeader}>
        <div className={styles.filterRow}>
          {[
            { key: 'today', label: 'Today' },
            { key: 'week',  label: '7 Days' },
            { key: 'month', label: '30 Days' },
            { key: 'year',  label: '12 Months' },
            { key: 'all',   label: 'All Time' },
          ].map(p => (
            <button key={p.key}
              className={`${styles.filterBtn} ${period === p.key ? styles.filterBtnActive : ''}`}
              onClick={() => setPeriod(p.key)}
            >{p.label}</button>
          ))}
        </div>
        <button className={styles.btnSecondary} onClick={exportCSV}>Export CSV</button>
      </div>

      <div className={styles.analyticsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>SGD {netRevenue.toFixed(2)}</div>
          <div className={styles.metricLabel}>Net Revenue</div>
          <div className={styles.metricSub}>Gross {totalRevenue.toFixed(2)} − Disc {totalDiscount.toFixed(2)}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{filtered.length}</div>
          <div className={styles.metricLabel}>Completed Orders</div>
          <div className={styles.metricSub}>
            Avg SGD {filtered.length ? (netRevenue / filtered.length).toFixed(2) : '0.00'} per order
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{resellerOrders.length}</div>
          <div className={styles.metricLabel}>Reseller Orders</div>
          <div className={styles.metricSub}>
            {filtered.length ? ((resellerOrders.length / filtered.length) * 100).toFixed(0) : 0}% of total · SGD {resellerRevenue.toFixed(2)}
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>SGD {ytdRev.toFixed(2)}</div>
          <div className={styles.metricLabel}>Year to Date {thisYear}</div>
          <div className={styles.metricSub}>
            {lastYtdRev > 0
              ? `vs SGD ${lastYtdRev.toFixed(2)} in ${thisYear - 1}`
              : `No data for ${thisYear - 1}`}
          </div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.chartTitle}>Daily Revenue — Last 30 Days</div>
        <div className={styles.barChart}>
          {last30.map((d, i) => (
            <div key={i} className={styles.barCol} title={`${d.label}: SGD ${d.rev.toFixed(2)} (${d.count} orders)`}>
              <div className={styles.barFill} style={{ height: `${(d.rev / maxRev) * 100}%`, opacity: d.rev > 0 ? 1 : 0.15 }} />
              {i % 5 === 0 && <div className={styles.barLabel}>{d.label}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.chartTitle}>Monthly Revenue — Last 12 Months</div>
        <div className={styles.barChart} style={{ height: '140px' }}>
          {last12.map((d, i) => (
            <div key={i} className={styles.barCol} title={`${d.label}: SGD ${d.rev.toFixed(2)} (${d.count} orders)`}>
              <div className={styles.barFill} style={{ height: `${(d.rev / maxMonthRev) * 100}%`, background: 'rgba(124,58,237,0.7)', opacity: d.rev > 0 ? 1 : 0.15 }} />
              <div className={styles.barLabel}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.analyticsBottom}>
        <div className={styles.chartSection} style={{ flex: 1 }}>
          <div className={styles.chartTitle}>Revenue by Country (Top 10)</div>
          {topCountries.length === 0 && <div className={styles.emptyState}>No data for this period</div>}
          {topCountries.map(([country, v], i) => (
            <div key={country} className={styles.rankRow}>
              <div className={styles.rankNum}>{i + 1}</div>
              <div className={styles.rankName}>{country}</div>
              <div className={styles.rankBar}>
                <div className={styles.rankBarFill} style={{ width: `${(v.revenue / maxCountryRev) * 100}%` }} />
              </div>
              <div className={styles.rankValue}>
                <div>SGD {v.revenue.toFixed(2)}</div>
                <div className={styles.rankSub}>{v.orders} order{v.orders !== 1 ? 's' : ''}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className={styles.chartSection}>
            <div className={styles.chartTitle}>Payment Method Split</div>
            <div className={styles.splitRow}>
              <div className={styles.splitItem}>
                <div className={styles.splitVal} style={{ color: '#00c8c8' }}>{cardOrders}</div>
                <div className={styles.splitLabel}>Card</div>
                <div className={styles.splitPct}>
                  {filtered.length ? ((cardOrders / filtered.length) * 100).toFixed(0) : 0}%
                </div>
              </div>
              <div className={styles.splitDivider} />
              <div className={styles.splitItem}>
                <div className={styles.splitVal} style={{ color: '#a78bfa' }}>{walletOrders}</div>
                <div className={styles.splitLabel}>eWallet</div>
                <div className={styles.splitPct}>
                  {filtered.length ? ((walletOrders / filtered.length) * 100).toFixed(0) : 0}%
                </div>
              </div>
              <div className={styles.splitDivider} />
              <div className={styles.splitItem}>
                <div className={styles.splitVal} style={{ color: '#38bdf8' }}>{corpOrders}</div>
                <div className={styles.splitLabel}>Corp Wallet</div>
                <div className={styles.splitPct}>
                  {filtered.length ? ((corpOrders / filtered.length) * 100).toFixed(0) : 0}%
                </div>
              </div>
              <div className={styles.splitDivider} />
              <div className={styles.splitItem}>
                <div className={styles.splitVal} style={{ color: '#34d399' }}>{resellerOrders.length}</div>
                <div className={styles.splitLabel}>Via Reseller</div>
                <div className={styles.splitPct}>
                  {filtered.length ? ((resellerOrders.length / filtered.length) * 100).toFixed(0) : 0}%
                </div>
              </div>
            </div>
          </div>

          <div className={styles.chartSection}>
            <div className={styles.chartTitle}>Best Selling Plans</div>
            {topPlans.length === 0 && <div className={styles.emptyState}>No data for this period</div>}
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Plan</th><th>Orders</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {topPlans.map(([plan, v]) => (
                    <tr key={plan}>
                      <td className={styles.cellPrimary} style={{ fontSize: '12px' }}>{plan}</td>
                      <td>{v.orders}</td>
                      <td>SGD {v.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CORPORATE TAB
// ═══════════════════════════════════════════════════════════════
function CorporateTab() {
  const [corps, setCorps]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    adminFetch('/admin/corporates')
      .then(setCorps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (id, currentStatus, companyName) => {
    const action = currentStatus ? 'Suspend' : 'Activate';
    if (!window.confirm(`${action} ${companyName}?`)) return;
    try {
      await adminFetch(`/admin/corporates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      showToast(`${companyName} ${currentStatus ? 'suspended' : 'activated'}`);
      load();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div className={styles.loading}>Loading corporate accounts…</div>;

  const totalCorpWallet = corps.reduce((s, c) => s + parseFloat(c.wallet_balance || 0), 0);

  return (
    <div>
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.tabHeader}>
        <div className={styles.tabMeta}>
          {corps.length} corporate account{corps.length !== 1 ? 's' : ''} · SGD {totalCorpWallet.toFixed(2)} total wallet balance
        </div>
      </div>

      {corps.length === 0 ? (
        <div className={styles.emptyState}>
          No corporate accounts yet. They sign up via <code>/corporate/register</code>.
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Company</th>
                <th>UEN</th>
                <th>Contact Email</th>
                <th>Staff</th>
                <th>Wallet (SGD)</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {corps.map(c => (
                <tr key={c.id}>
                  <td className={styles.cellPrimary}>{c.company_name}</td>
                  <td className={styles.cellSub}>{c.uen || '—'}</td>
                  <td className={styles.cellSub}>{c.contact_email}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{c.staff_count}</td>
                  <td><strong>SGD {parseFloat(c.wallet_balance || 0).toFixed(2)}</strong></td>
                  <td><Badge status={c.is_active ? 'active' : 'inactive'} /></td>
                  <td className={styles.cellSub}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={c.is_active ? styles.btnDanger : styles.btnPrimary}
                      onClick={() => toggleActive(c.id, c.is_active, c.company_name)}
                    >
                      {c.is_active ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN ADMIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function Admin() {
  const navigate   = useNavigate();
  const [tab, setTab]       = useState(0);
  const [stats, setStats]   = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }
      if (session.user.email !== process.env.REACT_APP_ADMIN_EMAIL) {
        navigate('/'); return;
      }
      setChecking(false);
      try {
        const s = await adminFetch('/admin/stats');
        setStats(s);
      } catch (e) { console.error(e); }
    })();
  }, [navigate]);

  if (checking) return (
    <div className={styles.gateCheck}>
      <div className={styles.spinner} />
      <p>Verifying access…</p>
    </div>
  );

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>esimconnect · internal management</p>
        </div>
      </div>

      {stats && (
        <div className={styles.statsBar}>
          <StatCard label="Total Orders"    value={stats.totalOrders}      sub={`${stats.completedOrders} completed`} accent="#00c8c8" />
          <StatCard label="Revenue (SGD)"   value={`$${stats.totalRevenue}`}  accent="#1a7a4a" />
          <StatCard label="Registered Users" value={stats.totalUsers}        accent="#1e3a5f" />
          <StatCard label="Wallet Top-ups"  value={`$${stats.totalWalletTopups}`} accent="#7c3aed" />
        </div>
      )}

      <div className={styles.tabs}>
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === i ? styles.tabActive : ''}`}
            onClick={() => setTab(i)}
          >{t}</button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {tab === 0 && <OrdersTab />}
        {tab === 1 && <UsersTab />}
        {tab === 2 && <WalletTab />}
        {tab === 3 && <UsageTab />}
        {tab === 4 && <ResellersTab />}
        {tab === 5 && <ResellerSalesTab />}
        {tab === 6 && <AnalyticsTab />}
        {tab === 7 && <CorporateTab />}
      </div>
    </div>
  );
}
