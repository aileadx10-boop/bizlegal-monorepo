-- FalseEcho MVP — scans, hash-anchored evidence, orders, monitors, leads.
-- Spec: docs/falseecho-mvp-spec.md §4/§5.
--
-- falseecho_evidence.sha256 is the tamper-evidence anchor: SHA-256 over the
-- canonical JSON of (scan_id, engine, seq, prompt, response, scanned_at).
-- Recomputing the hash from the row must reproduce it (spec §3 criterion 2).
--
-- Access pattern: service-role only from apps/falseecho API routes, so RLS
-- is enabled with no policies (deny-by-default for anon/auth roles).

begin;

-- ── One row per scan ────────────────────────────────────────────────────────
create table if not exists public.falseecho_scans (
  id                 uuid primary key default gen_random_uuid(),
  scan_ref           text not null unique,          -- FE-2026-XXXXX, bearer id for /report/[scan_ref]
  entity             text not null,                 -- name / firm being scanned
  entity_url         text,
  content_sha256     text,                          -- hash of pasted claim content, when supplied
  submission_sha256  text,                          -- hash of (entity, url, content, scan_ref, created_at)
  scan_sha256        text,                          -- hash over ordered evidence hashes, set on delivery
  email              text,
  tier               text not null default 'free'
                       check (tier in ('free', 'audit', 'monitor')),
  status             text not null default 'pending'
                       check (status in ('pending', 'running', 'free_complete', 'delivered', 'failed')),
  score              int,                           -- 0-100 exposure score
  flags_count        int,
  engines            jsonb,                         -- [{id, name, configured}] engine coverage matrix
  created_at         timestamptz not null default now(),
  completed_at       timestamptz,
  paid_at            timestamptz                    -- the paid gate; /api/report refuses evidence without it
);

create index if not exists idx_falseecho_scans_email on public.falseecho_scans (lower(email), created_at desc);

-- ── Hash-anchored evidence (spec: id, scan_id, entity, engine, prompt,
--    response, sha256 hash, scanned_at) ─────────────────────────────────────
create table if not exists public.falseecho_evidence (
  id           uuid primary key default gen_random_uuid(),
  scan_id      uuid not null references public.falseecho_scans(id) on delete cascade,
  entity       text not null,
  engine       text not null,                       -- chatgpt | claude | perplexity | google_aio
  prompt       text not null,
  response     text,                                -- null when status <> 'ok'
  status       text not null default 'ok'
                 check (status in ('ok', 'unavailable', 'error')),
  sha256       text not null,
  seq          int not null,                        -- scan sequence, part of the hash input
  flagged      boolean not null default false,      -- heuristic triage flag
  flag_terms   text[],
  confidence   text,                                -- Claude grading: low | medium | high
  narrative    text,                                -- factual note, never a legal conclusion
  scanned_at   timestamptz not null default now(),
  unique (scan_id, seq)
);

create index if not exists idx_falseecho_evidence_scan on public.falseecho_evidence (scan_id, seq);
-- Query-by-hash returns the identical record (spec §3 criterion 2) and
-- addresses the programmatic SEO route /seo/[engine]/[entity]/[hash].
create unique index if not exists idx_falseecho_evidence_hash on public.falseecho_evidence (sha256);

-- ── Orders (in-app PayPal + NOWPayments + hub apex credits) ─────────────────
create table if not exists public.falseecho_orders (
  id                 uuid primary key default gen_random_uuid(),
  report_id          text not null unique,          -- FE-… (in-app) or hub payment_orders id (apex)
  scan_id            uuid references public.falseecho_scans(id) on delete set null,
  email              text,
  tier               text not null check (tier in ('audit', 'monitor')),
  amount             numeric(10,2) not null,        -- USD, server-resolved from lib/tiers.ts
  interval           text not null default 'one-time' check (interval in ('one-time', 'monthly')),
  status             text not null default 'pending'
                       check (status in ('pending', 'paid', 'failed', 'refunded')),
  payment_method     text,                          -- paypal | crypto
  payment_provider   text,                          -- paypal | nowpayments | hub_apex
  paypal_order_id    text,
  paypal_capture_id  text,
  gateway_invoice_id text,
  paid_at            timestamptz,
  created_at         timestamptz not null default now()
);

create index if not exists idx_falseecho_orders_email on public.falseecho_orders (lower(email), created_at desc);

-- ── Monitor tier registry (daily re-scan cron is a post-MVP stub) ───────────
create table if not exists public.falseecho_monitors (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  entity       text not null,
  scan_id      uuid references public.falseecho_scans(id) on delete set null,
  status       text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  next_scan_at timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists idx_falseecho_monitors_due on public.falseecho_monitors (status, next_scan_at);

-- ── Landing-page lead capture ───────────────────────────────────────────────
create table if not exists public.falseecho_leads (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  name       text,
  scenario   text,
  source     text,
  created_at timestamptz not null default now()
);

create index if not exists idx_falseecho_leads_email on public.falseecho_leads (lower(email), created_at desc);

-- ── RLS: service-role only (deny-by-default for everyone else) ──────────────
alter table public.falseecho_scans    enable row level security;
alter table public.falseecho_evidence enable row level security;
alter table public.falseecho_orders   enable row level security;
alter table public.falseecho_monitors enable row level security;
alter table public.falseecho_leads    enable row level security;

commit;
