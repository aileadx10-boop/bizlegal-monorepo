-- seo_pages.index_status — plan v3 §S2: the GSC/IndexNow pinger writes coverage
-- state per URL so /ops and the weekly digest can report "indexed / discovered /
-- excluded" counts from a table instead of a log. Idempotent.
alter table public.seo_pages add column if not exists index_status text;
alter table public.seo_pages add column if not exists index_checked_at timestamptz;
alter table public.seo_pages add column if not exists indexnow_submitted_at timestamptz;
create index if not exists seo_pages_index_status_idx on public.seo_pages (index_status);
