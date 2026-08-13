-- ═══════════════════════════════════════════════
-- BIZLEGAL-AI: AI Policy Generator (W3-8, O-010)
-- Run in: Supabase → SQL Editor (DB1: ydghhcuuopqzgqcicubg)
-- ═══════════════════════════════════════════════

-- One row per generated AI usage policy draft. `download_token` gates the
-- full-policy download: the wizard stores a draft (status='draft'), and the
-- webhook flips it to 'paid' on payment.confirmed for product
-- ai_policy_generator, then emails the policy. `citations` is the allowlist
-- (ABA Formal Opinion 512 + Model Rules) the model was constrained to cite.
CREATE TABLE IF NOT EXISTS public.ai_policy_drafts (
  id              BIGSERIAL PRIMARY KEY,
  user_email      TEXT NOT NULL,
  firm_size       TEXT NOT NULL,                    -- 'solo' | 'small' | 'mid' | 'large'
  practice_areas  TEXT[] DEFAULT '{}'::TEXT[],
  ai_tools        TEXT[] DEFAULT '{}'::TEXT[],
  policy_title    TEXT NOT NULL DEFAULT 'Firm AI Usage Policy',
  policy_markdown TEXT NOT NULL,
  citations       TEXT[] DEFAULT '{}'::TEXT[],
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'paid')),
  download_token  TEXT NOT NULL UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_policy_drafts_email
  ON public.ai_policy_drafts (user_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_policy_drafts_token
  ON public.ai_policy_drafts (download_token);

ALTER TABLE public.ai_policy_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.ai_policy_drafts;
CREATE POLICY "service_role_all"
  ON public.ai_policy_drafts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.ai_policy_drafts IS
  'W3-8 — AI Policy Generator. Firm AI usage policy drafts, gated on $99 payment. Template — attorney must review before adoption.';
