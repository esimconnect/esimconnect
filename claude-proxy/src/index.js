const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ── Mock Airalo Data ─────────────────────────────────────────────────────────
const MOCK_PACKAGES = {
  data: [
    {
      slug: 'singapore', country_code: 'SG', title: 'Singapore',
      image: { url: 'https://cdn.airalo.com/images/sg.png' },
      operators: [{
        id: 1, title: 'Changi Connect', type: 'local', plan_type: 'data',
        packages: [
          { id: 'sg-3days-1gb', type: 'sim', price: 4.50, amount: 1024, day: 3, is_unlimited: false, title: '1 GB - 3 Days' },
          { id: 'sg-7days-3gb', type: 'sim', price: 9.00, amount: 3072, day: 7, is_unlimited: false, title: '3 GB - 7 Days' },
          { id: 'sg-15days-5gb', type: 'sim', price: 15.00, amount: 5120, day: 15, is_unlimited: false, title: '5 GB - 15 Days' },
          { id: 'sg-30days-10gb', type: 'sim', price: 25.00, amount: 10240, day: 30, is_unlimited: false, title: '10 GB - 30 Days' },
        ]
      }]
    },
    {
      slug: 'japan', country_code: 'JP', title: 'Japan',
      image: { url: 'https://cdn.airalo.com/images/jp.png' },
      operators: [{
        id: 2, title: 'Sakura Mobile', type: 'local', plan_type: 'data',
        packages: [
          { id: 'jp-5days-3gb', type: 'sim', price: 10.00, amount: 3072, day: 5, is_unlimited: false, title: '3 GB - 5 Days' },
          { id: 'jp-10days-5gb', type: 'sim', price: 18.00, amount: 5120, day: 10, is_unlimited: false, title: '5 GB - 10 Days' },
          { id: 'jp-30days-unlimited', type: 'sim', price: 35.00, amount: 0, day: 30, is_unlimited: true, title: 'Unlimited - 30 Days' },
        ]
      }]
    },
    {
      slug: 'south-korea', country_code: 'KR', title: 'South Korea',
      image: { url: 'https://cdn.airalo.com/images/kr.png' },
      operators: [{
        id: 3, title: 'Seoul Connect', type: 'local', plan_type: 'data',
        packages: [
          { id: 'kr-5days-3gb', type: 'sim', price: 9.50, amount: 3072, day: 5, is_unlimited: false, title: '3 GB - 5 Days' },
          { id: 'kr-10days-5gb', type: 'sim', price: 16.00, amount: 5120, day: 10, is_unlimited: false, title: '5 GB - 10 Days' },
          { id: 'kr-30days-10gb', type: 'sim', price: 28.00, amount: 10240, day: 30, is_unlimited: false, title: '10 GB - 30 Days' },
        ]
      }]
    },
    {
      slug: 'thailand', country_code: 'TH', title: 'Thailand',
      image: { url: 'https://cdn.airalo.com/images/th.png' },
      operators: [{
        id: 4, title: 'ThaiFi', type: 'local', plan_type: 'data',
        packages: [
          { id: 'th-7days-3gb', type: 'sim', price: 8.00, amount: 3072, day: 7, is_unlimited: false, title: '3 GB - 7 Days' },
          { id: 'th-15days-5gb', type: 'sim', price: 14.00, amount: 5120, day: 15, is_unlimited: false, title: '5 GB - 15 Days' },
          { id: 'th-30days-unlimited', type: 'sim', price: 28.00, amount: 0, day: 30, is_unlimited: true, title: 'Unlimited - 30 Days' },
        ]
      }]
    },
    {
      slug: 'malaysia', country_code: 'MY', title: 'Malaysia',
      image: { url: 'https://cdn.airalo.com/images/my.png' },
      operators: [{
        id: 5, title: 'Boleh Connect', type: 'local', plan_type: 'data',
        packages: [
          { id: 'my-7days-3gb', type: 'sim', price: 7.50, amount: 3072, day: 7, is_unlimited: false, title: '3 GB - 7 Days' },
          { id: 'my-15days-5gb', type: 'sim', price: 13.00, amount: 5120, day: 15, is_unlimited: false, title: '5 GB - 15 Days' },
          { id: 'my-30days-10gb', type: 'sim', price: 22.00, amount: 10240, day: 30, is_unlimited: false, title: '10 GB - 30 Days' },
        ]
      }]
    },
    {
      slug: 'australia', country_code: 'AU', title: 'Australia',
      image: { url: 'https://cdn.airalo.com/images/au.png' },
      operators: [{
        id: 6, title: 'OzConnect', type: 'local', plan_type: 'data',
        packages: [
          { id: 'au-7days-5gb', type: 'sim', price: 14.00, amount: 5120, day: 7, is_unlimited: false, title: '5 GB - 7 Days' },
          { id: 'au-15days-10gb', type: 'sim', price: 22.00, amount: 10240, day: 15, is_unlimited: false, title: '10 GB - 15 Days' },
          { id: 'au-30days-unlimited', type: 'sim', price: 38.00, amount: 0, day: 30, is_unlimited: true, title: 'Unlimited - 30 Days' },
        ]
      }]
    },
    {
      slug: 'united-kingdom', country_code: 'GB', title: 'United Kingdom',
      image: { url: 'https://cdn.airalo.com/images/gb.png' },
      operators: [{
        id: 7, title: 'BritConnect', type: 'local', plan_type: 'data',
        packages: [
          { id: 'gb-7days-5gb', type: 'sim', price: 12.00, amount: 5120, day: 7, is_unlimited: false, title: '5 GB - 7 Days' },
          { id: 'gb-30days-10gb', type: 'sim', price: 28.00, amount: 10240, day: 30, is_unlimited: false, title: '10 GB - 30 Days' },
        ]
      }]
    },
    {
      slug: 'united-states', country_code: 'US', title: 'United States',
      image: { url: 'https://cdn.airalo.com/images/us.png' },
      operators: [{
        id: 8, title: 'StarConnect', type: 'local', plan_type: 'data',
        packages: [
          { id: 'us-7days-5gb', type: 'sim', price: 13.00, amount: 5120, day: 7, is_unlimited: false, title: '5 GB - 7 Days' },
          { id: 'us-15days-10gb', type: 'sim', price: 22.00, amount: 10240, day: 15, is_unlimited: false, title: '10 GB - 15 Days' },
          { id: 'us-30days-unlimited', type: 'sim', price: 40.00, amount: 0, day: 30, is_unlimited: true, title: 'Unlimited - 30 Days' },
        ]
      }]
    },
  ],
  meta: { message: 'success' }
};

function generateMockIccid() {
  return '89' + Array.from({length: 17}, () => Math.floor(Math.random() * 10)).join('');
}

function generateMockQrCode(iccid) {
  return `LPA:1$sandbox.airalo.com$${iccid}`;
}

function generateMockQrUrl(iccid) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LPA:1%24sandbox.airalo.com%24${iccid}`;
}

// ── Email Templates ──────────────────────────────────────────────────────────
function orderConfirmationEmail(order, userEmail) {
  const { package_title, country, validity, data_amount, iccid, qr_code, qr_url, order_code, price } = order;

  return {
    from: 'orders@esimconnect.world',
    to: userEmail,
    subject: `Your eSIM is Ready — ${country} · ${package_title}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1a;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#0a0f1a;color:#ffffff;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#00c8ff,#7b2fff);padding:32px 40px;text-align:center;">
      <h1 style="margin:0;font-size:28px;font-weight:900;color:#000;">eSIM<span style="color:#fff">Connect</span></h1>
      <p style="margin:8px 0 0;font-size:14px;color:rgba(0,0,0,0.7);">Your eSIM is Ready to Install</p>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <h2 style="margin:0 0 8px;font-size:22px;">🎉 Your eSIM is Ready!</h2>
      <p style="color:#888;margin:0 0 32px;">Order <strong style="color:#00c8ff;">${order_code}</strong> has been confirmed.</p>

      <!-- Plan Details -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;margin-bottom:24px;">
        <h3 style="margin:0 0 16px;font-size:16px;color:#00c8ff;text-transform:uppercase;letter-spacing:1px;">Plan Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Destination</td><td style="padding:8px 0;font-weight:700;text-align:right;">${country}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Plan</td><td style="padding:8px 0;font-weight:700;text-align:right;">${package_title}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Data</td><td style="padding:8px 0;font-weight:700;text-align:right;">${data_amount}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Validity</td><td style="padding:8px 0;font-weight:700;text-align:right;">${validity} days</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Price</td><td style="padding:8px 0;font-weight:700;text-align:right;color:#00c8ff;">SGD ${price}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">ICCID</td><td style="padding:8px 0;font-size:12px;text-align:right;font-family:monospace;">${iccid}</td></tr>
        </table>
      </div>

      <!-- QR Code -->
      <div style="background:rgba(0,200,255,0.05);border:1px solid rgba(0,200,255,0.2);border-radius:16px;padding:24px;margin-bottom:24px;text-align:center;">
        <h3 style="margin:0 0 8px;font-size:16px;color:#00c8ff;">Scan to Install eSIM</h3>
        <p style="color:#888;font-size:13px;margin:0 0 16px;">Use your phone's camera to scan this QR code</p>
        <img src="${qr_url}" alt="eSIM QR Code" style="width:180px;height:180px;background:#fff;padding:12px;border-radius:12px;">
        <p style="color:#666;font-size:11px;margin:12px 0 0;font-family:monospace;">${qr_code}</p>
      </div>

      <!-- Installation Steps -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;margin-bottom:24px;">
        <h3 style="margin:0 0 16px;font-size:16px;">📱 How to Install</h3>
        <ol style="margin:0;padding-left:20px;color:#888;font-size:14px;line-height:2;">
          <li>Go to <strong style="color:#fff;">Settings → Mobile/Cellular → Add eSIM</strong></li>
          <li>Tap <strong style="color:#fff;">Use QR Code</strong> and scan the code above</li>
          <li>Follow the on-screen instructions to activate</li>
          <li>Enable <strong style="color:#fff;">Data Roaming</strong> when you arrive</li>
        </ol>
      </div>

      <!-- Register Nudge -->
      <div style="background:linear-gradient(135deg,rgba(0,200,255,0.08),rgba(123,47,255,0.08));border:1px solid rgba(0,200,255,0.2);border-radius:16px;padding:24px;margin-bottom:24px;text-align:center;">
        <div style="font-size:28px;margin-bottom:8px;">🔐</div>
        <h3 style="margin:0 0 8px;font-size:16px;color:#ffffff;">Never lose your eSIM</h3>
        <p style="color:#888;font-size:13px;margin:0 0 16px;line-height:1.6;">
          Create a free account to re-download your QR codes anytime, track all your orders, and get 5 free AI itinerary searches.
        </p>
        <a href="https://esimconnect.world/register" style="display:inline-block;background:linear-gradient(135deg,#00c8ff,#7b2fff);color:#000;font-weight:800;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
          Create Free Account →
        </a>
        <p style="color:#666;font-size:12px;margin:12px 0 0;">
          Already have an account? <a href="https://esimconnect.world/login" style="color:#00c8ff;">Sign in here</a>
        </p>
      </div>

      <!-- Find My Order -->
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
        <p style="color:#888;font-size:13px;margin:0;">
          📧 Lost access to this email? <a href="https://esimconnect.world/find-order" style="color:#00c8ff;">Find your order here</a>
        </p>
      </div>

      <!-- Support -->
      <p style="color:#888;font-size:13px;text-align:center;">
        Need help? Contact us at <a href="mailto:support@esimconnect.world" style="color:#00c8ff;">support@esimconnect.world</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
      <p style="margin:0;font-size:12px;color:#444;">© 2026 Kairos Ventures Pte. Ltd. · Singapore</p>
      <p style="margin:4px 0 0;font-size:12px;color:#444;">
        <a href="https://esimconnect.world/terms" style="color:#444;">Terms & Conditions</a> · 
        <a href="https://esimconnect.world" style="color:#444;">esimconnect.world</a>
      </p>
    </div>

  </div>
</body>
</html>`
  };
}

// ── Send Email via Resend ────────────────────────────────────────────────────
async function sendEmail(emailData, resendApiKey) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });
  return response.json();
}

// ── Main Worker ──────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // ── Guest IP Rate Limit Check ────────────────────────────────────────────
    if (path === '/check-guest' && request.method === 'POST') {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const key = 'guest:' + ip;
      const body = await request.json().catch(() => ({}));
      const increment = body.increment === true;
      let record = null;
      try { record = await env.GUEST_RATE_LIMIT.get(key, { type: 'json' }); } catch(e) {}
      const now = Date.now();
      const windowMs = 24 * 60 * 60 * 1000;
      const withinWindow = record && (now - record.firstSeen) < windowMs;
      const count = withinWindow ? record.count : 0;

      if (count >= 2) {
        return new Response(JSON.stringify({ allowed: false, reason: 'rate_limited', count }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (increment) {
        const newRecord = { count: count + 1, firstSeen: withinWindow ? record.firstSeen : now };
        await env.GUEST_RATE_LIMIT.put(key, JSON.stringify(newRecord), { expirationTtl: 86400 });
        return new Response(JSON.stringify({ allowed: true, count: newRecord.count }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ allowed: true, count }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ── Claude Proxy (existing) ──────────────────────────────────────────────
    if (path === '/' || path === '') {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }
      try {
        const body = await request.json();
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Airalo Mock: Get Token ───────────────────────────────────────────────
    if (path === '/airalo/token' && request.method === 'POST') {
      return new Response(JSON.stringify({
        data: {
          token_type: 'Bearer',
          expires_in: 86400,
          access_token: 'mock_token_' + Date.now(),
        },
        meta: { message: 'success' }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ── Airalo Mock: Get Packages ────────────────────────────────────────────
    if (path === '/airalo/packages' && request.method === 'GET') {
      const countryCode = url.searchParams.get('country');
      let packages = MOCK_PACKAGES;
      if (countryCode) {
        packages = {
          ...MOCK_PACKAGES,
          data: MOCK_PACKAGES.data.filter(p =>
            p.country_code.toLowerCase() === countryCode.toLowerCase()
          )
        };
      }
      return new Response(JSON.stringify(packages), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ── Airalo Mock: Submit Order + Send Email ───────────────────────────────
    if (path === '/airalo/orders' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { package_id, user_email, user_name } = body;

        // Find the package
        let foundPackage = null;
        let foundCountry = null;
        let foundOperator = null;
        for (const country of MOCK_PACKAGES.data) {
          for (const operator of country.operators) {
            const pkg = operator.packages.find(p => p.id === package_id);
            if (pkg) {
              foundPackage = pkg;
              foundCountry = country;
              foundOperator = operator;
              break;
            }
          }
          if (foundPackage) break;
        }

        if (!foundPackage) {
          return new Response(JSON.stringify({ error: 'Package not found' }), {
            status: 422,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const iccid = generateMockIccid();
        const qrCode = generateMockQrCode(iccid);
        const qrUrl = generateMockQrUrl(iccid);
        const orderCode = 'EC-' + Date.now().toString().slice(-8);

        const orderData = {
          id: Math.floor(Math.random() * 90000) + 10000,
          code: orderCode,
          package_id: package_id,
          package_title: foundPackage.title,
          country: foundCountry.title,
          country_code: foundCountry.country_code,
          validity: foundPackage.day,
          data_amount: foundPackage.is_unlimited ? 'Unlimited' : (foundPackage.amount / 1024) + ' GB',
          price: (foundPackage.price * 1.35).toFixed(2), // Convert to SGD approx
          currency: 'SGD',
          iccid: iccid,
          qr_code: qrCode,
          qr_url: qrUrl,
          order_code: orderCode,
          created_at: new Date().toISOString(),
          sims: [{
            id: Math.floor(Math.random() * 90000),
            iccid: iccid,
            qrcode: qrCode,
            qrcode_url: qrUrl,
            lpa: 'sandbox.airalo.com',
            matching_id: iccid.slice(-8),
          }]
        };

        // Send confirmation email if user_email provided
        if (user_email && env.RESEND_API_KEY) {
          const emailData = orderConfirmationEmail(orderData, user_email);
          await sendEmail(emailData, env.RESEND_API_KEY);
        }

        return new Response(JSON.stringify({
          data: orderData,
          meta: { message: 'success' }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ── Send Email directly ──────────────────────────────────────────────────
    if (path === '/send-email' && request.method === 'POST') {
      try {
        const body = await request.json();
        const result = await sendEmail(body, env.RESEND_API_KEY);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not found', { status: 404 });
  }
};
