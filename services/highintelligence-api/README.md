# BrainX API

BrainX Intelligence OS FastAPI service — Neon Postgres, Gmail-linked, AEO/GEO/SEO-driven.

## Env
Required: `NEON_DATABASE_URL` / `DATABASE_URL`, `BRAINX_INTERNAL_KEY`
Optional: `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` / `GOOGLE_GEMINI_API_KEY`, `APIFY_TOKEN`, `GOOGLE_GMAIL_ACCESS_TOKEN`, `RESEND_API_KEY`, `BRAINX_GMAIL_FROM`

## Run
```
uvicorn app.main:app --reload --port 8080
pytest tests
```
