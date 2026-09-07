-- DEAL44 — a task must carry WHERE its deadline comes from, and a computed
-- date must carry HOW it was reached.  APPLIED 2026-09-08 (this file is the record).
--
-- Practitioner guidance: there is no uniform Israeli rule that every step in a
-- real-estate transaction counts in business days. The counting rule follows
-- the source, so the source is stored beside the date rather than inferred.
-- And a system that keeps only the result presents a derived date as though it
-- were a legal fact.
alter table public.deal_tasks
  add column if not exists source text not null default 'operational'
    check (source in ('statutory','contractual','operational','third_party','judgment')),
  add column if not exists provenance jsonb,
  add column if not exists no_date_reason text,
  add column if not exists legal_review boolean not null default false;

comment on column public.deal_tasks.source is
  'Where the obligation comes from. Determines how the period may be counted: a statutory day is not automatically a business day, and a contractual period follows the agreement wording.';
comment on column public.deal_tasks.provenance is
  'Trigger -> Rule -> Duration -> Calendar -> Result -> Source for a computed date. Null when the date came from a person or the agreement.';
