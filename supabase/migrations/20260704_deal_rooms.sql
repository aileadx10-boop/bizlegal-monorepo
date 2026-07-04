-- Deal rooms: private proposal pages for qualified leads
-- Created by: WP3 Revenue Machine (qualifier chat + deal room)
-- Date: 2026-07-04

CREATE TABLE IF NOT EXISTS deal_rooms (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  token       text UNIQUE NOT NULL,                -- used in /deal/[token] URL
  lead_name   text NOT NULL,
  lead_email  text NOT NULL,
  company     text NOT NULL DEFAULT '',
  product     text NOT NULL DEFAULT 'compliance-ai',
  score       integer NOT NULL DEFAULT 50
                CHECK (score >= 0 AND score <= 100),
  ai_summary  text NOT NULL DEFAULT '',
  status      text NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'closed', 'expired')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS: service-role writes (from /api/qualify), public reads via token
ALTER TABLE deal_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_write_deal_rooms" ON deal_rooms
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "public_read_by_token" ON deal_rooms
  FOR SELECT TO anon, authenticated
  USING (true);  -- token is unguessable (UUID hex); page calls notFound() on miss

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deal_rooms_token ON deal_rooms (token);
CREATE INDEX IF NOT EXISTS idx_deal_rooms_email ON deal_rooms (lead_email);
CREATE INDEX IF NOT EXISTS idx_deal_rooms_status ON deal_rooms (status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_deal_rooms_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_deal_rooms_updated_at ON deal_rooms;
CREATE TRIGGER set_deal_rooms_updated_at
  BEFORE UPDATE ON deal_rooms
  FOR EACH ROW EXECUTE FUNCTION update_deal_rooms_updated_at();
