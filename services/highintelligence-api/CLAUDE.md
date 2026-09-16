# highintelligence-api — CLAUDE.md

**Status: PARKED, not deployed.** This FastAPI service was scaffolded 2026-09-16 as BrainX's intended automation layer (5 agent routers, LLM clients, a scoring mirror). None of it runs anywhere — no Vercel/Hetzner deployment, no hosted `BRAINX_API_URL` — and every router returns hardcoded zeros; `app/pipeline/ai_router.py` still hardcodes retired Anthropic model ids (`claude-sonnet-4-5`, `claude-opus-4-1`) rather than reading `ANTHROPIC_MODEL`.

**Why it's parked, not built out:** as of the 2026-09-16 productization pass, BrainX runs on an **operator-run weekly radar** instead — a Claude Code session following `agents/brainx/radar-run/SOP.md` produces a validated JSON file that `apps/brainx/tools/ingest-radar.ts` writes to Neon. Zero API cost, and it works today. `packages/llm` (the fleet's shared LLM router) is also still an empty placeholder, so this service has no compliant path to call Anthropic directly even if it were deployed — `scripts/audit-shared-stream.mjs` blocks a direct `new Anthropic(...)` outside `packages/llm`.

**Upgrade path, when there is a reason to automate:** wire the 5 routers to real ingestion, replace the model-id constants with `ANTHROPIC_MODEL ?? 'claude-sonnet-5'` read through `packages/llm` once it has a router, deploy behind `BRAINX_INTERNAL_KEY` auth, and point `workflows/n8n/brainx/*.json` at the real host. Not before there are paying BrainX subscribers to justify the ongoing cost.

**Envs referenced (none currently in the vault, none currently needed since nothing is deployed):** `BRAINX_INTERNAL_KEY`, `BRAINX_API_URL`, `NEON_DATABASE_URL`/`DATABASE_URL`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`/`GOOGLE_GEMINI_API_KEY`, `APIFY_TOKEN`.

**Do not** deploy this service or add its env names to the vault without first fixing the model-id constants and routing through `packages/llm`.
