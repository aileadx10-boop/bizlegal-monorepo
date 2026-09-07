# apps/deal44 — deal44.bizlegal-ai.com

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md). This file covers only what is specific to DEAL44.

A shared checklist for one property transaction. The broker opens a room, every party gets their own private link, and each deadline reaches the person responsible before it passes. **Hebrew and RTL first** — Israel is market #1 — with an English twin for everywhere else.

## Status — NOT DEPLOYED (2026-09-07)

No Vercel project, no domain, migration unapplied, checkout dark. Phase 0 money is taken by **manual invoice** under Moses's own name and recorded as a `gateway='manual'` `payment_orders` row (the O-018 precedent), because root hard rule 5 blocks the hub checkout and no gateway is confirmed to settle ILS.

## Key routes

- `/` Hebrew landing · `/en` English twin · `/start` async intake (no call, ever)
- `/r/[token]` — a party's room. The **product**.
- `/admin` — Phase-0 room builder, `INTERNAL_API_SECRET` gated. Deleted in Phase 1.
- `POST /api/admin/rooms` — create; returns each party's raw link **once**
- `POST /api/admin/rooms/[id]/activate` — link a paid order to a room
- `GET|PATCH /api/r/[token]` — read the room, tick one task
- `GET /api/cron/alerts` — daily digest, 05:00 UTC. `?dry=1` previews and touches nothing.

## Critical envs

`NEXT_PUBLIC_DEAL44_SITE_URL` · `DEAL44_TOKEN_KEY` (32-byte hex) · `DEAL44_INTAKE_EMAIL` · `INTERNAL_API_SECRET` · `CRON_SECRET` · plus shared: `NEXT_PUBLIC_SUPABASE_URL` · `SUPABASE_SERVICE_KEY` · `RESEND_API_KEY` · `BIZLEGAL_INBOUND_SECRET` · `OPS_LOG_URL` · `TURNSTILE_SECRET_KEY`

## Invariants

1. **Access is a hashed token, never a permissive policy.** `deal_parties.token_hash` is a SHA-256; the raw token lives only in the link. There is deliberately **no anon RLS policy** — contrast `deal_rooms`, whose `public_read_by_token USING (true)` lets any anon client read every row. `token_cipher` (AES-256-GCM under `DEAL44_TOKEN_KEY`) exists solely so the digest cron can rebuild a party's own link; without the key it sends no button rather than a wrong one.
2. **Authorisation is server-side, from the role the token resolved to.** The disabled checkbox in the UI is a courtesy; `canToggleTask` in the PATCH route is the control.
3. **Never invent a date.** A missing anchor renders blank. An unreviewed template renders its warning banner. Both come from `materialiseTasks` warnings and neither may be hidden.
4. **`IL_RESIDENTIAL_TASKS.reviewed === false`** until Moses answers the ten interview questions. `createRoom` returns 409 `template_not_reviewed` while it is false. **Manual rooms (`template_id: null`) work regardless** — that is the Phase-0 path.
5. **Statutory tax clocks are calendar days.** Routing one through business-day maths buys the client days they do not have.
6. **The alert cron is deterministic code, not an agent.** A missed statutory date on a lawyer-run product is malpractice-adjacent.
7. **Email goes through `@bizlegal/email` only**, `kind: 'transactional'`, with the written justification in `lib/email/send.ts`. No `skipConsent`. Invites default **off** pending Moses's spam-law position.
8. **No new ops event types** (hard rule 3). Room events map onto existing types with `metadata.step`; `'deal44'` is registered in both `packages/ops-log/src/index.ts` and hub's `ALLOWED_SOURCES`.
9. **No advice framing.** The room describes what was done, never what should be done.
10. `next.config.mjs` needs the `.js → .ts` `extensionAlias` for the NodeNext-authored engine packages — same fix as `apps/hub/next.config.js`.
11. **The Supabase client must pass `cache: 'no-store'`** (`lib/db.ts`). Next's App Router patches global `fetch` and caches GET responses, and supabase-js reads through `fetch`. Caught in an end-to-end run on 2026-09-07: the alerts cron reported **1 open task while the database held 4**, because the first invocation's response was cached. `export const dynamic = 'force-dynamic'` does **not** cover this — it governs route rendering, not the individual fetch. Locked by a test in `tests/pure.test.ts`. **Every other app in the fleet that builds a Supabase client inside a route handler has the same exposure and has not been audited.**

## Verified end to end (2026-09-07, live database, data since removed)

Room created with three parties and three distinct links · broker adds a manual task ✓ · buyer adding a task refused 403 ✓ · buyer ticks own task 200, another party's task 403, broker ticks anything 200 ✓ · unknown token 404 ✓ · no party email leaks into another party's payload ✓ · cron without the bearer 401 ✓ · cron dry-run planned two digests with correct tiers (today 0, overdue −1, five days out 7) ✓ · simulated ILS order → activation → `payment.confirmed` ✓ · Hebrew round-trips byte-identical through the real path ✓.

**Test-harness trap:** Git Bash `curl` on Windows destroys UTF-8 request bodies — Hebrew arrives as U+FFFD. The app is fine; the shell is not. Drive Hebrew requests from Node, never from a Git Bash heredoc.

## Build + test

```bash
pnpm install --ignore-scripts          # the lefthook prepare script hangs
cd apps/deal44 && node tests/run.cjs   # 22 tests
../../node_modules/.bin/tsc --noEmit -p tsconfig.json
VERCEL=1 CI=1 ../../node_modules/.bin/next build
```

Run the `node_modules/.bin` binaries directly — pnpm scripts can false-green in this shell.

Vercel **Root Directory = `apps/deal44`**. Leaving it unset is what broke leadforge for a month.

## Tables

`deals` (+7 columns) · `deal_parties` · `deal_tasks` · `deal_alerts` · `deal_events`, from `supabase/migrations/20260908_deal44_rooms.sql` — **written, not applied**.

Canonical plan: `decisions/DEAL44-WORKFLOW44-2026-09-07.md`.
