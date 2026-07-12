# Google Infrastructure Plan for BizLegal AI
**Date:** 2026-07-10
**Author:** Hermes (audit)
**Owner:** Moses
**Status:** PLAN

## Executive Summary
BizLegal currently relies on:
- Anthropic Claude for LLM work (CREDIT DEPLETED — $0)
- Resend for email (CF-blocked, UA fix works, but 100/day free limit)
- Hetzner for compute (CX33, working fine)
- Vercel for the 8 apps (Hobby/Pro, $20/seat)
- Apify/Firecrawl for scraping (working)

Google infrastructure can replace or supplement 4 of these, free or cheap,
and add 4 new capabilities that have no current equivalent.

## Service-by-Service Plan

### 1. Gemini API (replaces/partners Anthropic)
**Current state:** Anthropic $0 credit. /v1/models 200, /v1/messages 400.
**Why Google:** Gemini 3 Flash scores 78% SWE-bench. Free tier via AI Studio.
**Concrete win:** `aeo_loop_v2.py` and `content_enricher_v2.py` need LLM. They
currently can't run. Switch to Gemini 3 Flash and they work.

**Free tier (post April 2026):**
- 5 RPM (5 requests per minute)
- ~100 RPD (100 requests per day)
- Models: gemini-2.5-flash, gemini-2.5-flash-lite, gemini-3-flash
- 1M token context window

**Catch:** Google may train on inputs/outputs. Sensitive data (PII from
suppression list, lead emails) MUST go through paid tier or get anonymized.

**Plan:**
- Add `GEMINI_API_KEY` to vault
- Create `services/agents/llm_router.py` — calls Gemini if Anthropic 402/429,
  else calls Anthropic. Single chokepoint for LLM.
- Update `aeo_loop_v2.py`, `content_enricher_v2.py`, `signal_scout.py` to
  use the router
- Keep Anthropic for the high-stakes stuff (lead qualification, legal
  analysis) where quality matters, use Gemini for high-volume content

**Cost:** $0 (free tier covers 100 RPD; aeo_loop runs once/day, content
enricher runs once/day — well within budget).

### 2. Gmail API (engagement capture)
**Current state:** Resend is the only inbox. Reply detection depends on
Resend webhooks. We don't poll for replies on other channels (if a lead
replies from their personal Gmail to a thread, we miss it).
**Why Google:** Gmail API gives us programmatic read access to
`intelligence@bizlegal-ai.com` (once we set up Google Workspace for that
domain). Engaged_monetization needs to detect replies — Gmail API + watch
is the canonical way.

**Free tier:**
- Gmail API: 1.2M quota units/min, 6K units/min/user
- Workspace: $7/user/month
- Sending: 2,000 emails/day (vs Resend's 100/day free)

**Plan:**
- Add a `gmail_watch.py` agent that uses Pub/Sub push notifications
  (or polling with `history.list` at 2 units/call) to detect replies
- When a reply matches a known lead (by email), flip `lead_outreach.replied_at`
- The `engaged_monetization` agent already queries that, so the loop closes
- Workspace Standard: $7/user/mo × 1 user (intelligence@) = $7/mo

**Cost:** $7/mo Workspace + $0 API usage. Replaces Resend's $20/mo Pro
plan for outbound (Gmail = 2,000/day vs Resend Pro = 50,000/mo). Wait —
that's a downgrade. Keep Resend for outbound, ADD Gmail for inbound.
**Net cost: $7/mo.**

### 3. Google Calendar API (scheduling)
**Current state:** No way for a lead to book a call. The conversion path
ends at "they reply with interest" — then we have to coordinate by email.
**Why Google:** Calendar API + booking page = $0 friction to schedule.
**Plan:**
- Add a `/api/book` route that:
  1. Looks up the lead's `vertical_interest` from newsletter_subscribers
  2. Finds free 30-min slots via Calendar freebusy API
  3. Returns a Calendly-style page
  4. Books the event on confirmation
- Trigger `engaged_monetization` with `booked_at` set
- Send a confirmation email with the Calendar event details + the relevant
  product's NOWPayments/PayPal link

**Cost:** $0 (Calendar API is free for the basic queries we need).

### 4. BigQuery (analytics warehouse)
**Current state:** agent_runs table has 1,007 rows and growing. We can't
do real time-series analytics in Postgres cost-effectively.
**Why Google:** 1 TiB queries/month free, 10 GiB storage free.
**Plan:**
- Build `services/agents/agent_runs_archiver.py` — once a week, streams
  last 7 days of agent_runs to BigQuery via `bigquery.jobs.insert`
- Build the matching `apps/hub/app/api/dashboard/bigquery/route.ts` —
  queries BigQuery for trends: "which agent fails most?", "what's the
  success rate over time?"
- The agent_runs_supabase table is still the source of truth for the
  24h view. BigQuery is the OLAP layer for the 7d+ view.

**Cost:** $0 within free tier.

### 5. Cloud Run (replaces/augments Hetzner)
**Current state:** All Python agents run on a single Hetzner CX33 ($13/mo).
When one agent OOMs, the whole box is at risk. When we want to scale the
content pipeline to write 10 blog posts/day instead of 1, we can't.
**Why Google:** 2M requests/mo, 360K GiB-seconds memory free, 180K vCPU-
seconds free. Auto-scales to zero. Each agent becomes its own service.
**Plan:**
- NOT this month. The Hetzner box is fine. Cloud Run is the escape hatch
  when we hit scale. Defer to Q3.

**Cost:** $0 within free tier when we migrate.

### 6. Vertex AI (escalation tier for Gemini)
**Current state:** Gemini API free tier is 100 RPD. If we exceed that,
the API hard-stops.
**Why Google:** Vertex AI gives 60 RPM (12x the free API), data privacy
(no training on inputs), and direct integration with Cloud Storage +
BigQuery. It's the production tier.
**Plan:**
- Same as #1: start with Gemini API free tier, escalate to Vertex AI
  when traffic warrants
- Pay-as-you-go Gemini 2.5 Flash: $0.30/M input, $1.20/M output
- 100 FAQ regenerations × 1K tokens = $0.0003 — essentially free

**Cost:** <$5/mo even at scale.

### 7. Google Maps API (geographic lead enrichment)
**Current state:** Apollo is the lead-enrichment tool (not free).
**Why Google:** Maps API has a $200/mo credit. We can geocode company
addresses, find nearby regulatory filings, etc.
**Plan:**
- Defer. Not a current bottleneck. Add to Q3 backlog.

### 8. Google Drive API (deal-room content)
**Current state:** `monetization_agent.py` builds deal rooms dynamically.
The deals are HTML pages on the hub, not real documents.
**Why Google:** Drive API lets us create real Google Docs/Sheets for each
deal. The customer can share, edit, download.
**Plan:**
- Defer. Hub deal rooms are working.

## Total New Cost
| Item | Monthly |
|------|---------|
| Gemini API (free tier) | $0 |
| Gmail Workspace (1 user) | $7 |
| Calendar API | $0 |
| BigQuery | $0 |
| Cloud Run | $0 (deferred) |
| Vertex AI | <$5 |
| **Total** | **$7-12/mo** |

## ROI
The $7-12/mo unlocks:
1. Content engine that drives organic traffic (Gemini replaces dead Anthropic)
2. Reply detection that closes the conversion loop (Gmail)
3. Booking without back-and-forth (Calendar)
4. Long-term analytics (BigQuery)

vs. the current state: $0 spend, $0 revenue, all LLM agents dead.

## Order of Operations (this week)
1. **Create Google Cloud project** (`bizlegal-ai-prod`)
2. **Enable APIs:** Gemini, Gmail, Calendar, BigQuery
3. **Create service account** with key JSON → store in vault
4. **Build `llm_router.py`** — central chokepoint for LLM calls
5. **Migrate `aeo_loop_v2.py` and `content_enricher_v2.py`** to use router
6. **Build `gmail_watch.py`** — uses Pub/Sub push to detect replies
7. **Build `/api/book` route** — Calendar integration
8. **Wire it all up to cron** (after Moses approves each agent)

## Risks
- Gemini 3 Flash quality for legal content: untested. Anthropic Sonnet is
  still better for nuanced compliance analysis. Use Gemini for high-volume
  mechanical content, Anthropic for high-stakes.
- Google training on free-tier data: PII risk. Mitigate by anonymizing
  prompts (mask email addresses, replace company names with hash).
- Workspace $7/mo: adds to the burn. Worth it for the reply detection.

## Conclusion
Google infrastructure is the single highest-leverage unblock after the
spam incident. It unblocks the content engine (Gemini), closes the
conversion loop (Gmail), and adds scheduling (Calendar) for $7-12/mo.
Moses' approval needed: create the GCP project + add $7/mo Workspace.
