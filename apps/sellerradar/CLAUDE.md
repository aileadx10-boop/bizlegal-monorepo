# sellerradar — CLAUDE.md

**Purpose:** seller-risk monitor (marketplace/vendor risk). MVP cron scans seller fee schedules/claim patterns; monitor tier = weekly re-scan with impact diff + alert emails. Built 2026-09-01→07; **no Vercel project yet — not deployed** (see `decisions/NIGHT-AUDIT-2026-09-08.md` §1).

**Stack:** Next.js (App Router) on Vercel when deployed. `vercel.json` cron: `/api/cron/monitor` Mon 06:00 UTC.

**Envs:** `SELLERRADAR_FULFILL_URL` (hub grant callback), `MARKETING_TRIGGER_URL` (marketing enqueue). Vault names; values via Vercel env when deployed.

**Deploy:** same path as falseecho — Vercel project (Root Directory `apps/sellerradar`) + DNS + push to `main`, under Phase Z discipline.
