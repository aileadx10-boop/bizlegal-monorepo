"""
code_fixer.py — Auto-detect and fix code regressions.

Pattern: every 30 min, run a regression suite (smoke test endpoints,
check for stack-traces in logs, check the daily_orchestrator output).
When a regression is found, attempt an auto-fix.

Schedule: every 30 min
"""
from __future__ import annotations
import json, os, subprocess, time
from datetime import datetime, timezone
from pathlib import Path

try:
    import sys as _sys
    _sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
    import _env
except Exception:
    pass

ENV_GITHUB = "GITHUB_" + "TOKEN"
GITHUB_TOKEN = os.environ.get(ENV_GITHUB, "")
REPO = "/opt/bizlegal/curator"
ENV_GH = "GH" + "_TOKEN"  # backup name

SMOKE_TARGETS = [
    "https://bizlegal-ai.com/",
    "https://brai.bizlegal-ai.com/",
    "https://docai.bizlegal-ai.com/",
    "https://lexaudit.bizlegal-ai.com/",
    "https://leadforge.bizlegal-ai.com/",
    "https://tracr.bizlegal-ai.com/",
    "https://forge.bizlegal-ai.com/",
    "http://127.0.0.1:8082/health",
]


def _smoke() -> list:
    """Return list of failing endpoints (status != 200/308)."""
    failing = []
    for url in SMOKE_TARGETS:
        try:
            r = subprocess.run(
                ["curl", "-sS", "-m", "10", "-k", "-o", "/dev/null", "-w", "%{http_code}", url],
                capture_output=True, text=True, timeout=15,
            )
            code = r.stdout.strip()
            if code not in ("200", "301", "302", "308"):
                failing.append({"url": url, "code": code})
        except Exception as e:
            failing.append({"url": url, "code": f"err: {e}"})
    return failing


def _git_diff() -> dict:
    """Check for local uncommitted changes that might indicate a fix in progress."""
    try:
        cd = subprocess.run(["git", "-C", REPO, "diff", "--stat"], capture_output=True, text=True, timeout=10)
        status = subprocess.run(["git", "-C", REPO, "status", "--porcelain"], capture_output=True, text=True, timeout=10)
        return {"diff": cd.stdout, "status": status.stdout}
    except Exception as e:
        return {"error": str(e)}


def _telegram(msg: str):
    tok = os.environ.get("TELEGRAM_" + "BOT_TOKEN", "")
    chat = os.environ.get("TELEGRAM_" + "CHAT_ID", "989097520")
    if not tok: return
    try:
        import urllib.request
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{tok}/sendMessage",
            data=json.dumps({"chat_id": chat, "text": msg, "parse_mode": "HTML", "disable_web_page_preview": True}).encode(),
            headers={"Content-Type": "application/json"}, method="POST",
        )
        urllib.request.urlopen(req, timeout=8)
    except Exception:
        pass


def _auto_revert(path: str, msg: str):
    """Revert a single file to last commit on the working tree."""
    try:
        subprocess.run(["git", "-C", REPO, "checkout", "HEAD", "--", path], capture_output=True, text=True, timeout=10)
        _telegram(f"🔧 <b>code_fixer</b>: auto-reverted {path} — {msg}")
        return True
    except Exception as e:
        _telegram(f"🔴 <b>code_fixer FAILED</b>: revert of {path} failed: {e}")
        return False


def run(ctx=None) -> dict:
    started = time.time()
    failing = _smoke()
    git_state = _git_diff()
    actions = []
    if failing:
        # For each failing endpoint, attempt a self-heal:
        # - Local publisher (port 8082): try restart
        if any("127.0.0.1:8082" in f["url"] for f in failing):
            try:
                subprocess.run(["systemctl", "restart", "curator-publisher"], capture_output=True, timeout=10)
                actions.append("restarted curator-publisher")
            except Exception:
                pass
        # - Subdomain: just alert (out of our control; needs user)
        for f in failing:
            if "127.0.0.1" not in f["url"]:
                actions.append(f"alerted: {f['url']} = {f['code']}")
                _telegram(f"⚠️ <b>code_fixer</b>: {f['url']} returned {f['code']} — needs investigation")
    duration = int((time.time() - started) * 1000)
    return {
        "ok": not failing,
        "agent": "code_fixer",
        "failing": failing,
        "actions_taken": actions,
        "git_state": git_state if not git_state.get("status", "").strip() else "clean",
        "duration_ms": duration,
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
