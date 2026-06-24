#!/usr/bin/env python3
"""
telegram_heartbeat.py — minimal Telegram bot message sender.

Used by all cron jobs to push one-line status to @BIZLEGALFORGEBOT
so Moses sees automation working without opening a terminal.

Env: TELEGRAM_CURATOR_BOT_TOKEN, TELEGRAM_CHAT_ID

Usage:
  python3 telegram_heartbeat.py "✅ Daily audit: 47 pages OK"
  echo "from cron" | python3 telegram_heartbeat.py --stdin
"""
import os, sys, json, urllib.request

TOKEN = os.getenv("TELEGRAM_CURATOR_BOT_TOKEN", "")
CHAT = os.getenv("TELEGRAM_CHAT_ID", "989097520")

def send(text: str) -> bool:
    if not TOKEN:
        print("[tg] no TELEGRAM_CURATOR_BOT_TOKEN", file=sys.stderr); return False
    try:
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{TOKEN}/sendMessage",
            data=json.dumps({"chat_id": CHAT, "text": text,
                              "parse_mode": "HTML", "disable_web_page_preview": True}).encode(),
            method="POST",
            headers={"Content-Type": "application/json"},
        )
        r = json.loads(urllib.request.urlopen(req, timeout=10).read())
        return r.get("ok", False)
    except Exception as e:
        print(f"[tg] err: {e}", file=sys.stderr); return False

if __name__ == "__main__":
    if "--stdin" in sys.argv:
        text = sys.stdin.read().strip()
    elif len(sys.argv) > 1:
        text = " ".join(a for a in sys.argv[1:] if not a.startswith("--"))
    else:
        text = "(empty)"
    ok = send(text)
    print("OK" if ok else "FAIL")
    sys.exit(0 if ok else 1)