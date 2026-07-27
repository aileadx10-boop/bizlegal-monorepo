# wf_create_transaction — Spin up a new closing checklist

**Objective:** Turn a bare deal description into a complete, dated, party-assigned closing checklist in one pass.

**Inputs:** property address (street/city/state/zip), transaction type (`residential_purchase` | `residential_refi` | `commercial` | `exchange_1031`), closing date (ISO), party emails (buyer, seller, agent, lender, title — any subset), payer email.

**Tools:**
1. `web/lib/checklist-templates.ts` → `generateChecklist(type, closingDate)` — selects base template, computes due dates via `date-calculator.ts`.
2. `applyJurisdictionOverrides` (stub today) — state-specific tweaks (e.g. attorney-state closings, transfer-tax filings).
3. Supabase insert into `closeflow_transactions` (checklist JSONB) + upsert `trio_properties`.
4. `logEventAsync({ type: 'lead.inbound', source: 'closeflow' })`.

**Outputs:** transaction row with full checklist + timeline; confirmation email (Resend) listing the next 3 deadlines; ops event.

**Edge cases:**
- Closing date < 10 business days out → compress offsets proportionally, flag `rush: true`.
- Closing date in the past → reject 400.
- Unknown state → skip jurisdiction overrides, note in checklist header.
- Duplicate (same address + closing date + email) → return existing transaction instead of duplicating.
