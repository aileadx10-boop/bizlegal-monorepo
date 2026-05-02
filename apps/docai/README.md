# DocAI Monorepo

This repository now centers on a single Next.js App Router app in `web/`.

## Unified App

`web/` now contains:

- the DocAI homepage and document-generation UI
- `app/api/agents/*` contract agent routes
- `app/api/documents/*` upload and scan routes
- `app/api/payment/*` NOWPayments invoice and webhook handlers
- `/report/[scan_id]` for the gated contract-risk report

## Local Development

```bash
cd web
npm install
npm run build
```

The legacy split `agents/` app is no longer the deployment target.
