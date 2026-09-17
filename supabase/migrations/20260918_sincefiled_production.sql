-- SinceFiled production tenancy + idempotent payment grants.
create table if not exists public.sf_firms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.sf_obligations (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references public.sf_firms(id) on delete cascade,
  obligation_type text not null,
  interval_days int not null check (interval_days > 0),
  jurisdiction text not null,
  last_event_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.sf_events (
  id uuid primary key default gen_random_uuid(),
  obligation_id uuid references public.sf_obligations(id) on delete cascade,
  event_at timestamptz not null default now(),
  token text unique,
  source text not null default 'email'
);
create table if not exists public.sf_subscriptions (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references public.sf_firms(id) on delete cascade,
  product_id text not null,
  status text not null,
  entitlement jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.sf_firms add column if not exists owner_email text;
drop index if exists public.sf_firms_owner_email_uniq;
create unique index if not exists sf_firms_owner_email_uniq
  on public.sf_firms(owner_email);

alter table public.sf_subscriptions add column if not exists order_id text;
alter table public.sf_subscriptions add column if not exists gateway text;
alter table public.sf_subscriptions add column if not exists gateway_subscription_id text;
alter table public.sf_subscriptions add column if not exists active_until timestamptz;
alter table public.sf_subscriptions add column if not exists updated_at timestamptz not null default now();
create unique index if not exists sf_subscriptions_order_id_uniq
  on public.sf_subscriptions(order_id) where order_id is not null;
create index if not exists sf_subscriptions_firm_status_idx
  on public.sf_subscriptions(firm_id, status);

create table if not exists public.sf_pack_grants (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.sf_firms(id) on delete cascade,
  product_id text not null,
  order_id text not null unique,
  status text not null default 'active',
  granted_at timestamptz not null default now()
);

alter table public.sf_pack_grants enable row level security;
alter table public.sf_firms enable row level security;
alter table public.sf_obligations enable row level security;
alter table public.sf_events enable row level security;
alter table public.sf_subscriptions enable row level security;
