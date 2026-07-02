# @bizlegal/ops-heartbeat

Drop-in heartbeat client for any BizLegal service.

Part of PLATFORM-BUILD-2026-07-02 Phase 1 (live process inspection).

## TypeScript / Node

```ts
import { Heartbeat, pingOnce } from '@bizlegal/ops-heartbeat'

const hb = new Heartbeat('hetzner/headhunter', { parent: 'cron:headhunter' })
hb.start()
hb.action('crawling leads', { status: 'ok', queueDepth: 42 })
// ... later
hb.stop()

// For short-lived scripts:
await pingOnce('hetzner/manual-cron', { status: 'alive', lastAction: 'finished' })
```

## Python

```python
from ops_heartbeat import Heartbeat, heartbeat_context, ping_once

# Long-lived service with background thread:
hb = Heartbeat('hetzner/headhunter', parent='cron:headhunter')
hb.start()
hb.action('crawling leads', status='ok', queue_depth=42)
# ... later
hb.stop()

# Context manager:
with heartbeat_context('hetzner/headhunter') as hb:
    hb.action('starting')
    do_work()
    hb.action('done', status='ok')

# One-shot for short scripts:
ping_once('hetzner/manual-cron', status='alive', last_action='finished')
```

## Env

- `HETZNER_HUB_URL` — default `https://bizlegal-ai.com`
- `BIZLEGAL_INBOUND_SECRET` — HMAC secret (same as /api/ops/log). If missing, heartbeat is a no-op.
- `OPS_HEARTBEAT_INTERVAL` — seconds, default 60
- `OPS_HEARTBEAT_TIMEOUT` — Python only, default 8s
- `OPS_HEARTBEAT_TIMEOUT_MS` — TS only, default 8000ms

## Service name format

`<surface>/<name>` — e.g. `hetzner/headhunter`, `hub/api`, `worker/inbound`.
The `surface/` prefix is what the operator dashboard uses to group services.

## Guarantees

- Heartbeat failure NEVER crashes the calling service. The post is wrapped in try/except.
- Background thread (Python) and `setInterval` (Node) are daemon-style — they don't block process exit.
- Final ping on `stop()` so the dashboard sees the "stopping" state instead of a sudden silence.
