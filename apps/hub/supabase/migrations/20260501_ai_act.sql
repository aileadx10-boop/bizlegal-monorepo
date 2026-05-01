-- V1 — AI-Act Risk Classifier persistence.
-- Idempotent. Apply against the hub Supabase project.

CREATE TABLE IF NOT EXISTS public.ai_act_classifications (
  id                          BIGSERIAL PRIMARY KEY,
  user_email                  TEXT NOT NULL,
  system_description          TEXT NOT NULL,
  risk_tier                   TEXT NOT NULL CHECK (risk_tier IN ('minimal', 'limited', 'high', 'unacceptable')),
  rationale                   TEXT,
  articles_cited              TEXT[] DEFAULT '{}'::TEXT[],
  annex_sections_cited        TEXT[] DEFAULT '{}'::TEXT[],
  documentation_checklist     JSONB DEFAULT '[]'::JSONB,
  flags                       JSONB DEFAULT '{}'::JSONB,
  generated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_act_classifications_email
  ON public.ai_act_classifications (user_email);
CREATE INDEX IF NOT EXISTS idx_ai_act_classifications_tier
  ON public.ai_act_classifications (risk_tier);
CREATE INDEX IF NOT EXISTS idx_ai_act_classifications_generated_at
  ON public.ai_act_classifications (generated_at DESC);

ALTER TABLE public.ai_act_classifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.ai_act_classifications;
CREATE POLICY "service_role_all"
  ON public.ai_act_classifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.ai_act_subs (
  id                          BIGSERIAL PRIMARY KEY,
  user_email                  TEXT NOT NULL UNIQUE,
  status                      TEXT NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'paused', 'cancelled', 'past_due', 'trial', 'expired')),
  monitoring_areas            TEXT[] DEFAULT '{}'::TEXT[],
  last_notified_at            TIMESTAMPTZ,
  last_classification_id      BIGINT REFERENCES public.ai_act_classifications(id) ON DELETE SET NULL,
  payment_order_id            TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_act_subs_status ON public.ai_act_subs (status);

ALTER TABLE public.ai_act_subs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.ai_act_subs;
CREATE POLICY "service_role_all"
  ON public.ai_act_subs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.ai_act_framework_index (
  id                          BIGSERIAL PRIMARY KEY,
  source_id                   TEXT NOT NULL,
  source_url                  TEXT NOT NULL,
  source_version              TEXT,
  content_sha256              TEXT NOT NULL,
  extracted_content           TEXT,
  change_summary              TEXT,
  fetched_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_change                   BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_ai_act_framework_source_fetched
  ON public.ai_act_framework_index (source_id, fetched_at DESC);

ALTER TABLE public.ai_act_framework_index ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.ai_act_framework_index;
CREATE POLICY "service_role_all"
  ON public.ai_act_framework_index
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.ai_act_framework_index IS
  'V1 — Daily Firecrawl-extracted snapshots of EU AI Act sources. Hash diff against previous row triggers Sonnet semantic-change summary + subscriber notifications.';

COMMENT ON TABLE public.ai_act_classifications IS
  'V1 — Records every AI-Act risk-tier classification generated for a user. One row per /api/ai-act/classify call. Used to upsell free-classifier users into $49/mo monitoring.';

COMMENT ON TABLE public.ai_act_subs IS
  'V1 — Active monitoring subscriptions. Daily ai-act-monitor cron checks framework_index for changes affecting these subscribers.';
