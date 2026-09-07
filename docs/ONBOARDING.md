# Onboarding — new developer / new agent

Read root `AGENTS.md` first (it auto-loads standing orders O1–O7). Then this. Then `agents/AGENTS.md` (the fleet index) and `docs/MONEY_LOOP_RUNBOOK.md` before touching anything payment-related.

## Monorepo layout

```
bizlegal-monorepo/
├── apps/            Next.js apps — one Vercel project each (hub, tracr, docai/web, forge,
│                    lexaudit, falseecho, sellerradar, bench/web, brai, coguard, dealdesk,
│                    leadforge, leaseparse/web, propsignal/web, closeflow/web, caseaudit, funnel-mvp)
├── packages/        Shared workspace packages (@bizlegal/*)
├── services/        Python agents (Hetzner), Cloudflare workers, misc services
├── content/         Blog MDX + content kits
├── decisions/       Decision log + ops runbooks (SKILLS-BOOK, DAILY-WEEKLY-OPS-RUNBOOK)
├── docs/            Status reports + the runbooks (this file, MONEY_LOOP_*, DEPLOYMENT, MOSES-HANDOFF)
├── agents/          Fleet index (AGENTS.md), standing orders, agent prompts
└── scripts/         Repo-level tooling (audit-vault, daily-status-review, smoke checks)
```

Package manager: **pnpm 9.12.3** (corepack), workspaces glob `apps/*`, `apps/*/web`, `apps/*/apps/web`, `services/*`, `packages/*`. Build orchestration: turbo.

## Shared fleet patterns (learn these once, they repeat everywhere)

- **Server-side pricing** — `lib/tiers.ts` per app (tracr/falseecho/sellerradar) or hub's `lib/payments/price-map.ts` + `packages/payment/src/products.ts` registry. Prices are resolved server-side from (product, tier, interval); client-supplied amounts are ignored (F2 fix). Never read a price from a query param.
- **Capture-on-return** — PayPal orders are `intent=CAPTURE`; money moves only when the return route captures (`apps/hub/app/payment/paypal/return/route.ts` for hub, `apps/docai/web/app/api/payment/paypal/return/route.ts` is the reference). `PAYMENT.CAPTURE.COMPLETED` is the only paid event. See `docs/MONEY_LOOP_RUNBOOK.md`.
- **NOWPayments IPN** — HMAC-SHA512 over sorted JSON body, idempotency-claimed per (payment_id, payment_status). Product apps must have `NOWPAYMENTS_IPN_SECRET` set — they fail open without it.
- **nurture-enqueue** — `packages/nurture-enqueue` queues post-purchase nurture sequences; `cross-sell.ts` holds the `crossSellFor()` map that powers "Also from the fleet" blocks on success pages.
- **ops log** — every meaningful event goes through `logEventAsync` (`packages/ops-log`) into `ops_events`: `payment.intent/confirmed/failed`, `lead.*`, `cron.*`, `error`, … Ops dashboards read it. Telemetry never throws.
- **Ops dashboards** — `apps/hub/app/ops/*`, token-gated by `OPS_DASHBOARD_TOKEN` with a timing-safe compare, bare-404 on mismatch, `force-dynamic`, lazy Supabase client, graceful empty state when tables/env are missing. Copy `ops/content/page.tsx` or `ops/metrics/page.tsx`.
- **Liability voice** — every feature pairs a revenue lever with a liability shrinker: no outcome guarantees, citations, scope limits, named human reviewer for high-stakes copy. Disclaimers live in `apps/hub/lib/legal/` (disclaimer.ts, shield-clauses.ts). Match that tone in anything user-facing.

## Gotchas (Windows dev box, learned the hard way)

- **`pnpm --filter <app> build` silently no-ops** on this machine. Build apps directly:
  `cd apps/hub && node node_modules/next/dist/bin/next build`
- **Typecheck per app** with the workspace-local compiler: `cd apps/hub && node_modules/.bin/tsc --noEmit` (or `pnpm exec tsc --noEmit`). Don't trust a root-level tsc run to cover apps.
- **Corrupted `.pnpm` store**: if installs fail with integrity/ENOENT errors inside `node_modules/.pnpm`, repair with `pnpm store prune` then delete the app's `node_modules` and reinstall. If a single package entry is corrupted, delete just that entry under `node_modules/.pnpm/` and re-run `pnpm install`.
- **`lefthook prepare` hangs** on fresh installs (the `prepare` script is `lefthook install || true`). Use `pnpm install --ignore-scripts` when it stalls; hooks aren't needed for builds.
- **TS2882 quirk**: transient `TS2882`-style errors can appear on files whose mtime/content the TS server cached before a foreign edit — if an error makes no sense for the code you're looking at, re-read the file from disk (a clean `tsc --noEmit` is ground truth; editor diagnostics can lie).
- **Uncommitted foreign sessions**: this repo is often worked by parallel agent sessions. Check `git status` before assuming a file's state; never revert or "fix" changes you didn't make — report them as pre-existing instead.

## Verify before claiming done (O7)

1. `tsc --noEmit` in every app you touched.
2. Real `next build` via the direct binary path above.
3. If you changed payment code: trace both webhooks + the return route by hand; no live test purchase without explicit authorization.
