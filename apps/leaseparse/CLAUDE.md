# apps/leaseparse — leaseparse.bizlegal-ai.com

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

LeaseParse workspace — commercial lease abstracting + portfolio critical-date monitoring. The Next.js app lives at `apps/leaseparse/web/` (Vercel project Root Directory = `apps/leaseparse/web`). WAT plan in [`docs/PLAN.md`](docs/PLAN.md); trio decision doc at `decisions/TRIO-PROPSIGNAL-LEASEPARSE-CLOSEFLOW-2026-07-28.md`.

**SCOPE IS FIXED — do not widen it.** One $59 single-lease abstract, **text-layer PDFs only**. No OCR, no CAM reconciliation engine, no portfolio/multi-file tiers, no bespoke auth. A scanned/image-only PDF is auto-detected in `web/lib/extract/pdf-text.ts` and routed to the refund path — it is never silently processed and never sent to an LLM. Set by `decisions/TRIO-PROPSIGNAL-LEASEPARSE-CLOSEFLOW-2026-07-28.md` under a $200/mo total cost cap.

**Primary surfaces** (in `web/app/`): `/` (landing), `/dashboard` (+ `/dashboard/leases/[id]`, `/dashboard/closings/[id]`), `/api/parse/start` (checkout), `/api/leases/{upload-url,ingest,[id]}`, `/api/properties`, `/api/closings[/[id]]`, `/api/inbound-lead` (HMAC-verified Worker ingress).

**Pricing:** $59 per lease abstract one-time (product `leaseparse_abstract_59` in `@bizlegal/payment` — the only SKU; do not add more). Portfolio subscription is out of scope.

**Critical envs (names only, values in canonical vault):** `BIZLEGAL_INBOUND_SECRET`, `OPS_LOG_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `OLLAMA_BASE_URL`, `RESEND_API_KEY`, `HUB_BASE_URL`, `LEASEPARSE_CHECKOUT_LIVE`.

**Paid gate (B4, 2026-09-15):** `/api/leases/upload-url` and `/api/leases/ingest` do **nothing** without a paid credit — `web/lib/payments/credits.ts` is the one check. `LEASEPARSE_CHECKOUT_LIVE` off → 503 `checkout_dark`; no unused credit → 402 `payment_required`. Credits come from `apps/hub/lib/payments/leaseparse-grant.ts` (one `leaseparse_credits` row per paid order, unique on `order_id`). Lifecycle `unclaimed → claimed` (upload URL issued) `→ consumed` (abstract delivered), so one purchase = exactly one abstract and a failed parse never costs the buyer their credit.

**Pipeline:** `pdf-text` (text-layer guard) → `hermes-first` (Ollama, $0) → `coerce` (untrusted JSON → typed `LeaseAbstract`) → `claude-fallback` ONLY when confidence < 0.85 (`CONFIDENCE_FLOOR`) → `date-engine` + `risk/score-engine` (both pure, no LLM) → persist to `leaseparse_leases` → `report/deliver` (HTML to the `reports` bucket + link email).

**Cost cap (enforced, not documented):** `web/lib/extract/llm-budget.ts`. Model defaults to `ANTHROPIC_MODEL ?? 'claude-sonnet-5'`; every Claude call reserves its worst-case cost against `leaseparse_llm_spend` via the row-locked `leaseparse_reserve_llm_spend()` RPC **before** the request goes out. `MONTHLY_CAP_USD = 80`. Denied (or unreadable — it fails closed) → the lease is parked `parse_status='pending_budget'`, the credit is **not** consumed, and no model is called.

**Email:** `@bizlegal/email` only, `kind: 'transactional'`. Never call `api.resend.com` directly and never add a second sender.

**Tables:** `leaseparse_leases`, `trio_properties`, `closeflow_transactions` (`supabase/migrations/20260728_*.sql`) plus `leaseparse_credits` + `leaseparse_llm_spend` and the `paid_order_id` / `parse_status` columns (`supabase/migrations/20260915_leaseparse_paid_gate.sql`, idempotent — **unapplied**). That last migration also creates the two storage buckets: `lease-documents` (private, uploads) and `reports` (public, generated abstracts).

**SEO:** `app/robots.ts`, `app/sitemap.ts`, `app/llms.txt/route.ts` all build from the shared `@bizlegal/themes/seo` lists — do not add a fourth inline copy of the crawler allow/block arrays. `/dashboard` is disallowed everywhere.

**Build:** `pnpm -F @bizlegal/leaseparse build` (from monorepo root). **Tests:** `node tests/run.cjs` from `web/` — 34 unit tests over the pure scorer, date engine, coercion boundary, the paid gate's denial paths, and the LLM budget counter. **Typecheck:** run `node_modules/.bin/tsc --noEmit` from `web/` directly — `turbo run typecheck` false-greens on Windows (it spawns cmd.exe and loses the exit code). **Vercel project:** `leaseparse` (not yet created). **Domain:** `leaseparse.bizlegal-ai.com`. **Root Directory:** `apps/leaseparse/web`.

**Status (2026-09-15): BUILT + GATED, MONEY STILL DARK.** `/api/parse/start` still answers 503 `checkout_not_live` because `LEASEPARSE_CHECKOUT_LIVE` defaults off — and now so do the two delivery routes, which is the point: flipping the flag no longer opens a free door. Opening it requires: apply the migrations (incl. `20260915_leaseparse_paid_gate.sql`, which creates the buckets), create the Vercel project + envs, one verified test purchase end-to-end (checkout → IPN → credit row → upload → abstract), then set the flag. No crons installed.
