-- ============================================================================
-- 20260702_agent_alerts_log.sql
-- Phase 1 of PLATFORM-BUILD-2026-07-02: dedup table for Telegram alerts
--
-- One row per fingerprint so ops_alerts.py doesn't spam Telegram
-- every 5 minutes for the same stale service.
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_alerts_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text UNIQUE NOT NULL,    -- SHA256(service|last_ping)[:32]
  service     text NOT NULL,
  age_seconds integer,
  alerted_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_alerts_log_service
  ON agent_alerts_log (service, alerted_at DESC);

-- Auto-prune alerts older than 30 days (a nightly cron on Hetzner can do this)
COMMENT ON TABLE agent_alerts_log IS
  'Dedupe log: one row per Telegram alert. ops_alerts.py uses the fingerprint to avoid re-sending the same stale-service notification every 5 minutes.';

ALTER TABLE agent_alerts_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agent_alerts_log_service ON agent_alerts_log;
CREATE POLICY agent_alerts_log_service
  ON agent_alerts_log FOR ALL
  USING (auth.role() = 'service_role');
