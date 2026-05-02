# AI Legal Risk Intelligence Funnel

Text-first Fastify backend for the legal-risk funnel:

- `POST /webhook/comment` -> comment trigger and DM handoff
- `POST /webhook/reply` -> qualification capture and grounded AI prescan
- `POST /webhook/payment-success/lemon` / `POST /webhook/payment-success/paypal` -> paid full analysis
- `POST /uploads/request` / `POST /uploads/complete` -> signed Firebase Storage document ingestion
- `GET /health` -> service health

## Design System

Report delivery follows the white Forge design language from:

- `C:/Users/Moshe Dor/Downloads/SKOOL-NATE/LANDING PAGES/-1234/forge-v1-white.html`

That theme is applied to the generated report HTML and PDF styling through `src/utils/design-theme.ts`.

## Environment

Copy `.env.example` to `.env` and fill in:

- Firebase Admin credentials and storage bucket
- `WEBHOOK_HMAC_SECRET`
- MiniMax credentials and model settings
- Ollama base URL and model
- LemonSqueezy keys, store id, variant id, webhook secret
- PayPal client id, client secret, webhook id
- Notion API key and destination database id

## Run

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
npm run build
```

## VPS Deployment

1. Provision a small Ubuntu VPS with Node.js 22+, `pm2`, and `nginx`.
2. Install and run Ollama locally on the VPS, then pull the configured model:
   `ollama pull llama3.1`
3. Copy the project to the server and create `.env`.
4. Install dependencies and build:
   `npm install && npm run build`
5. Run the app behind `pm2`:
   `pm2 start dist/server.js --name legal-risk-funnel`
6. Put `nginx` in front for TLS termination and proxy to `localhost:$PORT`.
7. Point upstream webhook providers to the HTTPS endpoints.
8. Store Firebase, Lemon, PayPal, MiniMax, and Notion secrets only in environment variables.

## Notes

- All AI output includes `This is not legal advice.`
- The anti-hallucination layer enforces evidence references and downgrades weak outputs to `Needs Human Review`.
- PayPal is fallback-only; LemonSqueezy is the primary checkout path.
