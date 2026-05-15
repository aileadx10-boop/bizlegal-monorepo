# Code Review — W5 PR Audit (2026-05-11)

**Reviewer:** Claude Opus 4.7 (1M)  
**Scope:** PRs #23, #24, #29, #30, #31, #32, #33, #34, #35 (monorepo) + #9, #10 (bizlegal-ea)  
**Range:** `git log 0c7cf66..HEAD` — 8 monorepo commits, 1516 insertions / 615 deletions  
**Focus:** payment infrastructure (LemonSqueezy / PayPal / NOWPayments), DocAI rewrites, theme bridge, contact intake  
**Decision rule:** CRITICAL blocks Moses's payment-switch flip; everything else queued for triage on return.

---

## Summary

| Severity | Count |
|---|---|
| CRITICAL | **1** |
| HIGH | **6** |
| MED | **5** |
| LOW | **4** |

**Blockers for payment switch:** 1 CRITICAL must be fixed before LemonSqueezy/Paddle goes live. The CRITICAL is a known-pattern silent-failure in the DocAI NOWPayments webhook that will mark wrong scans as paid AND fail to mark correct ones, breaking the only existing crypto revenue path. The 6 HIGH items degrade trust signals or leak SDK internals to callers but do not break revenue collection itself.

---

## CRITICAL

### C-01 — DocAI NOWPayments webhook silently marks wrong scans as paid AND skips correct ones

**File:** `apps/docai/web/app/api/payment/webhook/route.ts:36-51`  
**Issue:** `supabase.from('contract_scans').update({paid:true}).or('id.eq.${candidate},nowpayments_order_id.eq.${candidate}')` — no `.select()` means `error` is `null` even when zero rows match; the loop breaks on the FIRST candidate regardless of whether anything actually got updated. Result: when `payload.order_id` is present but does not exist in the table (NOWPayments retry edge case, test webhook, or a typo'd order), the loop returns "matched" without marking any scan paid, and the customer who paid does not get unlocked. Worse: if `id` is a UUID column and `candidate` is a non-UUID string (e.g. invoice_id), Postgres throws a parse error and the candidate is properly skipped, but if candidate IS a valid UUID matching an UNRELATED scan, that scan is wrongly marked paid.  
**Fix:** Use `.select('id')` so the result includes affected rows, then check `data?.length > 0` before declaring matched:
```ts
const { data, error } = await supabaseAdmin
  .from("contract_scans")
  .update({ paid: true })
  .or(`id.eq.${candidate},nowpayments_order_id.eq.${candidate}`)
  .select('id');
if (!error && data && data.length > 0) {
  matched = true;
  console.log(`[docai/webhook] Marked paid via ${candidate} (${data.length} row)`);
  break;
}
```
Also: prefer `nowpayments_order_id.eq.X` only (the invoice id we wrote at start time). The `id.eq.X` branch is what creates the cross-table-mismatch surface — scan IDs and NOWPayments IDs share the same UUID namespace nominally but should be queried separately and explicitly.

---

## HIGH

### H-01 — PayPal webhook lacks idempotency / out-of-order protection

**File:** `apps/hub/app/api/payments/paypal/webhook/route.ts:114-143, 145-148`  
**Issue:** PayPal can re-deliver any event for 25h and out-of-order delivery is documented. The switch on `event_type` overwrites status unconditionally; a late-delivered `BILLING.SUBSCRIPTION.ACTIVATED` arriving AFTER `BILLING.SUBSCRIPTION.CANCELLED` will revive a cancelled sub. There is no `event.id` dedup, no `updated_at >= event.create_time` guard, and `payment_orders` does not appear to have a unique-event-id table.  
**Fix:** Add a `processed_paypal_events` table with `event_id` primary key. Insert-then-process pattern. Also gate updates with `.lte('updated_at', event.create_time)` so a stale event cannot rewind state. Alternatively, define a strict state machine where `cancelled`/`refunded`/`expired` are terminal and cannot transition back to `active`.

### H-02 — PayPal `/start` returns raw exception messages to client

**File:** `apps/hub/app/api/payments/paypal/start/route.ts:231-235`  
**Issue:** `const msg = err instanceof Error ? err.message : 'unknown error'; return NextResponse.json({ error: msg }, { status: 500 })` — leaks "PayPal credentials not configured", "Supabase env not configured", DB constraint names, and other internals to the unauthenticated POST endpoint. Useful for an attacker mapping the stack.  
**Fix:** Log `msg` server-side; return generic `{ error: 'payment_init_failed' }` to client. Same fix needed in:
- `apps/hub/app/api/payments/paypal/webhook/route.ts:200-204`
- `apps/hub/app/api/payments/nowpayments/start/route.ts:135-139`
- `apps/hub/app/api/payments/nowpayments/webhook/route.ts:178-182`
- `apps/docai/web/app/api/payment/webhook/route.ts:55-60`

### H-03 — DocAI NOWPayments signature uses non-timing-safe compare

**File:** `apps/docai/web/lib/payments.ts:68-85`  
**Issue:** `return expected === signature` — string equality is timing-leaky. The hub's NOWPayments webhook (`apps/hub/app/api/payments/nowpayments/webhook/route.ts:35`) already uses `crypto.timingSafeEqual` correctly; DocAI lags behind.  
**Fix:**
```ts
const a = Buffer.from(expected, "hex");
const b = Buffer.from(signature, "hex");
if (a.length !== b.length) return false;
return crypto.timingSafeEqual(a, b);
```

### H-04 — DocAI `payment/checkout` redirects to user-controlled URL via `request.url`

**File:** `apps/docai/web/app/api/payment/checkout/route.ts:10-16, 23, 30, 43, 65, 72`  
**Issue:** `new URL("/report", request.url)` — when DocAI is fronted by Vercel proxy + custom domain, `request.url` can carry an attacker-controlled host header in some edge configurations, leading to open-redirect surface on the failure paths (lines 30, 43, 72) and an SSRF-adjacent surface in the success path (`NextResponse.redirect(invoice.invoice_url, 303)` at line 65 trusts NOWPayments' returned URL without origin allow-list).  
**Fix:** Build all internal URLs from `process.env.NEXT_PUBLIC_SITE_URL` (already validated in `lib/payments.ts:24`), not `request.url`. Validate `invoice.invoice_url` starts with `https://nowpayments.io/` before redirecting.

### H-05 — LemonSqueezy webhook 200s on DB write failure → no retry, lost subscription state

**File:** `apps/hub/app/api/payments/lemonsqueezy/route.ts:130-139`  
**Issue:** Comment explicitly says "We still 200 to LemonSqueezy so they don't retry storms" — this means if Supabase is down for 5 minutes during a webhook burst, those subscription updates are permanently lost; LemonSqueezy will not retry. For an MoR review-only stub this is fine, but the comment also notes "no plan-gated features yet rely on this table" — once that changes (and it will when Moses flips entitlements on), silent loss = silent revenue leak.  
**Fix:** Return 500 on DB error so LemonSqueezy retries with exponential backoff. Or add a dead-letter table `webhook_failures` to capture the raw event for manual replay. Before going live with entitlements, switch to one of these.

### H-06 — DocAI `payment/webhook` `.or()` filter uses raw string interpolation

**File:** `apps/docai/web/app/api/payment/webhook/route.ts:40`  
**Issue:** `` .or(`id.eq.${candidate},nowpayments_order_id.eq.${candidate}`) `` — if `candidate` contains a comma, paren, or PostgREST operator (`.like.`, `.in.`), the filter is reshaped. HMAC verification gates this, so it is not currently exploitable, but if signature verification ever regresses (it has before per the PayPal H-3 comment), this becomes an unauthenticated DB-filter injection. Also: candidate is sometimes the wrong column type (UUID vs string), triggering Postgres parse errors that are silently swallowed by the `if (!error)` branch.  
**Fix:** Use a single `.eq()` per candidate with explicit column targeting. Drop the `.or()` pattern entirely:
```ts
for (const candidate of candidates) {
  for (const column of ['nowpayments_order_id', 'id'] as const) {
    const { data, error } = await supabaseAdmin
      .from("contract_scans").update({paid:true}).eq(column, candidate).select('id');
    if (!error && data?.length) { matched = true; break; }
  }
  if (matched) break;
}
```

---

## MED

### M-01 — `/api/contact` Promise.all swallows OCI/Formspree rejections in fan-out

**File:** `apps/hub/app/api/contact/route.ts:168-171`  
**Issue:** Comment says "Promise.allSettled means one outage never blocks the other" — but the actual code uses `Promise.all`. The inner helpers (`postToOciRouter`, `postToFormspree`) DO catch their own throws and return `{ok:false}` objects, so `Promise.all` works today, but if anyone refactors the helpers to throw (e.g. for a stricter timeout), one channel fails the whole route.  
**Fix:** Match the comment — use `Promise.allSettled` and unwrap `.value`. Defensive.

### M-02 — `/api/contact` HMAC fails closed but logs no alert

**File:** `apps/hub/app/api/contact/route.ts:55-60, 173-189`  
**Issue:** When `BIZLEGAL_INBOUND_SECRET` is unset, OCI router post is skipped and the failure is logged in `ops_log.metadata.oci.err`. No paging signal; if Vercel env drift removes the secret, partner routing silently stops and Moses sees inbound leads (via Formspree) but no partner emails fire. This is a revenue-killing failure mode that survives the user-visible 303 redirect.  
**Fix:** Emit a `console.error` at startup (or first failed request) and consider a synthetic health-check that POSTs a known-good payload and asserts both channels return ok.

### M-03 — Theme FOUC script duplicates 23-entry override list as embedded JSON

**File:** `apps/hub/lib/page-themes.ts:130-146`  
**Issue:** `pageThemeFOUCScript` serializes `PAGE_THEME_OVERRIDES` into a string-template inline script. Acknowledged in the comment, but ships an extra ~600 bytes per HTML page (every render) into every `<head>` because the FOUC script is inlined synchronously. Mostly a CWV / bundle-budget concern, not correctness.  
**Fix:** Tolerable today. If overrides grow past 50 entries, move to a typed const that the build emits as a static `theme-overrides.js` file with `Cache-Control: immutable` instead of inline.

### M-04 — `paypal/start` allows `amount_cents = 0`

**File:** `apps/hub/app/api/payments/paypal/start/route.ts:65`  
**Issue:** `!body.amount_cents` is falsy for 0, so 0 is rejected. But there is no upper bound. Compare nowpayments which clamps to `[50, 100000_00]` (line 38). PayPal will reject huge amounts at their API, but the order row gets created in our DB first and ends up `status:'failed'` — wasted insert + log noise + fake conversion-funnel data.  
**Fix:** Add the same `if (body.amount_cents < 50 || body.amount_cents > 100000_00)` clamp to PayPal start. Symmetry with NOWPayments and a useful defense if a frontend bug submits cents-vs-dollars confusion.

### M-05 — DocAI FAQ makes absolute liability-bearing claims

**File:** `apps/docai/web/components/docai-faq.tsx:17, 42`  
**Issue:** "stamped with the citations behind every claim" / "no fabricated case law" are absolutes. Per the project memory rule (revenue-first, liability-minimised), every public surface must pair the revenue lever with a liability-shrinking measure. A single missed Friday review or one hallucinated citation = breach-of-warranty surface.  
**Fix:** Soften to "Every output is reviewed weekly by a licensed attorney; we flag and correct any citation that fails our verification pass" + add the existing `/disclaimer` link adjacent. Same fix on line 42 ("Three things we work hard to deliver:..." or similar). Not a bug; a Moses-policy compliance item.

---

## LOW

### L-01 — Hub `paypal/webhook` reads `event.resource.custom_id` twice

**File:** `apps/hub/app/api/payments/paypal/webhook/route.ts:97-99`  
**Issue:** `const orderId = event.resource.custom_id ?? ((event.resource as {custom_id?:string}).custom_id as string | undefined)` — the right-hand side of `??` is identical to the left. Dead fallback.  
**Fix:** Drop the cast; just `event.resource.custom_id`.

### L-02 — Theme bridge token map omits `--bg-card` on `[data-theme='dark']` ultraviolet

**File:** `apps/hub/app/styles/theme-v2.css:421-554`  
**Issue:** Daybreak + ultraviolet bridges both define `--bg-card` (lines 429, 488) but the legacy `[data-theme='dark']` block at lines 81-132 of the same file does not — it sets `--bl-*` tokens only. Pages using `--bg-card` (the V1 token) under `[data-theme='dark']` without `data-bl-theme-v2` will pick up nothing and fall back to whatever globals.css declared.  
**Fix:** Only an issue if a page accidentally drops `data-bl-theme-v2`. Audit which routes set what; consider asserting bridge presence in `app/layout.tsx`.

### L-03 — `partners_coverage_check.py` mutates `sys.path` at import time

**File:** `services/oci/router/partners_coverage_check.py:44-46`  
**Issue:** `sys.path.insert(0, str(HERE))` runs at module import — affects any test runner or shared process that imports this module. Not a bug for a CLI script, but if it ever gets imported as a library (the `build_report` function is exportable), it pollutes the path globally.  
**Fix:** Move into `main()` or guard with `if __name__ == "__main__":`.

### L-04 — Webhook `markNurturePaid` fire-and-forget loses errors to console only

**File:** `apps/hub/app/api/payments/lemonsqueezy/route.ts:146-149`, `paypal/webhook/route.ts:191-195`, `nowpayments/webhook/route.ts:170-174`  
**Issue:** `void markNurturePaid(email).catch(err => console.warn(...))` — if the nurture rows aren't marked paid, the user who just paid will receive last-call upsell emails the next day. Console-only logging means there is no alert path.  
**Fix:** Pipe failures into the existing `logEventAsync` ops log with type `nurture.mark_paid_failed` so a dashboard query can spot them.

---

## Files outside this review's scope but worth a follow-up

- `apps/hub/app/ops/OpsDashboardClient.tsx` (PR #29, +53 lines) — unreviewed; curator pipeline visibility, no payment impact
- `apps/hub/app/sitemap.ts` (PR #30) — SEO-only, no security/revenue impact
- `apps/docai/web/app/layout.tsx` (PR #33-35, ±126 lines) — wrapper-only deltas; no auth or payment paths
- `bizlegal-ea#9, #10` — separate repo; sitemap + cron only, no payment surface

---

## Recommendation

**Block payment-switch flip on C-01 only.** Fix needs ~10 lines and tests. Everything else (H-01..H-06) is high-quality follow-up Moses can triage in a single 2-hour session on return. None of the HIGH items prevents revenue collection — they degrade resilience, leak SDK internals to clients, or create future-tense failure modes when entitlements come online.

The CRITICAL is the only one that can mark a paid customer as unpaid (revenue lost, support ticket) AND mark an unpaid scan as paid (free content delivered). Both directions cost trust on day one of the LemonSqueezy/Paddle launch.

---

_Reviewed: 2026-05-11_  
_Reviewer: Claude Opus 4.7 (1M context)_
