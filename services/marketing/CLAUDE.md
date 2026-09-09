# services/marketing — CLAUDE.md

**Purpose:** marketing automation jobs on Trigger.dev. Two tasks today: `trigger/weekly-newsletter.ts` (weekly newsletter send) and `trigger/process-content-queue.ts` (content queue processor). `trigger.config.ts` pins the project (`TRIGGER_PROJECT_REF`).

**Envs:** `TRIGGER_PROJECT_REF`, `FOUNDER_EMAIL`, `NEWSLETTER_FROM`, `N8N_MARKETING_WEBHOOK_URL`, `MARKETING_CALLBACK_URL`. Names in the canonical vault; values in the Trigger.dev env.

**Deploy:** `trigger.config.ts` ships the project (`npx trigger.dev deploy` pattern); the consuming apps enqueue via `MARKETING_TRIGGER_URL` (falseecho, sellerradar).

**Rule 7 note:** newsletter = double-opt-in audience only. This service never sends cold mail; suppression lives in `@bizlegal/email` if a path is ever added here.
