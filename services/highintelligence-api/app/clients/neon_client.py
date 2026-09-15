"""Neon client for the BrainX API (Python side)."""
from __future__ import annotations

import os

try:
    import asyncpg
except Exception:  # pragma: no cover
    asyncpg = None

DATABASE_URL = os.getenv("NEON_DATABASE_URL") or os.getenv("DATABASE_URL", "")

def require_db_url() -> str:
    if not DATABASE_URL:
        raise RuntimeError("BrainX: NEON_DATABASE_URL / DATABASE_URL missing")
    return DATABASE_URL
