# apps/hub — bizlegal-ai.com

> **First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).** That file holds the WAT framework, HMAC chain, vault rules, and Phase Z hard rules. This file only documents what's specific to the hub app.

The brain. Hosts /agents, /ops, /api/pay/start, every cron, the realestate-intake → OCI proxy, and the canonical `/api/ops/log` HMAC verifier.

## Primary routes

- `/` — landing
- `/agents` — fleet metadata + 12 agent cards
- `/agents/{boi-tracker, ai-act, policy-refresh, …}` — per-agent landings
- `/ops?t=$OPS_DASHBOARD_TOKEN` — live dashboard
- `/ops/snapshot?t=$OPS_DASHBOARD_TOKEN` — flat server-rendered business snapshot (real revenue / real customers / human-vs-machine traffic / errors). The "am I blind?" page.
- `/ops/health?t=$OPS_DASHBOARD_TOKEN` — chain audit (HMAC self-loop + subdomain probes + env matrix)
- `/api/ops/log` — HMAC-verified ingress for events from Worker/Curator/OCI/subdomains
- `/api/ops/feed` — events tape, summary aggregates, referrals pipeline
- `/api/ops/health` — env audit (token-gated)
- `/api/cron/*` — billing/charge-due, boi/check, ops-alerts, smoke, ai-act-monitor, policy-refresh
- `/api/pay/start` — universal checkout entry (Z3 — replaces all NEXT_PUBLIC_*_URL)
- `/api/realestate-intake` — proxies to OCI router with HMAC + ops events
- `/api/{tracr,brai}/*` — product proxies

## Critical envs (per `decisions/PARAMETERS_RUNBOOK.md` Section 2.1)

`BIZLEGAL_INBOUND_SECRET` · `OPS_DASHBOARD_TOKEN` · `CRON_SECRET` · `NEXT_PUBLIC_SUPABASE_URL` · `SUPABASE_SERVICE_KEY` · `ANTHROPIC_API_KEY` · `RESEND_API_KEY` · `FIRECRAWL_API_KEY` · `NOWPAYMENTS_API_KEY` · `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` · post-Z3: `LEMONSQUEEZY_API_KEY`, `PADDLE_API_KEY` (already in vault — code falls back to 503 stub if absent) · `TELEGRAM_BOT_TOKEN` (= `BIZLEGALBOT_TOKEN` value) · `TELEGRAM_CHAT_ID` · `OCI_ROUTER_URL` · `LEXAUDIT_MONITOR_URL`.

All values in canonical vault. Pre-commit hook (`scripts/audit-vault.mjs`) blocks new env refs not in the vault.

## Build + deploy

```bash
pnpm -F @bizlegal/hub build       # next build
pnpm -F @bizlegal/hub typecheck   # tsc --noEmit (strict)
```

Vercel project: `bizlegal-ai` · Domain: `bizlegal-ai.com` (apex) · Root Directory: `apps/hub` (Moses sets in Vercel UI after first monorepo build verifies).

## Invariants (do not break)

1. `app/api/ops/log/route.ts` `ALLOWED_TYPES` Set must stay in sync with `@bizlegal/ops-log` `OpsEventType` union. The audit-vault hook does NOT enforce this — it's manual discipline.
2. `app/agents/page.tsx` is the single source of truth for fleet metadata. `agents/AGENTS.md` mirrors for documentation.
3. `app/api/realestate-intake/route.ts` is on `nodejs` runtime (not edge) so `logEventAsync` works with Supabase service-role client.
4. Every Vercel cron in `vercel.json` requires `CRON_SECRET` Bearer header — don't remove a cron without removing the route.
5. Hub is the ONLY surface that holds the Supabase service-role key for `ops_events`. Subdomains never write to `ops_events` directly — they POST through `/api/ops/log` HMAC.

## Monorepo migration notes (Z1.B, 2026-05-01)

- Subtree-imported from `aileadx10-boop/bizlegal-ai` main (`--squash` for monorepo size; full history preserved in source repo).
- `decisions/` lifted to monorepo root (single canonical location).
- `package.json name` → `@bizlegal/hub`; `@bizlegal/ops-log` added as workspace dependency.
- `lib/ops/log.ts` will be deleted in a follow-up commit (replaced by `import { logEventAsync } from '@bizlegal/ops-log'`).
- Existing `lib/firecrawl/scrape.ts` will move to `packages/firecrawl/` in a follow-up.
- `app/components/ui-v2/*` will move to `packages/ui-v2/` in a follow-up.

## Inherited build system (preserved from prior phases)

The original 292-line `CLAUDE.md` covering "WAT permanent build system" is folded into the monorepo root CLAUDE.md. Hub-specific WAT specs (lead intake → product routing → payment → email → ops_event lineage) live in `decisions/MASTER_FUNNEL.md` and `app/agents/page.tsx`.
