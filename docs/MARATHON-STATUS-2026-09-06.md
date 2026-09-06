# Revenue Marathon — Status Report 2026-09-06

**Branch:** `feat/revenue-marathon` (pushed to origin, head `542a2bd`)
**Scope:** continuation of the one-week revenue marathon started 2026-08-24 (session died on billing quota; resumed 2026-09-01, worked through quota interruptions to 2026-09-06).
**Verification standard:** everything below passed `tsc --noEmit` and a real `next build`; runtime-only paths are explicitly marked.

---

## 1. What was DONE (committed + pushed)

### P0 — Money loop repairs

| Commit | Change |
|---|---|
| `1d0e56b` (FirmCited repo) | Audit price restored **$20 → $490**, deployed to prod, verified live on cited.bizlegal-ai.com |
| `851a581` | TRACR checkout rebuilt: `lib/tiers.ts` single source of truth ($29/$149/$349/$799), one-time PayPal orders replacing the broken `PAYPAL_PLAN_ID_*` subscription path, "Pay by Card" added to paywall |
| `abff8d0` | Forge repositioned off the dead federal BOI product (FinCEN Mar 2025 rule) → state-transparency angle; ~25 files: homepage, pricing, campaigns, FAQ, decision-tree, scanner, AI analysis prompt, emails |
| `680e2f6` | **Hub card capture fix (F1/F2)** — the biggest find: hub created PayPal orders but never captured them ($0 collected while customers were told they paid). Now: idempotent capture on return URL + webhook fallback, `PAYMENT.CAPTURE.COMPLETED` as the paid event, server-side price map (client `?amount=` no longer honored), new `/payment/cancelled` page |
| `bfd0193` | Forge crypto fulfillment: `boi_` NOWPayments orders were collected but never delivered. Now fulfilled via IPN with atomic paid-claim + duplicate-IPN protection |

### P1 / P2 — New products built (code complete)

| Commit | Change |
|---|---|
| `c628b59` | **FalseEcho MVP** (`apps/falseecho`): 4-engine AI-falsehood probes with graceful degradation, 25-prompt battery, SHA-256 evidence chain, $29 audit / $149 monitor, PayPal + NOWPayments, paid-gated report, programmatic SEO, hub price-map + fulfillment grant, Supabase migration |
| `676562d` | **SellerRadar MVP** (`apps/sellerradar`): hand-rolled CSV parser, 3-type Amazon fee engine, margin diff in dollars, $49 audit / $99 monitor, PayPal + NOWPayments, paid-gated per-SKU report, programmatic SEO, hub grant, migration |

### P3 — Funnels, cross-sell, dashboards

| Commit | Change |
|---|---|
| `64e7b7d` | Cross-sell engine: `crossSellFor()` map in `@bizlegal/nurture-enqueue/cross-sell`; "Also from the fleet" blocks on tracr/falseecho/sellerradar/forge/lexaudit success pages; nurture sequences for the two new apps in the worker (prevents composer crashes) |
| `1c0306e` | Honest post-payment emails (F4 partial): non-auto-fulfilled SKUs no longer claim "your order is active". **BRAI stop-sold** — it had zero fulfillment code; pricing → waitlist, invoices refused (410), removed from product registry |

### Marketing engine (M.x)

| Commit | Change |
|---|---|
| `b639975` | **M.1**: content queue migration (`20260906`), hub `/api/marketing/trigger` + `/callback` (HMAC + Zod, 503 pre-migration), Trigger.dev 6-hourly queue processor → n8n. **M.3/M.4 in-repo**: FalseEcho emits `falsehood_detected`, SellerRadar emits `fee_change_detected` (fire-and-forget) |
| `4012620` | **M.7**: `/ops/content` dashboard (token-gated, by product/type/day, pipeline status, >3-failures/24h banner, graceful pre-migration). **M.6-lite**: Monday 13:00 UTC newsletter task (logs when email env missing) |

### Hardening + crons

| Commit | Change |
|---|---|
| `cd5f6e4` | Worker: 5 pre-existing type errors fixed (ScheduledController, override, readonly tuples) |
| `81719df` | **TRACR email-leak fix** (report API served buyer email + paid report on guessable `TR-2026-NNNNN` IDs); docai post-payment 404 fixed (new `/payment/success` + PayPal return capture route) |
| `95ed619` | Same email-leak class fixed in FalseEcho + SellerRadar; checkout resolves email server-side from the scan/report row |
| `3c85daf` | **FalseEcho monitor cron is real**: daily 06:00 UTC re-scan of due monitors → full battery → diff vs baseline → hash-anchored evidence → alert email on new flags. 25-monitor cap. Plus docai `/payment/cancelled` |
| `542a2bd` | **SellerRadar monitor cron is real**: weekly Mon 06:00 UTC, pure-engine re-scan on schedule-version change → new paid report + old-vs-new dollar email. New migration `20260907` (monitor scan state). Smoke-tested with fixture catalogs (parity + no-change + change paths all pass) |

### Docs

- `docs/MONEY_LOOP_STATUS.md` — fleet money audit (per-app verdicts, F1–F7)
- `docs/MOSES-HANDOFF.md` — full owner runbook (Steps 1–9), current through `542a2bd`
- `docs/falseecho-mvp-spec.md`, `docs/sellerradar-mvp-spec.md`

---

## 2. What is LEFT

### Needs Moses (no code remaining — dashboards/deploys/decisions; all in MOSES-HANDOFF.md)

1. Run **4 Supabase migrations** (`0901` falseecho, `0902` sellerradar, `0906` content_queue, `0907` sellerradar monitor state)
2. Create **Vercel projects + DNS** for falseecho/sellerradar subdomains; set env var lists (incl. `CRON_SECRET`, `MARKETING_TRIGGER_URL`)
3. PayPal: enable **`PAYMENT.CAPTURE.COMPLETED`** webhook; create **~20 missing subscription plans** (each missing one = a live 503 button)
4. NOWPayments: same IPN secret in all 5 crypto apps (currently fail-open on forge/tracr — security hole)
5. **Merge `feat/revenue-marathon` → production + redeploy hub/forge/tracr/brai** (until then: hub card checkout collects $0, forge crypto BOI buyers get nothing)
6. 5 real-money test purchases (matrix in handoff Step 6)
7. Decisions: BOI Tracker upsell contradiction, BRAI build-or-retire, bench ops-log watch, forge $149/$169 price fork

### Code work remaining (not blocking revenue on one-time SKUs)

- **M.2 / M.5** marketing: n8n brand-voice workflows + video pipeline (external accounts)
- **F3** subscription 503 matrix closes only as PayPal plans are created (dashboard chore)
- **F5**: `bench_managed_monthly` charges once instead of recurring (needs PayPal Subscriptions work)
- **Auto-fulfillment gap**: tracr/docai/lexaudit/forge hub purchases still need human delivery after the honest email
- **LegalOS pilot** (P3 tail) — not started
- FalseEcho monitor at >10 active monitors needs chunked sweeps (noted in code)
- SellerRadar ~0.9% storage-fee estimate drift on re-scans (documented; fix = persist dims on SKU rows)
- Full repo test-suite run was never done (per-app typecheck + builds + targeted smoke harnesses only; no live payment was executed — all "works" claims are code-path + build verified)

### Foreign session work in the tree (not mine, uncommitted)

Another session has uncommitted changes on this branch: hub `ai-practice-review`, `kit/` feature, MDX content engine, decisions files, and modifications to hub webhooks/resend/package.json. **Commit or stash before merging**, and expect a merge-time review of `apps/hub/lib/resend.ts` and both payment webhooks (both sessions touched them).

---

## 3. How to resume

`/goal resume` or "continue session". Agents verify with: `tsc --noEmit` per app + `node node_modules/next/dist/bin/next build` from the app dir (`pnpm --filter build` no-ops on this Windows box).
