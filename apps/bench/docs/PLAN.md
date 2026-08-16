# Bench — WAT Plan (Legal AI Quality Intelligence)

**Status:** scaffold (2026-08-16). Checkout dark. Benchmarks drafted, pending Moses legal review.
**Canonical decision doc:** `decisions/BENCH-LEGAL-AI-QUALITY-2026-08-16.md`.

## Concept

The evaluation lab for legal AI. Clients submit model outputs; Bench returns a
measurement report — accuracy score, hallucination rate, critical-error rate,
citation reliability, missing-law rate, error taxonomy, gold-standard
corrections, remediation memo — scored against versioned, jurisdiction-specific
benchmarks (MiCA-Bench / DPA-Bench / VARA-Bench) and verified by practising
lawyers who stay invisible. Identity: measurement company, not labor broker.
micro1-grade presentation; BizLegal-grade safety rules.

**Liability shield:** measurement and benchmarking services only; not legal
advice; no attorney-client relationship; no referral service. Reports measure a
defined test set at a point in time — not a warranty of production safety.

## Delivery economics (the table that gates all pricing copy)

Eval modes: `ai_prescored` (Claude pre-scores; expert verifies a sample) and
`expert_full` (expert scores from scratch). Expert rates: verification pass
$25–35/item, full evaluation $75–125/item (jurisdiction-dependent).

| Tier | Price | Evals | Mix | Expert cost | Gross margin |
|---|---|---|---|---|---|
| Diagnostic Audit | $2,500 one-time | 25–30 | ~20 AI-prescored (50% verified) + ~8 expert_full | ~$950–1,250 | **~50–62%** |
| Managed Program | $5,000/mo | 100–150 | ~80% AI-prescored (30% verified) + ~20% expert_full | ~$2,300–2,900 | **~42–54%** |
| Dedicated Intelligence | from $12,500/mo | 300–500 | scoped; target ≥50% margin at scoping | scoped | ≥50% by design |

Rules derived from this table (do not undercut them in copy):
- Pilot floor is **$2,500** — at $1,500/50 evals the tier loses money (v4.0 flaw).
- Managed evals/month is **100–150**, never "200–500" at $5K.
- New-expert phase (100% QA) compresses margin — first 2 pilots are treated as
  calibration investments, not profit.

## Workflows (SOPs in `docs/workflows/`)

| Workflow | Objective | Trigger |
|---|---|---|
| `wf_diagnostic_audit.md` | One paid audit end-to-end | Scoping agreed (intake → engagement) |
| `wf_expert_onboarding.md` | Application → paid test → calibration → active | New application row |
| `wf_benchmark_authoring.md` | Draft/extend a benchmark version | Coverage gap or new jurisdiction |
| `wf_self_benchmark.md` | Measure our own stack; publish anonymized snapshot | Quarterly + before launch |
| `wf_managed_month.md` | One managed-program monthly cycle | Subscription month tick |

## Agents (decision-makers)

| Agent | Role | Decisions |
|---|---|---|
| Moses (now) | Scoping, QA gate, report sign-off, expert admission | Everything customer-visible; all admissions are human |
| Claude (session) | AI pre-scoring drafts, report compilation drafts, benchmark drafting | Never final scores on paid work; never sends email beyond transactional acks |
| Delivery agent (later, Hetzner) | Batch orchestration for managed tier | Assignment + reminder cadence only, draft-first |

## Tools (deterministic code, this repo)

| Tool | File | Function |
|---|---|---|
| Rubric engine | `web/lib/rubric-engine.ts` | 5-dim scores → all report metrics, pure |
| Inter-rater | `web/lib/inter-rater.ts` | Calibration agreement stats (exact/adjacent/Δ) |
| Benchmark registry | `web/lib/benchmarks.ts` + `web/data/benchmarks/v1/*.json` | Versioned sets; released/held-out split |
| Report model | `web/lib/report-model.ts` | Typed report ↔ bench_reports.metrics |
| Intake | `app/api/audit/request` | Validated inbound → bench_intake + lead.inbound + transactional ack |
| Expert intake | `app/api/experts/apply` | → bench_expert_applications + ack |
| Checkout (dark) | `app/api/checkout/start` | 503 until verified purchase; then forwards to hub /api/pay/start |
| Engine self-check | `scripts/bench-engine-check.mjs` | Formula + benchmark structural verification (CI-able) |
| Self-audit harness | `scripts/bench-self-audit.mjs` | Runs a set against the base model → bench_evaluations |
| Ops telemetry | `web/lib/ops/log.ts` | HMAC events → hub /api/ops/log (existing event types only) |

## Money paths

| Path | Mechanic | Price |
|---|---|---|
| A. Diagnostic Audit | `bench_audit_2500` one-time | $2,500 |
| B. Managed Program | `bench_managed_monthly` subscription | $5,000/mo |
| C. Dedicated Intelligence | Deal room (hub), custom contract | from $12,500/mo |
| D. Benchmark reports (later) | Annual anonymized industry report | $5–15K |
| E. API / monitoring (Stage 3+) | Continuous evaluation subscription | TBD |

## GTM (hard-rule-7 clean — inbound only)

1. Self-benchmark → anonymized snapshot → `/sample` + blog + LinkedIn (Moses posts).
2. Published benchmark research via existing blog/AEO engine (aggregated only).
3. `/audit/request` + `/experts` inbound funnels; newsletter via @bizlegal/email (double opt-in).
4. Cross-sell from DocAI/LexAudit/hub surfaces.
5. NO scraping, NO cold email, NO exceptions — person-targeted drafts go through
   `sales_outreach` with Moses approval and consent logging.

## Targets & kill criteria

| Milestone | Target |
|---|---|
| Day 60 | ≥2 paying engagements or reprice/retarget (kill criterion) |
| Month 3 | First managed client; calibration stats published |
| Month 6 | $8–12K MRR; 3–5 recurring; ≥1 non-startup client; 10–15 active experts |

## Build backlog (post-scaffold)

1. Moses review gate: 3 benchmark sets + legal pages (his review IS the E-E-A-T).
2. Apply `supabase/migrations/20260816_bench_schema.sql`.
3. Vercel project `bench` (Root Directory `apps/bench/web`) + CNAME.
4. Run self-audit on MiCA-Bench → score → replace `/sample` illustrative data.
5. First expert recruited via `/experts` + wf_expert_onboarding.
6. First verified test purchase → flip `CHECKOUT_LIVE` in `app/api/checkout/start/route.ts`.
