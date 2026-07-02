-- ============================================================================
-- 20260702_agent_heartbeats.sql
-- Phase 1 of PLATFORM-BUILD-2026-07-02: live process inspection
--
-- One row per heartbeat ping from each running service. /api/ops/heartbeat
-- writes here, /api/ops/live reads here, /ops/live UI streams from here.
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_heartbeats (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service         text NOT NULL,                -- e.g. "hetzner/headhunter", "hub/api"
  version         text,                          -- e.g. "1.2.3" or git SHA
  pid             integer,                       -- process PID
  hostname        text,                          -- box identifier
  status          text NOT NULL DEFAULT 'alive', -- alive | degraded | dead | starting | stopping
  last_action     text,                          -- free-form: "crawling leads", "sending email"
  last_action_status text,                       -- ok | error | warning
  queue_depth     integer DEFAULT 0,             -- work waiting (e.g. 47 leads queued)
  metadata        jsonb DEFAULT '{}'::jsonb,     -- service-specific tags
  parent_service  text,                          -- for child/parent tree (e.g. cron:headhunter)
  trace_id        text,                          -- current trace, if any
  pinged_at       timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Latest heartbeat per service (the /api/ops/live read)
CREATE INDEX IF NOT EXISTS idx_agent_heartbeats_service_pinged
  ON agent_heartbeats (service, pinged_at DESC);

-- Stale heartbeats (alert query)
CREATE INDEX IF NOT EXISTS idx_agent_heartbeats_status
  ON agent_heartbeats (status, pinged_at DESC);

-- Active traces (for /api/ops/replay)
CREATE INDEX IF NOT EXISTS idx_agent_heartbeats_trace
  ON agent_heartbeats (trace_id) WHERE trace_id IS NOT NULL;

-- Auto-prune heartbeats older than 7 days (keep the audit trail bounded)
-- A nightly cron on Hetzner can run a DELETE statement; we don't use pg_cron here.
COMMENT ON TABLE agent_heartbeats IS
  'Last-known state of every BizLegal service. Read by /api/ops/live for the operator dashboard. Stale (>15 min) rows trigger a Telegram alert.';

-- ============================================================================
-- agent_runs: add trace_id column for cross-service correlation
-- (Existing table — additive only, no destructive changes.)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'trace_id'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN trace_id text;
    CREATE INDEX IF NOT EXISTS idx_agent_runs_trace ON agent_runs (trace_id) WHERE trace_id IS NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- RLS: service_role full access (existing pattern in this DB)
-- ============================================================================

ALTER TABLE agent_heartbeats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agent_heartbeats_service ON agent_heartbeats;
CREATE POLICY agent_heartbeats_service
  ON agent_heartbeats FOR ALL
  USING (auth.role() = 'service_role');
