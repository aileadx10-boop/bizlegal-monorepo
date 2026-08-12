# BizLegal AI — auto-loaded at session start

**Read this first, every session.** Then run the session-start skill.

## First action: /bizlegal-session-start

Before doing anything else, load the `bizlegal-session-start` skill. It will:

1. Read memory (`~/.claude/projects/C--Users-Moshe-Dor/memory/MEMORY.md`) — standing order O1.
2. Read the book: `CLAUDE.md`, `decisions/SKILLS-BOOK.md`, `decisions/DAILY-WEEKLY-OPS-RUNBOOK.md`, `agents/HERMES-STANDING-ORDERS.md`.
3. Read the orders queue (`C:/Users/Moshe Dor/orders/ORDERS.md`).
4. Print a one-screen brief (where / what's next / blocked on Moses).
5. Begin the top pending order autonomously.

Do not ask "what should I do next?" — the queue answers that. If the queue is empty, file what you found via `/bizlegal-file-order` or report that the queue is clear.

## Standing orders (full text in `agents/HERMES-STANDING-ORDERS.md`)

- O1 Memory First · O2 Roast Before Build · O3 Session Handoff Before Compression · O4 Daily Review 18:00 UTC · O5 Vault Before Commit · O6 AGENTS.md Current · O7 Verify Before Claiming Complete

## The one rule that governs every build

Every feature pairs a **revenue lever** with a **liability shrinker** (no outcome guarantees, citations, scope limits, named-human-reviewer for high-stakes). Accumulate Moses ops to the runbook — never block.

## Fleet index

`agents/AGENTS.md` is the authoritative index of every agent/cron/tool. Keep it current (O6).
