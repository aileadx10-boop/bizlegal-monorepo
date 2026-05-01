-- ═══════════════════════════════════════════════
-- BIZLEGAL-AI: Live Ops Events log
-- Run in: Supabase → SQL Editor (DB1: ydghhcuuopqzgqcicubg)
-- ═══════════════════════════════════════════════
--
-- Cross-product events stream powering the /ops dashboard.
-- Every meaningful business event lands here:
--   - payment.intent / payment.confirmed / payment.failed
--   - lead.inbound (snapshot vertical-classifier hits)
--   - subscription.created / subscription.cancelled
--   - email.sent (Resend)
--   - cron.fired (BOI tracker, compliance monitor, billing)
--   - sqa.draft / dpa.negotiation / psp.audit / risk.analysis
--   - framework.changed (LexAudit compliance monitor)
--   - kb.uploaded (DocAI Firm tier)
--   - cert.released (LexAudit)
--   - download.report (any product report download)
--
-- All hub + subdomain services write here using the shared service-role
-- key. RLS service-role-only — only the /ops dashboard reads (also
-- service-role, gated by OPS_DASHBOARD_TOKEN).

CREATE TABLE IF NOT EXISTS ops_events (
  id           BIGSERIAL PRIMARY KEY,
  event_type   TEXT          NOT NULL,    -- e.g. 'payment.confirmed', 'email.sent'
  source       TEXT          NOT NULL,    -- e.g. 'hub', 'docai', 'lexaudit', 'tracr', 'forge'
  ref_id       TEXT,                       -- order_id / cert_id / draft_id / event ref
  ref_email    TEXT,                       -- if event has a user email
  amount_cents INTEGER,                    -- if event has a $ amount
  status       TEXT,                       -- ok / pending / failed / etc.
  metadata     JSONB         NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ops_events_created_idx ON ops_events(created_at DESC);
CREATE INDEX IF NOT EXISTS ops_events_type_idx ON ops_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS ops_events_source_idx ON ops_events(source, created_at DESC);
CREATE INDEX IF NOT EXISTS ops_events_email_idx ON ops_events(ref_email) WHERE ref_email IS NOT NULL;

ALTER TABLE ops_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ops_events_service_all" ON ops_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Convenience views for the dashboard
CREATE OR REPLACE VIEW ops_events_24h_by_type AS
  SELECT event_type, source, COUNT(*) AS count, SUM(COALESCE(amount_cents, 0)) AS amount_cents_sum
  FROM ops_events
  WHERE created_at > NOW() - INTERVAL '24 hours'
  GROUP BY event_type, source
  ORDER BY count DESC;

CREATE OR REPLACE VIEW ops_events_recent AS
  SELECT id, event_type, source, ref_id, ref_email, amount_cents, status, metadata, created_at
  FROM ops_events
  ORDER BY created_at DESC
  LIMIT 200;
