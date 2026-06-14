# Deployment Map — compliance-arbitrage (Hetzner)

> Authoritative box facts as of 2026-06-14.  
> **Trust this file over any doc that references `/opt/bizlegal-monorepo` or `curator-brain`.**

---

## Box

| Field | Value |
|---|---|
| Hostname | compliance-arbitrage |
| Provider | Hetzner Cloud |
| Type | CX33 (4 vCPU, 8 GB RAM) |
| OS | Ubuntu |
| IP | 204.168.209.235 |
| SSH | `ssh -i ~/.ssh/id_ed25519 root@204.168.209.235` |
| Uptime | 58+ days (as of 2026-06-14) |

---

## File layout

```
/opt/bizlegal/
├── curator/
│   ├── .env              ← single env file for ALL curator services
│   ├── scout.py          ← daily 06:00 UTC RSS → Ollama → Supabase
│   ├── brain.py          ← Anthropic MDX draft
│   ├── publisher.py      ← FastAPI :8082
│   ├── bot.py            ← Telegram long-poll handler
│   ├── auto_pick.py      ← daily 10:00 UTC fallback picker
│   ├── firecrawl_enrich.py ← httpx+trafilatura enrichment (no API key)
│   └── ops_log.py        ← HMAC event poster to hub
├── venv/                 ← Python virtualenv (/opt/bizlegal/venv/bin/python)
├── scripts/
│   └── fix-hetzner-inbound-secret.sh
├── n8n/                  ← n8n data volume
├── marimo/               ← marimo notebooks
├── docker-compose.yml    ← n8n + marimo containers
└── start.sh              ← `docker compose up -d` only (curator is systemd)
```

**IMPORTANT: `/opt/bizlegal` is NOT a git repo.** There is no `git pull` on this box.  
Deploy by SCP'ing files from the monorepo, then restarting affected services.

---

## Docker containers (managed by docker compose)

| Container | Image | Host port | Status |
|---|---|---|---|
| n8n | n8nio/n8n:latest | :5678 | Up 8+ weeks, restart=always |
| marimo | ghcr.io/marimo-team/marimo | :8080 | Up 8+ weeks, restart=always |

Start: `cd /opt/bizlegal && docker compose up -d`

---

## Curator systemd units (root-level, /etc/systemd/system/)

| Unit | Type | Schedule / Trigger | Port |
|---|---|---|---|
| curator-publisher | simple | on-boot, auto-restart | :8082 (127.0.0.1 only) |
| curator-bot | simple | on-boot, auto-restart | — (Telegram long-poll) |
| curator-scout | oneshot | timer: daily 06:00 UTC | — |
| curator-auto-pick | oneshot | timer: daily 10:00 UTC | — |

Useful commands:
```bash
systemctl status curator-publisher curator-bot
journalctl -u curator-scout --since today
systemctl reset-failed curator-auto-pick   # clear failed state after fix
```

---

## Ollama

| Field | Value |
|---|---|
| Port | :11434 (localhost) |
| Active model | mistral-nemo (7.1 GB) |
| Env vars | OLLAMA_FILTER_MODEL=mistral-nemo, OLLAMA_RANK_MODEL=mistral-nemo |

---

## openclaw-gateway

| Field | Value |
|---|---|
| User | bizlegal |
| Systemd | `~/.config/systemd/user/openclaw-gateway.service` (user unit) |
| Linger | enabled (`loginctl enable-linger bizlegal` — already set) |
| Status | Enabled + running since 2026-06-01 |

---

## Deploy runbook

### Curator Python file change
```bash
# 1. Edit file in monorepo (on dev machine)
# 2. SCP to box
scp -i ~/.ssh/id_ed25519 \
  services/hetzner/<file>.py \
  root@204.168.209.235:/opt/bizlegal/curator/<file>.py

# 3. Restart affected service(s)
ssh -i ~/.ssh/id_ed25519 root@204.168.209.235 \
  "systemctl restart curator-publisher"  # or curator-bot
```

### Env var change
```bash
ssh -i ~/.ssh/id_ed25519 root@204.168.209.235
# Edit /opt/bizlegal/curator/.env
# Then: systemctl restart curator-bot curator-publisher
```

### New Python dep
```bash
ssh -i ~/.ssh/id_ed25519 root@204.168.209.235 \
  "/opt/bizlegal/venv/bin/pip install <package>"
# Also add to services/hetzner/requirements.txt in the monorepo
```

### Container change
```bash
ssh -i ~/.ssh/id_ed25519 root@204.168.209.235 \
  "cd /opt/bizlegal && docker compose pull && docker compose up -d"
```

---

## What does NOT exist on this box

- `/opt/bizlegal-monorepo` — does not exist, never created
- `curator-brain` systemd unit — does not exist (brain.py runs inline from bot.py callbacks)
- n8n on port :5679 — n8n runs on :5678
- Caddy reverse proxy — not installed
- Firecrawl API key in .env — was removed (enrichment now runs locally via trafilatura)
