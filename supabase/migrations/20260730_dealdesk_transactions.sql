-- DealDesk — CloseFlow: transactions + checklist
-- Supersedes the unapplied scaffold migration 20260728_closeflow_transactions.sql.
-- Renaming was free: verified 2026-07-30 against project ydghhcuuopqzgqcicubg
-- that NONE of the 20260728 trio tables exist, so nothing is being migrated.
--
-- NOT APPLIED YET. Apply order: dd_properties FIRST, then the rest.
--
-- `user_id` is intentionally NULLABLE with an `email` fallback: anonymous
-- checkout captures an email before an account exists, and a later login
-- backfills user_id. Do not add NOT NULL.

begin;

create table if not exists public.dd_transactions (
  id                 uuid primary key default gen_random_uuid(),
  property_id        uuid references public.dd_properties(id) on delete cascade,
  user_id            uuid references auth.users(id) on delete cascade,
  email              text,
  transaction_type   text not null check (transaction_type in
                       ('residential_purchase','residential_refi','commercial','exchange_1031')),
  closing_date       date not null,
  status             text not null default 'active' check (status in
                       ('active','closed','cancelled','archived')),
  checklist          jsonb not null default '[]'::jsonb,  -- [{key,label,phase,due_date,assignee,completed_at}]
  documents_required jsonb not null default '[]'::jsonb,
  documents_uploaded jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now(),
  closed_at          timestamptz
);

create index if not exists idx_dd_transactions_user
  on public.dd_transactions (user_id, created_at desc);
create index if not exists idx_dd_transactions_property
  on public.dd_transactions (property_id);
-- daily 07:00 UTC reminder cron scans active transactions by closing_date
create index if not exists idx_dd_transactions_active
  on public.dd_transactions (closing_date)
  where status = 'active';

alter table public.dd_transactions enable row level security;

drop policy if exists "service_role dd_transactions" on public.dd_transactions;
create policy "service_role dd_transactions"
  on public.dd_transactions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "own rows dd_transactions" on public.dd_transactions;
create policy "own rows dd_transactions"
  on public.dd_transactions for select
  using (auth.uid() = user_id);

commit;
