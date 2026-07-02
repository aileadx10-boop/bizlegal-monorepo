# BIZLEGAL PLATFORM BUILD — 2026-07-02

**Status:** DRAFT (awaiting Moses approval)
**Owner:** Hermes (autonomous session) → Moses
**Mission:** turn BizLegal AI from "8 disconnected surfaces + cron-driven scripts" into a unified platform where the founder and any agent can **see every process**, **call every surface through one OpenAPI**, **feed signal from the browser**, **debug live**, and **crawl/spy/hunt at scale**.

## The 5 builds (in order of leverage)

### 1. LIVE PROCESS INSPECTION
**Why:** Right now Moses has no way to know which crawler is running, which lead-nurture stage is stuck, or which pipeline ate the cron log. The 36 cron jobs + 3 curator systemd services + 6 Vercel surfaces are all black boxes.

**What ships:**
- **`/api/ops/heartbeat`** on hub — every Python service + CF Worker pings this every 60s with `{service, version, pid, hostname, last_action, last_action_status, queue_depth}`. Stored in `agent_heartbeats` Supabase table (new).
- **`/api/ops/live`** (operator dashboard) — token-gated like `/ops/health`, returns the last heartbeat from every service + a 24h uptime grid + alerts for services that didn't ping in >5 min.
- **`/api/ops/process-tree`** — list of all known processes with parent/child relationships, started_at, command, hostname, env, current action.
- **Telegram auto-alert** if a service goes >15 min silent (uses existing `telegram_heartbeat.py` pattern).
- **Operator UI** at `https://bizlegal-ai.com/ops/live` — a single dark-themed HTML page (Next.js route, but rendered as a self-contained SPA) showing every process in real time. Refreshes every 5s via Server-Sent Events (SSE) from `/api/ops/live/stream`.

**Effort:** 1 day
**Files:**
- `apps/hub/app/api/ops/heartbeat/route.ts` (new) — POST endpoint, writes to Supabase
- `apps/hub/app/api/ops/live/route.ts` (new) — GET, returns current state
- `apps/hub/app/api/ops/live/stream/route.ts` (new) — SSE stream
- `apps/hub/app/api/ops/process-tree/route.ts` (new)
- `apps/hub/app/ops/live/page.tsx` (new) — operator UI
- `apps/hub/supabase/migrations/20260702_agent_heartbeats.sql` (new)
- `packages/ops-heartbeat/` (new) — shared TS + Python client (1s import, posts every 60s)
- `services/seo-agents/heartbeat_runner.py` (new) — wraps every existing crawler, posts heartbeats automatically
- Updates to: `scout.py`, `bot.py`, `publisher.py`, `headhunter.py`, `cold_email_sender.py`, `lead_nurture.py`, `oci_deal_closer.py`, `seo_watchdog.py`, `daily_autonomous_seo.py`, `crawlers/*.py` (12 files) — 3-line change: import heartbeat, call it before each major step

### 2. STANDARDIZED OPENAPI-BASED API
**Why:** There are 36 API route folders but no single spec. Every subagent has to read source code to know what's callable. The browser extension (#3) needs a typed contract. The debugger (#4) needs a list of tool invocations to replay.

**What ships:**
- **`/api/openapi.json`** — auto-generated from Zod schemas we already have in `apps/hub/lib/**` (audit them, lift types, generate). Includes all 36 hubs + 7 subdomains' public routes. Versioned (`openapi.v3.1.json`).
- **`/api/docs`** — Swagger UI embedded, token-gated. `https://bizlegal-ai.com/api/docs`
- **`@bizlegal/api-client`** (new package) — typed TS + Python client, generated from the spec via `openapi-typescript` + `openapi-python-client`. Use everywhere instead of hand-rolled `urllib.request` calls.
- **`x-bizlegal-surface` header** on every response — declares which surface handled the call (`hub`, `docai`, `tracr`, `brai`, `lexaudit`, `leadforge`, `forge`, `worker`, `hetzner`, `oci`). Operator's first debugging signal.
- **`x-bizlegal-trace-id`** on every request/response — every call gets a UUID; logged in `agent_runs`; available in the process inspector (#1).
- **Conformance tests** — `tests/openapi-conformance.test.ts` ensures every route returns what the spec says, runs in CI.

**Effort:** 2 days
**Files:**
- `apps/hub/app/api/openapi.json/route.ts` (new) — serves the spec
- `apps/hub/app/api/docs/page.tsx` (new) — Swagger UI
- `apps/hub/lib/openapi/registry.ts` (new) — collects schemas
- `packages/api-client/` (new) — generated clients
- `scripts/generate-openapi.ts` (new) — runs at build time
- Updates: every existing `route.ts` (36 files) to register its schema in the registry

### 3. BROWSER EXTENSION (feeds data back to agents)
**Why:** The current hunter/scraper can only see what's on the public web. Real buyers signal intent inside their browser: they're logged into LinkedIn, looking at competitor dashboards, comparing tools in private tabs. The extension captures the public surface, the private context, and pushes it back to `leadforge_leads` so any agent can act on it.

**What ships:**
- **Manifest V3 Chrome + Firefox extension** at `services/browser-extension/`
- **Popup UI** — 4 buttons: "Capture this page", "Track this company", "Log this as competitor signal", "Open BizLegal workspace"
- **Background service worker** — captures page metadata (title, URL, OG tags, schema.org JSON-LD, microdata, pricing tables, "Sign up" / "Get demo" CTAs) → POSTs to `/api/inbound-lead` with extension-context payload `{surface, icp_match_score, intent_signal, capture_method: "extension"}`
- **Right-click context menu** — "Mark as competitor intel" / "Add to nurture queue" / "Generate SAFT review" (links to DocAI for any contract page)
- **Auto-detect** of pricing pages, signup pages, "vs" comparison pages → silently captures + scores against the leadforge ICP
- **Operator telemetry** — every capture goes to `extension_captures` Supabase table. Moses sees a live feed at `/ops/live` (reuses #1).
- **Publish:** Chrome Web Store + Firefox Add-ons (Moses does the $5 one-time dev fee, then it ships).

**Effort:** 3 days
**Files:**
- `services/browser-extension/manifest.json` (V3)
- `services/browser-extension/background.ts` — service worker
- `services/browser-extension/popup.html` + `popup.ts` — 4 buttons
- `services/browser-extension/content-script.ts` — page metadata extraction
- `services/browser-extension/icons/` — 16/32/48/128px
- `apps/hub/app/api/extension/capture/route.ts` (new) — receives payloads
- `apps/hub/supabase/migrations/20260702_extension_captures.sql` (new)
- Updates to: `headhunter.py`, `crawlers/leads.py` to ingest `extension_captures`

### 4. THE ABILITY TO USE THE DEBUGGER
**Why:** Right now when something goes wrong (orphan payment order, stuck lead, broken email), the only way to debug is to read logs after the fact. We need **live replays**, **step-through of agent decisions**, and **breakpoints in cron jobs**.

**What ships:**
- **Trace ID everywhere** (from #2) — every API call + every cron job gets a UUID. `agent_runs.trace_id` column.
- **Replayer** — `/api/ops/replay/[trace_id]` returns the full sequence of events (HTTP calls, Supabase reads/writes, AI calls, env lookups) in order, with timing. UI at `/ops/replay/[trace_id]`.
- **Conditional breakpoint** — POST to `/api/ops/breakpoint` with `{service, condition: "when action == 'cold_email_sender.send' AND lead.score < 70"}` → that service pauses next time condition matches, sends Telegram with "approve / abort" buttons, waits for reply.
- **Mock surface** — `/api/ops/mock/[surface]` — when enabled, every call to that surface is intercepted and a pre-recorded response is returned. Lets Moses test the pipeline without burning real API credits.
- **Python debugger shim** — `from bizlegal.debug import trace, breakpoint_here` — decorators that auto-post to `/api/ops/heartbeat` with the call stack. Drop-in for any Python service.
- **VS Code launch config** — `.vscode/launch.json` for each Python service (scout, brain, publisher, bot, headhunter) with the right venv and env file.

**Effort:** 2 days
**Files:**
- `apps/hub/app/api/ops/replay/[trace_id]/route.ts` (new)
- `apps/hub/app/ops/replay/[trace_id]/page.tsx` (new) — visual replay
- `apps/hub/app/api/ops/breakpoint/route.ts` (new)
- `apps/hub/app/api/ops/mock/[surface]/route.ts` (new)
- `packages/bizlegal-debug/` (new) — `trace()` + `breakpoint_here()` decorators
- Updates: every service to add `from bizlegal.debug import trace`
- `.vscode/launch.json` (new) — debug configs

### 5. CRAWLING / SPY / HUNT (the offensive surface)
**Why:** `crawlers/competitors.py` only does RSS sitemaps. `headhunter.py` is 32KB but mostly templated. We need real competitive intelligence + real buyer hunting at scale.

**What ships:**
- **`services/spy/` (new service, runs on Hetzner)** — 4 specialized crawlers:
  - **`competitor_pricing.py`** — daily crawl of Drata, Vanta, Thoropass, Chainalysis, TRM Labs, ContractPodAi, Evisort, Ironclad pricing pages. Diffs vs yesterday. Telegram alert on any change.
  - **`competitor_content.py`** — RSS + blog scraper for 30 competitor blogs. Sonnet classifies each new post by topic, maps to our 5-pillar topical authority map (from session 4 Framework 5). Surfaces "topics nobody's covering in our niche."
  - **`competitor_backlinks.py`** — pulls ahrefs/seranking data via API (already in vault), finds sites linking to competitors but not to us, scores by domain authority + topical relevance.
  - **`competitor_social.py`** — tracks competitor X/LinkedIn/Reddit mentions via their public APIs + free search. Daily digest.
- **`services/hunt/` (new service)** — buyer-hunting crawlers:
  - **`apollo_enrich.py`** — bulk Apollo.io lookup for any lead that's `status=new` + score>=80, fills in title, company size, LinkedIn URL, recent signals.
  - **`clearbit_enrich.py`** — backup enrichment (Apollo fails → fall back).
  - **`intent_signals.py`** — Google Alerts + LinkedIn mention tracker + GitHub job-posting monitor for our 8 buyer phrases (from session 4 Framework 1: "best contract review AI for fintech compliance teams under $200" etc.) → any matching public signal becomes a new `leadforge_lead` row.
  - **`warm_intro.py`** — given a lead email, search LinkedIn/GitHub for 2nd-degree connections to anyone in our network (we have ~50 contacts).
- **Spy dashboard** — `/ops/spy` — token-gated, shows the latest competitor pricing diffs, content map, backlink opportunities, and warm intro paths. The operator's morning brief in one page.
- **Hunt autopilot** — `hunt/run.py` — given a target ICP (e.g. "Series A fintech, 10-50 employees, US/EU, uses Stripe, recently hired CCO"), generates a list of 50 leads, enriches them all, queues personalized outreach via `cold_email_sender.py` (still in --dry-run until Moses approves per-lead).

**Effort:** 5 days
**Files:**
- `services/spy/competitor_pricing.py` (new)
- `services/spy/competitor_content.py` (new)
- `services/spy/competitor_backlinks.py` (new)
- `services/spy/competitor_social.py` (new)
- `services/spy/spy_orchestrator.py` (new) — runs all 4 on a daily cron
- `services/hunt/apollo_enrich.py` (new)
- `services/hunt/clearbit_enrich.py` (new)
- `services/hunt/intent_signals.py` (new)
- `services/hunt/warm_intro.py` (new)
- `services/hunt/hunt_orchestrator.py` (new)
- `services/spy/systemd/spy-*.{service,timer}` (new) — daily runs
- `services/hunt/systemd/hunt-*.{service,timer}` (new)
- `apps/hub/app/ops/spy/page.tsx` (new) — spy dashboard
- `apps/hub/supabase/migrations/20260702_spy_intel.sql` (new)
- Updates to existing `crawlers/competitors.py` → deprecate, route through `services/spy/`

## Combined architecture

```
                   ┌─────────────────────────────────────────────┐
                   │       hub.bizlegal-ai.com (the brain)        │
                   │  /api/ops/{heartbeat,live,replay,breakpoint}│
                   │  /api/openapi.json + /api/docs               │
                   │  /ops/{live,replay,spy} dashboards          │
                   │  /api/extension/capture (browser → agents)   │
                   └──────────────┬───────────────────────────────┘
                                  │ HMAC + trace-id
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
   ┌────────▼────────┐  ┌─────────▼─────────┐  ┌────────▼────────┐
   │  Hetzner (24/7) │  │  Vercel subdomains│  │  Browser ext.   │
   │  scout / brain  │  │  docai, tracr,    │  │  Chrome + FF    │
   │  publisher /bot │  │  brai, lexaudit,  │  │  4-button popup │
   │  headhunter     │  │  leadforge, forge │  │  right-click    │
   │  cold_email     │  │  blog (CF Pages)  │  │  context menu   │
   │  lead_nurture   │  │  worker (CF W.)   │  │                 │
   │  spy/ + hunt/   │  │  telegram-hub     │  └─────────────────┘
   └────────┬────────┘  └─────────┬─────────┘
            │                     │
            └──────────┬──────────┘
                       │
                ┌──────▼──────┐
                │  Supabase   │  agent_heartbeats, extension_captures,
                │  (Postgres) │  agent_runs, leadforge_leads,
                │             │  lead_outreach, payment_orders, spy_intel
                └─────────────┘
```

Every arrow has a `x-bizlegal-trace-id` header. Every box has a `/api/ops/heartbeat` ping. Every cron job is in #1's process tree. Every API has a #2 spec entry. Every captured lead flows to `leadforge_leads` and gets the #5 hunter treatment.

## Phasing (Moses approves one phase at a time)

**Phase 1 — Process inspection (1 day, ships Friday)**
- Heartbeat endpoint, live UI, process tree, alerts
- **No new capabilities** — pure observability
- **Risk:** zero (read-only + writes to new table)
- **Outcome:** Moses can see what's running, what's stuck, what's not

**Phase 2 — OpenAPI spec + client (2 days, ships Sunday)**
- Generate spec from existing routes, deploy docs page
- **Risk:** low (additive — does not change existing behavior)
- **Outcome:** any agent (or browser ext) can call any API with type safety

**Phase 3 — Browser extension (3 days, ships Wednesday)**
- Manifest V3, popup, content script, capture endpoint
- **Risk:** medium (extension touches user browser; needs careful permissions; review policy for Chrome Web Store)
- **Outcome:** real-time buyer intent capture from anywhere on the web

**Phase 4 — Debugger (2 days, ships Friday)**
- Trace IDs, replay UI, breakpoints, mock surface, decorator lib
- **Risk:** low (additive infrastructure)
- **Outcome:** Moses can replay any failed call, set breakpoints, mock any surface

**Phase 5 — Spy + Hunt (5 days, ships next Friday)**
- 4 competitor crawlers, 4 hunter crawlers, dashboards
- **Risk:** medium (rate limits on public APIs; need to respect robots.txt on competitors)
- **Outcome:** daily competitive intelligence + 50 enriched leads/week in pipeline

## What I'm asking Moses

Three decisions before I touch code:

1. **Approve the phasing above?** (or pick a different order)
2. **Where does this go?** New git branches `feat/phase-1-ops`, `feat/phase-2-openapi`, etc., merged one at a time? Or a single `feat/platform-2026-q3` branch with 5 PRs?
3. **What does success look like?** Two options:
   - **Conservative:** all 5 phases ship + dashboard at `/ops/live` shows green within 14 days
   - **Aggressive:** ship 1 + 2 in 3 days, extension MVP in 5, then 4 + 5 in the following week

## What's NOT in this plan (deliberately deferred)

- Multi-tenant isolation (the platform is single-founder; not needed yet)
- Webhook signing for extension (HMAC is enough for now)
- Mobile app (extension + responsive web covers it)
- On-prem deployment (everything is Vercel + Hetzner + CF)
- 2FA / SSO for the operator dashboard (Moses's 1Password is the gate)
- Anything that requires changing payment processor flow (that's a separate session, blocked on PAYPAL_WEBHOOK_ID)

## Files this will touch (rough count)

- 60 new files
- 70 existing files updated
- 4 new Supabase tables (`agent_heartbeats`, `extension_captures`, `spy_intel`, `breakpoints`)
- 4 new packages (`@bizlegal/ops-heartbeat`, `@bizlegal/api-client`, `@bizlegal/bizlegal-debug`, browser-extension)
- 1 new Hetzner service directory (`services/spy/`, `services/hunt/`)
- 1 Chrome Web Store + 1 Firefox Add-ons submission

## Time budget

- 1.5 weeks full-time for a single agent
- 1 week of Moses's review time spread across the 5 phases
- $X in API costs (Apollo: $49/mo for 10k credits, Clearbit: $99/mo, Anthropic for competitor classification: ~$50/mo at 30 posts/day, Ahrefs: already in vault)

Ready to start Phase 1 on your signal.
