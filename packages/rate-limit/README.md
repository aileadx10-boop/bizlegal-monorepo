# @bizlegal/rate-limit

Lightweight in-memory sliding-window rate limiter. **No Redis / Upstash / KV dependency.**

Phase AA D10 — SECURITY-V3 C-1 mitigation. Backstop layer until Turnstile is provisioned on the 6 unauthenticated decision-tree endpoints.

## Install

```jsonc
// apps/<subdomain>/package.json
{
  "dependencies": {
    "@bizlegal/rate-limit": "workspace:*"
  }
}
```

## Use

```ts
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'

export async function POST(req: Request) {
  const ip = clientIpFromHeaders(req.headers) ?? 'unknown'
  const rl = rateLimit('forge-decision-tree-lead', ip, { windowMs: 60_000, limit: 10 })
  if (!rl.ok) {
    return Response.json(
      { error: 'rate_limited', retry_after_ms: rl.retryAfterMs },
      { status: 429, headers: { 'retry-after': String(Math.ceil(rl.retryAfterMs / 1000)) } },
    )
  }
  // … proceed …
}
```

## Tradeoffs

- **Per-instance**: a Vercel function instance can rate-limit traffic it sees, but can't see traffic on sibling instances. For a backstop layer that's acceptable; an attacker fanning out across instances still hits cumulative cost ceilings far faster than they would with no limit.
- **Ephemeral**: when an instance recycles (Vercel cold-start interval), the counter resets.
- **No durable cross-instance counts**: if you need that, swap in `@upstash/ratelimit`. The interface here intentionally matches `{ ok, remaining, retryAfterMs }` so the swap is one-import-line.

## Defaults

| Param | Default | Notes |
|---|---|---|
| `windowMs` | 60_000 (1 min) | Sliding window length |
| `limit` | 10 | Max requests per window per key |
| `maxKeys` | 10_000 | LRU cap; oldest 10% evicted when full |

The decision-tree routes use `{ windowMs: 60_000, limit: 10 }` — generous for a 60-second decision tree, restrictive for a bot.

## Tests

`scripts/_resetForTests()` — clears all stores. Don't import this in production code.
