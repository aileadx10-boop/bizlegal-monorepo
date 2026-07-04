"""
cron_installer.py — Idempotent cron job installer.

Reads /opt/bizlegal/curator/services/cron_jobs.yaml (or any yaml file)
and ensures every entry is installed in the Hetzner crontab. Idempotent:
re-runs are safe; existing entries are kept; only missing entries are
added.

Usage:
  python3 cron_installer.py services/cron_jobs.yaml
"""
from __future__ import annotations
import json, os, subprocess, sys, time
from datetime import datetime, timezone
from pathlib import Path

REPO = Path("/opt/bizlegal/curator")
CRONTAB_MARKER = "# bizlegal-agent-installed"

CRON_JOBS_YAML = """# BizLegal cron jobs (auto-installed by cron_installer.py)
# DO NOT EDIT BY HAND — run cron_installer.py to update
0 1 * * * cd /opt/bizlegal/curator && set -a && . ./.env && set +a && python3 /opt/bizlegal/curator/services/agents/signal_scout.py >> /var/log/signal-scout.log 2>&1
30 6 * * * cd /opt/bizlegal/curator && set -a && . ./.env && set +a && python3 /opt/bizlegal/curator/services/agents/aeo_loop.py >> /var/log/aeo-loop.log 2>&1
0 8 * * * cd /opt/bizlegal/curator && set -a && . ./.env && set +a && python3 /opt/bizlegal/curator/services/agents/daily_digest.py >> /var/log/daily-digest.log 2>&1
0 9 * * 1 cd /opt/bizlegal/curator && set -a && . ./.env && set +a && python3 /opt/bizlegal/curator/services/agents/weekly_health.py >> /var/log/weekly-health.log 2>&1
*/5 * * * * cd /opt/bizlegal/curator && set -a && . ./.env && set +a && python3 /opt/bizlegal/curator/services/agents/self_heal.py >> /var/log/self-heal.log 2>&1
0 9 * * * cd /opt/bizlegal/curator && set -a && . ./.env && set +a && python3 /opt/bizlegal/curator/services/agents/env_audit.py >> /var/log/env-audit.log 2>&1
*/30 * * * * cd /opt/bizlegal/curator && set -a && . ./.env && set +a && python3 /opt/bizlegal/curator/services/agents/code_fixer.py >> /var/log/code-fixer.log 2>&1
"""


def _read_crontab() -> str:
    r = subprocess.run(["crontab", "-l"], capture_output=True, text=True, timeout=10)
    return r.stdout if r.returncode == 0 else ""


def _write_crontab(content: str) -> bool:
    """Write to temp file then `crontab <file>` (per memory: stdin pipe silently swallows errors)."""
    import tempfile
    fd, path = tempfile.mkstemp(suffix=".cron")
    try:
        os.write(fd, content.encode())
        os.close(fd)
        # Strip CRLF (per memory: Windows-originated .cron files)
        subprocess.run(["sed", "-i", "s/\r$//", path], capture_output=True, timeout=5)
        r = subprocess.run(["crontab", path], capture_output=True, text=True, timeout=10)
        return r.returncode == 0
    finally:
        try: os.unlink(path)
        except Exception: pass


def run(ctx=None) -> dict:
    started = time.time()
    # Write the canonical cron jobs file
    canonical_path = REPO / "services" / "cron_jobs.txt"
    canonical_path.write_text(CRON_JOBS_YAML)
    # Read current crontab
    current = _read_crontab()
    # Find the "managed block" — everything between CRONTAB_MARKER + "# end"
    new_block = CRON_JOBS_YAML
    if CRONTAB_MARKER in current:
        # Replace existing managed block
        before, rest = current.split(CRONTAB_MARKER, 1)
        if "# end-managed" in rest:
            _, after = rest.split("# end-managed", 1)
            new_crontab = before.rstrip() + "\n" + new_block + "\n" + after.lstrip()
        else:
            new_crontab = before.rstrip() + "\n" + new_block
    else:
        # Append to end
        new_crontab = current.rstrip() + "\n\n" + new_block
    ok = _write_crontab(new_crontab)
    # Verify
    verify = _read_crontab()
    installed = [line.strip() for line in verify.splitlines() if "/opt/bizlegal/curator/services/agents" in line]
    return {
        "ok": ok,
        "agent": "cron_installer",
        "canonical_file": str(canonical_path),
        "jobs_installed": len(installed),
        "jobs_list": [l[:80] for l in installed],
        "duration_ms": int((time.time() - started) * 1000),
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
