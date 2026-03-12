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
export default function JuzgoApp() {
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

  // ---- TOAST ----
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ---- NAVIGATION ----
  const navigate = (s) => {
    setScreen(s);
    if (["home","plans","profile","admin"].includes(s)) setActiveTab(s);
  };

  const selectCountry = (country) => {
    setSelectedCountry(country);
    setScreen("countryPlans");
  };

  const selectPlan = (plan) => {
    setSelectedPlan(plan);
    setCheckoutStep(1);
    setScreen("checkout");
  };

  const handlePurchase = async () => {
    setLoading(true);
    // In production: call AiraloAPI.createOrder(selectedPlan.id)
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    setCheckoutStep(3);
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

  const renderHome = () => (
    <div className="screen">
      <div className="header">
        <div className="header-top">
          <div className="logo">Juz<span>Go</span></div>
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

    if (checkoutStep === 3) {
      return (
        <div className="screen confirm-screen">
          <div className="confirm-icon">🎉</div>
          <div className="confirm-title">You're Connected!</div>
          <div className="confirm-subtitle">Your eSIM is ready to activate in {selectedPlan.country?.name}</div>
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
            {[1, 2, 3].map(s => (
              <div key={s} className={`step-dot ${s < checkoutStep ? "done" : s === checkoutStep ? "active" : ""}`} />
            ))}
          </div>
          <div className="checkout-title">{checkoutStep === 1 ? "Review Order" : "Payment"}</div>
          <div className="checkout-subtitle">{checkoutStep === 1 ? "Confirm your plan details" : "Choose payment method"}</div>
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
                <div className="price-row"><span className="price-label">GST (9%)</span><span>{SGD(gst)}</span></div>
                <div className="price-row total"><span>Total</span><span>{SGD(total)}</span></div>
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
            disabled={loading}
            onClick={() => {
              if (checkoutStep === 1) setCheckoutStep(2);
              else handlePurchase();
            }}
          >
            {loading ? "⏳ Processing..." : checkoutStep === 1 ? `Continue → ${SGD(total)}` : `Pay ${SGD(total)}`}
          </button>
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
                    <button className="esim-action-btn" onClick={() => showToast("Settings updated!")}>⚙️</button>
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
            <span className="menu-arrow">›</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "12px", padding: "0 20px 20px" }}>
        JuzGo v1.0.0 · Powered by Airalo<br />
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

                {screen === "home" && renderHome()}
                {screen === "countryPlans" && renderCountryPlans()}
                {screen === "checkout" && renderCheckout()}
                {screen === "plans" && renderMyPlans()}
                {screen === "admin" && renderAdmin()}
                {screen === "profile" && renderProfile()}

                {/* BOTTOM NAV */}
                {!["checkout"].includes(screen) && (
                  <nav className="bottom-nav">
                    {[
                      { id: "home", icon: "🌍", label: "Explore" },
                      { id: "plans", icon: "📡", label: "My Plans" },
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
