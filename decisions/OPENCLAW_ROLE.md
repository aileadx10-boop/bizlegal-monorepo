# OPENCLAW_ROLE — Decision matrix (Phase Z6)

**Date:** 2026-05-01
**Audience:** Moses + future agents asking "what is openclaw and why are there 3 installs?"

## TL;DR

OpenClaw is a local Claude Code-like CLI Moses runs on his Windows machine. The 3 installs (`.openclaw`, `.openclaw-minimax`, `.openclaw-ollama`) are local dev tools NOT consumed by any production code in the BizLegal AI fleet. **Recommendation: archive `.openclaw-minimax` and `.openclaw-ollama`; keep `.openclaw` only if Moses still uses it for local subagent runs.**

## Investigation results

### `.openclaw` (main install)

- Path: `C:/Users/Moshe Dor/.openclaw/`
- Config: `openclaw.json` — model defaults: `ollama/deepseek-v4-flash:cloud`
- Fallback: minimax via api.minimax.io
- Has `gateway.auth.token` HARDCODED in the JSON file (a 48-char hex). **⚠ This is a leaked credential in the local config file. Rotate via openclaw cli, then update OPENCLAW_GATEWAY_TOKEN in the canonical vault.**
- Subdirs: `agents/`, `canvas/`, `extensions/`, `identity/`, `qqbot/`, `tasks/`, `workspace/` — full local development environment.
- Last touched: 2026-04-12 per `meta.lastTouchedAt`.

### `.openclaw-minimax` (Minimax-only sandbox)

- Path: `C:/Users/Moshe Dor/.openclaw-minimax/`
- Config: minimal — uses `minimax/MiniMax-M2.7` exclusively, $0.30/M input + $1.20/M output (cheaper than Sonnet for non-reasoning tasks).
- No subagents, no extensions, just the gateway pointed at Minimax.
- Created presumably to test Minimax cost savings.

### `.openclaw-ollama` (local Ollama sandbox)

- Path: `C:/Users/Moshe Dor/.openclaw-ollama/`
- Config: minimal — uses `ollama/qwen3-coder` running at `http://127.0.0.1:11434`.
- Free local inference; presumably used for cheap codegen experiments.

## Production consumption check

| Surface | Consumes openclaw / minimax? |
|---|---|
| `apps/hub/` | No (uses `@anthropic-ai/sdk` directly) |
| `services/hetzner/` (curator) | No — curator uses Anthropic Sonnet + local Ollama via Cloudflare Tunnel, NOT openclaw |
| `services/oci/` (deal-router) | No — only `router/prompts/router.txt` mentions the word "minimax" in prose, not in code |
| `services/worker/` | No |
| Anywhere else | No |

**Vault entries that reference OpenClaw/Minimax:**

- `OPENCLAW_GATEWAY_TOKEN`, `OPENCLAW_MINIMAX_URL`, `OPENCLAW_OLLAMA_URL`, `MINIMAX_API_KEY`

These are PRESENT in the canonical vault but UNUSED by any production code. They're remnants of Moses's local dev exploration.

## Decision

| Asset | Recommendation | Rationale |
|---|---|---|
| `.openclaw` (main) | **KEEP** locally if Moses still runs subagents from it. NOT a monorepo concern. | Local dev tool, no production dep. |
| `.openclaw-minimax` | **ARCHIVE** — rename to `.openclaw-minimax.archive`. | Sandbox not in any flow. |
| `.openclaw-ollama` | **ARCHIVE** — rename to `.openclaw-ollama.archive`. Per Moses 2026-05-01: "if it is not related to the telegram bot it is better". | Same: sandbox not in any flow. |
| `OPENCLAW_GATEWAY_TOKEN` (vault) | **ROTATE** the hex (it's hardcoded in `~/.openclaw/openclaw.json`) + remove from vault if no production code reads it. | Defensive — hardcoded credentials in config files are a leak vector. |
| `OPENCLAW_MINIMAX_URL` + `OPENCLAW_OLLAMA_URL` (vault) | **REMOVE** from vault. | No consumer. Audit-vault hook will refuse to add them back unless real code references them. |
| `MINIMAX_API_KEY` (vault) | **KEEP** — Moses might wire it later as a brain.py fallback model for curator (cheaper than Sonnet for some passes). Mark optional. | Future-proof; harmless to keep an unused key in the vault. |

## Action items (Moses)

1. **Rotate** `OPENCLAW_GATEWAY_TOKEN` via openclaw CLI (the hex currently lives in `~/.openclaw/openclaw.json` line ~16).
2. **Archive** the two sandbox installs:
   ```bash
   mv ~/.openclaw-minimax ~/.openclaw-minimax.archive
   mv ~/.openclaw-ollama ~/.openclaw-ollama.archive
   ```
3. **Remove from canonical vault** (open `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt`):
   - Delete `OPENCLAW_GATEWAY_TOKEN=...`
   - Delete `OPENCLAW_MINIMAX_URL=...`
   - Delete `OPENCLAW_OLLAMA_URL=...`
   - Keep `MINIMAX_API_KEY=...` (mark with `# optional, future curator fallback`)
4. **Verify** no production code breaks: `pnpm audit:vault` from monorepo root should still pass.

## Ollama tunnel decision (Phase Z6.3)

**Old:** `OLLAMA_TUNNEL_URL=https://curator.bizlegal-ai-internal.com` (Cloudflare Tunnel exposing laptop's `localhost:11434`).

**Status (per Moses audit 2026-05-01):** "root tunnel was deleted, there is a different tunnel".

**Action:** Moses to:

1. Open Cloudflare One → Zero Trust → Networks → Tunnels.
2. Find the active replacement tunnel.
3. Confirm the public URL (likely `curator-gpu.bizlegal-ai-internal.com` or similar).
4. Update `OLLAMA_TUNNEL_URL` in the canonical vault.
5. SSH Hetzner: `nano /opt/bizlegal/curator/.env` → update `OLLAMA_TUNNEL_URL` → save.
6. `sudo systemctl restart curator-scout.service curator-bot.service curator-publisher.service`.
7. Within 10 min: confirm `heartbeat` events flow on `/ops` from `curator/scout`, `curator/bot`, `curator/publisher`. If absent → tunnel still misconfigured; check Cloudflare Tunnel logs.

If laptop is offline at the time the curator runs, scout will fail Ollama calls and skip the run gracefully (metadata `firecrawl_enriched: 0`, no error). That's fine — the next run picks up.

## Future state (post-Z7)

When Moses tackles V3-V7 agents (post-Z7-green-for-24h gate), Minimax could become the cheap-tier for:

- Bulk content generation (curator brain.py — Sonnet for verified output, Minimax for first-draft + outline)
- Bulk lead scoring (cheaper than Haiku at scale)
- DAO Wrapper Picker (V2.3 — currently parked) — would benefit from a cheap reasoning model

Until then: Minimax stays as a vault-only optional key, no code path reads it.
