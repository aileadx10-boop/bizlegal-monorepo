# WAT-INC-001 — Liability Incident Response

Version: v1.0.0-p3
Owner: General Counsel (external), Intelligence Operations (operational)
Last reviewed: 2026-04-19

## Purpose

This SOP governs the response to any challenge to a BizLegal AI output — from a customer, opposing counsel, a regulator, or a third party named in an output. The first priority is preservation; the second is notification; the third is investigation. No fault is admitted prior to review.

## Scope

All product outputs. Any receipt of:
- A written or verbal complaint about an output.
- A regulatory inquiry referencing an output.
- A legal letter (cease and desist, DMCA, takedown, subpoena).
- A third-party claim that a named individual in an output was misrepresented.

triggers this SOP.

## First hour (operational)

1. **Acknowledge.** Confirm receipt to the complainant with a neutral message: the complaint will be investigated; no substantive response yet.
2. **Preserve.** Snapshot the challenged output as-shipped. Capture:
   - The full output artefact (JSON, PDF, rendered page).
   - The retrieval / provider call records that produced it.
   - The reviewer signoff record (WAT-HITL-001).
   - The `disclaimer_version` in force at issue time.
   - The KB / signal registry revision active at issue time.
3. **Freeze.** Do not edit the output in-place. Do not delete the output. Do not re-run the model on the same inputs. Preservation trumps cleanup.
4. **Notify counsel.** Send the preservation package to external counsel and to the internal on-call.
5. **Log.** Open an incident record: incident id, channel (email / letter / legal), complainant (if known), received at, acknowledged at, preserved at.

## First day (review)

6. **Review scope.** Counsel determines whether this is a product issue (re-run with corrected KB), a disclosure issue (the output was correct but misunderstood), or a legal matter (retain counsel, stop other communication).
7. **Do not admit.** Outside of a legal-matter path approved by counsel, no employee or contractor admits fault on behalf of BizLegal AI.
8. **Do not delete.** Even if the complainant requests it, deletion happens only after counsel confirms the preservation window and legal hold posture.

## First week (remediation)

9. **If the output was wrong:** execute WAT-KB-001 to remove or correct the underlying entry. Bump `DISCLAIMER_VERSION`. Prior outputs remain reproducible against the stamped version.
10. **If a customer is affected:** decide whether to proactively re-issue to affected customers; decision sits with counsel + product owner.
11. **If a regulatory inquiry:** respond through counsel only.

## What never changes

- The challenged output artefact is preserved verbatim for as long as the matter is open plus any applicable statutory retention.
- The audit log is not edited.
- `disclaimer_version` bumps do not backfill prior outputs.

## Incident record fields

- `incident_id`
- `received_at`, `acknowledged_at`, `preserved_at`, `counsel_notified_at`
- `output_artefact_ref`, `reviewer_signoff_ref`, `disclaimer_version`, `kb_revision`
- `channel`, `complainant` (if known)
- `disposition` (open / closed-product-fix / closed-legal / closed-no-action)
- `final_counsel_note`

## Escalation

If a matter is open more than 30 days without counsel-approved resolution, it is escalated to the product owner + an external advisory review.

## Change log

- v1.0.0-p3 — initial publication.
