# apps/leaseparse — leaseparse.bizlegal-ai.com

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

LeaseParse workspace — commercial lease abstracting + portfolio critical-date monitoring. The Next.js app lives at `apps/leaseparse/web/` (Vercel project Root Directory = `apps/leaseparse/web`). WAT plan in [`docs/PLAN.md`](docs/PLAN.md); trio decision doc at `decisions/TRIO-PROPSIGNAL-LEASEPARSE-CLOSEFLOW-2026-07-28.md`.

**Primary surfaces** (in `web/app/`): `/` (landing), `/api/parse/start` (upload → checkout stub), `/api/inbound-lead` (HMAC-verified Worker ingress).

**Pricing:** $59 per lease abstract one-time (product `leaseparse_abstract_59` in `@bizlegal/payment`); portfolio subscription planned at $79–$199/mo.

**Critical envs (names only, values in canonical vault):** `BIZLEGAL_INBOUND_SECRET`, `OPS_LOG_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ANTHROPIC_API_KEY`, `OLLAMA_BASE_URL`, `RESEND_API_KEY`.

**Extraction policy:** Hermes/Ollama first (local, $0); Claude fallback ONLY when confidence < 0.85 — hard cost cap, see `web/lib/extract/claude-fallback.ts`.

**Build:** `pnpm -F @bizlegal/leaseparse build` (from monorepo root). **Vercel project:** `leaseparse` (not yet created). **Domain:** `leaseparse.bizlegal-ai.com`. **Root Directory:** `apps/leaseparse/web`.

**Status (2026-07-28): SCAFFOLD ONLY.** Checkout stays dark (503 `checkout_not_live`) until Z7-style verification passes; no crons installed; migrations written but unapplied.
