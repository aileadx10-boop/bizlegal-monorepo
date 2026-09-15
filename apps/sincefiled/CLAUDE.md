# apps/sincefiled — sincefiled.bizlegal-ai.com

O-026 SinceFiled: an anti-streak "days since" compliance tracker for law firms (trust reconciliation, CLE, renewals, filings) — shows days since the last event and a deterministic predicted-due date (`lib/predict.ts`, no LLM, no jurisdiction lookup). Free tier is ≤3 obligations (`lib/paywall.ts`); draft migration only, no Vercel project yet. Products: `sf_firm_49` ($49/mo), `sf_lifetime_329` ($329 one-time), `sf_pack_us_19` / `sf_pack_both_29` (PDF packs, `packs/index.json`, each gated by its own `reviewed` flag). Checkout routes through the hub's `/api/pay/start`; `DEMO_MODE=1` simulates via `/api/pay/simulate/redirect`.

## Envs
`NEXT_PUBLIC_HUB_URL` · `DEMO_MODE` · `NEXT_PUBLIC_SUPABASE_URL` · `SUPABASE_SERVICE_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `BIZLEGAL_INBOUND_SECRET`

## Run / Deploy
`pnpm --filter @bizlegal/sincefiled dev`; `scripts/local-e2e.ts` runs a local proof without live env. Vercel project, Root Directory `apps/sincefiled`, domain `sincefiled.bizlegal-ai.com` (not yet created).

## Rules
Prediction is an estimate, not a legal deadline — every result carries "verify against jurisdiction rules. Not legal advice." Packs stay `reviewed: false` (hidden) until a practitioner signs off.

## See
`decisions/SINCEFILED-PLAN-2026-09-15.md`
