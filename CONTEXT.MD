# AxiomAnare — Living Project Context
Last updated: April 2026
Latest commit: a82dad4

---

## Repository
- Repo: https://github.com/esimconnect/AxiomAnare
- Live: https://esimconnect.github.io/AxiomAnare
- Local: E:\Kairos\AxiomAnare\axiomanare\AxiomAnare
- Branch: main

## Supabase
- URL: https://zjfhxutcvjxootoekade.supabase.co
- Existing tables: organisations, assets, nvr_records
- RLS: hardened and tested
- pgvector: to be enabled (pre-launch)

---

## Completed Work
- [x] Single-channel diagnostic pipeline
- [x] Multi-channel diagnostic pipeline
- [x] PDF export
- [x] Fleet Dashboard (auth, RLS, baseline + batch upload)
- [x] Fleet detail panel
- [x] Agnostic file parser (CSV, MAT, XLSX, JSON, TSV)
- [x] SVG logo integrated into nav (index.html)
- [x] Nav: Free to Try, Subscribe, Login, Fleet Dashboard buttons
- [x] Hero subtitle single line
- [x] Register renamed to Subscribe
- [x] Nav height and logo sizing finalised

## In Progress
- [ ] Supabase schema for new tables
- [ ] auth.js shared module
- [ ] Auth + Subscribe modal (index.html)
- [ ] Stripe + PayPal integration
- [ ] Tier gating (index.html + fleet.html)

## Not Started
- [ ] Landing page
- [ ] Digital twin Phase 1
- [ ] RAG knowledge base pipeline
- [ ] ML feature extraction (CWRU/NASA)
- [ ] Case library population
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Annual pricing / discount logic
- [ ] Supabase Storage buckets (ml-raw-signals, knowledge-base)
- [ ] pgvector enable + knowledge_chunks embedding pipeline

---

## Tier Structure
| Tier          | Price      | Analyses  | Assets | AI Report | Fleet |
|---------------|------------|-----------|--------|-----------|-------|
| Free          | $0         | 2         | —      | ✗         | ✗     |
| Pro           | $49/month  | Unlimited | —      | ✓         | ✗     |
| Fleet Starter | $99/month  | Unlimited | 10     | ✓         | ✓     |
| Fleet Pro     | $299/month | Unlimited | 30     | ✓         | ✓     |
| Asset add-on  | $25/asset  | —         | +1     | ✓         | ✓     |

- No upload caps on any paid tier
- Annual: 2 months free (pay 10, get 12)
- AI report is the primary freemium gate
- Pricing philosophy: below expense claim threshold —
  engineer pays own card, no PO or finance approval needed

---

## Payments
- Stripe: primary (account exists, keys TBC)
- PayPal: secondary (client ID TBC)
- Currency: USD primary, local currency via Stripe/PayPal auto
- Billing: monthly auto-renew, cancel anytime
- Stripe Price IDs: to be created in Stripe Dashboard
- Products to create in Stripe:
    1. AxiomAnare Pro — $49/month recurring
    2. AxiomAnare Fleet Starter — $99/month recurring
    3. AxiomAnare Fleet Pro — $299/month recurring
    4. Asset Add-on — $25/month recurring

---

## Planned Supabase Schema

### New Tables Needed
```sql
profiles              -- tier, org_id, linked to auth.users
asset_twins           -- digital twin state per asset
case_library          -- confirmed fault cases for ML training
knowledge_chunks      -- RAG text chunks + pgvector embeddings
usage_log             -- anonymised analysis events for ML
subscription_events   -- Stripe/PayPal webhook audit trail
```

### Updates To Existing Tables
```sql
-- nvr_records: add these columns
feature_vector    jsonb     -- full computed signal features
user_confirmed    boolean   -- engineer confirmed diagnosis?
confirmed_fault   text      -- actual fault if corrected
twin_deviation    float     -- delta from digital twin expected
```

---

## ML + Knowledge Base Strategy

### Data Sources
| Source               | Type     | Fault Coverage         | Status   |
|----------------------|----------|------------------------|----------|
| CWRU dataset         | MAT      | BPFO, BPFI, BSF, FTF   | Have it  |
| NASA IMS dataset     | MAT      | RUL / run-to-failure   | Have it  |
| K394-11 field report | PDF      | Imbalance (confirmed)  | Uploaded |
| ISO 10816 CMVA guide | PDF      | Zone thresholds        | Uploaded |
| CAT 1 manual         | PDF      | All fault types        | Pending  |
| More field reports   | PDF      | Mixed                  | Pending  |

### ML Pipeline (planned)
1. Enable pgvector in Supabase
2. Create Supabase Storage buckets
3. Bulk upload CWRU/NASA MAT files via script
4. Feature extraction script → ml_features table
5. Label features by fault type
6. Train classifier (target: 12 months post-launch)
7. PDF chunking + embedding → knowledge_chunks table
8. RAG query injected into Claude prompt at analysis time

### Supabase Storage Structure (planned)
```
ml-raw-signals/          (private bucket)
├── cwru/
│   ├── normal/
│   ├── bpfo/
│   ├── bpfi/
│   └── bsf/
└── nasa/
    ├── bearing1/
    ├── bearing2/
    └── bearing3/

knowledge-base/          (private bucket)
├── manuals/
├── reports/
└── standards/
```

### RAG Flow (planned)
```
PDF uploaded → chunk text → embed via Anthropic API
→ store in knowledge_chunks (pgvector)
→ at analysis time: query top-3 relevant chunks
→ inject into Claude system prompt
→ Claude narrative grounded in domain knowledge
```

---

## Key Decisions Log
| Date     | Decision                                        | Rationale                            |
|----------|-------------------------------------------------|--------------------------------------|
| Apr 2026 | Stripe primary, PayPal secondary                | Existing account, best docs          |
| Apr 2026 | No upload caps on paid tiers                    | Reduce friction, gate on assets only |
| Apr 2026 | $49/$99/$299 pricing                            | Below expense claim threshold        |
| Apr 2026 | pgvector in Supabase (not separate vector DB)   | Single platform, already running     |
| Apr 2026 | Claude Project + Supabase RAG (both)            | Dev workflow vs runtime production   |
| Apr 2026 | CONTEXT.md as cross-chat bridge                 | Projects don't share chat history    |
| Apr 2026 | Digital twin Phase 1 for Fleet on launch        | Justifies Fleet price point          |
| Apr 2026 | ML pipeline: collect now, train at 12 months    | Need labelled data volume first      |
| Apr 2026 | Site visit still required (not replaced)        | AI drafts report, engineer signs off |
| Apr 2026 | Launch full product (not phased feature launch) | Architecture ready, all layers in    |

---

## Build Sequence
```
PHASE 1 — Foundation (build now)
├── Supabase schema (all new tables + nvr_records updates)
├── auth.js shared module (login, signup, getTier)
├── Auth + Subscribe modal on index.html
├── Stripe + PayPal integration
├── Tier gating (index.html + fleet.html)
└── Landing page

PHASE 2 — Intelligence (pre-launch)
├── Digital twin Phase 1 (Fleet — baseline + deviation)
├── Supabase Storage buckets setup
├── PDF chunking + RAG pipeline
└── CWRU/NASA feature extraction

PHASE 3 — Growth (post-launch, 1-6 months)
├── Confirmed diagnosis feedback loop
├── Email notifications (anomaly alerts, readings due)
├── Statistical anomaly detection across dataset
└── Fleet Pro tier unlock

PHASE 4 — ML (12-24 months)
├── ML classifier (enough labelled data by now)
├── Full digital twin with degradation curve
├── API access for Fleet Pro
└── White-label option
```

---

## Files In This Project
| File                       | Purpose                                     |
|----------------------------|---------------------------------------------|
| CONTEXT.md                 | This file — update after every chat         |
| index.html                 | Main diagnostic app                         |
| app.js                     | Diagnostic engine, Freemium object          |
| fleet.html                 | Fleet dashboard                             |
| agnosticParser2.js         | Agnostic file parser                        |
| multiChannel.js            | Multi-channel analysis                      |
| agnosticParser.css         | Parser styles                               |
| ISO_10816_Chart_colour.pdf | ISO zone reference + CMVA interpretation    |
| Balancing_Report_K394.pdf  | Confirmed imbalance case study (K394-11)    |

---

## How To Use This Project

### Rules
1. Always read CONTEXT.md first before writing any code
2. Open a new chat per work stream (see naming below)
3. Update CONTEXT.md at the end of each chat session
4. Re-upload updated CONTEXT.md to Project Knowledge
5. Commit CONTEXT.md to repo after each session

### Chat Naming Convention
- "Schema — profiles + twins + case_library"
- "Auth — shared auth.js module"
- "Payments — Stripe + PayPal integration"
- "Gating — tier logic index + fleet"
- "Landing — landing page build"
- "ML — feature extraction CWRU/NASA"
- "RAG — knowledge base pipeline"
- "Twin — digital twin Phase 1"
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