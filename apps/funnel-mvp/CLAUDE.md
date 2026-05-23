# apps/funnel-mvp — funnel.bizlegal-ai.com

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

Contract-risk intelligence funnel. Upload PDF/DOCX contract → free 2-issue preview → $97 one-time PayPal → full PDF report.

**Migrated from `services/funnel-mvp/` (Fastify) on 2026-05-24.** See `decisions/FUNNEL-MVP-MIGRATION-2026-05-24.md` for the why.

## Stack

| Layer | Before (Fastify) | Now (Next.js) |
|---|---|---|
| Runtime | Fastify · standalone Node | Next.js 15 · Vercel serverless |
| Storage | Firebase Storage | Supabase Storage (`funnel-uploads` bucket) |
| DB | Firestore | Supabase Postgres (`funnel_jobs` table) |
| Payments | LemonSqueezy + PayPal | PayPal only (Orders v2) |
| AI extraction | Ollama (local) + Minimax fallback | Anthropic Haiku 4.5 + Minimax fallback |
| Deploy | TBD (Hetzner/Fly/OCI) | Vercel — auto on push |

## Primary routes

- `/` — upload form (landing)
- `/report/[id]` — preview + paywall + (after pay) PDF download link
- `/api/upload` — POST multipart/form-data, returns `{ jobId, preview, overall_risk }`
- `/api/jobs/[id]` — GET job state + signed PDF URL when ready
- `/api/payments/paypal/start` — POST `{ jobId }`, returns `{ approve_url, order_id }`
- `/api/payments/paypal/webhook` — PayPal event ingest; captures + builds report
- `/api/digest` — daily product activity (hub aggregator consumes this)
- `/api/ops/health` — per-subdomain env audit

## Critical envs

All values in canonical vault. See `.env.example` for the full list with comments.

| Var | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | DB + storage |
| `SUPABASE_SERVICE_KEY` | yes | service-role inserts + uploads |
| `ANTHROPIC_API_KEY` | yes | primary AI extraction (Haiku 4.5) |
| `MINIMAX_API_KEY` | optional | fallback extraction |
| `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` | yes | Orders v2 OAuth |
| `PAYPAL_ENV` | yes | `sandbox` (default) or `live` |
| `PAYPAL_WEBHOOK_ID` | optional | webhook signature verification (best-effort if absent) |
| `BIZLEGAL_INBOUND_SECRET` | yes | ops_log HMAC chain |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | optional | analytics (Phase RR R5) |
| `SUPABASE_STORAGE_BUCKET` | optional | defaults `funnel-uploads` |

## Build + run

```bash
pnpm -F @bizlegal/funnel-mvp build       # next build
pnpm -F @bizlegal/funnel-mvp typecheck   # tsc --noEmit
pnpm -F @bizlegal/funnel-mvp dev         # next dev (port 3000)
```

## Vercel deploy

Project name: `funnel-mvp`. Domain: `funnel.bizlegal-ai.com`. Root Directory: `apps/funnel-mvp`. Set in Vercel UI after first build verifies.

## Invariants (don't break)

1. **Job state is the source of truth.** Every status change must write to `funnel_jobs.status` BEFORE firing the ops_event — so the dashboard never shows a sale that doesn't have a corresponding paid row.
2. **PayPal webhook capture is idempotent.** Second webhook for the same order is a no-op. The capture call itself is also idempotent on PayPal's side (returns ORDER_ALREADY_CAPTURED).
3. **Preview is computed at upload time**, not paywall-pop time. We avoid charging users for extractions that haven't happened yet.
4. **File upload max 4MB.** Vercel function body limit is 4.5MB. Larger contracts should go through a direct-to-Supabase-Storage signed URL (not yet implemented).
5. **Affiliate cookie is read on upload, not at payment.** The 90-day attribution window starts when they upload, not when they pay. Matches the hub pattern.

## Supabase schema

See `apps/hub/supabase/migrations/20260524_funnel_jobs.sql` (applied via MCP same day).

- `funnel_jobs` — one row per upload, lifecycle: uploaded → extracting → preview_ready → payment_pending → paid → full_report_ready (or failed)
- Storage bucket `funnel-uploads` with `uploads/<jobId>/<filename>` (raw doc) + `reports/<jobId>.pdf` (PDF)
- RLS: service-role full access; `anon` reads any row by id (the route uses the unguessable UUID as the gating credential)

## Status (2026-05-24)

- Code: shipped, typechecked, ready to deploy
- Vercel project: not yet created (Moses task)
- DNS: `funnel.bizlegal-ai.com` not yet pointed (Moses task)
- Plausible: dormant until `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` set
- PayPal: code uses sandbox by default; flip `PAYPAL_ENV=live` for real money
