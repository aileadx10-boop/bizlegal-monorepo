# services/telegram-hub — @BizlegalHubBot

Cloudflare Worker. Customer-facing FAQ + intake bot. Routes inbound messages to the right `/agents/<x>` CTA on the hub. Fires `lead.inbound` ops_event per topic-matched message.

## What it does

- Receives Telegram updates via webhook (NOT long-poll)
- Verifies `X-Telegram-Bot-Api-Secret-Token` header
- Matches inbound text against 6 keyword routes: BOI / AI-Act / Privacy / PSP / TRACR / BRAI
- Replies with a 1-paragraph topic summary + an inline-keyboard CTA button to the matching `/agents/<name>` (or external subdomain) page
- Fires `lead.inbound` HMAC-signed POST to `https://bizlegal-ai.com/api/ops/log` (so /ops sees the inbound funnel)
- On unrecognized text → returns the menu

No payments, no PII storage, no Supabase writes. Pure top-of-funnel.

## Envs (canonical vault names — pre-commit hook checks)

| Var | Required | Purpose |
|---|---|---|
| `BIZLEGALHUBBOT` | yes | Telegram bot token from BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | yes | random hex; verifies inbound is from Telegram |
| `WEBHOOK_SHARED_SECRET` | yes | same hex as `BIZLEGAL_INBOUND_SECRET` on hub; signs outbound `lead.inbound` events |
| `HUB_BASE_URL` | optional | defaults to `https://bizlegal-ai.com`; override for staging |

Set via:
```bash
cd services/telegram-hub
wrangler secret put BIZLEGALHUBBOT
wrangler secret put TELEGRAM_WEBHOOK_SECRET
wrangler secret put WEBHOOK_SHARED_SECRET
```

## Deploy

```bash
cd services/telegram-hub
pnpm typecheck
pnpm deploy   # wrangler deploy
```

## One-time webhook setup

After first deploy, register the webhook with Telegram:

```bash
curl "https://api.telegram.org/bot$BIZLEGALHUBBOT/setWebhook" \
  -d "url=https://bizlegal-telegram-hub.bizlegal-ai.workers.dev/webhook" \
  -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
```

Verify:
```bash
curl "https://api.telegram.org/bot$BIZLEGALHUBBOT/getWebhookInfo" | jq
# expect: { url: "https://bizlegal-telegram-hub.bizlegal-ai.workers.dev/webhook", has_custom_certificate: false, ... }
```

## Adding a new topic route

1. Edit `src/index.ts` `routeMessage()` — add a regex + RouteHit
2. Add the topic to the menu text constant if it's a customer-facing keyword
3. Confirm the CTA URL is one of the existing `/agents/<name>` paths (don't invent new agent paths from this Worker — that's a hub-side concern)
4. Deploy + smoke test in Telegram

## Adding a NEW shared package dep

This Worker uses `@cloudflare/workers-types` only — it doesn't import from `@bizlegal/ops-log` because the Worker runtime doesn't run Node-style supabase-js (and the parent `ops-log` TS module pulls in `@supabase/supabase-js`). The Worker does its own HMAC signing inline. If we extract a shared `@bizlegal/hmac-client` package later, the Worker is the right consumer to verify the package works under the Worker runtime.
