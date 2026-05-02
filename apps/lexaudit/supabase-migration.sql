-- ============================================================
-- LexAudit — Supabase SQL Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. FIRMS
create table if not exists firms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  plan text default 'beta',
  created_at timestamptz default now()
);

-- 2. USERS PROFILE (extends Supabase auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  firm_id uuid references firms(id),
  full_name text,
  role text default 'associate', -- 'partner' | 'associate' | 'admin'
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. MATTERS
create table if not exists matters (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references firms(id),
  created_by uuid references auth.users(id) on delete cascade,
  title text not null,
  client_ref text,
  ai_tool text,
  status text default 'active', -- 'active' | 'certified' | 'archived'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. AI LOGS
create table if not exists ai_logs (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid references matters(id) on delete cascade,
  user_id uuid references auth.users(id),
  ai_tool text,
  lawyer text,
  partner text,
  prompt_summary text,
  human_edits text,
  logged_at timestamptz default now()
);

-- 5. CERTIFICATES
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid references matters(id) on delete cascade,
  cert_id text unique not null, -- e.g. LA-A3F9B2
  summary text,
  lawyer text,
  partner text,
  sha256_hash text,
  generated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table firms enable row level security;
alter table profiles enable row level security;
alter table matters enable row level security;
alter table ai_logs enable row level security;
alter table certificates enable row level security;

-- PROFILES: users see only their own profile
create policy "Own profile" on profiles
  for all using (auth.uid() = id);

-- MATTERS: users see only their own matters
create policy "Own matters" on matters
  for all using (auth.uid() = created_by);

-- AI_LOGS: users see logs for their matters
create policy "Own logs" on ai_logs
  for all using (
    exists (
      select 1 from matters
      where matters.id = ai_logs.matter_id
      and matters.created_by = auth.uid()
    )
  );

-- CERTIFICATES: users see certs for their matters
create policy "Own certificates" on certificates
  for all using (
    exists (
      select 1 from matters
      where matters.id = certificates.matter_id
      and matters.created_by = auth.uid()
    )
  );

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists matters_created_by_idx on matters(created_by);
create index if not exists ai_logs_matter_id_idx on ai_logs(matter_id);
create index if not exists certificates_matter_id_idx on certificates(matter_id);
create index if not exists certificates_cert_id_idx on certificates(cert_id);
