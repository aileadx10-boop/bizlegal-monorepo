# apps/tracr — tracr.bizlegal-ai.com

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

Forensic wallet trace reports. Bronze ($149) — wallet trace + counterparty graph + 1-year history. Silver ($299) — Bronze + court-ready prose for freezing-order applications.

**Primary surfaces:** `/analyze` (free wallet scan), `/create-order`, `/generate-report`, `/api/digest`, `/api/inbound-lead`, `/api/ops/health`. Dynamic per-wallet checkout via NOWPayments + PayPal (no `NEXT_PUBLIC_*_URL` constants — generated server-side per order).

**Critical envs:** `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `BIZLEGAL_INBOUND_SECRET`, `OPS_DASHBOARD_TOKEN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NOWPAYMENTS_API_KEY`. Optional: PayPal pair, `TRACR_BLOCKSCOUT_API_KEY`, `TRACR_ETHERSCAN_API_KEY`.

**Build:** `pnpm -F @bizlegal/tracr build`. **Vercel project:** `tracr`. **Domain:** `tracr.bizlegal-ai.com`. **Root Directory:** `apps/tracr`.

**Migration notes (Z1.B 2026-05-02):** tree-copy from `C:/Users/Moshe Dor/trcr/` (note: source repo named `trcr`; monorepo dir + npm name align on `tracr`). Standard exclusions.
