# @bizlegal/turnstile-verify

Server-side Cloudflare Turnstile verifier. **Skip-if-not-configured** semantics so dev + pre-launch deploys keep working without a Turnstile account.

Phase AA D9 — INTEGRATION-V3 F-2 mitigation.

## Install

```jsonc
// apps/<subdomain>/package.json
{
  "dependencies": {
    "@bizlegal/turnstile-verify": "workspace:*"
  }
}
```

## Use

```ts
import { verifyTurnstile, clientIpFromHeaders } from '@bizlegal/turnstile-verify'

export async function POST(req: Request) {
  const body = await req.json()
  const turnstile = await verifyTurnstile({
    token: body.turnstile_token,
    clientIp: clientIpFromHeaders(req.headers),
  })
  if (!turnstile.ok) {
    return Response.json(
      { error: 'turnstile_failed', codes: turnstile.errorCodes },
      { status: 403 },
    )
  }
  // … proceed with the request …
}
```

## Skip-if-not-configured

When `TURNSTILE_SECRET_KEY` is unset on the server, the verifier returns `{ ok: true, skipped: true }`. This means:

- Dev environments without Turnstile keys behave as before.
- Pre-launch deploys can ship the integration without first creating a Turnstile site.
- Setting the secret on Vercel later flips enforcement on with no code change.

To enable enforcement, provision a Turnstile site (https://dash.cloudflare.com → Turnstile → Add site) and set both:

| Var | Where | Notes |
|---|---|---|
| `TURNSTILE_SECRET_KEY` | server-only | private; never exposed to the client |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | client-readable | required for the React widget to render |

The matching React widget lives in `@bizlegal/turnstile-widget`.

## Failure modes

| Result | Meaning |
|---|---|
| `{ok: true, skipped: true}` | Server has no `TURNSTILE_SECRET_KEY` configured |
| `{ok: true}` | Token verified by Cloudflare |
| `{ok: false, errorCodes: ['missing-input-response']}` | Client did not send a token |
| `{ok: false, errorCodes: ['network-…']}` | Reach failure to Cloudflare |
| `{ok: false, errorCodes: ['http-NNN']}` | Cloudflare returned non-2xx |
| `{ok: false, errorCodes: [<cf code>]}` | Cloudflare-specific failure (timeout-or-duplicate, invalid-input-secret, etc.) |
