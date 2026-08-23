-- 2026-08-13: Agent audit trail — hash chain on agent_runs (O-013 / W4-11)
-- Tamper-evident action log: every row carries a payload_hash (SHA-256 of its
-- own content) and a prev_hash (the payload_hash of the previous row by
-- created_at). Verification recomputes each hash and checks the links.
--
-- Backfill requirement: existing rows get chain_status='chain_gap' via the
-- column default — they predate the chain and are honestly marked as gaps,
-- not silently treated as chained.

alter table public.agent_runs add column if not exists payload_hash text;
alter table public.agent_runs add column if not exists prev_hash text;
alter table public.agent_runs add column if not exists chain_status text not null default 'chain_gap';

create index if not exists agent_runs_created_at_idx on public.agent_runs (created_at desc);
create index if not exists agent_runs_chain_status_idx on public.agent_runs (chain_status) where chain_status is not null;
