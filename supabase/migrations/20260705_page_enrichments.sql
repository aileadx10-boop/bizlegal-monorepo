-- page_enrichments table: stores AI-generated metadata for every public page.
-- One row per (app, path) — overwritten on each enricher run.
create table if not exists page_enrichments (
  id bigserial primary key,
  app text not null,
  path text not null,
  enrichment jsonb not null,
  enriched_at timestamptz not null default now(),
  unique (app, path)
);
create index if not exists idx_page_enrichments_app on page_enrichments (app);
