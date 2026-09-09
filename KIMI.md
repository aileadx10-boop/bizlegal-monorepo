# KIMI.md — Kimi Work entry point for bizlegal-monorepo

**Read this first in every Kimi Work session inside this repo.** It is a routing layer only — it points at the canonical sources and summarizes current state. Never duplicate content from the book files; when they disagree with this file, **the book files win and this file should be updated**.

**Owner:** Moses Dor (founder, BizLegal AI / DOR INNOVATIONS). **Mission:** compliance-as-a-service for B2B SaaS / fintech / DAOs / real-estate cross-border deals.
**Compiled:** 2026-09-09 from the operating book + decisions through 2026-09-08.

---

## 1 — Drive map (Moses's machine convention)

| Drive | Purpose | Handling |
|---|---|---|
| `C:\` | **Startups.** Code, workspaces, repos. `C:\Users\Moshe Dor\bizlegal-monorepo` (this repo), `C:\Users\Moshe Dor\Firmcited`, `C:\Users\Moshe Dor\orders` (order queue), env vault at `C:\Users\Moshe Dor\Downloads\env-hub-bizlegal-ai.txt` | Normal git discipline; vault values never printed, never committed |
| `D:\` | **Legal material, drafting, case files.** Hebrew powers of attorney (ייפוי כוח), case folders (eviction, deeds), client documents, HFNDOCS working files | Treat as privileged client work product: no commits, no copying into repos, no external upload, no cloud sync of contents. Read/edit in place only when asked. Client names stay out of chat and out of any app/database |

Never move legal material between the drives without Moses asking. Never mix D:\ content into anything deployed.

---

## 2 — Session start (do this before anything else)

1. Read this file, then the operating book: `CLAUDE.md` (the authoritative map), `decisions/SKILLS-BOOK.md`, `decisions/DAILY-WEEKLY-OPS-RUNBOOK.md`, `agents/HERMES-STANDING-ORDERS.md`.
2. Read the orders queue: `C:/Users/Moshe Dor/orders/ORDERS.md` + each `pending`/`in_progress` order file. Do not ask "what next" — the queue answers. If empty, say so and stand by.
3. Check current state, not stale docs: `https://bizlegal-ai.com/ops/health?t=$OPS_DASHBOARD_TOKEN` (token from the vault — grep it, never print it).
4. If relevant, skim the newest files in `decisions/` (sorted by date in the filename) — the latest truth wins over older plans.
5. Begin the top pending order; mark it `in_progress` in its file first.

---

## 3 — The system in one screen

- **WAT (Workflow → Agent → Tool):** every task decomposes into a markdown SOP (`decisions/workflows/<task>.md`), an agent that reasons, and deterministic code that executes. Look for an existing tool before writing one. Probabilistic reasoning, deterministic execution.
- **HMAC chain:** every cross-surface event is signed with `BIZLEGAL_INBOUND_SECRET` and POSTs to hub `/api/ops/log`. Hub verifies all inbound from Worker / Curator / OCI / subdomains.
- **Env vault:** `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt` is the single source of truth (~183 names). New env var → append to vault BEFORE code references it (pre-commit hook blocks otherwise; never `--no-verify`). Names + presence only, never values in chat.
- **Operating book discipline:** new dir under `apps|services|agents|packages` → needs its own `CLAUDE.md` + a one-liner in root `CLAUDE.md`; new ops-log event type → new row in `agents/AGENTS.md` (the fleet index, O6).
- **Surfaces:** 11 live (hub, docai, forge, brai [stop-sold], lexaudit, tracr, leadforge, bench, cited/FirmCited, blog [stale since 2026-07-27], router). Scaffolded, not deployed: propsignal, leaseparse, closeflow, coguard, **deal44** (built + verified 2026-09-07/08, needs a Vercel project). Full map: `CLAUDE.md` §1. Deploy paths: `CLAUDE.md` §9 — note the hub deploys from THIS repo's `apps/hub` on `main` (the old `BIZLEGAL PROJECTS/bizlegal-ai` repo is not the deploy source), and FirmCited deploys via Vercel CLI from `C:/Users/Moshe Dor/Firmcited`.

---

## 4 — Hard rules (bind every session, Kimi included)

1. **No new features** while Phase Z holds — stabilization first; frustration > ambition. Ask: does this advance verification or add scope?
2. **No new payment URL constants** — checkout URLs are built by `apps/hub/app/api/pay/start` via `@bizlegal/payment`.
3. **No new event types** beyond the merged set; no new `/agents` page entries.
4. **No real money taken** until the Z7 verification matrix holds green.
5. **Outbound = rule 7 v2** (`decisions/OUTBOUND-V2-RULE-7-AMENDED-2026-09-07.md`): verified addresses only; lawful basis recorded with `source_url`; **v1 scope is US CAN-SPAM — EU and Israel are excluded** (Israel s.30A opt-in); suppression/unsubscribe live inside `@bizlegal/email`; fail-closed caps (`sales_cap` + `OUTBOUND_AUTOSEND`); per-campaign Moses approval on `/sales`; dedicated warmed domain `notes.bizlegal-ai.com` via Instantly — **never Resend, never `intelligence.bizlegal-ai.com`**; counts from tables, never from an agent's report. Still forbidden: guessed addresses, role inboxes, LinkedIn automation, calls in any template, legal answers from the machine.
6. **Every feature pairs a revenue lever with a liability shrinker** (no outcome guarantees, citations, scope limits, named-human-reviewer on high-stakes).

---

## 5 — Standing orders (full text: `agents/HERMES-STANDING-ORDERS.md`)

O0 session start from book + queue · O1 memory first · O2 roast before build (GO/RESHAPE/KILL council for significant new builds; bug fixes exempt) · O3 handoff before context compression · O4 daily standing review 18:00 UTC · O5 vault before commit · O6 `agents/AGENTS.md` current · O7 **verify before claiming complete** — state the test, run it, only then say done · O8 end-of-session handoff to a dated `decisions/<topic>-<date>.md` (self-contained: next session must resume with zero questions).

---

## 6 — Current state (verified 2026-09-08 night audit)

- **11 surfaces serve HTTP 200, but $0 in real revenue has ever been captured.** Production is ~31 commits behind work shipped 2026-09-01→07; two of three money-loop engines are built-and-dark, not deployed.
- Built and verified but dark: **DEAL44** rooms (Hebrew/RTL deal rooms, ₪2,500/transaction Phase 0), **Practice Revenue Report** (`/practice-revenue`, free totals → $99), **outbound v2 engine** (sends dark until `OUTBOUND_AUTOSEND=1`).
- Open fleet bugs worth remembering: `/api/pay/start` 503s every non-USD product (PayPal can't settle ILS; crypto rail prices ILS fine); the `payment_orders` wire-gateway CHECK was fixed in `20260908_deal44_rooms.sql`; Next.js fetch cache can silently stale Supabase reads in crons — `cache: 'no-store'` in the client (deal44 has the fix; LeaseParse/CoGuard likely share the bug).
- Moses-only gates recur: Anthropic API credits at $0 kill all LLM agents; Vercel projects/DNS; campaign approvals; test purchases.

---

## 7 — Latest decisions (newest first; full index in `CLAUDE.md` §8)

- `NIGHT-AUDIT-2026-09-08.md` — full fleet truth vs. docs; start here when state matters.
- `DEAL44-WORKFLOW44-2026-09-07.md` — deal rooms built, tested end-to-end, gates opened 2026-09-08; Israeli template still `reviewed: false` pending Moses's ten written answers (`decisions/workflows/il_residential_milestones.md` = the practitioner review, 2026-09-08). Acquisition for Israel is warm/inbound only.
- `OUTBOUND-V2-RULE-7-AMENDED-2026-09-07.md` + `REVENUE-OS-IDEAS-RATED-2026-09-07.md` — rule 7 amended by founder; the two builds (O-020, O-021); kill list (Base44 platform, success fees, Gmail OAuth, Israel-first doc AI all KILLED — don't resurrect).
- `AI-TEAMMATES-FOUR-CS-2026-09-06.md` — Grok Bot rejected; morning-brief routine replaces API-credit-dependent digest; **no calls, no live delivery, ever** (introvert founder).
- Queue right now: O-017 (P0 — Gate-1 test purchase + Dubai pack review, blocked on Moses), O-018/O-019/O-020/O-021 in progress, O-015 CANCELLED — do not resume.

---

## 8 — Working agreements for Kimi sessions

- **Trust code over stale docs; trust Moses over code.** If a doc contradicts the running system, fix the doc.
- **Never invent a number.** Every figure cited must come from a tool result, a table, or a file you actually read — delete any that don't (this mirrors the `COMMON_TONE` verification line).
- **Hebrew via Node, never Git Bash curl** — Git Bash mangles UTF-8 bodies into U+FFFD.
- **Verify deployments with `gh api .../deployments`**, not by curling the URL (`decisions/VERCEL-PUSH-NOT-DEPLOYING-2026-07-29.md`).
- **Report counts from tables** (`payment_orders`, `email_send_log`, `sales_outreach`), never from memory of what an agent claims it did.
- Finish substantive work with a dated decision/handoff file per O8, and keep this file's §6/§7 state sections current.
