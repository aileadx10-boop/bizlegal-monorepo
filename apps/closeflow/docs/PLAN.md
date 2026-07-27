# CloseFlow — WAT Plan

**Concept:** Real-estate transaction workflow engine. The user inputs property address, party roles, transaction type, and closing date; CloseFlow generates a jurisdiction-aware checklist, calculates every deadline, tracks document collection, and sends automated reminders. ~Zero LLM cost — the whole engine is deterministic code. We are **Asana for closings, not a closing attorney**.

**Trio position:** Phase 1 build (cheapest, fastest validation, near-zero COGS). Cross-sells into LeaseParse (lease PDF detected → "abstract it?") and PropSignal (address on file → "risk report?"). Shared spine: `trio_properties` table.

---

## Workflows (SOPs in `docs/workflows/`)

| Workflow | Objective | Inputs | Outputs |
|---|---|---|---|
| `wf_create_transaction.md` | Spin up a new closing checklist | Property address, closing date, party roles, transaction type | Jurisdiction-aware checklist + full deadline timeline |
| `wf_track_deadlines.md` | Monitor approaching deadlines | Transaction ID, current date | Automated reminder emails to assigned parties |
| `wf_collect_documents.md` (planned) | Track document collection status | Required doc list, uploaded docs | Status dashboard + nag emails for missing items |
| `wf_close_transaction.md` | Archive + generate closing summary | All completed items | Final summary PDF + archive |

## Agents (decision-makers)

| Agent | Role | Trigger | Decisions made |
|---|---|---|---|
| Checklist Agent | Generate jurisdiction-specific closing workflows | New transaction created | Selects template by transaction type (`residential_purchase` / `residential_refi` / `commercial` / `exchange_1031`); calculates all deadline dates back from closing date; assigns default party responsibilities |
| Reminder Agent | Deadline tracking + escalation | Cron (daily) | Days-until per task; reminder cadence 7d → 3d → 1d → overdue; escalation (cc counterpart); whether to append an affiliate CTA (notary/title/inspector) by task type + zip |
| Document Agent | Track uploads + identify gaps | Upload event or cron | Diffs uploaded docs vs required list; generates specific nag message |
| Partner Agent | Surface relevant service providers | Contextual (e.g. "inspection due") | Picks best affiliate partner (inspector, lender, title co, notary) by property location + task type |

## Tools (deterministic code)

| Tool | Function | Location |
|---|---|---|
| Template engine | Checklist per transaction type (+ jurisdiction overrides later) | `web/lib/checklist-templates.ts` |
| Date calculator | Business-day deadline math from closing date | `web/lib/date-calculator.ts` |
| Reminder bot | Scheduled reminder emails | planned — Resend + cron route |
| Doc tracker | Document upload status | planned — Supabase `closeflow_transactions.documents` JSONB |
| Summary generator | Closing summary PDF | planned — HTML template → PDF |
| Partner router | Route users to affiliate partners | planned — `web/lib/partner-router.ts` |

## Crons — **documented only, NOT installed** (install in build phase, Hetzner or Vercel cron)

| Cron | Schedule | Purpose |
|---|---|---|
| daily_reminders | Daily 07:00 UTC | Send all deadline reminders for active transactions |
| overdue_escalation | Daily 09:00 UTC | Escalate overdue items (cc additional parties) |
| weekly_transaction_summary | Mondays 10:00 UTC | Weekly progress email to all active transaction parties |
| post_closing_followup | closing_date + 7d | Review request + cross-sell next transaction |
| partner_conversion_recon | Weekly | Reconcile affiliate conversions + payouts |

## Money paths (all conversion routes)

| Path | Mechanic | Price | Margin |
|---|---|---|---|
| A. Per-transaction | One-time checkout (`closeflow_transaction_39`) | $39 | ~99% |
| B. Sub — Investor | Unlimited active transactions | $29/mo | ~99% |
| C. Sub — Agent/Team | 5+ agents, team dashboard, client portal | $99/mo | ~99% |
| D. Affiliate — Title company | "Choose your title partner" CTA | $50–150/closed-ref | 100% |
| E. Affiliate — Lender | Financing-contingency phase CTA | $75–250/closed-loan | 100% |
| F. Affiliate — Inspector | Inspection-deadline reminder CTA | $25–50/lead | 100% |
| G. Affiliate — Notary/signing | Closing-day CTA | $15–30/appt | 100% |
| H. White-label | Rebrand for brokerages / investor groups | $299–599/mo | ~99% |
| I. Data product | Anonymized closing-timeline analytics by jurisdiction | $3–7K/quarter | ~99% |

## Costs (CloseFlow share of the $200/mo trio cap)

| Item | Cost | Note |
|---|---|---|
| LLM | ≈$0 | Engine is deterministic; Perplexity only for one-time jurisdiction research (cached in repo) |
| Vercel / Supabase / Resend | shared | Covered by trio-wide $200 budget (see decision doc) |

## Revenue scenarios

| Timeline | Scenario | Monthly |
|---|---|---|
| Month 3 | 15 transactions + 10 subs | ~$1.5K |
| Month 6 | 60 transactions + 40 subs + light affiliate | ~$5–8K |
| Month 12 | 250+ transactions + 150 subs + 2 white-labels + affiliates | ~$20K+ |

## Liability shield

> CloseFlow is project-management and checklist software. It does not prepare legal documents, render title opinions, provide escrow services, give legal advice, or form an attorney-client relationship. All checklists and deadlines are generated by automated systems for informational purposes only; users are solely responsible for verifying dates and obligations under their contracts and local law.

## Build order

1. This scaffold (done) → 2. Supabase tables live (`20260728_closeflow_transactions.sql`, apply-gated) → 3. Checklist UI + email reminders → 4. Checkout live after Z7-style verification + Moses test buy → 5. Affiliate CTAs → 6. White-label portal.
