# LEGAL-REVENUE-OS Build — 2026-09-14

**Order:** Execute the `/goal` in `~/Downloads/kimi-code-build-prompt-v3.md` (build contract) scoped by `~/Downloads/bizlegal-email-revenue-os-v2.md` (wave-1: US-only cold email to law-firm prospects for FirmCited + Practice-Revenue; email-only; compliance gate non-bypassable).

## What was built

`services/legal-revenue-os/` — email-only Revenue OS, Python 3.11, 62 files, uncommitted:

- **Revenue Memory** (`revenue_memory/`) — `prospect` persistent object, score weights FIT 25 / INTENT 30 / URGENCY 20 / ABILITY 15 / ACCESS 10, bands IGNORE/NURTURE/OUTREACH/PRIORITY/DO_NOT_CONTACT, sticky suppression.
- **Compliance gate** (`gate/`) — `execute_action` is the ONLY path to external side effects; suppression checked FIRST; append-only `agent_actions` audit with every policy decision; deny raises + escalation queue; tripwires auto-pause mailbox at bounce >3% / complaint >0.1%.
- **Policies** (`policies/`) — canonical Rego wave-1 pack (CAN-SPAM + bar-ad lint + FTC affiliate disclosure); UK/EU/IL/UAE/CA stubs BLOCK. `gate/evaluator.py` mirrors Rego 1:1 (default engine; `OPA_URL` switches to sidecar); 25 shared fixture cases keep Rego and evaluator in parity (rule-name parity enforced by test).
- **Adapters** (`adapters/`) — stub-default + env-configured live: enrichment (waterfall, cheapest-first, 6-credit cap, provider attribution), verification (valid-only sends; catch-all quarantine; 90-day re-verify), sequencer (≤50/mailbox/day, primary-domain ban), payments, LLM router.
- **12 agents** (`agents/`) as LangGraph subgraphs with scoped tool allowlists: orchestrator, discovery, lead_intelligence, personalization, campaign_engine, reply_handler, ai_sales, payment_collection, upsell, reactivation, compliance_gate, analytics.
- **Graph** (`graph/`) — supervisor + Lead→Cash state machine (DISCOVERED→…→REFERRAL, +NURTURE, SUPPRESSED terminal; illegal transitions raise).
- **Orchestrator** `daily_loop.py` — inspect funnel/cash/pipeline/compliance → single highest-value lawful intervention → dispatch → measure.
- **scripts/simulate.py** — seeded end-to-end dry run with stub adapters, prints executive report.

## Verification (O7 — run by parent agent, not the builder)

- `pytest`: **70 passed, 25 skipped** (skips = OPA-sidecar fixture variants; no OPA binary on this box).
- All 6 spec acceptance tests pass (`tests/test_acceptance.py`), incl. grep-level: zero `adapters.sequencer` imports outside `gate/` (verified independently).
- `scripts/simulate.py` tail: cash $20, 1 customer, 3 sends/3 replies, 24 audited actions (allow=24), invariant check OK, 1 pending human approval ($6,500 FirmCited starter proposal handoff — correct per ≥$6.5k rule).

## Deviations from spec (documented in service README)

1. Python 3.11 (no 3.12 on box).
2. OPA optional — Python evaluator default, Rego canonical.
3. SQLite default via SQLAlchemy; Postgres when `DATABASE_URL` set. Migrations in `db/migrations/001_init.sql` are Postgres DDL.
4. In-process queue default; Redis via `REDIS_URL`.
5. LangGraph stateless per dispatch; durable state in Revenue Memory (no Postgres checkpointer).
6. Human approvals via CLI `scripts/approve.py` (no webhook surface).
7. docker-compose.yml authored but unrunnable here (no docker binary).

## Relation to standing rules

- Consistent with outbound rule 7 v2: verified-addresses-only, fail-closed, suppression-first; wave-1 is US CAN-SPAM scope only (EU/IL/UK/UAE/CA corridors hard-blocked in policy stubs).
- **Nothing sends.** Stub adapters are the default; no API keys exist; live adapters are env-wired but untested against real providers.
- Not committed to git (left uncommitted per instruction).

## Next session / open items

- Moses: decide commit + whether this graduates an order (O-021 adjacent — outbound v2 engine in TS already exists; this is the Python Revenue OS per the newer v3 prompt).
- OPA-sidecar policy tests never executed (no binary); Rego not `opa check`-compiled.
- Live adapters need keys (enrichment/verification/sequencer) before any real send — vault-first per O5.
- Anthropic credits still $0 fleet-wide — LLM adapter stubbed regardless.
