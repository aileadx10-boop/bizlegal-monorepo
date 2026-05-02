"""
Payout reconciler — fires referral.paid events for every payouts row
that has transitioned status='pending' → status='paid'.

Run on a weekly systemd timer (Fridays 10:00 UTC). Idempotent — uses
Redis as a dedupe ledger so each paid payout fires exactly one
referral.paid event regardless of how often the reconciler runs.

Manual run:
  python -m payout_reconciler

Env: same as router (SUPABASE_URL, SUPABASE_SECRET, REDIS_URL,
BIZLEGAL_INBOUND_SECRET).
"""
from __future__ import annotations

import logging
import os
import sys
from typing import Any

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


def main() -> int:
    summary = fire_paid_events()
    print(summary)
    return 0 if summary.get("failed", 0) == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
