# packages/bizlegal-debug — BizLegal debug shim

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

Python debug shim for BizLegal services: trace replay, breakpoints, and mock surface toggling.

## Contents

- `python/bizlegal_debug.py` — stdlib-only debug shim. Exports: `debug_context`, `set_breakpoint`, `is_mocked`, `replay_trace`.
- `package.json` — package manifest (`@bizlegal/debug`)

## Usage

```python
from bizlegal_debug import debug_context

with debug_context("hetzner/headhunter", trace_id="tr_abc") as ctx:
    ctx.checkpoint("starting", data={"leads": 0})
    # ... work ...
    ctx.checkpoint("done", data={"leads": 42})
```

## Envs required

- `HETZNER_HUB_URL` (default: `https://bizlegal-ai.com`)
- `BIZLEGAL_INBOUND_SECRET` — for HMAC-signed heartbeats
- `OPS_DASHBOARD_TOKEN` — for breakpoint/mock API calls
