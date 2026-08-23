# apps/coguard — coguard.bizlegal-ai.com

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md). This file covers only what is specific to CoGuard.

Co-parenting communication & legal evidentiary engine. Draft clean. Send confident. Build your case.

## Key routes

- `/` — landing (BIFF demo + viral footer preview + social proof)
- `/pricing` — Solo Shield $14.99/mo + Litigation $29.99/mo
- `/dashboard` — compose + message feed with hostility badges
- `/dashboard/binders` — date picker + binder list + PDF download
- `/dashboard/settings` — forwarding setup guide + plan management
- `/attorney/[code]` — public, code-gated, read-only case timeline
- `/api/messages/draft` — POST: classify tone → BIFF → return side-by-side
- `/api/messages/send` — POST: send approved draft via Resend + log
- `/api/provision` — x-internal-secret: assign inbox_alias + reply_address + CF KV write
- `/api/binder/generate` — kick Hetzner binder job (fire-and-forget)

## Critical envs

`COGUARD_INTERNAL_SECRET` · `CF_COGUARD_ROUTING_TOKEN` · `NEXT_PUBLIC_COGUARD_SITE_URL` · `PAYPAL_PLAN_ID_COGUARD_SOLO_MONTHLY` · `PAYPAL_PLAN_ID_COGUARD_LITIGATION_MONTHLY` · plus shared: `BIZLEGAL_INBOUND_SECRET` · `RESEND_API_KEY` · `NOWPAYMENTS_API_KEY` · `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` · `NEXT_PUBLIC_SUPABASE_URL` · `SUPABASE_SERVICE_KEY`

## Invariants

1. `/api/messages/send` must write `body_sha256` before calling Resend — never send without logging.
2. `coguard_messages` is append-only — no UPDATE RLS policy, no soft-deletes.
3. `/api/provision` is x-internal-secret gated — never expose to client.
4. IPN base URL hardcoded to `https://coguard.bizlegal-ai.com` (not env interpolated) per Z3 pattern.

## Canonical product doc: `decisions/COGUARD_PRODUCT_PLAN.md`
