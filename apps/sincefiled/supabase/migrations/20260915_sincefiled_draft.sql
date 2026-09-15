-- SinceFiled draft migration — show before applying.
create table if not exists public.sf_firms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.sf_obligations (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references public.sf_firms(id),
  obligation_type text not null,
  interval_days int not null,
  jurisdiction text not null,
  last_event_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.sf_events (
  id uuid primary key default gen_random_uuid(),
  obligation_id uuid references public.sf_obligations(id),
  event_at timestamptz not null default now(),
  token text unique,
  source text not null default 'email'
);
create table if not exists public.sf_subscriptions (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references public.sf_firms(id),
  product_id text not null,
  status text not null,
  entitlement jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.sf_firms enable row level security;
alter table public.sf_obligations enable row level security;
alter table public.sf_events enable row level security;
alter table public.sf_subscriptions enable row level security;
