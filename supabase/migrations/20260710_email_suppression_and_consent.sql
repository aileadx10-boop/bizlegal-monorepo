-- Migration: 2026-07-10 — email suppression + consent foundation
-- Reason: 2026-07-10 spam-pipeline incident (ef3d90e) — future cold outreach
-- requires (a) consented lead source, (b) suppression list, (c) explicit
-- Moses approval before any send.
-- This migration creates the suppression + consent-log primitives so the
-- opt-in pipeline can ship safely.

-- ============================================================
-- TABLE 1: email_suppression_list
-- Every email that must NEVER receive marketing email again.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_suppression_list (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    reason text NOT NULL CHECK (reason IN (
        'unsubscribed',        -- user clicked unsub link
        'bounced_hard',        -- Resend reported permanent failure
        'bounced_soft',        -- Resend reported temporary failure (3x → upgrade to hard)
        'complained',          -- user marked as spam
        'manual_block',        -- Moses blocked this address
        'role_inbox',          -- catch-all role@ domain (abuse@, no-reply@)
        'competitor',          -- competing company (do not mail)
        'unverified'           -- no double opt-in ever received
    )),
    detail text,
    source text,                   -- 'resend_webhook' | 'manual' | 'newsletter_form' | 'import'
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by text                 -- 'moses' | 'agent:outreach_pipeline' | etc.
);

CREATE INDEX IF NOT EXISTS idx_suppression_email ON public.email_suppression_list (lower(email));
CREATE INDEX IF NOT EXISTS idx_suppression_reason ON public.email_suppression_list (reason);

ALTER TABLE public.email_suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppression_list FORCE ROW LEVEL SECURITY;

-- Service role can read/write everything (cron agents use service role).
-- Anon/authenticated can NEVER see or write to this table directly.
DROP POLICY IF EXISTS suppression_service_all ON public.email_suppression_list;
CREATE POLICY suppression_service_all ON public.email_suppression_list
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- TABLE 2: email_consent_log
-- Append-only audit trail of every consent event.
-- The newsletter_subscribers and leads tables are the source of truth
-- for "currently consented" — this log proves WHEN consent was given
-- and HOW (double opt-in / explicit form / sales-call).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_consent_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    consent_kind text NOT NULL CHECK (consent_kind IN (
        'double_optin',     -- clicked confirmation link in welcome email
        'explicit_form',    -- filled an opt-in form on the site
        'sales_call',       -- verbally consented during a sales conversation
        'manual_entry',     -- Moses typed this in
        'customer_receipt'  -- paid customer, consented to transactional email
    )),
    source_table text,              -- 'newsletter_subscribers' | 'leads' | 'manual'
    source_id text,                 -- row id in source table
    ip text,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_email ON public.email_consent_log (lower(email));
CREATE INDEX IF NOT EXISTS idx_consent_kind ON public.email_consent_log (consent_kind);

ALTER TABLE public.email_consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_consent_log FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS consent_service_insert ON public.email_consent_log;
CREATE POLICY consent_service_insert ON public.email_consent_log
    FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS consent_service_read ON public.email_consent_log;
CREATE POLICY consent_service_read ON public.email_consent_log
    FOR SELECT TO service_role USING (true);

-- ============================================================
-- TABLE 3: email_send_log (replacement for the dangerous lead_outreach)
-- Records every actual Resend API call with full audit trail.
-- Lead_outreach gets deprecated for cold outreach (kept for the
-- legitimate sales-team workflow).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_send_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    to_email text NOT NULL,
    from_email text NOT NULL,
    subject text NOT NULL,
    body_excerpt text,
    resend_message_id text,
    resend_status text,           -- 'sent' | 'bounced' | 'complained' | 'delivered' | 'opened'
    campaign text,                -- 'weekly_digest' | 'product_newsletter' | 'transactional'
    consent_log_id uuid REFERENCES public.email_consent_log(id),
    suppression_checked boolean NOT NULL DEFAULT false,
    sent_at timestamptz NOT NULL DEFAULT now(),
    delivered_at timestamptz,
    opened_at timestamptz,
    bounced_at timestamptz,
    complained_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_sendlog_email ON public.email_send_log (lower(to_email));
CREATE INDEX IF NOT EXISTS idx_sendlog_status ON public.email_send_log (resend_status);
CREATE INDEX IF NOT EXISTS idx_sendlog_campaign ON public.email_send_log (campaign);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_log FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sendlog_service_all ON public.email_send_log;
CREATE POLICY sendlog_service_all ON public.email_send_log
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- SEED: pre-block the worst fabricated addresses from the
-- 2026-07-10 incident.  This is a one-time data fix, not a policy.
-- ============================================================
INSERT INTO public.email_suppression_list (email, reason, detail, source, created_by)
VALUES
    -- Fabricated domains (slugify-company-name garbage)
    ('compliance@circleinternetgroupi.com', 'unverified', 'fabricated by lead_scraper slugify — incident 2026-07-10', 'incident_seed', 'moses'),
    ('compliance@coinbaseglobalinccoi.com', 'unverified', 'fabricated by lead_scraper slugify — incident 2026-07-10', 'incident_seed', 'moses'),
    ('compliance@hsbcusaincmdcik00000.com', 'unverified', 'fabricated by lead_scraper slugify — incident 2026-07-10', 'incident_seed', 'moses'),
    ('compliance@A-O-K1.github.io', 'unverified', 'fabricated by lead_scraper slugify — incident 2026-07-10', 'incident_seed', 'moses'),
    -- Role inboxes (don't mail these even if they exist)
    ('compliance@binance.com', 'role_inbox', 'role inbox — even if real, never marketing-mail', 'incident_seed', 'moses'),
    ('compliance@coinbase.com', 'role_inbox', 'role inbox — even if real, never marketing-mail', 'incident_seed', 'moses'),
    ('compliance@kraken.com', 'role_inbox', 'role inbox — even if real, never marketing-mail', 'incident_seed', 'moses'),
    ('legal@uniswap.org', 'role_inbox', 'role inbox — even if real, never marketing-mail', 'incident_seed', 'moses'),
    ('newbusiness@sullcrom.com', 'role_inbox', 'Sullivan & Cromwell — role inbox, never marketing-mail', 'incident_seed', 'moses')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Add a consent_kind + double_optin_confirmed column to newsletter_subscribers
-- so the existing table can participate in the new flow.
-- ============================================================
ALTER TABLE public.newsletter_subscribers
    ADD COLUMN IF NOT EXISTS double_optin_confirmed boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS double_optin_at timestamptz,
    ADD COLUMN IF NOT EXISTS consent_log_id uuid REFERENCES public.email_consent_log(id);

CREATE INDEX IF NOT EXISTS idx_newsletter_active ON public.newsletter_subscribers (active, double_optin_confirmed);
