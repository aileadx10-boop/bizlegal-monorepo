"""
OCI deal-router → hub /api/ops/log telemetry.

Fire-and-forget HMAC-SHA256-signed POST to the shared ops-events stream
so /ops dashboard sees the entire referral pipeline (received → routed
→ responded → closed → paid). This is the asymmetric pillar — one $25K
finder-fee close dwarfs a month of $29-99/mo product subscriptions, so
visibility into this funnel matters more than any single product card.

Source label: "oci" (per ALLOWED_SOURCES on the hub side).

Allowed event types (mirror lib/ops/log.ts on the hub):
  - referral.received   POST /lead arrived (jurisdiction + estimated_deal_value)
  - referral.routed     partner matched, dispatch sent (partner_id + match_score)
  - referral.responded  partner feedback received (engaged / declined)
  - referral.closed     deal closed; commission_usd computed
  - referral.paid       finder fee landed in BizLegal account
  - error               unexpected failure worth tracking

Failures are swallowed (logged via the project logger, never raised) —
telemetry must never break the referral pipeline.

Env contract:
  - BIZLEGAL_INBOUND_SECRET: shared HMAC secret (matches hub side)
  - OPS_LOG_URL: defaults to https://bizlegal-ai.com/api/ops/log
"""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
from typing import Any

import httpx

logger = logging.getLogger(__name__)

OPS_LOG_URL = os.getenv("OPS_LOG_URL", "https://bizlegal-ai.com/api/ops/log")
INBOUND_SECRET_ENV = "BIZLEGAL_INBOUND_SECRET"

ALLOWED_TYPES = {
    "referral.received",
    "referral.routed",
    "referral.responded",
    "referral.closed",
    "referral.paid",
    "referral.alert",  # V0.1 — Telegram-only HOT alerts mirrored
    "error",
}


def log_event(
    event_type: str,
    *,
    ref_id: str | None = None,
    email: str | None = None,
    amount_cents: int | None = None,
    status: str | None = None,
    metadata: dict[str, Any] | None = None,
    timeout: float = 5.0,
) -> bool:
    """Fire-and-forget ops event POST. Returns True on 2xx, False otherwise.

    Caller should not block on the return value — provided for tests.
    """
    secret = os.environ.get(INBOUND_SECRET_ENV, "")
    if not secret:
        return False
    if event_type not in ALLOWED_TYPES:
        logger.warning("[ops_log] skipping unknown event_type: %s", event_type)
        return False

    payload: dict[str, Any] = {
        "type": event_type,
        "source": "oci",
    }
    if ref_id is not None:
        payload["ref_id"] = ref_id
    if email is not None:
        payload["email"] = email
    if amount_cents is not None:
        payload["amount_cents"] = amount_cents
    if status is not None:
        payload["status"] = status
    if metadata is not None:
        payload["metadata"] = metadata

    body = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
    sig = hmac.new(secret.encode("utf-8"), body.encode("utf-8"), hashlib.sha256).hexdigest()

    try:
        res = httpx.post(
            OPS_LOG_URL,
            content=body.encode("utf-8"),
            headers={
                "x-bizlegal-signature": sig,
                "Content-Type": "application/json",
            },
            timeout=timeout,
        )
        return 200 <= res.status_code < 300
    except Exception as err:  # noqa: BLE001 — telemetry never breaks user flows
        logger.warning("[ops_log] post failed (swallowed): %s", err)
        return False
