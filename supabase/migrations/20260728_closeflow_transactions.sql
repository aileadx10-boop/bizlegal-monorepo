-- CloseFlow: real-estate closing transactions + checklist + document tracking.
-- NOT APPLIED YET — scaffold 2026-07-28. Depends on 20260728_trio_properties.sql.
-- See apps/closeflow/docs/PLAN.md.

begin;

create table if not exists public.closeflow_transactions (
  id                 uuid primary key default gen_random_uuid(),
  property_id        uuid references public.trio_properties(id) on delete cascade,
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

create index if not exists idx_closeflow_transactions_user
  on public.closeflow_transactions (user_id, created_at desc);
create index if not exists idx_closeflow_transactions_property
  on public.closeflow_transactions (property_id);
-- daily 07:00 UTC reminder cron scans active transactions by closing_date
create index if not exists idx_closeflow_transactions_active
  on public.closeflow_transactions (closing_date)
  where status = 'active';

alter table public.closeflow_transactions enable row level security;

drop policy if exists "service_role closeflow_transactions" on public.closeflow_transactions;
create policy "service_role closeflow_transactions"
  on public.closeflow_transactions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "own rows closeflow_transactions" on public.closeflow_transactions;
create policy "own rows closeflow_transactions"
  on public.closeflow_transactions for select
  using (auth.uid() = user_id);

commit;
