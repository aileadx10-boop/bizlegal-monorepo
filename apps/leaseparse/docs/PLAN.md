# LeaseParse — WAT Plan

**Concept:** Commercial lease abstracting + portfolio critical-date monitoring. Users upload lease PDFs; the pipeline extracts critical dates (renewals, breakpoints, kick-outs), financial terms (base rent, CAM, percentage rent), and risky clauses (co-tenancy, go-dark, assignment restrictions), then monitors the portfolio for upcoming deadlines. We sell document parsing and date math — not lease negotiation strategy. **Selling scissors, not haircuts.**

Part of the trio (see `decisions/TRIO-PROPSIGNAL-LEASEPARSE-CLOSEFLOW-2026-07-28.md`). **Build order: Phase 2 — after CloseFlow, before PropSignal.**

---

## Workflows (SOPs in `docs/workflows/`)

| Workflow | Objective | Inputs | Outputs |
|---|---|---|---|
| `wf_parse_lease.md` | Extract structured data from a lease PDF | Lease PDF, user email, payment confirmation | Abstract JSON + risk summary PDF, emailed |
| `wf_portfolio_monitor.md` | Alert on upcoming critical dates | Portfolio ID, current date | Tiered alert emails with action context |
| `wf_clause_benchmark.md` | Compare extracted terms against market norms | Lease abstract + submarket | Percentile benchmark report (upsell) |
| `wf_marketplace_match.md` | Match a risk flag with a vetted service provider | Risk flag (e.g. co-tenancy breach) | Qualified lead delivered to partner |

## Agents (decision-makers)

| Agent | Role | Trigger | Decisions |
|---|---|---|---|
| Parse Agent | Orchestrates lease extraction | Upload + payment webhook | Routes to Hermes (Ollama, local) first; escalates to Claude ONLY when confidence < 0.85; assigns clause risk flags; persists to Supabase |
| Monitor Agent | Portfolio date tracking | Cron (daily) | Computes days-until for all critical dates; picks alert tier (90/60/30/7 days); appends CloseFlow cross-sell when property has no active transaction |
| Benchmark Agent | Market comparison | Post-parse or user request | Pulls anonymized comparable abstracts; computes percentile; decides Pro-insight upsell eligibility |
| Match Agent | Lead routing to partners | Risk threshold breach | Selects best-fit partner (CRE attorney vs tenant-rep broker) by geography + specialty; formats and delivers lead |
| Fallback Agent | Cost control + quality guard | Hermes low-confidence output | Decides if a Claude call is justified; logs every fallback event for prompt improvement |

## Tools (deterministic code in `web/lib/extract/`)

| Tool | Function | File |
|---|---|---|
| Hermes extractor | Structured extraction via local Ollama (JSON-schema prompt) | `hermes-first.ts` |
| Claude fallback | High-accuracy extraction for edge cases, gated at confidence < 0.85 | `claude-fallback.ts` |
| PDF text extraction | PDF → text (pdf-parse or PyMuPDF-equivalent, added in build phase) | build phase 2 |
| Date engine | Deterministic critical-date + notice-window math | `date-engine.ts` (implemented) |
| Types contract | `LeaseAbstract` / `ExtractionResult` shared shapes | `types.ts` (implemented) |
| Alert generator | Tiered alert emails via Resend | build phase 2 |
| Marketplace router | Lead formatting + webhook delivery to partner CRM | build phase 3 |

## Crons — DOCUMENTED ONLY, not installed

| Cron | Schedule (UTC) | Purpose |
|---|---|---|
| `cron_date_alert_90d` | Daily 07:00 | 90-day advance notices (renewals, kick-outs) |
| `cron_date_alert_30d` | Daily 08:00 | 30-day urgent notices |
| `cron_date_alert_7d` | Daily 09:00 | 7-day critical notices |
| `cron_portfolio_health` | Monthly, 1st | Portfolio summary email to subscribers |
| `cron_partner_recon` | Weekly | Verify lead delivery + partner attribution |
| `cron_churn_nudge` | Daily | Re-engage accounts idle 60+ days |

## Money paths (all of them)

| Path | Mechanic | Price | Margin |
|---|---|---|---|
| A. Per-lease abstract | One-time checkout → async delivery | $59–$149 | ~95% (Hermes ≈ $0; Claude fallback ~$0.50–$2/lease) |
| B. Portfolio subscription | Unlimited abstracts + date alerts | $79/mo | ~98% |
| C. Pro subscription | 3 team seats + API access | $199/mo | ~99% |
| D. Marketplace lead — CRE attorney | "Review this clause?" CTA on risk flags | $75–$150/lead | 100% |
| E. Marketplace lead — tenant-rep broker | "Renegotiate?" CTA near renewal dates | $100–$250/lead | 100% |
| F. Benchmark upsell | "Your rent is Nth percentile" add-on | $29/report | ~99% |
| G. API | Per-abstract for property-management software | $5–$15/abstract | ~90% |
| H. Data product | Anonymized lease-term trends by submarket | $3–8K/quarter | ~99% |

## Costs (inside the trio's $200/mo cap)

| Line | Cost | Note |
|---|---|---|
| Hermes / Ollama | $0 | Local; handles ~90% of extraction volume |
| Claude fallback | ≤$50–$80/mo | Inside the trio's shared $100 Claude budget; every call logged |
| Supabase / Vercel / Resend | shared | Covered by the trio's shared platform spend |

## Revenue scenarios

| Timeline | Scenario | Monthly revenue |
|---|---|---|
| Month 3 | Conservative — ~30 abstracts + a few subs | ~$2K |
| Month 6 | Moderate — ~100 abstracts + 40 subs + first leads | ~$10K |
| Month 12 | Aggressive — 250+ abstracts + 150 subs + API partner + data sales | $25K+ |

## Liability shield

LeaseParse is an AI-powered document analysis tool. It organizes what a lease already says into structured formats. It does not render legal advice, recommend whether to exercise any lease right, guarantee extraction completeness, or form an attorney-client relationship. Users are instructed to consult qualified counsel before acting. All outputs carry this disclaimer.
