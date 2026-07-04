-- AI Compliance Risk Snapshots — $19 one-time product table
-- Stores score, grade, flags, url, jurisdiction, email.
-- The scraped site text is NEVER stored.

CREATE TABLE IF NOT EXISTS risk_snapshots (
  id              BIGSERIAL PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  email           TEXT NOT NULL,
  url             TEXT NOT NULL,
  jurisdiction    TEXT NOT NULL CHECK (jurisdiction IN ('US','EU','UK','IL','GLOBAL')),
  score           SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  grade           CHAR(1) NOT NULL CHECK (grade IN ('A','B','C','D','F')),
  flags           JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_fix TEXT,
  order_id        TEXT
);

CREATE INDEX IF NOT EXISTS risk_snapshots_created_at_idx ON risk_snapshots (created_at DESC);
CREATE INDEX IF NOT EXISTS risk_snapshots_email_idx      ON risk_snapshots (email);
CREATE INDEX IF NOT EXISTS risk_snapshots_score_idx      ON risk_snapshots (score DESC);

-- RLS: service role only
ALTER TABLE risk_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS risk_snapshots_service_only ON risk_snapshots;
CREATE POLICY risk_snapshots_service_only ON risk_snapshots
  FOR ALL TO service_role USING (true) WITH CHECK (true);
