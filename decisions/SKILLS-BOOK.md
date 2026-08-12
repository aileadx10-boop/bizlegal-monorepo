# BizLegal AI — Skills Book

Session-start skills and high-leverage frameworks Moses uses every session.
Updated: 2026-08-13

---

## SESSION SKILLS (use every session)

### 0. bizlegal-session-start (RUN FIRST — every new session)
The default entry point. Reads memory → the operating book (CLAUDE.md, this book, ops runbook, standing orders) → the orders queue (`C:/Users/Moshe Dor/orders/ORDERS.md`) → prints a one-screen "where / what's next / blocked on Moses" brief → begins the top pending order autonomously. Auto-loaded via AGENTS.md in both `bizlegal-monorepo/` and `Firmcited/`. If you are ever unsure what to do, run this.

Companion skills:
- **bizlegal-file-order** — file a new order into the queue (`orders/O-<ID>-<slug>.md` + row in ORDERS.md).
- **bizlegal-orders** — show the queue / what's next / what's blocked without the full flow.
- **firmcited** — FirmCited-specific book (offers, real-money gate, Moses ops) for Firmcited sessions.

### 1. session-handoff
Before any `/clear`, produce a structured handoff so the next agent picks up without losing state.

Sections: Where it started / Decisions locked + what shipped / Key files / Running state / Verification / Deferred + open questions / Pick up here.

Rules: chat-only, absolute paths, never invent state, include shell IDs for background processes.

### 2. roast
Before building anything, convene a 5-persona council to tear the idea apart.

Personas (run in parallel): Contrarian (red team) / Expansionist (bull) / Logician (first principles, no web) / Researcher (web search, evidence) / Buyer (target customer voice).

Judge verdict output: GO / RESHAPE / KILL + cheapest 48-hour validation test.

---

## HIGH-LEVERAGE FRAMEWORKS

### $40K Upfront + 20% Rev Share (custom AI build model)
Source: Kobe Shemesh / AIS+ / SKOOL-NATE

**What it is:** One custom AI system built for a specific client. Two income streams:
1. $40K one-time build fee (covers your time + margin)
2. 20% of revenue the client generates from using the system (recurring upside)

**Why it works:** Clients pay premiums for depth over breadth. A tool built specifically for their system is worth 10x a SaaS subscription. The rev share aligns incentives — you win when they win.

**BizLegal AI application:** See `decisions/40K-REVSHARE-PLAYBOOK.md`

---

## OPERATING FRAMEWORKS

| Framework | What it does |
|---|---|
| WAT (Workflow → Agent → Tool) | Decompose every task: markdown SOP → LLM → deterministic script |
| HMAC Chain | Every event signed with BIZLEGAL_INBOUND_SECRET before posting to hub |
| Phase Z | Z0-Z7 verification gates; no new features until Z7 holds GREEN 24h |
| THE MACHINE | 8-agent WAT system running on Hetzner cron; `services/agents/orchestrator.py` |
