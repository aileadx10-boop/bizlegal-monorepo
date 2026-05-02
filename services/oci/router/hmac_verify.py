"""HMAC verification for /lead inbound. Shared secret with EA Worker.

Protocol matches the rest of the fleet (EA Worker outbound signer +
all 6 product /api/inbound-lead routes):
  - Header name:  x-bizlegal-signature
  - Format:       raw hex of HMAC-SHA256(body, BIZLEGAL_INBOUND_SECRET)
                  NO 'sha256=' prefix
  - Compare:      hmac.compare_digest (timing-safe)
"""
from __future__ import annotations

import hashlib
import hmac
import os


def expected_signature(body: bytes, secret: str | None = None) -> str:
    secret = secret or os.environ["BIZLEGAL_INBOUND_SECRET"]
    return hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()


def verify_signature(body: bytes, header_value: str | None) -> bool:
    if not header_value:
        return False
    secret = os.environ.get("BIZLEGAL_INBOUND_SECRET")
    if not secret:
        return False
    expected = expected_signature(body, secret)
    return hmac.compare_digest(expected, header_value.strip())
