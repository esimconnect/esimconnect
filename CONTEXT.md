# esimconnect — Living Project Context
Last updated: April 27, 2026
Latest commit: 529a0ff2

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
RLS: own rows SELECT policy + own rows INSERT policy

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

### saved_itineraries
user_id, destination, trip_data (jsonb), stage, selected_places (jsonb), created_at

### Other existing tables
- esims — user eSIM records
- usage_logs — usage tracking (action: 'itinerary_search', type: 'guest'|'registered')
- users — legacy user table (profiles is the active one)
- waitlist — waitlist signups

---

## i18n System

### Languages supported
EN (English) | 中文 (Chinese) | 日本語 (Japanese) | 한국어 (Korean)

### Key files
- src/lib/i18n.js — LanguageProvider, useLang() hook, all translations
- src/components/LanguageToggle.js — dropdown UI component
- src/components/LanguageToggle.module.css — styles

### Usage in any page
```js
import { useLang } from '../lib/i18n';
const { t } = useLang();
// then use t('key') instead of hardcoded strings
```

### Status
- i18n system: COMPLETE
- Language toggle in Navbar: COMPLETE
- t() wired into all pages: COMPLETE

### Translation keys (full list in src/lib/i18n.js)
Navbar: nav_plans, nav_itinerary, nav_purchases, nav_dashboard, nav_wallet, nav_login, nav_register, nav_logout
Home: home_hero_title, home_hero_sub, home_cta_browse, home_cta_trip
Plans: plans_title, plans_search, plans_data, plans_validity, plans_days, plans_buy, plans_no_results
Checkout: checkout_title, checkout_summary, checkout_gst, checkout_total, checkout_wallet, checkout_card, checkout_balance, checkout_pay, checkout_topup, checkout_insufficient
Dashboard: dash_title, dash_welcome, dash_balance, dash_topup, dash_recent, dash_no_orders, dash_view_all
Wallet: wallet_title, wallet_balance, wallet_topup, wallet_amount, wallet_custom, wallet_pay, wallet_success, wallet_history
Itinerary: itin_title, itin_destination, itin_dates, itin_interests, itin_generate, itin_saved, itin_no_saved
Purchases: purchases_title, purchases_empty, purchases_order, purchases_status, purchases_date
Find Order: find_title, find_email, find_code, find_search, find_not_found
Order Confirmation: confirm_title, confirm_sub, confirm_order, confirm_iccid, confirm_qr
Auth: auth_email, auth_password, auth_name, auth_login, auth_register, auth_no_account, auth_have_account, auth_forgot
General: loading, error, save, cancel, close, back, days, gb, sgd, status_completed, status_pending, status_failed

### Language persistence
Saved to localStorage key: esimconnect_lang

---

## MyItinerary — Claude AI Integration

### How it works (Itinerary.js)
Two entry modes via tab switcher:

**Tab 1 — 💬 Explore Destinations (DestinationChatbot)**
- Two-column chat layout: "You" (left, cyan-tinted cards) | "Travel Assistant" (right, neutral cards)
- Input auto-focuses on mount so cursor is ready immediately
- Claude suggests 2-4 destinations per message based on user preferences
- When user is ready to plan, Claude injects PLAN_DESTINATION signal → "🗺️ Plan X →" button appears
- Button auto-fills destination field and switches to Plan a Trip tab

**Tab 2 — 🗺️ Plan a Trip**
1. User selects destination + dates + duration (or detected from eSIM/order)
2. Claude API call 1 → destination-specific extra categories
3. User selects interests from standard + AI-generated categories
4. Claude API call 2 → flat list of verified places (suggestions)
5. User picks places, optionally adds via Nominatim search
6. Claude API call 3 → geographic clustering + day-by-day optimised route
7. Route displayed with Leaflet map, day filters, Google Maps links per stop

### API endpoint
- Worker URL: https://claude-proxy.kairosventure-io.workers.dev
- Model: claude-sonnet-4-20250514
- Worker also handles: /airalo/packages, /airalo/orders, /check-guest, /track-usage

### Food recommendations (widened Apr 27)
Prompt now explicitly includes: Michelin-starred, Bib Gourmand, national/regional tourism board picks,
TripAdvisor top-rated, Google 4.5+ stars, street food/hawker centres, local hidden gems.
trustSource values: "Michelin Star", "Bib Gourmand", "Tourism Board Recommended",
"TripAdvisor Top-Rated", "Local Favourite", "UNESCO"

### Gate system
- Guests: 2 free searches (tracked via localStorage + IP via worker /check-guest)
- Registered users: 5 free searches (tracked via usage_logs table)
- Plan buyers (any completed order): unlimited searches
- IS_DEV flag in Itinerary.js — set to false in production

### Map
- Library: react-leaflet + leaflet
- Tiles: OpenStreetMap
- Step 3 (suggestions): flat map of all suggested places
- Step 5 (route): interactive day-filter map with numbered stops per day
- Place search: Nominatim (OpenStreetMap geocoding)

### Saving
- Save full routed itinerary → saved_itineraries table (trip_data jsonb)
- Save picked places list → saved_itineraries table (stage: 'suggestions', selected_places jsonb)
- Save as PDF → window.print() with print CSS

---

## Navbar

### Link order (both logged-in and logged-out)
Logged out: My Itinerary → Plans (dropdown) → T&C → Register → Login → Language Toggle
Logged in:  My Itinerary → Plans (dropdown) → Dashboard → Purchases → Saved Trips → T&C → Logout → Language Toggle

### Logo (as of Apr 27)
- SVG globe, height: 88px, fits within 96px navbar (no overflow)
- Single 5G text (unboxed, cyan glow) orbiting clockwise every 6s
- Brand name "eSIMconnect" on one line (e + connect in cyan, SIM in white), fontSize: 24
- Drop shadow: rgba(26,106,255,0.5)
- CSS animations: nb_orbit5G (6s linear infinite)

---

## Completed Work
- [x] React app scaffolded with React Router v6
- [x] Home page
- [x] Plans page (Airalo API via Cloudflare Worker)
- [x] Checkout page (Stripe CardElement + eWallet, 4-step flow)
- [x] Order confirmation page
- [x] Dashboard page (reads from profiles table)
- [x] Login / Register pages
- [x] LoginSuccess page
- [x] Itinerary page (Claude AI — chatbot + suggestions + routing + Leaflet map)
- [x] Purchases page
- [x] FindMyOrder page
- [x] SavedItineraries page
- [x] TermsAndConditions page
- [x] Footer, AffiliateBar, TrustBadge components
- [x] Navbar — animated SVG globe logo, single orbiting 5G icon, fits in navbar
- [x] PWA manifest + service worker
- [x] Stripe eWallet top-up flow + webhook
- [x] Cloudflare Pages deployment (auto-deploy on push to main)
- [x] Render backend deployment (Singapore, Free)
- [x] eWallet payment option in Checkout
- [x] Language toggle EN/中文/日本語/한국어
- [x] t() wired into all pages
- [x] MyItinerary first in navbar
- [x] DestinationChatbot — two-column layout, auto-focus, PLAN_DESTINATION signal
- [x] Widened food recommendations beyond Michelin

---

## Remaining Work

PHASE 1 — Pre-launch
  [ ] Twilio VoIP floating dialler widget (deprioritised to post-launch)

PHASE 2 — Intelligence (pre-launch) ← CURRENT PRIORITY
  [x] Cloudflare Worker (claude-proxy) — all routes live and verified
  [x] eSIM QR email delivery (Resend) — done, RESEND_API_KEY set, esimconnect.world verified
  [ ] Push notifications (PWA)

PHASE 3 — Growth (post-launch)
  [ ] Admin dashboard (/admin route)
  [ ] Referral / promo codes
  [ ] Guest checkout improvements
  [ ] Multi-currency support
  [ ] Render upgrade to Starter $7/mo

PHASE 4 — Expansion
  [ ] Physical SIM option
  [ ] Corporate / bulk plans
  [ ] White-label API
  [ ] Roaming top-up in-app
  [ ] Twilio VoIP floating dialler

---

## Files In This Project
| File                                     | Purpose                                               |
|------------------------------------------|-------------------------------------------------------|
| CONTEXT.md                               | This file — update after every session                |
| src/App.js                               | Route definitions                                     |
| src/index.js                             | React root entry + SW registration + LanguageProvider |
| src/lib/supabase.js                      | Supabase client                                       |
| src/lib/i18n.js                          | i18n context, useLang hook, all translations          |
| src/pages/Home.js                        | Landing / home page                                   |
| src/pages/Plans.js                       | eSIM plan browser (Airalo API, i18n done)             |
| src/pages/Checkout.js                    | Checkout — card + eWallet (i18n done)                 |
| src/pages/OrderConfirmation.js           | Post-purchase confirmation (i18n done)                |
| src/pages/Dashboard.js                   | User dashboard (i18n done)                            |
| src/pages/Dashboard.module.css           | Dashboard styles                                      |
| src/pages/Wallet.js                      | eWallet top-up page (i18n done)                       |
| src/pages/Wallet.module.css              | Wallet styles                                         |
| src/pages/Itinerary.js                   | MyItinerary — chatbot + Claude AI + Leaflet map       |
| src/pages/Purchases.js                   | Order history (i18n done)                             |
| src/pages/FindMyOrder.js                 | Guest order lookup (i18n done)                        |
| src/pages/SavedItineraries.js            | Saved AI itineraries                                  |
| src/components/Navbar.js                 | Top nav — globe logo + 5G orbit + language toggle     |
| src/components/Navbar.module.css         | Navbar styles                                         |
| src/components/LanguageToggle.js         | Language dropdown component                           |
| src/components/LanguageToggle.module.css | Language toggle styles                                |
| src/components/Footer.js                 | Footer                                                |
| src/components/AffiliateBar.js           | Affiliate bar                                         |
| src/components/TrustBadge.js             | Trust badge                                           |
| src/styles/global.css                    | Global styles (includes --navbar-height var)          |
| public/manifest.json                     | PWA manifest                                          |
| public/sw.js                             | Service worker                                        |
| public/icons/icon-192.png                | PWA icon 192x192                                      |
| public/icons/icon-512.png                | PWA icon 512x512                                      |
| Server/server.js                         | Node.js backend (Stripe PaymentIntent + webhook)      |
| Server/package.json                      | Backend dependencies                                  |
| Server/.env                              | Backend env vars (Stripe + Supabase keys)             |

---

## How To Use This Project

### Rules
1. Always read CONTEXT.md first before writing any code
2. Open a new chat per work stream
3. Update CONTEXT.md at the end of each session
4. Re-upload updated CONTEXT.md to Project Knowledge
5. Commit CONTEXT.md to repo after each session

### Chat Naming Convention
- "Itinerary — Claude AI integration"
- "VoIP — Twilio dialler widget"
- "Email — eSIM QR delivery"
- "Auth — login/register improvements"
- "UI — [specific component name]"

### Git Bash — common commands
```bash
cd /d/Kairos/esimconnect
git add src/components/Navbar.js src/pages/Itinerary.js
git commit -m "description"
git push origin main
```

### Session Handoff Template
At the end of each chat:
  Completed this session: [what was done]
  Files changed: [list]
  Latest commit: [hash]
  Next session should: [what comes next]

---

## Session Log

### April 15, 2026
Completed: profiles/wallet_topups/voip_calls tables, PWA, Wallet page, Node.js backend, Stripe top-up tested
Files: src/App.js, src/index.js, src/pages/Dashboard.js+css, src/pages/Wallet.js+css, public/manifest.json, public/sw.js, public/icons/*, Server/*

### April 16, 2026 — Session 1
Completed: .gitignore fix, Cloudflare Pages deploy, custom domains, Render backend deploy
Files: .gitignore, .env
Commit: cfeeb28d

### April 16, 2026 — Session 2
Completed: eWallet wired into Checkout, payment_method column added, Navbar Dashboard link, Dashboard NaN fix
Files: src/pages/Checkout.js, src/components/Navbar.js, src/pages/Dashboard.js
Commits: a4811890, 84862cc1

### April 17, 2026 — Session 3 (Stripe Webhook)
Completed: Stripe webhook (payment_intent.succeeded → wallet credit), CORS fix, RLS INSERT policy, tested SGD 20 top-up
Files: Server/server.js, src/pages/Wallet.js
Commits: 13c69436, de6b75c1

### April 17, 2026 — Session 4 (Logo + UI)
Completed: Animated SVG globe logo in Navbar, orbiting SIM chips, 96px navbar height, --navbar-height CSS var, PWA icons updated
Files: src/components/Navbar.js+css, src/styles/global.css, public/esimconnect-logo.svg, public/icons/*
Commits: bad54e6e → 49fc6ae1

### April 17, 2026 — Session 5 (Language Toggle)
Completed: Full i18n system (EN/中文/日本語/한국어), LanguageToggle component, persists to localStorage
Files: src/lib/i18n.js, src/components/LanguageToggle.js+css, src/index.js, src/components/Navbar.js+css
Commits: 82d04c09, 022cae36

### April 24, 2026 — Session 6 (i18n Wiring)
Completed: t() wired into all 10 page components
Files: src/pages/Plans.js, Dashboard.js, Wallet.js, Login.js, Register.js, Purchases.js, OrderConfirmation.js, FindMyOrder.js, Checkout.js, Itinerary.js
Commit: 6842462d

### April 27, 2026 — Session 7 (MyItinerary improvements)
Completed:
- MyItinerary moved to first position in Navbar (logged-in and logged-out)
- DestinationChatbot added: two-column layout (You | Travel Assistant), auto-focus input, PLAN_DESTINATION signal → plan button
- Food recommendation prompt widened beyond Michelin to include tourism boards, TripAdvisor, local favourites, street food
- Navbar logo restored to full original SVG with all gradients
- Dual orbiting SIM chips replaced with single unboxed 5G text orbiting clockwise (6s)
- Logo resized to height 88px, fits within 96px navbar (no overflow)
- eSIMconnect brand name on one line
- Chatbot z-index fix (was being blocked by navbar SVG overflow)
- Chatbot empty state text changed to "Ask me here…"
- Two-column chat: both columns scroll-sync on new messages so questions and answers stay aligned
- Noted future design intent: typing directly in left column (deferred)
- Markdown rendering in chatbot (**bold**, *italic*, line breaks)
- Fixed flag/country code bug (Claude was prefixing "sg" before destination names)

Files changed: src/components/Navbar.js, src/pages/Itinerary.js
Commits: 109eaa9d, ed309108, bbe10d99, 48946bd7, b19e7574, dcca7189, 529a0ff2
Next session should: Audit Cloudflare Worker (claude-proxy), eSIM QR email delivery (Resend)
