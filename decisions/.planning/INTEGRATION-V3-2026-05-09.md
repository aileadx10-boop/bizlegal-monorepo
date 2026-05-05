# INTEGRATION-V3 — Phase AA V3 Lead-to-Nurture-to-Payment Audit

**Date:** 2026-05-09 (Phase AA Day 7)
**Auditor:** gsd-integration-checker (read-only)
**Scope:** End-to-end V3 conversion machine — 8 lead-capture entrypoints → `lead_nurture_state` → 5-min worker cron → Haiku composer → Resend send → opt-out / payment terminators → ops telemetry.

---

## TL;DR — 5 BLOCKERs

1. **B-1 — telemetry pipeline silently drops every nurture event.** `nurture.email.sent`, `nurture.opt_out`, `referral.contract_email` are not in the hub's `ALLOWED_TYPES` (`apps/hub/app/api/ops/log/route.ts:39-58`) nor in OCI's local guard (`services/oci/router/ops_log.py:43-51`). Every event is rejected; Stage 5 observability is fully dark for V3.
2. **B-2 — OCI nurture insert raises on idempotent re-fire.** `services/oci/router/storage.py:38-42` lacks `Prefer: resolution=ignore-duplicates`. A re-fired `/lead` with same `lead_id` returns 409 → httpx raises `HTTPStatusError`. The catch in `main.py:201-205` checks for `"23505" in str(exc)` or `"duplicate"`, neither of which appears in the HTTPStatusError message — branch falls through, partner-routed lead never enters nurture.
3. **B-3 — `markNurturePaid` not wired on LemonSqueezy.** `apps/hub/app/api/payments/lemonsqueezy/route.ts` never calls the helper. LS customers continue receiving education / comparison / last_call upsells through the full 7-day cadence. (Latent today — LS is parked behind MoR approval — but ship-blocking the moment LS goes live.)
4. **B-4 — Haiku contract-violation infinite-retry loop with no quarantine.** `services/worker/src/nurture.ts:269-300` throws on contract violations; row's `next_send_at` doesn't move; cron re-picks every 5 min indefinitely. With `temperature: 0.4` Haiku's drift for one (vertical, step) pair can deterministically violate the 90-180 word rule or the single-anchor rule. One stuck row × 12 ticks/hr × 24h = 288 wasted Haiku calls/day per stuck row.
5. **B-5 — cross-vertical email leakage.** Two captures by the same email from different verticals create two parallel rows with two parallel cadences. The unique index is on `lead_id`, not email. User who submits BOI decision tree then later fills a TRACR funnel gets 8 emails over 10 days, two voices, two products. Spam-complaint magnet.

---

## Wiring summary

| Connection | Status | Notes |
|---|---|---|
| Forge decision tree → `enqueueNurture` | WIRED | route.ts:78 |
| Forge inbound → `enqueueNurture` | WIRED | |
| BRAI / DocAI / LexAudit / TRACR inbound → `enqueueNurture` | WIRED | 4 |
| Hub /api/leads → `enqueueNurture` | WIRED |
| OCI router → `lead_nurture_state` | **BROKEN** | B-2 |
| Worker `due()` → `processRow` | WIRED |
| `processRow` → composeEmail → Resend | WIRED with race (W-4, W-5, W-6) |
| Unsubscribe webhook → `opted_out=true` | WIRED with race (W-5) |
| NowPayments / PayPal → `markNurturePaid` | WIRED |
| LemonSqueezy → `markNurturePaid` | **BROKEN** | B-3 |
| Worker `nurture.email.sent` → hub | **BROKEN** | B-1 |
| Hub unsubscribe `nurture.opt_out` → ops_events | **BROKEN** | B-1 |
| OCI `referral.contract_email` → hub | **BROKEN** | B-1 (blocked by OCI local ALLOWED_TYPES) |

---

## WARNINGs

| # | Issue | File:Line | Repro | Remediation |
|---|---|---|---|---|
| W-1 | `select=*` in `due()` masks future column drift | `nurture-state.ts:83` | Add column to migration; nothing fails. | Switch to explicit column list. |
| W-2 | Hub `source ?? 'unknown'` collapses unrelated funnels into one lead_id per email | `apps/hub/app/api/leads/route.ts:86` | Submit `/api/leads` twice with no `source` field; only first creates a row. | Fall back to `page ?? 'unknown'`. |
| W-3 | Subdomain shim error reading is brittle when `Prefer: return=minimal` flips | (5 shims) | Future schema change. | Defensive parse. |
| W-4 | No row-level lock between `due()` read and `advance()` write — payment-confirm race sends a redundant upsell | `nurture.ts:142` | Time webhook 1500ms after */5 cron tick. | Re-read row before `sendEmail`, abort if `payment_status!='none'`. |
| W-5 | Same race for opt-out — user clicks unsubscribe mid-tick, in-flight email still ships | same | timing dependent | same fix as W-4 |
| W-6 | No `Idempotency-Key` to Resend → 5xx-after-accept retry can double-send | `resend.ts:46` | Resend 503 after enqueue. | Add `Idempotency-Key: nurture-{row.id}-{step}` header. |

---

## INFOs

- I-1 Cross-prefix lead_id collision is adversarial only; not a real risk.
- I-2 Worker's `enqueue()` (`nurture-state.ts:174-211`) is dead code; lift to `packages/nurture-state` or delete.
- F-1 Worker `logEvent` doesn't pass `email` for nurture events — degrades /ops correlation.
- F-2 Decision tree endpoint is unauthenticated POST — bot-pumpable. Add Turnstile/origin allow-list pre-launch.
- F-9 Five `nurture-enqueue.ts` shims are byte-identical; promised "lift to packages/" trigger condition is now met.

---

## Recommended fix order (Day 7)

1. ✅ **B-1** — three line additions across hub allow-list + OCI ALLOWED_TYPES + (no-op for `packages/ops-log` since it's only used hub-side; the OCI Python guard + the hub Set are the two gates).
2. ✅ **B-2** — `Prefer: resolution=ignore-duplicates,return=minimal` added to OCI insert call site for `lead_nurture_state` (don't change global helper).
3. ✅ **B-3** — wire `markNurturePaid` after LS subscription upsert when `status === 'active'`.
4. ✅ **W-1** — explicit columns in `due()`.
5. ✅ **W-2** — `source ?? page ?? 'unknown'`.
6. ✅ **W-6** — Resend Idempotency-Key.
7. **B-4** (deferred → Moses ops) — needs migration `add column consecutive_failures int default 0` + worker patch. Migration + 1 worker change. Append to runbook.
8. **B-5** (deferred → Moses product call) — engineering recommends global single-active-sequence-per-email; product needs to confirm. Append to runbook with the trade-off framed.

---

Day 7 fixes 1-6 land in the same commit as the read-only audit doc. Items 7+8 accumulate to the Moses ops runbook.
