# WAT-HITL-001 — Intelligence Review (Human-in-the-Loop)

Version: v1.0.0-p3
Owner: Intelligence Operations
Last reviewed: 2026-04-19

## Purpose

This SOP governs the mandatory human review of every intelligence output before it ships to a customer. HITL is a liability firewall, not a performance step. No output leaves the platform without a named human reviewer signing off.

## Scope

All product outputs across the BizLegal AI family:
- Hub SEO articles
- DocAI SQA drafts on paid tiers (free tier is auto-deliver, still audited)
- LexAudit health-score reports + attestation artefacts
- TRACR chain-intelligence snapshots
- BRAI regulatory posture reports
- LeadForge delivered leads (sampled weekly rather than per-lead; see WAT-OUTBOUND-001)

## Reviewer roles

- **Primary reviewer.** Verifies the cited sources actually support each assertion, flags uncertainty, and can hold delivery if any claim cannot be substantiated.
- **Secondary reviewer (high-severity outputs).** A second named analyst signs off when the product's severity routing requires it (e.g., LexAudit attestation artefacts, TRACR snapshots with composite tier ≥ high).

Authors of an output cannot review it. Reviewers cannot be the model.

## Procedure

1. **Receive.** The output arrives in the reviewer queue with full context: the query / inputs, the retrieval or provider calls, the model's reported uncertainty, the confidence score or composite score, and the active `DISCLAIMER_VERSION`.
2. **Verify sources.** For each assertion, open the cited source and confirm support. If the source does not support the assertion, flag the claim.
3. **Verify citations are fresh.** `last_updated` (KB entries) or `retrieved_at` (chain / intent events) must be within the product's freshness window. Stale citations hold the output until a WAT-KB-001 refresh is run.
4. **Verify uncertainty is surfaced.** If the model reported high uncertainty, the draft must admit limits. If it did not, the reviewer adds the admission or holds.
5. **Sign.** The reviewer writes `reviewer_id` (human identity, not a model or service account), `signed_at` (ISO timestamp), and optional note to the output record.
6. **Ship or hold.** Signed outputs ship. Held outputs return to the author with the specific blocker.
7. **Audit.** Every signoff and every hold is logged. The log carries the disclosure version and the reviewer's name. Do not purge this log — it is the evidence of HITL in discovery.

## Mandatory holds

- Output arriving at the reviewer queue with no `disclaimer_version` → hold.
- Claim unsupported by a cited source → hold.
- Reviewer conflict of interest with the customer → route to a different reviewer.
- Reviewer cannot defend an assertion in plain language → hold.

## Two-person rule triggers

Second reviewer required when:
- LexAudit attestation artefact is the output.
- TRACR snapshot tier is `high` or `critical`.
- Any output that references a named third-party individual in a potentially adverse context.

## Escalation

A hold that cannot be resolved in the ordinary course escalates to `WAT-INC-001` (Liability Incident Response) if legal exposure is suspected, or back to the product owner for scope adjustment.

## Change log

- v1.0.0-p3 — initial publication.
