-- ═══════════════════════════════════════════════
-- BIZLEGAL-AI: MiCA Deadline Tracker (W1-3)
-- Run in: Supabase → SQL Editor (DB1: ydghhcuuopqzgqcicubg)
-- ═══════════════════════════════════════════════

-- Cached MiCA deadline / transition items pulled from ESMA + NCA sources.
-- Dedupe on (source_url, deadline_date) so the daily cron is idempotent.
CREATE TABLE IF NOT EXISTS mica_deadlines (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT          NOT NULL,
  description   TEXT,
  deadline_date DATE          NOT NULL,
  source_name   TEXT          NOT NULL,   -- 'ESMA' | 'NCA:FR' | 'MiCA Regulation' | etc.
  source_url    TEXT          NOT NULL,
  jurisdiction  TEXT          NOT NULL DEFAULT 'EU',   -- 'EU' | 'EU-wide' | country code
  item_type     TEXT          NOT NULL DEFAULT 'deadline',  -- 'deadline' | 'transition' | 'guidance'
  published_at  DATE,
  fetched_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (source_url, deadline_date)
);

-- Subscribers to the daily MiCA deadline digest (email, jurisdiction).
CREATE TABLE IF NOT EXISTS mica_deadline_subs (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT          NOT NULL UNIQUE,
  jurisdiction  TEXT          NOT NULL DEFAULT 'EU',  -- 'EU' | country code
  status        TEXT          NOT NULL DEFAULT 'active',  -- 'active' | 'unsubscribed'
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  last_digest_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS mica_deadlines_deadline_idx ON mica_deadlines(deadline_date DESC);
CREATE INDEX IF NOT EXISTS mica_deadline_subs_status_idx ON mica_deadline_subs(status);

-- RLS: service-role only (cron writes; page reads via service-role)
ALTER TABLE mica_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE mica_deadline_subs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mica_deadlines_service_all" ON mica_deadlines
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "mica_subs_service_all" ON mica_deadline_subs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
