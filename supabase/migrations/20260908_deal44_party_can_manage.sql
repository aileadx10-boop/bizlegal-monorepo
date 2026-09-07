-- DEAL44 — who runs the room is an APP concept, not a template one.
--
-- APPLIED 2026-09-08 (via MCP; this file is the record).
--
-- `canManageRoom` tested for the literal role string 'broker'. That broke the
-- first time a template used different vocabulary: the US set calls that person
-- 'agent', so the person who opened and paid for the room got a 403 on their
-- own room.
--
-- Roles are template-defined and open-ended by design — WORKFLOW44 lets a
-- template declare its own — so management cannot be inferred from the name.
alter table public.deal_parties
  add column if not exists can_manage boolean not null default false;

-- Anyone already holding the historical broker role keeps the rights they had.
update public.deal_parties set can_manage = true where role = 'broker' and can_manage = false;

comment on column public.deal_parties.can_manage is
  'May add parties and tasks, move the anchor dates, and tick any task. Set on the party who opens the room, regardless of what the template calls that role.';
