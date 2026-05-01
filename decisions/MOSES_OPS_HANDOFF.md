# MOSES_OPS_HANDOFF — End-of-session checklist

**Date:** 2026-04-30
**Sessions covered:** Phase O+P+Q+R+S+T+U (11 PRs) + Phase V0+V1+V2+Y (12 PRs) = **23 PRs across 8 repos.**
**Status:** all auto-side dev DONE. Wave 1 ships the moment Moses completes Block A.

> **Canonical env vault:** every value referenced below lives in `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt`. Read from there, paste to Vercel/Hetzner/OCI/Worker. Never commit values to git. See `PARAMETERS_RUNBOOK.md` Section 0.

---

## Block A — Ops to do (in this order, ~5 hours total)

These are the dashboard / signup / config tasks that unlock everything already in the repo. Do them top-down; later items depend on earlier ones.

### A1. Generate or recover the shared HMAC secret (1 min)

**First check** if `BIZLEGAL_INBOUND_SECRET` already exists in your canonical vault:

```bash
grep -c "^BIZLEGAL_INBOUND_SECRET=" "C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt"
# Returns 1 if already set → use that value (open the file in your local editor and copy the value).
# Returns 0 if missing → generate fresh:
openssl rand -hex 32
# Then APPEND the line BIZLEGAL_INBOUND_SECRET=<hex> to env-hub-bizlegal-ai.txt
```

**Rule:** the canonical vault is `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt`. Add the secret there FIRST so future sessions can read it. Then paste the same hex into 7 Vercel projects + Hetzner + OCI in the next steps.

### A2. Set hub Vercel env (3 min)

Vercel → bizlegal-ai → Settings → Environment Variables → Production + Preview:

- `BIZLEGAL_INBOUND_SECRET` = (the hex from A1)
- `OPS_DASHBOARD_TOKEN` = (already set; if not, generate another `openssl rand -hex 32`)

Trigger a redeploy of bizlegal-ai so the new env propagates.

### A3. Set the SAME secret on 6 subdomain Vercel projects + 1 Worker (15 min)

Same hex from A1, on each:

| Project | Env name |
|---------|----------|
| tracr | `BIZLEGAL_INBOUND_SECRET` + `OPS_DASHBOARD_TOKEN` |
| brai | `BIZLEGAL_INBOUND_SECRET` + `OPS_DASHBOARD_TOKEN` |
| lexaudit | `BIZLEGAL_INBOUND_SECRET` + `OPS_DASHBOARD_TOKEN` |
| docai | `BIZLEGAL_INBOUND_SECRET` + `OPS_DASHBOARD_TOKEN` |
| leadforge | `BIZLEGAL_INBOUND_SECRET` + `OPS_DASHBOARD_TOKEN` |
| forge | `BIZLEGAL_INBOUND_SECRET` + `OPS_DASHBOARD_TOKEN` |
| **Cloudflare Worker** `bizlegal-lead-intake` | `WEBHOOK_SHARED_SECRET` (same hex) — `wrangler secret put WEBHOOK_SHARED_SECRET` |

Each subdomain redeploys automatically on env change.

### A4. Set Hetzner curator + OCI router secrets (5 min)

```bash
ssh hetzner
sudo nano /opt/bizlegal/curator/.env
# Add:
BIZLEGAL_INBOUND_SECRET=<same hex>
VERCEL_DEPLOY_HOOK_HUB=<paste from Vercel bizlegal-ai → Settings → Git → Deploy Hooks>
VERCEL_DEPLOY_HOOK_FORGE=<paste from Vercel forge → Settings → Git → Deploy Hooks>
FIRECRAWL_API_KEY=<NEW key — rotate the leaked fc-a46c... first at firecrawl.dev/account>
sudo systemctl restart curator-bot curator-publisher
```

```bash
# OCI router:
ssh oci
sudo nano /opt/oci-deal-router/.env
# Add:
BIZLEGAL_INBOUND_SECRET=<same hex>
sudo systemctl restart deal-router payout-reconciler
```

### A5. Apply Supabase migrations (5 min)

Supabase dashboard → SQL Editor on the **hub** project. Run each file in order:

1. `bizlegal-ai/supabase/migrations/20260430_boi_subscriptions_trial.sql` (R3 — already shipped, may already be applied)
2. `bizlegal-ai/supabase/migrations/20260501_ai_act.sql` (V1 — 3 tables: ai_act_classifications, ai_act_subs, ai_act_framework_index)
3. `bizlegal-ai/supabase/migrations/20260501_policy_refresh.sql` (V2 — 2 tables: policy_refresh_audits, policy_refresh_subs)
4. `executive assistant/projects/hetzner-curator/supabase/migration-daily-gaps-firecrawl.sql` (Q1 — adds `firecrawl jsonb` column)
5. `executive assistant/projects/hetzner-curator/supabase/migration-daily-gaps-forge-url.sql` (R4 — adds `forge_url text` column)
6. `lexaudit/supabase/migrations/20260430_compliance_extracted_content.sql` (Q2 — adds `extracted_content text` column)

All migrations are idempotent — safe to re-run if unsure.

### A6. Add Vercel domain aliases for 5 down subdomains (10 min)

For each: Vercel project → Settings → Domains → Add Domain.

| Project | Domain |
|---------|--------|
| tracr | `tracr.bizlegal-ai.com` |
| brai | `brai.bizlegal-ai.com` |
| lexaudit | `lexaudit.bizlegal-ai.com` |
| docai | `docai.bizlegal-ai.com` |
| forge | `forge.bizlegal-ai.com` |

leadforge already returns 200; skip if already done.

### A7. BRAI re-init (10 min, if needed)

Only if BRAI has no `.vercel/project.json` (i.e., first vs prior plan check):

```bash
cd "C:/Users/Moshe Dor/BRAI/frontend-next"
vercel link
# Pick the right team + project
vercel deploy --prod
# Then in Vercel UI: add brai.bizlegal-ai.com domain alias
```

### A8. Create payment products (~45 min)

You need 6 NOWPayments + 6 PayPal product URLs (12 total). Build them at NOWPayments dashboard + PayPal subscriptions, then paste each URL into Vercel `bizlegal-ai` env.

#### V1 AI-Act (4 URLs)
- `NEXT_PUBLIC_NOWPAYMENTS_AI_ACT_ONETIME_URL` — $99 one-time
- `NEXT_PUBLIC_NOWPAYMENTS_AI_ACT_MONTHLY_URL` — $49/mo
- `NEXT_PUBLIC_PAYPAL_AI_ACT_ONETIME_URL` — $99 one-time
- `NEXT_PUBLIC_PAYPAL_AI_ACT_MONTHLY_URL` — $49/mo

#### V2 Privacy Refresh (2 URLs)
- `NEXT_PUBLIC_NOWPAYMENTS_POLICY_REFRESH_URL` — $29/mo
- `NEXT_PUBLIC_PAYPAL_POLICY_REFRESH_URL` — $29/mo

#### BOI Tracker (already live; verify URLs match the 4 SKUs from prior plan)
- `NEXT_PUBLIC_NOWPAYMENTS_BOI_SOLO_MONTHLY_URL` ($29)
- `NEXT_PUBLIC_NOWPAYMENTS_BOI_SOLO_YEARLY_URL` ($290)
- `NEXT_PUBLIC_NOWPAYMENTS_BOI_FIRM_MONTHLY_URL` ($99)
- `NEXT_PUBLIC_NOWPAYMENTS_BOI_FIRM_YEARLY_URL` ($990)
- (and 4 PayPal equivalents)

After paste: redeploy `bizlegal-ai` so the URLs flow into PricingTierCard.

### A9. PayPal API credentials (15 min)

If not already set on hub + 6 subdomains (from prior Phase P):

- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_API_URL` (defaults to `https://api-m.paypal.com`)

### A10. Cloudflare blog deploy hook (3 min, only if blog → hub propagation still lags)

CF Pages → blog project → Settings → Deploy hooks → Create deploy hook. Save URL as GitHub secret `CF_PAGES_DEPLOY_HOOK` in `aileadx10-boop/bizlegal-ea`.

### A11. GSC sitemap submission (5 min)

Google Search Console → bizlegal-ai.com property → Sitemaps → Add:
- `https://bizlegal-ai.com/sitemap.xml`
- `https://blog.bizlegal-ai.com/sitemap.xml`

---

## Block B — Verification (run after A1-A11)

### B1. HMAC chain green

```bash
curl -s "https://bizlegal-ai.com/api/ops/health?t=$OPS_DASHBOARD_TOKEN" | jq '.summary'
```

Expect: `chain_healthy: true`, `subdomains_reachable: 8`, `subdomain_envs_reachable: 6`, `critical_missing: []`.

### B2. /ops/health Fleet env matrix renders

Open `https://bizlegal-ai.com/ops/health?t=$OPS_DASHBOARD_TOKEN` in browser. Expect 6 subdomain cards each showing green/red per env. After A3 lands, all `BIZLEGAL_INBOUND_SECRET` rows go green.

### B3. /ops Referrals pipeline shows non-zero

Submit a test on `https://bizlegal-ai.com/realestate` then refresh `/ops?t=$OPS_DASHBOARD_TOKEN`. Expect `referral.received` + `routing.attempted` events in the live tape and the Referrals card incrementing.

### B4. AI-Act free classifier works

```bash
curl -s -X POST https://bizlegal-ai.com/api/ai-act/classify \
  -H 'content-type: application/json' \
  -d '{"email":"smoke@test.example","system_description":"AI-powered SOC 2 questionnaire drafter that ingests prior customer responses and suggests answers. Sales engineers review every output before sending. No biometric data, no automated customer-facing decisions.","uses_biometrics":false,"makes_critical_decisions":false,"used_in_education_or_employment":false,"used_in_law_enforcement_or_justice":false,"is_general_purpose_ai":false,"eu_market_access":true}' \
  | jq '{tier: .risk_tier, articles: .articles_cited}'
```

Expect a tier in `{minimal, limited, high, unacceptable}` plus 2-5 valid Article cites.

### B5. Policy Refresh free audit works

```bash
curl -s -X POST https://bizlegal-ai.com/api/policy-refresh/audit \
  -H 'content-type: application/json' \
  -d '{"email":"smoke@test.example","policy_url":"https://stripe.com/privacy"}' \
  | jq '{frameworks: .frameworks_touched, count: (.findings | length)}'
```

Expect `frameworks` array with 5+ items and `count` between 5-15.

### B6. Curator heartbeats arrive

After A4 + restart: within 10 min, expect `heartbeat` events tagged `service: bot` and `service: publisher` on /ops feed.

### B7. Telegram alerts work

Force a $200+ test payment OR a `referral.closed` event. Expect a Telegram message in @Bizlegalbot within 15 min (the `ops-alerts` cron interval).

---

## Block C — Where development continues

Wave 2 of Phase V is gated on 14 days of traffic data. Until then, the auto side is in **read-only learning mode** — no new agents ship.

### C1. The V-gate (14 days from V1+V2 deploy)

Read these counters from `/api/ops/feed?token=$OPS_DASHBOARD_TOKEN`:

```bash
curl -s "https://bizlegal-ai.com/api/ops/feed?token=$OPS_DASHBOARD_TOKEN" \
  | jq '.summary_by_type[] | select(.label == "aiact.classified" or .label == "policy.refreshed")'
```

Decision rule baked into `decisions/concurrent-bouncing-kitten.md` plan file:

| Threshold (14d) | Action |
|-----------------|--------|
| `aiact.classified` ≥ 30 | Ship V3 (Lawyer AI Hallucination Audit) |
| `policy.refreshed` ≥ 50 | Ship V4 (Stripe Connect Marketplace Compliance) |
| Both met | V3 + V4 in parallel |
| Neither met | V5 doc-only (MiCA Token-Launch Auditor PRD) + 30-day re-evaluate |

### C2. V3-V7 ready specs (waiting on V-gate)

Already specified in `decisions/AGENTS_BRAINSTORM_V2.md` with Volume/Pay/Margin/Defense scoring:

- **V3 Lawyer AI Hallucination Audit** (~12-14h) — needs Westlaw + PACER API agreement
- **V4 Stripe Connect Marketplace Compliance** (~10-12h) — reuses BRAI Sanctions Pro
- **V5 MiCA Token-Launch Auditor** (doc-first, ~4h) — service-y, ship product gated on first OCI inbound
- **V6 OFAC SDN Wallet Sweeper** (~8h) — needs BRAI customer pipeline
- **V7 DAO Wrapper Picker** — parked to Q4

### C3. Outreach cadence (Moses-driven, ongoing)

Plan in `decisions/OUTREACH_KIT.md`:
- Week 1: 12-18 manual posts across 7 channels using R1-R5 templates
- Week 2-3: cadence delta with R6 (AI-Act) + R7 (Policy Refresh) + L4 carousel + X3 thread
- After each post: check /ops at +30min, +2h, +24h to record what converted

OCI cold-outbound (asymmetric pillar): 5-10 real-estate partner DMs/week per OUTREACH_KIT R5 template.

### C4. Phase U monorepo (Wave 3, post-revenue)

`decisions/concurrent-bouncing-kitten.md` Phase U block. Triggers when:
- First paying customer landed (V1, V2, or any prior agent)
- Phase P fully done (Block A here = green chain)

Auto runs ~3-5 days to consolidate all 7 repos into `bizlegal-ai/` monorepo with pnpm + Turborepo. Moses ops side: ~30 min Vercel "Root Directory" rewiring per project.

### C5. The MRR path

`decisions/MRR_30K_PATH.md` defines:
- Day 1-7: 1-3 paying customers, /ops shows first `payment.confirmed`
- Day 8-30: ~$1K MRR, 30+ blog posts indexed
- Day 31-60: ~$5K MRR, LemonSqueezy / Paddle approval
- Day 61-90: ~$15K MRR, 1-2 LexAudit Mid-Market firms
- Day 91-120: $30K MRR target

Re-plan triggers documented in the doc — fire if the funnel underperforms 2x.

---

## Block D — Files Moses can ignore

These got built but require no Moses ops:

- All 23 PRs are merged. No follow-up PR action needed.
- Vercel cron entries in `vercel.json` auto-fire on next deploy: charge-due (07:00), boi-check (14:00), ops-alerts (every 15min), smoke (09:00), ai-act-monitor (11:00), policy-refresh (12:00).
- All ops_events tables exist; the dashboard reads them.
- /api/ops/health on each subdomain returns 404 until A3 lands; that's expected and the hub aggregator handles the gap gracefully.

---

## TL;DR for Moses

1. **Generate** `BIZLEGAL_INBOUND_SECRET` (1 min, A1)
2. **Paste** that secret + `OPS_DASHBOARD_TOKEN` on hub + 6 subdomains + Worker + Hetzner + OCI (~25 min, A2-A4)
3. **Apply** 6 Supabase migrations (~5 min, A5)
4. **Add** 5 Vercel domain aliases (~10 min, A6)
5. **Re-init** BRAI if needed (~10 min, A7)
6. **Create** 12 payment product URLs (~45 min, A8)
7. **Verify** by running B1-B7 (~15 min)

**Total: ~2 hours** of dashboard work to flip every chain link green and unlock V1+V2 revenue collection.

After that: do nothing for 14 days, just check `/ops?t=$OPS_DASHBOARD_TOKEN` daily and post per OUTREACH_KIT cadence. The V-gate decision (C1) determines what dev ships next.
