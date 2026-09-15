-- seo_pages — page factory columns (plan v3 §P, services/seo-agents/page_factory.py).
--
-- Purely additive and idempotent. The 231 legacy rows (blog.bizlegal-ai.com,
-- served by the Cloudflare Pages engine) keep hub = NULL and are untouched;
-- the hub route and the hub sitemap only ever look at rows whose `hub` is one
-- of the factory sections, so the two sets never collide.
--
-- status lifecycle, enforced by the factory, not by a trigger:
--   draft            row exists, no text yet            (--write)
--   review           text generated AND quality gate passed   (--generate)
--   rejected_quality gate blocked it; gate_findings says why   (--generate)
--   published        Moses promoted it. ONLY then does the hub render it.

alter table public.seo_pages add column if not exists hub text;
alter table public.seo_pages add column if not exists status text;
alter table public.seo_pages add column if not exists matrix_family text;
alter table public.seo_pages add column if not exists matrix_keys jsonb;
alter table public.seo_pages add column if not exists citations jsonb;
alter table public.seo_pages add column if not exists internal_links jsonb;
alter table public.seo_pages add column if not exists key_dates jsonb;
alter table public.seo_pages add column if not exists gate_findings jsonb;
alter table public.seo_pages add column if not exists llm_provider text;

create index if not exists seo_pages_hub_status_idx on public.seo_pages (hub, status);
create index if not exists seo_pages_matrix_family_idx on public.seo_pages (matrix_family);

comment on column public.seo_pages.hub is
  'Factory section: compliance | solutions | glossary | playbooks. NULL = legacy blog row served at blog.bizlegal-ai.com.';
comment on column public.seo_pages.status is
  'draft | review | rejected_quality | published. Only ''published'' renders on the hub and enters the hub sitemap.';
comment on column public.seo_pages.gate_findings is
  'page_quality_gate.py findings from the last generation run (BLOCK + WARN strings).';
