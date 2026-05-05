"""
Payout reconciler — fires referral.paid events for every payouts row
that has transitioned status='pending' → status='paid'.

Run on a weekly systemd timer (Fridays 10:00 UTC). Idempotent — uses
Redis as a dedupe ledger so each paid payout fires exactly one
referral.paid event regardless of how often the reconciler runs.

Phase AA D6 — also posts a weekly digest to Telegram summarising:
  - leads routed in the last 7d
  - leads closed (won) in the last 7d
  - commission recognised in the last 7d
  - top partner by closes
The digest is best-effort: missing Telegram envs skip silently. The
reconciler's primary job (firing referral.paid) is unaffected.

Manual run:
  python -m payout_reconciler                  # both: events + digest
  python -m payout_reconciler --no-digest      # events only
  python -m payout_reconciler --digest-only    # digest only

Env: same as router (SUPABASE_URL, SUPABASE_SECRET, REDIS_URL,
BIZLEGAL_INBOUND_SECRET) plus TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
for the digest.
"""
from __future__ import annotations

import datetime as dt
import logging
import os
import sys
from typing import Any

import httpx

from ops_log import log_event
from storage import get_redis, supabase_get

logger = logging.getLogger(__name__)
logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))

PAID_DEDUPE_PREFIX = "ops_event:referral_paid:"
PAID_DEDUPE_TTL_SECONDS = 60 * 60 * 24 * 365  # 1 year


def _redis_dedupe_key(payout_id: str) -> str:
    return f"{PAID_DEDUPE_PREFIX}{payout_id}"


def fire_paid_events() -> dict[str, int]:
    """Scan payouts with status='paid' and fire referral.paid for new ones."""
    rds = get_redis()
    rows: list[dict[str, Any]] = supabase_get(
        "payouts",
        params={
            "select": "id,lead_id,partner_id,commission_usd,status,paid_at,created_at",
            "status": "eq.paid",
            "order": "paid_at.desc.nullslast",
            "limit": "200",
        },
    )

    fired = 0
    skipped = 0
    failures = 0

    for row in rows:
        payout_id = str(row.get("id") or "")
        if not payout_id:
            continue
        dedupe_key = _redis_dedupe_key(payout_id)
        try:
            already = rds.get(dedupe_key)
        except Exception as err:
            logger.warning("redis dedupe read failed (firing anyway): %s", err)
            already = None
        if already:
            skipped += 1
            continue

        commission_usd = row.get("commission_usd") or 0
        amount_cents: int | None = None
        try:
            amount_cents = int(round(float(commission_usd) * 100))
        except Exception:
            amount_cents = None

        ok = log_event(
            "referral.paid",
            ref_id=str(row.get("lead_id") or payout_id),
            amount_cents=amount_cents,
            status="ok",
            metadata={
                "payout_id": payout_id,
                "partner_id": row.get("partner_id"),
                "commission_usd": commission_usd,
                "paid_at": row.get("paid_at"),
            },
        )
        if not ok:
            failures += 1
            continue

        try:
            rds.set(dedupe_key, "1", ex=PAID_DEDUPE_TTL_SECONDS)
        except Exception as err:
            # Event fired; failing to set the dedupe key risks a duplicate
            # event next run but is not catastrophic. Log + continue.
            logger.warning("redis dedupe write failed for %s: %s", payout_id, err)
        fired += 1

    summary = {
        "scanned": len(rows),
        "fired": fired,
        "skipped_already_fired": skipped,
        "failed": failures,
    }
    logger.info("payout reconciler done: %s", summary)
    return summary


def _last_n_days(n: int) -> str:
    return (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=n)).isoformat()


def build_weekly_digest() -> dict[str, Any]:
    """Aggregate the last 7d of OCI activity for the digest."""
    since = _last_n_days(7)

    routed_rows = supabase_get(
        "deal_router_leads",
        params={
            "select": "lead_id,classification,partner_id,outcome,created_at",
            "created_at": f"gte.{since}",
            "action": "eq.ROUTE_PARTNER",
            "order": "created_at.desc",
            "limit": "500",
        },
    )

    closed_rows = supabase_get(
        "deal_router_leads",
        params={
            "select": "lead_id,classification,partner_id,outcome,outcome_notes,created_at",
            "created_at": f"gte.{since}",
            "outcome": "eq.won",
            "limit": "500",
        },
    )

    paid_rows = supabase_get(
        "payouts",
        params={
            "select": "id,lead_id,partner_id,commission_usd,status,paid_at",
            "paid_at": f"gte.{since}",
            "status": "eq.paid",
            "limit": "500",
        },
    )

    commission_total = 0.0
    for row in paid_rows:
        try:
            commission_total += float(row.get("commission_usd") or 0)
        except Exception:
            pass

    # Top partner by close count (won outcomes only).
    partner_close_counts: dict[str, int] = {}
    for row in closed_rows:
        partner_id = row.get("partner_id")
        if not partner_id:
            continue
        partner_close_counts[partner_id] = partner_close_counts.get(partner_id, 0) + 1
    top_partner_id = None
    top_partner_count = 0
    if partner_close_counts:
        top_partner_id, top_partner_count = max(partner_close_counts.items(), key=lambda kv: kv[1])

    top_partner_name = None
    if top_partner_id:
        partner_lookup = supabase_get(
            "partners",
            params={
                "select": "name",
                "id": f"eq.{top_partner_id}",
                "limit": "1",
            },
        )
        if partner_lookup:
            top_partner_name = partner_lookup[0].get("name")

    return {
        "window_days": 7,
        "routed_count": len(routed_rows),
        "closed_count": len(closed_rows),
        "paid_count": len(paid_rows),
        "commission_total_usd": round(commission_total, 2),
        "top_partner_id": top_partner_id,
        "top_partner_name": top_partner_name,
        "top_partner_close_count": top_partner_count,
    }


def format_digest_message(digest: dict[str, Any]) -> str:
    """Plain-text Telegram message body. Telegram parse_mode=Markdown."""
    top_partner = (
        f"{digest['top_partner_name'] or digest['top_partner_id']} "
        f"({digest['top_partner_close_count']} close{'s' if digest['top_partner_close_count'] != 1 else ''})"
        if digest.get("top_partner_id")
        else "—"
    )
    return (
        "*OCI weekly digest* (last 7d)\n"
        f"• Routed: `{digest['routed_count']}`\n"
        f"• Closed (won): `{digest['closed_count']}`\n"
        f"• Paid out: `{digest['paid_count']}`  total `${digest['commission_total_usd']:.2f}`\n"
        f"• Top partner: {top_partner}"
    )


def post_digest_to_telegram(digest: dict[str, Any]) -> bool:
    """Best-effort Telegram post. Returns True on send, False on skip/fail."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        logger.info("[digest] Telegram envs missing; skipping post")
        return False

    text = format_digest_message(digest)
    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(
                f"https://api.telegram.org/bot{token}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": text,
                    "parse_mode": "Markdown",
                    "disable_web_page_preview": True,
                },
            )
            resp.raise_for_status()
    except Exception as exc:
        logger.warning("[digest] Telegram post failed: %s", exc)
        return False
    return True


def main() -> int:
    no_digest = "--no-digest" in sys.argv
    digest_only = "--digest-only" in sys.argv

    if not digest_only:
        summary = fire_paid_events()
        print({"events": summary})
        events_failed = summary.get("failed", 0) > 0
    else:
        events_failed = False

    if not no_digest:
        try:
            digest = build_weekly_digest()
            posted = post_digest_to_telegram(digest)
            print({"digest": digest, "telegram_posted": posted})
        except Exception as exc:
            logger.exception("digest failed: %s", exc)
            return 1

    return 1 if events_failed else 0


if __name__ == "__main__":
    sys.exit(main())
