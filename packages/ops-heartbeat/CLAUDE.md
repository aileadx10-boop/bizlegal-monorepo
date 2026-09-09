# ops-heartbeat — CLAUDE.md

**Purpose:** shared heartbeat client (TS `src/` + Python `python/`) — services ping hub `/api/ops/heartbeat` so `/ops/health` shows live vs. dead per surface (PLATFORM-BUILD P1). See README.md for API.

**Envs:** `HETZNER_HUB_URL` (default `https://bizlegal-ai.com`), `GIT_SHA` (version tag), `OPS_HEARTBEAT_INTERVAL` (default 60s), `OPS_HEARTBEAT_TIMEOUT` (python, default 8s) / `OPS_HEARTBEAT_TIMEOUT_MS` (TS). The HMAC secret is read via `"BIZ" + "LEGAL_INBOUND_SECRET"` concat (legacy workaround) — resolves to the canonical `BIZLEGAL_INBOUND_SECRET`.

**Deploy:** library package — callers bundle it; no standalone deploy.
