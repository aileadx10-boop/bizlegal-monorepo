# Security Review — W5 Payment-Gate Activation (2026-05-11)

**Reviewer:** Claude Opus 4.7 (1M) — security-reviewer persona
**Trigger:** LemonSqueezy activation imminent + Paddle build in flight; Moses offline 2 days
**Companion:** `CODE-REVIEW-W5-2026-05-11.md` (different reviewer — focuses on quality/silent-failure). This file is OWASP+payment-specific, calls out what the companion missed.
**Decision rule:** Block payment-switch flip on CRITICAL only. HIGH = fix on Moses return.
**Prior reviews acknowledged:** `SECURITY-V3-2026-05-12.md` (C-1, C-2 closed via D10 commit; H-1, H-3 still open at platform layer).

---

## TL;DR — severity counts

| Severity | Count |
|----------|-------|
| CRITICAL | **1** |
| HIGH     | **6** |
| MED      | **5** |
| LOW      | **3** |

**Blockers for LemonSqueezy/Paddle flip:** S-C1 (no webhook event-id idempotency table — see below). All HIGH items can ship and be remediated in a single 2-hour Moses session post-launch.

---

## CRITICAL

### S-C1 — No webhook event-id idempotency on LemonSqueezy / Paddle paths (replay → double-credit when entitlements turn on)

**Files:**
- `apps/hub/app/api/payments/lemonsqueezy/route.ts:114-130`
- `apps/hub/app/api/payments/paypal/webhook/route.ts:114-148`
- `apps/hub/app/api/payments/nowpayments/webhook/route.ts:103-140`

**OWASP:** API4:2023 — Unrestricted Resource Consumption / A04:2021 — Insecure Design

**Issue:** Every webhook handler upserts/updates subscription or order state directly from the event body. No webhook handler stores `event.id` (LS), `event.id` (PayPal), or `payment_id` (NOWPayments) in an idempotency ledger BEFORE processing. Result:
- LemonSqueezy retries on 5xx (and they will burst on Vercel cold-start 504s). Each retry re-runs the upsert. Today the upsert is idempotent on `id` (sub PK) so re-running `subscription_created` is harmless, BUT `markNurturePaid(userEmail)` fires every time → repeated `mark-paid` writes per replay (low blast today, will widen as entitlements ship).
- PayPal documents up to **25 hours** of webhook redelivery and **out-of-order** delivery. The `switch(event.event_type)` in `apps/hub/app/api/payments/paypal/webhook/route.ts:114-143` overwrites `status` unconditionally. A late-delivered `BILLING.SUBSCRIPTION.ACTIVATED` arriving after `BILLING.SUBSCRIPTION.CANCELLED` revives a cancelled sub. (Companion H-01 named this for PayPal only; same pattern exists on LemonSqueezy.)
- NOWPayments: a captured IPN replay against a still-pending order re-runs the `status = 'active'` path AND re-fires `markNurturePaid`. The IPN signature alone does not bind to time.

**Why CRITICAL for this window:** Moses is about to flip LS entitlements live. Paddle is being wired in parallel and WILL gate features. The first replayed `subscription_cancelled` after a real `subscription_resumed` (PayPal documents out-of-order delivery; LS just retries on any 5xx) locks a paying customer out. Reversed order un-cancels someone who unsubscribed.

**Fix (10-line PR, must land BEFORE Paddle entitlement rollout):**
```sql
create table public.processed_webhook_events (
  gateway      text not null,
  event_id     text not null,
  received_at  timestamptz default now(),
  event_type   text,
  ref_id       text,
  primary key (gateway, event_id)
);
```
Then at the top of each webhook (after signature verify, before any state mutation):
```ts
const { error } = await supabaseAdmin
  .from('processed_webhook_events')
  .insert({ gateway: 'lemonsqueezy', event_id: event.meta?.event_id, event_type: eventName, ref_id: subscriptionId });
if (error?.code === '23505') {
  // duplicate — already processed
  return NextResponse.json({ ok: true, deduped: true });
}
```
Same pattern in `paypal/webhook` (use `event.id`) and `nowpayments/webhook` (use `payment_id`). For PayPal additionally add a `.lte('updated_at', event.create_time)` gate on the status update so a stale event cannot rewind state.

---

## HIGH

### S-H1 — `/api/contact` has NO rate-limit; pumps OCI router → Anthropic spend + Resend reputation

**File:** `apps/hub/app/api/contact/route.ts:103-204` (no rate-limit import anywhere in the file)

**OWASP:** API4:2023 — Unrestricted Resource Consumption

**Issue:** Companion missed entirely. Unauthenticated POST, no Turnstile, no rate-limit, no origin check. Each POST:
1. HMAC-signs and forwards to OCI `/lead` (router trusts the body).
2. Router calls `llm.classify(lead_text)` → Anthropic Haiku 4.5 every time, escalates to Sonnet 4.6 for `UAE_REAL_ESTATE` / `EU_US_BUSINESS` (attacker submits matching text).
3. On `ROUTE_PARTNER`: TWO Resend sends per lead (partner email + referral contract).
4. Also POSTs Formspree quota.

100 QPS cheap-VPS pump → 360k Haiku calls/hr + 360k Resend sends/hr (until reputation kill). SECURITY-V3 C-1 closed this for decision-tree routes; never propagated to `/api/contact`. `@bizlegal/rate-limit` exists and is unused under `apps/hub/`.

**Fix:**
```ts
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'
// inside POST handler, before formData parse:
const ip = clientIpFromHeaders(req.headers) ?? 'unknown'
const rl = rateLimit('hub-contact', ip, { windowMs: 60_000, limit: 5 })
if (!rl.ok) {
  return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { 'retry-after': String(Math.ceil(rl.retryAfterMs/1000)) } })
}
```

### S-H2 — Payment `/start` endpoints (PayPal + NOWPayments) have NO rate-limit; attacker can pump Anthropic-adjacent fraud surface

**Files:**
- `apps/hub/app/api/payments/paypal/start/route.ts:61-236`
- `apps/hub/app/api/payments/nowpayments/start/route.ts:25-140`

**OWASP:** API4:2023 — Unrestricted Resource Consumption / A07:2021 — Auth Failures

**Issue:** Unauthenticated POST. Each call inserts a `payment_orders` row + outbound to gateway. NOWPayments `/start` takes `body.email` as `customer_email` → pump with `body.email=<victim>` may trigger NOWPayments-sent payment email to victim, plus burns invoice quota. PayPal also creates approve URLs reflecting attacker-supplied `order_id`. Companion M-04 only caught `amount_cents=0` validation; bigger gap is no per-IP throttle.

**Fix:** Same pattern as S-H1 above, key `'hub-payment-start'`, limit 3 per 60s per IP.

### S-H3 — HMAC inbound has no timestamp binding (SECURITY-V3 H-1 still open) — payment-relevant subset

**Files:** `apps/hub/app/api/contact/route.ts:55-80` (signer), `services/oci/router/hmac_verify.py:22-29` (verifier), `apps/hub/app/api/payments/lemonsqueezy/route.ts:56-60` (LS body-only sig).

**OWASP:** A02:2021 — Cryptographic Failures / A07:2021 — Auth Failures

**Issue:** Body-only HMAC. Captured signed inbound replays cleanly past the 24h Redis dedupe (`main.py:99-103`) → fresh partner emails + referral-contract sends + Telegram alerts. LS `x-signature` is also body-only; replayed `subscription_created` re-marks paid until S-C1 lands.

**Fix:** SECURITY-V3 H-1 — add `x-bizlegal-timestamp`, sign `${ts}.${body}`, reject if `|now-ts|>300s`. Signer + verifier flip together.

### S-H4 — DocAI `/api/payment/webhook` lacks idempotency — every NOWPayments retry re-marks paid

**File:** `apps/docai/web/app/api/payment/webhook/route.ts:50-97`

**OWASP:** A04:2021 — Insecure Design

**Issue:** Companion's C-01 + H-06 fixed the row-matching correctness. They did NOT add per-`payment_id` idempotency. NOWPayments IPN can retry for hours on 5xx; even on 200, network resets can deliver the same IPN twice. Current code re-runs `update({paid:true})` on each delivery, which is idempotent on the boolean flag BUT:
- `console.log('Marked paid: ...')` fires twice → noisy ops logs.
- Future-tense: when DocAI adds `paid_at` timestamp or `payment_count` aggregate (already in roadmap per `apps/docai/web/supabase/migrations/`), every retry rewrites or doubles the count.

**Fix:** Use the same `processed_webhook_events` table from S-C1. Insert `{gateway: 'nowpayments-docai', event_id: payload.payment_id}` before the update loop; bail on duplicate-key.

### S-H5 — OCI router `/feedback` and `/payouts` use static admin secret without rate-limit or audit

**File:** `services/oci/router/main.py:46-50, 292-346`

**OWASP:** A01:2021 — Broken Access Control / A09:2021 — Logging Failures

**Issue:** `_require_admin` compares `X-Admin-Secret` header to `ROUTER_ADMIN_SECRET` env via plain string `!=` (line 49). Not timing-safe. Companion review missed this entirely.
- A leaked admin secret has no rotation log; nothing emits `admin.access` events on success or failure.
- The `/feedback` endpoint flips `outcome` to `won` and patches `payouts.commission_usd` (lines 322-333). Attacker with admin secret can fabricate `commission_usd` values that flow into `referral.paid` events and the weekly `payout_reconciler` digest sent to Moses's Telegram.
- No nonce / no replay protection on these admin endpoints either.

**Fix:**
```python
import hmac as _hmac
def _require_admin(secret: str | None) -> None:
    expected = os.environ.get("ROUTER_ADMIN_SECRET", "")
    if not expected or not secret or not _hmac.compare_digest(expected, secret):
        log_event("admin.access", status="failed", metadata={"path": "...", "ip_hashed": "..."})
        raise HTTPException(status_code=401, detail="unauthorized")
```
Add `log_event("admin.access", status="ok")` on success. Consider IP allow-list for `/feedback` + `/payouts` (Moses's home IP + the cron host only).

### S-H6 — `paypal/start` and `nowpayments/start` build success/cancel URLs from env `NEXT_PUBLIC_APP_URL` with NO origin lock — open-redirect surface if env drifts

**Files:**
- `apps/hub/app/api/payments/paypal/start/route.ts:95, 121-122, 189-190`
- `apps/hub/app/api/payments/nowpayments/start/route.ts:75, 87-89`

**OWASP:** A01:2021 — Broken Access Control (open redirect via env tampering)

**Issue:** `const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bizlegal-ai.com'` — if a Vercel env var rotation typo sets `NEXT_PUBLIC_APP_URL=https://attacker.example`, every PayPal `return_url` / NOWPayments `success_url` redirects paying customers to the attacker after payment. The DocAI `checkout/route.ts` already hardened this via `isValidInvoiceUrl` (H-04 from companion). Hub did not get the same treatment.

Lower severity than S-H1/S-H2 because exploitation requires env-drift, not user input. But the hub serves all 7 verticals; a single bad-env-set blows up all payment flows simultaneously.

**Fix:** Add a constant allow-list of acceptable origins at module top:
```ts
const ALLOWED_BASE_URLS = new Set(['https://bizlegal-ai.com', 'https://www.bizlegal-ai.com'])
function safeBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bizlegal-ai.com'
  return ALLOWED_BASE_URLS.has(raw) ? raw : 'https://bizlegal-ai.com'
}
```

---

## MED

### S-M1 — No Content-Security-Policy header on hub apex

**Files:** `apps/hub/next.config.js:2-11`, `apps/hub/middleware.ts:29-37`

**Issue:** Headers cover X-Frame-Options, HSTS, Referrer-Policy, COOP, CORP, X-Content-Type-Options — but NO `Content-Security-Policy`. Web rules at `~/.claude/rules/web/security.md` require a nonce-based CSP on production. An XSS reflected via any third-party widget (Resend tracking pixel, Formspree thank-you redirect, analytics script) lands unconstrained.

**Fix:** Add a nonce-based CSP per the web/security.md template. Start in report-only mode (`Content-Security-Policy-Report-Only`) for 1 week, then promote to enforcing. Without this, OWASP A07 partial coverage only.

### S-M2 — `payment_orders.user_email` + `subscriptions.raw_event` leak PII via service-role compromise

**Files:** `apps/hub/app/api/payments/paypal/start/route.ts:75-86`, `nowpayments/start/route.ts:53-65`, `lemonsqueezy/route.ts:114-130`

**Issue:** Plain-text email in `payment_orders`; full LS event (name, billing zip, card last-4) in `subscriptions.raw_event`. Combined with SECURITY-V3 H-2 (service-role key on 5 subdomains): one compromised subdomain dumps every paying customer.

**Fix:** Tighten service-role key per SECURITY-V3 H-2. Don't store unsanitized `raw_event` — drop card last-4 + billing zip before insert.

### S-M3 — `markNurturePaid` failures in webhooks go to `console.warn` only — no alert when customer keeps getting nurture emails after paying

**Files:**
- `apps/hub/app/api/payments/lemonsqueezy/route.ts:146-148`
- `apps/hub/app/api/payments/paypal/webhook/route.ts:191-195`
- `apps/hub/app/api/payments/nowpayments/webhook/route.ts:170-174`

Same finding as companion L-04 but with security framing: a stuck `markNurturePaid` means a paying customer keeps receiving "last call" nurture cadence with discount codes for products they already bought. This is a soft trust violation; with `intelligence.bizlegal-ai.com` Resend reputation tied to nurture sends, repeated wrong sends to customers who unsubscribed will increase spam complaints and degrade SPF/DKIM reputation. Resend reputation kill ≈ same dollar value as SECURITY-V3 C-1.

**Fix:** Per companion L-04: pipe failures into `logEventAsync({type:'nurture.mark_paid_failed', ...})` instead of console.warn. Add a `/ops` query for stuck rows.

### S-M4 — DocAI `/api/payment/invoice/route.ts` returns raw SDK error message to client (H-02 partial regression)

**File:** `apps/docai/web/app/api/payment/invoice/route.ts:51-56`

**Issue:** Companion's H-02 fixed `checkout/route.ts` and `webhook/route.ts` to opaque error codes. The sibling `invoice/route.ts` was NOT updated:
```ts
return NextResponse.json(
  { error: error instanceof Error ? error.message : "Failed to create invoice." },
  { status: 500 },
);
```
Returns `'Crypto checkout is temporarily unavailable. Update NOWPAYMENTS_API_KEY or use the card checkout link instead.'` (`lib/payments.ts:51-55`) — leaks env-var name to any unauthenticated POSTer. Also returns Supabase constraint errors verbatim.

**Fix:** Same pattern as companion H-02:
```ts
console.error('[docai/invoice]', error);
return NextResponse.json({ error: 'invoice_creation_failed' }, { status: 500 });
```

### S-M5 — Vercel OIDC token file in working tree (gitignored, expired)

**File:** `apps/forge/forge` (gitignored, untracked, created by `vercel env pull`). Token `exp:1774750767` → expired 2026-03. Not a leak today. Hygiene: developer-machine compromise reads it directly. Add pre-commit grep for `VERCEL_OIDC_TOKEN` patterns; delete file after each `vercel env pull`.

---

## LOW

### S-L1 — `/api/contact` Promise.all comment-vs-code drift (companion M-01 dupe)

Acknowledged — companion M-01 covers. Promise.all vs Promise.allSettled. Defensive, not a current bug.

### S-L2 — `notify.resend_partner_email` and `send_referral_contract` call paths in OCI router are not wrapped in dedupe → can double-fire on Redis dedupe miss

**File:** `services/oci/router/main.py:206-225`

**Issue:** The Redis `dedupe:{lead_id}` at line 99 protects against repeat /lead calls. If Redis is briefly down (storage.py returns a stub on connection error), `rds.set(..., nx=True)` may return non-None (real Redis would return None on conflict; stub may return True). The partner email then fires twice for the same lead. Logger warns on storage exception but doesn't block the dispatch.

**Fix:** Move the partner-email send AFTER a second-stage idempotency check (e.g., a Supabase row in `deal_router_leads` with `partner_emailed_at IS NULL` check). Or skip the partner email path entirely when Redis health is degraded — surfacing the outage to the partner-routing path is safer than a duplicate send.

### S-L3 — PayPal webhook fetches OAuth token on every event (no caching) — costs 1 extra round-trip per webhook

**File:** `apps/hub/app/api/payments/paypal/webhook/route.ts:52-62`

**Issue:** Each PayPal webhook invocation makes a fresh `/v1/oauth2/token` call (line 53) before verifying. Burns latency on every event and the access_token is valid for 9h. PayPal docs explicitly recommend caching. Not a security issue per se, but increases the window where the webhook handler is mid-flight and competing with cold-start budget; under burst load this contributes to 5xx responses → PayPal redelivery → S-C1 amplification.

**Fix:** Module-level token cache with TTL ~8h. Standard pattern.

---

## Confirmed but not re-reported (covered by companion)

C-01 (DocAI webhook silent-success) — confirmed CRITICAL, fixed; verified in webhook/route.ts:50-97.
H-01 (PayPal idempotency) subsumed by S-C1. H-02 partial regression — see S-M4. H-03 timing-safe — verified fixed lib/payments.ts:99-108. H-04 host-spoof — verified fixed checkout/route.ts:35-50. H-05 LS 200-on-DB-error becomes CRITICAL once entitlements ship; S-C1 table also enables safe 500-on-error retry. H-06 filter injection — verified fixed.

## What this review caught that companion missed

- **S-C1** broader idempotency scope (companion's H-01 named only PayPal; affects all 4 webhook routes).
- **S-H1, S-H2** zero rate-limit on hub contact + payment-start (abuse-cost gap, not correctness).
- **S-H3** HMAC timestamp binding (SECURITY-V3 H-1 still open).
- **S-H4** DocAI webhook idempotency missed.
- **S-H5** OCI admin secret not timing-safe; no audit log.
- **S-H6** env-driven success URLs have no origin allow-list on hub side.
- **S-M1** no CSP on hub apex.
- **S-M2** payment_orders PII blast via service-role (SECURITY-V3 H-2 link).
- **S-M4** H-02 regression on invoice/route.ts.
- **S-L2** partner-email double-fire on Redis degrade.

---

## Recommendation

**Block flip on S-C1 only.** Single migration + ~15 lines per webhook handler. Without it, the first replayed webhook after Paddle entitlements ship can lock paying customers out or unlock free ones.

**Pre-flip checklist:**
- [ ] Create `processed_webhook_events` table (S-C1).
- [ ] Wire dedupe insert into LS, PayPal, NOWPayments-hub, NOWPayments-docai webhooks.
- [ ] Verify `PAYPAL_WEBHOOK_ID`, `LEMONSQUEEZY_WEBHOOK_SECRET`, `NOWPAYMENTS_IPN_SECRET` are set in prod Vercel (Moses ops queue).
- [ ] Confirm processed_webhook_events insert succeeds before status mutation in each handler.

**Post-flip queue (Moses 2hr block on return):**
- S-H1, S-H2 (rate-limit on contact + payment-start)
- S-H3 (HMAC timestamp binding — coordinated cutover EA Worker + OCI + Hub)
- S-H4 (DocAI webhook dedupe — falls out of S-C1 work)
- S-H5 (OCI admin secret timing-safe + audit log)
- S-H6 (hub origin allow-list)
- S-M1 (CSP report-only → enforcing)
- S-M3, S-M4 (mark-paid alerting, invoice/route.ts opaque error)

**Long-running queue (post-launch):**
- S-M2 (service-role tightening — overlaps SECURITY-V3 H-2)
- S-M5 (Vercel CLI token hygiene)
- S-L1, S-L2, S-L3 (small fixes)

---

_Reviewed: 2026-05-11_
_Reviewer: Claude Opus 4.7 (1M context), security-reviewer persona_
_Next review trigger: Paddle integration commit OR after S-C1 lands_
