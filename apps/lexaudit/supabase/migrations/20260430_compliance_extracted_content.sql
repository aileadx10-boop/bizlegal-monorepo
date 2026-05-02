-- Q2 — Compliance Monitor diff cron now stores Firecrawl-extracted
-- markdown alongside the SHA-256 hash so Sonnet can compute a
-- semantic-aware change summary on the next diff.
--
-- Idempotent. Apply against the LexAudit hub Supabase project.

ALTER TABLE public.compliance_framework_index
  ADD COLUMN IF NOT EXISTS extracted_content text;

COMMENT ON COLUMN public.compliance_framework_index.extracted_content IS
  'Firecrawl-extracted markdown body of the source URL at fetched_at time. NULL when raw-HTML fallback was used (no FIRECRAWL_API_KEY) or when Firecrawl failed for that URL. Used by the next run to compute Sonnet semantic-diff change_summary.';
