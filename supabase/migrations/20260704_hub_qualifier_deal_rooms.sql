-- 2026-07-04: Async qualifier chat + token-gated deal rooms (hub revenue machine, Engine 3)
-- qualifier_sessions: multi-turn AI qualifier transcript + extracted ICP/budget/score
-- deal_rooms: private custom-build offers (pilot/build/flagship) reachable only via unguessable token
-- Writes are service-role only (hub API routes use SUPABASE_SERVICE_KEY; anon gets nothing).

CREATE TABLE IF NOT EXISTS qualifier_sessions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text,
  transcript   jsonb       NOT NULL DEFAULT '[]',
  icp          text,                                -- fintech | crypto | saas | law-firm | real-estate
  budget_band  text,                                -- '<500' | '500-2500' | '2500-15000' | '15000+'
  score        integer,                             -- 0-100 intent score from extraction pass
  status       text        NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'routed_sku', 'deal_room', 'abandoned')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deal_rooms (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  token                 text        UNIQUE NOT NULL,  -- 32+ hex chars, minted server-side (crypto.randomBytes)
  qualifier_session_id  uuid        REFERENCES qualifier_sessions(id),
  email                 text        NOT NULL,
  offer_tier            text        NOT NULL
                        CHECK (offer_tier IN ('pilot', 'build', 'flagship')),
  price_usd             integer     NOT NULL,
  scope_md              text,                        -- 6-10 bullet custom scope, markdown
  status                text        NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'viewed', 'paid', 'expired')),
  expires_at            timestamptz NOT NULL DEFAULT now() + interval '14 days',
  viewed_at             timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qualifier_sessions_status ON qualifier_sessions(status);
CREATE INDEX IF NOT EXISTS idx_qualifier_sessions_email ON qualifier_sessions(email);
CREATE INDEX IF NOT EXISTS idx_deal_rooms_token ON deal_rooms(token);
CREATE INDEX IF NOT EXISTS idx_deal_rooms_status ON deal_rooms(status, expires_at);

ALTER TABLE qualifier_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_rooms ENABLE ROW LEVEL SECURITY;

-- Service-role-only access (same posture as conversion_snapshots SELECT policy in
-- 20260702 — auth.role() = 'service_role'; anon/authenticated get no policy at all).
-- DROP+CREATE keeps the file re-runnable (CREATE POLICY has no IF NOT EXISTS in PG15).
DROP POLICY IF EXISTS "qualifier_sessions_service_all" ON qualifier_sessions;
CREATE POLICY "qualifier_sessions_service_all"
  ON qualifier_sessions
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "deal_rooms_service_all" ON deal_rooms;
CREATE POLICY "deal_rooms_service_all"
  ON deal_rooms
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
