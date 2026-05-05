# @bizlegal/nurture-enqueue

Subdomain-side enqueue helper for `lead_nurture_state`. Replaces 5 byte-identical `apps/<sub>/lib/nurture-enqueue.ts` files (Phase AA D8 lift).

## Install

```jsonc
// apps/<subdomain>/package.json
{
  "dependencies": {
    "@bizlegal/nurture-enqueue": "workspace:*"
  }
}
```

The legacy `apps/<sub>/lib/nurture-enqueue.ts` is kept as a thin re-export so existing `@/lib/nurture-enqueue` import paths still work.

## Use

```ts
import { enqueueNurture } from '@bizlegal/nurture-enqueue'
// or, equivalently:
import { enqueueNurture } from '@/lib/nurture-enqueue'

void enqueueNurture({
  lead_id: 'forge-decision-tree-boi-foo@bar.com',
  email: 'foo@bar.com',
  vertical: 'boi',
  source: 'forge:decision-tree',
  lead_classification: { verdict: 'must_file', answers: {/* … */} },
}).catch((err) => console.warn('[nurture] enqueue failed:', err))
```

## Behaviour

- **Idempotent on `lead_id`** — Supabase unique index + `Prefer: resolution=ignore-duplicates` returns success on re-insert.
- **Cross-vertical skip (Phase AA D13, INTEGRATION-V3 B-5)** — by default, if any unarchived `lead_nurture_state` row already exists for the same email, the insert is skipped (returns `true`). Disable with `NURTURE_CROSS_VERTICAL_POLICY=allow_parallel`.
- **Failure-open** — transport errors during the cross-vertical lookup allow the insert to proceed.
- **Fire-and-forget** — never `await` and never let a Supabase blip break the lead-capture POST.

## Env vars (set on each subdomain Vercel project)

| Var | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Hub Supabase URL |
| `SUPABASE_SERVICE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` | yes | Service-role key (TODO: scope to nurture_writer per SECURITY-V3 H-2) |
| `NURTURE_CROSS_VERTICAL_POLICY` | no | `allow_parallel` to disable D13 cross-vertical skip; default = skip |

## Schema

`apps/hub/supabase/migrations/20260505_lead_nurture_state.sql` — single source of truth.

## Caller list (6 subdomains)

- `apps/forge/apps/web` (BOI decision tree + `/api/inbound-lead`)
- `apps/tracr` (wallet-trace decision tree + `/api/inbound-lead`)
- `apps/docai/web` (privacy decision tree + `/api/inbound-lead`)
- `apps/lexaudit` (compliance-monitor decision tree + `/api/inbound-lead`)
- `apps/brai` (sanctions decision tree + `/api/network/intake`)
- `apps/leadforge` (TCPA decision tree)
