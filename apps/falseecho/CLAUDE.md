# falseecho — CLAUDE.md

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md) — vault rule (§4), operating-book discipline (§5), hard rules (§6). This file covers only what is specific to FalseEcho.

**Purpose:** AI answer-engine falsehood monitoring. Probes ChatGPT, Claude, Perplexity and Google AI Overviews for what they say about a named company or person, flags suspected factual inaccuracies, and hash-anchors every captured answer (SHA-256 + UTC timestamp + sequence). Free 3-prompt check → $29 one-time audit (25-prompt battery × 4 engines) → $149/mo monitor (daily re-scan + alert on a new flag).

**Status (2026-09-15, B2):** payable end to end in code; **no Vercel project yet — not deployed, not public**. Nothing here is live until the project, domain and env are created.

## Routes

`/` · `/scan` (free check + in-app checkout) · `/pricing` (links to the hub apex checkout) · `/report/[scan_ref]` · `/success` · `/seo/[engine]/[entity]/[hash]` · `/robots.txt` · `/llms.txt` · `/sitemap.xml`

API: `/api/scan` · `/api/scan/run` (internal-key gated paid battery) · `/api/create-order` (PayPal) · `/api/paypal-capture` · `/api/payments/paypal/webhook` (**recurring rail**) · `/api/payments/nowpayments/{start,webhook}` · `/api/fulfillment` (hub apex grant, HMAC) · `/api/inbound-lead` · `/api/lead` · `/api/digest` · `/api/cron/monitor` (daily 06:00 UTC) · `/api/ops/health`

## Invariants

1. **`next.config.mjs` must keep `experimental.outputFileTracingRoot` pointed at the monorepo root.** Without it the Vercel tracer roots at `apps/falseecho`, omits every pnpm-hoisted workspace package, and each API lambda throws `MODULE_NOT_FOUND` on its first request — a green build over a dead runtime. This is the leadforge lesson. Vercel **Root Directory = `apps/falseecho`**.
2. **Email goes through `@bizlegal/email` only**, `kind: 'transactional'`, with the written justification at the top of `lib/email.ts`. The app called Resend directly until 2026-09-15, which put suppression and consent in the caller. No `skipConsent`, ever.
3. **Engine pre-flight gates every paid battery.** `lib/fulfill.ts` checks `engineStatusMatrix()` before firing `/api/scan/run`. If any of the four engine keys is absent the order is **held as `pending_engine`**, an ops event records which engines are missing, and the webhook still returns 200 — a held order is an operations problem, not a reason to make PayPal or NOWPayments retry a payment they already took. `paid_at` stays set because the buyer did pay; the operator re-fires `POST /api/scan/run` with the scan ref once the keys are in place. Needs `supabase/migrations/20260915_falseecho_pending_engine_status.sql`; until that is applied the status write warns and the ops event is the record.
   *Graceful degradation is right for the FREE check and wrong for a paid one:* an unavailable engine there is an honest "unavailable", here it is an evidence pack that probed nothing.
4. **Fulfilment is idempotent through a claimed gate**, not a comment: `UPDATE falseecho_scans … WHERE paid_at IS NULL`. A replayed IPN or a re-delivered PayPal webhook neither re-provisions the monitor nor re-fires the battery. `/api/scan/run` additionally short-circuits on status `delivered`.
5. **A monthly tier is a PayPal subscription, never a one-time order.** `/api/create-order` branches on `TIER_INTERVALS`; `monitor` requires `PAYPAL_PLAN_ID_FALSEECHO_MONITOR_MONTHLY` and returns **503 naming the env var** when it is unset. It must never fall back to a single $149 charge on a service that then runs forever.
6. **Crypto cannot bill monthly.** `/api/payments/nowpayments/start` refuses a monthly tier with `recurring_requires_card` (400). A NOWPayments invoice is one charge.
7. **Both webhooks fail closed.** NOWPayments: no `NOWPAYMENTS_IPN_SECRET` → 503, bad HMAC → 401. PayPal: no `PAYPAL_WEBHOOK_ID` → 503, verification not `SUCCESS` → 401. There is deliberately no "skip verification in preview" branch.
8. **`robots.ts` and `llms.txt` read their lists from `@bizlegal/themes`** (`packages/themes/src/seo.ts`). Do not re-inline the crawler allow/block lists; a copy is a list that drifts.
9. **No verdicts, no legal conclusions.** A flag is a heuristic signal plus a graded narrative. The grading prompt in `lib/run-scan.ts` forbids "defamation"/"libel"/"liable" by construction, and every email and page repeats that FalseEcho makes no defamation determination and gives no legal advice. No correction, removal or ranking outcome is promised.

## Known open items

- `robots.ts` disallows `/scan` while `sitemap.ts` advertises it at priority 0.95. Pre-existing contradiction, left as found — decide which one is right before the first GSC submission.
- `PAYPAL_PLAN_ID_FALSEECHO_MONITOR_MONTHLY` is in the vault as an empty name. Create the plan (`scripts/paypal-provision-plans.mjs`) and set the value, plus a PayPal webhook for this project (`PAYPAL_WEBHOOK_ID`), before selling the monitor tier.
- `lib/engines/anthropic.ts` and `lib/run-scan.ts` call `api.anthropic.com` directly rather than through `packages/llm` (which is still a placeholder scaffold). Pre-existing; revisit when the shared router is real.

## Envs (names only; values in the canonical vault)

`NEXT_PUBLIC_SITE_URL` · `NEXT_PUBLIC_SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY` · `BIZLEGAL_INBOUND_SECRET` · `OPS_DASHBOARD_TOKEN` · `OPS_LOG_URL` · `CRON_SECRET` · `RESEND_API_KEY` · `RESEND_FROM` · `PAYPAL_CLIENT_ID` · `PAYPAL_CLIENT_SECRET` · `PAYPAL_ENV` · `PAYPAL_WEBHOOK_ID` · `PAYPAL_PLAN_ID_FALSEECHO_MONITOR_MONTHLY` · `NOWPAYMENTS_API_KEY` · `NOWPAYMENTS_IPN_SECRET` · engines: `OPENAI_API_KEY` · `OPENAI_MODEL` · `ANTHROPIC_API_KEY` · `ANTHROPIC_MODEL` · `ANTHROPIC_GRADING_MODEL` · `PERPLEXITY_API_KEY` · `PERPLEXITY_MODEL` · `SERPAPI_API_KEY` · `FALSEECHO_FULFILL_URL` (read by the hub grant) · `MARKETING_TRIGGER_URL` · `TURNSTILE_SECRET_KEY`

`/api/ops/health?token=…` returns the presence matrix — names and booleans, never values.

## Tables

`falseecho_scans` · `falseecho_evidence` · `falseecho_orders` · `falseecho_monitors` · `falseecho_leads`, from `supabase/migrations/20260901_falseecho_mvp.sql` (applied) and `20260915_falseecho_pending_engine_status.sql` (**not applied**).

## Build + test

```bash
cd apps/falseecho
../../node_modules/.bin/tsc --noEmit -p tsconfig.json
./node_modules/.bin/tsx scripts/smoke-monitor-cron.ts
VERCEL=1 CI=1 ../../node_modules/.bin/next build
```

Run the `node_modules/.bin` binaries directly — pnpm scripts can false-green in this shell.
