# services/coguard-worker — CoGuard CF Email Routing Worker

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

Cloudflare Worker: receives emails forwarded by subscribers via CF Email Routing, looks up the subscriber from COGUARD_ALIASES KV, and fires OCI /coguard/process (HMAC-signed, ctx.waitUntil). Returns 200 immediately so CF Email Routing doesn't retry.

**KV:** `COGUARD_ALIASES` binding — key = alias UUID, value = subscriber_id. Written by apps/coguard /api/provision route.

**Secrets:** `WEBHOOK_SHARED_SECRET` (= BIZLEGAL_INBOUND_SECRET), `CF_COGUARD_ROUTING_TOKEN`.

**Deploy:** `cd services/coguard-worker && pnpm wrangler deploy`
