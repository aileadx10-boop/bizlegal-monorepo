-- ═══════════════════════════════════════════════
-- LexAudit: Compliance Monitor Pro subscriptions + framework index
-- Run in: Supabase → SQL Editor (DB1: ydghhcuuopqzgqcicubg)
-- ═══════════════════════════════════════════════

-- Per-subscriber framework + signal selection. One row per (user_email, firm).
CREATE TABLE IF NOT EXISTS compliance_subs (
  id                 BIGSERIAL PRIMARY KEY,
  user_email         TEXT          NOT NULL,
  firm_id            UUID,                                      -- nullable; set when firm-tier
  frameworks         TEXT[]        NOT NULL DEFAULT '{}',       -- ['soc2', 'iso27001', 'gdpr', ...]
  subscribed_signals TEXT[]        NOT NULL DEFAULT '{}',       -- specific signal ids of interest, empty = all
  notification_channel TEXT        NOT NULL DEFAULT 'email',    -- 'email' | 'webhook' | 'slack'
  webhook_url        TEXT,                                       -- if channel = webhook
  status             TEXT          NOT NULL DEFAULT 'active',   -- 'active' | 'paused' | 'cancelled'
  last_notified_at   TIMESTAMPTZ,
  payment_order_id   BIGINT,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Cached daily framework-revision diff index. Each row = one framework
-- snapshot at a given point in time. Diff is computed by comparing the most
-- recent two rows for the same framework_id.
CREATE TABLE IF NOT EXISTS compliance_framework_index (
  id              BIGSERIAL PRIMARY KEY,
  framework_id    TEXT          NOT NULL,    -- 'soc2' | 'iso27001' | 'gdpr' | 'hipaa' | 'dpdp' | 'nist-800-53'
  source_url      TEXT          NOT NULL,
  source_version  TEXT,                       -- e.g., 'TSP 2017 (2024 update)' or 'r5'
  content_sha256  TEXT          NOT NULL,
  change_summary  TEXT,                       -- Sonnet-generated summary of what changed since previous snapshot
  affected_signal_ids TEXT[]    NOT NULL DEFAULT '{}',
  fetched_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  is_change       BOOLEAN       NOT NULL DEFAULT FALSE  -- true if content_sha256 differs from previous snapshot
);

CREATE INDEX IF NOT EXISTS compliance_subs_email_idx ON compliance_subs(user_email);
CREATE INDEX IF NOT EXISTS compliance_subs_status_idx ON compliance_subs(status);
CREATE INDEX IF NOT EXISTS compliance_framework_index_framework_idx ON compliance_framework_index(framework_id, fetched_at DESC);
CREATE INDEX IF NOT EXISTS compliance_framework_index_change_idx ON compliance_framework_index(is_change, fetched_at DESC) WHERE is_change = TRUE;

-- updated_at trigger (assume update_updated_at function exists from prior migration)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at') THEN
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $f$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $f$ LANGUAGE plpgsql;
  END IF;
END $$;

CREATE TRIGGER compliance_subs_updated_at
  BEFORE UPDATE ON compliance_subs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: service-role only
ALTER TABLE compliance_subs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_framework_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "compliance_subs_service_all" ON compliance_subs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "compliance_framework_service_all" ON compliance_framework_index
  FOR ALL TO service_role USING (true) WITH CHECK (true);
