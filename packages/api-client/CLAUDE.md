# @bizlegal/api-client

Type-safe Node.js client for BizLegal Hub API. Part of Phase 2 of PLATFORM-BUILD-2026-07-02.

**Node.js only** — uses `node:crypto` for HMAC signing. Not browser-safe.

## Use

```ts
import { BizLegalClient } from '@bizlegal/api-client'

const client = new BizLegalClient({
  inboundSecret: process.env.BIZLEGAL_INBOUND_SECRET,
})

await client.opsHeartbeat({ service: 'oci/deal-router', status: 'alive' })
const live = await client.opsLive(process.env.OPS_DASHBOARD_TOKEN)
```

## Envs

| Var | Purpose |
|---|---|
| `BIZLEGAL_INBOUND_SECRET` | HMAC signing key (required for HMAC endpoints) |
| `HUB_BASE_URL` | Override hub URL (defaults to `https://bizlegal-ai.com`) |
