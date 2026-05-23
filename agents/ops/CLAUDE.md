# BizLegal Ops Agent System — Autonomous Operations

**Read this file first** before running any ops agent. This is the operating book for the personal agent layer.

---

## What this is

Phase RR shipped the TOOLS: social syndication API, affiliate system, EA agent runner, per-surface dashboards, GSC bot, Plausible Analytics, channel adapters. This directory builds the AGENTS that use those tools autonomously so Moses doesn't have to manually operate the business.

## Agent registry

| Agent | Schedule | Function | Status |
|-------|----------|----------|--------|
| morning-ops | Daily 08:55 UTC | Health check + event digest + Telegram summary | Active |
| revenue-ops | Every 15min | Payment confirm monitoring, stale payment alerts | Active |
| health-ops | Every 60min | Full fleet probe, HMAC verify, auto-fix, escalate | Active |
| pitch-ops | Daily 11:00 UTC | Generate + send 3-5 cold pitches via Gmail | Active |
| content-ops | Daily 09:30 UTC | Publish curator content to blog + syndicate | Active |
| partner-ops | Wed 10:00 UTC | OCI affiliate reconciliation + payout tracking | Active |
| mrr-review | Mon 09:00 UTC | MRR calculation, churn/new subscriber tracking | Active |
| friday-retro | Fri 17:00 UTC | Weekly stats, git log, retro doc generation | Active |
| monthly-scorecard | 1st 10:00 UTC | Revenue aggregates, growth rate, scorecard | Active |

## Shared context

All context files in `context/` are auto-loaded by every agent:
- `canonical-vars.md` — Critical env names, vault location, Vercel team, Supabase ref
- `runbook.md` — Daily/weekly cadence from main runbook
- `revenue.md` — Product tiers, prices, checkout URLs
- `fleet-registry.md` — All subdomains, gateways, services, bots
- `contacts.md` — Outreach targets, escalation contacts

## Tool chain

Each agent uses these tools (in order of preference):
1. **Existing API** — Call live `/api/ops/*`, `/api/payments/*`, etc.
2. **EA runner** — `apps/hub/lib/agents/ea-runner.ts` for Haiku/Sonnet generation tasks
3. **HMAC event log** — POST to `/api/ops/log` for every action taken
4. **Telegram** — Send alerts via `@BizlegalHubBot`
5. **Gmail** — Send escalation emails via Gmail API (MCP)

## Escalation ladder

1. Auto-fix (known failure modes documented in each agent)
2. Telegram alert to Moses (via Hub Bot)
3. Email escalation (if Telegram not acknowledged within 30min)
4. Phone (payment/security only, via PushNotification tool)

## Operating discipline

- Every agent action is logged to `decisions/log.md` with timestamp + outcome
- Every agent MUST check prerequisites before acting (env vars, API reachability)
- If a prerequisite fails, log the gap, don't silently skip
- Moses manual tasks accumulate in `decisions/moses-queue.md`

## Phase RR dependencies

This agent system depends on Phase RR infrastructure shipped on `main`:
- `apps/hub/lib/social/syndicate.ts` — Social draft generation
- `apps/hub/lib/social/channels.ts` — Channel posting adapters
- `apps/hub/app/api/content/syndicate/route.ts` — HMAC-gated syndication API
- `apps/hub/app/api/agents/run/route.ts` — EA agent runner
- `apps/hub/app/affiliates/` — Affiliate program (signup, track, dashboard)
- `apps/hub/lib/agents/ea-runner.ts` — Haiku/Sonnet task execution
- `services/gsc-bot/` — Weekly GSC sitemap resubmission
