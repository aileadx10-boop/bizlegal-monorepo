-- ═══════════════════════════════════════════════
-- BIZLEGAL-AI: Compliance Obligation Extractor (W4-10, O-012)
-- Run in: Supabase → SQL Editor (DB1: ydghhcuuopqzgqcicubg)
-- ═══════════════════════════════════════════════

-- One row per extraction. `obligations` holds the structured checklist
-- (obligation / party / deadline / evidence_required / source_provision).
-- `citations` is the allowlist of verbatim provisions the model was
-- constrained to cite from — kept for auditability.
CREATE TABLE IF NOT EXISTS public.obligation_extractions (
  id            BIGSERIAL PRIMARY KEY,
  user_email    TEXT,                              -- optional lead capture
  source_text   TEXT NOT NULL,                      -- pasted regulation/contract
  source_url    TEXT,                               -- optional source URL
  summary       TEXT,                               -- 2-3 sentence document summary
  obligations   JSONB NOT NULL DEFAULT '[]'::JSONB,
  citations     TEXT[] DEFAULT '{}'::TEXT[],
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_obligation_extractions_email
  ON public.obligation_extractions (user_email);
CREATE INDEX IF NOT EXISTS idx_obligation_extractions_generated_at
  ON public.obligation_extractions (generated_at DESC);

ALTER TABLE public.obligation_extractions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.obligation_extractions;
CREATE POLICY "service_role_all"
  ON public.obligation_extractions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.obligation_extractions IS
  'W4-10 — Compliance Obligation Extractor. Structured obligations extracted from pasted regulation/contract text, each with a verbatim source provision. Feeds the CASP bundle (O-014).';
