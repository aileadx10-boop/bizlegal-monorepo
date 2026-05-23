# services/funnel-mvp — DEPRECATED (2026-05-24)

> **This service is superseded by [`apps/funnel-mvp/`](../../apps/funnel-mvp/).** See [`decisions/FUNNEL-MVP-MIGRATION-2026-05-24.md`](../../decisions/FUNNEL-MVP-MIGRATION-2026-05-24.md) for the migration rationale.

## What happened

This was the original Fastify service imported from `C:/Users/Moshe Dor/Downloads/SKOOL-NATE/funnel-mvp/` on 2026-05-01 (Z1.E). It implemented:

- Fastify routes (upload, webhook)
- Firebase Firestore + Storage for state and files
- LemonSqueezy + PayPal payment gateways
- Ollama (local) + Minimax fallback for AI extraction
- pdfkit PDF generation

It never deployed because:
1. LemonSqueezy credentials were never issued (Stripe upstream rejection)
2. Firebase service account JSON was never added to the vault
3. Deploy target was never picked (Hetzner / Fly / Railway / OCI)

## The replacement

On 2026-05-24, the funnel was migrated to `apps/funnel-mvp/` as a Next.js 15 app on Vercel:

- Next.js (matches the 7 other apps)
- Supabase Postgres + Storage (matches the canonical data layer)
- PayPal only (LemonSqueezy dropped; Stripe-upstream rejection killed it)
- Anthropic Haiku 4.5 + Minimax fallback (drops Ollama; no need for the Hetzner tunnel)
- Auto-applies Plausible, the affiliate cookie pattern, the ops_log HMAC chain

## What to do with this directory

**Nothing yet** — it's safe to leave in place because:
- It contains no live secrets (vault values, not in code)
- Nothing imports from it (`pnpm-workspace.yaml` does include it but no app declares `@bizlegal/funnel-mvp` as a dep)
- The git history is useful reference when looking at the old Ollama prompts / Notion delivery code

**Eventual archive path:** delete this directory in a post-Phase-RR-2 cleanup after Moses confirms `apps/funnel-mvp/` is taking real revenue.

## Reference (read-only)

- `src/server.ts` — Fastify bootstrap + DI container
- `src/routes/upload-routes.ts` — signed-URL upload pattern (the Next.js version uses direct multipart instead)
- `src/ai/ollama-document-extraction-service.ts` — original extraction prompt (cleaner than the new schema; consider porting back)
- `src/payments/paypal-service.ts` — original PayPal client (the Next.js version is leaner, drops subscription support)
- `src/payments/lemon-service.ts` — LemonSqueezy client (gone in the new version)
- `src/services/report-service.ts` — pdfkit report (the Next.js `lib/report.ts` is a from-scratch rewrite)
