# LemonSqueezy Activation Runbook
**Created:** 2026-05-17
**Status:** WAITING FOR LS APPROVAL (typical 24–72h after store submit)
**Owner:** Moses (Moses hands) + Claude (code/env automation)

When the LS approval email lands, this is the exact sequence. Pre-flight work that doesn't need approval is in §0 — do that NOW.

---

## §0 — Pre-flight (do BEFORE LS approval, blocks every payment gateway)

### 0.1 Apply webhook idempotency migration to BOTH Supabase DBs (CRITICAL)

PR #36 shipped `apps/hub/supabase/migrations/20260511_processed_webhook_events.sql` with a graceful-degradation fallback. Without the table, every webhook (PayPal, LS, NOWPayments, Paddle) runs WITHOUT real idempotency — the first replay event after LS goes live will double-fire `markNurturePaid` + double subscription rows.

**Steps (5 min × 2):**

**Hub Supabase:**
1. Open https://supabase.com/dashboard → BizLegal Hub project → SQL Editor
2. Open `apps/hub/supabase/migrations/20260511_processed_webhook_events.sql` locally, copy full contents
3. Paste into SQL Editor, click Run
4. Verify: `SELECT * FROM information_schema.tables WHERE table_name='processed_webhook_events';` returns 1 row
5. Verify RLS: `SELECT relrowsecurity FROM pg_class WHERE relname='processed_webhook_events';` returns `t`

**OCI Supabase** (if it has its own webhook handlers — currently `referral.received` audit only):
- Same steps, OCI project SQL Editor
- Skip if OCI project doesn't have any `/webhook` routes (verify with: `grep -r "processed_webhook_events" services/oci/`)

**Verification after:**
```bash
# From bizlegal-monorepo root, with SUPABASE_URL + SUPABASE_SERVICE_KEY set:
curl -H "apikey: $SUPABASE_SERVICE_KEY" \
     -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
     "$SUPABASE_URL/rest/v1/processed_webhook_events?select=count" | jq
# Expect: [{"count": 0}]   (table exists, empty, accessible via service role)
```

### 0.2 Confirm LS webhook URL is set in the LS dashboard

While in the LS dashboard waiting for approval:
- Settings → Webhooks → Add endpoint
- URL: `https://bizlegal-ai.com/api/payments/lemonsqueezy/webhook`
- Events to subscribe: `order_created`, `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_payment_success`, `subscription_payment_failed`, `subscription_payment_refunded`
- Copy the **Signing Secret** (you'll paste it in §1 below)

### 0.3 Confirm LS API key is ready

LS dashboard → Settings → API → Create API key (name: `bizlegal-ai-production-api`). Copy.

---

## §1 — When LS Approval Email Lands

### 1.1 Paste these 3 values to Claude (or set directly via Vercel CLI)

```
LEMONSQUEEZY_API_KEY        = lsk_live_<...>
LEMONSQUEEZY_STORE_ID       = <numeric store id from LS dashboard URL>
LEMONSQUEEZY_WEBHOOK_SECRET = <signing secret from §0.2>
```

**Vercel CLI commands** (Claude can run these autonomously once values pasted):
```bash
vercel env add LEMONSQUEEZY_API_KEY production
vercel env add LEMONSQUEEZY_STORE_ID production
vercel env add LEMONSQUEEZY_WEBHOOK_SECRET production
vercel --prod  # trigger production redeploy
```

### 1.2 Verify deploy READY

Wait ~3 min for Vercel deploy to complete. Verify:
```bash
curl https://bizlegal-ai.com/api/payments/lemonsqueezy
# Expect: 200 OK or known service ack response
```

Also check Vercel dashboard → bizlegal-ai project → latest deployment shows `Ready`.

---

## §2 — Smoke Test (within 30 min of activation)

### 2.1 Create $1 test SKU in LS

LS dashboard → Products → New product
- Name: `Test SKU — DO NOT REMOVE`
- Price: $1 USD one-time
- Status: Published (so checkout works)

### 2.2 Place a $1 self-purchase

- Use LS hosted checkout for the test SKU
- Use a real card (or LS test card if in test mode — `4242 4242 4242 4242` for cards)
- Complete the purchase

### 2.3 Verify the full chain fired

**Within 60 seconds, all 4 should be true:**

```bash
# 1. LS webhook hit our endpoint (Vercel function logs)
vercel logs https://bizlegal-ai.com/api/payments/lemonsqueezy/webhook --since 5m

# 2. Idempotency claim landed
psql "$SUPABASE_URL" -c "SELECT gateway, event_id, event_type, created_at FROM processed_webhook_events WHERE gateway='lemonsqueezy' ORDER BY created_at DESC LIMIT 1;"

# 3. payment_orders row inserted/updated
psql "$SUPABASE_URL" -c "SELECT id, status, amount_cents, user_email FROM payment_orders WHERE source='lemonsqueezy' ORDER BY created_at DESC LIMIT 1;"

# 4. ops_log shows payment.confirmed
curl -s "https://bizlegal-ai.com/ops?token=$OPS_DASHBOARD_TOKEN" | grep -i "payment.confirmed"
```

If ANY of the 4 fail → STOP. Drop to debugging mode. Do not create real customer products until all 4 green.

### 2.4 Replay-test idempotency

In LS dashboard → Webhooks → find the test order webhook → click "Resend". Within 30 seconds:
```bash
# Should return deduped:true on second call, NOT double-fire
vercel logs https://bizlegal-ai.com/api/payments/lemonsqueezy/webhook --since 1m
# Look for: "deduped":true
```

If duplicates DID fire (no `deduped:true` log), the idempotency table isn't applied. Re-run §0.1.

---

## §3 — Create the Real Products (post-smoke)

Once smoke passes, in LS dashboard → Products:

| Product | Price | Billing | LS Variant ID env var |
|---|---|---|---|
| Hub Pro Monthly | $149 USD/mo | Subscription | `LS_VARIANT_HUB_PRO_MONTHLY` |
| Hub Pro Yearly | $1490 USD/yr | Subscription | `LS_VARIANT_HUB_PRO_YEARLY` |
| Hub Scale Monthly | $499 USD/mo | Subscription | `LS_VARIANT_HUB_SCALE_MONTHLY` |
| Hub Scale Yearly | $4990 USD/yr | Subscription | `LS_VARIANT_HUB_SCALE_YEARLY` |
| BRAI Standard | $149 USD | One-time | `LS_VARIANT_BRAI_STANDARD` |
| BRAI Priority | $249 USD | One-time | `LS_VARIANT_BRAI_PRIORITY` |
| BRAI Extended | $500 USD | One-time | `LS_VARIANT_BRAI_EXTENDED` |
| DocAI Starter | $29 USD/mo | Subscription | `LS_VARIANT_DOCAI_STARTER` |
| DocAI Team | $69 USD/mo | Subscription | `LS_VARIANT_DOCAI_TEAM` |
| DocAI Firm | $99 USD/mo | Subscription | `LS_VARIANT_DOCAI_FIRM` |

For each: copy the **Variant ID** (numeric, in product detail URL) and paste to Claude. I'll bulk-set the env vars + wire the frontend "Pay with card" button to LS hosted checkout.

**Product descriptions:** use the copy from chat earlier today (10-product description block) — drop into LS "Description" field per SKU.

---

## §4 — Frontend Wire-up (Claude task, no Moses input needed)

After §3 variant IDs are set:
1. Update `apps/hub/app/pricing/page.tsx` — replace PayPal `card` checkout URLs with LS hosted-checkout URLs of form `https://bizlegal-ai.lemonsqueezy.com/buy/<variant-id>`
2. Update FAQ entry "Why no Stripe / LemonSqueezy?" → reword to reflect LS now live
3. Open PR, merge, verify Vercel deploy.

---

## §5 — Delete the Test SKU

Once §4 lands and a real customer purchase has flowed end-to-end:
- LS dashboard → Products → Test SKU → Archive
- Refund the $1 self-purchase

---

## Rollback (if anything goes sideways)

```bash
# Unset LS env vars to disable LS-side checkout immediately
vercel env rm LEMONSQUEEZY_API_KEY production
vercel env rm LEMONSQUEEZY_STORE_ID production
vercel env rm LEMONSQUEEZY_WEBHOOK_SECRET production
vercel --prod  # redeploy with LS disabled

# Pricing page falls back to PayPal/NOWPayments per existing url() helper
# (returns undefined when env missing → PricingTierCard shows "coming soon")
```

LS webhook still fires but our handler will 401 (HMAC verify fails on missing secret) — LS retries with backoff for ~3 days then gives up. No data loss.

---

## Why this order is locked

1. **§0.1 first** because every other gateway also depends on the idempotency table. Apply once, all 4 gateways become safe.
2. **LS first among gateways** because it's the cheapest activation (3 env vars, webhook already coded) AND it gives EU VAT coverage as MoR — biggest brand-trust unlock per hour spent.
3. **PayPal LIVE flip second** (separate runbook) because it unlocks recurring subscription revenue ceiling.
4. **NOWPayments URLs third** because they're 30+ repetitive dashboard items — best done in a single batch session.
5. **Paddle fourth** because we already have NOWPayments+PayPal+LS covering 90% of buyers; Paddle is redundancy.
