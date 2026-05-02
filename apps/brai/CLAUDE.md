# apps/brai — brai.bizlegal-ai.com

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

Blockchain Regulatory AI. Free risk preview + paid full report ($49 one-time).

**Primary surfaces:** `/api/leads` (risk-preview email gate), `/api/invoice` (full-report checkout), `/api/webhook` (NOWPayments confirm), `/api/inbound-lead`, `/api/ops/health`, `/api/digest`.

**Critical envs:** `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `BIZLEGAL_INBOUND_SECRET`, `OPS_DASHBOARD_TOKEN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NOWPAYMENTS_API_KEY`. Optional: `CHAINALYSIS_API_KEY`, `OFAC_SDN_FEED_URL`, PayPal pair.

**Build:** `pnpm -F @bizlegal/brai build`. **Vercel project:** `brai`. **Domain:** `brai.bizlegal-ai.com`. **Root Directory:** `apps/brai`.

**Migration notes (Z1.B 2026-05-02):** tree-copy from `C:/Users/Moshe Dor/BRAI/frontend-next/` (only the frontend-next subdir was Vercel-deployed; the parent BRAI/ also had python/api/ folders that are NOT in scope). Standard exclusions.
