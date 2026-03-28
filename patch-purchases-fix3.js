const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Purchases.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the entire fetchEsims function regardless of exact whitespace
const oldPattern = /const fetchEsims = async \(userId\) => \{[\s\S]*?\};(\s*const fetchOrders)/;

const newFetchEsims = `const fetchEsims = async (userId) => {
    // Read from orders table and map to eSIM display format
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    console.log('fetchEsims data:', data, 'error:', error);
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
  const fetchOrders`;

const newContent = content.replace(oldPattern, newFetchEsims);

if (newContent === content) {
  console.log('❌ Pattern not matched — printing current fetchEsims for inspection:');
  const match = content.match(/const fetchEsims[\s\S]{0,500}/);
  console.log(match ? match[0] : 'Not found');
} else {
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('✅ fetchEsims fully rewritten to read from orders table');
}
