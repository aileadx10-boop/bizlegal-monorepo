# Decision — Canonical funnel is DocAI (`apps/docai/web/`)

**Date:** 2026-05-24
**Status:** Affirmed by Moses

## TL;DR

The contract-risk funnel ($97 scan → preview → paywall → paid full report) lives at `apps/docai/web/`. It has been live on Vercel since 2026-05-23 with NOWPayments crypto checkout active. Do not build parallel funnel apps.

## Why this doc exists

Earlier today an attempt was made to migrate `services/funnel-mvp/` (Fastify, never deployed) to `apps/funnel-mvp/` (Next.js + Supabase + PayPal). The migration was technically clean but **functionally duplicative** — DocAI already implemented the same funnel under a different name. Same upload, same extraction, same paywall, same payment gateway, same unlock.

Commit `ae6d6fe` (apps/funnel-mvp creation) was reverted same-day. The Supabase `funnel_jobs` table created during that work was dropped (0 rows lost). DocAI's `contract_scans` + `payment_orders` remain the canonical schema.

## Canonical surface map

| Surface | Lives at | Status |
|---|---|---|
| Free contract scan + report preview | `apps/docai/web/` — production alias `web-eight-blue-44.vercel.app` | LIVE |
| $97 crypto payment | DocAI `/api/payment/checkout` (NOWPayments) | LIVE |
| $97 PayPal payment | DocAI `/api/payment/paypal/checkout` + `/return` | GATED — `NEXT_PUBLIC_PAYPAL_SCAN_ENABLED=false` until 401 OAuth fixed |
| Scan unlock | `contract_scans.paid=true` (DocAI Supabase tables) | LIVE |
| Dashboard probe | `/ops/subdomains` shows `docai` row | LIVE |

## What `services/funnel-mvp/` (Fastify) is for

Nothing operational. The directory is kept as a git-history tombstone with reference value (original Ollama prompt, Notion delivery pattern). Its CLAUDE.md was rewritten today to explicitly redirect future work to `apps/docai/web/`.

## Eventual deletion path

Post-Phase-RR-2 cleanup after Moses confirms DocAI sustained 30 days of real revenue:

1. Delete `services/funnel-mvp/` directory
2. Remove the line from root `CLAUDE.md`
3. No other refactoring needed (`pnpm-workspace.yaml` uses `services/*` glob; nothing to remove explicitly)

## References

- `decisions/DOCAI_FUNNEL_COMPLETION_REPORT_2026-05-16.md` — proves DocAI absorbed the funnel function (May 16)
- `decisions/LOW_RISK_DOCAI_FUNNEL.md` — original migration plan
- `apps/docai/web/SUPABASE_DOCAI_FUNNEL_SCHEMA.sql` — canonical schema (contract_scans + leads + payment_orders)
- `services/funnel-mvp/CLAUDE.md` — tombstone redirect (rewritten today)
- Git: `git revert ae6d6fe` — same-day duplication rollback
