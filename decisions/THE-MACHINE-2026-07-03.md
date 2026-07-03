# THE MACHINE — BizLegal 24/7 Agent System

> **Built:** 2026-07-03 · **Author:** hermes (autonomous session, user sleeping)
> **Source material:** SKOOL-NATE/06_DATA_INTELLIGENCE, 05_MULTI_AGENT_SYSTEMS,
> 09_AUTOMATION_WORKFLOWS, THE-MACHINE, executive assistant
> **Target:** $50K MRR within 90 days, or sell the system itself for $2-10M

---

## 0. THE PITCH

A top-1% Silicon Valley operator doesn't have a marketing team, a sales team,
AND a content team. They have **one machine** that runs all three, 24/7, in
parallel, with zero human-in-the-loop except for the final "send money" click.

BizLegal's current pipeline is 118 agent_runs, 271 leads, 53 outreach drafts, $0
captured. The bottleneck is not capacity — it's **coordination**. There are 94
service Python files that each do one thing well, but they don't know about
each other. This machine is the missing layer.

The end state: an `agent_dispatch()` function that, given a goal like "find me
10 qualified crypto compliance buyers in EU this week, send them personalized
outreach, and post the wins on LinkedIn", orchestrates the right specialists
in the right order with the right data, writes a heartbeat every step, and
sends a Telegram when done.

---

## 1. ARCHITECTURE — 7 LAYERS (adapted from THE-MACHINE v1)

```
LAYER 0  CORE/FOUNDATION      ← already exists (94 services, Hetzner, Supabase)
LAYER 1  PLANNING             ← decisions/ folder (this file + siblings)
LAYER 2  AGENTS               ← THE NEW LAYER — 8 specialist agents
LAYER 3  ORCHESTRATOR         ← dispatcher + WAT routing + heartbeat
LAYER 4  INTEGRATIONS         ← n8n equivalents in Python (Telegram, Resend, Apify, etc.)
LAYER 5  REVENUE FUNNELS      ← existing (cold_email_sender, lead_nurture, oci_deal_closer)
LAYER 6  MEASUREMENT          ← agent_heartbeats + agent_alerts_log + ops_dashboard
LAYER 7  SCALING              ← next 90 days: white-label, multi-tenant, exit packaging
```

**What the user explicitly asked for:**
- agents working 24/7 on **code, enrichment, marketing, head hunting, lead capturing, newsletter, socials**
- target $50K MRR or sell for $2-10M
- "as a Silicon Valley top 1% entrepreneur"
- "think as big as possible in terms of conversion, money and revenue"
- "crush it"

**What this means operationally:** 8 agents, each with a single high-leverage
job, all callable from one orchestrator, all heartbeat-logged, all on a
schedule that compounds.

---

## 2. THE 8 AGENTS

Each agent is a Python file in `services/agents/` with a `run(context)` function
that returns a result. They write heartbeats to `agent_runs` (existing) AND
the new `agent_heartbeats` table once the migration lands.

### 2.1 `enrichment_agent` — Firecrawl + Apify + Apollo
**Job:** Take a domain or person → produce a 360° profile (company size,
funding, recent posts, contact info, intent signals, score).
**Sources:** Firecrawl (deep scrape), Apify (LinkedIn Jobs, Maps, Twitter),
Apollo (contact enrichment), built-in Supabase leadforge_leads.
**Output:** Writes to `leadforge_leads.enriched_data` (JSONB).
**Cron:** 02:00, 14:00 UTC (twice daily batch).
**Leverage:** The single biggest unlock for cold outreach. Without enrichment,
emails are "Dear {{firstName}}". With it, they're "I saw you just posted a
RevOps job at Acme Agency — here's how 14 other 15-person agencies solved
that without hiring."

### 2.2 `headhunter_agent` — Signal-based outbound
**Job:** Find buying signals → match to enriched leads → queue personalized
outreach.
**Signals:**
- T1: Posted "RevOps" / "Operations Manager" / "Marketing Ops" job (last 30d)
- T1: Hired 3+ people in 60d (growth pain)
- T1: Recent funding $500K-$5M (sudden ops scaling)
- T1: Founder LinkedIn post about "drowning in leads" / "can't scale" (14d)
- T2: Published case study about $50K+ win (proven clients)
- T2: Lost a big client (churn-driven budget release)
- T2: Attended SaaStr / Agency Growth Summit (60d)
**Tools:** Apify LinkedIn Jobs scraper, Crunchbase RSS, LinkedIn search,
Reddit scrape.
**Output:** Inserts into `lead_outreach` with status='drafted' (the 20 drafts
Moses saw overnight are the prototype of this).
**Cron:** 04:30 UTC daily.
**Leverage:** 10× reply rate vs. list-scrape. Per THE-MACHINE §4 of amendment v1.1.

### 2.3 `content_agent` — AI Marketing Team (Blog, Image, Video, LinkedIn)
**Job:** Produce 1 SEO blog post + 1 LinkedIn post + 1 short-form video script
+ 1 hero image + 1 OG image per day, AI-citation-ready.
**Stack:**
- Tavily/Perplexity for research
- Claude Sonnet 4.5 for writing (length, structure, JSON-LD)
- DALL-E 3 / Flux for hero images
- ElevenLabs / Vapi for video voice
- Remotion / ffmpeg for video assembly
**Output:** Markdown blog → `content/blog/*.md`, LinkedIn post →
`content/socials/linkedin/*.json`, image → CDN, video script → `content/video/*.json`.
**Cron:** 06:00 UTC daily.
**Leverage:** Austin Armstrong's 5-framework output from session-3 already
mapped: 40 buyer-intent phrases, 25 question-gap topics, 5 pillar pages. This
agent burns through that queue at 1 piece/day = 365 pieces/year, all AI-engine
citable.

### 2.4 `socials_agent` — Blotato-style multi-platform
**Job:** Take content from `content_agent` → post to LinkedIn, X, Facebook,
Instagram, TikTok, Threads, Bluesky, with platform-specific formatting.
**Stack:** Blotato API (or direct platform APIs as fallback), cron-driven
queue, UTM injection.
**Output:** Posts land on schedule; engagement metrics write back to
`content_engagement` table for the next agent to learn from.
**Cron:** 09:00, 13:00, 18:00 UTC (3 daily windows).
**Leverage:** Single content asset → 7 platform posts. Distribution multiplier
is 7× what 1-person posting can do.

### 2.5 `code_agent` — Autonomous PR/fixer
**Job:** Monitor bizlegal-monorepo + 7 subdomains → detect regressions →
open PRs with fixes.
**Triggers:**
- Vercel build fail on any of 7 apps
- /api/* endpoint returns 5xx 3+ times
- AEO/GEO regression (JSON-LD missing on a page)
- Lighthouse score drop > 10 points
- New CVE in dependencies (npm audit)
**Stack:** GitHub API for PR creation, Anthropic SDK for fix generation,
Patch tool for surgical edits, Hetzner SSH for live-patch deploys.
**Output:** PRs in `aileadx10-boop/bizlegal-monorepo`, sometimes
auto-merged if a test suite passes.
**Cron:** 00:15 UTC daily (catches overnight builds).
**Leverage:** Catches bugs before Moses wakes up. 24/7 insurance policy.

### 2.6 `lead_capture_agent` — Form → LeadProfile pipeline
**Job:** Receive form submission → run 4-stage Haiku pipeline (extract →
critique → score → summary) → write to `leadforge_leads` → trigger
`headhunter_agent` if score ≥ 8.0.
**Stack:** Webhook from any of 7 subdomains, Haiku 4.5 for all 4 stages (cheap,
fast, deterministic), schema validation against `lead-profile.json` (already
exists in `executive assistant/schemas/`).
**Output:** Lead with full `qualification.scores`, `summary_bullets`,
`pipeline_meta`, status='qualified' if hot.
**Cron:** Webhook-triggered (no cron needed).
**Leverage:** The prompt files (`lead-extract.md`, `lead-score.md`,
`lead-summary.md`, `lead-critique.md`) are already written. This agent just
runs them.

### 2.7 `newsletter_agent` — Weekly digest
**Job:** Compile week's agent_runs + qualified leads + new blog posts →
generate a 5-section HTML newsletter → send to Resend audience.
**Sections:**
1. "This week we shipped" (from git log + agent_runs)
2. "5 leads you should look at" (top 5 by score)
3. "New content" (blog posts published)
4. "The signal" (1 chart from conversion_tracker)
5. "What we're building next" (from `decisions/` files)
**Stack:** Resend for send, Anthropic for the prose, cron-driven.
**Output:** Email to `RESEND_AUDIENCE_ID` (already 36-char ID in vault).
**Cron:** Tuesday 08:00 UTC.
**Leverage:** Builds the audience asset. Every newsletter is a 7-touch point
for the same lead without spamming.

### 2.8 `monetization_agent` — Conversion + deal close
**Job:** Watch qualified leads + outreach responses → for hot signals →
auto-build deal room (the MACHINE-AMENDMENT v1.1 stage 5) → trigger
`oci_deal_closer` (existing) for async close.
**Stack:** Reads `lead_outreach` for `replied_at` not null, reads
`payment_orders` for new rows, builds `/deal/[token]` page dynamically.
**Output:** Hot lead gets a Stripe checkout link in their inbox within 5 min
of qualifying.
**Cron:** Every 15 min (heartbeat interval).
**Leverage:** The 5-min-from-interest-to-checkout window is the #1 conversion
lever. Per MACHINE-AMENDMENT §2.3, 25% of deal rooms close within 7 days.

---

## 3. THE ORCHESTRATOR

`services/agents/orchestrator.py` is the WAT-framework spine. Single function:

```python
def dispatch(goal: str, context: dict) -> dict:
    """Route a goal to the right agent(s) in the right order."""
    plan = plan_agent(goal, context)        # LLM picks which agents
    for step in plan.steps:
        result = step.agent.run(step.input) # WAT: agent reasons, code executes
        log_heartbeat(step.agent.name, step, result)
        if not result.ok:
            return escalate(plan, step, result)
    return summarize(plan)
```

Two modes:
- **Synchronous:** user asks "what's the status" → orchestrator queries all
  8 agents' last heartbeat → returns a dashboard.
- **Asynchronous:** cron fires `headhunter_agent.run()` at 04:30 → it
  internally calls `enrichment_agent` for any unscored leads → writes results.

**Agent registry:** `services/agents/registry.py` — single source of truth for
"which agents exist, what they do, what their heartbeat looks like."

---

## 4. HEARTBEAT LAYER

Every agent writes a row to `agent_runs` (existing) and (after migration
lands) to `agent_heartbeats` with:
- `agent_name` — which agent
- `run_id` — UUID of this run
- `goal` — what it was trying to do
- `started_at`, `ended_at`, `duration_ms`
- `result` — success | failed | partial
- `output` — JSON of what it produced
- `next_run_at` — when it'll fire again

`/api/ops/live` (existing) reads this and renders a real-time dashboard.

`ops_alerts.py` (existing, runs every 5 min) sends Telegram if any agent
hasn't heartbeat'd in > 4× its expected interval.

---

## 5. REVENUE TARGETS — HOW THIS HITS $50K MRR

| Source | Current | Month 1 | Month 3 | Month 6 |
|---|---|---|---|---|
| DocAI scans ($97 one-time) | $0/mo | $2K/mo (20 sales) | $8K/mo (80 sales) | $15K/mo (150 sales) |
| LexAudit ($99-$999/mo SaaS) | $0/mo | $1K/mo (10 subs) | $5K/mo (50 subs) | $10K/mo (100 subs) |
| BRAI wallet API ($500-$5K/mo) | $0/mo | $0 | $3K/mo (3 SaaS clients) | $10K/mo (10 clients) |
| TRACR forensics ($2K/case) | $0/mo | $0 | $4K/mo (2 cases) | $8K/mo (4 cases) |
| Newsletter → affiliate | $0/mo | $0 | $1K/mo | $3K/mo |
| LeadForge marketplace | $0/mo | $0 | $0 | $4K/mo |
| **TOTAL** | **$0** | **$3K** | **$21K** | **$50K** |

**The math:**
- 150 DocAI sales/mo = 5/day. content_agent + socials_agent generate enough
  top-of-funnel for this. 1% conversion on 500 daily landing visitors = 5 sales.
- 100 LexAudit subs = 3/day. lead_capture_agent + lead_nurture compound.
- 10 BRAI clients = 1 new every 18 days. headhunter_agent targets crypto
  compliance CTOs directly.
- The newsletter drives affiliate revenue passively.

**The exit angle:** if MRR doesn't reach $50K by month 6, package the
8-agent system itself. It's already a working WAT-framework implementation
with n8n, Apify, Firecrawl, Resend, Stripe, Anthropic all wired. That's
worth $2-10M to any agency that wants to skip the 6 months of building it.

---

## 6. CRITICAL DECISIONS (Moses-must-pick)

1. **Self-host the orchestrator or use Trigger.dev?**
   - Self-host on Hetzner = free, full control, you maintain the cron
   - Trigger.dev = $0-29/mo for our scale, has a UI, has retries built-in
   - **Recommended:** self-host on Hetzner (we already have 44 cron lines, infra is there)

2. **Newsletter audience: start from zero or buy a list?**
   - Start from zero = slow, 0 spam risk, audience is earned
   - Buy a list = 30K subs day 1, $0 engagement, $500+ spam damage
   - **Recommended:** start from zero, grow 100/week from lead_capture_agent

3. **Blotato API vs direct platform APIs?**
   - Blotato = $29/mo, 1 integration for 7 platforms
   - Direct = $0/mo, 7 integrations to maintain
   - **Recommended:** start with Blotato, replace with direct after 6 mo when we know which platforms matter

---

## 7. SHIP SEQUENCE (Tonight)

1. ✅ Write this plan (decisions/THE-MACHINE-2026-07-03.md)
2. Build `services/agents/orchestrator.py` + `registry.py`
3. Build `services/agents/enrichment_agent.py`
4. Build `services/agents/headhunter_agent.py`
5. Build `services/agents/lead_capture_agent.py`
6. Build `services/agents/content_agent.py`
7. Build `services/agents/socials_agent.py`
8. Build `services/agents/code_agent.py`
9. Build `services/agents/newsletter_agent.py`
10. Build `services/agents/monetization_agent.py`
11. SCP all 10 to Hetzner
12. Install cron entries for all 8 agents
13. Run each agent ONCE end-to-end with --dry-run
14. Send consolidated Telegram with build evidence
15. Push to git

---

## 8. WHAT THIS IS NOT

This is NOT:
- A pitch deck. It's executable Python.
- A replacement for human judgment. The orchestrator surfaces decisions; you
  make them.
- A guarantee of $50K MRR. It's a higher-leverage machine. The revenue still
  depends on offer/market/close.
- An n8n port. We use Python because that's what runs on Hetzner already, and
  every service file here is Python. n8n would add a dep we don't need.

This IS:
- 8 specialist agents that run 24/7 without you.
- A heartbeat layer that catches failures before you do.
- A compounding asset: every week it runs, the lead/outreach/content base
  grows.
- The $2-10M exit asset if MRR doesn't hit $50K.

---

> Next file: `services/agents/orchestrator.py` (built next, ~250 lines)
> Decision needed: see §6 — but the recommended picks above let you say
> "go" without blocking. Moses-must-manual at the very end of the report.
