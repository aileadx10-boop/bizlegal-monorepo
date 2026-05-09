# Silent-Failure Audit — Week 3 Pre-Flight (2026-05-09)

**Scope:** PRs `b81bf0e..a3e16c2` — lazy-init Proxy patterns, force-dynamic routes, sitemap fallback, OCI router additions, Globe.tsx type drift.

**Reviewer:** silent-failure-hunter agent (Opus 4.7)

---

## Verdict

| Severity | Count |
|----------|------:|
| CRITICAL | 2 |
| HIGH     | 6 |
| MED      | 7 |
| LOW      | 3 |
| **Total**| **18** |

**Status:** Ship-blocking on the 2 CRITICAL findings. Everything else is improvement work for Week 3.

---

## CRITICAL

### C-1. Lead-magnet POST never checks the Supabase upsert result — lost-lead silent failure
**File:** `apps/forge/apps/web/app/api/lead-magnet/route.ts:64-72`

`await getSupabase().from('leads').upsert({...})` returns `{ error }` but the route ignores both `error` and `status`. If RLS denies, schema drifts, or the row violates a constraint, Supabase returns 200 with `{ error: {...} }` in the body — JS does not throw. The route then sends the magnet email AND issues a 302 redirect to `/thank-you` even when no row was written.

**Impact:** Lead is emailed the magnet, the user sees the success page, but nothing lands in the leads table. No Telegram alert, no diagnostic surface, total revenue/marketing-attribution loss.

**Fix:**
```ts
const { error: upsertErr } = await getSupabase().from('leads').upsert({...}, { onConflict: 'email' })
if (upsertErr) {
  logEventAsync({ type: 'error', source: 'forge', status: 'failed',
    metadata: { stage: 'lead_upsert', err: upsertErr.message, gap_slug, email } })
}
```

### C-2. docai scan route — `leads.insert` failure is swallowed; partial-state DB
**File:** `apps/docai/web/app/api/documents/scan/route.ts:51-57`

`await supabaseAdmin.from("leads").insert({...})` is unchecked. The contract_scans insert above it IS checked (line 47, throws on error), but the leads insert is fire-and-forget. When contract_scans succeeds and leads fails (RLS, duplicate-key, schema drift), the scan exists in the DB and the user gets a scan_id, but our marketing/nurture pipeline never sees the email.

**Fix:** Same destructure pattern as the contract_scans insert. Treat lead-insert as best-effort with ops_log on error.

---

## HIGH (6)

- **H-1.** `apiKey: process.env.X ?? ''` in claude/index.ts:7 + resend/index.ts:9 — defers missing-env error to first network call as misleading 401. Add named throw in lazy getter.
- **H-2.** Forge sitemap `try/catch {}` swallows ALL errors. Add console.error or let throw bubble in non-prod.
- **H-3.** lead-magnet Resend send `.catch(console.error)` swallows email-failure with no ops event. Use `nurture-enqueue` for retry.
- **H-4.** docai webhook checks `error` per-candidate but not `count`/affected-rows. Silent no-op on filter mismatch = lost payment record.
- **H-5.** docai webhook + scan + invoice routes return SDK error message verbatim to caller. Information disclosure + only diagnostic surface = bad pattern.
- **H-6.** Forge claude.ts JSON parse failures lose Claude response details. Log full response to ops dashboard with redaction.

---

## MED (7)

- M-1. docai checkout/invoice routes — generic catch returns error.message but never reaches ops_log
- M-2. lead-magnet `.catch(console.error)` on Telegram and Resend without await/waitUntil — torn down before complete
- M-3. `lazyClient` Proxy short-circuits non-function property reads with no diagnostic
- M-4. `payout_reconciler.fire_paid_events` swallows Redis errors twice — read AND write
- M-5. `payout_reconciler.commission_total` `try/except: pass` on float coercion
- M-6. `email_contract._compose_via_haiku` failure path doesn't propagate compose_failure_reason
- M-7. `seed_partners.collect_partner` doesn't distinguish "Supabase 200 with empty array" from 4xx

---

## LOW (3)

- L-1. Globe.tsx `as unknown as RefObject<never>` cast has no safety net like `@ts-expect-error` does
- L-2. lexaudit/brai/tracr `onLeadSubmit` errors only console.error'd, no client beacon
- L-3. `outputFileTracingRoot` change pulls more node_modules into bundle — undocumented blast radius

---

## Cross-cutting observations

1. **`process.env.X ?? ''` is universal in lazy-init code** — silently constructs broken clients. Standardize on `requireEnv()` helper.
2. **Proxy pattern is consistent across forge/claude, forge/resend, docai/supabase.** Extract `lazyClient(getter)` into shared `@bizlegal/lazy-client` package.
3. **Force-dynamic verification** — All audited docai routes correctly export `dynamic = 'force-dynamic'` AND consume `supabaseAdmin` only inside handler body. Confirmed safe.
4. **Sitemap fallback** is the only place in the audit scope that fully discards an error. Bring up to the minimum-log bar.

---

## Recommended next action

Block the Week-3 cut on C-1 + C-2 (one-line fixes each, plus `logEventAsync`). Defer the rest to the Week-3 ops dashboard pass where ops_log integration is the dominant theme anyway.
