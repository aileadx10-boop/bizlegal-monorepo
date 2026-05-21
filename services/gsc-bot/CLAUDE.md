# services/gsc-bot — bizlegal-gsc-bot (Cloudflare Worker)

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

Weekly Google Search Console sitemap re-submission for all 8 BizLegal surfaces. Eliminates the manual GSC UI step from the runbook.

## Endpoints

- `GET /health` — liveness + configured site count
- `POST /run?token=<ADMIN_TOKEN>` — manual trigger (Moses-only)

## Cron

`0 2 * * 1` — every Monday 02:00 UTC, re-PUTs the 8 sitemap URLs.

## Sites covered

`bizlegal-ai.com` (sitemap-index.xml) + `brai`, `forge`, `docai`, `lexaudit`, `tracr`, `leadforge`, `blog` subdomains. List lives in `wrangler.toml [vars] SITES`.

## One-time GSC setup (per property, ~30 sec each)

1. Open https://search.google.com/search-console → property → Settings → Users and permissions
2. Add the service-account email (`bizlegal-gsc-bot@<project>.iam.gserviceaccount.com`) with **Restricted** role
3. Repeat for all 8 properties

## Secrets (`wrangler secret put`)

- `GSC_SERVICE_ACCOUNT_JSON` — full service account JSON (paste as one line, includes `private_key`)
- `BIZLEGAL_INBOUND_SECRET` — same hex as every other surface (HMAC chain to `/api/ops/log`)
- `OPS_LOG_URL` — `https://bizlegal-ai.com/api/ops/log`
- `ADMIN_TOKEN` — opaque token for `/run` (rotate with `openssl rand -hex 32`)

All four names must be appended to the canonical vault before `wrangler deploy` per Operating Book §5.

## Deploy

```bash
cd services/gsc-bot
pnpm install
pnpm wrangler deploy
```

## Ops event types emitted

- `gsc.submit.cron` — scheduled run summary
- `gsc.submit.manual` — `/run` invocation summary
- `gsc.submit.error` — runtime failure (auth, parse, fetch)

Each carries `{ total, ok, failed, results: [{site, sitemap, status, ok, error?}] }`.

## Why a dedicated worker (not added to `services/worker`)

- Distinct failure domain — GSC outage must not degrade lead intake
- Distinct credentials — Google service account vs Anthropic API key
- Different cadence — weekly vs every-5-min nurture
- Smaller blast radius for any code change touching SEO
