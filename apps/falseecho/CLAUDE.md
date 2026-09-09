# falseecho — CLAUDE.md

**Purpose:** financial false-claims monitor. Scans for deceptive/false financial claims about companies, grades severity (MVP cron), sells monitor-tier re-scans with diff alerts. Built 2026-09-01→07; migration applied; **no Vercel project yet — not deployed, not public** (see `decisions/NIGHT-AUDIT-2026-09-08.md` §1).

**Stack:** Next.js (App Router) on Vercel when deployed. `vercel.json` cron: `/api/cron/monitor` daily 06:00 UTC (monitor-tier re-scan, flag diff, alert emails).

**Envs:** `ANTHROPIC_GRADING_MODEL`, `PERPLEXITY_MODEL`, `FALSEECHO_FULFILL_URL` (hub grant callback after payment), `MARKETING_TRIGGER_URL` (marketing enqueue). Names live in the canonical vault; values via Vercel env when the project exists.

**Deploy:** create Vercel project (Root Directory `apps/falseecho`), DNS, then push to `main` — but only under Phase Z discipline (no real money until Z7 matrix green).
