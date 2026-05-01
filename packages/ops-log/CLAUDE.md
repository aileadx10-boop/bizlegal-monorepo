# @bizlegal/ops-log

Shared HMAC-signed event POST to hub `/api/ops/log`. Single canonical implementation for the entire BizLegal AI fleet.

**Two parallel implementations** (intentional):

- **TypeScript** (`src/index.ts`) — used by all `apps/` (Next.js Vercel) and `services/worker/` (Cloudflare Worker, with a runtime-specific HMAC variant in worker code). Builds to `dist/index.{js,d.ts}`. Import via `import { logEvent, logEventAsync, type OpsEventType } from '@bizlegal/ops-log'`.
- **Python sibling** (`python/ops_log.py`) — used by `services/hetzner/` (curator) and `services/oci/` (deal-router). Plain `httpx` POST, identical wire format. Import via `from packages.ops_log.python.ops_log import log_event` (or pyproject.toml workspace path).

Wire format: same HMAC-SHA256 over JSON body, header `x-bizlegal-signature: <hex>`. Hub `/api/ops/log` verifies and inserts into `ops_events` table.

## Envs (must be in canonical vault)

| Var | Where | Purpose |
|---|---|---|
| `BIZLEGAL_INBOUND_SECRET` | every consumer | HMAC key (same hex everywhere) |
| `OPS_LOG_URL` | optional | override target (defaults to `https://bizlegal-ai.com/api/ops/log`) |

## Build + use

```bash
# Build (or `pnpm turbo run build` from monorepo root):
cd packages/ops-log && pnpm build

# Use in an app:
# apps/<x>/package.json:  "@bizlegal/ops-log": "workspace:*"
import { logEventAsync } from '@bizlegal/ops-log'
logEventAsync({ type: 'payment.confirmed', source: 'hub', amount_cents: 14900 })
```

## Adding a new event type

1. Edit `src/index.ts` — append to `OpsEventType` union
2. Edit `apps/hub/app/api/ops/log/route.ts` — append to `ALLOWED_TYPES` Set
3. Update `agents/AGENTS.md` event-type table
4. The pre-commit hook does NOT currently enforce this third step — discipline is on the author. Suggested follow-up: extend `audit-operating-book.mjs` to scan for new event types vs the AGENTS.md table.

## Failure mode

`logEventAsync` swallows errors (returns void without throwing). `logEvent` returns `Promise<void>` and only logs `console.warn` on failure. **Telemetry never breaks user flows.**
