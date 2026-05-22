# EA Ops Prompts — Phase RR

> First read `agents/ea/EA-CLAUDE.md` for the EA mandate.

Eight autonomous task prompts that drive BizLegal's daily / weekly / monthly ops. Triggered by Vercel cron entries in `apps/hub/vercel.json` → `GET /api/agents/run?task=<id>`. The runtime ships embed copies in `apps/hub/lib/agents/prompts.ts` (build-time inline so Vercel functions don't need filesystem access to this dir).

**Keep the two in sync** when editing — there is no automated enforcement yet.

## Tasks

| ID | Cadence | Model | Telegram channel |
|---|---|---|---|
| `daily-revenue-digest` | 08:00 UTC daily | Haiku 4.5 | TELEGRAM_CHAT_ID |
| `daily-vertical-classifier-audit` | 08:30 UTC daily | Haiku 4.5 | TELEGRAM_CHAT_ID |
| `daily-content-pick-suggestion` | 09:30 UTC daily | Haiku 4.5 | TELEGRAM_CHAT_ID |
| `daily-affiliate-followup` | 10:00 UTC daily | Haiku 4.5 | TELEGRAM_CHAT_ID |
| `daily-cold-pitch-suggestion` | 11:00 UTC daily | Haiku 4.5 | TELEGRAM_CHAT_ID |
| `weekly-mrr-review` | Mon 09:00 UTC | Sonnet 4.6 | TELEGRAM_CHAT_ID |
| `friday-retrospective` | Fri 17:00 UTC | Sonnet 4.6 | TELEGRAM_CHAT_ID |
| `monthly-vertical-scorecard` | 1st 09:00 UTC | Sonnet 4.6 | TELEGRAM_CHAT_ID |

## Wire format

Each cron entry hits `GET /api/agents/run?task=<id>` with `Authorization: Bearer $CRON_SECRET`. The runner:

1. Validates the secret + task id
2. Calls `fetchOpsContext()` (last 24h events, 7d framework changes, recent payment_orders, affiliate signups)
3. Calls Anthropic with the task's system prompt (prompt-cached for 5-min TTL across same-task crons) + context JSON
4. POSTs result to Telegram
5. Logs `agent.run.{completed,error}` with usage stats

## Cost guardrail

- Haiku 4.5: ~$0.03/run × 5 daily = ~$0.90/day = ~$27/mo
- Sonnet 4.6: ~$0.20/run × (1 Mon + 1 Fri + ~1/mo) ≈ ~$2/mo
- Total: ~$29/mo · under the $35-50/mo OpEx ceiling in `decisions/MASTER_FUNNEL.md`

## Editing

To change a prompt's behavior:

1. Edit `apps/hub/lib/agents/prompts.ts` — that's what runs in production
2. Document the new behavior here for human readers
3. Commit + push — Vercel auto-deploys; next cron firing uses the new prompt
