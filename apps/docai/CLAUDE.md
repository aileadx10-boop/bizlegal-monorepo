# apps/docai — docai.bizlegal-ai.com

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

DocAI workspace. The Next.js app lives at `apps/docai/web/` (so Vercel project Root Directory = `apps/docai/web`). Plus shared `lib/`, `infrastructure/`, `supabase/`, `brand-assets/` siblings.

**Primary surfaces** (in `web/app/`): `/sqa` (SOC 2 Questionnaire Assistant), `/dpa` (DPA Negotiator), `/pricing`, `/api/digest`, `/api/inbound-lead`, `/api/ops/health`, KB upload routes for the Firm tier.

**Pricing:** Team $69/mo (50 SQA drafts + DPA Negotiator + 5 seats), Firm $199/mo (Team + Firm-tier KB + dedicated reviewer).

**Critical envs:** `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `BIZLEGAL_INBOUND_SECRET`, `OPS_DASHBOARD_TOKEN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NOWPAYMENTS_API_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`. Optional: `OPENAI_EMBEDDING_KEY` (Firm KB embeddings).

**Build:** `pnpm -F @bizlegal/docai build` (from monorepo root). **Vercel project:** `docai`. **Domain:** `docai.bizlegal-ai.com`. **Root Directory:** `apps/docai/web`.

**Migration notes (Z1.B 2026-05-02):** tree-copy from `C:/Users/Moshe Dor/docai-monorepo/`. node_modules + .next + .git + .vercel excluded. package name → `@bizlegal/docai`. Source repo `aileadx10-boop/docai-monorepo` stays live until Z7+7d archive.
