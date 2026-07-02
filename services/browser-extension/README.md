# BizLegal AI Compliance Capture — Browser Extension

Manifest V3 extension for Chrome and Firefox that lets users capture compliance data from any web
page and route it to BizLegal AI agents for analysis.

## What it does

| Button | Action |
|--------|--------|
| Capture Page | Sends the current page's full text + URL to BizLegal agents via `/api/extension/capture` |
| Analyze Contract | Gets your selected text and opens DocAI (`docai.bizlegal-ai.com/?ref=extension`) |
| Check Compliance | Opens the BRAI website compliance scanner pre-filled with the current URL |
| Track Wallet | Takes your selected ETH address and opens Tracr (`tracr.bizlegal-ai.com/?address=…&ref=extension`) |

Right-click context menus mirror the same four actions on any page.

Capture events are logged to the `extension_captures` Supabase table and visible in the `/ops/live`
stream at `bizlegal-ai.com/ops/live`.

## Load unpacked in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (toggle top-right)
3. Click **Load unpacked**
4. Select the `services/browser-extension/` directory

The extension will appear in your toolbar. Pin it for quick access.

## Load in Firefox (Developer Edition)

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `services/browser-extension/manifest.json`

Note: Firefox temporary add-ons are removed on browser restart.

## Build a distributable zip

```bash
cd services/browser-extension
npm run pack
# → bizlegal-extension.zip ready for Chrome Web Store upload
```

## API key (optional)

Open Settings from the popup footer. Paste your BizLegal API key to tag captures to your account.
Without a key, captures are stored anonymously and rate-limited to 10 per IP per minute.

## Capture log

All captures are visible at: `https://bizlegal-ai.com/ops/live`
(requires `OPS_DASHBOARD_TOKEN` query param — Moses only)
