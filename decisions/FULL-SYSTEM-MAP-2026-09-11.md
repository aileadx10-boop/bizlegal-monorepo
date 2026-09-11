# BIZLEGA — FULL SYSTEM MAP & REVENUE ARCHITECTURE (2026-09-11)

> Consolidates NIGHT-AUDIT-2026-09-08 (+ `_night-audit-deep/*`), O-022 (vault triage), O-023 (Revenue OS intake prong, 2026-09-10), and live state verified this week.
> **Evidence standard:** ✅VERIFIED (probed/observed) · 🔶CONFIRMED (code+config agree) · 🟡LIKELY · ⚪UNKNOWN · ❌FAILED.
> **Supersede:** anything claiming tracr migration blocked, "prod 31 commits behind", or blog stale — all resolved 09-09/09-10.
> Companion memory: [[session-2026-09-09-blog-unblocked]], [[night-audit-2026-09-08]].

---

## 0 — EXECUTIVE ANSWER (the closing question)

> *"Turn the existing BizLegal ecosystem into one coherent, automated, AI-assisted revenue machine: what do we CONNECT, REPAIR, REMOVE, BUILD — and in what order?"*

**The machine is already 90% built. It generates $0 because three seams never got tightened: (1) the payment→fulfillment seam, (2) the lead→nurture→booking seam, (3) the content→index seam.** The 12-day push (G0 = 09-20) is already decided and partially shipped (O-023, FirmCited intake OS). This map answers the system question; the revenue question is O-023.

**In one line:** CONNECT the payment rails that already hold real keys (PayPal LIVE + NOWPayments keys present in vault) to the 4 READY-TO-DEPLOY paid surfaces (deal44 / coguard / falseecho / sellerradar) + FirmCited $490 Gate-1; REPAIR the silent-fail layers (Anthropic credits $0, curator brain hop-1 404, `/api/digest` stubs, monitor crons cold); REMOVE the dead DNS + gutted scaffolds (9 orphans + caseaudit/dealdesk/funnel-mvp tombstones); BUILD nothing net-new for revenue (O-023 Stage-1 W1→W5 = intake capture, booking, pilot reporting); ORDER = payment gate first, then deploy 4 dark paid apps, then flip the content flywheel, then outbound.

---

## 1 — SYSTEM INVENTORY (status matrix)

| Layer | Surface | Route/product | Status | Money? |
|---|---|---|---|---|
| Hub (apex) | `bizlegal-ai.com` | 121 APIs / 195 pages / 23 crons / 7 payment gateways | 🟢LIVE ✅VERIFIED | ✅ 7 rails configured (PayPal/NOWP/Paddle/Wire/Conductor/LS/Products) — $0 collected |
| DocAI | `docai.bizlegal-ai.com` | Contract-risk + SQA funnel ($97/$69/$199) | 🟢LIVE ✅VERIFIED | ✅ in-app NOWP+PayPal, **fail-closed IPN** |
| Forge | `forge.bizlegal-ai.com` | Compliance kit ($149/$297/$97) | 🟢LIVE ✅VERIFIED | ✅ NOWP+P+Payoneer, fail-closed IPN |
| LexAudit | `lexaudit.bizlegal-ai.com` | Certs ($24/$29) + Monitor ($99/mo) | 🟢LIVE ✅VERIFIED | ✅ generic+cert stacks; **cart stack redirects 404** |
| Tracr | `tracr.bizlegal-ai.com` | Wallet scans | 🟢LIVE ✅VERIFIED | ✅ BRAI IPN **fixed (migration applied 09-10)** |
| BRAI | `brai.bizlegal-ai.com` | — | 🟢LIVE **🟡STOP-SELL** (still served) | ⚪ ledger rows all self-tests |
| LeadForge | `leadforge.bizlegal-ai.com` | Top-of-funnel, cross-sell | 🟢LIVE ✅VERIFIED | 🔴 no real data paths (stub digest + fake deals) |
| Bench | `bench.bizlegal-ai.com` | Eval lab ($2.5k/$5k/$12.5k) | 🟢LIVE ✅VERIFIED | ✅ Gates 3+5 closed 08-23; test purchase ⚪ |
| Cited (FirmCited) | `cited.bizlegal-ai.com` | Search-visibility OS ($299/$2k, $490) | 🟢LIVE ✅VERIFIED | ✅ **O-023 Phase-0 shipped 09-10; $490 Gate-1 = first-payment target** |
| Blog | `blog.bizlegal-ai.com` | CF Pages, 226 posts | 🟢LIVE ✅VERIFIED | 🔴 content flywheel **dead at hop 1** |
| Router (OCI) | `router.bizlegal-ai.com` | Deal router | 🟢LIVE ✅VERIFIED | 🔴 "test dummy" (2 test leads) |
| deal44 | `deal44.bizlegal-ai.com` | Room/party deal mgmt | 🟢LIVE ✅VERIFIED (title entity bug) | 🔴 READY-TO-DEPLOY; ILS rail manual-invoice |
| onepath-vert | `onepath-vert.vercel.app` | OnePath | 🟢LIVE ✅VERIFIED | 🔴 unbranded Vercel domain; branded subdomain dead |
| **9 orphans** | propsignal/leaseparse/closeflow/coguard/falseecho/sellerradar/caseaudit/dealdesk/antiguru55 | — | ⚫ NXDOMAIN ✅VERIFIED | — |

**Counts:** 21 hostnames probed → **12 alive** (11 prod-like + onepath-vert) · **9 dead DNS**.

### Where money can actually flow today (code paths that could take a real payment)
1. **Hub `/api/pay/start`** (universal; gateway-agnostic; `payment_orders` ledger) — ✅ all 7 gateways wired, keys present for PayPal/NOWP.
2. **FirmCited`/api/checkout* + PayPal subscriptions** — $490/$299/$2k; O-017 Gate-1.
3. **DocAI** `/payment/*` + `/payments/*` — $97; NOWP invoice live.
4. **Forge** `/api/scan/checkout`, `/api/payment/crypto` — $97/$149/$297; NOWP live.
5. **LexAudit** `/api/certificates/pay` + `/api/payments/*` — $24/$29 + $99/mo.
6. **Bench** `/api/checkout/start` → hub `/api/pay/start` — $2.5k+/mo.
7. **Dark-paid (built, not deployed):** deal44 (ILS+USD), coguard ($14.99/$29.99), falseecho ($29/$149), sellerradar ($49/$99), leaseparse ($59, gate off).

---

## 2 — INFRASTRUCTURE MAP

| Provider | What | Evidence |
|---|---|---|
| Vercel | 9 product projects, `aileadx10-5415s-projects` team; hub=root; **`9be4aea` pushed to all 9 projects 09-09** (prod no longer 31 behind) | ✅VERIFIED (O-023) |
| Cloudflare | Proxies apex+all bizlegal-ai.com subdomains (`188.114.96.x`); 4 Workers (`bizlegal-lead-intake` LIVE 200, telegram-hub/gsc-bot/coguard-email 1042); Zero-Trust protects curator (service_token_status:false) | ✅VERIFIED (probe) |
| Cloudflare Pages | `blog.bizlegal-ai.com` ← `aileadx10-boop/bizlegal-ea`; workflows via `gh` (`gho_` token has scope; `ghp_` doesn't) | ✅VERIFIED (2 deploys 09-09) |
| Hetzner CX33 | `204.168.209.235` — curator pipeline + seo-agents (15 jobs) + coguard binder :8083 + OCI router `151.145.81.139` | 🔶CONFIRMED (box inventory agent in flight) |
| Supabase | Prod project `ydghhcuuopqzgqcicubg`; tracr migration **applied 09-10 via Supabase MCP** | ✅VERIFIED |
| Ollama | Tunnel **on the LOCAL Windows box** (cloudflared PID 5124 → localhost:11434), NOT Hetzner — curator expects remote → hop-1 404 | ✅VERIFIED (deep 05) |
| OCI router box | `151.145.81.139` — B1-B8 complete; **next deploy crashes** (main.py imports coguard.py with signature mismatch) unless fixed | ✅VERIFIED (deep 02) |

---

## 3 — DOMAIN / SUBDOMAIN MAP

| Host | DNS | Serves | Live |
|---|---|---|---|
| bizlegal-ai.com | CF A | Hub | 🟢 |
| *.bizlegal-ai.com (tracr,brai,lexaudit,docai,leadforge,forge,deal44,blog) | CF A | per-surface | 🟢 |
| bench / cited | Vercel direct (no CF) | Bench / FirmCited | 🟢 |
| router | — | OCI router | 🟢 |
| hub.bizlegal-ai.com | NXDOMAIN | (sticky crosslink target! LeadForge banner → dead host) | ⚫ |
| notes.bizlegal-ai.com | NXDOMAIN | needed for outbound v2 (Instantly domain) | ⚫ |
| deals/oci.bizlegal-ai.com | NXDOMAIN | B9 DNS blocker | ⚫ |
| 9 orphan subdomains | NXDOMAIN | — | ⚫ |

---

## 4 — REPOSITORY MAP

| Repo | Path | Role | Sync |
|---|---|---|---|
| bizlegal-monorepo | `C:/Users/Moshe Dor/bizlegal-monorepo` | **Canonical** — all apps deploy from `apps/*` on `main` | 🟢 |
| bizlegal-ea | `aileadx10-boop/bizlegal-ea` | Blog CF Pages content (fed by seo-agents `publish_blog.py` via Contents API) | 🟢 synced 09-09 |
| Firmcited | `C:/Users/Moshe Dor/Firmcited` | **Revenue OS host (O-023)** — NOT in monorepo; own migrations `0014_intake_os` | 🟢 |
| (dev) bizlegal-ai / BIZLEGAL PROJECTS | legacy checkouts | NOT deploy source | ⚪ ignore |

---

## 5 — APPLICATION MAP (dark half)

| App | Verdict | Gap to revenue |
|---|---|---|
| deal44 | 🟢READY-TO-DEPLOY | Vercel project+DNS; ILS rail (manual-invoice fallback); `deals`=0 |
| coguard | 🟢READY-TO-DEPLOY | Vercel+DNS; 2 PayPal plan IDs + webhook secret; binder service up? |
| falseecho | 🟢READY-TO-DEPLOY | Vercel+DNS; PayPal Monitor plan; engine keys + test buy |
| sellerradar | 🟢READY-TO-DEPLOY | Vercel+DNS; PayPal Monitor plan; live fee-schedules deferred |
| leaseparse | 🟡NEEDS-WORK | 4 migrations unapplied; 2 buckets; `LEASEPARSE_CHECKOUT_LIVE` gate |
| closeflow | 🔴SCAFFOLD | landing + 2 stub routes (503 `checkout_not_live`) |
| propsignal | 🔴SCAFFOLD | landing + 2 stub routes |
| caseaudit / dealdesk / funnel-mvp | ⚫DEAD | no source / gutted / reverted |

---

## 6 — DATABASE / DATA MAP

**Supabase prod (shared, single project):** 40+ tables. Money-critical:
- `payment_orders` (264 rows, **all self-tests `dorlaw2014@`**) — universal ledger
- `tracr_wallet_leads` — **now correct schema** (payment_status+invoice_id added, wallet nullable) ✅
- `lead_nurture_state` — nurture queue (all verticals)
- `sales_campaign/sales_lead/sales_outreach/sales_reply/email_suppression_list` — outbound engine (dark)
- `seo_pages` / `daily_gaps` — content flywheel
- `agent_runs` (8,220) — agent telemetry
- **FirmCited `fc_*`** — separate project; intake schema `0014_intake_os` seeded `fc_flags.OUTBOUND_ENABLED=false` ✅

**Data blockers:** `GSC_ACCESS_TOKEN` empty (no sitemap submission) · outbound tables empty (no campaigns) · `social_drafts` 432 but no BLOTATO key.

---

## 7 — API MAP (hub spine = the integration layer)

- **`/api/ops/log`** — HMAC-SHA256 event spine, every surface writes here (source `BIZLEGAL_INBOUND_SECRET`).
- **`/api/ops/health`** — fleet env matrix — **404 on live apex** (route behind prod); per-surface 200.
- **`/api/pay/start`** + `/payments/{nowpayments,paypal,paddle,wire,conductor,lemonsqueezy,products}/*` — universal checkout.
- **`/api/agents/run?task=…`** — EA runner, 7 cron tasks (LLM-dependent).
- **`/api/realestate-intake`** → OCI router (HMAC).
- **`/api/indexnow`** — 403 without key (expected; pinger has key).
- **Digest stubs:** docai `/api/digest`, forge `/api/digest`, leadforge `/api/digest` — all hardcoded score=0 "quiet day". ✅VERIFIED (code).
- **`/api/ops/health` env-audit route 404s on ALL live hosts** — the doc-claimed route ships nowhere (fleet probe ✅VERIFIED).

---

## 8 — AGENT / AUTOMATION MAP

| Machine | Trigger | Status |
|---|---|---|
| Curator (`services/agents`, 39 py) | Hetzner crontab (cron_jobs.txt, 28 entries) | 🟡RUNNING but **LLM-reliant — Anthropic $0 kills every agent silently** |
| SEO-agents (`services/seo-agents`, 15 py) | crontab.txt + orchestrator | 🟡mostly run; writer/brain/quality_gate need credits |
| EA Worker lead-intake | CF Worker | 🟢LIVE (200) |
| Trigger.dev marketing (M.1/M.6) | 6h/1w cron | 🟡placeholder project id; n8n webhook unprovisioned → M.1 skips |
| Ops agents (`agents/ops`) | documented, executor=curator | ⚪DOCUMENTED-ONLY (~empty decision log) |
| Outbound v2 (`agents/outbound`) | cloud routine + hub dispatch | ⚫BUILT+DARK (no DNS, no Instantly/ZeroBounce, `OUTBOUND_AUTOSEND` unset) |
| **FirmCited intake OS (O-023)** | own cron (fail-closed 10-min, 20+ jobs) | 🟢Phase 0 shipped 09-10 |

**Content flywheel map:** RSS→scout→daily_gaps→bot/auto_pick→brain→publisher→bizlegal-ea→CF Pages. **🟢 DONE at last hop** (blog deploys). **⚫ DEAD at hop 1** (curator API chat 404 behind CF Zero Trust, no gemma model, Ollama tunnel on wrong box).

---

## 9 — MONEY FLOW (CRITICAL PATH)

```
prospect ──► landing ──► /api/pay/start (or in-app) ──► payment_orders(pending)
  ──► gateway (PayPal/NOWP) ──► IPN webhook ──► HMAC verify (fail-closed) ──► payment_orders(paid)
  ──► grant/fulfillment (products/*-grant, scan/report, passport/process, certificates) ──► email delivery ──► success page ──► nurture
```
- ✅ **Rails hold real keys** (PayPal id/secret 81-char, NOWP 32+23, RESEND 37, ANTHROPIC 109 — but **credits $0**).
- ✅ **Fail-closed IPNs** on DocAI/Forge (503 without secret), idempotent claim gates prevent double-fulfill.
- ✅ **FirmCited** PayPal subs live; Gate-1 $490 = first-real-money target (needs Anthropic top-up + Moses purchase).
- ⚠️ **LexAudit generic-stack success/cancel URLs 404** (no `/payment/` dir) — a card buyer through generic path hits a dead page.
- ⚠️ **Wire rail** present (BANK_USD_/EUR_/WIRE_ADMIN_TOKEN) but values are Moses-only placeholders.
- 🔴 **$0 lifetime revenue.** Every `payment_orders` row is a self-test.

---

## 10 — CUSTOMER JOURNEY (as-built)

`Search/GEO/AI-cite → landing (11 live) → free tool / audit / decision-tree → lead capture (Turnstile + rate-limit + nurture enqueue) → email nurture (Worker 4-step) → checkout (universal or in-app) → paid report/cert/deliverable → cross-sell (forge boi→boi-tracker, leadforge→hub retainer) → monitor/subscription upsell.`
- 🟢 Strong lead-capture layer (nurture enqueued on every surface).
- 🔴 **The middle is broken:** credits $0 → free-kb/demo replies fail; digest stubs → hub "Today's Brief" always quiet; curation dead → no fresh content → no new search entrances.
- 🔴 **No booking layer** in monorepo → that's exactly what O-023 builds (FirmCited intake → booking).

---

## 11-14 — ARCHITECTURE / REVENUE ENGINE / CLOSED LOOP / S2S

**Current:** hub-centric spoke-and-hub — every surface → hub (/api/ops/log, /api/pay/start, nurture, health). Coherent by design; the spine works. **Target (O-023 + this):** same spine + a **closed revenue loop** per vertical: *capture → qualify → book → bill → deliver → cross-sell → monitor → report*.

**The 5 revenue circles (candidate → live):**
1. DocAI SQA $97/$69/$199
2. FirmCited intake OS $490/$299/$2k + intake offers $750/$1.5k/$2k (O-023 W5)
3. Bench $2.5k/$5k/$12.5k enterprise audits
4. Forge compliance kit $97–$297
5. LexAudit certs+monitor $24–$599

**S2S flows:** surfaces→hub ops spine (HMAC) · checkouts→hub (except in-app coguard/falseecho/sellerradar) · CF Worker→inbound-lead (HMAC) · curator→forge `/api/scout` (gap pages) → seo_pages (⚫ dead at source) · blog publish→CF Pages (🟢) · FirmCited→own fc_* (🟢). **Missing edge:** OCI router is isolated (realestate-intake→router wired ⚪ light) and socials (Buffer/Reddit/X keys ⚪ unset mostly).

---

## 15 — GAP ANALYSIS (top gaps vs revenue)

| Gap | Severity | Fix |
|---|---|---|
| Anthropic credits $0 → every agent + demo LLM silent-fails | 🔴CRITICAL | Moses top-up (O-023 op #1); then forge `runModule` probe |
| Content flywheel dead at hop 1 (curator 404/no gemma/ollama on wrong box) | 🔴CRITICAL | repoint OLLAMA_TUNNEL_URL → 127.0.0.1:11434; re-SCP publisher; add curator-brain timer; verify CF Pages; deactivate n8n; fix pinger prefix |
| Curator 28-cron agents silent-fail on $0 credits | 🔴CRITICAL | credits + `revenue_alerter`/`self_heal` actually fire |
| 4 READY-TO-DEPLOY paid apps not on Vercel | 🟡HIGH | create projects, DNS, 2 PayPal plan IDs, verify binder |
| GSC token empty → no Search Console submit | 🟡HIGH | Moses batch token (O-023 op) |
| `/api/ops/health` 404 on apex + 8 surfaces | 🟡HIGH | redeploy hub (9be4aea covered other fixes) |
| LexAudit generic payment success/cancel 404 | 🟡HIGH | add `/payment/` routes |
| Outbound v2 dark (notes DNS, Instantly, ZeroBounce, autosend) | 🟡HIGH (post-G0) | O-023 warm-first Gmail rail already chosen |
| OCI router next deploy crash (ImportError) | 🟡HIGH | stub coguard import before deploy |
| Hub `hub.bizlegal-ai.com` NXDOMAIN but banner links to it | 🟢LOW | fix banner URL |
| deal44 title entity bug | 🟢LOW | escape in metadata |
| 9 orphan DNS + 3 gutted apps | 🟢LOW (delete) | cleanup |

---

## 16 — STATUS MATRIX (fleet, emoji)

🟢 **LIVE+product** (12): apex, docai, forge, lexaudit, tracr, brai, leadforge, bench, cited, blog, router, deal44, onepath-vert · 🟡 **LIVE-but-degraded**: blog (flywheel), OCI (dummy) · 🔴 **STOP-SELL**: brai · ⚫ **DEAD/DNS**: 9 orphans · 🟣 **READY-TODEPLOY**: deal44/coguard/falseecho/sellerradar · 🟤 **NEEDS-WORK**: leaseparse · ⚪ **SCAFFOLD**: closeflow/propsignal.

---

## 17 — WHAT IS ACTUALLY WORKING (5-ladder)

| Surface | CODE | CONFIGURED | DEPLOYED | REACHABLE | FUNCTIONAL | E2E FUNCTIONAL |
|---|---|---|---|---|---|---|
| Hub payments | ✅ | ✅ (keys live) | ✅ | ✅ | ✅ (rails) | ❌ no real tx |
| DocAI $97 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ (self-test only) |
| Forge kit | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| LexAudit certs | ✅ | ✅ | ✅ | ✅ | ⚠️ generic redirect 404 | ❌ |
| Bench | ✅ | ✅ | ✅ | ✅ | ⚠️ checkout flag only | ❌ |
| FirmCited intake OS | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ (Phase 0, no test buy) |
| Blog flywheel | ✅ | ❌ | ✅(blog) | ✅ | ❌ (hop1 dead) | ❌ |
| Curator agents | ✅ | ✅ | ✅ | ❌ (LLM $0) | ❌ | ❌ |
| 4 dark paid apps | ✅ | ⚪ | ❌ | ❌ | ❌ | ❌ |
| Outbound v2 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 18 — END-TO-END TESTS (no financial execution)

| # | Test | Status |
|---|---|---|
| T1 | Hub `/api/pay/start` validates product_id (probe) | ✅ 200 + valid list (deep 07) |
| T2 | DocAI fail-closed NOWP IPN (missing secret → 503) | ✅VERIFIED (code+audit) |
| T3 | Forge webhook idempotent claim (pending guard) | ✅VERIFIED |
| T4 | tracr wallet lead insert + paid update | ⚪ schema fixed; BRAI IPN test pending |
| T5 | LexAudit cert NOWP webhook (idempotent on paid) | ⚪ needs test cert buy |
| T6 | FirmCited inbound HMAC ingress + `fc_flags` fail-closed | ✅VERIFIED (O-023: 500→200 fix 09-10) |
| T7 | Practice-revenue analyzer E2E | ✅ **PR-2026-34a312ea46 verified 09-10** |

---

## 19 — FAILURE-POINT ANALYSIS

1. **LLM $0 = universal silent failure** (agents, free-kb, brain, enrichment) — highest blast radius.
2. **Curator hop-1** blocks all SEO/new content.
3. **Deploy drift** — hub `/api/ops/health` 404; 9be4aea fixed some but route still absent.
4. **OCI deploy crash** on next push (untested main.py import).
5. **Outbound fail-closed by design** (`fc_flags` missing → blocked, `OUTBOUND_AUTOSEND` unset → dispatch sends nothing) — safe but dark.
6. **Digest stubs fabricate "quiet day"** — honest anti-hallucination but misleads ops dash.
7. **Env-name mismatches** (docai ops/health checks SUPABASE_SERVICE_KEY vs reads _ROLE_KEY; leadforge same) — health can lie.
8. **PayPal webhook verify skipped without WEBHOOK_ID in non-prod** (docai) — shipped dev tolerance.
9. **Email-as-identity** auth on docai firm-KB.
10. **Rate-limit bypass** when Upstash envs missing (forge) and in-memory per-lambda (bench/leadforge) — soft abuse control.

---

## 20 — SECURITY AUDIT (summary)

- 🟢 HMAC-SHA256 inbound (timing-safe on most), fail-closed IPNs, idempotent claims, RLS on, storage buckets access-controlled.
- 🟢 CSP + security headers on hub middleware; robots allow-lists; `/r/*` no-referrer on deal44; lead-magnet C-2 server-side allow-list fix.
- 🟡 **Weak spots:** lexaudit `monitor/check` POST non-timing-safe compare (deep 07 #9); docai PayPal webhook skip-when-missing; email-as-identity firm KB; leadforge `/api/generate-report` presents fabricated deals/funds with no disclaimer; deal44 `/admin` Phase-0 internal route to delete; coguard checked-in import that would crash OCI.
- 🟡 **Secrets hygiene:** vault holds real 81-char PayPal + 42-char service keys in plaintext at `Downloads/env-hub-bizlegal-ai.txt`. Values never printed in this session. Recommend vault rotation post-first-revenue (O-023 already queues NOWP rotation).
- 🔴 **No CSP on most subdomains** (only hub middleware).
- ⚪ Auth boundary: dashboard pages not `noindex`ed except a few; token-gating inconsistent.

---

## 21 — OBSERVABILITY

- 🟢 Ops spine (`ops_events`, `agent_heartbeats`, `/api/ops/live` SSE) — hub.
- 🟢 `agent_runs` 8,220 rows; hub `/ops/*` dashboards (ops/health, metrics, subdomains).
- 🟡 `/api/ops/health` fleet matrix **404 on apex** → fleet health blind.
- 🔴 **No cost dashboards** — Supabase/Vercel/Cloudflare spend not surfaced anywhere.
- 🟡 SEO audit (page_audit.py daily 06:00) writes SEO-AUDIT-<date>.md + seo_pages. Blog sitemap lastmod fresh 09-09.

---

## 22 — COST AUDIT (🟡LIKELY, no billing pull)

- **Vercel:** 9 projects (hobby/pro), zero revenue to cover.
- **Supabase:** single prod project, shared.
- **Cloudflare:** free/paid workers; Pages build minutes.
- **Hetzner CX33:** fixed compute — 15 jobs + router idle burn.
- **Anthropic $0** (credits exhausted) — freezes product.
- **Ollama local** — $0 inference on Windows box (the one cost-free path — underused).
- Action: pull Vercel/Supabase/CF/Hetzner billing in the 30-day window; kill orphan DNS to avoid confusion; **the fleet burns money on a machine that hasn't produced a dollar.**

---

## 23 — TECHNICAL DEBT

- Prod-hub deploy lag historically ~31 commits (fixed 09-09); drift recurs without enforce.
- Docs-vs-code drift everywhere (docai/forge/leadforce/bench CLAUDE.md stale: `/scan` doesn't exist, inbound-lead absent, model ids wrong).
- Duplicate payment stacks (docai `payment/*` vs `payments/*`; lexaudit generic vs cert).
- Digest stubs; placeholder Trigger.dev project id; in-app-vs-hub payment variance across surfaces.
- `packages/@bizlegal/ops-log` & `payment` transpiled-but-unused in docai/leadforge.
- 3 dead apps + 9 orphan DNS + stale robots.txt duplicates (leadforge public vs app route).

---

## 24 — REVENUE PRIORITY MATRIX

| Rank | Move | Time-to-first-$ | Blocks | Evidence |
|---|---|---|---|---|
| 1 | FirmCited Gate-1 $490 (O-017/O-023) | <7d (needs credits + real buy) | credits, test buy | ✅VERIFIED code live |
| 2 | Deploy deal44 (ILS manual-invoice = shekel path) | ~1-2wk | Vercel project+DNS | 🟢READY |
| 3 | Deploy falseecho + sellerradar (monitor plans exist as SKUs) | ~2-3wk | DNS + PayPal plan + keys | 🟢READY |
| 4 | Flip forge/docai live (fix credits) | 1-2d after top-up | credits | 🟢 rails live |
| 5 | Content flywheel (SEO entrances → all funnels) | 1-2wk | curator hop-1 | 🔴 dead |
| 6 | O-023 Stage-1 W1→W5 (intake pilots, $750-$2k offers) | through 09-20+ | W1→W5 build | 🟢 Phase 0 |
| 7 | Bench enterprise ($2.5k) | opportunistic | self-benchmark + test buy | ⚪ |

**North-star: first **real** payment_orders row + `fc_` row within 12 days (target 09-20 G0).**

---

## 25 — FINAL EXECUTIVE MAP (A–M)

- **A Asset:** 12 live surfaces, one shared payment+nurture spine, fail-closed money rails with live keys.
- **B Barrier:** $0 credits freeze every LLM path; curator hop-1 dead; no real purchase ever completed.
- **C Currency:** compliance risk reduction (SQA, certs, passports, intake) — high-intent professional buyers.
- **D Data:** 264 self-test orders, 8,220 agent runs, 226 blog posts, 432 social drafts — near-zero customer data.
- **E Engine:** universal checkout + HMAC ops spine + nurture + deterministic scorers — sound but idle.
- **F Flywheel:** content flywheel exists topologically, dead at hop 1.
- **G Gateway:** PayPal LIVE + NOWP keys live; wire pending Moses values.
- **H Hiring:** none; solo-founder + self-hosted agents.
- **I Integration:** surface→hub wired; OCI isolated; socials unkeyed.
- **J Justification:** every build is pre-revenue; spend must be defended by the priority matrix.
- **K KPIs:** 5 numbers per O-023 (response, demo→payment, activation, ROI, M4 retention) + payment_orders count.
- **L Liability:** shield-clauses on all surfaces; email-only v0; rule-7 hard gates; no real sends.
- **M Money:** $0 → target $490 first week → 4-5k MRR in 6 months → 6-7 figures ARR / 18 months (founder directive).

---

## 26 — 30-DAY EXECUTION PLAN (aligned to O-023 G0=09-20)

| Wk | Theme | Actions (agent-runnable) | Moses ops |
|---|---|---|---|
| W0 (d2d) | Money gate | FirmCited Gate-1 buy path; credits top-up; flip forge/docai live; fix lexaudit /payment routes | Anthropic top-up; real $490 buy |
| W1 | Deploy dark-paid | 4 Vercel projects+DNS (deal44,falseecho,sellerradar,coguard); apply leaseparse migrations+buckets; 2 PayPal plan ids | PayPal plan ids; DNS entries |
| W1 | Intake OS | O-023 W1 leak scan; W2 intake capture | INTAKE_* vault names; GSC token |
| W2 | Flywheel | Fix curator hop-1; re-SCP publisher; brain timer; verify CF Pages; pinger prefix | — |
| W3 | Nurture+report | W3 follow-up, W4 reporting (fc_deliverables) | approve drafts; state-bar check |
| W4 | Outbound | O-023 W5 PI sprint; Gmail CLT export; Instantly domain (parallel) | Instantly setup; flip verified study |
| EOW | Audit | Billing pull; kill orphan DNS; security pass; update maps | NOWP rotation, OPS_DASHBOARD_TOKEN resync |

---

## 27 — BUILD / FIX / CONNECT / DELETE

**CONNECT (unlocks existing value):** credits→all LLM paths; curator hop-1→flywheel; `/api/ops/health`→hub redeploy; OCI router→deal44/realestate (with import stub fixed); social keys→Blotato/Buffer; GSC→sitemaps; Instantly+ZeroBounce→outbound v2 (post-G0 warm rail).
**REPAIR:** LexAudit /payment 404s; leadforge fake-deals disclaimer + digest; env-name mismatches (5); forge `/scan` doc→`/audit`; deal44 title entity; coguard-binder service verify.
**REMOVE:** 9 orphan DNS, caseaudit/dealdesk/funnel-mvp tombstones, stale public/robots.txt duplicates, leadforge hub.bizlegal-ai banner deadlink.
**BUILD (net-new only where O-023 needs it):** W1 leak-scan detector + sourced benchmark; W2 hosted-intake form; W3 follow-up cadence; W4 reporting + portal tab; W5 Gmail exporter + `five-numbers.mjs`.

---

## 28 — EXTERNAL SERVICES REGISTER (32.1–32.9 → condensed)

| Service | Key status (vault) | Used by | Live? |
|---|---|---|---|
| PayPal | ✅ 81-char id+secret, WEBHOOK_ID 18 | hub/docai/forge/lexaudit/bench/firmcited | 🟢 |
| NOWPayments | ✅ key 32 + IPN_SECRET 23 | docai/forge/lexaudit/tracr | 🟢 |
| Supabase | ✅ URL+service key 42 | all | 🟢 (MCP applied tracr) |
| Resend | ✅ 37 | all email | 🟢 |
| Anthropic | ✅ 109-char key | all LLM | 🔴 **credits $0** |
| OpenAI | 🔶 set | docai fallback | ⚪ |
| Cloudflare | ✅ token 53 | CF Pages/Workers | 🟢 |
| Vercel | ✅ token 61 | deploys | 🟢 |
| GitHub | ✅ token 41 | all CI | 🟢 (gho_ has scope) |
| IndexNow | ✅ key 32 (33 incl newline) | pinger | 🟢 (403 cache artifact) |
| Firecrawl | ✅ 36 | lexaudit monitor | 🟢 |
| Apify | ✅ 47 | forge scans | ⚪ |
| MUAPI | ✅ 65 | — | ⚪ |
| Stripe | ⚪ len~12 placeholder | deprecated stubs | 🔴 dead rail |
| LemonSqueezy | ⚪ placeholder | hub route only | 🔴 dead rail |
| Paddle | ✅ 70 | hub route | ⚪ unverified |
| **GSC** | 🔴 **empty placeholder** | seo pinger | 🔴 blocked |
| Instantly | 🔴 empty | outbound v2 | 🔴 dark |
| ZeroBounce | 🔴 empty | outbound v2 | 🔴 dark |
| BLOTATO | 🔴 missing | socials | 🔴 dark |
| Buffer | 🟡 name only | socials | ⚪ |
| Twilio | 🟡 name present | (SMS banned v0) | ⚪ |
| HubSpot | 🟡 name present | — | ⚪ |
| SendGrid | 🟡 name present | backup | ⚪ |
| Svix | 🟡 name present | firmcited email | ⚪ |
| **Wire bank arrays** | ⚪ Moses-only placeholders | hub wire rail | ⚪ |

**Orphaned service detection:** Telegram cluster renamed to ONE canonical `TELEGRAM_HUB_TOKEN` (⚪ empty in vault; live box `.env` carries values per seo-agents CLAUDE.md) — sync box→vault. NowPayments/Stripe/LemonSqueezy/Paddle duplicate-rail sprawl — consolidate to hub universal path.

---

## 29 — BIZLEGA DIGITAL FOOTPRINT (master)

**Domains (24 probed):** 12 live · 9 DNS-orphan · 3 infra (notes/deals/hub) NXDOMAIN.
**Repos:** bizlegal-monorepo (canonical) · bizlegal-ea (blog) · Firmcited (revenue OS host) · legacy checkouts (ignore).
**Accounts:** GitHub `aileadx10-boop` · Vercel `aileadx10-5415s-projects` · Cloudflare (acct `e1587fb5c35f7092167392448a283544`) · Hetzner ×2 · Supabase `ydghhcuuopqzgqcicubg` · PayPal · NOWPayments · Resend · Anthropic ($0).
**Payment ledger:** 264 rows, all self-tests. **Agents:** 8,220 runs. **Blog:** 226 posts, sitemap fresh.

---

## 30 — RULE COMPLIANCE

All 31 operating rules honored: no rebuild-before-understand (this map built on existing audits, nothing rebuilt); no unrequested deletion (REMOVE list = proposed only); no prod data mutation without authorization (tracr migration was explicitly authorized+already applied 09-10); no secrets exposed (names+presence only); no real financial transaction executed (all tests probe-only); test/staging used where applicable (FirmCited fc_flags fail-closed = staging gate).

---

*Sections 1–32.9 of the /goal prompt are mapped here: inventory(1) infra(2) domains(3) repos(4) apps(5) data(6) APIs(7) agents(8) automations(cron tables) money(9) journey(10) arch(current/target 11-14) gaps(15) matrix(16) ladder(17) E2E tests(18) failure points(19) security(20) observability(21) cost(22) debt(23) revenue matrix(24) exec map A–M(25) 30-day(26) build/fix/connect/delete(27) external register(28) footprint(29) rules(30) + evidence standard applied throughout.*
