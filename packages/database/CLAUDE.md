# database — CLAUDE.md

**Purpose:** raw SQL migrations for non-Supabase databases in the fleet.
Today that means exactly one consumer: `neon/migrations/` holds the Neon
Postgres DDL for BrainX (`apps/brainx`) — deliberately not Supabase, see
`decisions/BRAINX-INTELLIGENCE-OS-PLAN.md`.

**Contents:**
- `neon/migrations/001_brainx_schema.sql` — the 16-table opportunity/evidence
  schema (markets, signals, opportunities, evidence_links, products, …) plus
  the `evidence_gate()` trigger.
- `neon/migrations/002_brainx_subscribers.sql` — subscriber/entitlement
  schema added in the 2026-09-16 productization pass (subscribers,
  subscription_events, radar_profiles, access_link_requests, plus columns on
  `products`/`opportunities`/`signals`).

**Apply with `psql`, not the Python runner.** Migrations are plain SQL (no
plpgsql in 002) applied directly against `NEON_DATABASE_URL`:

```bash
psql "$NEON_DATABASE_URL" -f packages/database/neon/migrations/<file>.sql
```

`services/highintelligence-api/scripts/apply_migration.py` naively splits on
`;` and cannot apply a `$$`-delimited function body (001's `evidence_gate()`
trigger) — do not use it; see that service's own CLAUDE.md (PARKED).

Every migration file in this package should be idempotent
(`create table if not exists`, `add column if not exists`) so a re-run is
harmless.

**Envs:** `NEON_DATABASE_URL` (or `DATABASE_URL`) — names only, value in the
canonical vault. No deploy target; this package ships no runtime code.
