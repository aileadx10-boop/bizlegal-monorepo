"""Nightly summary: count yesterday's leads + open payouts, ping Telegram,
then call Supabase RPC to anonymize 90+ day-old PII."""
from __future__ import annotations

import datetime as dt
import logging
import os

import httpx

from notify import _post

logger = logging.getLogger(__name__)
logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))


def _supa_url(path: str) -> str:
    return f"{os.environ['SUPABASE_URL'].rstrip('/')}/rest/v1{path}"


def _supa_headers() -> dict[str, str]:
    key = os.environ["SUPABASE_SECRET"]
    return {"apikey": key, "Authorization": f"Bearer {key}"}


def yesterday_summary() -> dict[str, int]:
    yesterday = (dt.datetime.utcnow() - dt.timedelta(days=1)).strftime("%Y-%m-%d")
    with httpx.Client(timeout=15.0) as client:
        leads = client.get(
            _supa_url("/deal_router_leads"),
            headers={**_supa_headers(), "Prefer": "count=exact"},
            params={"received_at": f"gte.{yesterday}T00:00:00", "select": "lead_id,priority,action"},
        ).json()
        open_payouts = client.get(
            _supa_url("/payouts_open"),
            headers={**_supa_headers(), "Prefer": "count=exact"},
            params={"select": "id"},
        ).json()
    return {
        "leads_yesterday": len(leads),
        "hot": sum(1 for l in leads if (l.get("priority") or "").upper() == "HOT"),
        "routed": sum(1 for l in leads if (l.get("action") or "") == "ROUTE_PARTNER"),
        "ignored": sum(1 for l in leads if (l.get("action") or "") == "IGNORE"),
        "open_payouts": len(open_payouts),
    }


def call_anonymizer() -> int:
    with httpx.Client(timeout=30.0) as client:
        resp = client.post(
            _supa_url("/rpc/anonymize_old_leads"),
            headers={**_supa_headers(), "Content-Type": "application/json"},
            json={},
        )
        resp.raise_for_status()
        return int(resp.json() or 0)


def main() -> int:
    summary = yesterday_summary()
    anonymized = 0
    try:
        anonymized = call_anonymizer()
    except Exception as exc:
        logger.warning("anonymizer RPC failed: %s", exc)

    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    # Only ping Telegram when there is real activity (leads > 0) or pending payouts.
    # When the router is idle, daily 0/0/0 messages provide no signal — suppress them.
    has_activity = summary["leads_yesterday"] > 0 or summary["open_payouts"] > 1
    if token and chat_id and has_activity:
        text = (
            "*Deal Router — daily*\n"
            f"Leads (yesterday): {summary['leads_yesterday']}\n"
            f"  HOT: {summary['hot']}\n"
            f"  Routed: {summary['routed']}\n"
            f"  Ignored: {summary['ignored']}\n"
            f"Open payouts: {summary['open_payouts']}\n"
            f"Anonymized rows: {anonymized}"
        )
        _post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
        )
    print(summary, "anonymized=", anonymized)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
