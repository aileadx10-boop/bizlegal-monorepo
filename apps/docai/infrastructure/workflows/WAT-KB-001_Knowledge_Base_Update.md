# WAT-KB-001 — Knowledge Base Update

Version: v1.0.0-p3
Owner: Product Intelligence
Last reviewed: 2026-04-19

## Purpose

This SOP governs how entries are added to, updated in, or removed from the knowledge base that powers SQA retrieval, compliance health-score signals, and chain-intelligence sanctions lists across the BizLegal AI family.

## Scope

Applies to:
- DocAI SQA knowledge store (`web/lib/sqa/knowledge-base.ts`)
- LexAudit signal registry (`lib/health-score/signals.ts`)
- TRACR + BRAI sanctions cache (`lib/chain/sanctions.ts`)
- LeadForge intent-source registry

## Inputs

- The regulator-published source document(s) to index or re-verify.
- The reviewer's notes describing what changed in the source relative to our prior snapshot (if any).

## Procedure

1. **Source.** Every entry must cite a regulator-published URL as its source. A secondary summary (blog, news wire) is never the primary source — it is at most the discovery path. The canonical URL goes on the entry.
2. **Verify.** Fetch the cited source. Compare against the prior snapshot (if any). Record what changed.
3. **Normalise.** Produce the entry in the store's required schema:
   - `id` (stable, kebab-case, derived from jurisdiction + control ref)
   - `source_name`, `source_url`, `jurisdiction`, `topics`, `text`, `last_updated`
   - for health-score signals: `control_ref`, `evidence_type`, `severity`
4. **Gate.** Entries missing `source_url` or `last_updated` are rejected by `knowledgeStoreFromManifest()`. Signals missing `control_ref` or `severity` are rejected by the signals loader.
5. **Review.** A named reviewer signs off that the entry's text and metadata accurately reflect the cited source. The reviewer checks:
   - URL resolves and points at the claimed regulator page.
   - Quoted or summarised text matches the source.
   - Jurisdiction assignment is correct.
   - `last_updated` reflects the date of source verification, not of local edit.
6. **Publish.** Merge the entry into the manifest. If the underlying source has changed since the last verification, bump the entry's `last_updated` and, where applicable, bump `DISCLAIMER_VERSION`.
7. **Audit.** Append to the KB audit log: entry id, reviewer, disclosure version, diff from prior (if any).

## Removal

Entries are removed (not silently edited) when:
- The cited source has been withdrawn by the regulator.
- An independent review determines the entry misrepresents the source.
- A follow-up WAT-INC-001 investigation flags the entry.

Removal records include the reason. Prior outputs that cited the removed entry remain reproducible via `disclaimer_version`; the entry is marked deprecated, not expunged.

## Mandatory holds

- Entry without `source_url` → reject.
- Entry without `last_updated` → reject.
- Entry whose reviewer is also the author → reject (two-person rule).

## Escalation

A challenged entry follows `WAT-INC-001`.

## Change log

- v1.0.0-p3 — initial publication.
