require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');
const webpush = require('web-push');

const app = express();
const PORT = process.env.PORT || 4000;

// Supabase admin client (service role — bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// VAPID config
webpush.setVapidDetails(
  'mailto:dlimyk@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

app.use(cors());

// Raw body required for Stripe webhook signature verification
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'esimconnect backend running' });
});

// ═══════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

// Verify request comes from admin email
async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No auth header' });
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  if (user.email !== process.env.ADMIN_EMAIL) return res.status(403).json({ error: 'Not admin' });
  req.adminUser = user;
  next();
}

// Verify request comes from a linked reseller account
async function requireReseller(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No auth header' });
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  const { data: reseller } = await supabase
    .from('resellers')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();
  if (!reseller) return res.status(403).json({ error: 'Not a reseller' });
  req.reseller = reseller;
  req.authUser = user;
  next();
}

// ── PUSH NOTIFICATIONS ────────────────────────────────────────────────────────

app.post('/push/subscribe', async (req, res) => {
  const { userId, subscription } = req.body;
  if (!userId || !subscription) return res.status(400).json({ error: 'Missing userId or subscription' });
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ user_id: userId, subscription }, { onConflict: 'user_id' });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

async function sendPushToUser(userId, payload) {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', userId)
    .single();
  if (error || !data) return;
  try {
    await webpush.sendNotification(data.subscription, JSON.stringify(payload));
  } catch (err) {
    console.error(`Push failed for user ${userId}:`, err.message);
    if (err.statusCode === 410) {
      await supabase.from('push_subscriptions').delete().eq('user_id', userId);
    }
  }
}

app.post('/push/send', async (req, res) => {
  const { userId, title, body, url } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  await sendPushToUser(userId, { title, body, url });
  res.json({ ok: true });
});

// ── STRIPE ────────────────────────────────────────────────────────────────────

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'sgd', userId } = req.body;
    if (!amount || amount < 500) {
      return res.status(400).json({ error: 'Minimum top-up is SGD 5.' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { user_id: userId || '', source: 'wallet_topup' },
    });
    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const userId = intent.metadata?.user_id;
    const amountSgd = intent.amount / 100;
    if (!userId) {
      console.warn('Webhook: no user_id in metadata, skipping wallet credit');
      return res.json({ received: true });
    }
    try {
      const { error: topupError } = await supabase
        .from('wallet_topups')
        .upsert({
          user_id: userId,
          amount_sgd: amountSgd,
          stripe_payment_intent_id: intent.id,
          status: 'succeeded',
        }, { onConflict: 'stripe_payment_intent_id' });
      if (topupError) {
        console.error('wallet_topups upsert error:', topupError.message);
        return res.status(500).json({ error: topupError.message });
      }
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();
      if (fetchError) {
        console.error('Profile fetch error:', fetchError.message);
        return res.status(500).json({ error: fetchError.message });
      }
      const newBalance = parseFloat(((profile.wallet_balance || 0) + amountSgd).toFixed(2));
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', userId);
      if (updateError) {
        console.error('Wallet balance update error:', updateError.message);
        return res.status(500).json({ error: updateError.message });
      }
      console.log(`Wallet credited: user=${userId} amount=SGD${amountSgd} new_balance=SGD${newBalance}`);
      await sendPushToUser(userId, {
        title: '💳 Wallet Topped Up',
        body: `SGD ${amountSgd.toFixed(2)} has been added to your eSIMConnect wallet.`,
        url: '/wallet',
      });
    } catch (err) {
      console.error('Webhook handler error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }
  res.json({ received: true });
});

// ═══════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// GET /admin/stats — summary cards for dashboard
app.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const [ordersRes, usersRes, topupsRes] = await Promise.all([
      supabase.from('orders').select('price_sgd, status'),
      supabase.from('profiles').select('id'),
      supabase.from('wallet_topups').select('amount_sgd, status'),
    ]);
    const orders   = ordersRes.data || [];
    const users    = usersRes.data  || [];
    const topups   = topupsRes.data || [];
    const completed = orders.filter(o => o.status === 'completed');
    const totalRevenue = completed.reduce((s, o) => s + parseFloat(o.price_sgd || 0), 0);
    const totalTopups  = topups.filter(t => t.status === 'succeeded')
                               .reduce((s, t) => s + parseFloat(t.amount_sgd || 0), 0);
    res.json({
      totalOrders:      orders.length,
      completedOrders:  completed.length,
      totalRevenue:     totalRevenue.toFixed(2),
      totalUsers:       users.length,
      totalWalletTopups: totalTopups.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/orders — all orders
app.get('/admin/orders', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/orders/:id — update order status
app.put('/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/users — all profiles + emails
app.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const emailMap = {};
    (authData?.users || []).forEach(u => { emailMap[u.id] = u.email; });
    const merged = profiles.map(p => ({ ...p, email: emailMap[p.id] || '' }));
    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/add-credits — manually add wallet credits to a user
app.post('/admin/add-credits', requireAdmin, async (req, res) => {
  try {
    const { user_id, amount } = req.body;
    if (!user_id || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Missing user_id or invalid amount' });
    }
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user_id)
      .single();
    if (fetchError) throw fetchError;
    const newBalance = parseFloat(((profile.wallet_balance || 0) + parseFloat(amount)).toFixed(2));
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', user_id);
    if (updateError) throw updateError;
    // Notify user
    await sendPushToUser(user_id, {
      title: '🎁 Credits Added',
      body: `SGD ${parseFloat(amount).toFixed(2)} has been added to your wallet by eSIMconnect.`,
      url: '/wallet',
    });
    res.json({ ok: true, new_balance: newBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/gift-plan — insert a free completed order for a user
app.post('/admin/gift-plan', requireAdmin, async (req, res) => {
  try {
    const { user_id, customer_email, customer_name, country_name, country_code,
            package_title, data_amount, validity_days, price_sgd } = req.body;
    if (!user_id || !country_name || !package_title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const order_code = 'GIFT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id,
        customer_email,
        customer_name,
        country_name,
        country_code,
        package_title,
        data_amount,
        validity_days,
        price_sgd: price_sgd || 0,
        order_code,
        status: 'completed',
        payment_method: 'gifted',
      })
      .select()
      .single();
    if (error) throw error;
    await sendPushToUser(user_id, {
      title: '🎁 Free Plan Gifted!',
      body: `You've received a free ${package_title} plan from eSIMconnect. Check your Purchases!`,
      url: '/purchases',
    });
    res.json({ ok: true, order: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/reset-password — trigger Supabase password reset email
app.post('/admin/reset-password', requireAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'https://esimconnect.world'}/login`,
    });
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/wallet-topups — all wallet top-ups
app.get('/admin/wallet-topups', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('wallet_topups')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/usage-logs — itinerary search logs
app.get('/admin/usage-logs', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usage_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN — RESELLER MANAGEMENT ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// GET /admin/resellers — list all resellers
app.get('/admin/resellers', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('resellers')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/resellers — create a new reseller (auto-generates code)
app.post('/admin/resellers', requireAdmin, async (req, res) => {
  try {
    const {
      name, short_name, country_iso, commission_pct,
      discount_value, discount_type, attribution_months,
      start_date, notes, user_id
    } = req.body;

    if (!name || !short_name || !country_iso) {
      return res.status(400).json({ error: 'name, short_name and country_iso are required' });
    }

    // Get next sequence value
    const { data: seqData, error: seqError } = await supabase
      .rpc('nextval', { seq_name: 'reseller_code_seq' });

    let seq;
    if (seqError || seqData === null) {
      // Fallback: count existing resellers + 1
      const { count } = await supabase
        .from('resellers')
        .select('*', { count: 'exact', head: true });
      seq = (count || 0) + 1;
    } else {
      seq = seqData;
    }

    const code = `${country_iso.toUpperCase()}-${short_name.toUpperCase()}-${String(seq).padStart(5, '0')}`;

    const { data, error } = await supabase
      .from('resellers')
      .insert({
        name,
        short_name: short_name.toUpperCase(),
        country_iso: country_iso.toUpperCase(),
        code,
        commission_pct:      commission_pct      ?? 10,
        discount_value:      discount_value      ?? 0,
        discount_type:       discount_type       ?? 'percent',
        attribution_months:  attribution_months  ?? 0,
        start_date:          start_date          ?? new Date().toISOString().split('T')[0],
        notes:               notes               ?? null,
        user_id:             user_id             ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/resellers/:id — edit reseller (code is immutable)
app.put('/admin/resellers/:id', requireAdmin, async (req, res) => {
  try {
    const { code, ...updates } = req.body; // strip code — never update it
    const { data, error } = await supabase
      .from('resellers')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /admin/resellers/:id — deactivate only (never hard delete)
app.delete('/admin/resellers/:id', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('resellers')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/reseller-sales — orders attributed to resellers + commission calc
app.get('/admin/reseller-sales', requireAdmin, async (req, res) => {
  try {
    // Get all orders that have a reseller_code
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .not('reseller_code', 'is', null)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });
    if (ordersError) throw ordersError;

    // Get all resellers for lookup
    const { data: resellers, error: resError } = await supabase
      .from('resellers')
      .select('*');
    if (resError) throw resError;

    const resellerMap = {};
    resellers.forEach(r => { resellerMap[r.code] = r; });

    // Build enriched rows
    const enriched = orders.map(o => {
      const reseller = resellerMap[o.reseller_code];
      const netPrice = parseFloat(o.price_sgd || 0) - parseFloat(o.discount_sgd || 0);
      const commission = reseller
        ? parseFloat((netPrice * reseller.commission_pct / 100).toFixed(2))
        : 0;
      return {
        ...o,
        reseller_name:    reseller?.name       || 'Unknown',
        commission_pct:   reseller?.commission_pct || 0,
        commission_sgd:   commission,
        net_price_sgd:    netPrice.toFixed(2),
      };
    });

    // Aggregate by reseller
    const summary = {};
    enriched.forEach(o => {
      const key = o.reseller_code;
      if (!summary[key]) {
        summary[key] = {
          reseller_code: key,
          reseller_name: o.reseller_name,
          commission_pct: o.commission_pct,
          total_orders: 0,
          total_revenue_sgd: 0,
          total_commission_sgd: 0,
        };
      }
      summary[key].total_orders++;
      summary[key].total_revenue_sgd    += parseFloat(o.price_sgd || 0);
      summary[key].total_commission_sgd += o.commission_sgd;
    });

    Object.values(summary).forEach(s => {
      s.total_revenue_sgd    = s.total_revenue_sgd.toFixed(2);
      s.total_commission_sgd = s.total_commission_sgd.toFixed(2);
    });

    res.json({ orders: enriched, summary: Object.values(summary) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// PUBLIC — RESELLER CODE VALIDATION (used at checkout)
// ═══════════════════════════════════════════════════════════════

// POST /reseller/validate — validate a code and return discount info
app.post('/reseller/validate', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Missing code' });

    // Detect code type by prefix
    if (code.toUpperCase().startsWith('USR-')) {
      // User referral code — Phase 3, not yet implemented
      return res.json({ valid: false, message: 'User referral codes coming soon' });
    }

    // Reseller code lookup
    const { data: reseller, error } = await supabase
      .from('resellers')
      .select('code, commission_pct, discount_value, discount_type, is_active, start_date, name')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !reseller) {
      return res.json({ valid: false, message: 'Code not found' });
    }

    if (!reseller.is_active) {
      return res.json({ valid: false, message: 'This code is no longer active' });
    }

    // Check start_date
    if (reseller.start_date && new Date(reseller.start_date) > new Date()) {
      return res.json({ valid: false, message: 'This code is not yet active' });
    }

    res.json({
      valid:          true,
      code:           reseller.code,
      discount_value: reseller.discount_value,
      discount_type:  reseller.discount_type,
      message:        reseller.discount_value > 0
        ? `Code ${reseller.code} applied — ${reseller.discount_type === 'percent'
            ? `${reseller.discount_value}% off`
            : `SGD ${parseFloat(reseller.discount_value).toFixed(2)} off`}`
        : `Code ${reseller.code} applied`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// RESELLER PORTAL — their own stats (authenticated, anonymised)
// ═══════════════════════════════════════════════════════════════

// GET /reseller/my-stats — reseller's own dashboard data
app.get('/reseller/my-stats', requireReseller, async (req, res) => {
  try {
    const reseller = req.reseller;

    // Get all completed orders attributed to this reseller's code
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, user_id, guest_email, package_title, country_name, data_amount, validity_days, price_sgd, discount_sgd, created_at')
      .eq('reseller_code', reseller.code)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Build anonymised customer map — consistent first-name alias
    // We only have user_id to work with; we fetch first names from profiles
    const userIds = [...new Set(orders.filter(o => o.user_id).map(o => o.user_id))];
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000']);

    const nameMap = {};
    (profileData || []).forEach(p => {
      // Show first name only
      const firstName = (p.full_name || 'Customer').split(' ')[0];
      nameMap[p.id] = firstName;
    });

    // Track which user_ids are "new" vs "returning" for this reseller
    const seenUsers = new Set();
    const enriched = orders.map(o => {
      const netPrice   = parseFloat(o.price_sgd || 0) - parseFloat(o.discount_sgd || 0);
      const commission = parseFloat((netPrice * reseller.commission_pct / 100).toFixed(2));
      const customerId = o.user_id || o.guest_email || 'guest';
      const isNew      = !seenUsers.has(customerId);
      seenUsers.add(customerId);

      return {
        customer_name:  o.user_id ? (nameMap[o.user_id] || 'Customer') : 'Guest',
        package_title:  o.package_title,
        country_name:   o.country_name,
        data_amount:    o.data_amount,
        validity_days:  o.validity_days,
        price_sgd:      parseFloat(o.price_sgd || 0).toFixed(2),
        commission_sgd: commission.toFixed(2),
        created_at:     o.created_at,
        is_new:         isNew,
      };
    });

    // Summary stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const totalCommission = enriched.reduce((s, o) => s + parseFloat(o.commission_sgd), 0);
    const monthCommission = enriched
      .filter(o => new Date(o.created_at) >= startOfMonth)
      .reduce((s, o) => s + parseFloat(o.commission_sgd), 0);

    // Active customers (purchased in last 12 months)
    const activeCustomerIds = new Set(
      orders
        .filter(o => new Date(o.created_at) >= twelveMonthsAgo && o.user_id)
        .map(o => o.user_id)
    );

    res.json({
      reseller: {
        name:            reseller.name,
        code:            reseller.code,
        commission_pct:  reseller.commission_pct,
        share_url:       `https://esimconnect.world?ref=${reseller.code}`,
      },
      stats: {
        total_commission_sgd:  totalCommission.toFixed(2),
        month_commission_sgd:  monthCommission.toFixed(2),
        total_orders:          enriched.length,
        active_customers:      activeCustomerIds.size,
      },
      orders: enriched,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── START SERVER ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`esimconnect backend running on port ${PORT}`);
});
