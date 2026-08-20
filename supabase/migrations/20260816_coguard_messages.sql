begin;

-- Append-only communication log. bigserial PK enforces immutability.
-- Never add an UPDATE policy on this table.
create table if not exists public.coguard_messages (
  id               bigserial   primary key,
  subscriber_id    uuid        not null
                                 references public.coguard_subscribers(id) on delete cascade,
  channel          text        not null check (channel in ('incoming', 'outgoing')),
  sender_id        text,                     -- incoming: ex-partner email; outgoing: null
  subject          text,
  raw_body         text        not null,
  body_sha256      text        not null,     -- SHA-256 hex of raw_body at log time
  neutralized_body text,                    -- BIFF version (outgoing only)
  hostility_score  real        check (hostility_score is null
                                  or (hostility_score >= 0 and hostility_score <= 1)),
  logistics_score  real        check (logistics_score is null
                                  or (logistics_score >= 0 and logistics_score <= 1)),
  urgency_score    real        check (urgency_score is null
                                  or (urgency_score >= 0 and urgency_score <= 1)),
  flags            jsonb       not null default '[]'::jsonb,
  metadata         jsonb       not null default '{}'::jsonb,
  received_at      timestamptz not null,    -- email Date: header (incoming) or send time (outgoing)
  processed_at     timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists idx_coguard_messages_sub_date
  on public.coguard_messages (subscriber_id, received_at desc);

create index if not exists idx_coguard_messages_unprocessed
  on public.coguard_messages (subscriber_id)
  where processed_at is null;

create index if not exists idx_coguard_messages_flagged
  on public.coguard_messages (subscriber_id, hostility_score desc)
  where hostility_score > 0.7;

-- RLS: service_role INSERT only (intentionally no UPDATE — append-only).
-- Authenticated subscribers can SELECT their own messages via coguard_subscribers FK.
alter table public.coguard_messages enable row level security;

create policy "service_role insert on coguard_messages"
  on public.coguard_messages
  for insert
  to service_role
  with check (true);

create policy "service_role select on coguard_messages"
  on public.coguard_messages
  for select
  to service_role
  using (true);

create policy "subscribers can read their own messages"
  on public.coguard_messages
  for select
  to authenticated
  using (
    subscriber_id in (
      select id from public.coguard_subscribers where user_id = auth.uid()
    )
  );

commit;
