# wf_audit_property — single-property risk report

**Objective:** turn one US address into a delivered risk-score PDF with zero human touch.

**Inputs:** normalized address (street, city, state, zip), buyer email, payment confirmation (`payment.confirmed` ops event for `propsignal_report_49`).

**Tools (in order):**
1. Census geocoder (free) → lat/lon + FIPS.
2. `web/lib/sources/fema.ts` → flood-zone signals.
3. `web/lib/sources/epa.ts` → environmental signals.
4. `web/lib/sources/socrata.ts` → municipal signals (only if city has a registered dataset).
5. `web/lib/sources/perplexity.ts` → gap-fill research ONLY if fewer than 3 signals gathered AND monthly research budget not exhausted.
6. `web/lib/score-engine.ts` → score + grade + drivers.
7. PDF template → Resend delivery → `download.report` ops event.

**Outputs:** PDF in Supabase storage, `propsignal_reports` row, delivery email.

**Edge cases:**
- **Geocode failure:** retry once with ZIP-only; if still failing, email the buyer asking for a corrected address (template, automated) — do not refund automatically.
- **Rural address, no open data:** report ships with FEMA + EPA sections only; narrative discloses coverage gaps explicitly (never pad with guesses).
- **Source downtime:** each client fails soft; report ships with a "source unavailable, re-run free within 30 days" note.
- **Research budget exhausted:** skip Perplexity silently; deterministic sources always suffice for a valid report.
