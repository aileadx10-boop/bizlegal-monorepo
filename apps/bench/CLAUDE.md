# apps/bench — bench.bizlegal-ai.com

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md) — hard rules 5 and 7 especially.

Bench — the evaluation lab for legal AI. Measures AI accuracy on legal work against versioned, jurisdiction-specific benchmarks (MiCA-Bench / DPA-Bench / VARA-Bench), expert-verified, sold as flat-fee measurement. Next.js app at `apps/bench/web/` (Vercel Root Directory = `apps/bench/web`), WAT docs at `docs/`.

**Primary surfaces** (`web/app/`): `/` · `/benchmarks[/slug]` · `/methodology` · `/sample` · `/pricing` · `/audit/request` (client intake) · `/experts` (talent funnel) · `/report/[id]?t=` (token-gated) · `/api/checkout/start` (**DARK — 503** until Moses-verified test purchase; flip `CHECKOUT_LIVE`) · `/api/inbound-lead` (HMAC).

**Products:** `bench_audit_2500` ($2,500 one-time) + `bench_managed_monthly` ($5,000/mo) in `@bizlegal/payment`. Dedicated tier = deal room. Delivery economics table in `docs/PLAN.md` gates all pricing copy.

**Data:** `supabase/migrations/20260816_bench_schema.sql` (bench_intake/clients/engagements/experts/expert_applications/evaluations/reports — RLS, service-role only). Benchmark JSONs in `web/data/benchmarks/` are the moat: git-versioned, `reviewed_by: null` until Moses's legal-review gate passes, ≤5 released items per set, the rest held out.

**Rule 7:** acquisition is inbound-only (`/audit/request`, published anonymized research). The only emails sent are transactional acks via `@bizlegal/email`. No scraping, no cold sends, ever.

**Critical envs (names only, values in vault):** `BIZLEGAL_INBOUND_SECRET` · `OPS_LOG_URL` · `NEXT_PUBLIC_SUPABASE_URL` · `SUPABASE_SERVICE_KEY` · `RESEND_API_KEY` · `ANTHROPIC_API_KEY`. Zero new env names.

**Build:** `pnpm -F @bizlegal/bench build` / `typecheck`. Engine check: `node apps/bench/scripts/bench-engine-check.mjs`. Self-audit: `scripts/bench-self-audit.mjs`.

**Status (2026-08-23): Gates 3+5 passed.** Canonical plan: `decisions/BENCH-LEGAL-AI-QUALITY-2026-08-16.md`. Moses gates: legal review complete (2026-08-23), checkout flipped live. Remaining: migration apply, Vercel project + CNAME, self-benchmark run, test purchase.
