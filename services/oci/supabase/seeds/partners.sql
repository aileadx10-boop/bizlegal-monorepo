-- OCI Deal Router — Phase B3 partner seed
-- Applied via Supabase MCP on project ydghhcuuopqzgqcicubg, 2026-04-26.
--
-- Decision (Moses-confirmed): 0 signed contracts at seed-time, single
-- broad-coverage placeholder routes to team@bizlegal-ai.com. Real
-- partners replace this row at B6 once contracts are signed.
--
-- Idempotent via on conflict do nothing on (email, type='placeholder').

insert into public.partners (
  name,
  email,
  type,
  jurisdictions,
  specialties,
  language_codes,
  active,
  weekly_cap,
  tier,
  commission_basis,
  notes
)
select
  'BizLegal-AI Team (placeholder)',
  'team@bizlegal-ai.com',
  'placeholder',
  array['UAE','SG','US','EU','IL','GB'],
  array['DIFC_SPV','Reg_D','MAS_FFR','RERA'],
  array['en','ar','he','zh'],
  true,
  100,                           -- high cap; never throttled in dev
  5,                             -- tier 5 = lowest priority, only if no real partner matches
  null,                          -- placeholder earns no commission
  'Dev placeholder. Replace with real signed partners before go-live (B6).'
where not exists (
  select 1 from public.partners
  where type = 'placeholder' and email = 'team@bizlegal-ai.com'
);
