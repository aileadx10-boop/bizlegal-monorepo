"""_env.py — shared env accessor for Python agents.

Lives at the repo root (deployed to /opt/bizlegal/curator/_env.py on
Hetzner). Agents insert the repo root into sys.path and `import _env`.

Loads .env from the repo root when a variable is missing from the
process environment (cron lines already `set -a && . ./.env`, so this
is a fallback for manual runs and systemd units without EnvironmentFile).
"""
from __future__ import annotations
import os
from pathlib import Path

_ENV_FILE = Path(__file__).resolve().parent / ".env"
_loaded = False


def _load_dotenv_once() -> None:
    global _loaded
    if _loaded or not _ENV_FILE.exists():
        _loaded = True
        return
    try:
        for line in _ENV_FILE.read_text(encoding="utf-8", errors="replace").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            k, v = k.strip(), v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v
    except OSError:
        pass
    _loaded = True


def _get(*names: str) -> str:
    _load_dotenv_once()
    for n in names:
        v = os.environ.get(n, "")
        if v:
            return v
    return ""


def get_supabase() -> tuple[str, str]:
    """Return (url, service_key) — empty strings when unset."""
    url = _get("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
    key = _get("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY", "SUPABASE_SECRET")
    return url, key


def get_resend_key() -> str:
    return _get("RESEND_API_KEY")


def get_anthropic_key() -> str:
    return _get("ANTHROPIC_API_KEY")


def get_telegram() -> tuple[str, str]:
    """Return (bot_token, chat_id)."""
    return _get("TELEGRAM_BOT_TOKEN", "BIZLEGALBOT_TOKEN"), _get("TELEGRAM_CHAT_ID")
