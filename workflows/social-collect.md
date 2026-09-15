# Workflow: Social Collect

## Purpose
Turn idle `social_drafts` rows and blog archive posts into normalized queue items for the fleet social autopilot digest. Deterministic, zero LLM.

## Environment
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (required for live mode)
- `SUPABASE_SERVICE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` — service role key (required for live mode, never log)
- `SOCIAL_AUTOPILOT_*` — task-specific config (optional)

If live Supabase env is absent, run with `--fixture <path>` (local JSON fixture) — tests and local proofs use fixtures.

## Inputs
1. `social_drafts` rows where `status IN ('pending_approval','approved')`.
2. Blog post index: either a sitemap URL (e.g. `https://blog.bizlegal-ai.com/sitemap.xml`) or a local `blog_index.jsonl` fixture.

## Outputs
- `out/queue_items.jsonl` — normalized queue items.

## Steps
1. Read env; if missing live env and no fixture, error with clear message.
2. Load drafts (or fixture).
3. Load blog index (or fixture).
4. Normalize to queue item shape:
   `{ source_url, source_title, channel, body, tags, platforms, aeo_snippet, scheduled_date, scheduled_at, status }`
5. Write queue to `out/queue_items.jsonl`.

## Rule
Never mutate `social_drafts` in v1 — the collector only reads. No auto-posting.
