-- Phase RR-2 (2026-05-24) — funnel-mvp Next.js migration (Fastify+Firebase → Next.js+Supabase)
-- One row per uploaded contract going through the AI legal-risk funnel.
-- Replaces Firestore `funnel-jobs` collection from services/funnel-mvp/
-- Applied via Supabase MCP same day.

begin;

create table if not exists public.funnel_jobs (
  id                uuid        primary key default gen_random_uuid(),
  user_email        text        not null,
  status            text        not null default 'uploaded'
                                check (status in (
                                  'uploaded','extracting','preview_ready',
                                  'payment_pending','paid','full_report_ready','failed'
                                )),
  doc_storage_key   text        not null,        -- supabase storage path
  doc_filename      text,
  doc_mime          text,
  doc_size_bytes    integer,
  extracted_json    jsonb,                       -- full extraction shape (see lib/ai/schema.ts)
  preview_text      text,                        -- 2-3 issue preview shown free
  full_report_key   text,                        -- supabase storage path to generated PDF
  paypal_order_id   text,
  amount_cents      integer     not null default 9700,
  currency          text        not null default 'USD',
  affiliate_code    text,                        -- first-touch attribution (mirrors hub pattern)
  error_message     text,
  metadata          jsonb       not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  paid_at           timestamptz,
  completed_at      timestamptz
);

create index if not exists idx_funnel_jobs_email_created
  on public.funnel_jobs (user_email, created_at desc);
create index if not exists idx_funnel_jobs_status
  on public.funnel_jobs (status)
  where status in ('uploaded','extracting','payment_pending');
create index if not exists idx_funnel_jobs_paypal_order
  on public.funnel_jobs (paypal_order_id)
  where paypal_order_id is not null;
create index if not exists idx_funnel_jobs_affiliate
  on public.funnel_jobs (affiliate_code)
  where affiliate_code is not null;

alter table public.funnel_jobs enable row level security;

drop policy if exists "service_role read funnel_jobs"  on public.funnel_jobs;
drop policy if exists "service_role write funnel_jobs" on public.funnel_jobs;
create policy "service_role read funnel_jobs"
  on public.funnel_jobs for select
  using (auth.role() = 'service_role');
create policy "service_role write funnel_jobs"
  on public.funnel_jobs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Public read of a specific job by id (the report page uses the unguessable UUID as the gating credential)
drop policy if exists "anon read by id funnel_jobs" on public.funnel_jobs;
create policy "anon read by id funnel_jobs"
  on public.funnel_jobs for select
  using (true);

-- updated_at trigger
create or replace function public.funnel_jobs_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists funnel_jobs_touch_updated_at on public.funnel_jobs;
create trigger funnel_jobs_touch_updated_at
  before update on public.funnel_jobs
  for each row execute function public.funnel_jobs_touch_updated_at();

commit;
