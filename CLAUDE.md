# BizLegal-AI Monorepo — Operating Book

**Read this file first.** Every Claude Code session, every subagent, every new agent (Codex, Cursor, manual hire) starts here.

**Last consolidated:** 2026-05-24 (Phase RR-2 — Canonical funnel is DocAI)
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
│   └── blog/         blog.bizlegal-ai.com (curator-fed MDX content; CF Pages)
├── services/         non-Vercel runtimes
│   ├── hetzner/      curator pipeline: scout/brain/publisher/bot (Python, systemd) [Z1.C-pending]
│   ├── oci/          deal-router (FastAPI, Docker, Caddy + Cloudflare Tunnel) [Z1.C-pending]
│   ├── worker/       Cloudflare Worker — bizlegal-lead-intake (TS, wrangler) [Z1.C-pending]
│   ├── telegram-hub/ CF Worker — @BizlegalHubBot customer FAQ (Z4.2)
│   ├── gsc-bot/      CF Worker — weekly GSC sitemap re-submission across 8 surfaces
│   └── funnel-mvp/   TOMBSTONED 2026-05-24 — canonical is apps/docai/web/ (Fastify, never deployed; git-history reference only)
├── packages/         shared TS + Python siblings
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
│   └── turnstile-widget/ @bizlegal/turnstile-widget — client-side Turnstile widget wrapper
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

When in doubt, ask: "does this advance Z0-Z7 verification or does it add scope?" If it adds scope, defer to post-Z7.

---

## 7 — Where we are right now

Read `decisions/concurrent-bouncing-kitten.md` — the current Phase Z plan. Z0-Z7 progress:

- **Z0 — Env triage:** Moses-owned, Vercel UI clicks. Status: pending.
- **Z1 — Monorepo migration:** in progress. This file is part of Z1.A.
- **Z2 — Operating book + enforcement:** in progress. This file IS Z2.1.
- **Z3 — Payment gateways in code:** queued.
- **Z4 — Telegram fleet:** queued. Ops alerts already wired (`apps/hub/app/api/cron/ops-alerts`); needs `BIZLEGALBOT_TOKEN` set on hub Vercel.
- **Z5 — Datadog-feel /ops:** doc-only this session.
- **Z6 — OpenClaw + Ollama tunnel:** queued.
- **Z7 — End-to-end verification:** decision day.

Live status: `https://bizlegal-ai.com/ops/health?t=$OPS_DASHBOARD_TOKEN` (after Z0 sets the token).

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
- *current plan is at `~/.claude/plans/concurrent-bouncing-kitten.md` (lives outside the repo since plans are per-session ephemera)*

- `decisions/DEPLOYMENT_MAP.md` — authoritative Hetzner box map: CX33, real paths, docker containers (:5678 n8n, :8080 marimo), curator systemd units, openclaw user-unit, Ollama (mistral-nemo), deploy runbook. Updated 2026-06-14.

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

1. **Read this file.**
2. **Read `decisions/concurrent-bouncing-kitten.md`** for current state.
3. **Run `/api/ops/health`** to see what's actually live vs what the docs claim.
4. **Pick the smallest possible cut of the next-up phase from Z0-Z7.**
5. **Follow Operating Book Discipline** (Section 5) — every PR keeps the book + vault current.
6. **Verify before moving on** — each phase has a binary verification gate. Don't proceed without green.

If you see a doc contradicting current code: **trust the code; update the doc**. Stale docs are worse than missing docs.

If you see code contradicting the user's stated intent: **trust the user; fix the code**. Moses is the source of truth on what BizLegal-AI is for.


