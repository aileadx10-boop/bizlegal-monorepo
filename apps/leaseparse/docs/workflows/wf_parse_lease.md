# wf_parse_lease — Extract structured data from a lease PDF

**Objective:** Turn one uploaded commercial lease PDF into a validated `LeaseAbstract` (types in `web/lib/extract/types.ts`) plus a risk summary, delivered by email.

**Inputs:** lease PDF (≤20MB), user email, payment confirmation (product `leaseparse_abstract_59`), optional lease_type hint (`retail|office|industrial|other`).

**Tools, in order:**
1. PDF text extraction (build phase 2) → raw text.
2. `hermes-first.ts` `extractWithHermes` → `ExtractionResult` with deterministic `scoreConfidence`.
3. If `shouldFallback(result)` (confidence < 0.85) → `claude-fallback.ts` `extractWithClaude`; log the fallback event.
4. `date-engine.ts` `deriveCriticalDates` → upcoming alerts seeded into the portfolio monitor.
5. Persist abstract + confidence + engine to Supabase (`leaseparse_leases`); email summary via Resend.

**Outputs:** abstract row in DB, summary email, `lead.inbound`/ops events fired via `lib/ops/log.ts`.

**Edge cases:**
- **Scanned/image PDFs:** no text layer → needs OCR (out of scope for phase 2; return `warnings: ['no_text_layer']` and refund path).
- **Low confidence even after Claude:** deliver with a prominent "low-confidence extraction" banner; never silently ship guesses.
- **Huge leases (300+ pages):** chunk by article headings; merge partial abstracts; cap tokens per chunk.
- **Non-English leases:** detect language; out of scope initially → warn + refund path.
