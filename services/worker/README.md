# bizlegal-lead-intake

Cloudflare Worker that powers the BizLegal-AI lead capture + qualification pipeline.

Part of the BizLegal-AI Intelligence Hub (Phase 1 of 7). See `/decisions/log.md` and `/prompts/` in the EA root.

## Pipeline

```
Landing form (forge-v3-purple)
       |
       v
POST /intake  (this Worker)
       |
       v  [Day 2 additions]
Idempotency (KV) -> Haiku extract -> Haiku critique -> [escalate? Sonnet re-extract]
       |
       v
Haiku score -> Haiku summary
       |
       v
GitHub commit to bizlegal-ea/lead_profiles/{id}.{md,json}
       |
       v
Append decisions/log.md + Telegram notify (if score >= 7)
       |
       v
On error: write outputs/dlq/{ts}.json + Telegram alert
```

## Live

Deployed 2026-04-21 to `https://bizlegal-lead-intake.bizlegal-ai.workers.dev`.

- GET `/health` — liveness probe (returns config + model IDs)
- POST `/intake` — 4-stage Haiku pipeline, fires async via `ctx.waitUntil`, returns fast 202

## Day-2 status

- 4-stage Haiku chain: extract / critique / score / summary — all `claude-haiku-4-5`
- Cloud escalation flag: Sonnet 4.6 re-extract when confidence < 0.80 (wired in code, trigger logic in Day-3)
- GitHub persistence: commits `.md` + `.json` to `bizlegal-ea/lead_profiles/` + appends `decisions/log.md`
- Telegram notify: MarkdownV2 DM when score >= 7 (falls through cleanly if creds absent)
- DLQ: failures commit to `outputs/dlq/{ts}.json` + Telegram alert
- Shared-secret auth via `X-Bizlegal-Secret` header
- Zod input validation
- `LeadProfile` type aligned with `/schemas/lead-profile.json`

## Day-2 TODO

- [ ] Add KV namespace `LEADS_KV` for idempotency + DLQ
- [ ] Add `anthropic.ts` — 4-stage Haiku chain (extract/critique/score/summary)
- [ ] Add `github.ts` — commit LeadProfile to `bizlegal-ea` repo via REST API
- [ ] Add `telegram.ts` — notification with 5-bullet summary
- [ ] Add retry with exponential backoff for each external call
- [ ] Add cloud escalation branch (Sonnet 4.6) when confidence < 0.80
- [ ] Add scheduled daily smoke test (Cron Trigger at 09:00 UTC)
- [ ] Bind to `intake.bizlegal-ai.com` via `[routes]` in wrangler.toml

## Local dev

```bash
cd projects/bizlegal-lead-intake
npm install
cp .dev.vars.example .dev.vars
# Fill .dev.vars from ~/.env.CANONICAL.txt (use ANTHROPIC_API_KEY_COMPLIANCE)
# Generate WEBHOOK_SHARED_SECRET: openssl rand -hex 32
npm run dev           # http://localhost:8787
npm run typecheck
```

## Deploy (first time)

```bash
wrangler login                                    # browser auth
wrangler secret put ANTHROPIC_API_KEY             # paste ANTHROPIC_API_KEY_COMPLIANCE
wrangler secret put GITHUB_TOKEN                  # fine-grained PAT, contents:write on bizlegal-ea
wrangler secret put WEBHOOK_SHARED_SECRET         # openssl rand -hex 32
# Telegram: set once user provides bot token + chat id
# wrangler secret put TELEGRAM_BOT_TOKEN
# wrangler secret put TELEGRAM_CHAT_ID
wrangler deploy
```

After deploy, test:
```bash
curl -X POST https://bizlegal-lead-intake.bizlegal-ai.workers.dev/intake \
  -H "content-type: application/json" \
  -H "x-bizlegal-secret: <secret>" \
  -d '{"full_name":"Test","email":"test@example.com","challenge":"Need GDPR readiness check before Q3 launch in EU"}'
```

## Secrets required

| Secret | Source | Required by |
|---|---|---|
| `ANTHROPIC_API_KEY` | `.env.CANONICAL.txt` → `ANTHROPIC_API_KEY_COMPLIANCE` | Day 2 |
| `GITHUB_TOKEN` | new fine-grained PAT on `bizlegal-ea`, `contents:write` | Day 2 |
| `TELEGRAM_BOT_TOKEN` | existing bot (TBD from user) | Day 2 |
| `TELEGRAM_CHAT_ID` | existing chat (TBD from user) | Day 2 |
| `WEBHOOK_SHARED_SECRET` | `openssl rand -hex 32` | Day 1 |

## Security

- Form submissions require `X-Bizlegal-Secret` header (shared secret)
- Secrets are Worker secrets, never in code
- `.dev.vars` is gitignored
- PII (email, name) is stored in private `bizlegal-ea` GitHub repo only — no public cache
