-- 2026-07-03: extension_captures — browser extension compliance capture events
-- Records page captures, contract text, compliance checks, and wallet addresses
-- sent from the BizLegal AI browser extension via /api/extension/capture.

CREATE TABLE IF NOT EXISTS extension_captures (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  url             text        NOT NULL,
  page_title      text,
  page_text       text,
  action          text        NOT NULL DEFAULT 'page_capture',
  api_key         text,
  ip_hash         text,  -- sha256 of the raw IP, never the IP itself
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_extension_captures_created ON extension_captures (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_extension_captures_action  ON extension_captures (action);

-- Row-level security: service_role can read/write; anon can only insert
-- (the extension posts as anonymous — no auth flow required for MVP).
ALTER TABLE extension_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "extension_captures_anon_insert"
  ON extension_captures
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "extension_captures_service_read"
  ON extension_captures
  FOR SELECT
  TO public
  USING (auth.role() = 'service_role');
