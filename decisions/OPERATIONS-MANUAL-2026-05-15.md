# BizLegal AI — Operations Manual

**Audience:** Moses (founder)
**Purpose:** One doc you read every morning to know what to check, what to fix, and where to look when something breaks. Distilled from 6 weeks of fleet-build sessions.

---

## The 30-second daily morning routine

1. Open https://bizlegal-ai.com/ops?token=$OPS_DASHBOARD_TOKEN
2. Eyeball:
   - **Revenue card** — `payment.confirmed` events in last 24h
   - **Total events 24h** — should be > 50 once funnels are running
   - **Active subs** — once LemonSqueezy/Paddle is live
   - **Scout / Articles cards** (curator visibility from W3.1) — should each be > 0 daily
3. Scan Telegram for the curator bot — if 3 picks waiting > 4h, click one (auto-pick fires at 10:00 UTC anyway as fallback)
4. If anything is yellow/red on /ops, open the **Triage section** below.

That's the morning. Anything else is exception handling.

---

## Weekly cadence

| Day | Routine | Where |
|---|---|---|
| **Mon AM** | Z7 fleet verify | Run `~/.claude/skills/bizlegal-verify-z7` skill OR `curl` each of the 7 surfaces |
| **Mon/Wed/Fri** | 5 cold-email outreach + 1 LinkedIn post | Templates in `decisions/manual-outreach-template-2026-05-11.md` |
| **Wed** | Partner coverage check | `python services/oci/router/partners_coverage_check.py --strict` |
| **Fri 10:00 UTC** | Payout reconciler auto-fires | Read the Telegram digest, approve pending payouts |
| **Fri PM** | Submit any new gap-pages to GSC for priority indexing | GSC → URL Inspection → Request Indexing |
| **Sun PM** | 15-min retrospective | Did the week's revenue routines fire? What broke? |

---

## Where everything lives

### Subdomains + what each ships
| Subdomain | Product | Revenue path |
|---|---|---|
| `bizlegal-ai.com` (apex) | Brand + content hub + contact form | Hub Pro $149/mo, Hub Scale $499/mo, /risk-engine free funnel |
| `forge.bizlegal-ai.com` | BOI/CTA filing, web compliance scanner, Regulatory Passport | BOI $149 (one-time), Passport $1500, Scan $97-360 |
| `brai.bizlegal-ai.com` | Counterparty risk + sanctions screening | Standard $149, Priority $249, Extended $500 |
| `tracr.bizlegal-ai.com` | Wallet/transaction tracing | Regulatory $29, Bronze $149, Silver $299 |
| `lexaudit.bizlegal-ai.com` | Compliance health score | Solo $49, Boutique $199, Mid-Market $599 |
| `docai.bizlegal-ai.com` | Contracts + SQA + DPA agents | Starter $29, Team $69, Firm $99 |
| `leadforge.bizlegal-ai.com` | Legal lead intelligence | (no pricing page yet — Week 6+) |
| `blog.bizlegal-ai.com` | 342-post SEO content engine | Drives traffic to all of the above |

### Three core services (not subdomains)
| Service | Where | What it does |
|---|---|---|
| **Hetzner curator** | dedicated server, SSH from your Windows | scout → brain → publisher pipeline that generates blog content daily. Systemd timers + Cloudflare tunnel to local Ollama. |
| **OCI deal router** | `router.bizlegal-ai.com` (Oracle Cloud) | FastAPI service that receives `/lead` inbound, classifies via Anthropic, routes to partners, fires contract emails, weekly payout reconciler. |
| **Cloudflare Worker** | `bizlegal-lead-intake.*.workers.dev` | Lead-nurture cron firing every 5 minutes; sends the 4-email sequence to leads. |

---

## When something breaks — triage runbook

### "Production page returns 500"
1. `curl -I https://<surface>/` — confirm the failure
2. Vercel dashboard → project → Deployments → most recent → check status
3. If recent deploy ERROR → click "View build logs" → search for "Error" or "Failed to compile"
4. If old deploy was READY → check Supabase status, OCI router health, runtime env drift

### "No /ops events firing"
1. Check `OPS_DASHBOARD_TOKEN` is still valid in Vercel hub env
2. Check `/api/ops/log` returns 401 on a curl POST (right error) vs 500 (broken endpoint)
3. SSH into Hetzner: `journalctl -u curator-scout.service -n 50` — is scout firing?
4. `curl https://router.bizlegal-ai.com/health` — is OCI alive?

### "Payment webhook seemed to fire but no /ops event"
1. Vercel → payment route deploy logs → search for the gateway name
2. Supabase → `processed_webhook_events` table → look for the event_id (deduped?)
3. Supabase → `payment_orders` table → check current `status` on the order
4. If everything looks fine but no `payment.confirmed` event in /ops: check `claimWebhookEvent` returned `'duplicate'` (means duplicate replay) OR `markNurturePaid` swallowed the email-send

### "Blog stopped publishing"
1. `gh run list --workflow=seo-cron.yml -L 5` in `bizlegal-ea` repo — recent runs?
2. If failures: `gh run view <run-id> --log-failed` — what's the actual error
3. Common: API key expired (`ANTHROPIC_API_KEY_ENRICH` rotated in Anthropic console)
4. Common: topic queue empty in `projects/bizlegal-seo-site/topics/queue.json`
5. If runs are green but blog isn't growing: check `deploy-blog.yml` workflow — Cloudflare deploy step working?

### "Hetzner curator timer not firing"
1. SSH into Hetzner: `systemctl is-active curator-scout.timer curator-auto-pick.timer payout-reconciler.timer`
2. If inactive: `sudo systemctl enable --now curator-scout.timer`
3. If timer fired but service errored: `journalctl -u curator-scout.service -n 100`

### "Lead came in via /contact but no partner email fired"
1. Check `/ops` for `referral.received` event (OCI received it)
2. If no event → contact form's HMAC dual-post failed; check `BIZLEGAL_INBOUND_SECRET` matches between hub Vercel + OCI router
3. If `referral.received` fired but no `referral.routed` → partner classification matched but no eligible partner → run `partners_coverage_check.py`
4. If `referral.routed` fired but `partner_id == 'placeholder'` → only the placeholder is configured for that classification → onboard real partners

### "Daybreak theme not applying / dark bar appearing"
1. Daybreak is hub-only. Subdomains use their own theme (see `apps/<subdomain>/app/layout.tsx` — primary=...)
2. Check FOUC script in `<head>` — `data-bl-theme-v2` attribute should be set before paint
3. If you see a dark bar at top of any docai/hub page: report it (the `<AppRouteOnly>` legacy bar was removed; should not return)

---

## Payment activation (the immediate next phase)

**One-time setup** (you do this when you return; ~2.5h total):

### Step 1 — Apply the webhook idempotency migration (5 min)
```sql
-- File: apps/hub/supabase/migrations/20260511_processed_webhook_events.sql
-- Apply on BOTH Supabase DBs:
--   ydghhcuuopqzgqcicubg (canonical)
--   rgbwlaifhfvlxgamwcnz (mirror)
```
Run via Supabase dashboard → SQL editor → paste the migration → Run.

### Step 2 — LemonSqueezy (30 min)
1. Log into lemonsqueezy.com, create BizLegal AI store (DOR INNOVATIONS LLC + Tax ID)
2. Copy 3 secrets from the dashboard
3. Vercel hub project → Settings → Environment Variables:
   - `LEMONSQUEEZY_API_KEY`
   - `LEMONSQUEEZY_STORE_ID`
   - `LEMONSQUEEZY_WEBHOOK_SECRET`
4. Redeploy hub
5. Create 1 test product ($1 "Test SKU") in LS dashboard
6. Place $1 self-purchase → confirm `subscriptions` row appears + `/ops` shows `payment.confirmed`

### Step 3 — PayPal LIVE (45 min)
1. In PayPal Developer Dashboard → Apps → flip your app from Sandbox to Live
2. Create 6 subscription plans (Hub Pro mo/yr, Hub Scale mo/yr, BRAI Priority mo, DocAI Team mo)
3. Vercel env:
   - `PAYPAL_API_URL=https://api-m.paypal.com`
   - `PAYPAL_ENV=production`
   - `PAYPAL_WEBHOOK_ID=<from webhook listings page>`
   - `PAYPAL_PLAN_ID_HUB_PRO_MONTHLY=<plan id>` … (6 total)
4. Configure webhook in PayPal Dashboard → URL: `https://bizlegal-ai.com/api/payments/paypal/webhook` → select events: BILLING.SUBSCRIPTION.* + PAYMENT.CAPTURE.* + CHECKOUT.ORDER.APPROVED
5. Redeploy + self-purchase one tier

### Step 4 — Paddle (30 min)
1. Paddle Dashboard → Catalog → Prices → create 4 prices (one per tier × interval combo)
2. Paddle Dashboard → Developer Tools → Notifications → create notification → URL `https://bizlegal-ai.com/api/payments/paddle/webhook` → copy the Secret key
3. Vercel env:
   - `PADDLE_WEBHOOK_SECRET=<secret key>`
   - `PADDLE_ENV=live`
   - `PADDLE_PRICE_HUB_PRO_MONTHLY=pri_...` (4 total)
4. Redeploy hub
5. Self-purchase → verify `/ops` shows `payment.confirmed` (gateway=paddle)

### Step 5 — Wire the "Pay with Paddle" button on /pricing (15 min)
Add a button on `apps/hub/app/pricing/page.tsx` (or wherever your pricing UI is) that POSTs to `/api/payments/paddle/start` with `{product, tier, interval, amount_cents, email}`. The response includes `checkout_url` — redirect via `window.location.href = response.checkout_url`.

### Step 6 — Rate-limit `/api/contact` + payment `/start` (15 min)
The `@bizlegal/rate-limit` package already exists. Wire it into:
- `apps/hub/app/api/contact/route.ts` — already has it? Check the W4.1 commit; if not, add `rateLimit('hub-contact', clientIpFromHeaders(req.headers), { windowMs: 60_000, limit: 5 })`
- `apps/hub/app/api/payments/paypal/start/route.ts`
- `apps/hub/app/api/payments/nowpayments/start/route.ts`
- `apps/hub/app/api/payments/paddle/start/route.ts`

---

## Funnel acquisition (parallel to payments)

### Track A — Manual outreach (your time, no code)
- **Mon/Wed/Fri**: 5 cold emails (rotate variants from `decisions/manual-outreach-template-2026-05-11.md`)
- **Daily**: 1 LinkedIn post or comment on regulatory news
- **Target**: 3 inbound leads/week via UTM-tagged contact form

### Track B — Reddit scraper (shadow mode)
When you set `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` in Hetzner env, I'll build the scraper. **Hard gate**: no auto-DMs until 100-comment classifier eval scores ≥80% precision.

### Partner roster (gate to OCI revenue)
- Currently: 0 real partners, 1 placeholder catching everything
- Action: send outreach to fintech compliance lawyers in UAE, SG, US/EU jurisdictions
- For each acceptance: run `~/.claude/skills/bizlegal-seed-partner` to onboard them

---

## Index growth + Google rank tracking

You don't have a custom rank-tracking tool, so:

### Daily (5 min)
- GSC → Performance → switch to "Last 7 days" → glance at average position trend

### Weekly (15 min)
- GSC → Pages → Indexing report → check "Indexed" count climbing (target: +5/week)
- GSC → Sitemaps → resubmit any sitemap showing < 100% indexed

### Monthly
- Open Ahrefs Free Site Explorer → paste `bizlegal-ai.com` → screenshot the top 10 organic keywords + their positions
- Compare to last month's screenshot

### What moves rank up (in priority order)
1. **More content** at sustained pace (the curator pipeline is delivering — 5 clean runs in last 5 days)
2. **Better content** — Practitioner-reviewed posts beat AI-generated structurally similar ones
3. **Backlinks** — guest posts on industry blogs, regulator comment threads
4. **Internal linking** — every blog post should link to ≥3 other blog posts + 1 product page
5. **Technical health** — all sitemaps clean (already done this week), Core Web Vitals (Hub passes; forge passes)

---

## OBD workflow check failure (the "Operating Book Discipline" failure)

**Not blocking deployments.** The OBD workflow is a discipline audit that runs on every PR and push, but PRs merge regardless. The 47 missing-name failure is pre-existing tech debt — every recent PR has hit it.

**To clear**: append the 47 names listed in this session's chat to the `CANONICAL_VAULT_NAMES` GitHub repository secret. GitHub → Settings → Secrets and variables → Actions → CANONICAL_VAULT_NAMES → Edit → append → Save.

After clearing once, every future PR that doesn't introduce a NEW env var will pass OBD.

---

## Quick links

- **Live dashboard**: https://bizlegal-ai.com/ops?token=$OPS_DASHBOARD_TOKEN
- **Search Console**: https://search.google.com/search-console
- **Vercel**: https://vercel.com/aileadx10-5415s-projects
- **Supabase canonical**: https://supabase.com/dashboard/project/ydghhcuuopqzgqcicubg
- **Supabase mirror**: https://supabase.com/dashboard/project/rgbwlaifhfvlxgamwcnz
- **Cloudflare**: https://dash.cloudflare.com
- **PayPal Developer**: https://developer.paypal.com
- **NOWPayments Merchant**: https://account.nowpayments.io
- **LemonSqueezy** (once activated): https://app.lemonsqueezy.com
- **Paddle** (once activated): https://vendors.paddle.com
- **GitHub**: https://github.com/aileadx10-boop/bizlegal-monorepo
- **bizlegal-ea (blog)**: https://github.com/aileadx10-boop/bizlegal-ea

---

## Critical docs to re-read when in doubt

| Need | Doc |
|---|---|
| What's the strategy this week? | `~/.claude/plans/concurrent-bouncing-kitten.md` |
| What did Claude ship on $DATE? | `decisions/.planning/SESSION-CLOSEOUT-*.md` |
| Why is X coded this way? | `decisions/.planning/CODE-REVIEW-*.md` |
| Is partner outreach gap closing? | `decisions/.planning/PARTNER-GAP-W5-2026-05-11.md` |
| Brand contract on dark surfaces? | `decisions/.planning/A11Y-AUDIT-W5-2026-05-15.md` |
| GSC index recovery progress? | `decisions/.planning/GSC-INDEX-REMEDIATION-2026-05-11.md` |

---

_Generated 2026-05-15. Update once a month or after any major architecture shift._
