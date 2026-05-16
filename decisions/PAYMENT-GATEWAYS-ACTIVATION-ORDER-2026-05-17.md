# Payment Gateway Activation Order — Single Reference
**Created:** 2026-05-17
**Status:** LS in approval (24–72h) — PayPal/NOWPayments/Paddle can run in parallel

This is the master sequencer. When in doubt about "what next", read this first.

---

## Status at a glance

| Gateway | Code | Webhook | Env vars | Blocker | Activation ETA |
|---|---|---|---|---|---|
| **LemonSqueezy** | ✅ ready | ✅ hardened | ⏳ 3 vars | LS approval (24–72h) | 30 min after approval |
| **PayPal LIVE** | ✅ ready | ✅ hardened | ⏳ 7 vars (6 plan IDs + webhook ID) | Moses dashboard work | 45 min |
| **NOWPayments** | ✅ ready | ✅ hardened | ⏳ ~30 invoice URLs | Moses dashboard work (batch) | 90 min |
| **Paddle** | ✅ ready (PR #36) | ✅ hardened | ⏳ 5 vars (1 webhook secret + 4 price IDs) | Moses dashboard work | 30 min |
| Stripe | DEPRECATED | — | — | Ignored | Never |

**Single critical pre-req for all:** Apply `processed_webhook_events` migration. See `LEMONSQUEEZY-ACTIVATION-RUNBOOK-2026-05-17.md` §0.1.

---

## Activation order (locked)

### Lane 1 — LemonSqueezy (blocked on approval)
Owner: Moses (LS dashboard + paste creds) + Claude (env + redeploy)
Runbook: `LEMONSQUEEZY-ACTIVATION-RUNBOOK-2026-05-17.md`
Why first: Cheapest activation (3 vars), EU VAT MoR coverage, code already shipped.

### Lane 2 — Paddle (can run in PARALLEL with Lane 1)
Owner: Moses (Paddle dashboard) + Claude (env + frontend button + redeploy)
Runbook: This doc §2 below.
Why second: Code already shipped (PR #36), only 5 vars needed, redundant card-payment option to LS for non-EU customers.

### Lane 3 — PayPal LIVE flip (can run in PARALLEL)
Owner: Moses (PayPal dev dashboard) + Claude (env flip + redeploy + smoke)
Runbook: This doc §3 below.
Why third: Already in sandbox; flip to LIVE unlocks recurring subscription revenue. Higher revenue ceiling than LS for users who already have a PP account.

### Lane 4 — NOWPayments URLs (can run in PARALLEL)
Owner: Moses (NP merchant dashboard, batch session) + Claude (env bulk-set across 5 Vercel projects)
Runbook: This doc §4 below.
Why fourth: Crypto is small slice of legal-services buyers; URLs are repetitive dashboard work; batch session is most efficient.

---

## §2 — Paddle activation runbook

### 2.1 Moses hands (~10 min, Paddle Vendor Dashboard)

1. Open https://vendors.paddle.com → Notifications → copy the **Webhook Secret**.
2. Catalog → Products → "New product" called `BizLegal AI`.
3. Add 4 prices on that product:

| Price label | Amount | Billing | Description |
|---|---|---|---|
| Hub Pro Monthly | $149 USD | Monthly recurring | Compliance autopilot for growing operators |
| Hub Pro Yearly | $1490 USD | Yearly recurring | Hub Pro, billed annually (save 2 mo) |
| Hub Scale Monthly | $499 USD | Monthly recurring | Compliance infrastructure for serious operators |
| Hub Scale Yearly | $4990 USD | Yearly recurring | Hub Scale, billed annually (save 2 mo) |

4. For each price: copy the `pri_XXXXX` ID.

5. Add a webhook endpoint:
   - URL: `https://bizlegal-ai.com/api/payments/paddle/webhook`
   - Events: `transaction.completed`, `transaction.payment_failed`, `subscription.activated`, `subscription.resumed`, `subscription.past_due`, `subscription.canceled`, `subscription.paused`, `adjustment.created`

### 2.2 Paste to Claude

```
PADDLE_WEBHOOK_SECRET        = pdl_ntfset_<...>
PADDLE_PRICE_HUB_PRO_MONTHLY = pri_<...>
PADDLE_PRICE_HUB_PRO_YEARLY  = pri_<...>
PADDLE_PRICE_HUB_SCALE_MONTHLY = pri_<...>
PADDLE_PRICE_HUB_SCALE_YEARLY  = pri_<...>
```

### 2.3 Claude executes (autonomous after paste)

```bash
vercel env add PADDLE_WEBHOOK_SECRET production
vercel env add PADDLE_PRICE_HUB_PRO_MONTHLY production
vercel env add PADDLE_PRICE_HUB_PRO_YEARLY production
vercel env add PADDLE_PRICE_HUB_SCALE_MONTHLY production
vercel env add PADDLE_PRICE_HUB_SCALE_YEARLY production
# Already-set: PADDLE_ENV=live (or sandbox during testing)
vercel --prod
```

Then I'll wire the "Pay with Paddle" button on `/pricing` in a follow-up PR. The backend `/api/payments/paddle/start/route.ts` already accepts `{tier, interval}` and returns a Paddle checkout URL — frontend just needs the button.

### 2.4 Smoke test

Same 4-checkpoint pattern as LS (§2 of LS runbook):
1. Webhook hits `/api/payments/paddle/webhook` (Vercel function logs)
2. `processed_webhook_events` row with `gateway='paddle'`
3. `payment_orders` row with `source='paddle'`
4. `ops_log` `payment.confirmed` event

---

## §3 — PayPal LIVE flip runbook

### 3.1 Moses hands (~30 min, PayPal Developer Dashboard)

1. Open https://developer.paypal.com → "My Apps & Credentials" → switch toggle from **Sandbox** to **Live**.
2. Verify the BizLegal AI app exists in Live. If not: create app named `bizlegal-ai-production`, copy `CLIENT_ID` and `CLIENT_SECRET`.
3. PayPal → Billing → Plans → create 6 subscription plans:

| Plan | Price | Billing cycle | Plan ID env var |
|---|---|---|---|
| Hub Pro Monthly | $149 | Monthly | `PAYPAL_PLAN_ID_HUB_PRO_MONTHLY` |
| Hub Pro Yearly | $1490 | Yearly | `PAYPAL_PLAN_ID_HUB_PRO_YEARLY` |
| Hub Scale Monthly | $499 | Monthly | `PAYPAL_PLAN_ID_HUB_SCALE_MONTHLY` |
| Hub Scale Yearly | $4990 | Yearly | `PAYPAL_PLAN_ID_HUB_SCALE_YEARLY` |
| BRAI Priority Monthly | $249 | Monthly | `PAYPAL_PLAN_ID_BRAI_PRIORITY_MONTHLY` |
| DocAI Team Monthly | $69 | Monthly | `PAYPAL_PLAN_ID_DOCAI_TEAM_MONTHLY` |

4. Copy each `P-XXXXXX...` plan ID.
5. Webhooks → add endpoint `https://bizlegal-ai.com/api/payments/paypal/webhook`. Subscribe events:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.REFUNDED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.RENEWED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
6. Copy the **Webhook ID** (looks like `1JE12345AB678C9D`).

### 3.2 Paste to Claude

```
PAYPAL_CLIENT_ID                     = <live client id>
PAYPAL_CLIENT_SECRET                 = <live client secret>
PAYPAL_WEBHOOK_ID                    = <live webhook id>
PAYPAL_PLAN_ID_HUB_PRO_MONTHLY       = P-<...>
PAYPAL_PLAN_ID_HUB_PRO_YEARLY        = P-<...>
PAYPAL_PLAN_ID_HUB_SCALE_MONTHLY     = P-<...>
PAYPAL_PLAN_ID_HUB_SCALE_YEARLY      = P-<...>
PAYPAL_PLAN_ID_BRAI_PRIORITY_MONTHLY = P-<...>
PAYPAL_PLAN_ID_DOCAI_TEAM_MONTHLY    = P-<...>
```

### 3.3 Claude executes

```bash
# Replace existing sandbox vars with live vars
vercel env rm PAYPAL_CLIENT_ID production
vercel env rm PAYPAL_CLIENT_SECRET production
# (etc for each)
vercel env add PAYPAL_CLIENT_ID production       # paste live value
vercel env add PAYPAL_CLIENT_SECRET production
vercel env add PAYPAL_WEBHOOK_ID production
vercel env add PAYPAL_ENV production             # value: "live"
# ... 6 plan IDs
vercel --prod
```

### 3.4 Smoke test

Place 4 self-purchases ($1 test products if real prices too high, or use the lowest tier monthly):
1. Hub Pro Monthly → expect `BILLING.SUBSCRIPTION.ACTIVATED`
2. BRAI Priority (one-time) → expect `PAYMENT.CAPTURE.COMPLETED`
3. Cancel one subscription → expect `BILLING.SUBSCRIPTION.CANCELLED`
4. Refund one capture → expect `PAYMENT.CAPTURE.REFUNDED`

Verify each via `processed_webhook_events` + `payment_orders.status` transitions.

---

## §4 — NOWPayments bulk URL setup

### 4.1 Moses hands (~45 min, single batch session in NP merchant dashboard)

For each SKU below: NP dashboard → Invoices → "Create invoice" with the listed parameters → copy invoice URL.

| SKU code | Amount | Description |
|---|---|---|
| HUB_PRO_MONTHLY | 149 | BizLegal AI Hub Pro — monthly |
| HUB_PRO_YEARLY | 1490 | BizLegal AI Hub Pro — yearly |
| HUB_SCALE_MONTHLY | 499 | BizLegal AI Hub Scale — monthly |
| HUB_SCALE_YEARLY | 4990 | BizLegal AI Hub Scale — yearly |
| BRAI_STANDARD | 149 | BRAI Standard Report |
| BRAI_PRIORITY | 249 | BRAI Priority Report |
| BRAI_EXTENDED | 500 | BRAI Extended Multi-Jurisdiction Report |
| DOCAI_STARTER_MONTHLY | 29 | DocAI Starter — monthly |
| DOCAI_STARTER_YEARLY | 290 | DocAI Starter — yearly |
| DOCAI_TEAM_MONTHLY | 69 | DocAI Team — monthly |
| DOCAI_TEAM_YEARLY | 690 | DocAI Team — yearly |
| DOCAI_FIRM_MONTHLY | 99 | DocAI Firm — monthly |
| DOCAI_FIRM_YEARLY | 990 | DocAI Firm — yearly |
| TRACR_REGULATORY_MONTHLY | 29 | TRACR Regulatory — monthly |
| TRACR_REGULATORY_YEARLY | 290 | TRACR Regulatory — yearly |
| TRACR_BRONZE_MONTHLY | 149 | TRACR Bronze — monthly |
| TRACR_BRONZE_YEARLY | 1490 | TRACR Bronze — yearly |
| TRACR_SILVER_MONTHLY | 299 | TRACR Silver — monthly |
| TRACR_SILVER_YEARLY | 2990 | TRACR Silver — yearly |
| LEXAUDIT_SOLO_MONTHLY | 49 | LexAudit Solo — monthly |
| LEXAUDIT_SOLO_YEARLY | 490 | LexAudit Solo — yearly |
| LEXAUDIT_BOUTIQUE_MONTHLY | 199 | LexAudit Boutique — monthly |
| LEXAUDIT_BOUTIQUE_YEARLY | 1990 | LexAudit Boutique — yearly |
| LEXAUDIT_MIDMARKET_MONTHLY | 599 | LexAudit Mid-Market — monthly |
| LEXAUDIT_MIDMARKET_YEARLY | 5990 | LexAudit Mid-Market — yearly |
| FORGE_BOI | 149 | Forge BOI Filing |
| FORGE_PASSPORT | 1500 | Forge Passport |
| FORGE_SCAN_BASIC | 97 | Forge Compliance Scan — basic |
| FORGE_SCAN_PRO | 197 | Forge Compliance Scan — pro |
| FORGE_SCAN_PREMIUM | 360 | Forge Compliance Scan — premium |

### 4.2 Paste to Claude

A list in the form:
```
HUB_PRO_MONTHLY     = https://nowpayments.io/payment/?iid=XXXXXXXX
HUB_PRO_YEARLY      = https://nowpayments.io/payment/?iid=XXXXXXXX
...
```

### 4.3 Claude executes (autonomous after paste)

Bulk-set across 5 Vercel projects:
- **hub** (bizlegal-ai): all `HUB_*` + `BRAI_*` URLs
- **brai**: all `BRAI_*` URLs (cross-project for subdomain pricing pages)
- **docai-frontend**: all `DOCAI_*` URLs
- **trcr**: all `TRACR_*` URLs
- **lexaudit**: all `LEXAUDIT_*` URLs
- **forge**: all `FORGE_*` URLs

Env var name convention: `NEXT_PUBLIC_NOWPAYMENTS_<SKU>_URL`

Trigger redeploys for all 5 projects.

### 4.4 Smoke test

For each subdomain, curl the pricing page + grep for "nowpayments.io" hrefs:
```bash
for sub in forge brai trcr lexaudit docai bizlegal-ai; do
  echo "=== $sub ==="
  curl -s "https://${sub}.bizlegal-ai.com/pricing" | grep -oE 'href="https://nowpayments\.io/[^"]+"' | head -3
done
```

If a subdomain returns no NP URLs → that project's env vars didn't take. Redeploy.

---

## When all 4 lanes are activated

Final verification:
```bash
# Z7 row M (payment URLs present)
bizlegal-verify-z7 | grep -E "Row M|Row N"
# Should be GREEN on both
```

Then update `decisions/OPERATIONS-MANUAL-2026-05-15.md` with the activation date for each gateway, and decommission `decisions/PAYMENT_URLS_VAULT.md` (which is the staging vault from before).

---

## Total time estimate

- Moses dashboard work: 10 + 30 + 45 = **85 min** (single afternoon)
- Claude env/code/redeploy: **30 min** total (between dashboards)
- Smoke tests: 4 × 15 min = **60 min**
- **Grand total: ~3 hours of focused work** spread across the LS approval window

After this is done, every `/pricing` page shows real working checkout buttons. Revenue surface is fully activated.
