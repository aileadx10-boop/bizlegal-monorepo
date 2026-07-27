# apps/propsignal — propsignal.bizlegal-ai.com

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

PropSignal workspace — property risk intelligence from FREE public data. The Next.js app lives at `apps/propsignal/web/` (so Vercel project Root Directory = `apps/propsignal/web`). Plus `docs/` sibling with the WAT plan and workflow SOPs.

**Primary surfaces** (in `web/app/`): `/` (landing), `/report/[id]` (report viewer stub), `/api/report/start` (checkout stub — dark), `/api/inbound-lead` (HMAC-verified lead ingress).

**Pricing:** $49 per report one-time (product `propsignal_report_49` in `@bizlegal/payment`). Planned subs: Investor $149/mo, Pro/Team $299/mo.

**Critical envs (names only, all values in canonical vault):** `BIZLEGAL_INBOUND_SECRET`, `OPS_LOG_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `PERPLEXITY_API_KEY`, `RESEND_API_KEY`.

**Data policy:** FREE sources only — FEMA NFHL, EPA EJScreen/Envirofacts, Socrata open data, Perplexity research (cached, ≤$30/mo). NO paid county/CoStar feeds; trio-wide infra cap is $200/mo.

**Build:** `pnpm -F @bizlegal/propsignal build` (from monorepo root). **Vercel project:** `propsignal` (not yet created). **Domain:** `propsignal.bizlegal-ai.com`. **Root Directory:** `apps/propsignal/web`.

**Status (2026-07-28): SCAFFOLD ONLY.** Checkout stays dark (503 `checkout_not_live`) until Z7-style verification passes. Canonical plan: `decisions/TRIO-PROPSIGNAL-LEASEPARSE-CLOSEFLOW-2026-07-28.md` + `docs/PLAN.md`. Build order: phase 3 of the trio (after CloseFlow + LeaseParse).
