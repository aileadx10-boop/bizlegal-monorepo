# apps/leadforge — leadforge.bizlegal-ai.com

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

Lead-generation surface. No paid products currently — pure top-of-funnel.

**Primary surfaces:** `/api/generate-report`, `/api/inbound-lead`, `/api/ops/health`, `/api/digest`.

**Critical envs:** `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `BIZLEGAL_INBOUND_SECRET`, `OPS_DASHBOARD_TOKEN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`. Optional: `NOWPAYMENTS_API_KEY` (if any paid surfaces ship), `APIFY_TOKEN` (lead enrichment).

**Build:** `pnpm -F @bizlegal/leadforge build`. **Vercel project:** `leadforge`. **Domain:** `leadforge.bizlegal-ai.com`. **Root Directory:** `apps/leadforge`.

**Migration notes (Z1.B 2026-05-02):** tree-copy from `C:/Users/Moshe Dor/leadforge-ai/frontend/`. The parent `leadforge-ai/` also has `apify/`, `automation/`, `infrastructure/`, `lib/` siblings — NOT in scope for the apps/ directory. They live in the source repo and should be considered for migration into `services/` and `packages/` later if any are load-bearing. Standard exclusions applied.
