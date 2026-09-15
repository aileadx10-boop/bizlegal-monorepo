# apps/casepage — casepage.bizlegal-ai.com

O-025 CasePage: client-facing matter-status pages for law firms (a legal-industry copycat of the "love page" builder pattern) — milestones, timeline, doc checklist, next-hearing countdown. Week-1 scaffold: waitlist form, pricing page, pages CRUD API, and demo checkout are live locally; only the waitlist migration exists; no Vercel project yet, so the domain does not resolve. Products (`packages/payment/src/products.ts`): `cp_solo_49` ($49/mo), `cp_firm_149` ($149/mo), `cp_setup_490` ($490 one-time). Checkout always routes through the hub's `/api/pay/start`, never a gateway directly; `DEMO_MODE=1` simulates.

## Envs
`NEXT_PUBLIC_HUB_URL` · `DEMO_MODE` · `NEXT_PUBLIC_SUPABASE_URL` · `SUPABASE_SERVICE_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `BIZLEGAL_INBOUND_SECRET`

## Run / Deploy
`pnpm --filter @bizlegal/casepage dev`. Vercel project, Root Directory `apps/casepage`, domain `casepage.bizlegal-ai.com` (not yet created).

## Rules
Decision-support only — never legal advice, no outcome guarantees. No new payment gateway constants; checkout stays on the hub path.

## See
`decisions/LOVEPAGE-COPYCAT-CASEPAGE-PLAN-2026-09-14.md`
