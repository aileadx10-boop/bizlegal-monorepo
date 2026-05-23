# services/funnel-mvp — OBSOLETE (functionally replaced by apps/docai/web/)

> **Stop. The contract-risk funnel lives at [`apps/docai/web/`](../../apps/docai/web/).** This Fastify service never deployed and its function was absorbed into DocAI months ago. Do not deploy this. Do not extend it.

## What this directory is

The original Fastify service imported from `C:/Users/Moshe Dor/Downloads/SKOOL-NATE/funnel-mvp/` on 2026-05-01 (Z1.E). It implemented document upload → Ollama+Minimax extraction → LemonSqueezy/PayPal payment gate → pdfkit PDF, all backed by Firebase Firestore + Storage.

It never deployed because:
1. LemonSqueezy credentials were never issued (4 rejected applications, last on 2026-05-20)
2. Firebase service account JSON was never added to the canonical vault
3. A deploy target (Hetzner / Fly / Railway / OCI) was never picked

## What replaced it

`apps/docai/web/` already implements the entire $97 contract-risk funnel and has been live on Vercel since 2026-05-23. See [`decisions/DOCAI_FUNNEL_COMPLETION_REPORT_2026-05-16.md`](../../decisions/DOCAI_FUNNEL_COMPLETION_REPORT_2026-05-16.md) for the completion report and [`decisions/FUNNEL-CANONICAL-IS-DOCAI-2026-05-24.md`](../../decisions/FUNNEL-CANONICAL-IS-DOCAI-2026-05-24.md) for the canonical-surface decision.

| Stage | DocAI route |
|---|---|
| Upload | `apps/docai/web/app/api/documents/upload/route.ts` |
| Extract + scan | `apps/docai/web/app/api/documents/scan/route.ts` → returns `scan_id` |
| Preview + paywall | `apps/docai/web/pages/report/index.tsx` (`/report?scan_id=…`) |
| Crypto payment | `apps/docai/web/app/api/payment/checkout/route.ts` + `webhook` ✅ NOWPayments LIVE |
| PayPal payment | `apps/docai/web/app/api/payment/paypal/checkout/route.ts` + `return` (gated off — 401 OAuth issue) |
| Unlock | `contract_scans.paid=true` in Supabase |

Trust controls (anti-hallucination): `evidence_refs` required for red flags · unsupported claims moved to "Needs Human Review" · refund promise on cited issues without supporting evidence · "This is not legal advice" on every render.

## What NOT to do

- **Do not** deploy this Fastify service. The DocAI Vercel app already serves the live funnel at the production alias.
- **Do not** build a third parallel Next.js funnel app. (One attempt on 2026-05-24 — commit `ae6d6fe`, `apps/funnel-mvp/` — was reverted same-day for exactly this reason.)
- **Do not** add LemonSqueezy back. Stripe upstream rejected it 4×; DocAI uses NOWPayments (live) + PayPal (gated until OAuth fix).
- **Do not** delete the source files here yet. The git history is useful reference for the original Ollama extraction prompt + Notion delivery pattern.

## Eventual cleanup path

After Moses confirms DocAI sustained 30 days of real revenue:

1. Delete `services/funnel-mvp/` entirely
2. Update root `CLAUDE.md` to remove the line
3. No other refactoring needed (`pnpm-workspace.yaml` uses `services/*` glob; nothing to remove explicitly)

Until then, leave this directory in place as a tombstone + reference.

## Reference (read-only)

- `src/ai/ollama-document-extraction-service.ts` — original extraction prompt
- `src/payments/paypal-service.ts` — original PayPal client
- `src/services/report-service.ts` — pdfkit PDF builder (DocAI returns evidence-cited HTML/JSON; PDF generation lives elsewhere)
- `src/services/notion-service.ts` — Notion delivery (DocAI sends reports via email through Resend instead)
