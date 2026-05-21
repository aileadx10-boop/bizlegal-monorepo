"""
Hetzner curator — ops events logger (Python sibling of bizlegal-ai/lib/ops/log.ts).

Fire-and-forget HMAC-SHA256-signed POST to the hub's /api/ops/log so the
shared /ops dashboard sees curator pipeline activity (scout / brain /
publisher steps) alongside hub + subdomain events.

Failures are swallowed (printed, not raised) — telemetry must never
break the curator pipeline.

Env contract:
  - BIZLEGAL_INBOUND_SECRET: shared HMAC secret (matches hub side)
  - OPS_LOG_URL: defaults to https://bizlegal-ai.com/api/ops/log

Source label is hardcoded to "curator" so curator pipeline events
(scout / brain / publisher / bot) route to the /ops/hetzner dashboard
filter. Hub ALLOWED_SOURCES on the receive side accepts "curator" as
of Phase RR (2026-05-21).
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
from typing import Any

import httpx

OPS_LOG_URL = os.getenv("OPS_LOG_URL", "https://bizlegal-ai.com/api/ops/log")
INBOUND_SECRET_ENV = "BIZLEGAL_INBOUND_SECRET"

ALLOWED_TYPES = {
    "cron.fired",
    "cron.completed",
    "lead.inbound",
    "lead.qualified",
    "snapshot.generated",
    "framework.changed",
    "kb.uploaded",
    "report.generated",
    "webhook.received",
    "error",
    # V0.2 — bot callbacks + service heartbeats
    "curation.action",
    "heartbeat",
    # Phase RR — content engine events (2026-05-21)
    "content.published",
}


def log_event(
    event_type: str,
    *,
    ref_id: str | None = None,
    status: str | None = None,
    metadata: dict[str, Any] | None = None,
    timeout: float = 5.0,
) -> bool:
    """Fire-and-forget ops event POST.

    Returns True on a 2xx response from the hub, False otherwise. Caller
    does not need to act on the return value — provided for tests.
    """
    secret = os.environ.get(INBOUND_SECRET_ENV, "")
    if not secret:
        return False
    if event_type not in ALLOWED_TYPES:
        # Don't crash on a typo — swallow with a warning so a future
        # event-type addition on the hub doesn't blow up curator.
        print(f"[ops_log] skipping unknown event_type: {event_type}")
        return False

    payload: dict[str, Any] = {
        "type": event_type,
        "source": "curator",
    }
    if ref_id is not None:
        payload["ref_id"] = ref_id
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
        print(f"[ops_log] post failed (swallowed): {err}")
        return False
