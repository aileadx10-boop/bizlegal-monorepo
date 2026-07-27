# apps/closeflow — closeflow.bizlegal-ai.com

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

CloseFlow workspace — real-estate closing checklist + deadline engine (Trio hand #1, ~zero LLM cost). The Next.js app lives at `apps/closeflow/web/` (Vercel project Root Directory = `apps/closeflow/web`). WAT plan + workflows in `docs/`.

**Primary surfaces** (in `web/app/`): `/` (landing), `/api/transaction/start` (checkout stub — dark), `/api/inbound-lead` (HMAC-verified lead ingress).

**Pricing:** $39/transaction one-time via product `closeflow_transaction_39` (registry: `packages/payment/src/products.ts`). Planned subs: Investor $29/mo, Agent/Team $99/mo. See `docs/PLAN.md` for all money paths.

**Critical envs (names only, values in canonical vault):** `BIZLEGAL_INBOUND_SECRET`, `OPS_LOG_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `RESEND_API_KEY`.

**Build:** `pnpm -F @bizlegal/closeflow build` (from monorepo root). **Typecheck:** `pnpm -F @bizlegal/closeflow typecheck`. **Domain (reserved):** `closeflow.bizlegal-ai.com`.

**Status: SCAFFOLD ONLY (2026-07-28).** Not deployed, no Vercel project yet, checkout returns 503 `checkout_not_live` until Z7-style verification passes (root CLAUDE.md hard rule #5). Canonical decision doc: `decisions/TRIO-PROPSIGNAL-LEASEPARSE-CLOSEFLOW-2026-07-28.md`.
