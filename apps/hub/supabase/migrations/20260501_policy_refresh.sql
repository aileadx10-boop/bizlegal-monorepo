-- V2 — Privacy Auto-Refresh persistence.
-- Idempotent. Apply against the hub Supabase project.

CREATE TABLE IF NOT EXISTS public.policy_refresh_audits (
  id                          BIGSERIAL PRIMARY KEY,
  user_email                  TEXT NOT NULL,
  policy_url                  TEXT NOT NULL,
  policy_title                TEXT,
  frameworks_touched          TEXT[] DEFAULT '{}'::TEXT[],
  findings                    JSONB DEFAULT '[]'::JSONB,
  summary                     TEXT,
  generated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policy_refresh_audits_email
  ON public.policy_refresh_audits (user_email);
CREATE INDEX IF NOT EXISTS idx_policy_refresh_audits_url
  ON public.policy_refresh_audits (policy_url);
CREATE INDEX IF NOT EXISTS idx_policy_refresh_audits_generated
  ON public.policy_refresh_audits (generated_at DESC);

ALTER TABLE public.policy_refresh_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.policy_refresh_audits;
CREATE POLICY "service_role_all"
  ON public.policy_refresh_audits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.policy_refresh_subs (
  id                          BIGSERIAL PRIMARY KEY,
  user_email                  TEXT NOT NULL,
  policy_url                  TEXT NOT NULL,
  status                      TEXT NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'paused', 'cancelled', 'past_due', 'trial', 'expired')),
  last_audit_id               BIGINT REFERENCES public.policy_refresh_audits(id) ON DELETE SET NULL,
  last_audit_at               TIMESTAMPTZ,
  last_notified_at            TIMESTAMPTZ,
  payment_order_id            TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_email, policy_url)
);

CREATE INDEX IF NOT EXISTS idx_policy_refresh_subs_status
  ON public.policy_refresh_subs (status);

ALTER TABLE public.policy_refresh_subs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.policy_refresh_subs;
CREATE POLICY "service_role_all"
  ON public.policy_refresh_subs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.policy_refresh_audits IS
  'V2 — One row per /api/policy-refresh/audit call. Daily cron compares latest row vs prior row to detect material changes (new HIGH findings or count delta > 2) and emails the subscriber.';

COMMENT ON TABLE public.policy_refresh_subs IS
  'V2 — Active monitoring subscriptions. One row per (user_email, policy_url) pair. Daily cron re-audits each row.';
