# WAT-OUTBOUND-001 — Outbound Lead Qualification

Version: v1.0.0-p3
Owner: LeadForge
Last reviewed: 2026-04-19

## Purpose

This SOP governs how LeadForge surfaces intent signals to subscribers and how the compliance posture is enforced on every exported lead.

Non-negotiable: LeadForge does not send outreach on the subscriber's behalf. The subscriber is the controller of any originated communication and is responsible for applicable anti-spam / DNC / consent regimes.

## Scope

- LeadForge `src/lib/intent/` fetchers and ranker.
- `RankedLead` export pipeline.
- Subscriber intake (`SubscriberProfile`).

## Procedure

1. **Ingest.** The ranker combines `RawIntentEvent` records from SEC EDGAR, DOJ press wire, generic press wire feeds, and job signals. Every event must carry a `source_citation` with `source_url` and `retrieved_at`. Events missing either are dropped at intake.
2. **Rank.** Score each grouped-by-company set across the 4 families (recency / topical / jurisdictional / firmographic) using `DEFAULT_WEIGHTS`.
3. **Attach outbound-compliance notice.** Call `outboundComplianceNotice()` with the subscriber's channel and the subscriber + lead jurisdictions. The returned string is attached to the `RankedLead`. A lead without a notice is a bug — the ranker refuses to emit one.
4. **Stamp.** Every `RankedLead` carries `disclaimer_version`, `issued_at`, and the full `source_citations` array.
5. **Deliver.** The lead is made available via the subscriber's configured delivery channel (dashboard / export / API). Delivery records the disclosure version and the subscriber's configured channel at the time.
6. **Sample-review weekly.** A named analyst samples delivered leads weekly and spot-checks that the cited public-record events actually support the intent classification. Failing samples are removed from the delivered set and the ranker weights are revisited.
7. **Handle alleged framing.** DOJ press-release events reference alleged defendants. The raw event headline is preserved verbatim; no downstream UI or marketing copy paraphrases to "found guilty" or "convicted". Samples that fail this check are removed.

## Mandatory holds

- `RankedLead` missing `outbound_compliance_notice` → reject.
- `RankedLead` missing `disclaimer_version` → reject.
- `RankedLead` with any `source_events[i].source_citation.source_url` empty → reject.

## Frameworks referenced by the outbound-compliance notice

- **US email:** CAN-SPAM (16 CFR Part 316).
- **US phone:** TCPA (47 USC §227; 47 CFR §64.1200).
- **US SMS:** TCPA (as above).
- **EU:** GDPR (Art. 6, 13–14) + ePrivacy Directive 2002/58/EC.
- **UK:** UK GDPR + PECR (Reg. 19–22).
- **Canada:** CASL.
- **Australia:** Spam Act 2003.

The notice is a pointer, not substitute compliance advice from the subscriber's own counsel.

## Escalation

Complaints from prospects or counsel follow `WAT-INC-001`.

## Change log

- v1.0.0-p3 — initial publication.
