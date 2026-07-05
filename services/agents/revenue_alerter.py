#!/usr/bin/env python3
"""
revenue_alerter.py — first-revenue Telegram auto-alert.

Polls payment_orders every 60 seconds. When a NEW row appears with
status='active' and gateway != 'simulated', fires a Telegram alert
with: amount, product, tier, email, and the first line of context.
Schedule: every minute (recommended via systemd timer, NOT cron
60 times an hour).
"""
from __future__ import annotations
import os, json, time, urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path
import sys as _sys
_sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
import _env

SUPABASE_URL, SUPABASE_KEY = os.environ.get("SUPABASE_URL", ""), _env.get_supabase_key()
TELEGRAM_TOKEN, TELEGRAM_CHAT = _env.get_telegram_token(), _env.get_telegram_chat()

# In-memory dedup (replace with redis/SQL in prod)
_ALERTED = set()


def _q(path: str) -> list:
    try:
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"})
        return json.loads(urllib.request.urlopen(req, timeout=10).read())
    except Exception: return []


def _telegram(msg: str):
    if not TELEGRAM_TOKEN: return
    try:
        req = urllib.request.Request(f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
            data=json.dumps({"chat_id": TELEGRAM_CHAT, "text": msg, "parse_mode": "HTML",
                            "disable_web_page_preview": True}).encode(),
            headers={"Content-Type": "application/json"}, method="POST")
        urllib.request.urlopen(req, timeout=8)
    except Exception: pass


def run(ctx=None) -> dict:
    started = time.time()
    # New rows in last 5 min
    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=5)).strftime('%Y-%m-%dT%H:%M:%SZ')
    rows = _q(f"payment_orders?select=id,user_email,product,tier,amount_cents,gateway,status,created_at&status=eq.active&gateway=neq.simulated&created_at=gte.{cutoff}")
    fired = []
    for r in rows:
        if not isinstance(r, dict): continue
        rid = r.get("id", "")
        if rid in _ALERTED: continue
        amount = float(r.get("amount_cents") or 0) / 100
        msg = (
            f"\U0001F4B0 <b>FIRST REVENUE!</b>\n\n"
            f"<b>${amount:,.2f}</b> {r.get('gateway', '?')} payment\n"
            f"Product: {r.get('product', '?')} ({r.get('tier', '?')})\n"
            f"Email: {r.get('user_email', '?')}\n"
            f"ID: <code>{rid}</code>\n"
            f"Time: {r.get('created_at', '?')}"
        )
        _telegram(msg)
        _ALERTED.add(rid)
        fired.append(rid)
    return {"ok": True, "agent": "revenue_alerter", "fired": len(fired),
            "ids": fired, "duration_ms": int((time.time() - started) * 1000)}


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
