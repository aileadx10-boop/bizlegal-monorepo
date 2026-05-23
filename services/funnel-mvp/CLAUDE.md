# services/funnel-mvp — Fastify legal-risk intelligence funnel

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md). This file documents only what's specific to funnel-mvp.

Imported into the monorepo on 2026-05-01 from `C:/Users/Moshe Dor/Downloads/SKOOL-NATE/funnel-mvp/`. Pre-existing Fastify service that handles document upload + LLM extraction + payment gating + report delivery for the AI legal risk intelligence flow.

## What it does

End-to-end pipeline (per `src/services/job-runner.ts`):

1. User uploads a contract / policy doc → `POST /upload` (Fastify route)
2. PDF/DOCX parsed (`pdf-parse` + `mammoth`)
3. Local Ollama extraction with cloud fallback to Minimax (`src/ai/`)
4. Output validated against Zod schema (`src/ai/output-validator-service.ts`)
5. Payment gate: free preview → paid full report. Two gateways:
   - LemonSqueezy (`src/payments/lemon-service.ts`)
   - PayPal (`src/payments/paypal-service.ts`)
6. PDF report generated (`pdfkit`) + delivered via Notion link or direct download
7. Webhook (`src/routes/webhook-routes.ts`) confirms payment + unlocks full report
8. State persisted to Firestore (`src/firebase/firestore-funnel-repository.ts`)

## Critical envs (must be in canonical vault)

Inherited from prior `funnelriskanalysis.env` (NOT imported — file scrubbed during Z1.E import). Names lifted into the canonical vault by Moses or the audit-vault hook.

| Var | Required | Purpose |
|---|---|---|
| `MINIMAX_API_KEY` | yes | Cloud-fallback extraction |
| `OLLAMA_URL` | yes | Local extraction (default `http://localhost:11434`) |
| `LEMONSQUEEZY_API_KEY` + `LEMONSQUEEZY_STORE_ID` + `LEMONSQUEEZY_WEBHOOK_SECRET` | yes | Card-checkout gateway |
| `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` (+ optional `PAYPAL_API_URL`) | yes | Card-checkout fallback |
| Firebase service-account JSON | yes | Firestore + Storage adapter (loaded via `FIREBASE_SERVICE_ACCOUNT_JSON` env or file path) |
| `NOTION_API_KEY` (if Notion delivery) | optional | Report-link delivery |

## Build + run

```bash
pnpm -F @bizlegal/funnel-mvp install   # workspace install
pnpm -F @bizlegal/funnel-mvp dev       # tsx watch src/server.ts
pnpm -F @bizlegal/funnel-mvp build     # tsc -p tsconfig.json
pnpm -F @bizlegal/funnel-mvp start     # node dist/server.js
pnpm -F @bizlegal/funnel-mvp test      # vitest
```

Deploy target: TBD by Moses. Possible options:
- Hetzner systemd service (alongside curator)
- Fly.io / Railway / Render dedicated container
- Docker on OCI (alongside deal-router)

## Phase Z context — what NOT to change

- **DO NOT modify `src/payments/lemon-service.ts` or `src/payments/paypal-service.ts`.** Per Z3 (`packages/payment/CLAUDE.md`), payment-gateway code stays as-is during Phase Z. After Z7 verifies green for 24h, a separate phase consolidates funnel-mvp's payments into the shared `@bizlegal/payment` package.
- **DO NOT swap Ollama / Minimax clients to use OpenClaw.** Per `decisions/OPENCLAW_ROLE.md`, OpenClaw installs are local dev tools, NOT for production. funnel-mvp's direct Ollama call is the right pattern.
- The Firebase adapter coexists with the hub's Supabase pattern — don't try to "unify". Funnel-mvp owns its job state in Firestore; hub owns ops_events in Supabase. Two storage layers, one each per service, intentional.

## Outstanding integration tasks (post-Z7)

1. **ops_log integration:** funnel-mvp does NOT currently fire ops_events. Add `@bizlegal/ops-log` import + fire `report.generated` on successful report + `payment.intent` / `payment.confirmed` from webhook routes.
2. **Payment consolidation:** migrate from `src/payments/lemon-service.ts` + `src/payments/paypal-service.ts` to `@bizlegal/payment.startCheckout()`. Keeps LS + PayPal but removes the per-service gateway client duplication.
3. **HMAC inbound:** funnel-mvp's `/webhook` route should verify `x-bizlegal-signature` for any internal call from hub → funnel (currently webhooks are LS/PayPal-signature-only, which is correct for those gateways but not for inter-service hub→funnel calls).
4. **Deploy target decision:** Moses picks Hetzner / Fly / OCI; document in `infrastructure/`.
