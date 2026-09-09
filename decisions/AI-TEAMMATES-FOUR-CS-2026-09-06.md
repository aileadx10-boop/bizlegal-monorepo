# AI Teammates, the Four Cs, and why Grok Bot is not in BizLegal (2026-09-06)

**Status:** decided · **Owner:** Moses · **Plan:** `~/.claude/plans/proud-drifting-wolf.md` · **Order:** O-018

## 1. Decision

BizLegal does **not** adopt Grok Bot (xAI's "AI teammates" app) as an internal or customer-facing agent layer, and does **not** sell Grok Bot setups. Moses confirmed both on 2026-09-06. The framework the product popularised is kept and used as an audit lens; the platform is not.

**Why (verified 2026-09-06):**
- Grok Bot launched 2026-08-11 in early beta and is only bundled with SuperGrok Heavy ($300/mo), Cursor Ultra ($200/mo) or Cursor Premium Teams ($120/seat/mo); organisations are waitlisted; there is no spend cap and no model picker, and overage is billed at token cost. One seat exceeds the standing ≤$200/mo cap that holds until G1. (eesel.ai/blog/grok-bot-pricing; VentureBeat, 2026-08-11.)
- Any buyer of a "setup" would also need that subscription; a small firm cannot justify it and an organisation may not be able to get it.
- Connecting a US-hosted beta consumer product with consumer terms and no visible DPA to another firm's mailbox is the highest-liability form of the idea for a licensed attorney.
- BizLegal already has every element of the framework: context (the operating book + memory), connections (HMAC chain, Supabase, `@bizlegal/email` consent gate, claude.ai connectors), capabilities (WAT workflows, skills, agent prompts), cadence (Vercel crons, Hetzner timers, n8n, Claude Code cloud routines), logging (`ops_events`, `/ops/audit` hash chain), approvals (`/sales`). The bottleneck is demand, not orchestration.

## 2. Re-open gate

All three must hold before this decision is revisited:
1. G1 passed (first stranger dollar, per O-017).
2. Grok Bot has a business terms of service, a data-processing agreement, and a spend cap.
3. A paying engagement requires it and its subscription cost sits inside that engagement's price.

## 3. The Four Cs as an audit lens (what changed in BizLegal, and only this)

| Element | Already live | Change made under O-018 |
|---|---|---|
| Context | root `CLAUDE.md`, memory, `agents/AGENTS.md` | none |
| Connections | HMAC chain, Supabase, `@bizlegal/email` (consent enforced inside the package), Telegram, claude.ai connectors | none |
| Capabilities | WAT workflows, skills, EA task prompts | **verification line** appended to `COMMON_TONE` in `apps/hub/lib/agents/prompts.ts`: *"Before output, confirm every number you cite appears in the JSON; delete any that does not."* Mirrored in `agents/ea/prompts/ops/README.md` (which also lost the stale row for the daily pitch-suggestion task that was deleted with the unsolicited-outreach path on 2026-08-16). |
| Cadence | 147 scheduled jobs (to be consolidated to ~12 per O-017) | **replace, don't add** — see §4. Net cron count goes down by one when the routine is live. |
| Logging / approvals | `ops_events`, `/ops/audit`, `/sales` | none |
| Customer-facing agents | DI-3 free Deal Audit is the demand test (blocked on Moses's Dubai pack review) | **none** until DI-3 has real uploads |

Nothing else was added. A full agent/cadence map was deliberately not written: it duplicates the cron-manifest work in O-017 and would disclose architecture for no revenue.

## 4. Routine spec — morning brief that survives $0 API credit

**Problem.** `daily-revenue-digest` (`apps/hub/vercel.json:68`, 08:00 UTC) calls Haiku through `ANTHROPIC_API_KEY` and posts to Telegram. When the API credit is $0 — which O-017 records as a repeated failure — it dies silently, and Moses's only daily brief with it.

**Replacement.** One Claude Code cloud routine (`schedule` skill / `RemoteTrigger`), same hour, delivering **in writing to Moses's own inbox** via the Gmail connector. It runs on the Claude Code plan this session runs on, not on the API key. *Assumption to confirm on the first run: billing lands on the Claude plan, not the API balance.*

- **Name:** `bizlegal-morning-brief`
- **Cron:** `0 8 * * *` (UTC) — Moses confirms the local hour; 08:00 UTC = 11:00 Asia/Jerusalem while DST holds.
- **Model:** `claude-sonnet-5`
- **Connectors:** Supabase, Vercel, Gmail (all currently connected per the skill roster)
- **Repo source:** `https://github.com/aileadx10-boop/bizlegal-monorepo`
- **Allowed tools:** `Read`, `Grep`, `Glob` (no Bash, no Write — it reads and reports)
- **Prompt (self-contained; the cloud agent starts with zero context):**

```
You are BizLegal AI's morning brief. Read-only. Do not modify the repo, do not
send anything to anyone except the one email described below.

1. Using the Supabase connector, count rows in payment_orders created in the
   last 24h grouped by status, and list any row whose user_email is not
   dorlaw2014@gmail.com and whose status is 'active' or 'paid' — that is the
   G1 signal and must be the first line of the email if present.
2. Count fc_leads and inbound_leads rows created in the last 24h.
3. Using the Vercel connector, list deployments in the last 24h for the
   project bizlegal-ai with state ERROR or CANCELED.
4. If every count is zero and there are no failed deployments, send NOTHING
   and finish. Otherwise send ONE email via the Gmail connector to
   moses@bizlegal-ai.com, subject "BizLegal brief <date>", plain text, under
   200 words: TL;DR line, then the facts, then one suggested next action.
Never invent a number. Before sending, confirm every number in the email
appears in a tool result; delete any that does not. If a connector fails,
send the email with the failure named as the first line.
```

**Status (2026-09-06).** Created as routine `trig_01KnJFgDS2TfZhL8uYX9Vomf` (https://claude.ai/code/routines/trig_01KnJFgDS2TfZhL8uYX9Vomf), cron `0 8 * * *` UTC, enabled; first test run fired 04:42 UTC the same day and finished **QUIET** (success, 30 turns, 434 s): the Supabase connector timed out repeatedly, the prompt's retry rule kept it going, and the final counts matched a direct probe (0 orders / no G1 rows / 0 leads / no failed deployments), so nothing was sent — the zero-delta path is verified. The G1-detector path (a non-Moses paid row) is not yet exercised. Moses adjusts the hour in the routine if 11:00 Asia/Jerusalem is wrong. The deployed prompt adds two things the spec above omits: the brief goes to the connected Gmail account's own address (not moses@bizlegal-ai.com, whose existence is unconfirmed), and `mdmdmd63@gmail.com` is excluded from the G1 signal alongside `dorlaw2014@gmail.com`.

**First-run diagnosis (04:49 UTC).** The Supabase project (`ydghhcuuopqzgqcicubg`, ap-southeast-2) reports `ACTIVE_HEALTHY` and answered the same four-count query instantly from a local session (orders_24h 0 · g1_rows_30d 0 · fc_leads_24h 0 · inbound_leads_24h 0), so a correct run today ends `QUIET`. The repeated "connection terminated due to connection timeout" errors are therefore in the cloud sandbox's Supabase connector, not the database. If the scheduled runs keep failing the same way, the fallback is to let the routine read the counts through the hub's token-gated `/api/ops/feed` instead of the connector (no new secret: `OPS_DASHBOARD_TOKEN` already exists), which is a one-line prompt change.

**Cut-over.** The routine was created without waiting for the hour confirmation (Moses asked for everything to be built, with his own actions collected as a to-do list). `daily-revenue-digest` stays in `vercel.json` and `TASKS` until the first *scheduled* fire (2026-09-07 08:00 UTC) is also clean; then a session removes the cron entry, the `TASKS` entry and the README row in one commit. The `daily-revenue-digest` entry in `apps/hub/vercel.json` and its `TASKS` entry in `apps/hub/lib/agents/prompts.ts` are removed **in the same PR** once the routine has fired cleanly (a synthetic non-Moses `payment_orders` test row must trigger the email, and a zero-delta day must send nothing).

## 5. The two-page proof excerpt (the only part of the system shown to readers)

The article `content/blog/checks-before-an-ai-agent-touches-your-inbox.mdx` describes, truthfully and generically, what BizLegal's own agents do: every run logs to an append-only audit trail (`/ops/audit`), nothing is sent to a person who did not opt in (`@bizlegal/email`), drafts wait for approval (`/sales`). No architecture, agent counts, or infrastructure details are published. A 47-agent map with zero revenue is not proof to a lawyer; a log page and a consent gate are.

## 6. What was explicitly rejected

- Grok Bot as internal chief-of-staff / inbox / logger / meetings / brief layer.
- Selling Grok Bot setups, templates, or retainers to law firms or compliance SMBs.
- Any live delivery (calls, workshops, demos) — see `decisions/PHASE-1-INTROVERT-FOUNDER.md`.
- Customer-facing conversational agents before DI-3 has real uploads.
