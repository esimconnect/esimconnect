const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Purchases.js');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: order_number -> order_code
content = content.replace(
  'Order #{order.order_number}',
  'Order {order.order_code || "—"}'
);

// Fix 2: total_sgd -> price_sgd
content = content.replace(
  'SGD {parseFloat(order.total_sgd || 0).toFixed(2)}',
  'SGD {parseFloat(order.price_sgd || 0).toFixed(2)}'
);

// Fix 3: payment_status -> status
content = content.replace(
  '<StatusBadge status={order.payment_status} />',
  '<StatusBadge status={order.status || "completed"} />'
);

// Fix 4: GST line — hide it (we don't have gst_sgd)
content = content.replace(
  `{order.gst_sgd > 0 && <div style={{ fontSize: '11px', color: 'var(--muted)' }}>incl. GST SGD {parseFloat(order.gst_sgd).toFixed(2)}</div>}`,
  ''
);

// Fix 5: fetchEsims — read from orders table instead of esims table
// since we populate orders but not esims yet
content = content.replace(
  `  const fetchEsims = async (userId) => {
    const { data } = await supabase
      .from('esims')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setEsims(data);
  };`,
  `  const fetchEsims = async (userId) => {
    // Read from orders table — map to eSIM display format
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .not('iccid', 'is', null)
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
  };`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Purchases.js fixed — orders display correctly, eSIMs populated from orders');
