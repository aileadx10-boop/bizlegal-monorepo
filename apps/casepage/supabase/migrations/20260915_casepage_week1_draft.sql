-- CasePage week-1 waitlist draft migration — show before applying.
create table if not exists public.casepage_waitlist (
  id bigserial primary key,
  email text not null,
  firm_size text,
  current_tool text,
  why_now text,
  created_at timestamptz not null default now()
);
alter table public.casepage_waitlist enable row level security;
