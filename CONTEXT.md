# esimconnect — Living Project Context
Last updated: April 29, 2026
Latest commit: 74239aa2

---

## Repository
- Repo: https://github.com/esimconnect/esimconnect
- Live: https://esimconnect.world
- Local: D:\Kairos\esimconnect
- Branch: main

## Supabase
- URL: https://emsovpcmdnuxrhbyvnvb.supabase.co
- Account email: dlimyk@gmail.com
- Existing tables: countries, esim_plans, esims, orders, profiles, push_subscriptions, resellers, saved_itineraries, usage_logs, users, voip_calls, waitlist, wallet_topups
- RLS: profiles, wallet_topups, voip_calls, push_subscriptions, resellers all have RLS enabled
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
- Worker: claude-proxy.kairosventure-io.workers.dev (bridges frontend → Claude API + Airalo)

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
REACT_APP_VAPID_PUBLIC_KEY=BHWKg9LMTkn1uA9pgQweT2DNyCfNAvMTYqO2QXSN8YJhlxrysfS3Br_iZpGVCbZfslZZ9g_0bfWRnyKncrKHG4k
REACT_APP_ADMIN_EMAIL=davidlim@esimconnect.world
REACT_APP_TWILIO_ACCOUNT_SID=          (TBC)
REACT_APP_TWILIO_AUTH_TOKEN=           (TBC)
REACT_APP_TWILIO_PHONE_NUMBER=         (TBC)

### Backend: D:\Kairos\esimconnect\Server\.env
STRIPE_SECRET_KEY=sk_test_[esimconnect sandbox key]
STRIPE_WEBHOOK_SECRET=whsec_[esimconnect webhook signing secret]
SUPABASE_URL=https://emsovpcmdnuxrhbyvnvb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[supabase service role key]
VAPID_PUBLIC_KEY=BHWKg9LMTkn1uA9pgQweT2DNyCfNAvMTYqO2QXSN8YJhlxrysfS3Br_iZpGVCbZfslZZ9g_0bfWRnyKncrKHG4k
VAPID_PRIVATE_KEY=Or2S1ilMhCMjwsBuU3-55tuFXonU87lmSgZW5XmPqnU
ADMIN_EMAIL=davidlim@esimconnect.world
PORT=4000

### Cloudflare Pages Environment Variables
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_[esimconnect sandbox key]
REACT_APP_SUPABASE_URL=https://emsovpcmdnuxrhbyvnvb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_yDr3YTcsErOPthkWXjjRRw_R4AaB3zA
REACT_APP_BACKEND_URL=https://esimconnect-backend.onrender.com
REACT_APP_VAPID_PUBLIC_KEY=BHWKg9LMTkn1uA9pgQweT2DNyCfNAvMTYqO2QXSN8YJhlxrysfS3Br_iZpGVCbZfslZZ9g_0bfWRnyKncrKHG4k
REACT_APP_ADMIN_EMAIL=davidlim@esimconnect.world

### Render Environment Variables
STRIPE_SECRET_KEY=sk_test_[esimconnect sandbox key]
STRIPE_WEBHOOK_SECRET=whsec_[esimconnect webhook signing secret]
SUPABASE_URL=https://emsovpcmdnuxrhbyvnvb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[supabase service role key]
VAPID_PUBLIC_KEY=BHWKg9LMTkn1uA9pgQweT2DNyCfNAvMTYqO2QXSN8YJhlxrysfS3Br_iZpGVCbZfslZZ9g_0bfWRnyKncrKHG4k
VAPID_PRIVATE_KEY=Or2S1ilMhCMjwsBuU3-55tuFXonU87lmSgZW5XmPqnU
ADMIN_EMAIL=davidlim@esimconnect.world
PORT=4000

---

## What esimconnect Does
A travel tech platform for tourists and business travellers targeting:
- eSIM data plans — browse, buy and activate eSIM plans for 190+ countries
- VoIP calling — in-app calling via Twilio floating dialler widget (post-launch)
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
| VoIP        | Twilio (TBC — post-launch)          |
| Hosting     | Cloudflare Pages                    |
| Backend     | Node.js (Express) on Render         |
| AI          | Claude API via Cloudflare Worker    |
| Maps        | react-leaflet + OpenStreetMap       |
| Geocoding   | Nominatim                           |
| Push        | Web Push API + VAPID + web-push npm |

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
| /admin               | Admin               | Built        |

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
payment_method,   -- 'card' | 'wallet' | 'gifted'
reseller_code,    -- e.g. SG-JOHN-00001 (nullable)
discount_sgd,     -- discount applied at checkout (default 0)
created_at

IMPORTANT: orders table uses price_sgd (not total_sgd), order_code (not order_number), status (not payment_status).

### profiles
id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
full_name text,
phone text,
wallet_balance numeric(10,2) DEFAULT 0.00,
preferred_reseller_code text,
reseller_linked_at timestamptz,
reseller_last_purchase_at timestamptz,
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()

RLS: own row read + update + insert policies
Trigger: auto-created on user signup (handle_new_user)
Trigger: updated_at auto-refresh

### resellers
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
name text NOT NULL,
short_name text NOT NULL,
country_iso text NOT NULL,
code text UNIQUE NOT NULL,
commission_pct numeric(5,2) DEFAULT 10.00,
discount_value numeric(10,2) DEFAULT 0.00,
discount_type text DEFAULT 'percent',
attribution_months integer DEFAULT 0,
start_date date DEFAULT CURRENT_DATE,
is_active boolean DEFAULT true,
notes text,
user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
slug text UNIQUE,
account_type text DEFAULT 'individual',
created_at timestamptz DEFAULT now()

Sequence: reseller_code_seq (global, padded to 5 digits)
RLS: enabled — service role only

### wallet_topups
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
amount_sgd numeric(10,2) NOT NULL,
stripe_payment_intent_id text UNIQUE,
status text DEFAULT 'pending',
created_at timestamptz DEFAULT now()

### voip_calls
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
to_number text NOT NULL,
duration_seconds integer DEFAULT 0,
cost_sgd numeric(10,4) DEFAULT 0.0000,
twilio_call_sid text UNIQUE,
status text DEFAULT 'initiated',
created_at timestamptz DEFAULT now()

### push_subscriptions
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
subscription jsonb NOT NULL,
created_at timestamptz DEFAULT now()

### saved_itineraries
user_id, destination, trip_data (jsonb), stage, selected_places (jsonb), created_at

### Other existing tables
- esims — user eSIM records
- usage_logs — itinerary search tracking
- users — legacy (profiles is active)
- waitlist — waitlist signups

---

## Reseller System

### Code format
[COUNTRY_ISO]-[SHORTNAME]-[SEQUENCE] e.g. SG-JOHN-00001
- Global sequence (reseller_code_seq), padded to 5 digits
- Immutable once created, generated server-side

### Attribution
- ?ref= captured on any page load → localStorage (30 days)
- Auto-fills at checkout from profile (preferred_reseller_code) or localStorage
- First purchase → saved to profiles.preferred_reseller_code
- Lifetime activity-based (dormant after 12 months no purchase)
- attribution_months = 0 (lifetime) | 12 | 24

### Commission
- commission_pct % of net price (after discount)
- Customer discount separate from reseller commission
- Tracked per order in orders.reseller_code + orders.discount_sgd

### Reseller portal
- Resellers log in as normal users
- If user_id linked on resellers table → Reseller tab visible in Dashboard
- Shows: summary cards, shareable link, anonymised orders (first name only)
- Read-only, no copy/export, no right-click on table

---

## Admin Dashboard (/admin)

### Access
- REACT_APP_ADMIN_EMAIL (frontend) + ADMIN_EMAIL (backend)
- Currently: davidlim@esimconnect.world
- ⚙️ Admin link in Navbar — admin email only

### Tabs
| Tab | Purpose |
|---|---|
| Orders | All orders, filter by status, edit inline |
| Users | All profiles, add credits, gift plan, reset password |
| Wallet Top-ups | Stripe history — read only |
| Usage Logs | Itinerary search logs — read only |
| Resellers | Create/edit/deactivate, set commission + discount |
| Reseller Sales | Attribution, commission owed, CSV export |
| Analytics | Revenue by day/month, top countries, plans, payment split, YTD |

---

## Push Notifications (PWA)
- VAPID keys in Render + Cloudflare env vars
- Triggers: order confirmed, wallet top-up, gifted plan
- User control: Dashboard notifications toggle
- iOS: requires home screen install (16.4+)

---

## Navbar
Logged out: My Itinerary → Plans → T&C → Register → Login → Language Toggle
Logged in:  My Itinerary → Plans → Dashboard → Purchases → Saved Trips → T&C → ⚙️ Admin (admin only) → Logout → Language Toggle

---

## Completed Work
- [x] Full React app with all pages and routes
- [x] Airalo eSIM plans via Cloudflare Worker
- [x] Stripe card + eWallet checkout
- [x] Supabase auth + profiles
- [x] PWA + push notifications
- [x] i18n EN/中文/日本語/한국어
- [x] MyItinerary — Claude AI chatbot + trip planner + Leaflet map
- [x] Cloudflare Pages + Render deployment
- [x] Admin dashboard (/admin) — 7 tabs
- [x] Reseller system — codes, attribution, commission, checkout integration
- [x] ?ref= URL capture → localStorage
- [x] ⚙️ Admin nav link (admin only)
- [x] Analytics tab — revenue charts, top countries, plans, YTD
- [x] Fixed Itinerary.js build error (unterminated string line 169)

---

## Remaining Work

PHASE 3 — Growth ← CURRENT
  [ ] Dashboard.js reseller portal tab
  [ ] User referral codes (USR- prefix, wallet credit reward)
  [ ] Purchases page — live eSIM status via Airalo API
  [ ] Guest checkout improvements
  [ ] Multi-currency support
  [ ] Render upgrade to Starter $7/mo

PHASE 4 — Expansion
  [ ] Rollover loyalty (unused data → wallet credit at plan expiry)
  [ ] Plan tier grouping (cost/GB tiers)
  [ ] Corporate accounts (master + sub-accounts, COD wallet)
  [ ] Reseller mini-sites (/r/:slug)
  [ ] Wholesale pricing tier
  [ ] Self-serve reseller signup
  [ ] Twilio VoIP dialler

---

## Files In This Project
| File | Purpose |
|---|---|
| CONTEXT.md | This file |
| esimconnect-reseller-context.docx | Full reseller + corporate design spec |
| src/App.js | Routes + ?ref= capture |
| src/index.js | React root + SW + LanguageProvider |
| src/lib/supabase.js | Supabase client |
| src/lib/i18n.js | i18n context + translations |
| src/lib/pushNotifications.js | Web Push helpers |
| src/pages/Home.js | Landing page |
| src/pages/Plans.js | eSIM plan browser |
| src/pages/Checkout.js | Checkout + reseller code field |
| src/pages/OrderConfirmation.js | Post-purchase |
| src/pages/Dashboard.js | User dashboard + notifications |
| src/pages/Dashboard.module.css | Dashboard styles |
| src/pages/Wallet.js | eWallet top-up |
| src/pages/Wallet.module.css | Wallet styles |
| src/pages/Itinerary.js | MyItinerary — Claude AI + map |
| src/pages/Purchases.js | Order history |
| src/pages/FindMyOrder.js | Guest order lookup |
| src/pages/SavedItineraries.js | Saved itineraries |
| src/pages/Admin.js | Admin dashboard — 7 tabs |
| src/pages/Admin.module.css | Admin styles |
| src/components/Navbar.js | Nav + admin link |
| src/components/Navbar.module.css | Navbar styles |
| src/components/LanguageToggle.js | Language dropdown |
| src/components/LanguageToggle.module.css | Language styles |
| src/components/Footer.js | Footer |
| src/components/AffiliateBar.js | Affiliate bar |
| src/components/TrustBadge.js | Trust badge |
| src/styles/global.css | Global styles |
| public/manifest.json | PWA manifest |
| public/sw.js | Service worker + push handler |
| Server/server.js | Express backend — all endpoints |
| Server/package.json | Backend deps (web-push) |
| Server/.env | Backend env vars |

---

## Git Commands
```bash
cd /d/Kairos/esimconnect
git add [files]
git commit -m "description"
git push origin main
```

---

## Session Log

### April 15, 2026
Completed: profiles/wallet_topups/voip_calls, PWA, Wallet, backend, Stripe tested

### April 16, 2026 — Session 1
Completed: .gitignore, Cloudflare Pages, Render deploy — Commit: cfeeb28d

### April 16, 2026 — Session 2
Completed: eWallet in Checkout, payment_method column — Commits: a4811890, 84862cc1

### April 17, 2026 — Session 3
Completed: Stripe webhook, CORS, RLS — Commits: 13c69436, de6b75c1

### April 17, 2026 — Session 4
Completed: Animated SVG globe logo, navbar height — Commits: bad54e6e → 49fc6ae1

### April 17, 2026 — Session 5
Completed: Full i18n system, LanguageToggle — Commits: 82d04c09, 022cae36

### April 24, 2026 — Session 6
Completed: t() wired into all pages — Commit: 6842462d

### April 27, 2026 — Session 7
Completed: DestinationChatbot, food recs, logo, markdown — Commits: 109eaa9d → 529a0ff2

### April 28, 2026 — Session 8
Completed: Push notifications end-to-end — Commits: 239c9e07 → 5a629d33

### April 29, 2026 — Session 9 (Admin + Reseller)
Completed:
- Reseller system fully designed (esimconnect-reseller-context.docx)
- Supabase: resellers table, reseller_code_seq, orders + profiles columns
- Server/server.js: 15 new admin + reseller endpoints
- Admin dashboard: 7 tabs (Orders, Users, Wallet, Logs, Resellers, Sales, Analytics)
- Analytics: revenue by day/month, top countries, plans, payment split, YTD, CSV export
- Checkout.js: reseller code field, auto-fill, live discount, profile save
- App.js: /admin route + ?ref= localStorage capture
- Navbar.js: ⚙️ Admin link (admin only)
- Fixed Itinerary.js build error (line 169 unterminated string)

Files: Server/server.js, src/pages/Admin.js+css, src/pages/Checkout.js,
       src/pages/Itinerary.js, src/App.js, src/components/Navbar.js
Commits: 6128c5f0, 479fec9a, 3f763221, 74239aa2

Next session should:
- Dashboard.js reseller portal tab
- Test admin dashboard with live data
- User referral codes (USR- prefix)
