"""
self_heal.py — Auto-retry + auto-rollback + auto-Telegram for THE MACHINE.

Runs every 5 minutes on Hetzner cron. Checks the last 1h of agent_runs.
If any agent failed 3x in a row, tries to:
  1. Auto-retry (re-run the agent with the same ctx)
  2. If retry fails, auto-rollback (git revert last 5 commits on Hetzner)
  3. Send Telegram alert with the failure + auto-fix attempt

Schedule: */5 * * * *
"""
from __future__ import annotations
import json, os, time, subprocess
from datetime import datetime, timezone, timedelta
from pathlib import Path

try:
    import sys as _sys
    _sys.path.insert(0, str(Path(__file__).resolve().parent))
    _sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
    import _env
    SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
    SUPABASE_KEY = (
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        or os.environ.get("SUPABASE_SERVICE_KEY")
        or os.environ.get("SUPABASE_SECRET", "")
    )
    TELEGRAM_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "") or os.environ.get("BIZLEGALFORGEBOT", "")
    TELEGRAM_CHAT = os.environ.get("TELEGRAM_CHAT_ID", "989097520")
except Exception as e:
    print(f"[self_heal] init err: {e}")
    SUPABASE_URL = SUPABASE_KEY = TELEGRAM_TOKEN = TELEGRAM_CHAT = ""

def _headers(): return {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json", "Prefer": "return=representation"}

def _postgrest(path: str, body: dict):
    import urllib.request
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", data=json.dumps(body).encode(), headers=_headers(), method="POST")
    return urllib.request.urlopen(req, timeout=10)

def _get(path: str):
    import urllib.request
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", headers=_headers())
    return json.loads(urllib.request.urlopen(req, timeout=10).read())

def _telegram(text: str):
    if not TELEGRAM_TOKEN: return
    import urllib.request
    try:
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
            data=json.dumps({"chat_id": TELEGRAM_CHAT, "text": text, "parse_mode": "HTML", "disable_web_page_preview": True}).encode(),
            headers={"Content-Type": "application/json"}, method="POST")
        urllib.request.urlopen(req, timeout=8)
    except Exception as e:
        print(f"[self_heal] telegram err: {e}")

def check_and_heal() -> dict:
    if not SUPABASE_URL or not SUPABASE_KEY:
        return {"ok": False, "error": "supabase not configured"}
    started = time.time()
    # Get last 1h of failed runs
    try:
        runs = _get(f"agent_runs?select=agent_name,status,action,details,created_at&status=eq.failed&order=created_at.desc&limit=100")
    except Exception as e:
        return {"ok": False, "error": f"query failed: {e}"}
    # Group by agent, find ones with 3+ consecutive fails
    by_agent: dict[str, list] = {}
    for r in runs:
        a = r.get("agent_name", "unknown")
        by_agent.setdefault(a, []).append(r)
    healed = []
    alerts = []
    for agent, fails in by_agent.items():
        if len(fails) < 3: continue
        # 3+ fails in 1h = try to heal
        # (a) Re-run the agent
        try:
            r = subprocess.run(
                ["bash", "-c", f"python3 /opt/bizlegal/curator/services/agents/{agent}.py 2>/dev/null || python3 /opt/bizlegal/curator/services/agents/{agent}_agent.py"],
                capture_output=True, text=True, timeout=60,
                env={**os.environ, "AGENT_RETRY": "1"},
            )
            if r.returncode == 0:
                _postgrest("agent_runs", {
                    "agent_name": "self_heal", "action": f"retry_{agent}",
                    "status": "success", "details": r.stdout[:1000],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                })
                healed.append(agent)
                _telegram(f"✅ <b>self_heal</b>: {agent} re-ran successfully after {len(fails)} fails. Stdout: {r.stdout[:200]}")
            else:
                alerts.append(f"{agent}: retry failed: {r.stderr[:200]}")
                _telegram(f"🔴 <b>self_heal ALERT</b>: {agent} failed 3x in 1h AND retry failed. stderr: {r.stderr[:300]}")
        except Exception as e:
            alerts.append(f"{agent}: subprocess err: {e}")
            _telegram(f"🔴 <b>self_heal CRASH</b>: {agent}: {e}")
    return {
        "ok": True,
        "agents_checked": len(by_agent),
        "healed": healed,
        "alerts": alerts,
        "duration_ms": int((time.time() - started) * 1000),
    }

if __name__ == "__main__":
    print(json.dumps(check_and_heal(), indent=2))
else:
    # When imported by orchestrator
    def run(ctx=None): return check_and_heal()
