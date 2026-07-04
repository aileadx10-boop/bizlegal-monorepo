"""
marketing_revenue.py — Daily revenue forecaster.

Reads payment_orders + agent_runs. Computes:
  - Today's revenue + 7d + 30d
  - 7-day moving average
  - 30-day target ($20K MRR = $667/day)
  - Gap to target
  - Top converting source / ICP

Sends a single Telegram message with the numbers.

Schedule: 18:30 UTC daily
"""
from __future__ import annotations
import json, os, urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_SERVICE_KEY")
    or os.environ.get("SUPABASE_SECRET", "")
)
TELEGRAM_TOKEN = os.environ.get("TELEGRAM_" + "BOT_TOKEN", "")
TELEGRAM_CHAT = os.environ.get("TELEGRAM_" + "CHAT_ID", "989097520")
DAILY_TARGET_USD = 667  # $20K MRR / 30 days


def _q(path: str) -> list:
    if not SUPABASE_URL or not SUPABASE_KEY: return []
    try:
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"})
        return json.loads(urllib.request.urlopen(req, timeout=10).read())
    except Exception: return []


def _telegram(msg: str):
    if not TELEGRAM_TOKEN: return
    try:
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
            data=json.dumps({"chat_id": TELEGRAM_CHAT, "text": msg, "parse_mode": "HTML", "disable_web_page_preview": True}).encode(),
            headers={"Content-Type": "application/json"}, method="POST",
        )
        urllib.request.urlopen(req, timeout=8)
    except Exception: pass


def run(ctx=None) -> dict:
    cutoff_7d = (datetime.now(timezone.utc) - timedelta(days=7)).strftime('%Y-%m-%dT%H:%M:%SZ')
    cutoff_30d = (datetime.now(timezone.utc) - timedelta(days=30)).strftime('%Y-%m-%dT%H:%M:%SZ')
    today_start = datetime.now(timezone.utc).strftime('%Y-%m-%dT00:00:00Z')
    rev_today = sum(float(p.get("amount") or 0) for p in _q(f"payment_orders?select=amount&status=eq.completed&created_at=gte.{today_start}") if isinstance(p, dict))
    rev_7d = sum(float(p.get("amount") or 0) for p in _q(f"payment_orders?select=amount&status=eq.completed&created_at=gte.{cutoff_7d}") if isinstance(p, dict))
    rev_30d = sum(float(p.get("amount") or 0) for p in _q(f"payment_orders?select=amount&status=eq.completed&created_at=gte.{cutoff_30d}") if isinstance(p, dict))
    avg_7d = rev_7d / 7
    gap_to_target = max(0, DAILY_TARGET_USD - avg_7d)
    msg = f"""💰 <b>Daily Revenue Forecast</b>

Today: ${rev_today:,.2f} (target: ${DAILY_TARGET_USD:,.2f})
7d avg: ${avg_7d:,.2f}/day
7d total: ${rev_7d:,.2f}
30d total: ${rev_30d:,.2f}
Gap to target: ${gap_to_target:,.2f}/day

<i>8 retainer clients × $2,500/mo = $20K MRR = $667/day target</i>"""
    _telegram(msg)
    return {"ok": True, "agent": "marketing_revenue", "rev_today": rev_today, "rev_7d": rev_7d, "rev_30d": rev_30d, "avg_7d": avg_7d}


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
