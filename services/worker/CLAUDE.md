# services/worker — bizlegal-lead-intake (Cloudflare Worker)

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

Multi-purpose Cloudflare Worker. Receives landing-form submissions, runs them through a 5-stage AI pipeline (extract → critique → score → summary → route), commits the LeadProfile to bizlegal-ea, fans out to the matching product subdomain, and aggregates daily product-digests for the hub homepage.

**Routes (in `src/index.ts`):**
- `POST /intake` — landing-form lead submission (auth: WEBHOOK_SHARED_SECRET)
- `POST /report/snapshot` — internal snapshot trigger (auth: shared secret)
- `POST /report/snapshot-public` — public snapshot from blog/hub forms (auth: Turnstile + honeypot)
- `POST /digest/aggregate` — manual rerun of daily product-digest aggregator (auth: shared secret)
- `GET /digest/latest` — public read of latest aggregated digest (used by hub homepage)
- `GET /health` — liveness + version + thresholds

**Crons (per `wrangler.toml [triggers]`):**
- `0 6 * * *` — daily product-digest aggregator (fans out to 6 subdomain `/api/digest`)
- `0 9 * * *` — daily snapshot smoke test (synthetic LeadProfile through full pipeline)

**Files:**
- `src/index.ts` — entry; routes + cron handlers
- `src/pipeline.ts` — 5-stage pipeline (extract/critique/score/summary/route)
- `src/pipeline-report.ts` — snapshot pipeline (jurisdictional comparisons)
- `src/inbound-lead.ts` — HMAC-signed POST to product `/api/inbound-lead`
- `src/vertical-classifier.ts` — keyword + Sonnet routing across 7 verticals (BRAI, TRACR, LexAudit, DocAI, LeadForge, Forge, Realestate→OCI)
- `src/ops-log.ts` — Worker-runtime HMAC client to hub `/api/ops/log`
- `src/digest.ts` — daily aggregator
- `src/extract.ts`, `critique.ts`, `score.ts`, `summary.ts` — Haiku pipeline stages
- `src/turnstile.ts` — Cloudflare Turnstile verifier (anti-spam on public endpoint)
- `wrangler.toml` — name=`bizlegal-lead-intake`, KV=`DIGEST_KV` id `f56bcfd5fd4d46468da269070a7ad323`

**Critical secrets (set via `wrangler secret put`):**

`ANTHROPIC_API_KEY`, `GITHUB_TOKEN`, `WEBHOOK_SHARED_SECRET` (= `BIZLEGAL_INBOUND_SECRET`). Optional: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_REPLY_TO`, `PUBLIC_SNAPSHOT_ENABLED`, `OPS_LOG_URL`, `TURNSTILE_SECRET_KEY`.

**Build / deploy:**

```bash
cd services/worker
pnpm install
pnpm wrangler deploy   # ships to bizlegal-lead-intake.bizlegal-ai.workers.dev
```

**Migration notes (Z1.C 2026-05-02):** tree-copy from `C:/Users/Moshe Dor/Downloads/SKOOL-NATE/executive assistant/projects/bizlegal-lead-intake/`. node_modules + .wrangler + .dev.vars excluded.

**Outstanding tasks (post-Z7):**
- Migrate `src/{extract,critique,score,summary}.ts` to read prompts from `agents/ea/prompts/` instead of inlining.
- Migrate `src/ops-log.ts` to import from `@bizlegal/ops-log` (currently has its own Worker-runtime HMAC because the parent package pulls in supabase-js which doesn't run on Workers).
