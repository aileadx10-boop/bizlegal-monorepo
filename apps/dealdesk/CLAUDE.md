# apps/dealdesk — dealdesk.bizlegal-ai.com

> **First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).** This file only documents what is specific to DealDesk.

One app, two hands, one login. **DocParse** (lease abstracting) and **CloseFlow** (closing checklists + deadline engine) over a single shared property spine, so cross-sell is a DB join rather than a cross-domain hop.

Supersedes `apps/leaseparse` and `apps/closeflow`, whose real engine code was ported here verbatim. Those two dirs are retired once this app builds and deploys.

## Status — NOT DEPLOYED (2026-07-30)

No Vercel project, no domain, checkout dark. Root hard rule #5 still applies: no real money until the path is verified end to end.

**Built for Moses as the first user**, not for strangers. Every hour it saves on a paid engagement pays for itself immediately; self-serve opens only once traffic exists.

## Primary surfaces (planned)

- `/` — landing (`LandingV2` from `@bizlegal/themes`)
- `/dashboard` — both hands in one view; `/dashboard/{properties,leases,closings}/[id]`
- `/api/leases/upload-url` — signed Supabase Storage upload URL. **Required**: Vercel caps request bodies at 4.5 MB, so a lease PDF cannot be POSTed through a route handler
- `/api/leases/ingest` — `runtime='nodejs'`, long `maxDuration`: `pdf-parse` → Claude → validate → persist
- `/api/closings` — create transaction → `generateChecklist` → `deriveDeadlines`
- `/api/inbound-lead` — **live**, HMAC-verified (accepts `dealdesk`, `leaseparse`, `closeflow` classifications)

## Ported engines (do not rewrite)

- `lib/closing/date-calculator.ts` — `addBusinessDays` (UTC), `deriveDeadlines`, `DEADLINE_SPECS` × 4 transaction types
- `lib/closing/checklist-templates.ts` — 44 tasks × 4 types. `applyJurisdictionOverrides` is a deliberate pass-through; do not fake jurisdiction coverage
- `lib/extract/{types,date-engine,hermes-first,claude-fallback}.ts` — `LeaseAbstract` contract, `deriveCriticalDates` (90/60/30/7 tiers + notice windows), `EXTRACTION_PROMPT`, `scoreConfidence`

## Invariants

1. **1031 deadlines are hard calendar days.** The 45/180-day dates carry no weekend or holiday extension. Never route them through `addBusinessDays`. Getting them wrong destroys a client's tax deferral.
2. **`scoreConfidence` is a quality gate, not a cost router.** It is a deterministic 8-field completeness fraction, so the 0.85 floor means "at most one missing field". Below the floor, flag for review — never deliver silently.
3. **Claude-only extraction.** ~$0.12/lease on Sonnet, ~$0.02 on Haiku. Hermes/Ollama is deferred: it saves ~$12/mo at the cost of a tunnel and a model mismatch (Hetzner runs `mistral-nemo`, the prompt file defaults to `hermes3`).
4. **Artifacts are private.** Lease PDFs are confidential, often NDA-bound third-party documents. Use a private bucket plus short-TTL signed URLs — never `getPublicUrl`, which is the (wrong) repo-wide default.
5. **No advice framing.** `risk_flags` render as "clauses to review with your counsel", quoting the clause. Never a conclusion — Moses is bar-admitted and the liability attaches to him.
6. **No success-based referral fees.** Title/lender/notary per-closing fees run into RESPA §8; per-lead attorney referrals run into ABA Model Rules 5.4/7.2. Removed by decision, not by disclaimer.
7. Money path is the apex `/checkout` → `/api/payments/{nowpayments,paypal,wire}/start`. **Never** `/api/pay/start` (disabled 2026-07-30 — it wrote no `payment_orders` row).
8. `lib/ops/log.ts` is a local HMAC wrapper. `'dealdesk'` must stay present in **both** `packages/ops-log/src/index.ts` and `ALLOWED_SOURCES` in `apps/hub/app/api/ops/log/route.ts`. No new event types.

## Envs (names only — values in the canonical vault)

`BIZLEGAL_INBOUND_SECRET` · `OPS_LOG_URL` · `NEXT_PUBLIC_SUPABASE_URL` · `SUPABASE_SERVICE_KEY` · `ANTHROPIC_API_KEY` · `RESEND_API_KEY`

## Build + deploy

```bash
pnpm -F @bizlegal/dealdesk typecheck
pnpm -F @bizlegal/dealdesk build
```

Vercel **Root Directory = `apps/dealdesk/web`**. Leaving it unset is what broke leadforge for a month.

## Tables (prefix `dd_`, migrations written not applied)

`dd_properties` (spine, apply first) · `dd_leases` · `dd_transactions` · `dd_alerts` · `dd_cost_log`

`user_id` is **nullable** with an `email` fallback so anonymous checkout works before an account exists; a login backfills it.
