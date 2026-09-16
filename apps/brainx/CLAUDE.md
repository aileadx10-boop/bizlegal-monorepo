# brainx — CLAUDE.md

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md) — vault rule (§4), operating-book discipline (§5), hard rules (§6). This file covers only what is specific to BrainX.

**Purpose:** BrainX (brainx.bizlegal-ai.com) is a weekly, operator-run opportunity radar across three verticals — real estate compliance, legal practice growth, AI/fintech regulation. Every opportunity carries ≥3 independently verified public sources (an evidence vault) and a transparent seven-factor BrainX Decision Score v1 (`@bizlegal/scoring`). Subscribers can request a BUILD THIS brief. Neon Postgres (deliberately not Supabase — `decisions/BRAINX-INTELLIGENCE-OS-PLAN.md`).

**Status (2026-09-16, productization pass):** Rebuilt from the 2026-09-16 scaffold, which had no compiled CSS (raw `@tailwind` directives shipped to prod), a checkout that 404d, no fulfilment, and a public/crawlable dashboard. This pass fixes all four and adds the product surface (sample radar, guides, BUILD THIS, radar profiles). **Not yet deployed** — see §Moses ops below.

## Routes

Public: `/` · `/sample` (indexable) · `/sample/[slug]` (noindex) · `/pricing` · `/guides` · `/guides/[slug]` · `/disclaimer` `/privacy` `/terms` `/contact` · `/robots.txt` `/sitemap.xml` `/llms.txt`.
Gated (noindex, `bx_access` cookie via `lib/access.ts`): `/radar` · `/radar/o/[slug]` · `/radar/briefs` · `/radar/briefs/[id]` · `/radar/profiles`.
Token exchange: `/enter?k=<token>` (outside the `/radar` layout on purpose — Next.js layouts don't receive `searchParams`). Lost-link: `/access`.
API: `/api/checkout/start` · `/api/fulfillment` (hub grant callback, HMAC) · `/api/subscribe` · `/api/access/request` · `/api/build-this/{request,requests}` · `/api/radar/profiles[/[id]]` · `/api/internal/health`.

## Invariants

1. **`next.config.mjs` needs `experimental.outputFileTracingRoot`** pointed at the monorepo root, or the Vercel tracer roots at `apps/brainx`, omits every pnpm-hoisted workspace package, and every API lambda throws `MODULE_NOT_FOUND` on first request — a green build over a dead runtime (the leadforge lesson; sellerradar's `next.config.mjs` is the template). Vercel **Root Directory = `apps/brainx`**.
2. **No Tailwind.** The 2026-09-16 build shipped 56 bytes of raw `@tailwind` text as its only stylesheet because the postcss configs were deleted but Tailwind wasn't. This build uses `app/styles/theme-v2.css` (`--bl-*` tokens, `[data-theme]`-switched) exclusively — do not reintroduce Tailwind without also restoring a working postcss config and verifying the compiled CSS in a real build output, not just a green `next build` exit code.
3. **Email only via `@bizlegal/email`**, `kind: 'transactional'` for `sendAccessLink`/`sendBriefReady`/weekly-radar-to-subscribers (each is the deliverable the tier sells), `kind: 'marketing'` for the free weekly-pick send (double opt-in enforced by the package itself). `lib/gmail.ts` and `packages/gmail-adapter` were deleted 2026-09-16 — they were dead code with no Gmail OAuth token ever in the vault.
4. **Checkout is two rails, not one.** Card (monthly or yearly) → hub `/api/payments/paypal/start` (a real PayPal Subscription; `PAYPAL_PLAN_ID_BRAINX_<TIER>_<INTERVAL>`, 503 naming the env var when unset — never a one-time fallback). Crypto → hub `/api/pay/start`, **yearly only** (`brainx_opportunity_radar_yearly` / `brainx_radar_build_yearly`); monthly + crypto is refused with `recurring_requires_card`. The universal `/api/pay/start` only builds PayPal Orders v2 (one-time) — routing a monthly SKU through it silently bills once and never again (fleet defect A).
5. **Access gates on `active_until`, never on tier or status.** `lib/access.ts::getSubscriber/requireSubscriber` — `status` only excludes `'revoked'`. A `past_due` subscriber keeps access until the paid window actually ends (grace period), matching the fleet's `paid_at`-is-the-gate rule.
6. **No evidence, no opportunity — mechanically enforced twice.** The DB trigger `evidence_gate()` (`packages/database/neon/migrations/001_brainx_schema.sql`) blocks a status transition to `validated`/`build` with < 3 `evidence_links`, but only fires on UPDATE — `tools/ingest-radar.ts` inserts every opportunity as `'watch'` first, then UPDATEs to the computed status so the trigger actually runs. `lib/fixtures/sample.ts` and `tools/ingest-radar.ts` both additionally require every evidence URL to resolve over the network before anything is published.
7. **Score = `@bizlegal/scoring` v1, all seven factors required.** A missing factor is `NaN` (plain arithmetic, not a guarded sum), and `statusFor(NaN)` is `'ignore'` — this is the actual mechanism behind "a dimension the evidence cannot support is scored low, never omitted," not just UI copy. `lib/radar/map.ts` recomputes the total from the factors on every read rather than trusting a stored `opportunity_score`.
8. **Copy says "weekly," never "continuous" or "24/7."** `RunStamp` renders a real `research_runs.finished_at` or "No run yet." `tools/ingest-radar.ts` rejects those words in opportunity prose (`lib/radar/ingest-schema.ts::BANNED_PROSE`).
9. **`packages/llm` is an empty placeholder** and `scripts/audit-shared-stream.mjs` blocks any direct `new Anthropic(...)`/`api.anthropic.com` call outside it. BUILD THIS brief generation and the weekly radar run are both **Claude Code sessions following a written SOP**, not an API call — see `agents/brainx/radar-run/SOP.md` and `agents/brainx/build-this/prompt.md`. Do not add a direct Anthropic client here; when `packages/llm` gets a router, that is the upgrade path.
10. **`services/highintelligence-api` is PARKED**, not deployed — its 5 agent stubs return zeros and `workflows/n8n/brainx/*.json` target an unhosted `BRAINX_API_URL`. See its own CLAUDE.md.
11. **Never name a source directory `build/`.** The root `.gitignore` line 9 ignores `build/` at any depth, so `lib/build/`, `app/components/build/` and `app/api/build/` silently never reached GitHub on 2026-09-16 — local builds were green, Vercel failed with `Module not found`. They are `build-this/` now. `git check-ignore -v <path>` before adding any new top-level folder name.
12. **The vault's `NEON_DATABASE_URL` is NOT BrainX's database.** It points at the OnePath/SinceFiled Neon project (Codex applied `sf_*` migrations there). BrainX's own connection string lives only in the `brainx` Vercel project env (`vercel env pull` from `apps/brainx`) and, once pulled, in the vault as `BRAINX_NEON_DATABASE_URL`. `tools/apply-migration.mjs` reads `NEON_DATABASE_URL` from the environment first for exactly this reason — pass the BrainX one explicitly.

## Envs (names only; values in the canonical vault)

`NEON_DATABASE_URL` (or `DATABASE_URL`) · `BIZLEGAL_INBOUND_SECRET` · `OPS_LOG_URL` · `RESEND_API_KEY` · `RESEND_FROM` · `NEXT_PUBLIC_SUPABASE_URL` · `SUPABASE_SERVICE_KEY` (fleet consent store only — no BrainX product data lives there) · `TURNSTILE_SECRET_KEY` · `NEXT_PUBLIC_TURNSTILE_SITE_KEY` · `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` · `NEXT_PUBLIC_GSC_VERIFICATION` · `NEXT_PUBLIC_BRAINX_SITE_URL`.

Hub-side (not this app, but required for checkout/fulfilment to work): `BRAINX_FULFILL_URL`, `PAYPAL_PLAN_ID_BRAINX_RADAR_MONTHLY`, `PAYPAL_PLAN_ID_BRAINX_RADAR_YEARLY`, `PAYPAL_PLAN_ID_BRAINX_RADAR_BUILD_MONTHLY`, `PAYPAL_PLAN_ID_BRAINX_RADAR_BUILD_YEARLY`.

## Tables (Neon)

`001_brainx_schema.sql`: `markets, sources, research_runs, signals, customer_voices, competitors, competitor_snapshots, detected_changes, regulatory_events, opportunities, opportunity_scores, evidence_links, products, alerts, brainx_inbox, raw_snapshots`.
`002_brainx_subscribers.sql` (2026-09-16): `subscribers, subscription_events, radar_profiles, access_link_requests`, plus columns on `products` (BUILD THIS request/brief lifecycle) and `opportunities`/`signals` (slug, why_now, publisher, url_verified_at, excerpt).

## Operator runbook

Weekly radar: `agents/brainx/radar-run/SOP.md` → `tools/ingest-radar.ts`.
BUILD THIS: `tools/list-requests.ts` → `agents/brainx/build-this/prompt.md` → `tools/ingest-brief.ts`.
Weekly emails: `tools/send-weekly-pick.ts --free` and `--subscribers`.
Fixture evidence: `tools/verify-urls.ts --fixtures` before any deploy touching `lib/fixtures/sample.ts`.

## Known deviation from the approved plan

Guide content (`content/guides/`) lives inside `apps/brainx/` rather than at the monorepo-root `content/brainx/guides/` the plan sketched — kept self-contained so the Vercel file tracer (invariant 1) never has to reach outside the app's own Root Directory for page content.

## Build

```bash
cd apps/brainx
../../node_modules/.bin/tsc --noEmit
pnpm test
VERCEL=1 CI=1 ../../node_modules/.bin/next build
```

Run `node_modules/.bin` binaries directly — pnpm scripts can false-green in this shell (root `CLAUDE.md` §7).

## Moses ops (accumulate, never block) — state as of 2026-09-17

Done by the agent session (2026-09-17): `git push` + merge to `main`, production deploy READY; PayPal product + all 4 plans created on LIVE PayPal (ids in the vault); migration 002 applied to the BrainX Neon DB and the 3 fake seed signals purged (via `tools/with-vercel-env.mjs NEON_DATABASE_URL -- node tools/apply-migration.mjs …`, credential held in memory only); **first radar run ingested** — 3 completed `research_runs`, 5 opportunities, 20 URL-verified signals (`content/brainx/runs/2026-09-17-*.json`), so `RunStamp` and `/api/internal/health.last_run_at` are live.

Blocked for the agent by the auto-mode classifier (secret-store writes) — two copy-paste commands from the repo root; until they run, card checkout fails closed with a 503 naming the plan env, and the access/brief emails have no sender key:

- [ ] Sync env to the `brainx` Vercel project (values come from the vault, never printed):
  ```bash
  node scripts/vercel-env-sync.mjs apps/brainx BIZLEGAL_INBOUND_SECRET RESEND_API_KEY RESEND_FROM NEXT_PUBLIC_SUPABASE_URL SUPABASE_SERVICE_KEY NEXT_PUBLIC_PLAUSIBLE_DOMAIN NEXT_PUBLIC_BRAINX_SITE_URL --target production,preview
  ```
- [ ] Sync the PayPal plan ids to the hub project (the root `.vercel` link = project `bizlegal-ai`), then redeploy the hub:
  ```bash
  node scripts/vercel-env-sync.mjs . PAYPAL_PLAN_ID_BRAINX_RADAR_MONTHLY PAYPAL_PLAN_ID_BRAINX_RADAR_YEARLY PAYPAL_PLAN_ID_BRAINX_RADAR_BUILD_MONTHLY PAYPAL_PLAN_ID_BRAINX_RADAR_BUILD_YEARLY BRAINX_FULFILL_URL --target production
  ```
- [ ] First radar-run session (`agents/brainx/radar-run/SOP.md`) → confirm `RunStamp` goes live
- [ ] $99 monthly test buy → PayPal `BILLING.SUBSCRIPTION.ACTIVATED` → hub `payment.confirmed` → BrainX subscriber row + access email → `/radar` renders; then cancel in PayPal → confirm `subscription.cancelled` reaches BrainX
