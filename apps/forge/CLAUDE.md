# apps/forge — forge.bizlegal-ai.com

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md). This file documents only what's specific to forge.

The currently-LIVE revenue subdomain. Hosts the BOI Compliance Report ($149), Regulatory Passport ($297), wallet scan ($97), and the gap-page lead magnets.

## Structure

This subtree has its own internal `apps/web/` directory (the Next.js app) plus `infra/`, `modules/`, `scripts/`. Vercel project's "Root Directory" should be set to `apps/forge/apps/web` (not `apps/forge`).

## Primary routes (in `apps/web/app/`)

- `/audit` — free compliance scan (lead magnet)
- `/boi` — BOI Compliance Report ($149 one-time)
- `/passport` — Regulatory Passport ($297 one-time)
- `/scan` — Wallet scan ($97 dynamic)
- `/gap` — gap-page lead magnets (FinCEN BOI gap, AML compliance gap, etc.)
- `/api/payment/*` — payment webhook receivers
- `/api/inbound-lead` — HMAC-verified ingress from EA Worker classifier
- `/api/ops/health` — token-gated env audit (per Z0.3)
- `/api/digest` — product-digest aggregator endpoint

## Critical envs (canonical vault)

`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `BIZLEGAL_INBOUND_SECRET`, `OPS_DASHBOARD_TOKEN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NOWPAYMENTS_API_KEY`, `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET`. Optional: `STRIPE_SECRET_KEY`.

All values in canonical vault. Pre-commit hook blocks new env refs not in the vault.

## Vercel deploy

Project name: `forge`. Domain: `forge.bizlegal-ai.com`. Root Directory: `apps/forge/apps/web` (Moses sets in Vercel UI after first monorepo build verifies).

## Monorepo migration notes (Z1.B, 2026-05-02)

- Subtree-imported from `aileadx10-boop/forge` main (`--squash`).
- `package.json name` → `@bizlegal/forge`.
- Cleanup at import time:
  - Deleted `apps/web/.env.example` — had a live `ANTHROPIC_API_KEY` + `APIFY_TOKEN` hardcoded (NOT a template; actual values).
  - Deleted `out.log` + `files (11).zip` + `files (11)/` — log/upload artifacts.
  - Redacted `FORGE_STATUS.md` (the doc still references rotation-needed keys; values now `[REDACTED]`).
- Forge keeps using its own pre-Z3 `app/api/payment/*` routes for now. Migration to `@bizlegal/payment` is a post-Z7 follow-up; no churn during Phase Z stabilization.

## Invariants (don't break)

1. `app/api/inbound-lead/route.ts` HMAC verification stays as-is — the EA Worker classifier signs leads with `BIZLEGAL_INBOUND_SECRET` and Forge consumes them on this contract.
2. `app/boi/page.tsx` has cross-sell to `/agents/boi-tracker` on the hub. Don't remove without Moses approval — it's the conversion bridge from Forge one-time to BOI Tracker subscription.
3. The Hetzner curator (`services/hetzner/publisher.py`) dual-deploys Forge-affinity content to `apps/web/content/blog/{slug}.mdx` here. Path is hardcoded; see `services/hetzner/CLAUDE.md` `FORGE_CONTENT_PATH_PREFIX`.
