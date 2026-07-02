-- ============================================================================
-- 20260703_spy_intel.sql
-- Phase 5 of PLATFORM-BUILD-2026-07-02: Spy subsystem
--
-- Stores competitor intelligence gathered by services/spy/*.py scripts.
-- Read by apps/hub/app/ops/spy/page.tsx (operator dashboard).
-- ============================================================================

CREATE TABLE IF NOT EXISTS spy_intel (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intel_type      text NOT NULL,       -- pricing | content_gap | backlink_opportunity | social_signal
  competitor      text,                -- vanta | drata | sprinto | chainalysis | null (for aggregates)
  finding         text NOT NULL,       -- human-readable summary of the intel
  source_url      text,                -- URL that was scraped / source of intel
  raw_data        jsonb DEFAULT '{}'::jsonb,  -- full structured data from the script
  relevance_score integer DEFAULT 50,  -- 0-100; higher = more actionable for BizLegal
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Fast reads for the /ops/spy dashboard (grouped by type, latest first)
CREATE INDEX IF NOT EXISTS idx_spy_intel_type
  ON spy_intel (intel_type, created_at DESC);

-- Filter by competitor
CREATE INDEX IF NOT EXISTS idx_spy_intel_competitor
  ON spy_intel (competitor);

-- RLS: service_role only (same pattern as other tables in this DB)
ALTER TABLE spy_intel ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS spy_intel_service ON spy_intel;
CREATE POLICY spy_intel_service
  ON spy_intel FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE spy_intel IS
  'Competitor intelligence gathered by services/spy/* scripts. '
  'Read by /ops/spy dashboard. intel_type: pricing | content_gap | backlink_opportunity | social_signal.';
