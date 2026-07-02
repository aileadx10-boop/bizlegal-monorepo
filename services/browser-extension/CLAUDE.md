# services/browser-extension — BizLegal AI Compliance Capture Extension

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

Manifest V3 browser extension (Chrome + Firefox) for capturing regulatory content and sending it to BizLegal AI agents.

## Files

- `manifest.json` — Manifest V3 (no icon files required for unpacked load)
- `popup.html` / `popup.js` — 4-button dark popup: Capture Page, Analyze Contract, Check Compliance, Track Wallet
- `content-script.js` — injected at `document_idle`; returns page text and selection
- `background.js` — MV3 service worker; context menus + capture POST on right-click
- `icons/README.md` — icon size guidance (16/48/128 PNG required for Web Store submission)

## How to load unpacked (Chrome)

1. `chrome://extensions` → Enable Developer Mode
2. Click "Load unpacked" → select this directory

## Hub endpoint

POST `https://bizlegal-ai.com/api/extension/capture` — accepts `{ url, title, text, action }`.
Writes to `extension_captures` Supabase table (migration: `apps/hub/supabase/migrations/20260703_extension_captures.sql`).

## Deploy to Web Store

Once icons are added: `npm run pack` → upload `bizlegal-extension.zip` to Chrome Web Store.
