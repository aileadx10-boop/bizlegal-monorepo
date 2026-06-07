-- AI Conductor Platform + Revenue Chain Agents — 2026-05-27
-- Extends the BizLegal ecosystem with:
--   - Multi-vertical AI workspace (Contract, AI Act, Immigration, Tech-Transfer)
--   - 3-tier subscription management (Solo/Team/Firm)
--   - Revenue chain agent visibility layer
--   - CLE course enrollment
--   - Attorney review queue

-- ═══════════════════════════════════════════════════════════
-- 1. CONDUCTOR PROFILES (user tier + usage tracking)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS conductor_profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text NOT NULL UNIQUE,
  display_name  text,
  tier          text NOT NULL DEFAULT 'solo'
                  CHECK (tier IN ('solo', 'team', 'firm')),
  firm_name     text,
  seats_used    integer NOT NULL DEFAULT 1,
  seats_max     integer NOT NULL DEFAULT 1,
  scans_this_month  integer NOT NULL DEFAULT 0,
  drafts_this_month integer NOT NULL DEFAULT 0,
  billing_cycle_start timestamptz NOT NULL DEFAULT date_trunc('month', now()),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conductor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY conductor_profiles_select ON conductor_profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY conductor_profiles_update ON conductor_profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY conductor_profiles_service ON conductor_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════
-- 2. CONDUCTOR REPORTS (unified across all 4 verticals)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS conductor_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email        text NOT NULL,
  vertical     text NOT NULL
                 CHECK (vertical IN ('contract', 'ai-act', 'immigration', 'tech-transfer')),
  report_type  text NOT NULL,
  title        text,
  input_data   jsonb NOT NULL,
  ai_output    jsonb,
  risk_level   text CHECK (risk_level IS NULL OR risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_score   integer CHECK (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100)),
  status       text NOT NULL DEFAULT 'complete'
                 CHECK (status IN ('pending', 'complete', 'review-flagged', 'attorney-reviewed')),
  review_notes text,
  paid         boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conductor_reports_user ON conductor_reports(user_id);
CREATE INDEX idx_conductor_reports_vertical ON conductor_reports(vertical);
CREATE INDEX idx_conductor_reports_email ON conductor_reports(email);

ALTER TABLE conductor_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY conductor_reports_select ON conductor_reports
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY conductor_reports_service ON conductor_reports
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════
-- 3. CONDUCTOR KB (auto-ingested from official legal sources)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS conductor_kb (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical     text NOT NULL,
  source_name  text NOT NULL,
  source_url   text,
  jurisdiction text,
  topics       text[],
  content      text NOT NULL,
  content_hash text,
  metadata     jsonb,
  ingested_at  timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_conductor_kb_hash ON conductor_kb(content_hash)
  WHERE content_hash IS NOT NULL;
CREATE INDEX idx_conductor_kb_vertical ON conductor_kb(vertical);

-- ═══════════════════════════════════════════════════════════
-- 4. CONDUCTOR FIRM KB (Firm-tier custom knowledge base)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS conductor_firm_kb (
  firm_email   text NOT NULL,
  id           uuid NOT NULL DEFAULT gen_random_uuid(),
  vertical     text NOT NULL,
  source_name  text NOT NULL,
  content      text NOT NULL,
  topics       text[],
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (firm_email, id)
);

-- ═══════════════════════════════════════════════════════════
-- 5. CONDUCTOR REVIEWS (attorney review queue)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS conductor_reviews (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id      uuid NOT NULL REFERENCES conductor_reports(id) ON DELETE CASCADE,
  firm_email     text NOT NULL,
  priority       text NOT NULL DEFAULT 'normal'
                   CHECK (priority IN ('normal', 'urgent')),
  status         text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'in-review', 'approved', 'rejected')),
  reviewer_email text,
  review_notes   text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  reviewed_at    timestamptz
);

CREATE INDEX idx_conductor_reviews_status ON conductor_reviews(status);
CREATE INDEX idx_conductor_reviews_firm ON conductor_reviews(firm_email);

ALTER TABLE conductor_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY conductor_reviews_select ON conductor_reviews
  FOR SELECT USING (
    firm_email = (SELECT email FROM conductor_profiles WHERE id = auth.uid())
  );
CREATE POLICY conductor_reviews_service ON conductor_reviews
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════
-- 6. CLE ENROLLMENTS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS cle_enrollments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email          text NOT NULL,
  course_id      text NOT NULL,
  status         text NOT NULL DEFAULT 'enrolled'
                   CHECK (status IN ('enrolled', 'in-progress', 'completed', 'failed')),
  quiz_score     integer,
  completed_at   timestamptz,
  certificate_id text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, course_id)
);

ALTER TABLE cle_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY cle_enrollments_select ON cle_enrollments
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY cle_enrollments_service ON cle_enrollments
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════
-- 7. AGENT RUNS (revenue chain visibility layer)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS agent_runs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name   text NOT NULL,
  workflow_id  text NOT NULL,
  action       text NOT NULL,
  status       text NOT NULL DEFAULT 'success'
                 CHECK (status IN ('success', 'failed', 'skipped')),
  details      jsonb,
  target_email text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_runs_agent ON agent_runs(agent_name, created_at DESC);
CREATE INDEX idx_agent_runs_created ON agent_runs(created_at DESC);

-- ═══════════════════════════════════════════════════════════
-- 8. LEAD OUTREACH (cold pitch tracking)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lead_outreach (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_email    text NOT NULL,
  lead_name     text,
  company       text,
  pitch_variant text,
  subject       text,
  body_preview  text,
  status        text NOT NULL DEFAULT 'drafted'
                  CHECK (status IN ('drafted', 'sent', 'opened', 'replied', 'converted')),
  sent_at       timestamptz,
  opened_at     timestamptz,
  replied_at    timestamptz,
  agent_run_id  uuid REFERENCES agent_runs(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_outreach_status ON lead_outreach(status);
CREATE INDEX idx_lead_outreach_email ON lead_outreach(lead_email);

-- ═══════════════════════════════════════════════════════════
-- 9. PARTNER OUTREACH (referral partner tracking)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS partner_outreach (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name   text NOT NULL,
  partner_email  text,
  partner_type   text,
  jurisdiction   text,
  pitch_variant  text,
  status         text NOT NULL DEFAULT 'drafted'
                   CHECK (status IN ('drafted', 'sent', 'responded', 'signed', 'rejected')),
  sent_at        timestamptz,
  response_at    timestamptz,
  signed_at      timestamptz,
  agent_run_id   uuid REFERENCES agent_runs(id),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_outreach_status ON partner_outreach(status);

-- ═══════════════════════════════════════════════════════════
-- 10. NEWSLETTER SUBSCRIBERS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email             text NOT NULL UNIQUE,
  vertical_interest text[],
  source            text,
  subscribed_at     timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at   timestamptz,
  last_sent_at      timestamptz,
  open_count        integer NOT NULL DEFAULT 0,
  click_count       integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subs_active ON newsletter_subscribers(email)
  WHERE unsubscribed_at IS NULL;

-- Reconcile pre-existing newsletter_subscribers (created by an earlier
-- migration with a narrower shape) up to the columns the engine expects.
-- No-ops when the columns already exist.
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS vertical_interest text[];
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS last_sent_at timestamptz;
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS open_count integer NOT NULL DEFAULT 0;
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS click_count integer NOT NULL DEFAULT 0;

-- ═══════════════════════════════════════════════════════════
-- 11. RLS HARDENING — service-role-only tables
-- ═══════════════════════════════════════════════════════════
-- These tables are written/read exclusively by server-side code holding
-- the service-role key. The browser now ships NEXT_PUBLIC_SUPABASE_ANON_KEY
-- (magic-link auth), so any public table WITHOUT RLS would be exposed to
-- anon via PostgREST. Enable RLS with a service-role-only policy so the
-- anon/authenticated roles get zero direct access.
ALTER TABLE conductor_kb       ENABLE ROW LEVEL SECURITY;
ALTER TABLE conductor_firm_kb  ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_outreach      ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_outreach   ENABLE ROW LEVEL SECURITY;

CREATE POLICY conductor_kb_service      ON conductor_kb      FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY conductor_firm_kb_service ON conductor_firm_kb FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY agent_runs_service        ON agent_runs        FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY lead_outreach_service     ON lead_outreach     FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY partner_outreach_service  ON partner_outreach  FOR ALL USING (auth.role() = 'service_role');
