# agents/ — Agent Index

**Standing orders: `agents/HERMES-STANDING-ORDERS.md`** — every Hermes layer reads that FIRST; on conflict, standing orders win.

> First read the monorepo root [`CLAUDE.md`](../CLAUDE.md). This file is the index the root Operating Book (§5) references — who runs where, on what schedule, and what's spec vs shipped. Revenue lineage per agent: `agents/REVENUE-AGENTS-MAP.md`.

---

## A — EA session brain (`agents/ea/`)

The strategic-operating layer for Moses. Not deployable code — prompts, schemas, templates, and context that bootstrap any Claude Code session acting as the EA. Entry point: `agents/ea/CLAUDE.md` → `EA-CLAUDE.md` → `INITIALIZE_PROMPT.txt` → `prompts/<task>.md`. The CF Worker (`services/worker/`) consumes `prompts/lead-{extract,critique,score,summary}.md` directly — edit there, redeploy the Worker, never fork.

## B — Hub cron agent-runner (`apps/hub/lib/agents/`)

Vercel crons hit `GET /api/agents/run?task=<id>` (Bearer `CRON_SECRET`); the runner loads the task from `lib/agents/prompts.ts`, fetches ops context, calls Anthropic, posts to Telegram, and logs `agent.run.completed` / `agent.run.error`. Schedules live in `apps/hub/vercel.json`.

| Task id | Schedule (UTC) | Model | Output |
|---|---|---|---|
| `daily-revenue-digest` | daily 08:00 | haiku | 24h revenue + stuck intents + lead inflow → Telegram |
| `daily-vertical-classifier-audit` | daily 08:30 | haiku | lead-classifier spot-check → Telegram |
| `daily-content-pick-suggestion` | daily 09:30 | haiku | strongest topic angle before 10:00 auto-pick → Telegram |
| `daily-affiliate-followup` | daily 10:00 | haiku | affiliate signup/click follow-up suggestion → Telegram |
| `daily-cold-pitch-suggestion` | daily 11:00 | haiku | 3 sendable cold pitches from real framework changes → Telegram |
| `daily-standing-review` | daily 18:00 | haiku | CHECKED / DONE (autonomous) / NEEDS DOING (Moses) standing review → Telegram |
| `weekly-mrr-review` | Mon 09:00 | sonnet | MRR retrospective + strategic question → Telegram |
| `friday-retrospective` | Fri 17:00 | sonnet | worked / didn't / 3 next-week priorities → Telegram |
| `monthly-vertical-scorecard` | 1st 09:00 | sonnet | per-vertical revenue scorecard + double-down pick → Telegram |

## C — OpenClaw manual playbook

Copy-paste daily/weekly prompts for Hermes/OpenClaw sessions: `decisions/HERMES_OPENCLAW_DAILY_SCHEDULE.md` (role definition: `decisions/OPENCLAW_ROLE.md`). Draft-only discipline — no sends, no posts, no commits without Moses approval. Standing orders override it on any conflict.

## D — Ops agent specs (`agents/ops/`)

WAT-layer specs (see `agents/ops/CLAUDE.md` for shared context, tool chain, escalation ladder). STATUS: **implemented** = deterministic tool exists on a schedule; **spec-only** = markdown SOP awaiting a tool (nearest existing tool noted).

| Spec | Schedule | Status |
|---|---|---|
| `morning-ops.md` | Daily 08:55 | spec-only (nearest: hub `daily-revenue-digest` 08:00) |
| `revenue-ops.md` | Every 15min | spec-only (nearest: hub `/api/cron/ops-alerts` */15) |
| `health-ops.md` | Every 60min | spec-only (nearest: `ops_alerts.py` heartbeat + `/api/cron/ops-alerts`) |
| `pitch-ops.md` | Daily 11:00 | implemented — hub `daily-cold-pitch-suggestion` (draft-only) |
| `content-ops.md` | Daily 09:30 | spec-only (nearest: hub `/api/cron/social-queue` + `content_distribution.py`) |
| `partner-ops.md` | Wed 10:00 | spec-only (nearest: `/api/cron/affiliate-reconcile` + `partner_onboarding.py`) |
| `mrr-review.md` | Mon 09:00 | implemented — hub `weekly-mrr-review` |
| `friday-retro.md` | Fri 17:00 | implemented — hub `friday-retrospective` |
| `monthly-scorecard.md` | 1st of month | implemented — hub `monthly-vertical-scorecard` |
| `daily-review.md` | Daily 23:55 | implemented — hub `daily-standing-review` 18:00 covers the review; 23:55 Drive export still spec-only |
| `writer-agent.md` | Daily 08:00 | spec-only (nearest: `seo_content_writer.py` + curator pipeline) |
| `crawler-agent.md` | Daily 07:00 | implemented — `services/seo-agents/crawlers/` + `discovery_scraper.py` |
| `contact-agent.md` | On-demand | spec-only |
| `cold-email-agent.md` | Daily 11:00 | implemented — `services/outreach/cold_email_sender.py` (O2 caps apply) |
| `invoice-agent.md` | Daily 09:00 | implemented — `apps/hub/app/api/cron/invoices` (2026-07-04) |
| `thank-you-agent.md` | On payment.confirmed | spec-only |
| `sqa-demo-agent.md` | On prospect reply | spec-only |
| `stripe-atlas-agent.md` | One-time | spec-only (Moses checklist) |

## E — Hetzner SEO fleet (`services/seo-agents/`)

Cron grid: `services/seo-agents/crontab.txt` (all UTC). One line per agent:

| Agent | Does |
|---|---|
| `daily_orchestrator.py` | Hetzner-side daily SEO + BI pipeline (--task=04/05/06/19) |
| `daily_autonomous_seo.py` | master A-to-Z SEO + outreach + OCI orchestrator |
| `content_enricher.py` | Agent A — enrich existing content (04:00) |
| `visual_assets.py` | Agent B — visual asset generator (05:00) |
| `affiliate_funnel.py` | Agent C — affiliate funnel builder (06:00) |
| `geo_citation.py` | Perplexity AI-citation polling (07:00) |
| `crawlers/site_health.py` | site health probe (08:00) |
| `crawlers/backlinks.py` | backlink discovery (09:00) |
| `crawlers/competitors.py` | competitor monitoring (10:00) |
| `crawlers/ai_checks.py` | AI-answer citation checks (11:00) |
| `crawlers/index_status.py` | GSC index status (12:00) |
| `seo_watchdog.py` | consolidate crawlers, fire IndexNow, alert (13:00) |
| `crawlers/sales.py` | sales attribution crawl (15:00) |
| `crawlers/leads.py` | leads pipeline crawl (16:00) |
| `crawlers/customer_q.py` | customer-quality crawl (17:00) |
| `ea_agent.py` | consolidated DAILY-REPORT + Telegram (19:00) |
| `newsletter.py` | Resend newsletter send (20:00) |
| `cleanup.py` | log/artifact cleanup (21:00) |
| `analytics_dashboard.py` | analytics rollup dashboard |
| `content_distribution.py` | syndicate posts to Reddit/LinkedIn/X |
| `conversion_tracker.py` | daily conversion funnel report |
| `discovery_scraper.py` | client discovery from free public sources |
| `enrich_page.py` / `page_audit.py` | per-page enrichment / 8-surface SEO+GEO+AEO audit |
| `gsc_indexnow_pinger.py` | GSC + IndexNow pings |
| `infographic_generator.py` / `og_image_generator.py` | citation-friendly infographics / OG images |
| `internal_linker.py` | internal-link builder |
| `keyword_calendar.py` | 365-article content calendar |
| `publish_blog.py` / `seo_content_writer.py` | blog publish / SEO content engine |
| `revenue_attribution.py` | article → paying customer attribution |
| `ops_alerts.py` / `telegram_bot.py` / `telegram_heartbeat.py` | service-silent alerts / bot responder / heartbeat |

## F — Outreach fleet (`services/outreach/`)

All governed by standing orders O2 (caps), O3 (escalation), O4 (kill switch).

| Agent | Does |
|---|---|
| `headhunter.py` | source → qualify → draft → send pipeline vs 6 ICPs (≤25/day weekdays) |
| `prospects.py` | hand-curated ground-truth prospect list for headhunter |
| `cold_email_sender.py` | autonomous cold sends from `leadforge_leads` via Resend (cap via CLI flag) |
| `cold_email_outreach.py` | cold email drafting pipeline (Build #9) |
| `queue_outreach.py` | queue personalized drafts (status=drafted) for Moses review |
| `lead_nurture.py` | day-3/7/14/30 drip for engaged leads (opted-in only) |
| `linkedin_dm_outreach.py` | LinkedIn DM drafts — NO automated DMs, Moses sends |
| `reddit_outreach.py` | Reddit post drafts — NO automated posting |
| `oci_funnel.py` | OCI partner matching + invoice request for qualified leads |
| `oci_deal_closer.py` | accept/decline inbound OCI partner deals, auto-invoice |
| `partner_onboarding.py` | OCI deal-router partner onboarding |

## G — Event-type registry

The canonical `OpsEventType` union (40+ types) lives in **`packages/ops-log/src/index.ts`** — pointer only, do NOT duplicate the list here. Sync rule (root `CLAUDE.md` §5 + `apps/hub/CLAUDE.md` invariant #1): any new event type MUST land in the union, in hub `app/api/ops/log/route.ts` `ALLOWED_TYPES`, and be noted in this file — in the same PR. Phase Z hard rule: no new event types until Z7 is green.
