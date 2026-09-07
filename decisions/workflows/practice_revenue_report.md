# Workflow — Practice Revenue Report (free totals → $99 unlock)

**Objective:** turn a billing export into money numbers a solo professional can act on, with zero permission asked, zero client names stored, zero LLM calls, and no human in the loop. Built 2026-09-07 (plan `~/.claude/plans/read-1-the-verdict-abundant-wombat.md`, decision `decisions/REVENUE-OS-IDEAS-RATED-2026-09-07.md`).

**Inputs:** an invoice CSV (required) and a time-entry CSV (optional) from any billing tool, or the one-tab template at `/templates/practice-revenue-invoices-template.csv`.

**Tools (deterministic):**
- Browser: `apps/hub/app/practice-revenue/UploadPanel.tsx` — parses, maps headers (`lib/practice-revenue/csv.ts`), replaces client/matter/invoice identifiers with codes and drops description columns (`lib/practice-revenue/pseudonymise.ts`), keeps the key in `localStorage prr:<ref>` + a downloadable CSV.
- `POST /api/practice-revenue/analyze` — rate limit 5/min/IP, size caps, parse, PII backstop (422), `computeReport` (`lib/practice-revenue/engine.ts`), row in `practice_revenue_reports`, transactional totals email, `lead.qualified` event.
- `GET /api/practice-revenue/report/[ref]` — totals + one teaser row always; full report only when `paid_at` is set; 410 after `expires_at`.
- Checkout: `/api/pay/start` with `product_id='practice_revenue_report'` and `source='practice_revenue:<ref>'`; both hub webhooks call `lib/payments/practice-revenue-grant.ts`, which flips the report to paid, extends retention to 180 days and emails the link.
- Tests: `apps/hub/package.json` → `test:practice-revenue` (27 assertions against the hand-computed fixture in `lib/practice-revenue/fixtures/synthetic.ts`).

**Outputs:** free — headline totals (open AR, past-due 60+, unbilled, collection, realization, utilization, DSO, lock-up, dormant count, overdue count) + one client row; paid — every overdue invoice with a neutral reminder draft, every unbilled entry with an invoice-line draft, client ranking by collected-per-hour with the reprice gap, closed-matter rows, timing counterfactuals, dormant clients, "Save as PDF".

**Edge cases (all handled in code, never by a person):**
- Ambiguous numeric dates (09/10/2026) → 422 with `ambiguous_date_format`; the page shows the format selector; the engine never picks a locale.
- Missing paid/balance column → aging null with `insufficient_evidence`, never zero. No time file → invoice-only mode.
- Anything that looks like an email, phone or SSN in a cell → 422 `pii_detected`; nothing stored.
- Payment arrives without a matching ref → the grant falls back to the latest unpaid report for that email, else emails "reply with your PR- reference" and pings Telegram.
- Report opened in a browser without the key → codes only; "Import name key" restores names client-side.

**What never happens:** no OAuth to any inbox or practice system; no LLM reads the data; no reminder is sent by us; no "safe" / "compliant" / "guaranteed"; no bar-rule citations; benchmarks print only while `CLIO_LEGAL_TRENDS_2025.verified` is true.

**Moses touches:** verify the Clio 2025 figures and flip `verified`; apply `supabase/migrations/20260908_practice_revenue_reports.sql` if not already applied; one $99 test buy after deploy; run the engine on his own export for the article.
