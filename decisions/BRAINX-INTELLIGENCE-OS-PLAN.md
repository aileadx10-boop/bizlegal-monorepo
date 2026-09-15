# BRAINX — Intelligence OS Implementation Plan (2026-09-16)

Status: implemented in monorepo main (local, ahead of origin)
Owner: Moses Dor
Stack: Neon Postgres + pgvector (not Supabase), FastAPI Python 3.11, Next.js 14, n8n, Apify, Claude + Gemini, Gmail API, Resend fallback.

## Scope
- New standalone product **BrainX** at `brainx.bizlegal-ai.com`.
- Exactly 5 agents: market, competitor, customer-voice, regulatory, monetization.
- 3 verticals: real_estate, legal_compliance, ai_fintech_regulation.
- Evidence-first: no evidence, no opportunity.
- AEO/GEO/SEO + language-arbitrage wired into opportunity output.

## Neon status
- BrainX uses a **new Neon project** `brainx` (main + preview branches).
- Existing Neon app reference: **OnePath** (`onepath-vert.vercel.app`, `antiguru55.bizlegal-ai.com`) — out of scope for BrainX MVP.
- No Supabase in BrainX.

## Build structure
- `apps/brainx` — Next.js dashboard (server-only Neon via DATABASE_URL).
- `services/highintelligence-api` — FastAPI (signals, snapshots, regulatory, opportunities, alerts).
- `agents/brainx/*` — versioned prompt packages.
- `workflows/n8n/brainx/*` — market, competitor, customer-voice, regulatory, opportunity-engine.
- `packages/scoring` — TS single source of truth (Python mirror in API).
- `packages/gmail-adapter` — Gmail send/receive, Resend fallback.
- `packages/database/neon/migrations/001_brainx_schema.sql` — full Neon DDL.

## Gmail
- Send: Gmail API (OAuth access token) or Resend fallback.
- Receive: `brainx_inbox` Neon table; replies become signals.
- Postmaster Tools + GSC + DMARC are Moses ops.

## Revenue targets
- m0-6: $1-3K MRR (BrainX) + $2-5K one-time.
- m7-12: $3-8K MRR via 5-10 build cycles.
- m13-36: multi-tenant BrainX subscriptions ($99-999/mo).

## Verification (O7)
- Unit: scoring parity (TS + Py), status mapping, dedupe, evidence gate.
- Integration: one market -> >=20 signals; competitor diff; voice precision; regulatory alert; BUILD THIS bundle.
- Manual day-7: 20 opportunities with real evidence.

## Ops needed from Moses
1. Create Neon project `brainx` + store `NEON_DATABASE_URL` in vault/vars.
2. Apply migration `packages/database/neon/migrations/001_brainx_schema.sql`.
3. `gws auth login` to unlock Gmail + GSC + Sheets.
4. Vercel: connect `apps/brainx` -> `brainx.bizlegal-ai.com`; sync env.
5. Cloudflare DNS via `cf-dns-sync.mjs` for `brainx.bizlegal-ai.com`.
