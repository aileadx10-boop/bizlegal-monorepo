# services/agents — CLAUDE.md

**Purpose:** THE MACHINE — the Hetzner WAT agent fleet (9 agents: enrichment, headhunter, lead_capture, content, socials, code, newsletter, monetization, signal_scout). Orchestrated by `orchestrator.py`, dispatched via `crontab -l` on the Hetzner CX33. Authoritative index: `agents/AGENTS.md` (O6 — keep it current).

**Key files:** `registry.py` (env registry), `_env.py` (safe env getters — use these, never raw `os.environ`, in new agents), `orchestrator.py` (dispatch + heartbeat). Logs: `/opt/bizlegal/curator/logs/machine/`.

**Envs:** `OLLAMA_FAST_MODEL`, `WEBHOOK_DEV_MODE`, `REPO_PATH`, `VAULT_PATH` (+ standard Supabase/Telegram/Anthropic names via `_env.py`). Several v2 agents build names with `chr()` concatenation (legacy Hermes write_file workaround) — write plain literals in new code.

**Deploy:** NO git on the box. SCP changed files: `scp -i ~/.ssh/id_ed25519 services/agents/<file>.py root@204.168.209.235:/opt/bizlegal/curator/` then restart per `decisions/DEPLOYMENT_MAP.md`.

**Outbound discipline:** nothing outbound runs here (`services/cron_jobs.txt` is untouched per rule 7 v2); no sends, ever, from this fleet.
