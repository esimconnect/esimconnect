# esimconnect — Living Project Context
Last updated: April 15, 2026
Latest commit: [update after each session]

---

## Repository
- Repo: https://github.com/esimconnect/esimconnect (update if different)
- Live: [update with live URL]
- Local: E:\Kairos\esimconnect
- Branch: main

## Supabase
- URL: https://emsovpcmdnuxrhbyvnvb.supabase.co
- Account email: dlimyk@gmail.com
- Existing tables: countries, esim_plans, esims, orders, profiles, saved_itineraries, usage_logs, users, voip_calls, waitlist, wallet_topups
- RLS: profiles, wallet_topups, voip_calls all have RLS enabled (own-row policies)
- Currency: SGD primary, GST 9% applied at checkout

## Stripe
- Account: Kairos Axiom (acct_1TBAKEBOsstkemgx)
- Sandbox: esimconnect sandbox (use this one — keys start with pk_test_ / sk_test_ from esimconnect sandbox)
- Live keys: available under Kairos Axiom (sk_live_...05tE created 10 Apr — for production later)
- Currency: SGD
- Top-up: one-off PaymentIntent (not subscription)

## Environment Variables

### Frontend: E:\Kairos\esimconnect\.env
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_[esimconnect sandbox key]
REACT_APP_SUPABASE_URL=https://emsovpcmdnuxrhbyvnvb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_yDr3YTcsErOPthkWXjjRRw_R4AaB3zA
REACT_APP_BACKEND_URL=http://localhost:4000
REACT_APP_TWILIO_ACCOUNT_SID=          (TBC)
REACT_APP_TWILIO_AUTH_TOKEN=           (TBC)
REACT_APP_TWILIO_PHONE_NUMBER=         (TBC)
```

### Backend: E:\Kairos\esimconnect\server\.env
```
STRIPE_SECRET_KEY=sk_test_[esimconnect sandbox key]
PORT=4000
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
| Backend     | Node.js (Express) on port 4000      |

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
| /wallet              | Wallet              | Built ✅      |

---

## Supabase Schema (All Tables)

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

### profiles
```sql
id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
full_name text,
phone text,
wallet_balance numeric(10,2) DEFAULT 0.00,
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
```
- RLS: own row read + update + insert policies
- Trigger: auto-created on user signup (handle_new_user)
- Trigger: updated_at auto-refresh

### wallet_topups
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
amount_sgd numeric(10,2) NOT NULL,
stripe_payment_intent_id text UNIQUE,
status text DEFAULT 'pending',  -- pending | succeeded | failed
created_at timestamptz DEFAULT now()
```
- RLS: own rows select policy

### voip_calls
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
to_number text NOT NULL,
duration_seconds integer DEFAULT 0,
cost_sgd numeric(10,4) DEFAULT 0.0000,
twilio_call_sid text UNIQUE,
status text DEFAULT 'initiated',  -- initiated | in-progress | completed | failed
created_at timestamptz DEFAULT now()
```
- RLS: own rows select policy

### Other existing tables (from previous sessions)
- esims — user eSIM records
- saved_itineraries — AI itinerary saves
- usage_logs — usage tracking
- users — legacy user table (profiles is the new one)
- waitlist — waitlist signups

---

## Completed Work
- [x] React app scaffolded with React Router v6
- [x] Home page
- [x] Plans page (country filter, plan cards, Supabase query)
- [x] Checkout page (Stripe CardElement, GST calc, order insert)
- [x] Order confirmation page
- [x] Dashboard page (updated to read from profiles table)
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
- [x] PWA — manifest.json + sw.js + icons
- [x] Supabase — profiles + wallet_topups + voip_calls tables
- [x] Wallet page — Stripe top-up flow (tested + working)
- [x] Node.js backend — server/server.js (Express + Stripe PaymentIntent)

## In Progress / Next Session
- [ ] Wire eWallet into Checkout page as payment option ← START HERE
- [ ] Twilio VoIP floating dialler widget
- [ ] Twilio Node.js backend (access tokens)

## Not Started
- [ ] MyItinerary — AI-generated travel plans (Claude API)
- [ ] Stripe webhook handler (payment confirmation → wallet credit)
- [ ] Push notifications (PWA)
- [ ] Admin dashboard
- [ ] eSIM QR delivery (email via Resend / SendGrid)
- [ ] Annual plan / discount logic
- [ ] Guest checkout improvements
- [ ] Referral / promo code system

---

## eWallet — Intended Use Cases
The wallet balance (profiles.wallet_balance) should be usable for ALL purchases:

1. **eSIM data plan purchases** — at checkout, logged-in users with sufficient balance
   see a "Pay with eWallet" option alongside the Stripe card option.
   - If wallet selected: deduct from profiles.wallet_balance directly (no Stripe call)
   - Order created with payment_method = 'wallet', payment_status = 'paid'
   - If insufficient balance: show top-up prompt linking to /wallet

2. **VoIP calls** — deduct per minute from wallet_balance in real time
   - Call log stored in voip_calls table with cost_sgd

3. **Future: virtual number monthly fee** — deduct from wallet on renewal

### Checkout eWallet Flow (to build next session)
- On Checkout page load: check if user is logged in + fetch wallet_balance
- If wallet_balance >= order total_sgd: show "Pay with eWallet (SGD X.XX available)" option
- If wallet selected:
  - UPDATE profiles SET wallet_balance = wallet_balance - total_sgd WHERE id = user_id
  - INSERT order with payment_method = 'wallet', payment_status = 'paid'
  - Redirect to /order-confirmation
- If wallet_balance < order total_sgd: show insufficient funds message + "Top Up Wallet" button → /wallet
- Card payment remains as fallback option for all users

---

## Running the App Locally
Always need TWO terminals running simultaneously:

**Terminal 1 — Backend (port 4000):**
```bash
cd /e/Kairos/esimconnect/server
node server.js
```

**Terminal 2 — Frontend (port 3000):**
```bash
cd /e/Kairos/esimconnect
npm start
```

If port already in use:
```bash
npx kill-port 4000
npx kill-port 3000
```

---

## Payments
- Stripe: primary (esimconnect sandbox for dev, live keys ready for prod)
- Currency: SGD
- GST: 9% applied at checkout
- Wallet top-up: one-off Stripe PaymentIntent (not subscription)
- Top-up amounts: SGD 10 / 20 / 50 / 100 / Other (custom)
- Wallet credits: VoIP calls + data plan purchases + future virtual number fees
- Backend URL: http://localhost:4000 (dev) — update for production

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
- Itinerary saved to Supabase (saved_itineraries table — exists)
- Linked to user's eSIM plan destination where possible
- Route: /itinerary (page exists, AI integration TBC)

---

## PWA Plan ✅ Done
- manifest.json: app name, icons, theme colour #0a0f1a, display: standalone
- Service worker: network first, cache fallback
- Icons: public/icons/icon-192.png + icon-512.png
- Registered in src/index.js
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
| Apr 2026 | Supabase URL corrected to emsovpcmdnuxrhbyvnvb    | Previous URL in CONTEXT.md was wrong      |
| Apr 2026 | Stripe keys must come from esimconnect sandbox    | pk/sk must match — different sandboxes broke PaymentIntent |
| Apr 2026 | eWallet usable for data plan checkout             | Wallet should be universal, not VoIP-only |

---

## Build Sequence
```
PHASE 1 — Core Product (in progress)
├── ✅ profiles table + wallet_balance (Supabase)
├── ✅ PWA manifest + service worker
├── ✅ Stripe eWallet top-up flow
├── [ ] eWallet payment option in Checkout page ← NEXT
├── [ ] Twilio VoIP floating dialler widget
└── [ ] Twilio Node.js backend (access tokens)

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
| File                              | Purpose                                      |
|-----------------------------------|----------------------------------------------|
| CONTEXT.md                        | This file — update after every chat          |
| src/App.js                        | Route definitions                            |
| src/index.js                      | React root entry + SW registration           |
| src/lib/supabase.js               | Supabase client                              |
| src/pages/Home.js                 | Landing / home page                          |
| src/pages/Plans.js                | eSIM plan browser                            |
| src/pages/Checkout.js             | Stripe checkout + order insert               |
| src/pages/OrderConfirmation.js    | Post-purchase confirmation                   |
| src/pages/Dashboard.js            | User dashboard (reads from profiles)         |
| src/pages/Dashboard.module.css    | Dashboard styles (+ topUpBtn)                |
| src/pages/Wallet.js               | eWallet top-up page (Stripe)                 |
| src/pages/Wallet.module.css       | Wallet styles                                |
| src/pages/Itinerary.js            | MyItinerary (AI TBC)                         |
| src/pages/Purchases.js            | Order history                                |
| src/pages/FindMyOrder.js          | Guest order lookup                           |
| src/pages/SavedItineraries.js     | Saved AI itineraries                         |
| src/components/Navbar.js          | Top navigation                               |
| src/components/Footer.js          | Footer                                       |
| src/styles/global.css             | Global styles                                |
| public/manifest.json              | PWA manifest                                 |
| public/sw.js                      | Service worker                               |
| public/icons/icon-192.png         | PWA icon 192x192                             |
| public/icons/icon-512.png         | PWA icon 512x512                             |
| server/server.js                  | Node.js backend (Stripe PaymentIntent)       |
| server/package.json               | Backend dependencies                         |
| server/.env                       | Backend env vars (STRIPE_SECRET_KEY)         |

---

## How To Use This Project

### Rules
1. Always read CONTEXT.md first before writing any code
2. Open a new chat per work stream (see naming below)
3. Update CONTEXT.md at the end of each chat session
4. Re-upload updated CONTEXT.md to Project Knowledge
5. Commit CONTEXT.md to repo after each session

### Chat Naming Convention
- "Wallet — wire eWallet into checkout flow"
- "VoIP — Twilio dialler widget"
- "Itinerary — Claude AI integration"
- "Email — eSIM QR delivery"
- "Webhook — Stripe wallet credit"
- "Auth — login/register improvements"
- "UI — [specific component name]"

### Session Handoff Template
At the end of each chat, note:
```
Completed this session: [what was done]
Files changed: [list of files]
Latest commit: [hash]
Next session should: [what comes next]
```

---

## Session Log

### April 15, 2026
Completed:
- Confirmed correct Supabase project URL (emsovpcmdnuxrhbyvnvb)
- Created profiles, wallet_topups, voip_calls tables with RLS
- Built PWA (manifest.json, sw.js, icons, index.js updated)
- Built Wallet page (Stripe top-up, SGD 10/20/50/100/Other)
- Built Node.js backend (server/server.js — Stripe PaymentIntent)
- Fixed dotenv load order bug in server.js
- Fixed Stripe key mismatch (must use esimconnect sandbox keys)
- Manually inserted profile row for davidlim@esimconnect.world
- Tested top-up: SGD 20.00 succeeded ✅
- Decision: eWallet should be usable at checkout for data plan purchases

Files changed:
- src/App.js (added /wallet route)
- src/index.js (React root + SW registration)
- src/pages/Dashboard.js (reads from profiles, added Top Up button)
- src/pages/Dashboard.module.css (added topUpBtn style)
- src/pages/Wallet.js (new)
- src/pages/Wallet.module.css (new)
- public/manifest.json (new)
- public/sw.js (new)
- public/icons/icon-192.png (new)
- public/icons/icon-512.png (new)
- server/server.js (new)
- server/package.json (new)
- server/.env (new)

Next session should: Wire eWallet into Checkout page as payment option
