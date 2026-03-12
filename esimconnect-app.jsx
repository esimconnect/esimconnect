import { useState, useEffect, useCallback } from "react";

// ============================================================
// AIRALO API SERVICE LAYER
// Swap AIRALO_CONFIG for real credentials when approved
// ============================================================
const AIRALO_CONFIG = {
  baseUrl: "https://sandbox-partners-api.airalo.com/v2",
  // Production: "https://partners-api.airalo.com/v2"
  clientId: "YOUR_CLIENT_ID",       // From Airalo Partner Portal
  clientSecret: "YOUR_CLIENT_SECRET" // From Airalo Partner Portal
};

const AiraloAPI = {
  token: null,
  tokenExpiry: null,

  async getToken() {
    if (this.token && this.tokenExpiry > Date.now()) return this.token;
    try {
      const res = await fetch(`${AIRALO_CONFIG.baseUrl}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
        body: new URLSearchParams({
          client_id: AIRALO_CONFIG.clientId,
          client_secret: AIRALO_CONFIG.clientSecret,
          grant_type: "client_credentials"
        })
      });
      const data = await res.json();
      this.token = data.data?.access_token;
      this.tokenExpiry = Date.now() + (data.data?.expires_in || 3600) * 1000;
      return this.token;
    } catch (e) {
      console.error("Token error:", e);
      return null;
    }
  },

  async request(endpoint, options = {}) {
    const token = await this.getToken();
    if (!token) throw new Error("Authentication failed");
    const res = await fetch(`${AIRALO_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json", "Content-Type": "application/json", ...options.headers }
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },

  async getCountries() {
    const data = await this.request("/countries?limit=50");
    return data.data || [];
  },

  async getPackages(countryCode) {
    const data = await this.request(`/packages?filter[country]=${countryCode}&limit=20`);
    return data.data || [];
  },

  async createOrder(packageId, qty = 1) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify({ package_id: packageId, quantity: qty, type: "sim" })
    });
  },

  async getOrder(orderId) {
    return this.request(`/orders/${orderId}`);
  },

  async getEsim(iccid) {
    return this.request(`/sims/${iccid}`);
  }
};

// ============================================================
// MOCK DATA — Used while awaiting Airalo credentials
// Replace automatically once API is connected
// ============================================================
const MOCK_COUNTRIES = [
  { id: "japan", name: "Japan", image: { url: "https://flagcdn.com/w80/jp.png" }, slug: "japan" },
  { id: "south-korea", name: "South Korea", image: { url: "https://flagcdn.com/w80/kr.png" }, slug: "south-korea" },
  { id: "thailand", name: "Thailand", image: { url: "https://flagcdn.com/w80/th.png" }, slug: "thailand" },
  { id: "australia", name: "Australia", image: { url: "https://flagcdn.com/w80/au.png" }, slug: "australia" },
  { id: "united-kingdom", name: "United Kingdom", image: { url: "https://flagcdn.com/w80/gb.png" }, slug: "united-kingdom" },
  { id: "united-states", name: "United States", image: { url: "https://flagcdn.com/w80/us.png" }, slug: "united-states" },
  { id: "taiwan", name: "Taiwan", image: { url: "https://flagcdn.com/w80/tw.png" }, slug: "taiwan" },
  { id: "hong-kong", name: "Hong Kong", image: { url: "https://flagcdn.com/w80/hk.png" }, slug: "hong-kong" },
  { id: "france", name: "France", image: { url: "https://flagcdn.com/w80/fr.png" }, slug: "france" },
  { id: "germany", name: "Germany", image: { url: "https://flagcdn.com/w80/de.png" }, slug: "germany" },
  { id: "italy", name: "Italy", image: { url: "https://flagcdn.com/w80/it.png" }, slug: "italy" },
  { id: "indonesia", name: "Indonesia", image: { url: "https://flagcdn.com/w80/id.png" }, slug: "indonesia" },
  { id: "malaysia", name: "Malaysia", image: { url: "https://flagcdn.com/w80/my.png" }, slug: "malaysia" },
  { id: "vietnam", name: "Vietnam", image: { url: "https://flagcdn.com/w80/vn.png" }, slug: "vietnam" },
  { id: "philippines", name: "Philippines", image: { url: "https://flagcdn.com/w80/ph.png" }, slug: "philippines" },
  { id: "china", name: "China", image: { url: "https://flagcdn.com/w80/cn.png" }, slug: "china" },
];

const MOCK_PACKAGES = {
  japan: [
    { id: "jp-1gb-7d", type: "local", title: "Japan 1GB / 7 Days", data: "1 GB", day: 7, price: 4.50, is_unlimited: false, speed: "LTE", net_price: 2.80 },
    { id: "jp-3gb-15d", type: "local", title: "Japan 3GB / 15 Days", data: "3 GB", day: 15, price: 9.50, is_unlimited: false, speed: "LTE", net_price: 6.20 },
    { id: "jp-5gb-30d", type: "local", title: "Japan 5GB / 30 Days", data: "5 GB", day: 30, price: 14.50, is_unlimited: false, speed: "LTE", net_price: 9.80 },
    { id: "jp-unlimited-7d", type: "local", title: "Japan Unlimited / 7 Days", data: "Unlimited", day: 7, price: 18.00, is_unlimited: true, speed: "LTE", net_price: 12.50 },
  ],
  "south-korea": [
    { id: "kr-1gb-7d", type: "local", title: "Korea 1GB / 7 Days", data: "1 GB", day: 7, price: 4.20, is_unlimited: false, speed: "LTE", net_price: 2.60 },
    { id: "kr-3gb-15d", type: "local", title: "Korea 3GB / 15 Days", data: "3 GB", day: 15, price: 8.90, is_unlimited: false, speed: "LTE", net_price: 5.80 },
    { id: "kr-unlimited-7d", type: "local", title: "Korea Unlimited / 7 Days", data: "Unlimited", day: 7, price: 16.50, is_unlimited: true, speed: "5G", net_price: 11.20 },
  ],
  thailand: [
    { id: "th-3gb-7d", type: "local", title: "Thailand 3GB / 7 Days", data: "3 GB", day: 7, price: 6.50, is_unlimited: false, speed: "LTE", net_price: 3.90 },
    { id: "th-unlimited-15d", type: "local", title: "Thailand Unlimited / 15 Days", data: "Unlimited", day: 15, price: 15.00, is_unlimited: true, speed: "LTE", net_price: 9.50 },
  ]
};

const getPackagesForCountry = (slug) => MOCK_PACKAGES[slug] || [
  { id: `${slug}-3gb-7d`, type: "local", title: `3GB / 7 Days`, data: "3 GB", day: 7, price: 8.50, is_unlimited: false, speed: "LTE", net_price: 5.50 },
  { id: `${slug}-5gb-15d`, type: "local", title: `5GB / 15 Days`, data: "5 GB", day: 15, price: 13.00, is_unlimited: false, speed: "LTE", net_price: 8.50 },
  { id: `${slug}-unlimited-7d`, type: "local", title: `Unlimited / 7 Days`, data: "Unlimited", day: 7, price: 19.00, is_unlimited: true, speed: "LTE", net_price: 13.00 },
];

// ============================================================
// UTILITIES
// ============================================================
const SGD = (amount) => `S$${Number(amount).toFixed(2)}`;
const GST_RATE = 0.09;
const withGST = (price) => price * (1 + GST_RATE);

const POPULAR = ["japan", "south-korea", "thailand", "australia", "united-kingdom", "united-states"];

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

  :root {
    --bg: #070B14;
    --surface: #0D1425;
    --surface2: #131C33;
    --border: rgba(255,255,255,0.07);
    --accent: #00E5FF;
    --accent2: #7B61FF;
    --green: #00E096;
    --orange: #FF9500;
    --red: #FF3B5C;
    --text: #F0F4FF;
    --muted: #6B7A9F;
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --nav-h: 72px;
    --radius: 16px;
    --phone-w: 390px;
    --phone-h: 844px;
  }

  body {
    background: #0a0a0f;
    color: var(--text);
    font-family: var(--font-body);
    min-height: 100vh;
    overflow-x: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* DESKTOP OUTER WRAPPER */
  .phone-stage {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    width: 100%;
    padding: 40px 20px;
    background: radial-gradient(ellipse at 50% 0%, rgba(0,229,255,0.06) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 100%, rgba(123,97,255,0.05) 0%, transparent 50%),
                #0a0a0f;
  }

  /* PHONE FRAME */
  .phone-frame {
    width: var(--phone-w);
    height: var(--phone-h);
    background: #1a1a2e;
    border-radius: 54px;
    padding: 12px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.08),
      0 0 0 2px rgba(255,255,255,0.03),
      0 40px 80px rgba(0,0,0,0.8),
      0 0 120px rgba(0,229,255,0.06),
      inset 0 1px 0 rgba(255,255,255,0.1);
    position: relative;
    flex-shrink: 0;
  }

  /* SIDE BUTTONS */
  .phone-frame::before {
    content: '';
    position: absolute;
    right: -3px;
    top: 120px;
    width: 3px;
    height: 60px;
    background: #2a2a3e;
    border-radius: 0 3px 3px 0;
    box-shadow: 0 80px 0 #2a2a3e;
  }
  .phone-frame::after {
    content: '';
    position: absolute;
    left: -3px;
    top: 100px;
    width: 3px;
    height: 36px;
    background: #2a2a3e;
    border-radius: 3px 0 0 3px;
    box-shadow: 0 50px 0 #2a2a3e, 0 96px 0 #2a2a3e;
  }

  /* PHONE SCREEN */
  .phone-screen {
    width: 100%;
    height: 100%;
    border-radius: 44px;
    overflow: hidden;
    background: var(--bg);
    position: relative;
  }

  /* DYNAMIC ISLAND */
  .dynamic-island {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 126px;
    height: 37px;
    background: #000;
    border-radius: 20px;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .island-camera {
    width: 12px; height: 12px; border-radius: 50%;
    background: #1a1a1a;
    border: 2px solid #0d0d0d;
    position: relative;
  }
  .island-camera::after {
    content: '';
    position: absolute;
    top: 2px; left: 2px;
    width: 4px; height: 4px;
    border-radius: 50%;
    background: #2a2a4a;
  }
  .island-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #1a1a1a;
  }

  /* STATUS BAR */
  .status-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 54px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 0 28px 8px;
    z-index: 150;
    pointer-events: none;
  }
  .status-time {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }
  .status-icons {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text);
  }

  /* SCROLL AREA */
  .phone-scroll {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }
  .phone-scroll::-webkit-scrollbar { width: 0; }

  .app {
    width: 100%;
    min-height: 100%;
    position: relative;
    background: var(--bg);
  }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 0; }

  /* SCREENS */
  .screen {
    min-height: 100vh;
    padding-bottom: calc(var(--nav-h) + 16px);
    animation: fadeUp 0.3s ease;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* HEADER */
  .header {
    padding: 56px 20px 20px;
    background: linear-gradient(180deg, rgba(0,229,255,0.06) 0%, transparent 100%);
  }
  .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .logo { font-family: var(--font-display); font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
  .logo span { color: var(--accent); }
  .header-badge {
    background: rgba(0,229,255,0.1);
    border: 1px solid rgba(0,229,255,0.2);
    color: var(--accent);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  /* SEARCH */
  .search-wrap { position: relative; margin-bottom: 8px; }
  .search-input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px 14px 14px 46px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
  }
  .search-input:focus { border-color: rgba(0,229,255,0.3); }
  .search-input::placeholder { color: var(--muted); }
  .search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: var(--muted); font-size: 18px;
  }

  /* SECTION */
  .section { padding: 0 20px; margin-bottom: 28px; }
  .section-title {
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 14px;
  }

  /* ACTIVE PLAN BANNER */
  .active-banner {
    margin: 0 20px 24px;
    background: linear-gradient(135deg, rgba(0,229,255,0.12), rgba(123,97,255,0.12));
    border: 1px solid rgba(0,229,255,0.2);
    border-radius: var(--radius);
    padding: 16px;
    cursor: pointer;
    transition: transform 0.2s;
  }
  .active-banner:active { transform: scale(0.98); }
  .active-banner-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .active-banner-country { display: flex; align-items: center; gap: 10px; }
  .active-banner-flag { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
  .active-banner-name { font-weight: 600; font-size: 15px; }
  .active-badge {
    background: rgba(0,224,150,0.15);
    color: var(--green);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
  }
  .usage-bar-wrap { margin-bottom: 8px; }
  .usage-bar-bg {
    height: 6px;
    background: rgba(255,255,255,0.08);
    border-radius: 3px;
    overflow: hidden;
  }
  .usage-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
  }
  .usage-bar-fill.green { background: linear-gradient(90deg, var(--green), #00C47A); }
  .usage-bar-fill.orange { background: linear-gradient(90deg, var(--orange), #FF6B00); }
  .usage-bar-fill.red { background: linear-gradient(90deg, var(--red), #CC1A3A); }
  .usage-meta { display: flex; justify-content: space-between; margin-top: 6px; font-size: 12px; color: var(--muted); }

  /* POPULAR GRID */
  .popular-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .country-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }
  .country-card:active { transform: scale(0.95); background: var(--surface2); }
  .country-card:hover { border-color: rgba(0,229,255,0.2); }
  .country-flag { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
  .country-name { font-size: 12px; font-weight: 500; color: var(--text); line-height: 1.3; }

  /* ALL COUNTRIES LIST */
  .country-list { display: flex; flex-direction: column; gap: 2px; }
  .country-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: var(--surface);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 4px;
  }
  .country-row:active { background: var(--surface2); transform: scale(0.99); }
  .country-row-flag { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
  .country-row-info { flex: 1; }
  .country-row-name { font-weight: 500; font-size: 15px; }
  .country-row-plans { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .country-row-arrow { color: var(--muted); font-size: 18px; }

  /* PLAN CARDS */
  .plans-header {
    padding: 56px 20px 20px;
    background: linear-gradient(180deg, rgba(123,97,255,0.06) 0%, transparent 100%);
  }
  .back-btn {
    display: flex; align-items: center; gap: 6px;
    color: var(--accent); font-size: 14px; font-weight: 600;
    cursor: pointer; margin-bottom: 16px;
    background: none; border: none;
  }
  .plans-country { display: flex; align-items: center; gap: 14px; margin-bottom: 6px; }
  .plans-country-flag { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; box-shadow: 0 6px 20px rgba(0,0,0,0.4); }
  .plans-country-name { font-family: var(--font-display); font-size: 28px; font-weight: 800; }
  .plans-subtitle { color: var(--muted); font-size: 14px; margin-top: 4px; }

  .plan-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    margin: 0 20px 12px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }
  .plan-card:active { transform: scale(0.98); }
  .plan-card:hover { border-color: rgba(0,229,255,0.2); }
  .plan-card.popular { border-color: rgba(0,229,255,0.3); }
  .plan-card.popular::before {
    content: '⚡ POPULAR';
    position: absolute; top: 0; right: 0;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #000;
    font-size: 9px; font-weight: 800; letter-spacing: 1px;
    padding: 4px 10px;
    border-bottom-left-radius: 10px;
  }
  .plan-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .plan-data { font-family: var(--font-display); font-size: 32px; font-weight: 800; line-height: 1; }
  .plan-data span { font-size: 16px; font-weight: 600; color: var(--muted); }
  .plan-price-wrap { text-align: right; }
  .plan-price { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--accent); }
  .plan-price-gst { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .plan-tags { display: flex; gap: 8px; flex-wrap: wrap; }
  .plan-tag {
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--border);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
    color: var(--muted);
    display: flex; align-items: center; gap: 4px;
  }
  .plan-tag.speed { color: var(--accent); border-color: rgba(0,229,255,0.2); background: rgba(0,229,255,0.06); }

  /* CHECKOUT */
  .checkout-screen { min-height: 100vh; padding: 0 0 100px; }
  .checkout-header {
    padding: 56px 20px 24px;
    background: linear-gradient(180deg, rgba(0,224,150,0.06) 0%, transparent 100%);
  }
  .checkout-step {
    display: flex; gap: 8px; margin-bottom: 20px;
  }
  .step-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--border);
    transition: all 0.3s;
  }
  .step-dot.active { background: var(--accent); box-shadow: 0 0 10px var(--accent); }
  .step-dot.done { background: var(--green); }
  .checkout-title { font-family: var(--font-display); font-size: 26px; font-weight: 800; }
  .checkout-subtitle { color: var(--muted); font-size: 14px; margin-top: 4px; }

  .order-summary {
    margin: 0 20px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .order-summary-header {
    background: linear-gradient(135deg, rgba(0,229,255,0.1), rgba(123,97,255,0.1));
    padding: 16px 18px;
    display: flex; align-items: center; gap: 12px;
  }
  .order-flag { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
  .order-plan-name { font-weight: 700; font-size: 15px; }
  .order-country { color: var(--muted); font-size: 13px; margin-top: 2px; }
  .order-specs {
    padding: 16px 18px;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 12px;
    border-bottom: 1px solid var(--border);
  }
  .spec-item label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
  .spec-item value { font-weight: 700; font-size: 15px; }
  .order-pricing { padding: 16px 18px; }
  .price-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
  .price-row.total {
    font-weight: 700; font-size: 16px;
    border-top: 1px solid var(--border);
    padding-top: 12px; margin-top: 4px;
    color: var(--accent);
  }
  .price-label { color: var(--muted); }

  /* PAYMENT */
  .payment-methods { margin: 0 20px 20px; display: flex; flex-direction: column; gap: 10px; }
  .payment-option {
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    display: flex; align-items: center; gap: 14px;
    cursor: pointer; transition: all 0.2s;
  }
  .payment-option.selected { border-color: var(--accent); background: rgba(0,229,255,0.05); }
  .payment-icon {
    width: 44px; height: 44px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    background: rgba(255,255,255,0.06);
  }
  .payment-info { flex: 1; }
  .payment-name { font-weight: 600; font-size: 15px; }
  .payment-desc { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .payment-check { font-size: 20px; color: var(--accent); }

  /* CARD INPUT */
  .card-form { margin: 0 20px 20px; }
  .input-group { margin-bottom: 14px; }
  .input-label { font-size: 12px; color: var(--muted); margin-bottom: 6px; display: block; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
  .input-field {
    width: 100%; background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px; padding: 14px 16px;
    color: var(--text); font-family: var(--font-body); font-size: 15px;
    outline: none; transition: border-color 0.2s;
  }
  .input-field:focus { border-color: rgba(0,229,255,0.4); }
  .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* CTA BUTTON */
  .cta-wrap {
    position: sticky; bottom: 0;
    width: 100%;
    padding: 16px 20px 20px;
    background: linear-gradient(180deg, transparent 0%, var(--bg) 30%);
  }
  .cta-btn {
    width: 100%; padding: 18px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #000; font-family: var(--font-display);
    font-size: 16px; font-weight: 800; letter-spacing: 0.5px;
    border: none; border-radius: 14px; cursor: pointer;
    transition: all 0.2s; box-shadow: 0 8px 24px rgba(0,229,255,0.3);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .cta-btn:active { transform: scale(0.98); box-shadow: 0 4px 12px rgba(0,229,255,0.2); }
  .cta-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .cta-btn.secondary {
    background: var(--surface);
    color: var(--text);
    box-shadow: none;
    border: 1px solid var(--border);
  }

  /* CONFIRMATION */
  .confirm-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 80px 20px 120px; }
  .confirm-icon { font-size: 80px; margin-bottom: 20px; animation: bounce 0.6s ease; }
  @keyframes bounce { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
  .confirm-title { font-family: var(--font-display); font-size: 30px; font-weight: 800; text-align: center; margin-bottom: 8px; }
  .confirm-subtitle { color: var(--muted); text-align: center; margin-bottom: 32px; font-size: 15px; }
  .qr-container {
    background: white; border-radius: 20px; padding: 24px;
    margin-bottom: 24px; width: 220px; height: 220px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    box-shadow: 0 20px 60px rgba(0,229,255,0.2);
  }
  .qr-placeholder { font-size: 120px; line-height: 1; }
  .qr-label { font-size: 11px; color: #666; margin-top: 8px; font-weight: 600; }
  .instructions {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    margin-bottom: 16px;
  }
  .instructions-title { font-weight: 700; margin-bottom: 12px; font-size: 14px; }
  .instruction-step { display: flex; gap: 12px; margin-bottom: 10px; align-items: flex-start; }
  .instruction-num {
    width: 24px; height: 24px; border-radius: 50%;
    background: rgba(0,229,255,0.15); color: var(--accent);
    font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 1px;
  }
  .instruction-text { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* MY PLANS */
  .plans-tabs { display: flex; margin: 0 20px 20px; background: var(--surface); border-radius: 12px; padding: 4px; }
  .plans-tab {
    flex: 1; padding: 10px; text-align: center;
    font-size: 13px; font-weight: 600; border-radius: 10px;
    cursor: pointer; transition: all 0.2s; color: var(--muted);
  }
  .plans-tab.active { background: var(--surface2); color: var(--text); }

  .esim-card {
    margin: 0 20px 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .esim-card-header {
    padding: 14px 16px;
    display: flex; align-items: center; gap: 12px;
    border-bottom: 1px solid var(--border);
  }
  .esim-flag { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
  .esim-info { flex: 1; }
  .esim-country { font-weight: 600; font-size: 15px; }
  .esim-plan { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .esim-status { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .esim-status.active { background: rgba(0,224,150,0.15); color: var(--green); }
  .esim-status.expired { background: rgba(255,59,92,0.15); color: var(--red); }
  .esim-body { padding: 14px 16px; }
  .esim-usage { margin-bottom: 12px; }
  .esim-usage-meta { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
  .esim-usage-remaining { font-weight: 700; }
  .esim-usage-total { color: var(--muted); }
  .esim-actions { display: flex; gap: 8px; }
  .esim-action-btn {
    flex: 1; padding: 10px; border-radius: 10px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    border: 1px solid var(--border); background: var(--surface2);
    color: var(--text); transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .esim-action-btn.primary { background: rgba(0,229,255,0.1); color: var(--accent); border-color: rgba(0,229,255,0.2); }
  .esim-action-btn:active { transform: scale(0.97); }

  /* HISTORY */
  .history-item {
    margin: 0 20px 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 16px;
    display: flex; align-items: center; gap: 12px;
  }
  .history-flag { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
  .history-info { flex: 1; }
  .history-country { font-weight: 600; font-size: 14px; }
  .history-plan { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .history-right { text-align: right; }
  .history-amount { font-weight: 700; font-size: 14px; color: var(--accent); }
  .history-date { font-size: 11px; color: var(--muted); margin-top: 2px; }

  /* ADMIN */
  .admin-screen { min-height: 100vh; padding-bottom: calc(var(--nav-h) + 16px); }
  .admin-header {
    padding: 56px 20px 20px;
    background: linear-gradient(180deg, rgba(255,149,0,0.06) 0%, transparent 100%);
  }
  .admin-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; }
  .admin-subtitle { color: var(--muted); font-size: 14px; margin-top: 4px; }
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 0 20px 24px; }
  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius); padding: 16px;
  }
  .stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .stat-value { font-family: var(--font-display); font-size: 26px; font-weight: 800; }
  .stat-value.green { color: var(--green); }
  .stat-value.accent { color: var(--accent); }
  .stat-value.orange { color: var(--orange); }
  .stat-change { font-size: 11px; color: var(--green); margin-top: 4px; }
  .wallet-card {
    margin: 0 20px 24px;
    background: linear-gradient(135deg, rgba(255,149,0,0.12), rgba(255,59,92,0.08));
    border: 1px solid rgba(255,149,0,0.2);
    border-radius: var(--radius); padding: 18px;
  }
  .wallet-label { font-size: 12px; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .wallet-balance { font-family: var(--font-display); font-size: 36px; font-weight: 800; color: var(--orange); }
  .wallet-warning { font-size: 12px; color: var(--orange); margin-top: 8px; display: flex; align-items: center; gap: 6px; }
  .recent-header { display: flex; justify-content: space-between; align-items: center; padding: 0 20px; margin-bottom: 14px; }
  .recent-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; }
  .recent-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 20px; border-bottom: 1px solid var(--border);
  }
  .recent-flag { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
  .recent-info { flex: 1; }
  .recent-customer { font-size: 13px; font-weight: 600; }
  .recent-plan { font-size: 11px; color: var(--muted); margin-top: 1px; }
  .recent-amount { font-size: 13px; font-weight: 700; color: var(--green); }

  /* PROFILE */
  .profile-screen { min-height: 100vh; padding-bottom: calc(var(--nav-h) + 16px); }
  .profile-header { padding: 56px 20px 24px; text-align: center; }
  .profile-avatar {
    width: 80px; height: 80px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; margin: 0 auto 14px;
    box-shadow: 0 8px 24px rgba(0,229,255,0.3);
  }
  .profile-name { font-family: var(--font-display); font-size: 22px; font-weight: 800; }
  .profile-email { color: var(--muted); font-size: 14px; margin-top: 4px; }
  .loyalty-card {
    margin: 0 20px 24px;
    background: linear-gradient(135deg, rgba(123,97,255,0.15), rgba(0,229,255,0.1));
    border: 1px solid rgba(123,97,255,0.3);
    border-radius: var(--radius); padding: 18px;
  }
  .loyalty-tier { font-size: 11px; color: var(--accent2); font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
  .loyalty-points { font-family: var(--font-display); font-size: 32px; font-weight: 800; }
  .loyalty-label { color: var(--muted); font-size: 13px; margin-top: 4px; }
  .loyalty-note { font-size: 11px; color: var(--muted); margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08); }
  .menu-section { margin: 0 20px 24px; }
  .menu-item {
    display: flex; align-items: center; gap: 14px;
    padding: 16px; background: var(--surface);
    border: 1px solid var(--border); border-radius: 12px;
    margin-bottom: 8px; cursor: pointer; transition: all 0.2s;
  }
  .menu-item:active { background: var(--surface2); }
  .menu-icon { font-size: 20px; width: 36px; text-align: center; }
  .menu-label { flex: 1; font-size: 15px; font-weight: 500; }
  .menu-arrow { color: var(--muted); }

  /* VIRTUAL NUMBER */
  .vn-card {
    margin: 0 20px 16px;
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: all 0.2s;
  }
  .vn-card.selected-yes { border-color: var(--green); background: rgba(0,224,150,0.04); }
  .vn-card.selected-no { border-color: var(--border); opacity: 0.6; }
  .vn-header {
    padding: 16px 18px;
    display: flex; align-items: center; gap: 14px;
  }
  .vn-icon {
    width: 48px; height: 48px; border-radius: 12px;
    background: rgba(0,229,255,0.1);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; flex-shrink: 0;
  }
  .vn-info { flex: 1; }
  .vn-title { font-weight: 700; font-size: 15px; margin-bottom: 3px; }
  .vn-price { font-size: 12px; color: var(--accent); font-weight: 600; }
  .vn-toggle {
    display: flex; background: var(--surface2);
    border-radius: 10px; padding: 3px; gap: 3px;
  }
  .vn-toggle-btn {
    padding: 8px 16px; border-radius: 8px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    border: none; background: transparent;
    color: var(--muted); transition: all 0.2s;
  }
  .vn-toggle-btn.yes.active { background: var(--green); color: #000; }
  .vn-toggle-btn.no.active { background: var(--surface); color: var(--text); }
  .vn-explainer {
    border-top: 1px solid var(--border);
    padding: 16px 18px;
  }
  .vn-why-btn {
    display: flex; align-items: center; gap: 8px;
    background: none; border: none;
    color: var(--accent); font-size: 13px;
    font-weight: 600; cursor: pointer;
    font-family: var(--font-body);
    margin-bottom: 12px;
  }
  .vn-reasons { display: flex; flex-direction: column; gap: 8px; }
  .vn-reason {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: 13px; line-height: 1.5;
  }
  .vn-reason-icon { flex-shrink: 0; font-size: 16px; margin-top: 1px; }
  .vn-reason-text { color: var(--muted); }
  .vn-reason-text strong { color: var(--text); }
  .vn-home-country {
    margin: 0 20px 16px;
    background: var(--surface);
    border: 1px solid rgba(0,229,255,0.2);
    border-radius: var(--radius);
    padding: 16px 18px;
    animation: fadeUp 0.3s ease;
  }
  .vn-home-label { font-size: 12px; color: var(--muted); margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

  /* EWALLET */
  .wallet-screen { min-height: 100vh; padding-bottom: calc(var(--nav-h) + 16px); }
  .wallet-header {
    padding: 56px 20px 24px;
    background: linear-gradient(180deg, rgba(0,224,150,0.06) 0%, transparent 100%);
  }
  .wallet-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; }
  .wallet-subtitle { color: var(--muted); font-size: 14px; margin-top: 4px; }
  .wallet-balance-card {
    margin: 0 20px 20px;
    background: linear-gradient(135deg, rgba(0,224,150,0.12), rgba(0,229,255,0.08));
    border: 1px solid rgba(0,224,150,0.25);
    border-radius: var(--radius);
    padding: 24px 20px;
    text-align: center;
  }
  .wallet-balance-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .wallet-balance-amount { font-family: var(--font-display); font-size: 52px; font-weight: 800; color: var(--green); line-height: 1; }
  .wallet-balance-currency { font-size: 20px; color: var(--muted); margin-bottom: 4px; }
  .wallet-balance-note { font-size: 12px; color: var(--muted); margin-top: 8px; }
  .wallet-alert {
    margin: 0 20px 16px;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 13px; font-weight: 500;
    display: flex; align-items: center; gap: 10px;
  }
  .wallet-alert.low { background: rgba(255,149,0,0.1); border: 1px solid rgba(255,149,0,0.2); color: var(--orange); }
  .wallet-alert.critical { background: rgba(255,59,92,0.1); border: 1px solid rgba(255,59,92,0.2); color: var(--red); }
  .topup-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 0 20px 20px; }
  .topup-btn {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px; padding: 12px 6px;
    text-align: center; cursor: pointer;
    transition: all 0.2s; color: var(--text);
  }
  .topup-btn:active { background: var(--surface2); transform: scale(0.97); }
  .topup-btn:hover { border-color: rgba(0,224,150,0.3); }
  .topup-btn.custom { border-style: dashed; color: var(--muted); }
  .topup-amount { font-family: var(--font-display); font-size: 15px; font-weight: 800; display: block; }
  .topup-label { font-size: 10px; color: var(--muted); margin-top: 2px; display: block; }
  .auto-topup-card {
    margin: 0 20px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 18px;
  }
  .auto-topup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .auto-topup-title { font-weight: 700; font-size: 15px; }
  .toggle-switch {
    width: 44px; height: 24px; border-radius: 12px;
    background: var(--border); cursor: pointer;
    position: relative; transition: background 0.2s;
  }
  .toggle-switch.on { background: var(--green); }
  .toggle-switch::after {
    content: ''; position: absolute;
    width: 18px; height: 18px; border-radius: 50%;
    background: white; top: 3px; left: 3px;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  .toggle-switch.on::after { transform: translateX(20px); }
  .auto-topup-details { font-size: 13px; color: var(--muted); line-height: 1.6; }
  .auto-topup-details span { color: var(--text); font-weight: 600; }
  .tx-header { display: flex; justify-content: space-between; align-items: center; padding: 0 20px; margin-bottom: 14px; }
  .tx-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; }
  .tx-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 20px; border-bottom: 1px solid var(--border);
  }
  .tx-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .tx-icon.topup { background: rgba(0,224,150,0.12); }
  .tx-icon.deduction { background: rgba(255,59,92,0.08); }
  .tx-info { flex: 1; }
  .tx-desc { font-size: 13px; font-weight: 500; }
  .tx-date { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .tx-amount { font-size: 14px; font-weight: 700; }
  .tx-amount.topup { color: var(--green); }
  .tx-amount.deduction { color: var(--muted); }
  .tx-balance { font-size: 11px; color: var(--muted); text-align: right; margin-top: 2px; }

  /* DIALLER */
  .dialler-screen { min-height: 100vh; padding-bottom: calc(var(--nav-h) + 16px); display: flex; flex-direction: column; }
  .dialler-header { padding: 56px 20px 20px; display: flex; align-items: center; justify-content: space-between; }
  .dialler-from {
    margin: 0 20px 16px;
    background: var(--surface);
    border: 1px solid rgba(0,229,255,0.15);
    border-radius: 12px;
    padding: 12px 16px;
    display: flex; align-items: center; gap: 10px;
  }
  .dialler-from-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .dialler-from-number { font-size: 13px; font-weight: 700; color: var(--accent); }
  .dialler-display {
    margin: 0 20px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    min-height: 72px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .dialler-number {
    font-family: var(--font-display);
    font-size: 28px; font-weight: 800;
    letter-spacing: 2px; flex: 1;
    color: var(--text);
  }
  .dialler-number.empty { color: var(--muted); font-size: 16px; font-weight: 400; font-family: var(--font-body); }
  .dialler-delete {
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; cursor: pointer;
    color: var(--muted); border-radius: 8px;
    background: none; border: none;
  }
  .dialler-rate {
    margin: 0 20px 16px;
    padding: 10px 16px;
    background: rgba(0,224,150,0.06);
    border: 1px solid rgba(0,224,150,0.15);
    border-radius: 10px;
    font-size: 12px; color: var(--green);
    display: flex; justify-content: space-between;
    font-weight: 600;
  }
  .dial-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px; margin: 0 20px 20px;
  }
  .dial-key {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 14px 8px;
    text-align: center; cursor: pointer;
    transition: all 0.1s; user-select: none;
  }
  .dial-key:active { background: var(--surface2); transform: scale(0.95); }
  .dial-key-num { font-family: var(--font-display); font-size: 22px; font-weight: 800; display: block; }
  .dial-key-letters { font-size: 9px; color: var(--muted); letter-spacing: 1px; display: block; margin-top: 1px; min-height: 12px; }
  .dial-call-btn {
    width: 68px; height: 68px; border-radius: 50%;
    background: var(--green); border: none;
    font-size: 26px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto; box-shadow: 0 4px 20px rgba(0,224,150,0.35);
    transition: all 0.2s;
  }
  .dial-call-btn:active { transform: scale(0.95); }
  .dial-call-btn.end { background: var(--red); box-shadow: 0 4px 20px rgba(255,59,92,0.35); }
  .dial-call-btn.disabled { background: var(--border); box-shadow: none; cursor: not-allowed; }
  /* IN-CALL SCREEN */
  .incall-screen {
    min-height: 100vh;
    background: linear-gradient(180deg, #0d1b2a 0%, #0a0a1a 100%);
    display: flex; flex-direction: column;
    align-items: center; padding: 80px 20px 40px;
  }
  .incall-avatar {
    width: 90px; height: 90px; border-radius: 50%;
    background: linear-gradient(135deg, rgba(0,229,255,0.2), rgba(0,224,150,0.1));
    border: 2px solid rgba(0,229,255,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 40px; margin-bottom: 20px;
  }
  .incall-number { font-family: var(--font-display); font-size: 26px; font-weight: 800; margin-bottom: 6px; }
  .incall-status { font-size: 14px; color: var(--muted); margin-bottom: 6px; }
  .incall-duration { font-family: var(--font-display); font-size: 20px; color: var(--green); font-weight: 700; margin-bottom: 40px; }
  .incall-cost { font-size: 12px; color: var(--muted); margin-bottom: 40px; }
  .incall-controls {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 16px; width: 100%; max-width: 280px; margin-bottom: 40px;
  }
  .incall-ctrl {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    cursor: pointer;
  }
  .incall-ctrl-btn {
    width: 56px; height: 56px; border-radius: 50%;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; transition: all 0.2s;
  }
  .incall-ctrl-btn.active { background: rgba(0,224,150,0.2); border-color: rgba(0,224,150,0.3); }
  .incall-ctrl-label { font-size: 11px; color: var(--muted); }
  /* POST CALL */
  .postcall-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px; margin: 0 20px 20px;
    text-align: center;
  }
  .postcall-title { font-family: var(--font-display); font-size: 20px; font-weight: 800; margin-bottom: 16px; }
  .postcall-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 14px; }
  .postcall-row:last-child { border-bottom: none; font-weight: 700; }


  /* ── TRAVEL COMPANION ── */
  .companion-screen { min-height: 100vh; padding-bottom: calc(var(--nav-h) + 16px); }
  .companion-hero {
    background: linear-gradient(135deg, rgba(0,229,255,0.12), rgba(0,224,150,0.08));
    border-bottom: 1px solid var(--border);
    padding: 20px 20px 0;
  }
  .companion-back {
    background: none; border: none; color: var(--muted);
    font-size: 14px; font-family: var(--font-body);
    cursor: pointer; padding: 0; margin-bottom: 16px;
    display: flex; align-items: center; gap: 6px;
  }
  .companion-flag { font-size: 40px; margin-bottom: 8px; display: block; }
  .companion-country-name {
    font-family: var(--font-display); font-size: 26px;
    font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px;
  }
  .companion-subtitle { font-size: 13px; color: var(--muted); margin-bottom: 20px; }
  .companion-tabs {
    display: flex; gap: 4px; overflow-x: auto;
    padding-bottom: 0; scrollbar-width: none;
  }
  .companion-tabs::-webkit-scrollbar { display: none; }
  .comp-tab {
    padding: 10px 18px; border-radius: 10px 10px 0 0;
    font-size: 13px; font-weight: 600; cursor: pointer;
    white-space: nowrap; border: none;
    background: transparent; color: var(--muted);
    font-family: var(--font-body);
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }
  .comp-tab.active { color: var(--accent); border-bottom-color: var(--accent); background: rgba(0,229,255,0.06); }
  .companion-body { padding: 20px; }
  .comp-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 60px 20px; gap: 16px;
  }
  .comp-loading-spinner {
    width: 48px; height: 48px; border-radius: 50%;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .comp-loading-text { font-size: 14px; color: var(--muted); text-align: center; line-height: 1.6; }
  .comp-error {
    background: rgba(255,80,80,0.08); border: 1px solid rgba(255,80,80,0.2);
    border-radius: var(--radius); padding: 20px; text-align: center;
    margin: 20px 0;
  }
  /* Intel cards */
  .intel-section { margin-bottom: 24px; }
  .intel-section-title {
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; color: var(--muted); margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .intel-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 16px; margin-bottom: 10px;
    transition: all 0.2s;
  }
  .intel-card:hover { border-color: rgba(0,229,255,0.2); }
  .intel-card-title { font-weight: 700; font-size: 14px; margin-bottom: 6px; line-height: 1.4; }
  .intel-card-body { font-size: 13px; color: var(--muted); line-height: 1.6; }
  .intel-card-source {
    font-size: 11px; color: var(--accent); margin-top: 8px;
    font-weight: 600;
  }
  .intel-severity {
    display: inline-block; padding: 2px 8px; border-radius: 6px;
    font-size: 10px; font-weight: 700; margin-bottom: 6px;
  }
  .sev-high { background: rgba(255,80,80,0.15); color: #ff5050; }
  .sev-medium { background: rgba(255,165,0,0.15); color: orange; }
  .sev-low { background: rgba(0,224,150,0.15); color: var(--green); }
  /* Weather */
  .weather-hero {
    background: linear-gradient(135deg, rgba(0,229,255,0.1), rgba(0,224,150,0.06));
    border: 1px solid rgba(0,229,255,0.15); border-radius: 18px;
    padding: 24px; margin-bottom: 16px; text-align: center;
  }
  .weather-icon { font-size: 56px; margin-bottom: 8px; display: block; }
  .weather-temp { font-family: var(--font-display); font-size: 48px; font-weight: 800; line-height: 1; }
  .weather-desc { font-size: 15px; color: var(--muted); margin-top: 4px; }
  .weather-forecast { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
  .weather-forecast::-webkit-scrollbar { display: none; }
  .forecast-day {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 12px 14px; text-align: center;
    flex-shrink: 0; min-width: 70px;
  }
  .forecast-date { font-size: 11px; color: var(--muted); margin-bottom: 6px; }
  .forecast-icon { font-size: 22px; margin-bottom: 6px; display: block; }
  .forecast-temps { font-size: 12px; font-weight: 600; }
  /* Economy */
  .economy-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 20px; margin-bottom: 12px;
  }
  .economy-rate {
    font-family: var(--font-display); font-size: 32px;
    font-weight: 800; color: var(--accent); margin-bottom: 4px;
  }
  .economy-rate-label { font-size: 12px; color: var(--muted); margin-bottom: 16px; }
  .cost-tips { display: flex; flex-direction: column; gap: 8px; }
  .cost-tip {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: 13px; color: var(--muted); line-height: 1.5;
  }
  .cost-tip-icon { flex-shrink: 0; font-size: 16px; }
  /* Recommendations */
  .reco-filter { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 16px; scrollbar-width: none; padding-bottom: 4px; }
  .reco-filter::-webkit-scrollbar { display: none; }
  .reco-filter-btn {
    padding: 8px 16px; border-radius: 20px; font-size: 13px;
    font-weight: 600; cursor: pointer; white-space: nowrap;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--muted); font-family: var(--font-body); transition: all 0.2s;
  }
  .reco-filter-btn.active { background: var(--accent); color: #000; border-color: var(--accent); }
  .reco-grid { display: flex; flex-direction: column; gap: 12px; }
  .reco-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 16px; transition: all 0.2s;
    display: flex; gap: 14px; align-items: flex-start;
  }
  .reco-card:hover { border-color: rgba(0,229,255,0.2); transform: translateX(4px); }
  .reco-card-icon {
    width: 48px; height: 48px; border-radius: 12px;
    background: var(--surface2); display: flex;
    align-items: center; justify-content: center;
    font-size: 24px; flex-shrink: 0;
  }
  .reco-card-body { flex: 1; }
  .reco-card-name { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
  .reco-card-desc { font-size: 13px; color: var(--muted); line-height: 1.5; margin-bottom: 8px; }
  .reco-card-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .reco-source-badge {
    font-size: 10px; font-weight: 700; padding: 2px 8px;
    border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .badge-publisher { background: rgba(0,229,255,0.1); color: var(--accent); }
  .badge-ai { background: rgba(180,100,255,0.1); color: #b464ff; }
  .badge-merchant { background: rgba(255,209,102,0.1); color: var(--gold); }
  .badge-sponsored { background: rgba(255,209,102,0.15); color: var(--gold); }
  /* Itinerary */
  .itinerary-days { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 20px; scrollbar-width: none; padding-bottom: 4px; }
  .itinerary-days::-webkit-scrollbar { display: none; }
  .day-tab {
    padding: 8px 16px; border-radius: 20px; font-size: 13px;
    font-weight: 600; cursor: pointer; white-space: nowrap;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--muted); font-family: var(--font-body); transition: all 0.2s;
  }
  .day-tab.active { background: var(--accent); color: #000; border-color: var(--accent); }
  .itinerary-items { display: flex; flex-direction: column; gap: 0; position: relative; }
  .itinerary-items::before {
    content: ''; position: absolute; left: 19px; top: 0; bottom: 0;
    width: 2px; background: var(--border); z-index: 0;
  }
  .itin-item {
    display: flex; gap: 14px; align-items: flex-start;
    padding: 0 0 20px; position: relative; z-index: 1;
  }
  .itin-dot {
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--surface); border: 2px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0; margin-top: 2px;
  }
  .itin-dot.attraction { border-color: var(--accent); background: rgba(0,229,255,0.08); }
  .itin-dot.food { border-color: var(--green); background: rgba(0,224,150,0.08); }
  .itin-dot.transport { border-color: var(--gold); background: rgba(255,209,102,0.08); }
  .itin-dot.event { border-color: #b464ff; background: rgba(180,100,255,0.08); }
  .itin-body { flex: 1; }
  .itin-time { font-size: 11px; color: var(--muted); font-weight: 600; margin-bottom: 3px; }
  .itin-name { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
  .itin-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }
  .itin-duration { font-size: 11px; color: var(--accent); margin-top: 4px; font-weight: 600; }
  .itin-sponsored { font-size: 10px; color: var(--gold); font-weight: 700; margin-top: 4px; }
  .itin-notes {
    background: rgba(255,209,102,0.06); border: 1px solid rgba(255,209,102,0.15);
    border-radius: 8px; padding: 8px 10px; margin-top: 8px;
    font-size: 12px; color: var(--muted); line-height: 1.5;
  }
  .regen-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 14px; border-radius: 12px;
    border: 1px dashed rgba(0,229,255,0.3); background: rgba(0,229,255,0.04);
    color: var(--accent); font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: var(--font-body); margin-top: 16px;
    transition: all 0.2s;
  }
  .regen-btn:hover { background: rgba(0,229,255,0.08); border-color: var(--accent); }
  /* Companion CTA on confirmation */
  .companion-cta-card {
    background: linear-gradient(135deg, rgba(0,229,255,0.1), rgba(0,224,150,0.06));
    border: 1px solid rgba(0,229,255,0.2); border-radius: var(--radius);
    padding: 20px; margin: 16px 0; cursor: pointer; transition: all 0.2s;
  }
  .companion-cta-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,229,255,0.15); }
  .companion-cta-title { font-family: var(--font-display); font-size: 16px; font-weight: 800; margin-bottom: 6px; }
  .companion-cta-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }
  .companion-cta-arrow { color: var(--accent); font-size: 20px; margin-top: 12px; display: block; }

  /* TRAVEL COMPANION */
  .companion-screen { min-height: 100vh; padding-bottom: calc(var(--nav-h) + 16px); }
  .companion-header {
    padding: 20px 20px 0;
    background: linear-gradient(135deg, rgba(0,229,255,0.08), rgba(0,224,150,0.06));
    border-bottom: 1px solid var(--border);
  }
  .companion-back {
    background: none; border: none; color: var(--muted);
    font-size: 14px; cursor: pointer; font-family: var(--font-body);
    padding: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 6px;
  }
  .companion-hero {
    display: flex; align-items: center; gap: 16px; margin-bottom: 20px;
  }
  .companion-flag { font-size: 44px; }
  .companion-country { font-family: var(--font-display); font-size: 26px; font-weight: 800; }
  .companion-plan-info { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .companion-tabs {
    display: flex; gap: 4px; padding-bottom: 0;
  }
  .companion-tab {
    padding: 10px 16px; border-radius: 10px 10px 0 0;
    font-size: 13px; font-weight: 600; cursor: pointer;
    border: none; background: transparent;
    color: var(--muted); font-family: var(--font-body);
    transition: all 0.2s; border-bottom: 2px solid transparent;
    display: flex; align-items: center; gap: 6px;
  }
  .companion-tab.active {
    color: var(--accent); border-bottom: 2px solid var(--accent);
    background: rgba(0,229,255,0.06);
  }
  .companion-body { padding: 20px; }
  .companion-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 60px 20px; gap: 16px;
  }
  .companion-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .companion-loading-text { font-size: 14px; color: var(--muted); text-align: center; }
  .intel-section { margin-bottom: 24px; }
  .intel-section-title {
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; color: var(--accent); margin-bottom: 12px;
  }
  .intel-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 14px 16px; margin-bottom: 10px;
  }
  .intel-card-title { font-weight: 700; font-size: 14px; margin-bottom: 6px; }
  .intel-card-body { font-size: 13px; color: var(--muted); line-height: 1.6; }
  .intel-card-source { font-size: 11px; color: var(--accent); margin-top: 6px; }
  .intel-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 20px; font-size: 11px;
    font-weight: 700; margin-right: 6px; margin-bottom: 6px;
  }
  .badge-low { background: rgba(0,224,150,0.15); color: var(--green); }
  .badge-medium { background: rgba(255,180,0,0.15); color: #ffb400; }
  .badge-high { background: rgba(255,70,70,0.15); color: #ff4646; }
  .weather-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
  .weather-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 12px; text-align: center;
  }
  .weather-day { font-size: 11px; color: var(--muted); margin-bottom: 4px; }
  .weather-temp { font-family: var(--font-display); font-size: 18px; font-weight: 800; }
  .weather-desc { font-size: 11px; color: var(--muted); margin-top: 4px; }
  .economy-card {
    background: linear-gradient(135deg, rgba(0,229,255,0.06), rgba(0,224,150,0.04));
    border: 1px solid rgba(0,229,255,0.15); border-radius: 14px; padding: 20px;
    margin-bottom: 16px;
  }
  .economy-rate {
    font-family: var(--font-display); font-size: 32px; font-weight: 800;
    color: var(--accent); margin-bottom: 4px;
  }
  .economy-pair { font-size: 13px; color: var(--muted); }
  .itinerary-day {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; margin-bottom: 16px; overflow: hidden;
  }
  .itinerary-day-header {
    background: linear-gradient(90deg, rgba(0,229,255,0.08), transparent);
    padding: 14px 16px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 12px;
  }
  .itinerary-day-num {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--accent); color: #000;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-weight: 800; font-size: 14px;
    flex-shrink: 0;
  }
  .itinerary-day-title { font-family: var(--font-display); font-weight: 700; font-size: 15px; }
  .itinerary-day-theme { font-size: 12px; color: var(--muted); }
  .itinerary-items { padding: 8px 0; }
  .itinerary-item {
    display: flex; gap: 12px; padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.03);
  }
  .itinerary-item:last-child { border-bottom: none; }
  .itinerary-time {
    font-size: 11px; color: var(--accent); font-weight: 700;
    width: 44px; flex-shrink: 0; padding-top: 2px;
  }
  .itinerary-type-icon { font-size: 18px; flex-shrink: 0; }
  .itinerary-item-content { flex: 1; }
  .itinerary-item-name { font-weight: 700; font-size: 14px; margin-bottom: 3px; }
  .itinerary-item-duration { font-size: 11px; color: var(--muted); }
  .itinerary-item-tip {
    font-size: 12px; color: var(--muted); margin-top: 4px;
    font-style: italic; line-height: 1.5;
  }
  .reco-cats {
    display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px;
    margin-bottom: 16px; scrollbar-width: none;
  }
  .reco-cat-btn {
    padding: 6px 16px; border-radius: 20px; font-size: 13px;
    font-weight: 600; cursor: pointer; border: 1px solid var(--border);
    background: transparent; color: var(--muted);
    font-family: var(--font-body); white-space: nowrap; transition: all 0.2s;
  }
  .reco-cat-btn.active {
    background: var(--accent); color: #000; border-color: var(--accent);
  }
  .reco-grid { display: flex; flex-direction: column; gap: 12px; }
  .reco-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 16px; transition: all 0.2s;
  }
  .reco-card:hover { border-color: rgba(0,229,255,0.2); transform: translateY(-2px); }
  .reco-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .reco-card-name { font-weight: 700; font-size: 15px; flex: 1; }
  .reco-source-badge {
    font-size: 10px; font-weight: 700; padding: 3px 8px;
    border-radius: 10px; white-space: nowrap; margin-left: 8px;
  }
  .source-michelin { background: rgba(255,50,50,0.15); color: #ff5050; }
  .source-lonely { background: rgba(0,229,255,0.12); color: var(--accent); }
  .source-local { background: rgba(0,224,150,0.12); color: var(--green); }
  .source-hidden { background: rgba(255,209,102,0.15); color: var(--gold); }
  .reco-desc { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 8px; }
  .reco-footer { display: flex; align-items: center; gap: 10px; }
  .reco-cat-tag {
    font-size: 11px; background: var(--surface2);
    padding: 3px 10px; border-radius: 10px; color: var(--muted);
  }
  .reco-price { font-size: 12px; color: var(--accent); font-weight: 700; }

  /* BOTTOM NAV */
  .bottom-nav {
    position: sticky; bottom: 0;
    width: 100%;
    background: rgba(7,11,20,0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    display: flex;
    height: var(--nav-h);
    z-index: 100;
  }
  .nav-item {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 4px;
    cursor: pointer; transition: all 0.2s;
    color: var(--muted); font-size: 11px; font-weight: 600;
    letter-spacing: 0.3px;
  }
  .nav-item.active { color: var(--accent); }
  .nav-icon { font-size: 22px; transition: transform 0.2s; }
  .nav-item.active .nav-icon { transform: translateY(-2px); }

  /* LOADING */
  .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; gap: 16px; }
  .spinner {
    width: 40px; height: 40px; border: 3px solid var(--border);
    border-top-color: var(--accent); border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { color: var(--muted); font-size: 14px; }

  /* EMPTY STATE */
  .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; gap: 12px; text-align: center; }
  .empty-icon { font-size: 56px; }
  .empty-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; }
  .empty-subtitle { color: var(--muted); font-size: 14px; line-height: 1.6; }

  /* TOAST */
  .toast {
    position: fixed; top: 60px; left: 50%; transform: translateX(-50%);
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); padding: 12px 20px; border-radius: 12px;
    font-size: 14px; font-weight: 500; z-index: 999;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    animation: toastIn 0.3s ease;
    white-space: nowrap;
  }
  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

  /* ALERT BANNER */
  .alert-banner {
    margin: 0 20px 12px;
    padding: 12px 16px;
    border-radius: 12px;
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; font-weight: 500;
  }
  .alert-banner.warning { background: rgba(255,149,0,0.1); border: 1px solid rgba(255,149,0,0.2); color: var(--orange); }
  .alert-banner.danger { background: rgba(255,59,92,0.1); border: 1px solid rgba(255,59,92,0.2); color: var(--red); }
`;

// ============================================================
// MOCK DATA FOR PLANS & HISTORY
// ============================================================
const MOCK_ACTIVE_PLANS = [
  { id: "esim-001", country: "Japan", slug: "japan", plan: "Japan 3GB / 15 Days", used: 2.1, total: 3, expiry: "2026-03-22", status: "active" },
  { id: "esim-002", country: "South Korea", slug: "south-korea", plan: "Korea Unlimited / 7 Days", used: 0.8, total: null, expiry: "2026-03-10", status: "active" },
];

const MOCK_HISTORY = [
  { id: "ord-001", country: "Japan", slug: "japan", plan: "Japan 3GB / 15 Days", amount: 10.36, date: "2026-03-01" },
  { id: "ord-002", country: "South Korea", slug: "south-korea", plan: "Korea Unlimited / 7 Days", amount: 17.99, date: "2026-03-01" },
  { id: "ord-003", country: "Thailand", slug: "thailand", plan: "Thailand 3GB / 7 Days", amount: 7.09, date: "2026-02-14" },
  { id: "ord-004", country: "Australia", slug: "australia", plan: "5GB / 15 Days", amount: 14.17, date: "2026-01-22" },
];

// ============================================================
// MOCK EWALLET DATA
// ============================================================
const MOCK_WALLET = {
  balance: 18.40,
  autoTopUp: true,
  autoTopUpThreshold: 5.00,
  autoTopUpAmount: 20.00,
  transactions: [
    { id: "wt-001", type: "deduction", desc: "Virtual Number — Mar 2026", amount: -3.00, date: "2026-03-07", balance: 18.40 },
    { id: "wt-002", type: "topup",     desc: "Top Up via PayNow",         amount: 20.00, date: "2026-03-07", balance: 21.40 },
    { id: "wt-003", type: "deduction", desc: "Call +65 9123 4567 — 4 min",amount: -0.20, date: "2026-03-05", balance: 1.40  },
    { id: "wt-004", type: "deduction", desc: "Call +44 20 7946 0958 — 9 min",amount: -0.45, date: "2026-03-03", balance: 1.60 },
    { id: "wt-005", type: "deduction", desc: "Virtual Number — Feb 2026", amount: -3.00, date: "2026-02-07", balance: 2.05  },
    { id: "wt-006", type: "topup",     desc: "Top Up via Card",           amount: 10.00, date: "2026-02-01", balance: 5.05  },
  ]
};

const ADMIN_STATS = {
  todaySales: 4,
  todayRevenue: 58.40,
  todayProfit: 22.60,
  monthRevenue: 1842.30,
  walletBalance: 127.50,
  activePlans: 23,
};

// ============================================================
// MAIN APP
// ============================================================
export default function ESIMConnectApp() {
  const [screen, setScreen] = useState("home");
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("paynow");
  const [myPlansTab, setMyPlansTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [apiStatus, setApiStatus] = useState("mock"); // "mock" | "connected" | "error"
  const [wantVirtualNumber, setWantVirtualNumber] = useState(null);
  const [walletBalance, setWalletBalance] = useState(MOCK_WALLET.balance);
  const [dialNumber, setDialNumber] = useState("");
  const [callState, setCallState] = useState("idle"); // idle | calling | connected | ended
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [lastCallCost, setLastCallCost] = useState(0);
  const [autoTopUp, setAutoTopUp] = useState(MOCK_WALLET.autoTopUp);
  const [topupAmount, setTopupAmount] = useState(null);
  const [showVirtualExplainer, setShowVirtualExplainer] = useState(false);
  const [homeCountry, setHomeCountry] = useState("");
  const [companionPlan, setCompanionPlan] = useState(null);
  const [companionTab, setCompanionTab] = useState("intel");
  const [intelData, setIntelData] = useState(null);
  const [intelLoading, setIntelLoading] = useState(false);
  const [itineraryData, setItineraryData] = useState(null);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [recoData, setRecoData] = useState(null);
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoCategory, setRecoCategory] = useState("All");

  // ---- TOAST ----
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ---- NAVIGATION ----
  const navigate = (s) => {
    setScreen(s);
    if (["home","plans","profile","admin","dialler"].includes(s)) setActiveTab(s);
    if (s === "wallet") setActiveTab("profile");
  };

  const selectCountry = (country) => {
    setSelectedCountry(country);
    setScreen("countryPlans");
  };

  const selectPlan = (plan) => {
    setSelectedPlan(plan);
    setCheckoutStep(1);
    setWantVirtualNumber(null);
    setShowVirtualExplainer(false);
    setHomeCountry("");
    setScreen("checkout");
  };

  // ── CLAUDE API — DESTINATION INTEL ──
  const fetchIntel = async (countryName) => {
    setIntelLoading(true);
    setIntelData(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a trusted travel intelligence assistant. Return ONLY valid JSON, no markdown, no explanation.",
          messages: [{
            role: "user",
            content: `Generate a travel intelligence briefing for ${countryName}. Return JSON with this exact structure:
{
  "current_affairs": [{"headline": "string", "summary": "string", "source": "string"}],
  "economy": {"currency_code": "string", "exchange_rate_to_sgd": "string", "summary": "string", "cost_tips": "string"},
  "weather": {"current_conditions": "string", "forecast": [{"day": "string", "high": "string", "low": "string", "desc": "string"}]},
  "safety": [{"title": "string", "description": "string", "severity": "low|medium|high"}],
  "events": [{"name": "string", "date": "string", "description": "string"}],
  "transport": [{"tip": "string"}]
}`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      setIntelData(JSON.parse(clean));
    } catch (e) {
      console.error("Intel error:", e);
      setIntelData({ error: true });
    }
    setIntelLoading(false);
  };

  // ── CLAUDE API — AI ITINERARY ──
  const fetchItinerary = async (countryName, days) => {
    setItineraryLoading(true);
    setItineraryData(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are an expert travel planner. Return ONLY valid JSON, no markdown, no explanation.",
          messages: [{
            role: "user",
            content: `Create a ${Math.min(days, 5)}-day travel itinerary for ${countryName}. Return JSON array:
[{"day_number": 1, "title": "string", "theme": "string", "items": [{"time": "09:00", "name": "string", "type": "attraction|food|transport|experience", "duration": "string", "tip": "string"}]}]
Max 4 items per day. First day lighter for arrival. Last day near transport hubs.`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      setItineraryData(JSON.parse(clean));
    } catch (e) {
      console.error("Itinerary error:", e);
      setItineraryData([]);
    }
    setItineraryLoading(false);
  };

  // ── CLAUDE API — RECOMMENDATIONS ──
  const fetchRecommendations = async (countryName) => {
    setRecoLoading(true);
    setRecoData(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a travel recommendations engine. Return ONLY valid JSON, no markdown.",
          messages: [{
            role: "user",
            content: `Generate 12 travel recommendations for ${countryName} across these categories: Food, Attractions, Experiences, Shopping, Transport. Return JSON array:
[{"name": "string", "category": "Food|Attractions|Experiences|Shopping|Transport", "description": "string", "why": "string", "source": "Michelin|Lonely Planet|Local Favourite|Hidden Gem", "price_range": "$|$$|$$$"}]`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      setRecoData(JSON.parse(clean));
    } catch (e) {
      console.error("Reco error:", e);
      setRecoData([]);
    }
    setRecoLoading(false);
  };

  // ── OPEN TRAVEL COMPANION ──
  const openCompanion = (plan) => {
    setCompanionPlan(plan);
    setCompanionTab("intel");
    setIntelData(null);
    setItineraryData(null);
    setRecoData(null);
    navigate("companion");
    fetchIntel(plan.country);
    fetchItinerary(plan.country, plan.validity_days || 7);
    fetchRecommendations(plan.country);
  };

  const handlePurchase = async () => {
    setLoading(true);
    // In production: call AiraloAPI.createOrder(selectedPlan.id)
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    setCheckoutStep(4);
    showToast("✅ eSIM activated successfully!");
  };

  const filteredCountries = MOCK_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const usagePct = (used, total) => total ? Math.round((used / total) * 100) : 15;
  const usageColor = (pct) => pct >= 95 ? "red" : pct >= 80 ? "orange" : "green";

  // ============================================================
  // RENDER SCREENS
  // ============================================================


  // ============================================================
  // CLAUDE AI — TRAVEL COMPANION
  // ============================================================
  const fetchTravelCompanion = async (country) => {
    setCompanionLoading(true);
    setCompanionError(null);
    setIntelData(null);
    setItineraryData(null);
    setRecoData(null);

    try {
      // Fetch Intel + Recommendations in parallel
      const [intelRes, recoRes, itinRes] = await Promise.all([
        fetchIntel(country),
        fetchRecommendations(country),
        fetchItinerary(country),
      ]);
      setIntelData(intelRes);
      setRecoData(recoRes);
      setItineraryData(itinRes);
    } catch (e) {
      setCompanionError("Could not load travel data. Please try again.");
    } finally {
      setCompanionLoading(false);
    }
  };

  const callClaude = async (systemPrompt, userPrompt) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      })
    });
    const data = await response.json();
    const text = data.content?.map(b => b.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  };

  const fetchIntel = async (country) => {
    return callClaude(
      `You are a trusted travel intelligence assistant. Return ONLY valid JSON, no markdown, no preamble.`,
      `Generate a destination intelligence briefing for ${country.name}.
Return this exact JSON structure:
{
  "current_affairs": [{"headline": "string", "summary": "string", "source": "string"}],
  "economy": {"currency_code": "string", "exchange_rate_to_sgd": number, "summary": "string", "cost_tips": ["string"]},
  "weather": {"current_conditions": "string", "temp_c": number, "icon": "string (emoji)", "forecast": [{"date": "string", "high_c": number, "low_c": number, "description": "string", "icon": "string (emoji)"}]},
  "safety": [{"title": "string", "description": "string", "severity": "low|medium|high"}],
  "events": [{"name": "string", "date": "string", "description": "string"}],
  "transport": [{"tip": "string"}]
}`
    );
  };

  const fetchRecommendations = async (country) => {
    return callClaude(
      `You are a travel recommendations engine. Return ONLY valid JSON, no markdown, no preamble.`,
      `Generate 8 travel recommendations for ${country.name}.
Return a JSON array of objects with this structure:
[{"name": "string", "category": "food|attraction|experience|transport|shopping", "description": "string (max 80 chars)", "source_type": "publisher|ai_generated", "source_name": "string (e.g. Lonely Planet, Michelin)", "is_sponsored": false, "icon": "string (1 emoji)"}]`
    );
  };

  const fetchItinerary = async (country) => {
    return callClaude(
      `You are an expert travel planner. Return ONLY valid JSON, no markdown, no preamble.`,
      `Create a 3-day travel itinerary for ${country.name}.
Return a JSON array of days:
[{"day_number": 1, "title": "string", "items": [{"time": "HH:MM", "type": "attraction|food|transport|event", "name": "string", "description": "string (max 80 chars)", "duration_minutes": number, "notes": "string|null", "icon": "string (1 emoji)"}]}]`
    );
  };

  const openTravelCompanion = (country) => {
    setCompanionCountry(country);
    setCompanionTab("intel");
    setRecoFilter("all");
    navigate("companion");
    fetchTravelCompanion(country);
  };

  // ---- ITINERARY DAY STATE ----
  const [activeItinDay, setActiveItinDay] = useState(0);

  const getTypeIcon = (type) => {
    if (type === "food") return "food";
    if (type === "transport") return "transport";
    if (type === "event") return "event";
    return "attraction";
  };

  const renderTravelCompanion = () => {
    const country = companionCountry;
    if (!country) return null;

    return (
      <div className="companion-screen">
        {/* Hero header */}
        <div className="companion-hero">
          <button className="companion-back" onClick={() => navigate("plans")}>
            ← Back to My Plans
          </button>
          <span className="companion-flag">{country.image?.url ? <img src={country.image.url} style={{width:40,height:40,borderRadius:"50%",objectFit:"cover"}} alt="" /> : "🌍"}</span>
          <div className="companion-country-name">{country.name}</div>
          <div className="companion-subtitle">🤖 AI-powered travel companion · Powered by Claude</div>

          {/* Tabs */}
          <div className="companion-tabs">
            {[
              { id: "intel", label: "📰 Intel" },
              { id: "weather", label: "🌤 Weather" },
              { id: "economy", label: "💱 Economy" },
              { id: "safety", label: "🛡 Safety" },
              { id: "reco", label: "📍 Discover" },
              { id: "itinerary", label: "🗓 Itinerary" },
            ].map(t => (
              <button key={t.id} className={`comp-tab ${companionTab === t.id ? "active" : ""}`}
                onClick={() => setCompanionTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="companion-body">
          {companionLoading && (
            <div className="comp-loading">
              <div className="comp-loading-spinner" />
              <div className="comp-loading-text">
                🤖 Claude is researching {country.name}...<br/>
                <span style={{fontSize:"12px"}}>Building your intel briefing, itinerary and recommendations</span>
              </div>
            </div>
          )}

          {companionError && !companionLoading && (
            <div className="comp-error">
              <div style={{fontSize:"32px",marginBottom:"8px"}}>😕</div>
              <div style={{fontWeight:"700",marginBottom:"8px"}}>Could not load travel data</div>
              <div style={{fontSize:"13px",color:"var(--muted)",marginBottom:"16px"}}>{companionError}</div>
              <button className="cta-btn" onClick={() => fetchTravelCompanion(country)}>Try Again</button>
            </div>
          )}

          {!companionLoading && !companionError && intelData && (
            <>
              {/* ── INTEL TAB ── */}
              {companionTab === "intel" && (
                <div>
                  <div className="intel-section">
                    <div className="intel-section-title">📰 Current Affairs</div>
                    {intelData.current_affairs?.map((item, i) => (
                      <div key={i} className="intel-card">
                        <div className="intel-card-title">{item.headline}</div>
                        <div className="intel-card-body">{item.summary}</div>
                        <div className="intel-card-source">Source: {item.source}</div>
                      </div>
                    ))}
                  </div>
                  <div className="intel-section">
                    <div className="intel-section-title">🎉 Events & Festivals</div>
                    {intelData.events?.map((ev, i) => (
                      <div key={i} className="intel-card">
                        <div className="intel-card-title">{ev.name}</div>
                        <div style={{fontSize:"12px",color:"var(--accent)",marginBottom:"4px",fontWeight:"600"}}>{ev.date}</div>
                        <div className="intel-card-body">{ev.description}</div>
                      </div>
                    ))}
                  </div>
                  <div className="intel-section">
                    <div className="intel-section-title">🚌 Getting Around</div>
                    {intelData.transport?.map((t, i) => (
                      <div key={i} className="intel-card">
                        <div className="intel-card-body">{t.tip}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── WEATHER TAB ── */}
              {companionTab === "weather" && (
                <div>
                  <div className="weather-hero">
                    <span className="weather-icon">{intelData.weather?.icon || "🌤"}</span>
                    <div className="weather-temp">{intelData.weather?.temp_c || "--"}°C</div>
                    <div className="weather-desc">{intelData.weather?.current_conditions}</div>
                  </div>
                  <div className="intel-section-title" style={{marginBottom:"12px"}}>📅 5-Day Forecast</div>
                  <div className="weather-forecast">
                    {intelData.weather?.forecast?.map((day, i) => (
                      <div key={i} className="forecast-day">
                        <div className="forecast-date">{day.date}</div>
                        <span className="forecast-icon">{day.icon || "🌤"}</span>
                        <div className="forecast-temps">{day.high_c}° / {day.low_c}°</div>
                        <div style={{fontSize:"10px",color:"var(--muted)",marginTop:"4px"}}>{day.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── ECONOMY TAB ── */}
              {companionTab === "economy" && (
                <div>
                  <div className="economy-card">
                    <div style={{fontSize:"12px",color:"var(--muted)",marginBottom:"4px",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.5px"}}>Exchange Rate</div>
                    <div className="economy-rate">1 SGD = {intelData.economy?.exchange_rate_to_sgd ? (1/intelData.economy.exchange_rate_to_sgd).toFixed(2) : "--"} {intelData.economy?.currency_code}</div>
                    <div className="economy-rate-label">SGD → {intelData.economy?.currency_code} · Updated today</div>
                    <div style={{fontSize:"14px",color:"var(--muted)",lineHeight:"1.6"}}>{intelData.economy?.summary}</div>
                  </div>
                  <div className="intel-section-title" style={{marginBottom:"12px"}}>💡 Cost Tips</div>
                  <div className="cost-tips">
                    {intelData.economy?.cost_tips?.map((tip, i) => (
                      <div key={i} className="cost-tip">
                        <span className="cost-tip-icon">💰</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SAFETY TAB ── */}
              {companionTab === "safety" && (
                <div>
                  {intelData.safety?.map((item, i) => (
                    <div key={i} className="intel-card">
                      <span className={`intel-severity sev-${item.severity}`}>
                        {item.severity === "high" ? "⚠️ HIGH" : item.severity === "medium" ? "⚡ MEDIUM" : "✅ LOW"} RISK
                      </span>
                      <div className="intel-card-title">{item.title}</div>
                      <div className="intel-card-body">{item.description}</div>
                    </div>
                  ))}
                  <div className="intel-card" style={{borderColor:"rgba(0,229,255,0.2)",background:"rgba(0,229,255,0.04)"}}>
                    <div className="intel-card-title">🏥 Emergency Numbers</div>
                    <div className="intel-card-body" style={{lineHeight:"2"}}>
                      Police · Ambulance · Fire — check local listings on arrival.<br/>
                      Singapore embassy: search MFA Singapore abroad.
                    </div>
                  </div>
                </div>
              )}

              {/* ── DISCOVER / RECOMMENDATIONS TAB ── */}
              {companionTab === "reco" && recoData && (
                <div>
                  <div className="reco-filter">
                    {["all","food","attraction","experience","transport","shopping"].map(f => (
                      <button key={f} className={`reco-filter-btn ${recoFilter === f ? "active" : ""}`}
                        onClick={() => setRecoFilter(f)}>
                        {f === "all" ? "🌟 All" : f === "food" ? "🍜 Food" : f === "attraction" ? "🏛 Sights" : f === "experience" ? "🎭 Experiences" : f === "transport" ? "🚇 Getting Around" : "🛍 Shopping"}
                      </button>
                    ))}
                  </div>
                  <div className="reco-grid">
                    {recoData
                      .filter(r => recoFilter === "all" || r.category === recoFilter)
                      .map((r, i) => (
                        <div key={i} className="reco-card">
                          <div className="reco-card-icon">{r.icon || "📍"}</div>
                          <div className="reco-card-body">
                            <div className="reco-card-name">{r.name}</div>
                            <div className="reco-card-desc">{r.description}</div>
                            <div className="reco-card-meta">
                              <span className={`reco-source-badge badge-${r.source_type === "publisher" ? "publisher" : "ai"}`}>
                                {r.source_type === "publisher" ? r.source_name : "AI Pick"}
                              </span>
                              {r.is_sponsored && <span className="reco-source-badge badge-sponsored">Sponsored</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ── ITINERARY TAB ── */}
              {companionTab === "itinerary" && itineraryData && (
                <div>
                  <div className="itinerary-days">
                    {itineraryData.map((day, i) => (
                      <button key={i}
                        className={`day-tab ${activeItinDay === i ? "active" : ""}`}
                        onClick={() => setActiveItinDay(i)}>
                        Day {day.day_number} · {day.title}
                      </button>
                    ))}
                  </div>
                  <div className="itinerary-items">
                    {itineraryData[activeItinDay]?.items?.map((item, i) => (
                      <div key={i} className="itin-item">
                        <div className={`itin-dot ${getTypeIcon(item.type)}`}>{item.icon || "📍"}</div>
                        <div className="itin-body">
                          <div className="itin-time">{item.time}</div>
                          <div className="itin-name">{item.name}</div>
                          <div className="itin-desc">{item.description}</div>
                          <div className="itin-duration">⏱ {item.duration_minutes} mins</div>
                          {item.notes && <div className="itin-notes">💡 {item.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="regen-btn" onClick={() => {
                    setItineraryData(null);
                    fetchItinerary(country).then(setItineraryData);
                  }}>
                    🔄 Regenerate Itinerary
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderHome = () => (
    <div className="screen">
      <div className="header">
        <div className="header-top">
          <div className="logo">eSIM<span>Connect</span></div>
          <div className="header-badge">
            {apiStatus === "connected" ? "🟢 LIVE" : "🟡 SANDBOX"}
          </div>
        </div>
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Wallet Balance Mini Banner */}
      {!searchQuery && (
        <div
          onClick={() => navigate("wallet")}
          style={{
            margin: "0 20px 16px",
            background: "var(--surface)",
            border: "1px solid rgba(0,224,150,0.15)",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>💰</span>
            <div>
              <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>eSIM Connect Wallet</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "800", color: "var(--green)" }}>
                {SGD(walletBalance)}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {walletBalance < 5 && <span style={{ fontSize: "11px", color: "var(--orange)", fontWeight: "600" }}>⚠️ Low</span>}
            <span style={{ color: "var(--accent)", fontSize: "13px", fontWeight: "600" }}>Top Up →</span>
          </div>
        </div>
      )}

      {/* Quick Dial Banner */}
      {!searchQuery && (
        <div
          onClick={() => navigate("dialler")}
          style={{
            margin: "-8px 20px 16px",
            background: "var(--surface)",
            border: "1px solid rgba(0,224,150,0.12)",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>📞</span>
            <div>
              <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Virtual Number</div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text)" }}>+65 3123 4567</div>
            </div>
          </div>
          <span style={{ color: "var(--accent)", fontSize: "13px", fontWeight: "600" }}>Dial →</span>
        </div>
      )}

      {/* Active Plans Banner */}
      {MOCK_ACTIVE_PLANS.length > 0 && !searchQuery && (
        <div className="active-banner" onClick={() => { setActiveTab("plans"); navigate("plans"); }}>
          <div className="active-banner-top">
            <div className="active-banner-country">
              <img className="active-banner-flag" src={MOCK_COUNTRIES.find(c => c.slug === MOCK_ACTIVE_PLANS[0].slug)?.image.url} alt="" />
              <span className="active-banner-name">{MOCK_ACTIVE_PLANS[0].country}</span>
            </div>
            <div className="active-badge">ACTIVE</div>
          </div>
          <div className="usage-bar-wrap">
            <div className="usage-bar-bg">
              <div
                className={`usage-bar-fill ${usageColor(usagePct(MOCK_ACTIVE_PLANS[0].used, MOCK_ACTIVE_PLANS[0].total))}`}
                style={{ width: `${usagePct(MOCK_ACTIVE_PLANS[0].used, MOCK_ACTIVE_PLANS[0].total)}%` }}
              />
            </div>
            <div className="usage-meta">
              <span>{MOCK_ACTIVE_PLANS[0].used}GB used</span>
              <span>{MOCK_ACTIVE_PLANS[0].total}GB total • Expires {MOCK_ACTIVE_PLANS[0].expiry}</span>
            </div>
          </div>
        </div>
      )}

      {/* Popular Destinations */}
      {!searchQuery && (
        <div className="section">
          <div className="section-title">Popular Destinations</div>
          <div className="popular-grid">
            {MOCK_COUNTRIES.filter(c => POPULAR.includes(c.id)).map(c => (
              <div key={c.id} className="country-card" onClick={() => selectCountry(c)}>
                <img className="country-flag" src={c.image.url} alt={c.name} />
                <span className="country-name">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All / Filtered Countries */}
      <div className="section">
        <div className="section-title">{searchQuery ? `Results for "${searchQuery}"` : "All Destinations"}</div>
        <div className="country-list">
          {filteredCountries.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🌍</div>
              <div className="empty-title">No results</div>
              <div className="empty-subtitle">Try a different destination name</div>
            </div>
          ) : filteredCountries.map(c => (
            <div key={c.id} className="country-row" onClick={() => selectCountry(c)}>
              <img className="country-row-flag" src={c.image.url} alt={c.name} />
              <div className="country-row-info">
                <div className="country-row-name">{c.name}</div>
                <div className="country-row-plans">{getPackagesForCountry(c.slug).length} plans available</div>
              </div>
              <span className="country-row-arrow">›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCountryPlans = () => {
    if (!selectedCountry) return null;
    const packages = getPackagesForCountry(selectedCountry.slug);
    return (
      <div className="screen">
        <div className="plans-header">
          <button className="back-btn" onClick={() => setScreen("home")}>
            ← Back
          </button>
          <div className="plans-country">
            <img className="plans-country-flag" src={selectedCountry.image.url} alt={selectedCountry.name} />
            <div>
              <div className="plans-country-name">{selectedCountry.name}</div>
              <div className="plans-subtitle">{packages.length} plans available</div>
            </div>
          </div>
        </div>

        {packages.map((pkg, i) => (
          <div key={pkg.id} className={`plan-card ${i === 1 ? "popular" : ""}`} onClick={() => selectPlan({ ...pkg, country: selectedCountry })}>
            <div className="plan-top">
              <div>
                <div className="plan-data">{pkg.data === "Unlimited" ? "∞" : pkg.data.replace(" GB","")}<span>{pkg.data === "Unlimited" ? " Unlimited" : " GB"}</span></div>
              </div>
              <div className="plan-price-wrap">
                <div className="plan-price">{SGD(pkg.price)}</div>
                <div className="plan-price-gst">{SGD(withGST(pkg.price))} w/ GST</div>
              </div>
            </div>
            <div className="plan-tags">
              <span className="plan-tag">📅 {pkg.day} days</span>
              <span className="plan-tag speed">⚡ {pkg.speed}</span>
              {pkg.is_unlimited && <span className="plan-tag">♾️ Unlimited</span>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCheckout = () => {
    if (!selectedPlan) return null;
    const subtotal = selectedPlan.price;
    const gst = subtotal * GST_RATE;
    const total = subtotal + gst;

    if (checkoutStep === 4) {
      return (
        <div className="screen confirm-screen">
          <div className="confirm-icon">🎉</div>
          <div className="confirm-title">You're Connected!</div>
          <div className="confirm-subtitle">
            Your eSIM is ready to activate in {selectedPlan.country?.name}
            {wantVirtualNumber && " · Virtual number assigned"}
          </div>
          <div className="qr-container">
            <div className="qr-placeholder">📱</div>
            <div className="qr-label">SCAN TO ACTIVATE</div>
          </div>
          <div className="instructions">
            <div className="instructions-title">How to activate</div>
            {["Go to Settings → Mobile Data / Cellular", "Tap Add Data Plan or Add eSIM", "Scan this QR code with your camera", "Follow the on-screen setup — done! 🎉"].map((step, i) => (
              <div key={i} className="instruction-step">
                <div className="instruction-num">{i + 1}</div>
                <div className="instruction-text">{step}</div>
              </div>
            ))}
          </div>
          {wantVirtualNumber && (
            <div style={{ width: "100%", background: "rgba(0,224,150,0.06)", border: "1px solid rgba(0,224,150,0.2)", borderRadius: "var(--radius)", padding: "16px", marginBottom: "16px" }}>
              <div style={{ fontWeight: "700", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📞</span> Your Virtual Number
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: "800", color: "var(--green)", marginBottom: "8px" }}>
                Assigned after verification
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.6" }}>
                Check your email for your virtual number and step-by-step forwarding instructions for your home carrier.
              </div>
            </div>
          )}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button className="cta-btn" onClick={() => { navigate("plans"); setMyPlansTab("active"); }}>
              View My Plans →
            </button>
            <button className="cta-btn secondary" onClick={() => navigate("home")}>
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="checkout-screen">
        <div className="checkout-header">
          <button className="back-btn" onClick={() => checkoutStep === 1 ? setScreen("countryPlans") : setCheckoutStep(checkoutStep - 1)}>
            ← Back
          </button>
          <div className="checkout-step">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`step-dot ${s < checkoutStep ? "done" : s === checkoutStep ? "active" : ""}`} />
            ))}
          </div>
          <div className="checkout-title">
            {checkoutStep === 1 ? "Review Order" : checkoutStep === 2 ? "Virtual Number" : "Payment"}
          </div>
          <div className="checkout-subtitle">
            {checkoutStep === 1 ? "Confirm your plan details" : checkoutStep === 2 ? "Stay reachable from home" : "Choose payment method"}
          </div>
        </div>

        {checkoutStep === 1 && (
          <>
            <div className="order-summary">
              <div className="order-summary-header">
                <img className="order-flag" src={selectedPlan.country?.image.url} alt="" />
                <div>
                  <div className="order-plan-name">{selectedPlan.title}</div>
                  <div className="order-country">{selectedPlan.country?.name}</div>
                </div>
              </div>
              <div className="order-specs">
                <div className="spec-item"><label>Data</label><value>{selectedPlan.data}</value></div>
                <div className="spec-item"><label>Validity</label><value>{selectedPlan.day} Days</value></div>
                <div className="spec-item"><label>Speed</label><value>{selectedPlan.speed}</value></div>
                <div className="spec-item"><label>Type</label><value>{selectedPlan.is_unlimited ? "Unlimited" : "Fixed"}</value></div>
              </div>
              <div className="order-pricing">
                <div className="price-row"><span className="price-label">Plan price</span><span>{SGD(subtotal)}</span></div>
                {wantVirtualNumber && <div className="price-row"><span className="price-label">📞 Virtual Number (1 month)</span><span>{SGD(3)}</span></div>}
                <div className="price-row"><span className="price-label">GST (9%)</span><span>{SGD(gst)}</span></div>
                <div className="price-row total"><span>Total</span><span>{SGD(total + (wantVirtualNumber ? 3 : 0))}</span></div>
              </div>
            </div>

            {selectedPlan.is_unlimited && (
              <div className="alert-banner warning" style={{ margin: "0 20px 12px" }}>
                <span>⚡</span>
                <span>Unlimited plan: full speed daily, reduced speed after threshold</span>
              </div>
            )}
          </>
        )}

        {checkoutStep === 2 && (
          <>
            {/* Virtual Number Add-On Card */}
            <div className={`vn-card ${wantVirtualNumber === true ? 'selected-yes' : wantVirtualNumber === false ? 'selected-no' : ''}`}>
              <div className="vn-header">
                <div className="vn-icon">📞</div>
                <div className="vn-info">
                  <div className="vn-title">Add Virtual Home Number</div>
                  <div className="vn-price">+SGD $3.00 / month</div>
                </div>
                <div className="vn-toggle">
                  <button
                    className={`vn-toggle-btn yes ${wantVirtualNumber === true ? 'active' : ''}`}
                    onClick={() => setWantVirtualNumber(true)}
                  >Yes</button>
                  <button
                    className={`vn-toggle-btn no ${wantVirtualNumber === false ? 'active' : ''}`}
                    onClick={() => { setWantVirtualNumber(false); setShowVirtualExplainer(false); }}
                  >No</button>
                </div>
              </div>
              <div className="vn-explainer">
                <button className="vn-why-btn" onClick={() => setShowVirtualExplainer(!showVirtualExplainer)}>
                  <span>{showVirtualExplainer ? '▼' : '▶'}</span>
                  Why do I need this?
                </button>
                {showVirtualExplainer && (
                  <div className="vn-reasons">
                    <div className="vn-reason">
                      <span className="vn-reason-icon">❌</span>
                      <span className="vn-reason-text">Without this, <strong>calls to your home number won't reach you</strong> overseas</span>
                    </div>
                    <div className="vn-reason">
                      <span className="vn-reason-icon">❌</span>
                      <span className="vn-reason-text"><strong>OTP SMS from your bank, tax office or government portal won't arrive</strong> — locking you out of online services</span>
                    </div>
                    <div className="vn-reason">
                      <span className="vn-reason-icon">❌</span>
                      <span className="vn-reason-text">WhatsApp and Telegram <strong>don't work for government agencies, hospitals or banks</strong></span>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
                    <div className="vn-reason">
                      <span className="vn-reason-icon">✅</span>
                      <span className="vn-reason-text">All calls to your home number <strong>forward to this app via internet</strong></span>
                    </div>
                    <div className="vn-reason">
                      <span className="vn-reason-icon">✅</span>
                      <span className="vn-reason-text"><strong>Every OTP SMS delivered instantly</strong> — bank logins, government portals, everything works</span>
                    </div>
                    <div className="vn-reason">
                      <span className="vn-reason-icon">✅</span>
                      <span className="vn-reason-text">Works for <strong>any home country</strong> — Singapore, UK, Australia, USA, Germany and more</span>
                    </div>
                    <div className="vn-reason">
                      <span className="vn-reason-icon">✅</span>
                      <span className="vn-reason-text">Callers pay <strong>local rate only</strong> — no IDD charges for anyone</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Home Country selector — shown only when Yes selected */}
            {wantVirtualNumber === true && (
              <div className="vn-home-country">
                <div className="vn-home-label">Your Home Country</div>
                <select
                  className="input-field"
                  value={homeCountry}
                  onChange={e => setHomeCountry(e.target.value)}
                  style={{ background: 'var(--surface2)' }}
                >
                  <option value="">Select your home country...</option>
                  <option value="SG">🇸🇬 Singapore (+65)</option>
                  <option value="AU">🇦🇺 Australia (+61)</option>
                  <option value="GB">🇬🇧 United Kingdom (+44)</option>
                  <option value="US">🇺🇸 United States (+1)</option>
                  <option value="DE">🇩🇪 Germany (+49)</option>
                  <option value="JP">🇯🇵 Japan (+81)</option>
                  <option value="KR">🇰🇷 South Korea (+82)</option>
                  <option value="MY">🇲🇾 Malaysia (+60)</option>
                  <option value="IN">🇮🇳 India (+91)</option>
                  <option value="CN">🇨🇳 China (+86)</option>
                  <option value="HK">🇭🇰 Hong Kong (+852)</option>
                  <option value="TW">🇹🇼 Taiwan (+886)</option>
                  <option value="FR">🇫🇷 France (+33)</option>
                  <option value="CA">🇨🇦 Canada (+1)</option>
                  <option value="NZ">🇳🇿 New Zealand (+64)</option>
                  <option value="ID">🇮🇩 Indonesia (+62)</option>
                  <option value="PH">🇵🇭 Philippines (+63)</option>
                  <option value="TH">🇹🇭 Thailand (+66)</option>
                  <option value="VN">🇻🇳 Vietnam (+84)</option>
                  <option value="OTHER">🌍 Other country</option>
                </select>
                {homeCountry && (
                  <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,224,150,0.06)', borderRadius: '10px', border: '1px solid rgba(0,224,150,0.15)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: '600', marginBottom: '4px' }}>✅ Your virtual number will be assigned after payment</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: '1.6' }}>
                      We'll provide step-by-step forwarding instructions for your home carrier so calls and SMS reach you instantly overseas.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Skipped message */}
            {wantVirtualNumber === false && (
              <div className="alert-banner warning" style={{ margin: '0 20px 16px' }}>
                <span>⚠️</span>
                <span>You may miss calls and OTP SMS from home while overseas</span>
              </div>
            )}
          </>
        )}

        {checkoutStep === 3 && (
          <>
            <div className="payment-methods">
              {[
                { id: "paynow", icon: "🇸🇬", name: "PayNow", desc: "Instant bank transfer — free" },
                { id: "card", icon: "💳", name: "Credit / Debit Card", desc: "Visa, Mastercard, Amex" },
              ].map(pm => (
                <div key={pm.id} className={`payment-option ${paymentMethod === pm.id ? "selected" : ""}`} onClick={() => setPaymentMethod(pm.id)}>
                  <div className="payment-icon">{pm.icon}</div>
                  <div className="payment-info">
                    <div className="payment-name">{pm.name}</div>
                    <div className="payment-desc">{pm.desc}</div>
                  </div>
                  {paymentMethod === pm.id && <span className="payment-check">✓</span>}
                </div>
              ))}
            </div>

            {paymentMethod === "card" && (
              <div className="card-form">
                <div className="input-group">
                  <label className="input-label">Card Number</label>
                  <input className="input-field" placeholder="4242 4242 4242 4242" />
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label className="input-label">Expiry</label>
                    <input className="input-field" placeholder="MM/YY" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">CVV</label>
                    <input className="input-field" placeholder="123" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Name on Card</label>
                  <input className="input-field" placeholder="John Tan" />
                </div>
              </div>
            )}

            {paymentMethod === "paynow" && (
              <div style={{ margin: "0 20px 20px", background: "var(--surface)", borderRadius: "var(--radius)", padding: "20px", textAlign: "center", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "64px", marginBottom: "12px" }}>📲</div>
                <div style={{ fontWeight: "700", marginBottom: "6px" }}>PayNow QR Code</div>
                <div style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.6" }}>
                  Scan with your banking app to pay {SGD(total)} instantly.<br />
                  Payment confirmed automatically.
                </div>
              </div>
            )}
          </>
        )}

        <div className="cta-wrap">
          <button
            className="cta-btn"
            disabled={loading || (checkoutStep === 2 && wantVirtualNumber === null)}
            onClick={() => {
              if (checkoutStep === 1) setCheckoutStep(2);
              else if (checkoutStep === 2) setCheckoutStep(3);
              else handlePurchase();
            }}
          >
            {loading ? "⏳ Processing..." : 
             checkoutStep === 1 ? `Continue → ${SGD(total)}` :
             checkoutStep === 2 ? (wantVirtualNumber === null ? "Select an option above" : `Continue → ${SGD(total + (wantVirtualNumber ? 3 : 0))}`) :
             `Pay ${SGD(total + (wantVirtualNumber ? 3 : 0))}`}
          </button>
        </div>
      </div>
    );
  };


  const renderCompanion = () => {
    if (!companionPlan) return null;
    const typeIcon = (type) => ({ attraction:"🏛️", food:"🍜", transport:"🚇", experience:"✨", shopping:"🛍️" })[type] || "📍";
    const sourceClass = (s) => ({ "Michelin":"source-michelin", "Lonely Planet":"source-lonely", "Local Favourite":"source-local", "Hidden Gem":"source-hidden" })[s] || "source-local";
    const filteredReco = recoData ? (recoCategory === "All" ? recoData : recoData.filter(r => r.category === recoCategory)) : [];

    return (
      <div className="companion-screen">
        <div className="companion-header">
          <button className="companion-back" onClick={() => { setScreen("plans"); setActiveTab("plans"); }}>
            ← Back to My Plans
          </button>
          <div className="companion-hero">
            <span className="companion-flag">
              {MOCK_COUNTRIES.find(c => c.slug === companionPlan.slug)?.image?.url
                ? <img src={MOCK_COUNTRIES.find(c => c.slug === companionPlan.slug)?.image.url} style={{width:44,height:44,borderRadius:"50%",objectFit:"cover"}} alt="" />
                : "🌏"}
            </span>
            <div>
              <div className="companion-country">{companionPlan.country}</div>
              <div className="companion-plan-info">{companionPlan.plan} · Expires {companionPlan.expiry}</div>
            </div>
          </div>
          <div className="companion-tabs">
            {[
              { id:"intel", label:"📰 Intel" },
              { id:"itinerary", label:"🗓️ Itinerary" },
              { id:"discover", label:"🍜 Discover" },
            ].map(t => (
              <button key={t.id} className={`companion-tab ${companionTab === t.id ? "active" : ""}`}
                onClick={() => setCompanionTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="companion-body">

          {/* ── INTEL TAB ── */}
          {companionTab === "intel" && (
            intelLoading ? (
              <div className="companion-loading">
                <div className="companion-spinner" />
                <div className="companion-loading-text">🤖 Claude is briefing you on {companionPlan.country}...</div>
              </div>
            ) : intelData && !intelData.error ? (
              <div>
                {/* Economy */}
                <div className="intel-section">
                  <div className="intel-section-title">💰 Economy & Currency</div>
                  <div className="economy-card">
                    <div className="economy-rate">SGD 1 = {intelData.economy?.exchange_rate_to_sgd}</div>
                    <div className="economy-pair">{intelData.economy?.currency_code}</div>
                    <div style={{fontSize:"13px",color:"var(--muted)",marginTop:"10px",lineHeight:"1.6"}}>{intelData.economy?.summary}</div>
                    <div style={{fontSize:"12px",color:"var(--green)",marginTop:"8px"}}>💡 {intelData.economy?.cost_tips}</div>
                  </div>
                </div>

                {/* Weather */}
                <div className="intel-section">
                  <div className="intel-section-title">🌤️ Weather</div>
                  <div className="intel-card" style={{marginBottom:"10px"}}>
                    <div className="intel-card-title">Now — {intelData.weather?.current_conditions}</div>
                  </div>
                  <div className="weather-grid">
                    {(intelData.weather?.forecast || []).slice(0,3).map((f,i) => (
                      <div key={i} className="weather-card">
                        <div className="weather-day">{f.day}</div>
                        <div className="weather-temp">{f.high}°</div>
                        <div className="weather-desc">{f.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety */}
                <div className="intel-section">
                  <div className="intel-section-title">🛡️ Safety</div>
                  {(intelData.safety || []).map((s,i) => (
                    <div key={i} className="intel-card">
                      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}}>
                        <span className={`intel-badge badge-${s.severity}`}>{s.severity?.toUpperCase()}</span>
                        <span className="intel-card-title" style={{marginBottom:0}}>{s.title}</span>
                      </div>
                      <div className="intel-card-body">{s.description}</div>
                    </div>
                  ))}
                </div>

                {/* Current Affairs */}
                <div className="intel-section">
                  <div className="intel-section-title">📰 Current Affairs</div>
                  {(intelData.current_affairs || []).slice(0,3).map((a,i) => (
                    <div key={i} className="intel-card">
                      <div className="intel-card-title">{a.headline}</div>
                      <div className="intel-card-body">{a.summary}</div>
                      <div className="intel-card-source">📌 {a.source}</div>
                    </div>
                  ))}
                </div>

                {/* Events */}
                {(intelData.events || []).length > 0 && (
                  <div className="intel-section">
                    <div className="intel-section-title">🎉 Events & Festivals</div>
                    {intelData.events.map((e,i) => (
                      <div key={i} className="intel-card">
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
                          <div className="intel-card-title" style={{marginBottom:0}}>{e.name}</div>
                          <span style={{fontSize:"11px",color:"var(--gold)",fontWeight:"700"}}>{e.date}</span>
                        </div>
                        <div className="intel-card-body">{e.description}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Transport */}
                <div className="intel-section">
                  <div className="intel-section-title">🚇 Getting Around</div>
                  {(intelData.transport || []).map((t,i) => (
                    <div key={i} className="intel-card">
                      <div className="intel-card-body">💡 {t.tip}</div>
                    </div>
                  ))}
                </div>

                <div style={{textAlign:"center",fontSize:"11px",color:"var(--muted)",padding:"16px 0"}}>
                  🤖 Powered by Claude AI · Refreshed daily
                </div>
              </div>
            ) : (
              <div className="companion-loading">
                <div style={{fontSize:"36px"}}>⚠️</div>
                <div className="companion-loading-text">Could not load intel. Check your connection.</div>
                <button className="cta-btn" style={{marginTop:"8px"}} onClick={() => fetchIntel(companionPlan.country)}>Retry</button>
              </div>
            )
          )}

          {/* ── ITINERARY TAB ── */}
          {companionTab === "itinerary" && (
            itineraryLoading ? (
              <div className="companion-loading">
                <div className="companion-spinner" />
                <div className="companion-loading-text">🤖 Claude is planning your {companionPlan.country} itinerary...</div>
              </div>
            ) : itineraryData && itineraryData.length > 0 ? (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
                  <div>
                    <div style={{fontFamily:"var(--font-display)",fontWeight:"800",fontSize:"18px"}}>Your Trip Plan</div>
                    <div style={{fontSize:"12px",color:"var(--muted)",marginTop:"4px"}}>AI-generated · Tap items to edit</div>
                  </div>
                  <button
                    className="cta-btn secondary"
                    style={{padding:"8px 16px",fontSize:"12px"}}
                    onClick={() => fetchItinerary(companionPlan.country, 7)}>
                    🔄 Regenerate
                  </button>
                </div>
                {itineraryData.map((day, di) => (
                  <div key={di} className="itinerary-day">
                    <div className="itinerary-day-header">
                      <div className="itinerary-day-num">{day.day_number}</div>
                      <div>
                        <div className="itinerary-day-title">{day.title}</div>
                        <div className="itinerary-day-theme">{day.theme}</div>
                      </div>
                    </div>
                    <div className="itinerary-items">
                      {(day.items || []).map((item, ii) => (
                        <div key={ii} className="itinerary-item">
                          <div className="itinerary-time">{item.time}</div>
                          <div className="itinerary-type-icon">{typeIcon(item.type)}</div>
                          <div className="itinerary-item-content">
                            <div className="itinerary-item-name">{item.name}</div>
                            <div className="itinerary-item-duration">⏱ {item.duration}</div>
                            {item.tip && <div className="itinerary-item-tip">💡 {item.tip}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{textAlign:"center",fontSize:"11px",color:"var(--muted)",padding:"16px 0"}}>
                  🤖 Powered by Claude AI · Your itinerary saves automatically
                </div>
              </div>
            ) : (
              <div className="companion-loading">
                <div style={{fontSize:"36px"}}>📅</div>
                <div className="companion-loading-text">Could not generate itinerary.</div>
                <button className="cta-btn" style={{marginTop:"8px"}} onClick={() => fetchItinerary(companionPlan.country, 7)}>Retry</button>
              </div>
            )
          )}

          {/* ── DISCOVER TAB ── */}
          {companionTab === "discover" && (
            recoLoading ? (
              <div className="companion-loading">
                <div className="companion-spinner" />
                <div className="companion-loading-text">🤖 Claude is finding the best of {companionPlan.country}...</div>
              </div>
            ) : recoData && recoData.length > 0 ? (
              <div>
                <div className="reco-cats">
                  {["All","Food","Attractions","Experiences","Shopping","Transport"].map(cat => (
                    <button key={cat} className={`reco-cat-btn ${recoCategory === cat ? "active" : ""}`}
                      onClick={() => setRecoCategory(cat)}>{cat}</button>
                  ))}
                </div>
                <div className="reco-grid">
                  {filteredReco.map((r,i) => (
                    <div key={i} className="reco-card">
                      <div className="reco-card-top">
                        <div className="reco-card-name">{r.name}</div>
                        <span className={`reco-source-badge ${sourceClass(r.source)}`}>{r.source}</span>
                      </div>
                      <div className="reco-desc">{r.description}</div>
                      <div style={{fontSize:"12px",color:"var(--accent)",fontStyle:"italic",marginBottom:"8px"}}>"{r.why}"</div>
                      <div className="reco-footer">
                        <span className="reco-cat-tag">{r.category}</span>
                        <span className="reco-price">{r.price_range}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{textAlign:"center",fontSize:"11px",color:"var(--muted)",padding:"16px 0"}}>
                  🤖 Powered by Claude AI · Curated for your destination
                </div>
              </div>
            ) : (
              <div className="companion-loading">
                <div style={{fontSize:"36px"}}>🍜</div>
                <div className="companion-loading-text">Could not load recommendations.</div>
                <button className="cta-btn" style={{marginTop:"8px"}} onClick={() => fetchRecommendations(companionPlan.country)}>Retry</button>
              </div>
            )
          )}

        </div>
      </div>
    );
  };

  const renderMyPlans = () => (
    <div className="screen">
      <div className="header">
        <div className="header-top">
          <div className="logo">My <span>Plans</span></div>
        </div>
      </div>

      <div className="plans-tabs">
        {["active", "history"].map(tab => (
          <div key={tab} className={`plans-tab ${myPlansTab === tab ? "active" : ""}`} onClick={() => setMyPlansTab(tab)}>
            {tab === "active" ? `Active (${MOCK_ACTIVE_PLANS.length})` : "History"}
          </div>
        ))}
      </div>

      {myPlansTab === "active" ? (
        MOCK_ACTIVE_PLANS.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📡</div>
            <div className="empty-title">No active plans</div>
            <div className="empty-subtitle">Purchase an eSIM to get started</div>
            <button className="cta-btn" style={{ width: "auto", padding: "12px 24px", marginTop: "12px" }} onClick={() => navigate("home")}>
              Browse Plans →
            </button>
          </div>
        ) : (
          MOCK_ACTIVE_PLANS.map(plan => {
            const pct = usagePct(plan.used, plan.total);
            const color = usageColor(pct);
            return (
              <div key={plan.id} className="esim-card">
                <div className="esim-card-header">
                  <img className="esim-flag" src={MOCK_COUNTRIES.find(c => c.slug === plan.slug)?.image.url} alt="" />
                  <div className="esim-info">
                    <div className="esim-country">{plan.country}</div>
                    <div className="esim-plan">{plan.plan}</div>
                  </div>
                  <div className="esim-status active">ACTIVE</div>
                </div>
                <div className="esim-body">
                  {pct >= 80 && (
                    <div className={`alert-banner ${pct >= 95 ? "danger" : "warning"}`} style={{ margin: "0 0 12px" }}>
                      <span>{pct >= 95 ? "🚨" : "⚠️"}</span>
                      <span>{pct >= 95 ? "Almost out of data! Top up now." : "Running low on data."}</span>
                    </div>
                  )}
                  <div className="esim-usage">
                    <div className="esim-usage-meta">
                      <span className="esim-usage-remaining">{plan.total ? `${(plan.total - plan.used).toFixed(1)}GB left` : "Unlimited"}</span>
                      <span className="esim-usage-total">Expires {plan.expiry}</span>
                    </div>
                    <div className="usage-bar-bg">
                      <div className={`usage-bar-fill ${color}`} style={{ width: `${plan.total ? pct : 15}%` }} />
                    </div>
                    {plan.total && <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>{plan.used}GB of {plan.total}GB used ({pct}%)</div>}
                  </div>
                  <div className="esim-actions">
                    <button className="esim-action-btn primary" onClick={() => showToast("QR code sent to your email!")}>📱 QR Code</button>
                    <button className="esim-action-btn" onClick={() => showToast("Top-up feature coming soon!")}>⚡ Top Up</button>
                    <button className="esim-action-btn" style={{background:"rgba(0,229,255,0.1)",color:"var(--accent)",border:"1px solid rgba(0,229,255,0.2)"}} onClick={() => openTravelCompanion(MOCK_COUNTRIES.find(c => c.slug === plan.slug) || {name: plan.country, image: {url:""}})}>🤖 AI</button>
                  </div>
                </div>
              </div>
            );
          })
        )
      ) : (
        MOCK_HISTORY.map(item => (
          <div key={item.id} className="history-item">
            <img className="history-flag" src={MOCK_COUNTRIES.find(c => c.slug === item.slug)?.image.url} alt="" />
            <div className="history-info">
              <div className="history-country">{item.country}</div>
              <div className="history-plan">{item.plan}</div>
            </div>
            <div className="history-right">
              <div className="history-amount">{SGD(item.amount)}</div>
              <div className="history-date">{item.date}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderAdmin = () => (
    <div className="admin-screen">
      <div className="admin-header">
        <div className="admin-title">Dashboard</div>
        <div className="admin-subtitle">Today — {new Date().toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Today's Revenue</div>
          <div className="stat-value green">{SGD(ADMIN_STATS.todayRevenue)}</div>
          <div className="stat-change">↑ {ADMIN_STATS.todaySales} plans sold</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today's Profit</div>
          <div className="stat-value accent">{SGD(ADMIN_STATS.todayProfit)}</div>
          <div className="stat-change">Margin {Math.round(ADMIN_STATS.todayProfit / ADMIN_STATS.todayRevenue * 100)}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Month Revenue</div>
          <div className="stat-value orange">{SGD(ADMIN_STATS.monthRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Plans</div>
          <div className="stat-value">{ADMIN_STATS.activePlans}</div>
        </div>
      </div>

      <div className="wallet-card" style={{ margin: "0 20px 24px" }}>
        <div className="wallet-label">Airalo Wallet Balance</div>
        <div className="wallet-balance">USD {ADMIN_STATS.walletBalance.toFixed(2)}</div>
        {ADMIN_STATS.walletBalance < 150 && (
          <div className="wallet-warning">⚠️ Balance below USD $150 — top up soon</div>
        )}
      </div>

      <div className="recent-header">
        <div className="recent-title">Recent Transactions</div>
        <span style={{ color: "var(--accent)", fontSize: "13px", fontWeight: "600" }}>View all</span>
      </div>

      {[
        { customer: "Li Wei", plan: "Japan 3GB", country: "japan", amount: 10.36, time: "2 mins ago" },
        { customer: "Ahmad B.", plan: "Thailand Unlimited", country: "thailand", amount: 16.35, time: "18 mins ago" },
        { customer: "Sarah T.", plan: "Korea 3GB", country: "south-korea", amount: 9.70, time: "42 mins ago" },
        { customer: "David Ng", plan: "UK 5GB", country: "united-kingdom", amount: 14.17, time: "1 hr ago" },
      ].map((tx, i) => (
        <div key={i} className="recent-item">
          <img className="recent-flag" src={MOCK_COUNTRIES.find(c => c.slug === tx.country)?.image.url} alt="" />
          <div className="recent-info">
            <div className="recent-customer">{tx.customer}</div>
            <div className="recent-plan">{tx.plan} · {tx.time}</div>
          </div>
          <div className="recent-amount">+{SGD(tx.amount)}</div>
        </div>
      ))}
    </div>
  );

  // ---- DIALLER HELPERS ----
  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2,"0");
    const s = (secs % 60).toString().padStart(2,"0");
    return `${m}:${s}`;
  };

  const getCallRate = (number) => {
    if (number.startsWith("+65") || number.startsWith("65")) return { country: "Singapore", rate: 0.05 };
    if (number.startsWith("+44") || number.startsWith("44")) return { country: "United Kingdom", rate: 0.05 };
    if (number.startsWith("+61") || number.startsWith("61")) return { country: "Australia", rate: 0.05 };
    if (number.startsWith("+1"))  return { country: "USA / Canada", rate: 0.05 };
    if (number.startsWith("+81")) return { country: "Japan", rate: 0.06 };
    if (number.startsWith("+86")) return { country: "China", rate: 0.06 };
    if (number.startsWith("+60")) return { country: "Malaysia", rate: 0.04 };
    if (number.startsWith("+91")) return { country: "India", rate: 0.05 };
    if (number.startsWith("+49")) return { country: "Germany", rate: 0.05 };
    return { country: "International", rate: 0.08 };
  };

  const startCall = () => {
    if (walletBalance < 0.50) { showToast("❌ Insufficient balance — please top up first"); return; }
    setCallState("calling");
    setTimeout(() => {
      setCallState("connected");
      let secs = 0;
      const timer = setInterval(() => {
        secs++;
        setCallDuration(secs);
        // deduct per minute
        if (secs % 60 === 0) {
          const rate = getCallRate(dialNumber).rate;
          setWalletBalance(prev => Math.max(0, +(prev - rate).toFixed(2)));
          setLastCallCost(prev => +(prev + rate).toFixed(2));
        }
      }, 1000);
      setCallTimer(timer);
    }, 2000);
  };

  const endCall = () => {
    if (callTimer) clearInterval(callTimer);
    setCallTimer(null);
    // Final per-second cost
    const rate = getCallRate(dialNumber).rate;
    const finalCost = +((callDuration / 60) * rate).toFixed(2);
    setLastCallCost(finalCost);
    setWalletBalance(prev => Math.max(0, +(prev - (finalCost - lastCallCost)).toFixed(2)));
    setCallState("ended");
  };

  const renderDialler = () => {
    const rateInfo = dialNumber.length > 3 ? getCallRate(dialNumber) : null;
    const KEYS = [
      { num: "1", letters: "" }, { num: "2", letters: "ABC" }, { num: "3", letters: "DEF" },
      { num: "4", letters: "GHI" }, { num: "5", letters: "JKL" }, { num: "6", letters: "MNO" },
      { num: "7", letters: "PQRS" }, { num: "8", letters: "TUV" }, { num: "9", letters: "WXYZ" },
      { num: "*", letters: "" }, { num: "0", letters: "+" }, { num: "#", letters: "" },
    ];

    // IN-CALL SCREEN
    if (callState === "calling" || callState === "connected") {
      return (
        <div className="incall-screen">
          <div className="incall-avatar">📞</div>
          <div className="incall-number">{dialNumber || "Unknown"}</div>
          <div className="incall-status">
            {callState === "calling" ? "Calling..." : "Connected"}
          </div>
          {callState === "connected" && (
            <>
              <div className="incall-duration">{formatDuration(callDuration)}</div>
              <div className="incall-cost">Est. cost: {SGD(+(callDuration / 60 * getCallRate(dialNumber).rate).toFixed(2))}</div>
            </>
          )}
          {callState === "calling" && <div className="incall-duration" style={{ color: "var(--muted)" }}>Connecting...</div>}
          <div className="incall-controls">
            <div className="incall-ctrl" onClick={() => setIsMuted(!isMuted)}>
              <div className={`incall-ctrl-btn ${isMuted ? "active" : ""}`}>{isMuted ? "🔇" : "🎤"}</div>
              <span className="incall-ctrl-label">{isMuted ? "Unmute" : "Mute"}</span>
            </div>
            <div className="incall-ctrl" onClick={endCall}>
              <div className="dial-call-btn end">📵</div>
              <span className="incall-ctrl-label" style={{ marginTop: "8px" }}>End</span>
            </div>
            <div className="incall-ctrl" onClick={() => setIsSpeaker(!isSpeaker)}>
              <div className={`incall-ctrl-btn ${isSpeaker ? "active" : ""}`}>🔊</div>
              <span className="incall-ctrl-label">{isSpeaker ? "Earpiece" : "Speaker"}</span>
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)", textAlign: "center" }}>
            Balance: {SGD(walletBalance)} · {getCallRate(dialNumber).country}: {SGD(getCallRate(dialNumber).rate)}/min
          </div>
        </div>
      );
    }

    // POST-CALL SCREEN
    if (callState === "ended") {
      return (
        <div className="screen" style={{ paddingBottom: "calc(var(--nav-h) + 20px)" }}>
          <div className="dialler-header">
            <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: "800" }}>Call Summary</div>
          </div>
          <div style={{ textAlign: "center", fontSize: "48px", margin: "20px 0 10px" }}>✅</div>
          <div className="postcall-card">
            <div className="postcall-title">Call Ended</div>
            <div className="postcall-row"><span>Number</span><span>{dialNumber}</span></div>
            <div className="postcall-row"><span>Duration</span><span>{formatDuration(callDuration)}</span></div>
            <div className="postcall-row"><span>Rate</span><span>{SGD(getCallRate(dialNumber).rate)}/min</span></div>
            <div className="postcall-row"><span>Call Cost</span><span>{SGD(lastCallCost)}</span></div>
            <div className="postcall-row"><span>Remaining Balance</span><span style={{ color: "var(--green)" }}>{SGD(walletBalance)}</span></div>
          </div>
          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button className="cta-btn" onClick={() => { setCallState("idle"); setCallDuration(0); setLastCallCost(0); setIsMuted(false); }}>
              📞 Call Again
            </button>
            <button className="cta-btn secondary" onClick={() => { setCallState("idle"); setDialNumber(""); setCallDuration(0); setLastCallCost(0); }}>
              New Call
            </button>
          </div>
        </div>
      );
    }

    // MAIN DIALLER
    return (
      <div className="dialler-screen">
        <div className="dialler-header">
          <button className="back-btn" onClick={() => navigate("home")}>← Back</button>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: "800" }}>Dialler</div>
          <div style={{ width: "60px" }} />
        </div>

        {/* Calling from */}
        <div className="dialler-from">
          <span style={{ fontSize: "20px" }}>📞</span>
          <div>
            <div className="dialler-from-label">Calling from</div>
            <div className="dialler-from-number">+65 3123 4567 (Virtual)</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--green)", fontWeight: "600" }}>
            Bal: {SGD(walletBalance)}
          </div>
        </div>

        {/* Display */}
        <div className="dialler-display">
          <div className={`dialler-number ${!dialNumber ? "empty" : ""}`}>
            {dialNumber || "Enter number..."}
          </div>
          {dialNumber.length > 0 && (
            <button className="dialler-delete" onClick={() => setDialNumber(prev => prev.slice(0, -1))}>
              ⌫
            </button>
          )}
        </div>

        {/* Rate preview */}
        {rateInfo && (
          <div className="dialler-rate">
            <span>📍 {rateInfo.country}</span>
            <span>{SGD(rateInfo.rate)}/min</span>
          </div>
        )}

        {/* Keypad */}
        <div className="dial-grid">
          {KEYS.map(key => (
            <div
              key={key.num}
              className="dial-key"
              onClick={() => setDialNumber(prev => prev.length < 15 ? prev + key.num : prev)}
            >
              <span className="dial-key-num">{key.num}</span>
              <span className="dial-key-letters">{key.letters}</span>
            </div>
          ))}
        </div>

        {/* Call button */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <button
            className={`dial-call-btn ${dialNumber.length < 4 ? "disabled" : ""}`}
            onClick={() => dialNumber.length >= 4 && startCall()}
          >
            📞
          </button>
        </div>

        {/* Wallet warning */}
        {walletBalance < 2 && (
          <div className="wallet-alert low" style={{ margin: "0 20px" }}>
            <span>⚠️</span>
            <span>Low balance — <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("wallet")}>Top up now</span></span>
          </div>
        )}

        {/* Recent calls */}
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: "700", marginBottom: "12px" }}>Recent Calls</div>
          {[
            { num: "+65 9123 4567", label: "Singapore", dur: "4:12", cost: 0.35 },
            { num: "+44 20 7946 0958", label: "UK", dur: "8:45", cost: 0.73 },
            { num: "+61 3 9000 1234", label: "Australia", dur: "2:05", cost: 0.18 },
          ].map((call, i) => (
            <div key={i} className="tx-item" style={{ padding: "10px 0" }} onClick={() => setDialNumber(call.num.replace(/\s/g, ""))}>
              <div className="tx-icon deduction" style={{ fontSize: "14px" }}>📞</div>
              <div className="tx-info">
                <div className="tx-desc">{call.num}</div>
                <div className="tx-date">{call.label} · {call.dur}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>{SGD(call.cost)}</div>
                <div style={{ fontSize: "11px", color: "var(--accent)", marginTop: "2px" }}>Redial</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWallet = () => {
    const handleTopUp = (amount) => {
      setWalletBalance(prev => +(prev + amount).toFixed(2));
      showToast(`✅ SGD ${amount.toFixed(2)} added to wallet!`);
      setTopupAmount(null);
    };

    return (
      <div className="wallet-screen">
        <div className="wallet-header">
          <button className="back-btn" onClick={() => navigate("profile")}>← Back</button>
          <div className="wallet-title">My Wallet</div>
          <div className="wallet-subtitle">Prepaid credit for calls and virtual number</div>
        </div>

        {/* Balance Card */}
        <div className="wallet-balance-card">
          <div className="wallet-balance-label">Available Balance</div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: "4px" }}>
            <div className="wallet-balance-currency">SGD</div>
            <div className="wallet-balance-amount">{walletBalance.toFixed(2)}</div>
          </div>
          <div className="wallet-balance-note">Used for virtual number subscription and call charges</div>
        </div>

        {/* Low balance alerts */}
        {walletBalance < 2 && (
          <div className="wallet-alert critical">
            <span>🚨</span>
            <span>Critical: Balance almost empty — services will suspend below SGD $0.00</span>
          </div>
        )}
        {walletBalance >= 2 && walletBalance < 5 && (
          <div className="wallet-alert low">
            <span>⚠️</span>
            <span>Low balance — top up to keep your virtual number active</span>
          </div>
        )}

        {/* Top Up Buttons */}
        <div className="section">
          <div className="section-title">Top Up Wallet</div>
        </div>
        <div className="topup-grid">
          {[10, 20, 50].map(amt => (
            <div key={amt} className="topup-btn" onClick={() => handleTopUp(amt)}>
              <span className="topup-amount">${amt}</span>
              <span className="topup-label">SGD</span>
            </div>
          ))}
          <div className="topup-btn custom" onClick={() => showToast("Custom amount — enter below")}>
            <span className="topup-amount">✏️</span>
            <span className="topup-label">Custom</span>
          </div>
        </div>

        {/* Custom Amount Input */}
        <div style={{ margin: "0 20px 20px", display: "flex", gap: "10px" }}>
          <input
            className="input-field"
            placeholder="Enter amount (min SGD $5)"
            type="number"
            min="5"
            value={topupAmount || ""}
            onChange={e => setTopupAmount(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            className="cta-btn"
            style={{ width: "auto", padding: "0 20px", boxShadow: "none" }}
            onClick={() => topupAmount >= 5 ? handleTopUp(+topupAmount) : showToast("Minimum top-up is SGD $5")}
          >Add</button>
        </div>

        {/* Auto Top-Up */}
        <div className="auto-topup-card">
          <div className="auto-topup-header">
            <div className="auto-topup-title">🔄 Auto Top-Up</div>
            <div className={`toggle-switch ${autoTopUp ? "on" : ""}`} onClick={() => { setAutoTopUp(!autoTopUp); showToast(autoTopUp ? "Auto top-up disabled" : "Auto top-up enabled ✅"); }} />
          </div>
          {autoTopUp ? (
            <div className="auto-topup-details">
              When balance drops below <span>SGD ${MOCK_WALLET.autoTopUpThreshold.toFixed(2)}</span>,
              automatically add <span>SGD ${MOCK_WALLET.autoTopUpAmount.toFixed(2)}</span> using your saved payment method.
              <div style={{ marginTop: "8px", color: "var(--green)", fontSize: "12px" }}>✅ Active — saved card ending 4242</div>
            </div>
          ) : (
            <div className="auto-topup-details">
              Enable to automatically top up your wallet when balance runs low — never lose your virtual number unexpectedly.
            </div>
          )}
        </div>

        {/* What uses wallet */}
        <div style={{ margin: "0 20px 20px", background: "var(--surface)", borderRadius: "var(--radius)", padding: "16px 18px", border: "1px solid var(--border)" }}>
          <div style={{ fontWeight: "700", marginBottom: "12px", fontSize: "14px" }}>💡 What uses your wallet?</div>
          {[
            { icon: "📞", label: "Virtual Home Number", amount: "SGD $3.00 / month" },
            { icon: "📲", label: "Incoming Calls", amount: "Included free" },
            { icon: "💬", label: "SMS & OTP Forwarding", amount: "Included free" },
            { icon: "📡", label: "Outgoing Calls", amount: "SGD $0.05 / min" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: "600" }}>{item.amount}</span>
            </div>
          ))}
        </div>

        {/* Transaction History */}
        <div className="tx-header">
          <div className="tx-title">Transaction History</div>
          <span style={{ color: "var(--accent)", fontSize: "13px", fontWeight: "600" }}>Download PDF</span>
        </div>

        {MOCK_WALLET.transactions.map(tx => (
          <div key={tx.id} className="tx-item">
            <div className={`tx-icon ${tx.type}`}>
              {tx.type === "topup" ? "💚" : "📤"}
            </div>
            <div className="tx-info">
              <div className="tx-desc">{tx.desc}</div>
              <div className="tx-date">{tx.date}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className={`tx-amount ${tx.type}`}>
                {tx.type === "topup" ? "+" : ""}{SGD(Math.abs(tx.amount))}
              </div>
              <div className="tx-balance">Bal: {SGD(tx.balance)}</div>
            </div>
          </div>
        ))}

        <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)", fontSize: "12px" }}>
          Unused wallet balance is non-refundable after 24 months of inactivity per Terms of Service.
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="profile-screen">
      <div className="profile-header">
        <div className="profile-avatar">👤</div>
        <div className="profile-name">Traveller</div>
        <div className="profile-email">user@email.com</div>
      </div>

      <div className="loyalty-card">
        <div className="loyalty-tier">🌟 EXPLORER TIER</div>
        <div className="loyalty-points">0 <span style={{ fontSize: "16px", color: "var(--muted)" }}>points</span></div>
        <div className="loyalty-label">Loyalty Programme</div>
        <div className="loyalty-note">🚀 Coming soon — earn points on every purchase and unlock travel rewards!</div>
      </div>

      <div className="menu-section">
        {[
          { icon: "💰", label: "My Wallet", action: () => navigate("wallet"), extra: SGD(walletBalance) },
          { icon: "📞", label: "Virtual Number", action: () => showToast("Manage your virtual number here soon!") },
          { icon: "📦", label: "Order History", action: () => { setMyPlansTab("history"); navigate("plans"); } },
          { icon: "🔔", label: "Notification Settings", action: () => showToast("Settings coming soon!") },
          { icon: "💳", label: "Payment Methods", action: () => showToast("Payment management coming soon!") },
          { icon: "🛡️", label: "Privacy Policy", action: () => showToast("Opening privacy policy...") },
          { icon: "📄", label: "Terms of Service", action: () => showToast("Opening terms...") },
          { icon: "💬", label: "Contact Support", action: () => showToast("support@juzgo.com") },
        ].map((item, i) => (
          <div key={i} className="menu-item" onClick={item.action}>
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {item.extra && <span style={{ fontSize: "13px", color: "var(--green)", fontWeight: "700" }}>{item.extra}</span>}
              <span className="menu-arrow">›</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "12px", padding: "0 20px 20px" }}>
        eSIM Connect v1.0 · esimconnect.world<br />
        <span style={{ color: "rgba(255,255,255,0.15)" }}>API: {apiStatus === "connected" ? "🟢 Live" : "🟡 Sandbox"}</span>
      </div>
    </div>
  );

  // ============================================================
  // RENDER
  // ============================================================
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <>
      <style>{styles}</style>
      <div className="phone-stage">
        <div className="phone-frame">
          <div className="phone-screen">

            {/* Dynamic Island */}
            <div className="dynamic-island">
              <div className="island-camera" />
              <div className="island-dot" />
            </div>

            {/* Status Bar */}
            <div className="status-bar">
              <span className="status-time">{timeStr}</span>
              <div className="status-icons">
                <span>●●●</span>
                <span>WiFi</span>
                <span>🔋</span>
              </div>
            </div>

            {/* Scrollable App Content */}
            <div className="phone-scroll">
              <div className="app">
                {toast && <div className="toast">{toast}</div>}

                {screen === "companion" && renderCompanion()}
                {screen === "home" && renderHome()}
                {screen === "countryPlans" && renderCountryPlans()}
                {screen === "checkout" && renderCheckout()}
                {screen === "plans" && renderMyPlans()}
                {screen === "admin" && renderAdmin()}
                {screen === "wallet" && renderWallet()}
                {screen === "dialler" && renderDialler()}
                {screen === "profile" && renderProfile()}
                {screen === "companion" && renderTravelCompanion()}

                {/* BOTTOM NAV */}
                {!["checkout"].includes(screen) && (
                  <nav className="bottom-nav">
                    {[
                      { id: "home", icon: "🌍", label: "Explore" },
                      { id: "plans", icon: "📡", label: "My Plans" },
                      { id: "companion", icon: "🤖", label: "AI Travel" },
                      { id: "dialler", icon: "📞", label: "Calls" },
                      { id: "admin", icon: "📊", label: "Dashboard" },
                      { id: "profile", icon: "👤", label: "Profile" },
                    ].map(item => (
                      <div
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                        onClick={() => { setActiveTab(item.id); navigate(item.id); }}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                      </div>
                    ))}
                  </nav>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
