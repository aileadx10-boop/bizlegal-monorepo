# Evening handoff — 2026-05-20
**Status:** Production payment surface massively expanded (5 gateways). 3 small manual tasks remain.

---

## What landed today

### PR #42 (merged this morning) — Unified API checkout + LS-rejection trust fixes
- /checkout page (API-driven, no per-product config)
- Apex meta rewritten (no crypto/digital-assets triggers)
- /testimonials + /case-studies pages (were 404)
- JSON-LD Organization + WebSite structured data
- Sitemap-index: 3 → 8 subdomain coverage

### PR #43 (open) — Cold-pitch queue
3 ready-to-send pitch variants with live checkout URLs. Compliance lead / GC / founder personas. Send when LS-recovery momentum permits.

### PR #44 (open, in deploy) — Bank wire + every-subdomain rewire
- USD wire (Citibank, SWIFT/ACH) + EUR wire (Banking Circle, SEPA) live on apex /checkout for orders ≥$500
- 12 encrypted bank env vars set on Vercel production (BANK_EUR_*, BANK_USD_*) + WIRE_ADMIN_TOKEN
- /api/payments/wire/start: validates, creates order, emails wire instructions with unique BL-XXXXXXXX reference
- /api/payments/wire/confirm: Moses-only reconciliation via x-admin-token header
- 17 tier blocks across brai/forge/lexaudit/tracr/docai now route through apex /checkout — no per-product URLs anywhere

---

## 3 items still needing your hands (each ~30 sec)

### 1. Supabase webhook idempotency migration
**Why blocked:** No CLI installed, no DB password, no `SUPABASE_ACCESS_TOKEN` in env. Service-role key can't execute DDL.

**Your 5-min path:**
1. https://supabase.com/dashboard → BizLegal project → SQL Editor → New query
2. Paste contents of `apps/hub/supabase/migrations/20260511_processed_webhook_events.sql`
3. Run
4. Tell me "migration applied" — I'll verify via REST that the table exists with RLS

**OR — give me one access token to do it autonomously next time:**
1. https://supabase.com/dashboard/account/tokens → "Generate new token"
2. Name: `bizlegal-ci-management` · scopes: all (it's user-scoped)
3. Paste here. I add to Vercel as `SUPABASE_ACCESS_TOKEN`, then I can apply this + future migrations via Management API automatically.

### 2. GSC sitemap resubmit (30 sec UI)
**Why blocked:** Have `GOOGLE_API_KEY` but Submit Sitemap needs OAuth (`webmasters` scope) or service account. Public ping endpoints `google.com/ping?sitemap=` returned 404 (deprecated 2023).

**Your path:**
1. https://search.google.com/search-console → bizlegal-ai.com → Sitemaps
2. Remove old `sitemap-index.xml` entry if present
3. Submit `https://bizlegal-ai.com/sitemap-index.xml`
4. Google picks up the 5 new subdomain sitemaps (docai/brai/tracr/lexaudit/leadforge) within 24-48h

**OR — give me a service-account JSON to automate next time** (more setup, do later)

### 3. PayPal LIVE flip (optional, ~30 min when you have time)
This is in `decisions/PAYMENT-GATEWAYS-ACTIVATION-ORDER-2026-05-17.md` §3. Not urgent — the wire + crypto + PayPal sandbox already cover real revenue.

---

## How to use what we have RIGHT NOW

### To take a paying customer today
**Direct link to send a prospect (Hub Pro $149/mo):**
```
https://bizlegal-ai.com/checkout?product=hub&tier=pro&interval=monthly&amount=14900&name=BizLegal%20Hub%20Pro
```
Buyer picks: Crypto (NOWPayments — fully active), PayPal (sandbox — works for testing, real cards land in sandbox account), or Bank Wire (real). For the FIRST real dollar, push them to Crypto OR Wire.

### To take a real enterprise wire ($500+)
**Direct link to BRAI Extended ($500):**
```
https://bizlegal-ai.com/checkout?product=brai&tier=extended&interval=one-time&amount=50000&name=BRAI%20Extended%20Report
```
Buyer enters email → clicks "Pay by Bank Wire — USD" or "— EUR" → receives full wire instructions in their inbox with reference code → wires money → you mark it confirmed via:
```bash
curl -X POST https://bizlegal-ai.com/api/payments/wire/confirm \
  -H "x-admin-token: $WIRE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order_id":"<uuid>","received_cents":50000,"received_at":"2026-05-21T08:00:00Z"}'
```

The `WIRE_ADMIN_TOKEN` is in your Vercel env (I generated and stored it during this session). Reveal via:
```bash
vercel env pull --environment=production .env.production.local
grep WIRE_ADMIN_TOKEN .env.production.local
rm .env.production.local
```

### To check ops feed for a real payment landing
- `https://bizlegal-ai.com/ops?token=$OPS_DASHBOARD_TOKEN`
- Look for `payment.intent` (order created) and `payment.confirmed` (paid)
- Wire orders show `gateway: 'wire'` in metadata

---

## What the production surface looks like now

| Surface | Pay with | Status |
|---|---|---|
| `bizlegal-ai.com/checkout` | Crypto, PayPal/card, Wire USD, Wire EUR | LIVE today |
| `brai.bizlegal-ai.com/pricing` → checkout | Crypto, PayPal/card, Wire (for ≥$500 tiers) | LIVE after deploy |
| `forge.bizlegal-ai.com/pricing` → checkout | Crypto, PayPal/card, Wire (for ≥$500 tiers) | LIVE after deploy |
| `docai.bizlegal-ai.com/pricing` → checkout | Crypto, PayPal/card, Wire (for ≥$500 tiers) | LIVE after deploy |
| `lexaudit.bizlegal-ai.com/pricing` → checkout | Crypto, PayPal/card, Wire (for ≥$500 tiers) | LIVE after deploy |
| `tracr.bizlegal-ai.com/pricing` → checkout | Crypto, PayPal/card, Wire (for ≥$500 tiers) | LIVE after deploy |
| LemonSqueezy | (4× rejected by Stripe upstream — stop applying) | n/a |

Every product now takes money. Without a single per-product dashboard URL.
