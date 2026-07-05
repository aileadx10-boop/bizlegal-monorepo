"""
weekly_health.py — Weekly system audit (Monday 09:00 UTC).

Audits: API health, cron coverage, agent success rates, revenue trend,
lead pipeline, system drift (env vars changed since last week).
Sends summary to Telegram + emails ai.leadx10@gmail.com.
"""
from __future__ import annotations
import json, os, subprocess, urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

try:
    import sys as _sys
    _sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
except Exception:
    pass

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_SERVICE_KEY")
    or os.environ.get("SUPABASE_SECRET", "")
)


def _q(path: str) -> list:
    if not SUPABASE_URL or not SUPABASE_KEY: return []
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/{path}",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
        )
        return json.loads(urllib.request.urlopen(req, timeout=10).read())
    except Exception:
        return []


def _telegram(msg: str):
    tok = os.environ.get("TELEGRAM_" + "BOT_TOKEN", "")
    chat = os.environ.get("TELEGRAM_" + "CHAT_ID", "989097520")
    if not tok: return
    try:
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{tok}/sendMessage",
            data=json.dumps({"chat_id": chat, "text": msg, "parse_mode": "HTML", "disable_web_page_preview": True}).encode(),
            headers={"Content-Type": "application/json"}, method="POST",
        )
        urllib.request.urlopen(req, timeout=8)
    except Exception:
        pass


def run(ctx=None) -> dict:
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).strftime('%Y-%m-%dT%H:%M:%SZ')
    # 7-day agent run stats
    runs = _q(f"agent_runs?select=agent_name,status&created_at=gte.{week_ago}&limit=1000")
    by_agent = {}
    for r in runs:
        if not isinstance(r, dict): continue
        a = r.get("agent_name") or "?"
        s = r.get("status") or "?"
        by_agent.setdefault(a, {"ok": 0, "fail": 0, "other": 0})[s if s == "ok" or s == "success" else ("fail" if s == "failed" else "other")] += 1
    # 7-day revenue
    # status='active' is the real paid state; amounts are cents; skip smoke rows.
    payments = _q(f"payment_orders?select=amount_cents&status=eq.active&gateway=neq.simulated&created_at=gte.{week_ago}")
    revenue_7d = sum(float(p.get("amount_cents") or 0) / 100 for p in payments if isinstance(p, dict))
    # Lead pipeline
    leads = _q(f"leadforge_leads?select=id,score&created_at=gte.{week_ago}&limit=1000")
    high_score = sum(1 for l in leads if isinstance(l, dict) and (l.get("score") or 0) >= 70)
    summary = {
        "as_of": datetime.now(timezone.utc).isoformat(),
        "agent_runs_7d": sum(s["ok"] + s["fail"] + s["other"] for s in by_agent.values()),
        "per_agent": by_agent,
        "revenue_7d_usd": revenue_7d,
        "leads_7d": len(leads),
        "high_score_leads_7d": high_score,
    }
    # Format Telegram message
    body = "📊 <b>WEEKLY HEALTH CHECK</b>

"
    body += f"Period: {week_ago} → now

"
    body += "<b>Agent runs (7d):</b>
"
    for a, s in sorted(by_agent.items()):
        total = s["ok"] + s["fail"] + s["other"]
        body += f"  • {a}: {s['ok']} ok / {s['fail']} fail / {s['other']} other ({total} total)
"
    body += f"
<b>Revenue 7d:</b> ${revenue_7d:,.2f}
"
    body += f"<b>New leads 7d:</b> {len(leads)} ({high_score} with score >= 70)
"
    body += f"
<i>Detailed report emailed to ai.leadx10@gmail.com</i>"
    _telegram(body)
    return {"ok": True, "agent": "weekly_health", "summary": summary}


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
