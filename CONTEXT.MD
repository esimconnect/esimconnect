# esimconnect — Living Project Context
Last updated: April 17, 2026
Latest commit: de6b75c1

---

## Repository
- Repo: https://github.com/esimconnect/esimconnect
- Live: https://esimconnect.world
- Local: D:\Kairos\esimconnect
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
- Webhook: esimconnect-wallet-topup (Active) — listens for payment_intent.succeeded
- Webhook URL: https://esimconnect-backend.onrender.com/webhook

## Cloudflare
- Account: kairosventure.io@gmail.com
- Pages project: esimconnect (esimconnect-9dx.pages.dev)
- Domains: esimconnect.world + www.esimconnect.world (both Active, SSL enabled)
- Auto-deploys: Yes — every push to main triggers a build
- Build command: npm run build
- Output directory: build

## Render (Backend Hosting)
- Service: esimconnect-backend
- URL: https://esimconnect-backend.onrender.com
- Region: Singapore
- Plan: Free (spins down after 15min inactivity — upgrade to Starter $7/mo for production)
- Root directory: Server
- Start command: node server.js

## Environment Variables

### Frontend: D:\Kairos\esimconnect\.env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_[esimconnect sandbox key]
REACT_APP_SUPABASE_URL=https://emsovpcmdnuxrhbyvnvb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_yDr3YTcsErOPthkWXjjRRw_R4AaB3zA
REACT_APP_BACKEND_URL=https://esimconnect-backend.onrender.com
REACT_APP_TWILIO_ACCOUNT_SID=          (TBC)
REACT_APP_TWILIO_AUTH_TOKEN=           (TBC)
REACT_APP_TWILIO_PHONE_NUMBER=         (TBC)

### Backend: D:\Kairos\esimconnect\Server\.env
STRIPE_SECRET_KEY=sk_test_[esimconnect sandbox key]
STRIPE_WEBHOOK_SECRET=whsec_[esimconnect webhook signing secret]
SUPABASE_URL=https://emsovpcmdnuxrhbyvnvb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[supabase service role key]
PORT=4000

### Cloudflare Pages Environment Variables
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_[esimconnect sandbox key]
REACT_APP_SUPABASE_URL=https://emsovpcmdnuxrhbyvnvb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_yDr3YTcsErOPthkWXjjRRw_R4AaB3zA
REACT_APP_BACKEND_URL=https://esimconnect-backend.onrender.com

### Render Environment Variables
STRIPE_SECRET_KEY=sk_test_[esimconnect sandbox key]
STRIPE_WEBHOOK_SECRET=whsec_[esimconnect webhook signing secret]
SUPABASE_URL=https://emsovpcmdnuxrhbyvnvb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[supabase service role key]
PORT=4000

---

## What esimconnect Does
A travel tech platform for tourists and business travellers targeting:
- eSIM data plans — browse, buy and activate eSIM plans for 190+ countries
- VoIP calling — in-app calling via Twilio floating dialler widget
- MyItinerary — AI-generated travel plans for destinations
- Wallet — top-up balance via Stripe eWallet for calls and data

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
| Hosting     | Cloudflare Pages                    |
| Backend     | Node.js (Express) on Render         |

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
| /wallet              | Wallet              | Built        |

---

## Supabase Schema (All Tables)

### countries
id, name, iso_code, flag_emoji

### esim_plans
id, plan_name, country_id (-> countries), data_gb, validity_days, price_sgd, is_active

### orders
id, user_id (-> auth.users), guest_email,
package_id, package_title, country_code, country_name,
validity_days, data_amount, price_sgd,
order_code, iccid, qr_code, qr_url,
customer_email, customer_name, session_id,
status,           -- completed | pending | failed
payment_method,   -- 'card' | 'wallet'  (added Apr 16)
created_at

IMPORTANT: orders table uses price_sgd (not total_sgd), order_code (not order_number), status (not payment_status).

### profiles
id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
full_name text,
phone text,
wallet_balance numeric(10,2) DEFAULT 0.00,
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()

RLS: own row read + update + insert policies
Trigger: auto-created on user signup (handle_new_user)
Trigger: updated_at auto-refresh

### wallet_topups
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
amount_sgd numeric(10,2) NOT NULL,
stripe_payment_intent_id text UNIQUE,
status text DEFAULT 'pending',  -- pending | succeeded | failed
created_at timestamptz DEFAULT now()
RLS: own rows SELECT policy + own rows INSERT policy (added Apr 17)

### voip_calls
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
to_number text NOT NULL,
duration_seconds integer DEFAULT 0,
cost_sgd numeric(10,4) DEFAULT 0.0000,
twilio_call_sid text UNIQUE,
status text DEFAULT 'initiated',  -- initiated | in-progress | completed | failed
created_at timestamptz DEFAULT now()
RLS: own rows select policy

### Other existing tables
- esims — user eSIM records
- saved_itineraries — AI itinerary saves
- usage_logs — usage tracking
- users — legacy user table (profiles is the active one)
- waitlist — waitlist signups

---

## Completed Work
- [x] React app scaffolded with React Router v6
- [x] Home page
- [x] Plans page (country filter, plan cards, Supabase query)
- [x] Checkout page (Stripe CardElement, GST calc, order insert)
- [x] Order confirmation page
- [x] Dashboard page (reads from profiles table)
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
- [x] Node.js backend — Server/server.js (Express + Stripe PaymentIntent)
- [x] Deployed to Cloudflare Pages (auto-deploy on push)
- [x] Backend deployed to Render
- [x] esimconnect.world live with SSL
- [x] eWallet wired into Checkout page (wallet + card payment options)
- [x] Dashboard nav link added to Navbar
- [x] Dashboard Recent Orders field names fixed (price_sgd, order_code, status)
- [x] Stripe webhook handler (payment_intent.succeeded -> wallet credit)
- [x] wallet_topups INSERT RLS policy added
- [x] CORS fixed on backend (open to all origins)
- [x] Stripe publishable key corrected to esimconnect sandbox in Cloudflare

## In Progress / Next Session
- [ ] Twilio VoIP floating dialler widget <- START HERE
- [ ] Twilio Node.js backend (access tokens)

## Not Started
- [ ] MyItinerary — AI-generated travel plans (Claude API)
- [ ] Push notifications (PWA)
- [ ] Admin dashboard (use Supabase Studio until post-launch)
- [ ] eSIM QR delivery (email via Resend / SendGrid)
- [ ] Annual plan / discount logic
- [ ] Guest checkout improvements
- [ ] Referral / promo code system

---

## eWallet — Intended Use Cases
The wallet balance (profiles.wallet_balance) is usable for ALL purchases:

1. eSIM data plan purchases (DONE) — logged-in users with sufficient balance see "Pay with eWallet" at checkout.
   - If wallet selected: deduct from profiles.wallet_balance (no Stripe call)
   - Order created with payment_method = 'wallet', status = 'completed'
   - If insufficient balance: show top-up prompt linking to /wallet

2. VoIP calls — deduct per minute from wallet_balance in real time
   - Call log stored in voip_calls table with cost_sgd

3. Future: virtual number monthly fee — deduct from wallet on renewal

---

## Running the App Locally
Always need TWO terminals running simultaneously:

Terminal 1 — Backend (port 4000):
  cd /d/Kairos/esimconnect/Server
  node server.js

Terminal 2 — Frontend (port 3000):
  cd /d/Kairos/esimconnect
  npm start

If port already in use:
  npx kill-port 4000
  npx kill-port 3000

---

## Payments
- Stripe: primary (esimconnect sandbox for dev, live keys ready for prod)
- Currency: SGD
- GST: 9% applied at checkout
- Wallet top-up: one-off Stripe PaymentIntent (not subscription)
- Top-up amounts: SGD 10 / 20 / 50 / 100 / Other (custom)
- Wallet credits: VoIP calls + data plan purchases + future virtual number fees
- Backend URL: https://esimconnect-backend.onrender.com (production)
- Backend URL: http://localhost:4000 (local dev)
- Webhook: payment_intent.succeeded -> credits profiles.wallet_balance via service role key

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

## Admin Panel Plan
- Not building until post-launch
- Use Supabase Studio (supabase.co -> Table Editor) for all admin tasks in the interim
- Future: custom /admin route in React, service role key, bypasses RLS
- Covers: user management, order management, plan CRUD, wallet adjustments

---

## PWA Plan (Done)
- manifest.json: app name, icons, theme colour #0a0f1a, display: standalone
- Service worker: network first, cache fallback
- Icons: public/icons/icon-192.png + icon-512.png
- Registered in src/index.js
- Push notifications: post-launch

---

## Key Decisions Log
| Date     | Decision                                          | Rationale                                 |
|----------|---------------------------------------------------|-------------------------------------------|
| Apr 2026 | React CRA (not Next.js)                           | Already scaffolded, keep momentum         |
| Apr 2026 | Stripe eWallet (one-off top-up, not subscription) | Simpler UX for travel use case            |
| Apr 2026 | Twilio Voice SDK (browser VoIP, not PSTN SIP)     | No hardware, works on mobile PWA          |
| Apr 2026 | Claude API for MyItinerary                        | Best AI travel plan quality               |
| Apr 2026 | SGD primary currency, GST 9%                      | Singapore-based, legally required         |
| Apr 2026 | Shared wallet for VoIP + data top-ups             | Single balance, simpler UX                |
| Apr 2026 | CONTEXT.md as cross-chat bridge                   | Projects don't share chat history         |
| Apr 2026 | Supabase URL corrected to emsovpcmdnuxrhbyvnvb    | Previous URL in CONTEXT.md was wrong      |
| Apr 2026 | Stripe keys must come from esimconnect sandbox    | pk/sk must match — different sandboxes broke PaymentIntent |
| Apr 2026 | eWallet usable for data plan checkout             | Wallet should be universal, not VoIP-only |
| Apr 2026 | Switched from GitHub Pages to Cloudflare Pages    | Better React Router support, global CDN, auto-deploy |
| Apr 2026 | Backend hosted on Render (free tier)              | Simple Node.js hosting, Singapore region  |
| Apr 2026 | Admin panel deferred to post-launch               | Supabase Studio covers interim needs      |
| Apr 2026 | CORS opened to all origins on backend             | Restricted origins caused fetch failures  |
| Apr 2026 | Webhook credits wallet via service role key       | Bypasses RLS, reliable server-side credit |

---

## Build Sequence

PHASE 1 — Core Product (in progress)
  [x] profiles table + wallet_balance (Supabase)
  [x] PWA manifest + service worker
  [x] Stripe eWallet top-up flow
  [x] Cloudflare Pages deployment (auto-deploy)
  [x] Render backend deployment
  [x] eWallet payment option in Checkout page
  [x] Stripe webhook -> wallet credit
  [ ] Twilio VoIP floating dialler widget  <- NEXT
  [ ] Twilio Node.js backend (access tokens)

PHASE 2 — Intelligence (pre-launch)
  [ ] MyItinerary — Claude API integration
  [ ] eSIM QR email delivery (Resend)
  [ ] Push notifications (PWA)

PHASE 3 — Growth (post-launch)
  [ ] Admin dashboard (custom /admin route)
  [ ] Referral / promo codes
  [ ] Guest checkout improvements
  [ ] Multi-currency support

PHASE 4 — Expansion
  [ ] Physical SIM option
  [ ] Corporate / bulk plans
  [ ] White-label API
  [ ] Roaming top-up in-app

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
| src/pages/Checkout.js             | Checkout — card + eWallet payment            |
| src/pages/OrderConfirmation.js    | Post-purchase confirmation                   |
| src/pages/Dashboard.js            | User dashboard (reads from profiles)         |
| src/pages/Dashboard.module.css    | Dashboard styles (+ topUpBtn)                |
| src/pages/Wallet.js               | eWallet top-up page (Stripe + webhook)       |
| src/pages/Wallet.module.css       | Wallet styles                                |
| src/pages/Itinerary.js            | MyItinerary (AI TBC)                         |
| src/pages/Purchases.js            | Order history                                |
| src/pages/FindMyOrder.js          | Guest order lookup                           |
| src/pages/SavedItineraries.js     | Saved AI itineraries                         |
| src/components/Navbar.js          | Top navigation (+ Dashboard link)            |
| src/components/Footer.js          | Footer                                       |
| src/styles/global.css             | Global styles                                |
| public/manifest.json              | PWA manifest                                 |
| public/sw.js                      | Service worker                               |
| public/icons/icon-192.png         | PWA icon 192x192                             |
| public/icons/icon-512.png         | PWA icon 512x512                             |
| Server/server.js                  | Node.js backend (Stripe PaymentIntent + webhook) |
| Server/package.json               | Backend dependencies                         |
| Server/.env                       | Backend env vars (Stripe + Supabase keys)    |

---

## How To Use This Project

### Rules
1. Always read CONTEXT.md first before writing any code
2. Open a new chat per work stream (see naming below)
3. Update CONTEXT.md at the end of each chat session
4. Re-upload updated CONTEXT.md to Project Knowledge
5. Commit CONTEXT.md to repo after each session

### Chat Naming Convention
- "VoIP — Twilio dialler widget"
- "Itinerary — Claude AI integration"
- "Email — eSIM QR delivery"
- "Auth — login/register improvements"
- "UI — [specific component name]"

### Session Handoff Template
At the end of each chat, note:
  Completed this session: [what was done]
  Files changed: [list of files]
  Latest commit: [hash]
  Next session should: [what comes next]

---

## Session Log

### April 15, 2026
Completed:
- Confirmed correct Supabase project URL (emsovpcmdnuxrhbyvnvb)
- Created profiles, wallet_topups, voip_calls tables with RLS
- Built PWA (manifest.json, sw.js, icons, index.js updated)
- Built Wallet page (Stripe top-up, SGD 10/20/50/100/Other)
- Built Node.js backend (Server/server.js — Stripe PaymentIntent)
- Fixed dotenv load order bug in server.js
- Fixed Stripe key mismatch (must use esimconnect sandbox keys)
- Manually inserted profile row for davidlim@esimconnect.world
- Tested top-up: SGD 20.00 succeeded
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
- Server/server.js (new)
- Server/package.json (new)
- Server/.env (new)

### April 16, 2026 — Session 1
Completed:
- Confirmed Supabase account is under dlimyk@gmail.com
- Fixed .env file — removed Server/.env from Git tracking
- Updated .gitignore to exclude .env files
- Deployed frontend to Cloudflare Pages (kairosventure.io@gmail.com account)
- Connected custom domains: esimconnect.world + www.esimconnect.world (both Active + SSL)
- Deployed Node.js backend to Render (Singapore, Free tier)
- Updated REACT_APP_BACKEND_URL to https://esimconnect-backend.onrender.com

Files changed:
- .gitignore (added Server/.env)
- .env (updated REACT_APP_BACKEND_URL)

Commit: cfeeb28d

### April 16, 2026 — Session 2
Completed:
- Wired eWallet into Checkout page as payment option (Step 3)
- Added payment_method column to orders table in Supabase
- Tested full wallet pay flow: SGD 6.08 deducted, balance updated to SGD 13.92
- Fixed Navbar: added Dashboard link for logged-in users
- Fixed Dashboard: Recent Orders was showing NaN — corrected field names

Files changed:
- src/pages/Checkout.js
- src/components/Navbar.js
- src/pages/Dashboard.js

Supabase migration:
- ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'card';

Commits: a4811890, 84862cc1

### April 17, 2026 — Session 3 (Stripe Webhook)
Completed:
- Built Stripe webhook endpoint in Server/server.js (payment_intent.succeeded)
  - Verifies Stripe signature (STRIPE_WEBHOOK_SECRET)
  - On success: upserts wallet_topups row, increments profiles.wallet_balance
  - Uses Supabase service role key (bypasses RLS) — idempotent
- Updated /create-payment-intent to accept userId and store in Stripe metadata
- Updated Wallet.js — passes userId to PaymentIntent, inserts pending topup row client-side
- Fixed CORS — opened to all origins (was blocking esimconnect.world)
- Fixed Stripe publishable key mismatch — updated Cloudflare env var to esimconnect sandbox
- Added wallet_topups INSERT RLS policy (was SELECT only — blocked client inserts)
- Configured Stripe webhook destination in dashboard (esimconnect-wallet-topup, Active)
- Added 3 env vars to Render: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_WEBHOOK_SECRET
- Tested: SGD 20.00 top-up -> webhook fired -> wallet_topups succeeded -> balance updated

Files changed:
- Server/server.js
- src/pages/Wallet.js

Supabase migration:
- CREATE POLICY "wallet_topups: insert own rows" ON wallet_topups FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

Commits: 13c69436, de6b75c1
Next session should: Twilio VoIP floating dialler widget + Node.js access token backend
