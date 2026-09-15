"""Gmail adapter (Python side) — send via Gmail API, read brainx_inbox label."""
from __future__ import annotations

import os

GOOGLE_GMAIL_ACCESS_TOKEN = os.getenv("GOOGLE_GMAIL_ACCESS_TOKEN", "")
GMAIL_FROM = os.getenv("BRAINX_GMAIL_FROM", "brainx@bizlegal-ai.com")

def require_gmail_token() -> str:
    if not GOOGLE_GMAIL_ACCESS_TOKEN:
        raise RuntimeError("GOOGLE_GMAIL_ACCESS_TOKEN missing")
    return GOOGLE_GMAIL_ACCESS_TOKEN
