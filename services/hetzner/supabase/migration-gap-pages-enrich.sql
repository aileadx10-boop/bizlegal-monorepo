-- 2026-05-09 — Phase BB W3.2 — gap_pages enrichment columns
--
-- brain.py already produces these fields in its draft JSON (see brain.py
-- lines 77, 80, 81, 232-236, 434), but the runtime gap_pages table only
-- has the original 5/2026 schema (apps/forge/infra/gap_pages_table.sql),
-- so all enrichment data is silently dropped on insert.
--
-- The forge gap-page renderer (apps/forge/apps/web/app/gap/[jurisdiction]
-- /[slug]/page.tsx:230-244) ALREADY conditionally emits FAQPage JSON-LD
-- when `gap.faqs` is present. After this migration + a publisher.py
-- update + a brain.py prompt update, FAQPage schema starts firing for
-- new articles → search-result rich snippet eligibility.
--
-- Apply on BOTH Supabase databases (canonical + product-runtime mirror)
-- per the convention from gap_pages_table.sql.
--
-- Idempotent: safe to re-run, all columns gated by IF NOT EXISTS.

begin;

-- Categorisation produced by brain.py.
alter table public.gap_pages
  add column if not exists category text;
-- One of: regulation | enforcement | guidance | jurisdiction-arbitrage
-- (per brain.py:77 prompt instruction).

-- SEO keyword fields produced by brain.py:80-81 but currently dropped.
alter table public.gap_pages
  add column if not exists primary_keyword text;
alter table public.gap_pages
  add column if not exists secondary_keywords text[] default '{}';

-- Tags from brain.py (5-8 strings per the prompt).
alter table public.gap_pages
  add column if not exists tags text[] default '{}';

-- Structured FAQs — array of {q: string, a: string}. Renderer at
-- apps/forge/apps/web/app/gap/[jurisdiction]/[slug]/page.tsx:230-244
-- consumes this column to emit FAQPage JSON-LD.
alter table public.gap_pages
  add column if not exists faqs jsonb default '[]'::jsonb;

-- E-E-A-T fields surfaced by the renderer (page.tsx already reads these
-- conditionally from gap; missing column = empty render). Author/
-- reviewer separation matches the renderer's ATTRIBUTION block.
alter table public.gap_pages
  add column if not exists author_name text;
alter table public.gap_pages
  add column if not exists author_role text;
alter table public.gap_pages
  add column if not exists author_bio text;
alter table public.gap_pages
  add column if not exists reviewer_name text;
alter table public.gap_pages
  add column if not exists reviewer_role text;
alter table public.gap_pages
  add column if not exists reviewed_at timestamptz;

-- Last-modified timestamp for sitemap.xml `lastmod` + Article schema
-- `dateModified`. Without this, every page reports its publish date as
-- its modification date which suppresses re-crawl.
alter table public.gap_pages
  add column if not exists updated_at timestamptz default now();

-- 2026-05-09: cta_product check constraint was created with 5 products
-- (tracr/brai/lexaudit/docai/forge) but leadforge launched after.
-- Drop + recreate the check to include leadforge so brain.py can route
-- non-compliance gap-pages (sales-funnel content) to leadforge.
alter table public.gap_pages
  drop constraint if exists gap_pages_cta_product_check;
alter table public.gap_pages
  add constraint gap_pages_cta_product_check
    check (cta_product in ('tracr','brai','lexaudit','docai','forge','leadforge'));

-- Indexes to support the W3.4 GSC indexing monitor + dashboard queries.
create index if not exists idx_gap_pages_category
  on public.gap_pages (category)
  where category is not null;

create index if not exists idx_gap_pages_updated_at
  on public.gap_pages (updated_at desc nulls last);

create index if not exists idx_gap_pages_tags
  on public.gap_pages using gin (tags)
  where tags is not null and array_length(tags, 1) > 0;

-- Auto-bump updated_at on row update so sitemap lastmod stays accurate
-- without publisher.py needing to set it explicitly on every commit.
create or replace function public.touch_gap_pages_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_gap_pages_updated_at on public.gap_pages;
create trigger trg_gap_pages_updated_at
  before update on public.gap_pages
  for each row execute function public.touch_gap_pages_updated_at();

commit;
