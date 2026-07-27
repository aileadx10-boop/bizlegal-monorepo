# PropSignal — WAT Plan (Property Risk Intelligence)

**Status:** scaffold only (2026-07-28). Build order: **phase 3 of the trio** — after CloseFlow (phase 1, zero LLM) and LeaseParse (phase 2, Hermes-local).
**Canonical decision doc:** `decisions/TRIO-PROPSIGNAL-LEASEPARSE-CLOSEFLOW-2026-07-28.md`.

## Concept

Automated property risk intelligence for US real-estate investors. Ingest FREE public records (flood zones, environmental screening, municipal open data, targeted research), run a **deterministic scoring engine**, and deliver a risk score + narrative PDF — async, no calls, no human review.

Positioning: *you are a data terminal, we organize what the county clerk already published.* No interpretation of title, no advice, no duty of care.

**Liability shield:** "Raw public-data aggregation for informational purposes only. Not a substitute for physical inspection, appraisal, title opinion, or legal counsel. No attorney-client relationship is formed."

## Free-data scope (hard constraint)

| Source | Cost | What it yields |
|---|---|---|
| FEMA NFHL (public API) | $0 | Flood zone designation per parcel |
| EPA EJScreen / Envirofacts | $0 | Superfund, brownfield, TRI proximity |
| Socrata open-data portals | $0 | Code violations, permits, liens where cities publish them |
| Perplexity research (cached) | ≤$30/mo | Targeted gap-fill research per address |

**Excluded until revenue justifies:** paid county recorder APIs, CoStar/Reonomy, proxy scraping infra. The trio-wide infra cap is **$200/mo**.

## Workflows (SOPs in `docs/workflows/`)

| Workflow | Objective | Inputs | Outputs |
|---|---|---|---|
| `wf_audit_property.md` | Generate a single-property risk report | Address, email, payment confirmation | Risk score PDF + email delivery |
| `wf_batch_monitor.md` | Monitor a portfolio for new risk signals | Address list, frequency | Alert email on snapshot delta |
| `wf_onboard_user.md` (future) | Signup + first report | Email, address, checkout | Account + queued report |
| `wf_affiliate_payout.md` | Track affiliate conversions | Referral ID, conversion event | Commission ledger row |

## Agents (decision-makers)

| Agent | Role | Trigger | Decisions |
|---|---|---|---|
| Audit Agent | Orchestrates report generation | Payment webhook | Which free sources apply to this state/city; when Perplexity gap-fill is justified (budget-aware); never human review by design |
| Monitor Agent | Portfolio delta detection | Cron (daily) | Compares today's signals vs stored snapshot; alert threshold + urgency |
| Revenue Agent | Affiliate optimization | Weekly | Ranks affiliate partners by conversion; adjusts CTA placement in report footers |

## Tools (deterministic code, mapped to this repo)

| Tool | File | Function |
|---|---|---|
| FEMA client | `web/lib/sources/fema.ts` | NFHL flood-zone lookup → `RiskSignal[]` (zone→severity map implemented) |
| EPA client | `web/lib/sources/epa.ts` | EJScreen/Envirofacts screening → `RiskSignal[]` (proximity→severity map implemented) |
| Socrata client | `web/lib/sources/socrata.ts` | Per-city open dataset registry → violations/permits/liens signals |
| Research client | `web/lib/sources/perplexity.ts` | Cached Perplexity gap-fill (`PERPLEXITY_API_KEY`) |
| Score engine | `web/lib/score-engine.ts` | **Implemented.** Pure deterministic weighted scoring → 0–100 + grade + drivers |
| PDF generation | build phase 3 | HTML template → PDF (Playwright/WeasyPrint-equivalent on Vercel) |
| Email delivery | build phase 3 | Resend (`RESEND_API_KEY`) |
| Ops telemetry | `web/lib/ops/log.ts` | HMAC ops events → hub `/api/ops/log` |

## Crons (DOCUMENTED ONLY — not installed)

| Cron | Schedule (UTC) | Purpose |
|---|---|---|
| daily delta scan | 06:00 daily | Refresh monitored addresses, compare snapshots, queue alerts |
| affiliate reconciliation | Mon 09:00 weekly | Attribute conversions, queue payouts |
| trial/idle nudge | 10:00 daily | Re-engage expired trials + idle accounts |

## Money paths (all conversion routes)

| Path | Mechanic | Price | Margin |
|---|---|---|---|
| A. Per-report | One-time checkout → async PDF | $49 | ~95% (free sources + cached research) |
| B. Investor sub | Unlimited reports + monitoring | $149/mo | ~95% |
| C. Pro/Team sub | Seats + API + white-label PDFs | $299/mo | ~95% |
| D. Affiliate — title insurance | Report footer CTA | $25–75/lead | 100% |
| E. Affiliate — property insurance | Contextual (flood/env risk) CTA | $15–40/lead | 100% |
| F. Affiliate — hard-money lenders | High-risk-property CTA | $100–300/lead | 100% |
| G. API licensing | Per-call/quota for proptech | $0.10–0.50/call | ~95% |
| H. Data product — market risk index | Quarterly anonymized aggregate | $5–15K/quarter | ~98% |

## Cost budget (PropSignal share of the $200/mo trio cap)

| Line | Cost |
|---|---|
| FEMA / EPA / Socrata | $0 |
| Perplexity (cached in Supabase) | ≤$30/mo |
| Vercel / Supabase / Resend | shared trio infra |
| **PropSignal marginal** | **≤$30/mo** |

## Revenue scenarios

| Timeline | Scenario | Monthly revenue |
|---|---|---|
| Month 3 | ~20 reports + first affiliate clicks | ~$1.5K |
| Month 6 | ~80 reports + 20 subs + affiliates | ~$8K |
| Month 12 | 200+ reports + 60+ subs + API customer + data sales | $20K+ |

## Build-phase-3 backlog

1. Implement `fetchSignals` in the 4 source clients (FEMA first — highest signal per effort).
2. Geocoding via free Census Bureau geocoder (no new paid API).
3. PDF template + Resend delivery; wire hub `/api/pay/start` with `propsignal_report_49`.
4. Supabase cache table for source snapshots (`propsignal_reports` migration already written, unapplied).
5. Turn on checkout only after a Moses-verified end-to-end test purchase.
