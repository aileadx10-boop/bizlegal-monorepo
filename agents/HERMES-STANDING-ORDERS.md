# Hermes Standing Orders

**Effective:** 2026-07-04  
**Owner:** Moses Dor (BizLegal AI)  
**Scope:** Every session where Hermes (Claude Code / EA) is active

These orders run in EVERY session, no exception. They take precedence over session-specific goals.

---

## O1 — Memory First

At the start of every session:
1. Read `~/.claude/projects/c--Users-Moshe-Dor-bizlegal-monorepo/memory/MEMORY.md`
2. Read any memory files flagged as relevant to today's work
3. Do NOT begin any task without first checking for prior session state

**Why:** Without memory, every session starts blind. Compounding effort only works if prior findings are recalled.

---

## O2 — Roast Before Build

For any significant new build (new product, new agent, new pricing, new GTM) run `/roast` first.

Roast produces a GO / RESHAPE / KILL verdict from a 5-persona council. If RESHAPE: implement all suggested changes before shipping. If KILL: document why and move to the next candidate.

Exception: bug fixes, infrastructure fixes, documentation do NOT need a roast.

**Why:** The Kobe Shemesh $40K win came from a RESHAPE that dropped a bad 20% rev-share structure. Skipping the roast risks building the wrong thing.

---

## O3 — Session Handoff Before Context Compression

When approaching 70% of context window capacity:
1. Run `/session-handoff` immediately
2. Save the handoff summary to `memory/` as a `project_` type
3. Update `MEMORY.md` index

Do NOT wait until the session is almost full — that leads to truncated handoffs.

**Why:** Context is the only state that persists across sessions. Losing it is unrecoverable without the handoff artifact.

---

## O4 — Daily Standing Review (18:00 UTC)

At 18:00 UTC each day (via hub cron or Hetzner systemd), run the following checks:
1. Query `agent_runs` last 24h → check success rate (target ≥75%)
2. Query `lead_outreach` new rows since yesterday → confirm headhunter is queuing
3. Check `payment_orders` for any `status='completed'` rows → alert Moses via Telegram if revenue landed
4. Check Vercel build status for hub/docai/forge/lexaudit/brai → alert on any non-ready builds
5. Output summary to Telegram + log to agent_runs

If orchestrator success rate drops below 50% for 2 consecutive days: STOP other work and debug root cause.

**Why:** The 16/16 monetization fails in July 2026 went undetected for days. A daily review would have caught it the same day.

---

## O5 — Vault Before Commit

Any new environment variable MUST be appended to `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt` BEFORE being used in any code.

The pre-commit hook blocks commits that reference env vars not in the vault. Do NOT bypass with `--no-verify`.

If a new secret is needed: generate it (`openssl rand -hex 32` or equivalent) → append to vault → then reference in code.

**Why:** A secret committed before being vaulted is an unrecoverable leak risk.

---

## O6 — AGENTS.md Current

When a new agent, cron, or tool is added to the system:
1. Add a row to `agents/AGENTS.md` immediately
2. Include: name, purpose, schedule, location, status

Never ship a new agent without the AGENTS.md entry.

**Why:** The system has 40+ crons and 8 WAT agents across 3 compute surfaces. Without a current index, debugging is impossible.

---

## O7 — Verify Before Claiming Complete

After any build:
1. State clearly what the explicit verification test is
2. Run it (SSH test, curl test, unit test, type check — whatever fits)
3. Only claim "done" after the test passes

Never claim "done" based on code looking correct. Code that looks correct and code that runs correctly are different things.

**Why:** The Revenue Machine WP1-WP6 was claimed complete by a prior agent but had 0 committed files. The verification step would have caught this immediately.

---

## Enforcement

These orders are self-enforcing via the SKILLS-BOOK (`decisions/SKILLS-BOOK.md`). If a session starts without following O1-O7, the downstream cost is multiplied for every session that follows.
