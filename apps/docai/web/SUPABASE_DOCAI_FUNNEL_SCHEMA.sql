-- DocAI funnel schema guardrails
-- Apply in Supabase SQL editor before production traffic if these tables/columns do not already exist.
-- Safe posture: additive CREATE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS only.

create table if not exists public.contract_scans (
  id uuid primary key,
  email text,
  filename text not null,
  contract_type text,
  score integer,
  red_flags integer default 0,
  total_risks integer default 0,
  ai_content jsonb,
  paid boolean default false,
  payment_provider text,
  nowpayments_order_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.contract_scans add column if not exists email text;
alter table public.contract_scans add column if not exists filename text;
alter table public.contract_scans add column if not exists contract_type text;
alter table public.contract_scans add column if not exists score integer;
alter table public.contract_scans add column if not exists red_flags integer default 0;
alter table public.contract_scans add column if not exists total_risks integer default 0;
alter table public.contract_scans add column if not exists ai_content jsonb;
alter table public.contract_scans add column if not exists paid boolean default false;
alter table public.contract_scans add column if not exists payment_provider text;
alter table public.contract_scans add column if not exists nowpayments_order_id text;
alter table public.contract_scans add column if not exists created_at timestamptz default now();
alter table public.contract_scans add column if not exists updated_at timestamptz default now();

create index if not exists idx_contract_scans_email on public.contract_scans(email);
create index if not exists idx_contract_scans_paid on public.contract_scans(paid);
create index if not exists idx_contract_scans_nowpayments_order_id on public.contract_scans(nowpayments_order_id);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  page text,
  product text,
  created_at timestamptz default now()
);

create index if not exists idx_leads_email on public.leads(email);
create index if not exists idx_leads_source on public.leads(source);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  user_name text,
  product text not null,
  tier text not null,
  billing_interval text not null,
  amount_cents integer not null,
  gateway text not null,
  status text not null default 'pending',
  source text,
  gateway_invoice_id text,
  gateway_subscription_id text,
  metadata jsonb default '{}'::jsonb,
  activated_at timestamptz,
  last_charge_at timestamptz,
  cancelled_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.payment_orders add column if not exists user_email text;
alter table public.payment_orders add column if not exists user_name text;
alter table public.payment_orders add column if not exists product text;
alter table public.payment_orders add column if not exists tier text;
alter table public.payment_orders add column if not exists billing_interval text;
alter table public.payment_orders add column if not exists amount_cents integer;
alter table public.payment_orders add column if not exists gateway text;
alter table public.payment_orders add column if not exists status text default 'pending';
alter table public.payment_orders add column if not exists source text;
alter table public.payment_orders add column if not exists gateway_invoice_id text;
alter table public.payment_orders add column if not exists gateway_subscription_id text;
alter table public.payment_orders add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.payment_orders add column if not exists activated_at timestamptz;
alter table public.payment_orders add column if not exists last_charge_at timestamptz;
alter table public.payment_orders add column if not exists cancelled_at timestamptz;
alter table public.payment_orders add column if not exists refunded_at timestamptz;
alter table public.payment_orders add column if not exists created_at timestamptz default now();
alter table public.payment_orders add column if not exists updated_at timestamptz default now();

create index if not exists idx_payment_orders_user_email on public.payment_orders(user_email);
create index if not exists idx_payment_orders_status on public.payment_orders(status);
create index if not exists idx_payment_orders_gateway_invoice_id on public.payment_orders(gateway_invoice_id);
create index if not exists idx_payment_orders_gateway_subscription_id on public.payment_orders(gateway_subscription_id);
