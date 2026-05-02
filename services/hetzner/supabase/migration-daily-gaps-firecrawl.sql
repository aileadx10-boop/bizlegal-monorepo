-- Q1 — Firecrawl enrichment column on curator daily_gaps.
-- Idempotent. Apply against the curator's hub Supabase project.
--
-- Stores the structured extract returned by firecrawl_enrich.py:
--   {
--     party: { regulator: string, respondent: string },
--     penalty_usd: number,
--     effective_date: string,    -- ISO 8601
--     deadline_date: string,     -- ISO 8601
--     regulation_cites: string[],
--     key_quote: string,
--     executive_summary: string[]
--   }
--
-- brain.py reads this column and injects the contents into Claude's
-- DRAFT prompt as a "FIRECRAWL VERIFIED EXTRACT" block so the
-- long-form draft is grounded in scraped primary-source facts rather
-- than free-form speculation. publisher.py's numeric-claim verifier
-- then has more numbers to verify against the cited URLs.

ALTER TABLE public.daily_gaps
  ADD COLUMN IF NOT EXISTS firecrawl jsonb;

COMMENT ON COLUMN public.daily_gaps.firecrawl IS
  'Firecrawl structured extract for the source URL (Q1). Populated by scout.py before the pending_pick state. NULL when FIRECRAWL_API_KEY is unset or the scrape failed.';
