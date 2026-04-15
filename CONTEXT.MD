# esimconnect — Living Project Context
Last updated: April 2026
Latest commit: [update after each session]

---

## Repository
- Repo: https://github.com/esimconnect/esimconnect (update if different)
- Live: [update with live URL]
- Local: E:\Kairos\esimconnect
- Branch: main

## Supabase
- URL: https://caiyjwcvwnquqfwoozjm.supabase.co
- Existing tables: countries, esim_plans, orders
- RLS: orders table open policy (permissive for all — review before production)
- Currency: SGD primary, GST 9% applied at checkout

## Environment Variables (.env)
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
REACT_APP_SUPABASE_URL=https://caiyjwcvwnquqfwoozjm.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_TWILIO_ACCOUNT_SID=          (TBC)
REACT_APP_TWILIO_AUTH_TOKEN=           (TBC)
REACT_APP_TWILIO_PHONE_NUMBER=         (TBC)
```

---

## What esimconnect Does
A travel tech platform for tourists and business travellers targeting:
- **eSIM data plans** — browse, buy and activate eSIM plans for 190+ countries
- **VoIP calling** — in-app calling via Twilio floating dialler widget
- **MyItinerary** — AI-generated travel plans for destinations
- **Wallet** — top-up balance via Stripe eWallet for calls and data

### Target Users
- Tourists / occasional travellers
- Business travellers (corporate)

---

## Tech Stack
| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React (Create React App)            |
| Routing     | React Router v6                     |
| Styling     | CSS Modules + global.css            |
| Auth + DB   | Supabase                            |
| Payments    | Stripe (Stripe.js + CardElement)    |
| VoIP        | Twilio                              |
| Hosting     | GitHub Pages                        |
| Backend     | Node.js (for Stripe webhooks etc.)  |

---

## Pages & Routes (App.js)
| Route                | Component           | Status       |
|----------------------|---------------------|--------------|
| /                    | Home                | Built        |
| /plans               | Plans               | Built        |
| /login               | Login               | Built        |
| /register            | Register            | Built        |
| /dashboard           | Dashboard           | Built        |
| /checkout            | Checkout            | Built        |
| /order-confirmation  | OrderConfirmation   | Built        |
| /itinerary           | Itinerary           | Built        |
| /purchases           | Purchases           | Built        |
| /find-order          | FindMyOrder         | Built        |
| /saved-itineraries   | SavedItineraries    | Built        |
| /terms               | TermsAndConditions  | Built        |
| /login-success       | LoginSuccess        | Built        |

---

## Supabase Schema (Known Tables)

### countries
```sql
id, name, iso_code, flag_emoji
```

### esim_plans
```sql
id, plan_name, country_id (→ countries), data_gb, validity_days,
price_sgd, is_active
```

### orders
```sql
id, order_number, user_id (→ auth.users), guest_email,
plan_id, country_id, subtotal_sgd, gst_sgd, total_sgd,
payment_method, payment_status, status
```

### New Tables Needed (Tonight's Build)
```sql
profiles          -- user profile + wallet_balance, linked to auth.users
wallet_topups     -- Stripe top-up transaction audit trail
voip_calls        -- Twilio call log per user (duration, cost, timestamp)
```

### profiles table (to build)
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  wallet_balance numeric(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- RLS: users can only read/write their own row
```

---

## Completed Work
- [x] React app scaffolded with React Router v6
- [x] Home page
- [x] Plans page (country filter, plan cards, Supabase query)
- [x] Checkout page (Stripe CardElement, GST calc, order insert)
- [x] Order confirmation page
- [x] Dashboard page
- [x] Login / Register pages
- [x] LoginSuccess page
- [x] Itinerary page
- [x] Purchases page
- [x] FindMyOrder page
- [x] SavedItineraries page
- [x] TermsAndConditions page
- [x] Footer component
- [x] Navbar component
- [x] Supabase client (lib/supabase.js)
- [x] Stripe publishable key wired to env

## In Progress / Tonight's Build
- [ ] PWA setup (manifest.json + service worker)
- [ ] Twilio VoIP floating dialler widget
- [ ] Stripe eWallet top-up flow
- [ ] Supabase — profiles table with wallet_balance

## Not Started
- [ ] MyItinerary — AI-generated travel plans (Claude API)
- [ ] Twilio backend (Node.js — generate access tokens, call routing)
- [ ] Stripe webhook handler (payment confirmation → wallet credit)
- [ ] Push notifications (PWA)
- [ ] Admin dashboard
- [ ] eSIM QR delivery (email via Resend / SendGrid)
- [ ] Annual plan / discount logic
- [ ] Guest checkout improvements
- [ ] Referral / promo code system

---

## Payments
- Stripe: primary (account exists, keys TBC for production)
- Currency: SGD
- GST: 9% applied at checkout
- Wallet top-up: one-off Stripe PaymentIntent (not subscription)
- Top-up amounts: SGD 10 / 20 / 50 / 100 (or custom)
- Wallet credits VoIP calls + data top-ups

---

## VoIP / Twilio Plan
- Floating dialler widget (fixed bottom-right, all pages)
- Twilio Voice SDK (browser-based calling)
- Backend: Node.js generates Twilio access tokens
- Calls deducted from wallet_balance in real time
- Call log stored in voip_calls table
- Rates: TBC (Twilio per-minute rates)

---

## MyItinerary Plan
- User inputs destination + travel dates + interests
- Claude API generates day-by-day itinerary
- Itinerary saved to Supabase (saved_itineraries table — TBC)
- Linked to user's eSIM plan destination where possible
- Route: /itinerary (page exists, AI integration TBC)

---

## PWA Plan
- manifest.json: app name, icons, theme colour, display: standalone
- Service worker: cache shell + offline fallback
- Goal: installable on iOS/Android home screen
- Push notifications: post-launch

---

## Key Decisions Log
| Date     | Decision                                          | Rationale                                 |
|----------|---------------------------------------------------|-------------------------------------------|
| Apr 2026 | React CRA (not Next.js) + GitHub Pages            | Already scaffolded, keep momentum         |
| Apr 2026 | Stripe eWallet (one-off top-up, not subscription) | Simpler UX for travel use case            |
| Apr 2026 | Twilio Voice SDK (browser VoIP, not PSTN SIP)     | No hardware, works on mobile PWA          |
| Apr 2026 | Claude API for MyItinerary                        | Best AI travel plan quality               |
| Apr 2026 | SGD primary currency, GST 9%                      | Singapore-based, legally required         |
| Apr 2026 | Shared wallet for VoIP + data top-ups             | Single balance, simpler UX                |
| Apr 2026 | CONTEXT.md as cross-chat bridge                   | Projects don't share chat history         |

---

## Build Sequence
```
PHASE 1 — Core Product (now)
├── profiles table + wallet_balance (Supabase)
├── PWA manifest + service worker
├── Stripe eWallet top-up flow
├── Twilio VoIP floating dialler widget
└── Twilio Node.js backend (access tokens)

PHASE 2 — Intelligence (pre-launch)
├── MyItinerary — Claude API integration
├── eSIM QR email delivery (Resend)
├── Stripe webhook → wallet credit
└── Push notifications (PWA)

PHASE 3 — Growth (post-launch)
├── Admin dashboard
├── Referral / promo codes
├── Guest checkout improvements
└── Multi-currency support

PHASE 4 — Expansion
├── Physical SIM option
├── Corporate / bulk plans
├── White-label API
└── Roaming top-up in-app
```

---

## Files In This Project
| File                        | Purpose                                      |
|-----------------------------|----------------------------------------------|
| CONTEXT.md                  | This file — update after every chat          |
| src/App.js                  | Route definitions                            |
| src/index.js                | React root entry                             |
| src/lib/supabase.js         | Supabase client                              |
| src/pages/Home.js           | Landing / home page                          |
| src/pages/Plans.js          | eSIM plan browser                            |
| src/pages/Checkout.js       | Stripe checkout + order insert               |
| src/pages/OrderConfirmation | Post-purchase confirmation                   |
| src/pages/Dashboard.js      | User dashboard                               |
| src/pages/Itinerary.js      | MyItinerary (AI TBC)                         |
| src/pages/Purchases.js      | Order history                                |
| src/pages/FindMyOrder.js    | Guest order lookup                           |
| src/pages/SavedItineraries  | Saved AI itineraries                         |
| src/components/Navbar.js    | Top navigation                               |
| src/components/Footer.js    | Footer                                       |
| src/styles/global.css       | Global styles                                |

---

## How To Use This Project

### Rules
1. Always read CONTEXT.md first before writing any code
2. Open a new chat per work stream (see naming below)
3. Update CONTEXT.md at the end of each chat session
4. Re-upload updated CONTEXT.md to Project Knowledge
5. Commit CONTEXT.md to repo after each session

### Chat Naming Convention
- "PWA — manifest + service worker"
- "VoIP — Twilio dialler widget"
- "Wallet — Stripe top-up flow"
- "Schema — profiles + wallet + voip_calls"
- "Itinerary — Claude AI integration"
- "Auth — login/register improvements"
- "Email — eSIM QR delivery"
- "UI — [specific component name]"

### Session Handoff Template
At the end of each chat, note:
```
Completed this session: [what was done]
Files changed: [list of files]
Latest commit: [hash]
Next session should: [what comes next]
```
Then update this file and re-upload to Project Knowledge.
