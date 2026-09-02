# MOSES HANDOFF — Revenue Marathon Finish Line

**For:** Moses (owner). **From:** the revenue-marathon branch `feat/revenue-marathon` (commits `851a581` → `1c0306e`, 2026-09-01/02).
**What this is:** every step only you can do — dashboards, deploys, env vars, real-money tests, and decisions. Work top to bottom. Each step is independent enough that you can stop and resume.
**Time estimate:** 2–4 hours of clicking, plus DNS propagation.

**Golden rules:**
- Never paste a secret value into this file, git, or chat. Names only here; values come from your vault file (`Downloads/env-hub-bizlegal-ai.txt`) or the dashboards.
- If a step fails, stop and tell the agent the step number and the exact error text.
- "Vercel" below = vercel.com dashboard. "PayPal" below = developer.paypal.com → your app → Live (not Sandbox).

---

## Step 1 — Supabase: run the two new migrations

Two new apps (FalseEcho, SellerRadar) need their database tables. This is one copy-paste each.

- [ ] Go to supabase.com → your BizLegal project → **SQL Editor** → **New query**.
- [ ] Open `supabase/migrations/20260901_falseecho_mvp.sql` in the repo, copy the **entire file**, paste into the SQL editor, click **Run**. Expect: "Success. No rows returned."
- [ ] Repeat with `supabase/migrations/20260902_sellerradar_mvp.sql`.
- [ ] Verify: in **Table Editor** you should now see `falseecho_scans`, `falseecho_evidence`, `falseecho_monitors`, and `fee_schedules` plus the sellerradar tables.
- [ ] If you get "relation already exists" that's fine — the migration is written to be safely re-run (`create table if not exists`).

---

## Step 2 — Vercel: create the two new projects, set env vars, deploy, DNS

### 2a. Create projects

Do this twice — once per app.

- [ ] Vercel → **Add New… → Project** → import the `bizlegal-monorepo` repo.
- [ ] Set **Root Directory** to `apps/falseecho` (then `apps/sellerradar`). The repo ships a `vercel.json` in each app with the correct build command — leave Framework = Next.js and don't override build settings.
- [ ] Name the projects `falseecho` and `sellerradar`.
- [ ] **Do not deploy yet** — add env vars first (next section), then deploy.

### 2b. Env vars — FalseEcho (names only; values from your vault / dashboards)

Supabase (from Supabase → Project Settings → API):
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

Detection engines (a missing one degrades that engine to "unavailable" — the site still works):
- [ ] `OPENAI_API_KEY`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `PERPLEXITY_API_KEY`
- [ ] `SERPAPI_API_KEY`

Email (Resend dashboard):
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM`

Payments:
- [ ] `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` (Live app credentials)
- [ ] `PAYPAL_ENV` = `live`
- [ ] `NOWPAYMENTS_API_KEY` / `NOWPAYMENTS_IPN_SECRET` (see Step 4)
- [ ] `PAYPAL_PLAN_ID_FALSEECHO_MONITOR_MONTHLY` — **comes from Step 3** (you create this plan first)

Fleet ops (values shared with the other apps — copy from the hub Vercel project):
- [ ] `OPS_LOG_URL` = `https://bizlegal-ai.com/api/ops/log`
- [ ] `BIZLEGAL_INBOUND_SECRET`
- [ ] `OPS_DASHBOARD_TOKEN`

Site:
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://falseecho.bizlegal-ai.com`
- [ ] `NEXT_PUBLIC_DISCLAIMER_VERSION` = `v1.0.0-p1`
- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` (Cloudflare Turnstile — optional but recommended)
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (optional analytics)
- [ ] `NEXT_PUBLIC_GSC_VERIFICATION` (optional, Google Search Console)

### 2c. Env vars — SellerRadar

Same as FalseEcho **except**: no engine keys (`OPENAI/ANTHROPIC/PERPLEXITY/SERPAPI` not needed); add `CRON_SECRET` (generate a long random string); and the plan var is `PAYPAL_PLAN_ID_SELLERRADAR_MONITOR_MONTHLY` (Step 3). `NEXT_PUBLIC_SITE_URL` = `https://sellerradar.bizlegal-ai.com`.

### 2d. Deploy + DNS

- [ ] Click **Deploy** in each project. First deploy takes a few minutes (monorepo build).
- [ ] Vercel project → **Settings → Domains** → add `falseecho.bizlegal-ai.com` (and `sellerradar.bizlegal-ai.com` in the other project).
- [ ] At your DNS provider for `bizlegal-ai.com`, add one **CNAME** record per app:
  - [ ] `falseecho` → `cname.vercel-dns.com`
  - [ ] `sellerradar` → `cname.vercel-dns.com`
- [ ] Wait for the Vercel domain check to go green (can take minutes to hours), then open both URLs in a browser and confirm the landing pages load.

---

## Step 3 — PayPal dashboard: create plans + confirm webhook events

**Why this matters:** card money now only moves when an order is *captured* (fixed this week — before, hub card checkout collected $0 while telling customers they paid). Capture completion is signaled by the `PAYMENT.CAPTURE.COMPLETED` webhook event. If that event isn't enabled, payments will arrive but products won't be marked paid.

### 3a. Webhook events (hub — do this first)

- [ ] developer.paypal.com → your **Live** app → **Webhooks** → open the webhook pointing at `https://bizlegal-ai.com/api/payments/paypal/webhook`.
- [ ] Confirm these events are checked — especially the first one:
  - [ ] `PAYMENT.CAPTURE.COMPLETED` ← **must be on**
  - [ ] `CHECKOUT.ORDER.APPROVED` (defensive capture fallback)
  - [ ] `BILLING.SUBSCRIPTION.ACTIVATED` / `CANCELLED` / `SUSPENDED` (for subscriptions)
- [ ] Note the **Webhook ID** — it must be set as `PAYPAL_WEBHOOK_ID` in the hub Vercel project (likely already is; verify).

### 3b. Subscription plans to create

PayPal subscriptions need one "plan" per price point, created by hand in the dashboard (developer.paypal.com → your app → **Subscriptions → Plans → Create Plan**). After creating each, copy the plan ID (looks like `P-XXXX…`) into the named Vercel env var.

Naming convention the code looks up: `PAYPAL_PLAN_ID_{PRODUCT}_{TIER}_{INTERVAL}` (all caps).

**Blocking the two new apps (create these first):**
- [ ] FalseEcho Monitor — **$149/month** → set `PAYPAL_PLAN_ID_FALSEECHO_MONITOR_MONTHLY` in the **falseecho** Vercel project (and hub, below).
- [ ] SellerRadar Monitor — **$99/month** → set `PAYPAL_PLAN_ID_SELLERRADAR_MONITOR_MONTHLY` in the **sellerradar** Vercel project (and hub).

**Missing from the vault → these subscription buttons currently return 503 "unavailable" at checkout.** Set these in the **hub** Vercel project (all subdomain pricing pages route through hub). Create as many as you want to actually sell; leave the rest for later — the buttons fail safely, nothing breaks.

TRACR (4 tiers × monthly + yearly):
- [ ] `PAYPAL_PLAN_ID_TRACR_REGULATORY_MONTHLY` — $29/mo
- [ ] `PAYPAL_PLAN_ID_TRACR_REGULATORY_YEARLY` — $290/yr
- [ ] `PAYPAL_PLAN_ID_TRACR_STANDARD_MONTHLY` — $149/mo
- [ ] `PAYPAL_PLAN_ID_TRACR_STANDARD_YEARLY` — $1,490/yr
- [ ] `PAYPAL_PLAN_ID_TRACR_PROFESSIONAL_MONTHLY` — $349/mo
- [ ] `PAYPAL_PLAN_ID_TRACR_PROFESSIONAL_YEARLY` — $3,490/yr
- [ ] `PAYPAL_PLAN_ID_TRACR_ENTERPRISE_MONTHLY` — $799/mo
- [ ] `PAYPAL_PLAN_ID_TRACR_ENTERPRISE_YEARLY` — $7,990/yr

DocAI:
- [ ] `PAYPAL_PLAN_ID_DOCAI_STARTER_MONTHLY` — $29/mo
- [ ] `PAYPAL_PLAN_ID_DOCAI_STARTER_YEARLY` — $290/yr
- [ ] `PAYPAL_PLAN_ID_DOCAI_TEAM_YEARLY` — $690/yr
- [ ] `PAYPAL_PLAN_ID_DOCAI_FIRM_YEARLY` — $1,990/yr
  (Team/Firm **monthly** already exist.)

LexAudit:
- [ ] `PAYPAL_PLAN_ID_LEXAUDIT_SOLO_MONTHLY` — $49/mo
- [ ] `PAYPAL_PLAN_ID_LEXAUDIT_SOLO_YEARLY` — $490/yr

Conductor:
- [ ] `PAYPAL_PLAN_ID_CONDUCTOR_SOLO_MONTHLY` — $99/mo
- [ ] `PAYPAL_PLAN_ID_CONDUCTOR_SOLO_YEARLY` — $990/yr
  (Team/Firm already exist.)

Hub (also missing the two new monitor SKUs):
- [ ] `PAYPAL_PLAN_ID_FALSEECHO_MONITOR_MONTHLY` — $149/mo
- [ ] `PAYPAL_PLAN_ID_SELLERRADAR_MONITOR_MONTHLY` — $99/mo

**Skip:** all `BRAI_*` plans — brai is stop-sold (Step 7, decision 2). CoGuard yearly plans — app is not deployed; ignore for now.

Already exist (do not recreate): `HUB_PRO_*`, `HUB_SCALE_*`, `CONDUCTOR_{TEAM,FIRM}_*`, `DOCAI_{TEAM,FIRM}_MONTHLY`, `LEXAUDIT_{BOUTIQUE,MIDMARKET}_*`, `LEXAUDIT_MONITOR_MONTHLY`, `COGUARD_*_MONTHLY`, `MONITOR`, `RETAINER`.

---

## Step 4 — NOWPayments (crypto): IPN secret per app

Every app that takes crypto needs the **same IPN secret** set in both NOWPayments and Vercel, or payments won't be verified.

- [ ] NOWPayments dashboard → **Settings → API / IPN** → generate (or reveal) your **IPN secret**. Copy it to your vault.
- [ ] Set `NOWPAYMENTS_IPN_SECRET` = that value, and `NOWPAYMENTS_API_KEY`, in the Vercel projects for: **falseecho**, **sellerradar**, and verify they're present in **hub**, **forge**, **tracr** (the updated apps being redeployed in Step 5).
- [ ] In NOWPayments, set the IPN callback URL per app when creating payouts/invoices (the apps pass it automatically, but confirm your NOWPayments account has IPN notifications enabled globally).
- [ ] Sanity check: the code fails *open* on forge/tracr if the secret is missing (unverified webhooks accepted) — so an unset secret here is a real security hole, not just a broken feature.

---

## Step 5 — Redeploy the updated existing apps

Everything on branch `feat/revenue-marathon` needs to reach production. Four apps changed this week:

| App | What changed | Why it must go out |
|---|---|---|
| **hub** (bizlegal-ai.com) | Card payments are now actually **captured** (F1); checkout prices resolved server-side (F2); honest post-purchase emails; brai removed from sale (F4) | Until this deploys, hub-routed card checkout collects **$0 while telling customers they paid** |
| **forge** | `boi_` crypto orders are now fulfilled via NOWPayments IPN; repositioned off the dead federal BOI product | Until this deploys, crypto BOI-kit buyers pay and receive **nothing** |
| **tracr** | Pricing consolidation (`lib/tiers.ts`) landed | Keeps page prices and charged prices in sync |
| **brai** | Pricing CTAs replaced with a waitlist; new invoices refused (410) | Stops selling a product that has no fulfillment code at all |

- [ ] Merge `feat/revenue-marathon` into your production branch (ask the agent to do this — do **not** hand-merge).
- [ ] In Vercel, confirm each of the four projects rebuilt and deployed from the merge (hub, forge, tracr, brai).
- [ ] Spot check: hub `/checkout` loads; brai `/pricing` shows a waitlist, not buy buttons.

---

## Step 6 — Real-money test matrix

Do these **after** Steps 1–5. Use small amounts. Keep the order confirmations; refund yourself after.

| # | Rail | What to do | Expected outcome | If it fails |
|---|---|---|---|---|
| 1 | tracr card | Buy the $29 Regulatory scan on tracr by card | Card charged; report generates; email arrives | Check tracr Vercel logs; refund in PayPal |
| 2 | forge crypto | Buy the $149 BOI kit on forge with crypto (NOWPayments) | IPN arrives; BOI deliverable fulfilled (this was the broken path) | Check forge logs for `boi_` IPN handling; refund via NOWPayments |
| 3 | falseecho | Buy the $29 audit on falseecho.bizlegal-ai.com | Paid gate opens; PDF evidence pack emailed | Check Step 1 migration + Step 3 plan/env vars; refund |
| 4 | sellerradar | Buy the $49 audit on sellerradar.bizlegal-ai.com | CSV upload → impact report emailed | Same checks; refund |
| 5 | hub card | Buy any small hub SKU (e.g. a $19 agent one-time) via hub `/checkout` by card | **Money actually appears in PayPal as captured**, confirmation email arrives | This is the F1 fix — if the charge doesn't capture, stop all card sales and tell the agent immediately |

- [ ] Test 1–5, tick each when the money **and** the deliverable both arrive.

---

## Step 7 — Decisions only you can make

- [ ] **1. Forge cross-sell contradiction.** The forge success pages (`/boi/success`, `/passport/success`) still upsell the "CTA-2024 BOI Tracker — $29/mo" — a product built on the **dead federal BOI requirement** that this week's forge reposition moved away from. The repo has an explicit rule that this cross-sell can't be removed without your approval (it's the conversion bridge to a subscription). **Decide:** remove the cross-sell, or rewrite its copy to the new state-transparency angle?
- [ ] **2. Brai's future.** Brai is now stop-sold (waitlist only) because it has zero fulfillment code — payments were buying an email. **Decide:** build the actual report-generation product, or retire brai and redirect its traffic?
- [ ] **3. Bench manual fulfillment.** Bench ($2,500 audit / $5,000-mo program) is human-delivered by design. When a bench payment lands, the only signal is an ops-log event (`payment.confirmed`) — **nobody gets paged**. **Decide:** who watches the ops log / ops dashboard daily, and do you want an email-or-SMS alert added for paid bench orders?
- [ ] **4. Forge card price fork.** The `/boi` page charges **$169** by card while the pricing page and registry say **$149**. Both are currently accepted so no link breaks. **Decide:** collapse to $149 (update the /boi page) or raise everything to $169?

---

## Step 8 — What is NOT done (so you're not surprised)

- [ ] **Monitor crons are stubs.** FalseEcho's and SellerRadar's monitor tiers ($149/mo, $99/mo) have the tables, the token-gated `/api/cron/monitor` endpoint, and dashboards — but the actual "re-scan and email the customer on a schedule" job is **not implemented**. Selling monitor tier today = manual delivery until the cron ships.
- [ ] **Marketing engine M.1–M.7** (programmatic SEO pages, content pipeline, distribution) from the marathon plan is not built.
- [ ] **Subscription 503 matrix (F3) is only half closed.** Any plan you didn't create in Step 3b still returns "unavailable" at checkout. The full list of missing combos is in Step 3b — it's a dashboard chore, not code.
- [ ] **F5 known limitation:** "monthly" SKUs sold through hub's generic `/api/pay/start` card path charge **once**, not recurring (affects `bench_managed_monthly` $5,000/mo). True recurring needs the PayPal Subscriptions work — a future engineering task.
- [ ] **No automated cross-app fulfillment.** TRACR bought via hub, docai tiers, lexaudit monitor, and forge products bought via hub get an *honest* "here's what happens next" email, then a human (you) delivers. Watch the ops log.

---

## If something goes wrong

- Refund the customer first (PayPal/NOWPayments dashboard), then paste the step number, what you clicked, and any error text to the agent.
- Nothing in this runbook can corrupt existing data: the migrations are additive and re-runnable, env vars are reversible, and Vercel keeps previous deployments one click away (**Deployments → previous → Promote**).
