# apps/leaseparse — leaseparse.bizlegal-ai.com

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

LeaseParse workspace — commercial lease abstracting + portfolio critical-date monitoring. The Next.js app lives at `apps/leaseparse/web/` (Vercel project Root Directory = `apps/leaseparse/web`). WAT plan in [`docs/PLAN.md`](docs/PLAN.md); trio decision doc at `decisions/TRIO-PROPSIGNAL-LEASEPARSE-CLOSEFLOW-2026-07-28.md`.

**SCOPE IS FIXED — do not widen it.** One $59 single-lease abstract, **text-layer PDFs only**. No OCR, no CAM reconciliation engine, no portfolio/multi-file tiers, no bespoke auth. A scanned/image-only PDF is auto-detected in `web/lib/extract/pdf-text.ts` and routed to the refund path — it is never silently processed and never sent to an LLM. Set by `decisions/TRIO-PROPSIGNAL-LEASEPARSE-CLOSEFLOW-2026-07-28.md` under a $200/mo total cost cap.

**Primary surfaces** (in `web/app/`): `/` (landing), `/dashboard` (+ `/dashboard/leases/[id]`, `/dashboard/closings/[id]`), `/api/parse/start` (checkout), `/api/leases/{upload-url,ingest,[id]}`, `/api/properties`, `/api/closings[/[id]]`, `/api/inbound-lead` (HMAC-verified Worker ingress).

**Pricing:** $59 per lease abstract one-time (product `leaseparse_abstract_59` in `@bizlegal/payment` — the only SKU; do not add more). Portfolio subscription is out of scope.

**Critical envs (names only, values in canonical vault):** `BIZLEGAL_INBOUND_SECRET`, `OPS_LOG_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ANTHROPIC_API_KEY`, `OLLAMA_BASE_URL`, `RESEND_API_KEY`, `HUB_BASE_URL`, `LEASEPARSE_CHECKOUT_LIVE`.

**Pipeline:** `pdf-text` (text-layer guard) → `hermes-first` (Ollama, $0) → `coerce` (untrusted JSON → typed `LeaseAbstract`) → `claude-fallback` ONLY when confidence < 0.85 (`CONFIDENCE_FLOOR`, hard cost cap) → `date-engine` + `risk/score-engine` (both pure, no LLM) → persist to `leaseparse_leases` → `report/deliver` (HTML to the `reports` bucket + link email).

**Email:** `@bizlegal/email` only, `kind: 'transactional'`. Never call `api.resend.com` directly and never add a second sender.

**Tables:** `leaseparse_leases`, `trio_properties`, `closeflow_transactions` (`supabase/migrations/20260728_*.sql`) — **still unapplied**. Storage buckets: `lease-documents` (private, uploads) and `reports` (public, generated abstracts).

**Build:** `pnpm -F @bizlegal/leaseparse build` (from monorepo root). **Tests:** `node tests/run.cjs` from `web/` — 22 unit tests over the pure scorer, date engine, and coercion boundary. **Vercel project:** `leaseparse` (not yet created). **Domain:** `leaseparse.bizlegal-ai.com`. **Root Directory:** `apps/leaseparse/web`.

**Status (2026-08-20): BUILT, MONEY STILL DARK.** The full path is implemented and typechecks/builds, but `/api/parse/start` still answers 503 `checkout_not_live` because `LEASEPARSE_CHECKOUT_LIVE` defaults off. Opening it requires: apply the 4 migrations, create both storage buckets, set the envs in Vercel, then one verified test purchase. No crons installed.
