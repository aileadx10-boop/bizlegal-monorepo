# BizLegal — Daily / Weekly Ops Runbook
**Last updated:** 2026-06-11
**Owner:** Moses (founder)

Every action the system needs to stay healthy and hit $30K MRR. A→Z, no gaps.

---

## DAILY (every business day, ~15 min)

### A — Health check (2 min)
```
https://bizlegal-ai.com/ops/health?t=$OPS_DASHBOARD_TOKEN
```
- All services green → proceed
- Any red → check Telegram #ops-alerts for Telegram alert sent last night

### B — Curator run review (3 min)
- Telegram: BIZLEGALFORGEBOT sends 3 picks after Mon/Wed/Fri scout run
- Review Supabase `daily_gaps` table: any `rejected_quality` rows need a /regen nudge
- Approve good drafts via bot: `/deploy <slug>`

### C — Lead triage (5 min)
- Check `ops_events` feed: `https://bizlegal-ai.com/ops/feed?t=$OPS_DASHBOARD_TOKEN`
- Any `lead.inbound` from Worker → follow up within 24h via cold-email-agent output
- Any `agent.checkout` that didn't → `payment.confirmed` within 30min → flag for investigation

### D — Payment orders check (2 min)
```sql
-- In Supabase SQL editor:
SELECT status, count(*) FROM payment_orders GROUP BY status;
```
- Any new `active` rows → fire thank-you-agent prompt manually (until chain/thank-you cron is live)
- Any `failed` rows from today → NOWPayments/PayPal dashboard to investigate

### E — Telegram bot inbox (3 min)
- @BizlegalHubBot: respond to any unhandled customer questions
- BIZLEGALFORGEBOT: approve any pending article picks

---

## MON / WED / FRI — Scout day additions (~5 min)

### F — Scout cron fires 06:00 UTC automatically
- No action needed unless Hetzner is down
- If scout hasn't fired by 08:00 UTC: `ssh hetzner; sudo systemctl status curator-scout-timer`

### G — Review Ollama output quality
- Check `daily_gaps` for any `rejected_scout` rows
- If >2 rejected in a row: check Ollama gemma4:12b is running (`ollama list` on Hetzner)

---

## TUESDAY — Content & social (~10 min)

### H — Social queue review
- Check `social_drafts` table for `status='approved'`
- `/api/cron/social-queue` fires automatically — verify `social.posted` events in ops feed
- If no posts in 7 days: run writer-agent manually (`agents/ops/writer-agent.md`)

### I — Reddit posting (15 min)
- Post Template R1 from `decisions/OUTREACH_KIT.md` to r/SaaS or r/startups
- Track post URL in `outreach_queue` table (manual until chain/pitch cron is live)

---

## THURSDAY — Outreach (~20 min)

### J — Cold email batch
- Run cold-email-agent prompt (`agents/ops/cold-email-agent.md`) for 5 prospects
- Source prospects from `outreach_queue` where `status='pending'`
- Log sends: update `outreach_queue.status='sent'`, set `t1_sent_at=now()`

### K — OCI partner check
- Check `oci_partners` table for any new inbound (OCI router logs in ops feed)
- If 0 partners after 2 weeks: run contact-agent for 3 law firms in target jurisdictions

---

## FRIDAY — Weekly review (~30 min)

### L — MRR review
```sql
SELECT product, count(*), sum(amount_cents)/100 as mrr_usd
FROM payment_orders
WHERE status='active' AND billing_interval='monthly'
GROUP BY product;
```
- Compare to prior Friday baseline
- If <5% WoW growth after week 4: pivot ICP or pricing

### M — Content flywheel audit
```sql
SELECT status, count(*) FROM daily_gaps
WHERE created_at > now() - interval '7 days'
GROUP BY status;
```
- Target: ≥3 `published` per week
- `rejected_quality` > `published`: check HUMANIZE_PROMPT and brain.py temperature

### N — SEO check (10 min)
- GSC: check impressions/clicks for top 5 gap pages
- Any page with CTR <1%: update meta description via brain.py regen

### O — Chain/pitch review
- Count T1/T2/T3 emails sent this week from `outreach_queue`
- Target: 25 outreach touchpoints/week
- Reply rate goal: 3-5% (flag if 0 replies after 50 sends — rewrite template)

### P — Friday retro (5 min)
- Run `agents/ops/friday-retro.md` prompt → paste output to `decisions/WEEKLY-RETRO-<date>.md`

---

## MONTHLY (first Monday of month, ~1h)

### Q — Lighthouse audit
```bash
# On Hetzner or local:
npx lighthouse https://docai.bizlegal-ai.com --output=json --quiet | jq '.categories.performance.score'
```
- Target: 95+ on all 4 main surfaces (docai, forge, brai, lexaudit)
- Below 90 on any → fix before applying for LemonSqueezy/Paddle

### R — LemonSqueezy / Paddle application check
Gate: Apply ONLY when ALL true:
- [ ] ≥5 published quality articles (all 6 gates green)
- [ ] Lighthouse ≥95 on docai + forge
- [ ] `/ops/health` all green for 7 consecutive days
- [ ] ≥1 real payment captured (status=active in payment_orders)

### S — OCI partner pipeline
- Target: 2 new attorney/broker partners per month
- Invoice template: `agents/ops/invoice-agent.md`
- Finder fee: 30% of first deal (auto-calculated by OCI router)

### T — Subscription renewal audit
- Check `payment_orders` where `next_charge_at < now() + interval '7 days'`
- Any failing renewals → investigate payment method before charge date

---

## SYSTEM-TRIGGERED ACTIONS

### U — On `payment.confirmed` (any source)
1. Verify `payment_orders.status = 'active'` in Supabase
2. Check Telegram ops-alerts fired (should be automatic via `/api/cron/ops-alerts`)
3. Manually trigger `thank-you-agent` until `chain/thank-you` cron is wired
4. For Conductor purchases: verify `conductor_profiles.tier` updated

### V — On `gap_page_rejected_quality`
1. Check `daily_gaps` row for gate errors
2. If banned phrase: update `brain.py` system prompt to explicitly prohibit
3. If thin content: adjust `MIN_WORDS` tunable in `quality_gate.py`
4. /regen via Telegram bot

### W — On Hetzner alert (systemd failure)
```bash
ssh hetzner
sudo systemctl status curator-bot curator-publisher curator-scout-timer
sudo journalctl -u curator-bot --since "1h ago" -n 50
```

### X — On PayPal 401 / payment auth failure
1. SSH into Vercel docai project env → confirm `PAYPAL_ENV=live`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` are all set and match live PayPal app credentials
2. If sandbox keys are set but `PAYPAL_ENV=live`: swap to live credentials in Vercel, redeploy
3. Check `processed_webhook_events` for duplicate claims on `paypal` gateway
4. If PayPal stays broken: ensure `PAYONEER_DOCAI_LINK` is set in Vercel docai env so the Payoneer backup link shows on the report page

---

## PHASE GATES (binary — don't advance until green)

| Gate | Condition | Check |
|------|-----------|-------|
| Week 1 | First active payment | `SELECT * FROM payment_orders WHERE status='active' LIMIT 1` |
| Month 1 | 7+ paying subs | MRR review query above |
| Month 2 | PayPal subscriptions live | PayPal Plan IDs configured + 1 active subscription order |
| Month 2 | LemonSqueezy applied | All 4 Lighthouse gates + 5 articles + /ops/health |
| Month 3 | 1 OCI close | `oci_leads` with status='closed' and finder_fee_paid=true |
| Month 6 | $30K MRR | Monthly MRR query ≥ 30000 |

---

## EMERGENCY RUNBOOK

### Payment broken (no new orders converting)
1. Check `/api/pay/start` — hit with curl: `curl -X POST https://bizlegal-ai.com/api/pay/start -d '{"product_id":"boi_solo_monthly","user_email":"test@test.com"}'`
2. Check Stripe dashboard for recent checkout sessions
3. Check `payment_orders` — is the row being created?
4. If row created but status stuck: check webhook delivery in Stripe dashboard

### Blog pipeline dead (no new published articles for 3+ days)
1. `ssh hetzner; sudo systemctl status curator-bot curator-scout-timer`
2. Check Telegram: any bot messages in last 72h?
3. `sudo journalctl -u curator-bot -n 100`
4. Common fix: `git pull && sudo systemctl restart curator-bot curator-publisher`

### HMAC chain broken (ops events not flowing)
1. Check `/ops/health` — which services show red?
2. Compare `BIZLEGAL_INBOUND_SECRET` on failing service vs vault
3. Fix script: `scripts/fix-hetzner-inbound-secret.sh`

### A subdomain returns HTTP 500 on every smoke check (failed Vercel build)
Symptom: `ops_events` shows repeated `error` rows with `smoke_check: digest, status: 500` for one surface.
1. Vercel → that project → Deployments. If latest production deploy state = **ERROR**, the build failed — every request hits the failed build.
2. Read the build log. The classic monorepo cause: `[ERR_PNPM_NO_PKG_MANIFEST] No package.json found in /` — the install command's `cd ../..` overshot to `/` because **Root Directory is unset**.
3. Fix: Vercel → project → Settings → Build & Deployment → **Root Directory = `apps/<surface>`** (e.g. `apps/leadforge`). This makes the `cd ../..` in `vercel.json` land on the monorepo root. Save → Redeploy.
4. Verify: `curl -s -o /dev/null -w "%{http_code}" https://<surface>.bizlegal-ai.com/api/digest` → 200.

> Known instance (2026-06-11): **leadforge** had Root Directory unset since the Z1 migration; its only prod deploy was state=ERROR, returning 500 since 2026-05-25. Every other app already has Root Directory set.

---

## GROWTH + MONOPOLY DEPLOY (2026-08-12)

### What shipped
- **FirmCited** (cited.bizlegal-ai.com, deployed via Vercel CLI from `C:/Users/Moshe Dor/Firmcited`):
  - Measurable Outcome block in every audit (bucket/KPI/baseline/target, expectation-not-guarantee)
  - Case-study generator (consent-gated, anonymized, baseline-only — no firm-name leak)
  - Customer-loop metrics in daily digest (time-to-first-result, re-engagement rate, cancel buckets)
  - $200 AI Enablement Session rung + cost-floor note on /pricing; "what's free / what's next" on /free-check
  - Migration 0010: `fc_audits.outcome` + `metadata jsonb` on subscriptions/orders
- **Hub** (bizlegal-ai.com/mica-readiness): MiCA readiness assessment tool (Plan 1 W1-1)

### DEPLOY-PATH DISCOVERY (read before deploying hub again)
**The hub production deploys from `bizlegal-monorepo` → `apps/hub` → `main` branch → Vercel project `bizlegal-ai` (root `apps/hub`).**
The `BIZLEGAL PROJECTS/bizlegal-ai` repo (dev source, `quantum-wat`) is NOT the deploy source — pushing it triggers a broken deploy ("Root Directory apps/hub does not exist"). To ship hub changes: port files into `bizlegal-monorepo/apps/hub`, commit on `main`, push. All product Vercel projects (bizlegal-ai, lexaudit, brai, trcr, docai-frontend, forge, leadforge-ai) are linked to bizlegal-monorepo with `apps/*` roots. FirmCited is the exception — no git link, deploy via CLI.

### Remaining Plan 1 (not built)
- W1-2: Sanctions & Wallet-Screening Lite
- W1-3: MiCA Transition/Deadline Tracker agent
