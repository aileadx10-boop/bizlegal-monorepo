-- Compliance Health Snapshots — privacy-by-default analytics table
-- Stores ONLY score, grade, flags metadata, and email.
-- The pasted document is NEVER stored.

CREATE TABLE IF NOT EXISTS compliance_snapshots (
  id              BIGSERIAL PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  email           TEXT,
  doc_type        TEXT NOT NULL CHECK (doc_type IN ('privacy_policy','vendor_contract','tos')),
  score           SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  grade           CHAR(1) NOT NULL CHECK (grade IN ('A','B','C','D','F')),
  flags           JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_fix TEXT,
  unlocked        BOOLEAN NOT NULL DEFAULT false,
  paid_at         TIMESTAMPTZ,
  stripe_session  TEXT,
  user_agent      TEXT,
  referrer        TEXT
);

CREATE INDEX IF NOT EXISTS compliance_snapshots_created_at_idx ON compliance_snapshots (created_at DESC);
CREATE INDEX IF NOT EXISTS compliance_snapshots_email_idx      ON compliance_snapshots (email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS compliance_snapshots_doc_type_idx   ON compliance_snapshots (doc_type);
CREATE INDEX IF NOT EXISTS compliance_snapshots_unlocked_idx   ON compliance_snapshots (unlocked) WHERE unlocked = true;

-- RLS: no direct read/write from anon. Only service role.
ALTER TABLE compliance_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS compliance_snapshots_service_only ON compliance_snapshots;
CREATE POLICY compliance_snapshots_service_only ON compliance_snapshots
  FOR ALL TO service_role USING (true) WITH CHECK (true);
