# WAT-SQA-001 — SQA Response Generation

Version: v1.0.0-p3
Owner: Product Intelligence
Last reviewed: 2026-04-19

## Purpose

This SOP governs how a Structured Question & Answer (SQA) response is produced, reviewed, and shipped across the BizLegal AI family. It is a workflow, not a policy. A response that deviates from any mandatory step is held, not shipped.

## Scope

Applies fleet-wide to any product that answers a customer question using the knowledge base + generation pipeline: DocAI primarily, hub `/faq`-style surfaces, and any product that mounts a `LeadMagnetForm` with a deliverable.

## Inputs

- Customer-submitted question (text).
- Product context (DocAI / hub / other).
- Jurisdictional scope the customer asked about (may be empty).
- Active `DISCLAIMER_VERSION` from `lib/legal/disclaimer.ts`.

## Procedure

1. **Retrieve.** Call `retrieve()` (DocAI `lib/sqa/retrieval.ts`) against the knowledge base scoped to the jurisdictions and topics the customer asked about. Capture the full `RetrievalResult` including `hits[]`, `below_threshold`, and `retrieved_at`.
2. **Gate on threshold.** If `below_threshold` is true, skip generation entirely and emit the canonical `OUT_OF_SCOPE_TEMPLATE` draft. Do not attempt fallback generation; fabrication-free is the contract.
3. **Generate.** If the threshold is met, call the `GenerateCallable` with the query + retrieval context. Capture the model's reported uncertainty.
4. **Score confidence.** Run `computeConfidence()` against the retrieval, uncertainty, citation check, and limits-admission check.
5. **Route by tier.**
   - `auto_deliver` (≥ `AUTO_DELIVER_THRESHOLD`, default 0.75) — eligible for automated delivery on free tiers; still logged with the reviewer-null annotation for audit.
   - `human_review` (≥ `HUMAN_REVIEW_THRESHOLD`, default 0.45) — routed to a named analyst queue; no delivery until signoff.
   - `hold` (< `HUMAN_REVIEW_THRESHOLD`) — held with a request for more information from the submitter.
6. **Stamp.** Every draft written to durable storage must include `disclaimer_version`, `issued_at`, the `RetrievalResult`, and (for paid tiers) the reviewer signoff record.
7. **Deliver.** Return the draft with citations intact; the client renders citations as links, never strips them.
8. **Audit.** Append a record to the SQA audit log with the tier, the confidence score, the reviewer (if any), and the disclosure version.

## Mandatory holds

- Missing retrieved_at → hold.
- Missing reviewer on a `human_review` or `hold` tier → hold.
- Any claim in the draft that cannot be tied back to a retrieval hit → hold.

## Escalation

Challenged outputs follow `WAT-INC-001`.

## Reviewer signoff fields

- `reviewer_id` (human analyst, not a model)
- `signed_at` (ISO timestamp)
- Optional `note`

## Change log

- v1.0.0-p3 — initial publication. Any change bumps `DISCLAIMER_VERSION`; prior responses remain reproducible against the SOP revision in force at issue time.
