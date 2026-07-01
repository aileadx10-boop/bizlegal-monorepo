-- 2026-07-02: Fix agent_runs logging (allow anon INSERT) + add conversion_snapshots table
-- Root cause: pipeline scripts use anon key but agent_runs only allowed service_role
-- Impact: all pipeline agent_run logging was silently failing (400/401 on every INSERT)

-- Allow pipeline scripts (using anon key) to INSERT agent run logs
-- Scripts run with the anon key; SELECT/DELETE still require service_role
CREATE POLICY IF NOT EXISTS "agent_runs_anon_insert"
  ON agent_runs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Conversion snapshot table for conversion_tracker.py trend tracking
CREATE TABLE IF NOT EXISTS conversion_snapshots (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  date             date        NOT NULL UNIQUE,
  articles         integer     NOT NULL DEFAULT 0,
  leads            integer     NOT NULL DEFAULT 0,
  orders           integer     NOT NULL DEFAULT 0,
  revenue_cents    bigint      NOT NULL DEFAULT 0,
  open_rate_pct    numeric(5,2) NOT NULL DEFAULT 0,
  reply_rate_pct   numeric(5,2) NOT NULL DEFAULT 0,
  aov_cents        integer     NOT NULL DEFAULT 0,
  conv_rate_pct    numeric(5,2) NOT NULL DEFAULT 0,
  by_pillar        jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conversion_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "conversion_snapshots_anon_insert"
  ON conversion_snapshots
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "conversion_snapshots_service_select"
  ON conversion_snapshots
  FOR SELECT
  TO public
  USING (auth.role() = 'service_role');
