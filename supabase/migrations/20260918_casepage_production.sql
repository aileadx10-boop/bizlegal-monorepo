-- CasePage production tenancy + payment entitlement schema.
create table if not exists public.cp_accounts (
  email text primary key check (email = lower(email)),
  firm_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cp_pages (
  id text primary key,
  owner_email text not null references public.cp_accounts(email) on delete cascade,
  title text not null,
  template text not null,
  jurisdiction text not null,
  milestones jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'live', 'archived')),
  public_token_hash text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cp_pages_owner_email_idx on public.cp_pages(owner_email);

create table if not exists public.cp_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null references public.cp_accounts(email) on delete cascade,
  product_id text not null,
  order_id text not null unique,
  gateway text,
  gateway_subscription_id text,
  status text not null default 'active',
  entitlement jsonb not null default '{}'::jsonb,
  active_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cp_subscriptions_owner_email_idx
  on public.cp_subscriptions(owner_email, status);

alter table public.cp_accounts enable row level security;
alter table public.cp_pages enable row level security;
alter table public.cp_subscriptions enable row level security;
