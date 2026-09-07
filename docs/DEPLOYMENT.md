# Deployment

How each piece of the BizLegal fleet ships. Last verified 2026-09-06 on `feat/revenue-marathon`.

## Topology

| Surface | Host | Source |
|---|---|---|
| Next.js apps (`apps/*`) | Vercel, one project per app | this monorepo |
| Python agents + SEO pipeline | Hetzner CX33 (`root@204.168.209.235`) | `services/agents/`, curator repo on the box |
| Cloudflare Workers | Cloudflare | `services/worker/`, `services/telegram-hub/`, `services/gsc-bot/` |
| Database | Supabase (shared project) | migrations under each app |

## Vercel app pattern

Every app is its own Vercel project with **root directory set to the app dir** (e.g. `apps/hub`, `apps/tracr`, `apps/docai/web`). The per-app `vercel.json` pins the monorepo build:

```json
{
  "framework": "nextjs",
  "installCommand": "corepack enable && cd ../.. && corepack pnpm install --frozen-lockfile=false --ignore-scripts",
  "buildCommand": "cd ../.. && corepack pnpm turbo build --filter=@bizlegal/<app>..."
}
```

Notes:

- `cd ../..` back to repo root, then a **turbo filtered build** (`--filter=@bizlegal/<app>...` — trailing `...` includes workspace dependencies). Some apps (`hub`) omit the `cd` in installCommand because their project root is already configured accordingly — copy the pattern of the nearest existing app.
- `--ignore-scripts` skips `prepare` (lefthook) on Vercel — lefthook has no place in CI and hangs without a git checkout context.
- `functions` map sets `maxDuration` per API route (payment/capture routes: 30–60s; scan/cron routes: up to 300s).
- `crons` array declares Vercel crons. Hub's are in `apps/hub/vercel.json` (billing, ops-alerts every 15min, smoke, content, agents — full index in `agents/AGENTS.md` §Vercel Hub Crons). Product app crons: falseecho `/api/cron/monitor` daily 06:00 UTC, sellerradar `/api/cron/monitor` Mon 06:00 UTC. Cron handlers authorize on `CRON_SECRET`.
- Push to the production branch = auto deploy. No manual deploy step; `scripts/deploy-docai-vercel.ps1` exists for docai env-sync/manual redeploys.

## Env var groups

The canonical name inventory is the env vault (path in `scripts/audit-vault.mjs`); `pnpm audit:vault` flags names referenced in code but missing from the vault. Groups:

- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) — every app + every ops dashboard.
- **PayPal:** `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV` (`live`/`sandbox`), `PAYPAL_WEBHOOK_ID` (hub fails closed without it), `PAYPAL_PLAN_ID_<PRODUCT>_<TIER>_<INTERVAL>` per subscription combo (missing = that CTA 503s).
- **NOWPayments:** `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET` (product apps fail open without the secret — set it everywhere).
- **Email:** `RESEND_API_KEY` (+ `RESEND_AUDIENCE_ID` for newsletter).
- **Ops:** `OPS_DASHBOARD_TOKEN` (gates `/ops/*` pages), `CRON_SECRET`, `INTERNAL_SECRET`/`BIZLEGAL_INBOUND_SECRET` (cross-app dispatch).
- **Content engine:** `MARKETING_TRIGGER_URL`, Trigger.dev keys.
- **Wire payments (hub):** `BANK_EUR_*` / `BANK_USD_*` (12 vars).

Env lives in each Vercel project individually — vault presence ≠ Vercel presence. Verify both.

## Adding a new app to the fleet

1. Scaffold under `apps/<name>/` (or `apps/<name>/web/` if it will have sibling sub-apps). pnpm-workspace already globs `apps/*`, `apps/*/web`, `apps/*/apps/web` — no root config change needed.
2. Package name `@bizlegal/<name>` in `package.json`; add `vercel.json` copying the nearest app's (install/build commands, `functions`, `crons`, security headers).
3. Vercel: new project, root dir `apps/<name>`, connect the monorepo, set the env group above as needed.
4. DNS: subdomain in Cloudflare → Vercel.
5. Payments: register SKUs in `apps/hub/lib/payments/price-map.ts` (and `packages/payment/src/products.ts` if registry-priced), add a grant helper in `apps/hub/lib/payments/<name>-grant.ts`, wire it into **both** webhooks (`paypal/webhook/route.ts`, `nowpayments/webhook/route.ts`), and give the confirmation email a truthful per-product copy block in `apps/hub/lib/resend.ts`.
6. Ops: add crons/agents to `agents/AGENTS.md` (standing order O6), add the app to `/ops/smoke` checks.
7. Fulfillment must exist **before** paid CTAs go live (F4 lesson: hub-routed sales with no fulfillment = money taken for an email).

## Windows local-build gotchas

Covered in detail in `docs/ONBOARDING.md`. Short version: `pnpm --filter build` no-ops on this Windows box — build apps with `node node_modules/next/dist/bin/next build` from the app dir; verify with `node_modules/.bin/tsc --noEmit` (or `pnpm exec tsc --noEmit`) per app.
