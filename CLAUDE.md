# BizLegal-AI Monorepo — Operating Book

**Read this file first.** Every Claude Code session, every subagent, every new agent (Codex, Cursor, manual hire) starts here.

**Last consolidated:** 2026-07-17 (Phase AA — Revenue Machine live, cohort-2 agents deployed)
**Owner:** Moses (founder, BizLegal AI / DOR INNOVATIONS)
**Mission:** compliance-as-a-service for B2B SaaS / fintech / DAOs / real-estate cross-border deals.

---

## 1 — Where you are

You are inside `bizlegal-monorepo/` — the consolidated workspace for everything BizLegal AI. Single git repo, single env vault, single deploy story per surface.

```
bizlegal-monorepo/
├── apps/             Vercel-deployed Next.js apps
│   ├── hub/          bizlegal-ai.com (the brain — /agents, /ops, /api/pay/start)
│   ├── tracr/        tracr.bizlegal-ai.com (forensic wallet reports, $149-299)
│   ├── brai/         brai.bizlegal-ai.com (regulatory risk preview + reports)
│   ├── lexaudit/     lexaudit.bizlegal-ai.com (compliance health score, $99/mo monitor)
│   ├── docai/        docai.bizlegal-ai.com — CANONICAL CONTRACT-RISK FUNNEL (SQA + DPA + $97 scan, live since 2026-05-23)
│   ├── leadforge/    leadforge.bizlegal-ai.com (lead-gen surface)
│   ├── forge/        forge.bizlegal-ai.com (BOI Kit $149, Passport $297, scan $97)
│   ├── propsignal/   propsignal.bizlegal-ai.com — property risk reports $49 (TRIO scaffold 2026-07-28, not deployed; see apps/propsignal/CLAUDE.md)
│   ├── leaseparse/   leaseparse.bizlegal-ai.com — lease abstracting $59 + date monitoring (TRIO scaffold, not deployed; see apps/leaseparse/CLAUDE.md)
│   ├── closeflow/    closeflow.bizlegal-ai.com — closing checklists $39 + deadline engine (TRIO scaffold, not deployed; see apps/closeflow/CLAUDE.md)
│   └── blog/         blog.bizlegal-ai.com (curator-fed MDX content; CF Pages)
├── services/         non-Vercel runtimes
│   ├── hetzner/      curator pipeline: scout/brain/publisher/bot (Python, systemd) [Z1.C-pending]
│   ├── oci/          deal-router (FastAPI, Docker, Caddy + Cloudflare Tunnel) [Z1.C-pending]
│   ├── worker/       Cloudflare Worker — bizlegal-lead-intake (TS, wrangler) [Z1.C-pending]
│   ├── telegram-hub/ CF Worker — @BizlegalHubBot customer FAQ (Z4.2)
│   ├── gsc-bot/      CF Worker — weekly GSC sitemap re-submission across 8 surfaces
│   ├── browser-extension/ Manifest V3 Chrome/Firefox compliance capture extension (P3)
│   ├── spy/          competitor intelligence crawlers: pricing/content/backlinks/social (P5)
│   ├── seo-agents/   SEO pipeline scripts (headhunter, daily_orchestrator, publisher, etc.)
│   ├── outreach/     OCI partner-referral flow only (oci_funnel, oci_deal_closer, partner_onboarding)
│   └── funnel-mvp/   TOMBSTONED 2026-05-24 — canonical is apps/docai/web/ (Fastify, never deployed; git-history reference only)
├── packages/         shared TS + Python siblings
│   ├── deal-engine/  @bizlegal/deal-engine — transaction reconciliation core (normalise/reconcile/jurisdiction packs); pure, no LLM
│   ├── email/        @bizlegal/email — THE outbound email path; suppression + double-opt-in enforced inside the package (never in callers)
│   ├── ops-log/      @bizlegal/ops-log — HMAC-signed event POST to hub /api/ops/log
│   ├── firecrawl/    @bizlegal/firecrawl — scrape + Sonnet semantic-diff
│   ├── safe/         @bizlegal/safe — PII redaction (LexAudit Safe)
│   ├── ui-v2/        @bizlegal/ui-v2 — PricingTierCard + AgentCheckoutButton + theme tokens
│   ├── nurture-enqueue/ @bizlegal/nurture-enqueue — cross-surface nurture enqueue helper
│   ├── rate-limit/   @bizlegal/rate-limit — shared public route limiter helpers
│   ├── theme/        @bizlegal/theme — CSS custom properties only
│   ├── themes/       @bizlegal/themes — shared shell, FOUC, and theme tokens
│   ├── policy-refresh/ @bizlegal/policy-refresh — 7-framework registry (V2)
│   ├── payment/      @bizlegal/payment — NOWPayments + PayPal + LemonSqueezy + Paddle clients (Z3)
│   ├── turnstile-verify/ @bizlegal/turnstile-verify — server-side Turnstile verification helper
│   ├── turnstile-widget/ @bizlegal/turnstile-widget — client-side Turnstile widget wrapper
│   ├── ops-heartbeat/ @bizlegal/ops-heartbeat — TS + Python heartbeat client (PLATFORM-BUILD P1)
│   ├── api-client/   @bizlegal/api-client — typed hub API client + OpenAPI spec (P2)
│   └── bizlegal-debug/ @bizlegal/debug — Python debug shim: trace replay + breakpoints (P4)
├── agents/           AGENTS.md + agent prompt seeds + WAT specs
│   ├── ea/           Executive Assistant brain — prompts, schemas, templates, context (Z1.F)
│   └── socials/      Consent-based social acquisition plans, skills, and prompt seeds
├── decisions/        all planning + ops docs (single canonical location)
│   └── strategy/     SKOOL-NATE strategy chapters (01-11) + THE-MACHINE + master plans (Z1.G)
├── infrastructure/   Caddyfile, docker-compose, systemd units, Hetzner/OCI provisioning
├── supabase/         consolidated migrations (chronological YYYYMMDD_<app>_<feature>.sql)
└── scripts/          audit-vault.mjs + audit-operating-book.mjs (Z2.5)
```

---

## 2 — The WAT mechanism (Workflows / Agents / Tools)

Every new piece of work decomposes into three layers:

- **Workflow** (markdown SOP): the objective, required inputs, which tools to use, expected outputs, edge cases. Lives in `decisions/workflows/<task>.md` or per-app `apps/<x>/docs/workflows/`.
- **Agent** (you, Claude, or a subagent): reads the workflow, runs tools in the correct sequence, handles failures, asks clarifying questions. Connects intent to execution.
- **Tool** (deterministic code): Python script, TS function, API call, deployed endpoint. Located in `apps/`, `services/`, or `packages/`.

Why the separation: probabilistic AI handles reasoning; deterministic code handles execution. If each step is 90% accurate, you're at 59% after 5 steps. Offloading execution to scripts keeps accuracy compound-friendly.

When you find a problem:
1. Look in `apps/`, `services/`, `packages/` for an existing tool. **Don't write a new one if one fits.**
2. If new code needed: workflow first, then agent runs it, then tool ships.
3. Update the workflow when you learn (rate limits, regulator quirks, recurring failure modes).

---

## 3 — The HMAC chain (the spine of /ops)

Every event flows through one shared HMAC secret:

```
                 BIZLEGAL_INBOUND_SECRET (same hex on all 11 surfaces)
                                  │
   ┌──────────────────┬───────────────────┬─────────────────────┬──────────────────┐
   │                  │                   │                     │                  │
[Hub]              [Worker]            [Curator]              [OCI]            [Hub FAQ Bot]
apps/hub           services/worker     services/hetzner       services/oci     services/telegram-hub
/api/ops/log       src/ops-log.ts      ops_log.py             ops_log.py       (Z4.2 — TBD)
   │
   ├─ verifies ALL inbound POSTs from Worker / Curator / OCI / 6 subdomains
   ├─ subdomains' /api/inbound-lead also use the same secret to verify HMAC from Worker
   └─ /api/ops/feed + /api/ops/health are token-gated (OPS_DASHBOARD_TOKEN), separate from HMAC
```

Self-test: `https://bizlegal-ai.com/ops/health?t=$OPS_DASHBOARD_TOKEN` — green when chain is healthy.

---

## 4 — Canonical env vault (the only place values live)

**`C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt`** — single source of truth, ~183 unique env names, never committed to git.

**Read first.** When you need a value, `grep` the vault. When you need to confirm a key is set, `grep -c "^X=" vault` returns 1 if present.

**Write first, then deploy.** When you generate a fresh secret (`openssl rand -hex 32`), append it to the vault BEFORE pasting downstream.

**Never print values to chat.** Names + presence only.

The pre-commit hook in this repo (Z2.5) BLOCKS any commit that introduces a `process.env.X` / `os.getenv("X")` reference for a name not present in the vault. This is mechanical, not advisory.

---

## 5 — Operating Book Discipline (the rule that keeps this self-documenting)

Every PR that:

- Adds a new env var → MUST append `X=` to the canonical vault before commit. Pre-commit hook blocks otherwise.
- Creates a new dir under `apps/`, `services/`, `agents/`, `packages/` → MUST add `<new>/CLAUDE.md` (10-20 lines) AND a one-liner pointing at it from this file. Pre-commit hook blocks otherwise.
- Adds a new event type to `lib/ops/log.ts` → MUST update `agents/AGENTS.md` event-type table.

A future Claude Code session SHALL refuse to merge a PR that fails the operating-book check. Don't bypass — fix the check.

---

## 6 — Hard rules (Phase Z — until Z7 verifies green for 24h)

1. **No new features.** V3-V7 agents parked indefinitely.
2. **No new payment URL constants.** `NEXT_PUBLIC_NOWPAYMENTS_*_URL` and `NEXT_PUBLIC_PAYPAL_*_URL` are deprecated; `apps/hub/app/api/pay/start` builds checkout URLs on the fly via `@bizlegal/payment`.
3. **No new event types** beyond what's already merged (40+ in `packages/ops-log/src/index.ts`).
4. **No new entries on /agents page.**
5. **No real money taken** until Z7 verification matrix runs all GREEN for 24 consecutive hours.
6. **Stabilization first.** Frustration > ambition until the chain is solid.
7. **Outbound is inbound-only.** We email people who contacted us and confirmed. No
   prospect scraping, no cold senders, no purchased or guessed addresses — in any repo,
   on any branch. The cold path was deleted 2026-08-16 after it was found running on
   every 10-minute tick with no approval step and a kill-switch that failed open
   (`fc_flags` had no migration). Do not reintroduce it; a "gated" cold sender is still
   a cold sender.

When in doubt, ask: "does this advance Z0-Z7 verification or does it add scope?" If it adds scope, defer to post-Z7.

---

## 7 — Where we are right now (2026-07-17)

Phase Z complete. Current phase: **Phase AA — first revenue & traffic growth.**

**Revenue engine status (2026-07-17):**
- DocAI $97 scan: crypto + card checkout live; IPN hardcoded to production (commit f551154). Awaiting first test buy (Moses-only).
- Salesperson agent: live, `--draft-only` mode. Sales dashboard at `/sales` for Moses approval.
- Cohort-2 revenue agents deployed 2026-07-16: `aeo_revenue_agent` (07:00 UTC), `conversion_funnel_agent` (08:00 UTC), `enterprise_closer_agent` (09:00 UTC). All draft to `sales_outreach`; Moses approves at `/sales`.
- `/api/sales/drafts` approve flow now sends via Resend (fixed 2026-07-16, was silently dead before).
- `sales_cap` hard limits in DB: `max_outreach_per_day=3`, `require_approval_for_drafts=1`, `auto_approve_after_hours=0`.

**Phase Z retrospective:**
- Z0 ✅ Env triage: Vercel envs set, all 5 subdomain builds READY
- Z1 ✅ Monorepo migration: complete
- Z2 ✅ Operating book + enforcement: pre-commit hooks, vault audit live
- Z3 ✅ Payment gateways: `@bizlegal/payment` pkg, NOWPayments + PayPal + IPN hardened
- Z4 ✅ Telegram: `TELEGRAM_HUB_TOKEN` + `TELEGRAM_MOSES_CHAT_ID` wired, ops alerts live
- Z5 ✅ /ops: `/ops/snapshot`, `/ops/health`, `/api/ops/feed` all live
- Z6 ✅ Hetzner content engine: 47 agents, curator pipeline, orchestrator live
- Z7 ⏳ End-to-end verification: awaiting first real crypto buy (Moses action — see `decisions/JULY10-FIRST-REVENUE.md`)

**Moses-only remaining actions to unlock revenue:**
1. Rotate `NOWPAYMENTS_API_KEY` + `IPN_SECRET` (most urgent)
2. Do $0.50 test crypto buy at `docai.bizlegal-ai.com`
3. Top up Anthropic API credits (kills all LLM agents when $0)
4. Create 7 Plausible domain properties (traffic is invisible until this is done)
5. Replace `[Moses's Full Name]` / `[J.D.]` placeholders in 3 byline articles, then publish

Live status: `https://bizlegal-ai.com/ops/health?t=$OPS_DASHBOARD_TOKEN`

---

## 8 — Decisions index

Every planning + ops doc lives in `decisions/`:

- `decisions/MOSES_OPS_HANDOFF.md` — Moses-task checklist (Phase A subset of Z0)
- `decisions/PARAMETERS_RUNBOOK.md` — disaster recovery for every env across 10 surfaces
- `decisions/PAYMENT_URLS_VAULT.md` — DEPRECATED post-Z3; archive only
- `decisions/MONOREPO_AGENT_PROMPT.md` — original phased prompts; Z1 of this Phase Z plan supersedes
- `decisions/OUTREACH_KIT.md` — Reddit / LinkedIn / X / HN templates per spear product
- `decisions/AGENTS_BRAINSTORM_V2.md` — V3-V7 candidates (parked indefinitely)
- `decisions/MRR_30K_PATH.md` — 30/60/90/120 day milestones
- `decisions/MASTER_FUNNEL.md` — lead → product → payment → email lineage
- `decisions/AGENTS_BRAINSTORM.md` — original V1 brainstorm (10 agents shipped from this list)
- `decisions/SEO_FIXES.md` — long-tail keyword audit
- `decisions/DASHBOARD_AGENT_PROMPT.md` — added in Z5
- `decisions/OPENCLAW_ROLE.md` — added in Z6
- `decisions/POST_CUTOVER_PUNCH_LIST.md` — 5 RED items after Vercel cutover (Cloudflare DNS + Vercel Preview env, Moses-only fixes)
- `decisions/WEEKLY_ROUTINES_AND_SEO.md` — full UTC schedule of crons / timers / event-driven services (every cron mapped Sun-Sat by surface) + programmatic SEO audit (3 gap pages currently, 6 P0/P1 improvements scoped at ~11h total work)
- `decisions/PHASE_AA_NEXT_STEPS.md` — Post-Phase-Z roadmap: workspace map + daily runbook + 6-gate article quality system + Paddle/LS application criteria + 3-week SEO 95+ plan. Read this when planning the next sprint.
- `decisions/LOW_RISK_DOCAI_FUNNEL.md` — consent-based DocAI acquisition wrapper: bot safety gate, classifier precision gate, Z7 definition, 14-day revenue review.
- `decisions/DOCAI_FUNNEL_COMPLETION_REPORT_2026-05-16.md` — DocAI funnel completion, payment env blockers, and go-live test order.
- `decisions/FUNNEL-MVP-MIGRATION-2026-05-24.md` — [DELETED by revert 2026-05-24] see FUNNEL-CANONICAL-IS-DOCAI instead
- `decisions/FUNNEL-CANONICAL-IS-DOCAI-2026-05-24.md` — Decision: single canonical contract-risk funnel is apps/docai/web/; funnel-mvp was a parallel duplicate, reverted same-day.
- `decisions/DAILY-WEEKLY-OPS-RUNBOOK.md` — A–Z daily/weekly ops actions, phase gates, emergency runbooks (incl. failed-Vercel-build / HTTP 500 fix).
- `decisions/PASSIVE-INCOME-5K-PLAYBOOK.md` — Blog/forge/hub monetization toward $5K/mo: honest traffic math, what shipped (bizlegal-ea PR #11 — AdSense/schema/CTA/IndexNow), Moses action list (GSC + AdSense + CF env), growth levers. Note: blog.bizlegal-ai.com is a separate CF-Pages engine (209 posts, 5/wk) in the bizlegal-ea repo, not this monorepo.
- `decisions/SEO-SUBSCRIPTION-10K-MRR-PLAN.md` — Comprehensive SEO + subscription plan for $10K MRR: 15 PayPal plan IDs (priority order + Vercel env names), blog content pillars × 8 (BOI/VARA/SOC2/GDPR/crypto/PSP/SG/India), on-page schema todos, 16-post monthly content calendar, 30/60/90-day MRR milestones.
- `decisions/AEO-AUSTIN-ARMSTRONG-2026-07-02.md` — Austin Armstrong 5-prompt AEO research synthesis: 40 buyer-intent phrases (19 OPEN), competitor citation gap map, 90-day content calendar (5 pillars/40 clusters), 25 weak-AI-answer opportunities, 10 generated MDX posts seeded to daily_gaps, 28 cold email drafts (4 verticals) seeded to lead_outreach.
- `decisions/MRR-40K-90-DAY-PLAN-2026-07-02.md` — 4-engine plan (E1 self-serve / E2 outbound high-ticket / E3 AEO-SEO / E4 OCI deals) targeting $10K MRR base / $25-34K stretch by 2026-09-30. **Committed target: $10K with every stage proven.** Week 1 is a hard gate (~$3.5h of Moses clicks: DocAI URL fix, one real $97 purchase, top-5 PayPal plans, **CF AI-crawler unblock**, GSC/Bing verify, Plausible). Paid tools ≤$470/mo. Kill criteria at days 14/30/45.
- `decisions/EXPANDED-REVENUE-STREAMS-2026-07-02.md` — 16 additional income streams the E1-E4 plan doesn't cover, across 8 categories (marketplace, content monetisation, data products, community, education, API, capital/grants, customer-funded pilots). Total uncapped 90-day ceiling: $25-100K/mo blended + $30-50K one-time. **5 streams shippable in 11.5h this week (consulting, wire/ACH, affiliate program, pilot offer, cloud credits)** — adds $5-30K one-time + recurring leverage without waiting for the Google sandbox.
- *current plan is at `~/.claude/plans/concurrent-bouncing-kitten.md` (lives outside the repo since plans are per-session ephemera)*

- `decisions/DEPLOYMENT_MAP.md` — authoritative Hetzner box map: CX33, real paths, docker containers (:5678 n8n, :8080 marimo), curator systemd units, openclaw user-unit, Ollama (mistral-nemo), deploy runbook. Updated 2026-06-14.
- `decisions/JULY10-FIRST-REVENUE.md` — Moses-only 33-minute checklist for first revenue by July 10: rotate NOWPAYMENTS_API_KEY + IPN_SECRET (most urgent), top up Anthropic credits, rotate Resend key, fix PayPal credentials, do $97 test purchase. All code is deployed and correct as of commit f551154.
- `decisions/workflows/learn_course_authoring.md` — WAT SOP for authoring a `/learn` lesson. Two methods for two tracks: **interview-first** (Real Estate — 10 questions to Moses, who is the practising real-estate lawyer, so his review IS the E-E-A-T) and **guide-synthesis** (Founders — compress an existing guide from `lib/guides.ts`, link it as the reference). Hard constraints: no CLE/CPE credit claims, no invented case studies (`founderNote` stays a visible placeholder), no fabricated stats, CTAs only to live surfaces, prose in double-quoted strings (SWC breaks on apostrophes in single quotes).
- `decisions/workflows/learn_nurture.md` — WAT SOP for the `/learn` email sequence: 5 emails / 18 days, double-opt-in only (the 2026-07-10 rule applies without exception), track-segmented via `vertical_interest`. Email 5 asks the price question directly — a reply is the demand signal, since checkout is dark. Decision rule: build out only the track that gets yes-replies; both silent means `/learn` stops at Phase 0.
- `decisions/VERCEL-PUSH-NOT-DEPLOYING-2026-07-29.md` — **Read before trusting any push.** Vercel stopped processing pushes account-wide (all 7 projects at once) after `175e87b`; `de0d387` + `1888962` are on GitHub with zero deployment records, so production still serves `175e87b`. Contains the `gh api .../deployments` command that distinguishes "not deployed" from "deployed and broken" (curling the URL cannot), the two-project-link trap (deploy the hub from the repo ROOT — `apps/hub/.vercel` points at a dead stray project), and the Moses-only fix.
- `decisions/TRIO-PROPSIGNAL-LEASEPARSE-CLOSEFLOW-2026-07-28.md` — 3 new real-estate-adjacent surfaces (property risk reports / lease abstracting / closing checklists), $200/mo budget cap on the Ollama+Claude+Perplexity stack, shared liability-shield TOS, cross-sell spine via trio_properties, build order CloseFlow → LeaseParse → PropSignal. SCAFFOLD ONLY — checkout dark, migrations unapplied, nothing deployed.

When you write a new decision, add it here.

---

## 9 — How to deploy each surface

| Surface | Deploy mechanism |
|---|---|
| `apps/<x>/` | Vercel auto-deploys on push to `main`. Each Vercel project's "Root Directory" points at `apps/<x>` (Moses sets per project after first monorepo build verifies). |
| `services/hetzner/` | **No git repo on box.** SCP changed files: `scp -i ~/.ssh/id_ed25519 services/hetzner/<file>.py root@204.168.209.235:/opt/bizlegal/curator/` → then `ssh root@204.168.209.235 "systemctl restart curator-bot curator-publisher"`. See `decisions/DEPLOYMENT_MAP.md`. |
| `services/oci/` | `ssh oci; cd /opt/bizlegal-monorepo; git pull; docker compose -f services/oci/docker-compose.yml up -d --build` |
| `services/worker/` | `cd services/worker; pnpm wrangler deploy` |
| `services/telegram-hub/` | `cd services/telegram-hub; pnpm wrangler deploy` (after Z4.2) |

---

## 10 — How a new agent / subagent should start

1. **Load the `bizlegal-session-start` skill** (or follow `AGENTS.md` at repo root — it's the same flow). It reads memory, this book, the ops runbook, and the orders queue (`C:/Users/Moshe Dor/orders/ORDERS.md`), prints a brief, and begins the top pending order.
2. **Read this file.**
3. **Read `decisions/DAILY-WEEKLY-OPS-RUNBOOK.md`** for current operational state.
4. **Run `/api/ops/health`** to see what's actually live vs what the docs claim.
5. **Pick the smallest possible cut of the next-up phase from Z0-Z7** (or the top pending order in the queue).
6. **Follow Operating Book Discipline** (Section 5) — every PR keeps the book + vault current.
7. **Verify before moving on** — each phase has a binary verification gate. Don't proceed without green.

If you see a doc contradicting current code: **trust the code; update the doc**. Stale docs are worse than missing docs.

If you see code contradicting the user's stated intent: **trust the user; fix the code**. Moses is the source of truth on what BizLegal-AI is for.


