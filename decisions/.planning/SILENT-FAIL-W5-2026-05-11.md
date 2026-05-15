# Silent-Failure Audit - W5 (2026-05-11)

**Reviewer:** Claude Opus 4.7 (1M)
**Scope:** Revenue paths Moses cannot watch - payments, lead intake, curator pipeline, OCI router.
**Cross-ref:** Existing fixes in CODE-REVIEW-W5-2026-05-11.md (C-01, H-02, H-04, H-06) confirmed held. New findings only below.

---

## Summary

| Severity | Count |
|---|---|
| CRITICAL | **3** |
| HIGH | **5** |
| MED | **6** |
| LOW | **3** |

---

## CRITICAL

### SF-C1 - documents/scan re-throws scan-insert error into outer catch; no ops_log fires

**File:** apps/docai/web/app/api/documents/scan/route.ts:48-50, 83-88
**Issue:** contract_scans insert does `if (error) throw new Error(error.message)` which re-throws into the outer catch returning `{ error: error.message }` with NO ops_log call. Paying scan fails (Supabase RLS / schema drift / transient network) and the user sees a generic 500. No alerting, no metric. C-2 pattern: Supabase 200 with body-level error, JS does not throw; the explicit `if (error)` catches then re-throws without logging. Lead insert (lines 55-74) IS best-effort with ops_log. Scan insert is NOT - and the scan IS the revenue event.
**Impact:** Silent scan loss on the only DocAI revenue path. Friday LemonSqueezy flip will route paid invoices to a contract_scans row that never existed.
**Fix:** Before re-throwing on scan-insert error, call logEventAsync with type="error", source="docai", status="failed", metadata.stage="scan_insert", err=error.message, filename, contract_type. Wrap the outer catch to log unhandled exceptions with metadata.stage="documents_scan_outer" and return opaque { error: "scan_failed" }.

---

### SF-C2 - paypal/webhook overwrites cancelled to active on out-of-order delivery (compounds H-01)

**File:** apps/hub/app/api/payments/paypal/webhook/route.ts:114-148
**Issue:** PayPal documented behaviour: 25h redelivery window plus out-of-order delivery. The switch unconditionally sets updates.status by event_type. A late-delivered BILLING.SUBSCRIPTION.ACTIVATED arriving AFTER CANCELLED revives a cancelled sub. No event.id dedup, no updated_at-since-event.create_time guard. CODE-REVIEW H-01 flagged it; still unaddressed. Combined: same event_id replayed during a Vercel cold-start retry fires markNurturePaid twice and logs payment.confirmed twice - double-count revenue in /ops.
**Impact:** Cancelled subs silently reactivated; revenue dashboards double-count. Both silently corrupt revenue ledger.
**Fix:** Create processed_paypal_events(event_id PRIMARY KEY, processed_at). After verification: INSERT ON CONFLICT DO NOTHING RETURNING event_id. If no row returned, ack 200 without processing. Gate status updates with .lte("updated_at", event.create_time) so stale events cannot rewind state.

---

### SF-C3 - lemonsqueezy webhook 200s on DB failure -> permanent state loss once entitlements ship

**File:** apps/hub/app/api/payments/lemonsqueezy/route.ts:131-149
**Issue:** Comment: "We still 200 to LemonSqueezy so they do not retry storms." Tolerable while subscriptions is audit-only. The moment Moses flips entitlement gating on this week (Stream B), every Supabase outage = permanent subscription state loss; LS will NOT retry a 200. No dead-letter queue. Inner try/catch (114-139) goes to console.error only - no ops_log, no webhook.received event. markNurturePaid at 146-149 is an orphan `void p.catch(console.warn)` - fire-and-forget at the end of the handler, can be discarded when the response finishes in serverless.
**Impact:** When entitlements flip Friday: Supabase blip between Fri 18:00 UTC and Sun = paying customers locked out, no alert.
**Fix:** (a) webhook.received ops_log BEFORE DB write so a record exists even on write failure. (b) Return 500 on DB error so LS retries with backoff. (c) For markNurturePaid use after(...) from next/server so the promise actually executes past response.

---

## HIGH

### SF-H1 - nowpayments/webhook swallows payment_orders SELECT error; lookup failure looks identical to no-row

**File:** apps/hub/app/api/payments/nowpayments/webhook/route.ts:87-96
**Issue:** `const { data: order } = await supabase.from("payment_orders").select(...).eq("id", ipn.order_id).single()` destructures data but NOT error. When Supabase returns 200 with `{ error: { code: "PGRST116" } }` (no rows OR RLS denial OR transient connection during .single()), data is null and we return 404 to NOWPayments. NOWPayments retries up to 5x then gives up. Transient RLS/connection error becomes a permanent missed payment confirmation.
**Impact:** Crypto paying customer order stays pending forever. C-1 pattern, payment edition.
**Fix:** Destructure { data, error }. On `error && error.code !== "PGRST116"`, return 500 (NOWPayments retries) and log type="error" stage="order_lookup". Only PGRST116 is real not-found.

### SF-H2 - paypal/start and nowpayments/start leak raw exception messages to client

**File:** apps/hub/app/api/payments/paypal/start/route.ts:231-235, nowpayments/start/route.ts:135-139
**Issue:** CODE-REVIEW H-02 flagged it. Still present in both hub start routes: `return NextResponse.json({ error: msg }, { status: 500 })`. Leaks "PayPal credentials not configured", "Supabase env not configured", DB constraint names. DocAI checkout was hardened; hub variants lag.
**Fix:** Generic { error: "payment_init_failed" } to client; full msg to server log plus logEventAsync type="error".

### SF-H3 - Orphan .catch(console.error) on lead-magnet Resend + Telegram loses delivery telemetry

**File:** apps/forge/apps/web/app/api/lead-magnet/route.ts:115, 129
**Issue:** `fetch(...).catch(console.error)` - fire-and-forget at end of handler. In Vercel serverless, once the response returns the function can terminate before the promise resolves. No email.failed ops_log on Resend non-2xx; just a console line that scrolls past in Vercel logs in minutes. The user sees /thank-you redirect; the magnet never arrives. Also: the fetch is not awaited and res.ok is never inspected.
**Impact:** Lead captures into Supabase, magnet email never delivered -> user thinks BizLegal is scammy, churns.
**Fix:** Use `after(async () => { const res = await fetch(...); if (!res.ok) logEventAsync(...) })` from next/server.

### SF-H4 - ops/log route is the central telemetry sink yet has no self-monitoring on its own failure

**File:** apps/hub/app/api/ops/log/route.ts:92-95
**Issue:** Central sink for all 7 subdomains. Outer `catch (err)` returns `{ error: msg }` - only failure signal. If logEvent() itself fails (Supabase outage during DocAI webhook payment.confirmed), the caller gets 500, swallows it (most callers do not check), and the payment event is permanently lost from /ops. No console.error either - zero server-side record when the log endpoint itself errors.
**Impact:** Telemetry blackhole. /ops dashboard reads "no payments in last hour" when there were 10 - Moses cannot distinguish "no traffic" from "telemetry broken."
**Fix:** Inside catch: `console.error("[ops/log] sink failure", { type: body?.type, source: body?.source, err: msg })` and emit a stderr-tagged structured log so Vercel log drain picks it up. Add a heartbeat self-ping from a Vercel cron every 5 min so absence-of-heartbeat is itself the alarm.

### SF-H5 - OCI router store_lead and supabase_patch not error-checked; lead vanishes silently on write failure

**File:** services/oci/router/main.py:153, 209-213, 305-309
**Issue:** `store_lead(record)` called bare - no try/except, no return-value check. If Supabase REST returns 200 with body-level error (RLS, constraint, connection) Python does not raise. main.py continues to `log_event("referral.received", status="ok")` even though no row persisted. Subsequent supabase_patch("deal_router_leads", ...) at 209 has no error handling - silently no-ops because the row does not exist. Same at line 305 in /feedback: `rows = supabase_patch(...)` - len(rows) returned but if the patch silently no-op-ed, the caller has no idea.
**Impact:** Partner email goes out (208), commission row created (227), original lead row missing - reconciliation impossible, Moses cannot see why /feedback cannot find lead_id.
**Fix:** store_lead returns success bool. On False, log_event(type="error", source="oci", metadata stage="store_lead") and DO NOT proceed to ROUTE_PARTNER - return 500 so EA Worker retries. Same fix for line 209 patch and line 305 feedback patch.

---

## MED

### SF-M1 - documents/scan outer catch returns error.message to client (info-leak plus no logging)

**File:** apps/docai/web/app/api/documents/scan/route.ts:84-87
**Issue:** Same shape as H-02. Leaks Supabase error text plus analyzer internal errors. No ops_log from outer catch - combines with SF-C1 to make scan failures completely invisible.
**Fix:** Generic { error: "scan_failed" }; log internals to ops_log.

### SF-M2 - agents/{analyze,draft,generate,review} and forge/scout leak raw exception text, zero logging

**File:** apps/docai/web/app/api/agents/analyze/route.ts:26-30 (and draft, generate, review - identical pattern); apps/forge/apps/web/app/api/scout/route.ts:116-120
**Issue:** Five near-identical handlers each return `{ error: err.message }` with 500. No logEventAsync, no stage tag. Pre-payment surface today but DocAI is part of the LemonSqueezy entitlement plan - once gated, every agent failure is a refund risk.
**Fix:** Shared `withApiErrorLogging(stage, handler)` util that fires logEventAsync(type="error", source="docai", metadata.stage, err) and returns opaque code. Apply to all 5.

### SF-M3 - today-brief swallows ALL errors into degraded:true with no log

**File:** apps/hub/app/api/today-brief/route.ts:91-97
**Issue:** `catch {}` (empty parameter), returns degraded:true to client. Blog feed is the hub homepage only dynamic content. Silent feed outage = dead intelligence brief on the first impression for new visitors, and nobody knows.
**Fix:** `catch (err) { console.error("[today-brief] feed fetch failed", err); logEventAsync({type:"error", source:"hub", metadata:{stage:"feed_fetch", err: String(err)}}) }`. Same instrumentation on the `!res.ok` branch at 77-83.

### SF-M4 - contact route comment lies about Promise.allSettled (still Promise.all)

**File:** apps/hub/app/api/contact/route.ts:165-171
**Issue:** CODE-REVIEW M-01 flagged this; still Promise.all. Inner helpers catch their own throws today so functionally OK. If anyone refactors a helper to throw (stricter timeout), one channel kills the whole route.
**Fix:** Use Promise.allSettled and unwrap .value per the existing comment.

### SF-M5 - main.py ROUTE_PARTNER except blocks log to logger only, not to ops_log

**File:** services/oci/router/main.py:206-229, 263-266
**Issue:** Three sequential try/except in the ROUTE_PARTNER branch: resend_partner_email failure -> logger.exception but referral.routed at 232 still fires status="pending"; store_payout_pending failure -> row missing, /payouts endpoint silently incomplete; telegram_alert_if_hot failure -> low impact. None call log_event. /ops shows "referral routed OK" while partner never received the email.
**Fix:** Each except emits log_event(type="error" or "referral.alert", status="failed", metadata.stage in {resend, payout, telegram}, partner_id) in addition to logger.exception.

### SF-M6 - publisher.py GitHub commits and Vercel hooks have asymmetric error handling; verify_numerics fails open

**File:** services/hetzner/publisher.py:184-186, 263-298, 330-350
**Issue:** verify_numerics catches any exception and returns (True, []) - "allowing publish" - which silently bypasses the anti-hallucination guard during an Anthropic outage. Main gh_put(blog_path,...) at 291 has NO try/except (loud failure, good). Forge push 312-331 returns forge_pushed=False and prints - no log_event. Hub deploy hook 334-340 same. Asymmetry means partial-publish states exist (blog committed, forge skipped silently, hub hook silent) with no /ops record.
**Fix:** verify_numerics exception path returns (False, ["_verification_unavailable"]) so publish blocks rather than ships unverified. All three commit/hook blocks emit log_event(type="cron.completed", status="failed", metadata.stage in {forge_push, hub_hook, forge_hook}, err).

---

## LOW

### SF-L1 - scout.py filter-pass exceptions print to stdout only

**File:** services/hetzner/scout.py:232-233
**Issue:** Per-item filter failures only print(...). If Ollama tunnel drifts (cf-access token rotation), every item fails and scout completes successfully with 0 ranked items, surfacing as outcome:"filter_empty" in cron.completed. Looks like a slow news day; is actually a broken tunnel.
**Fix:** When 50%+ of items fail the filter pass, emit log_event(type="error", status="failed", metadata.stage="filter", failed_count) BEFORE returning empty.

### SF-L2 - auto_pick.py substring-matches on exception text to detect missing column

**File:** services/hetzner/auto_pick.py:178-181
**Issue:** `if "picked_by" in str(err) or "PGRST204" in str(err):` - substring match on stringified exception. A network error containing the word "picked" would fall through to the silent fallback. Bigger issue: the fallback retries the same row that just rejected; if the original failure was anything other than column-missing, the retry silently fails the same way and nothing in ops_log records it.
**Fix:** Inspect PostgrestAPIError.code directly. Wrap the fallback update in its own try/except with log_event on failure.

### SF-L3 - email_contract.py falls back to template on missing API key with no ops_log

**File:** services/oci/router/email_contract.py:122-125, 254-256
**Issue:** Missing ANTHROPIC_API_KEY / RESEND_API_KEY -> logger.warning then return None, falls through to fallback or skip. No log_event to surface "we have been on the fallback for 3 days because someone rotated the key."
**Fix:** First time per process: log_event(type="error", source="oci", status="failed", metadata.stage="config", missing_key="ANTHROPIC_API_KEY"). Gate with a module-level flag to avoid spam.

---

## Recurring patterns to fix structurally

1. C-1/C-2 pattern (Supabase {error} not destructured): SF-H1, SF-H5, parts of SF-M5. Add ESLint rule or wrapper helper mustSucceed(supabase.from(...).query) that throws on body-level error.
2. .catch(console.error) orphans: SF-H3, plus existing CODE-REVIEW L-04. Move to after(...) from next/server or await + log.
3. Empty / silent outer try-catch returning error.message: SF-M1, SF-M2 (5 routes), SF-M3. Single shared error-handler util.
4. Python except Exception with logger.exception(...) but no ops_log: SF-M5, SF-M6, SF-L1, SF-L3.

---

## Recommendation while Moses is offline

**Block payment-switch flip on SF-C1, SF-C2, SF-C3.** All three are revenue-data-loss in the 48h gap.
SF-H1 and SF-H4 are next-most-urgent - they corrupt the only signal we have that anything broke at all.
Everything in MED/LOW can land in a single 3-hour pass on return.

---

_Reviewed: 2026-05-11 - Claude Opus 4.7 (1M context)_
