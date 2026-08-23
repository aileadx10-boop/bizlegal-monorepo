# Hermes Standing Orders

**Effective:** 2026-07-04 (updated 2026-08-23)  
**Owner:** Moses Dor (BizLegal AI)  
**Scope:** Every session where Hermes (Claude Code / EA) is active

These orders run in EVERY session, no exception. They take precedence over session-specific goals.

---

## O0 — Session Start From the Book + Orders (run first)

At the very start of every session, load the `bizlegal-session-start` skill and follow it end-to-end:

1. Read memory (`~/.claude/projects/C--Users-Moshe-Dor/memory/MEMORY.md`)
2. Read the book: `CLAUDE.md`, `decisions/SKILLS-BOOK.md`, `decisions/DAILY-WEEKLY-OPS-RUNBOOK.md`, `agents/HERMES-STANDING-ORDERS.md` (FirmCited sessions: also `Firmcited/AGENTS.md`, `OPS.md`, `vertical.config.ts`)
3. Read the orders queue (`C:/Users/Moshe Dor/orders/ORDERS.md` + top pending order file)
4. Print the one-screen brief (WHERE / WHAT'S NEXT / BLOCKED ON MOSES)
5. Begin the top pending order autonomously; mark it `in_progress` in its file first

Do NOT ask "what should I do?" — the queue answers. If it's empty, say so and stand by; never invent work from nothing. This replaces the old "find the plan manually" shuffle.

**Why:** Sessions were starting blind and re-deriving state. The queue + book make every session pick up exactly where the last left off.

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

## O8 — End-of-Session Handoff (MANDATORY, 2026-08-23)

Before the final message of EVERY session, persist state to disk so the next session starts where this one ended. This runs unconditionally on session end — do not wait until 70% context like O3.

**Required artifacts (write all that apply):**
1. `decisions/<topic>-<date>.md` — summary of what got built, what got decided, what's still open, and the exact next action. One file per topic, append-only.
2. `~/.claude/projects/c--Users-Moshe-Dor*/memory/MEMORY.md` + any `project_*.md` files — updated long-term memory entries.
3. New or updated skills under `~/AppData/Local/hermes/skills/` — for workflows learned this session that will recur.
4. Standup files, orders queue updates, agent registry rows if relevant.

**Triggers (any one fires it):**
- User says "wrap up" / "stop" / "done" / "that's it"
- Context window approaching 70% (cross-check with O3 — O8 is the broader rule)
- Session is winding down for any reason
- About to lose state (crash, timeout, kill signal)

**Hard rules:**
- Do NOT ask first — just do it. The handoff is mandatory.
- Do NOT skip even if "nothing happened" — confirm with a one-line `decisions/noop-<date>.md` that the session ended cleanly.
- The handoff must be self-contained: a fresh session reading only the handoff + O1 files can resume work without asking the user a single question.

**Why:** O3 covers emergency handoff at 70% context. O8 makes it the default at every session end. A session that does useful work and then disappears without a handoff is wasted time — the next session starts blind and re-derives the same state.

---

## Enforcement

These orders are self-enforcing via the SKILLS-BOOK (`decisions/SKILLS-BOOK.md`). If a session starts without following O1-O7, the downstream cost is multiplied for every session that follows. O8 is the same way — a session that does not produce a handoff has not really ended.
