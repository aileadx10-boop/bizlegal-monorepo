-- LeaseParse paid gate (revenue-machine plan v3 §B4, 2026-09-15).
--
-- Closes the OPEN GAP documented at the top of
-- apps/leaseparse/web/app/api/leases/ingest/route.ts: until now both
-- /api/leases/upload-url and /api/leases/ingest handed out the $59 deliverable
-- to any caller — no paid order was required, so opening
-- LEASEPARSE_CHECKOUT_LIVE would have let an anonymous caller burn Claude
-- spend and send report email on someone else's behalf.
--
-- What this adds:
--   1. leaseparse_credits  — one row per paid order (the entitlement the app
--      checks before it does any work). Written by apps/hub
--      lib/payments/leaseparse-grant.ts from both payment webhooks.
--   2. leaseparse_llm_spend + leaseparse_reserve_llm_spend() — the atomic
--      monthly cost counter behind the $80/mo Claude cap
--      (apps/leaseparse/web/lib/extract/llm-budget.ts). Reserve-before-call,
--      so the cap cannot be overshot by concurrent parses.
--   3. leaseparse_leases.paid_order_id + .parse_status — links a lease row to
--      the order that paid for it and records the 'pending_budget' hold.
--   4. The two storage buckets the app expects: lease-documents (private
--      uploads) and reports (public generated abstracts).
--
-- Idempotent: safe to re-run. Depends on 20260728_leaseparse_leases.sql.

begin;

-- ── 1. Paid-order credits ──────────────────────────────────────────────────
-- order_id is unique, so a replayed IPN upserts rather than granting twice.
-- Lifecycle: unclaimed (paid, nothing uploaded)
--         → claimed   (bound to a lease row, upload URL issued)
--         → consumed  (abstract delivered; never usable again).
create table if not exists public.leaseparse_credits (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  order_id     text not null unique,          -- hub payment_orders.id, as text
  product_id   text,                          -- 'leaseparse_abstract_59'
  amount_cents integer,
  status       text not null default 'unclaimed'
                 check (status in ('unclaimed', 'claimed', 'consumed')),
  lease_id     uuid references public.leaseparse_leases(id) on delete set null,
  created_at   timestamptz not null default now(),
  claimed_at   timestamptz
);

create index if not exists idx_leaseparse_credits_email
  on public.leaseparse_credits (lower(email), status, created_at);
create index if not exists idx_leaseparse_credits_lease
  on public.leaseparse_credits (lease_id);

alter table public.leaseparse_credits enable row level security;

-- Service-role only: every reader is a server route holding SUPABASE_SERVICE_KEY.
-- Deny-by-default for anon/authenticated (a credit is a bearer entitlement).
drop policy if exists "service_role leaseparse_credits" on public.leaseparse_credits;
create policy "service_role leaseparse_credits"
  on public.leaseparse_credits for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ── 2. Monthly LLM spend counter ($80/mo hard cap, enforced in code) ───────
create table if not exists public.leaseparse_llm_spend (
  month      text primary key,                -- 'YYYY-MM', UTC
  usd        numeric(12,4) not null default 0,
  call_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.leaseparse_llm_spend enable row level security;

drop policy if exists "service_role leaseparse_llm_spend" on public.leaseparse_llm_spend;
create policy "service_role leaseparse_llm_spend"
  on public.leaseparse_llm_spend for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Reserve-then-call. The row lock makes "read the total, decide, increment"
-- one atomic step, so two concurrent parses cannot both squeeze past the cap.
-- Returns {allowed, spent_usd, cap_usd, reason?}. The caller (llm-budget.ts)
-- treats an error or a missing 'allowed' as DENIED — the counter fails closed.
create or replace function public.leaseparse_reserve_llm_spend(
  p_month text,
  p_usd   numeric,
  p_cap   numeric
) returns jsonb
language plpgsql
as $$
declare
  v_spent numeric;
begin
  if p_usd is null or p_usd < 0 or p_cap is null or p_cap <= 0 then
    return jsonb_build_object(
      'allowed', false, 'spent_usd', 0, 'cap_usd', coalesce(p_cap, 0),
      'reason', 'invalid_args');
  end if;

  insert into public.leaseparse_llm_spend (month) values (p_month)
  on conflict (month) do nothing;

  select usd into v_spent
    from public.leaseparse_llm_spend
   where month = p_month
   for update;

  if v_spent + p_usd > p_cap then
    return jsonb_build_object(
      'allowed', false, 'spent_usd', v_spent, 'cap_usd', p_cap,
      'reason', 'monthly_cap_reached');
  end if;

  update public.leaseparse_llm_spend
     set usd        = usd + p_usd,
         call_count = call_count + 1,
         updated_at = now()
   where month = p_month
  returning usd into v_spent;

  return jsonb_build_object('allowed', true, 'spent_usd', v_spent, 'cap_usd', p_cap);
end;
$$;

-- ── 3. Link a lease row to the order that paid for it ─────────────────────
alter table public.leaseparse_leases add column if not exists paid_order_id text;
alter table public.leaseparse_leases add column if not exists parse_status   text;

-- 'pending'        — row created, upload URL issued
-- 'pending_budget' — held: the monthly Claude cap was reached, no model call made
-- 'parsed'         — abstract delivered
-- 'failed'         — unparseable PDF (no text layer) or engine failure
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.leaseparse_leases'::regclass
       and conname  = 'leaseparse_leases_parse_status_check'
  ) then
    alter table public.leaseparse_leases
      add constraint leaseparse_leases_parse_status_check
      check (parse_status is null
             or parse_status in ('pending', 'pending_budget', 'parsed', 'failed'));
  end if;
end$$;

create index if not exists idx_leaseparse_leases_order
  on public.leaseparse_leases (paid_order_id);

-- ── 4. Storage buckets the app expects ────────────────────────────────────
-- lease-documents: PRIVATE. Uploads land here via a 15-minute signed upload
--   URL; only the service-role route downloads them.
-- reports: public read — the generated HTML abstract is linked by email and
--   the URL is unguessable (uuid path). No bucket-level RLS policies are
--   added here; storage.objects access is service-role only by default.
insert into storage.buckets (id, name, public)
values ('lease-documents', 'lease-documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('reports', 'reports', true)
on conflict (id) do nothing;

commit;
