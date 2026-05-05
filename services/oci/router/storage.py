"""Supabase + Redis I/O. Service-role REST calls only — never anon."""
from __future__ import annotations

import logging
import os
from typing import Any

import httpx
import redis

logger = logging.getLogger(__name__)

_redis_pool: redis.Redis | None = None


def _supabase_headers() -> dict[str, str]:
    key = os.environ["SUPABASE_SECRET"]
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def _supabase_url(table: str) -> str:
    base = os.environ["SUPABASE_URL"].rstrip("/")
    return f"{base}/rest/v1/{table}"


def supabase_get(table: str, params: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    with httpx.Client(timeout=15.0) as client:
        resp = client.get(_supabase_url(table), headers=_supabase_headers(), params=params or {})
        resp.raise_for_status()
        return resp.json()


def supabase_insert(table: str, body: dict[str, Any] | list[dict[str, Any]]) -> list[dict[str, Any]]:
    with httpx.Client(timeout=15.0) as client:
        resp = client.post(_supabase_url(table), headers=_supabase_headers(), json=body)
        resp.raise_for_status()
        return resp.json()


def supabase_insert_idempotent(
    table: str,
    body: dict[str, Any] | list[dict[str, Any]],
) -> bool:
    """Insert that treats unique-constraint conflicts as a quiet no-op.

    Sets `Prefer: resolution=ignore-duplicates,return=minimal` so PostgREST
    returns 201 on a fresh insert and 201 on a duplicate (no body, no
    raise). Use for fire-and-forget writes where the dedupe key already
    exists in the table (e.g. `lead_nurture_state.lead_id`).

    Returns True on accepted (new or duplicate), False on transport error.
    Callers that need the row back should use supabase_insert.
    """
    headers = {
        **_supabase_headers(),
        "Prefer": "resolution=ignore-duplicates,return=minimal",
    }
    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(_supabase_url(table), headers=headers, json=body)
            # 201 = inserted, 409 should not happen with ignore-duplicates
            # but guard regardless. Anything else is a real failure.
            return resp.status_code in (200, 201, 204)
    except Exception as exc:
        logger.warning("idempotent insert into %s failed: %s", table, exc)
        return False


def supabase_patch(
    table: str,
    params: dict[str, Any],
    body: dict[str, Any],
) -> list[dict[str, Any]]:
    with httpx.Client(timeout=15.0) as client:
        resp = client.patch(
            _supabase_url(table),
            headers=_supabase_headers(),
            params=params,
            json=body,
        )
        resp.raise_for_status()
        return resp.json()


def supabase_health() -> bool:
    try:
        supabase_get("partners", {"select": "id", "limit": "1"})
        return True
    except Exception as exc:
        logger.warning("supabase health check failed: %s", exc)
        return False


def get_redis() -> redis.Redis:
    global _redis_pool
    if _redis_pool is None:
        url = os.environ.get("REDIS_URL", "redis://redis:6379")
        _redis_pool = redis.from_url(url, decode_responses=True)
    return _redis_pool


def redis_health() -> bool:
    try:
        return bool(get_redis().ping())
    except Exception as exc:
        logger.warning("redis health check failed: %s", exc)
        return False


def store_lead(record: dict[str, Any]) -> dict[str, Any]:
    rows = supabase_insert("deal_router_leads", record)
    return rows[0] if rows else {}


def store_payout_pending(lead_id: str, partner_id: str, commission_usd: float) -> dict[str, Any]:
    rows = supabase_insert(
        "payouts",
        {
            "lead_id": lead_id,
            "partner_id": partner_id,
            "commission_usd": commission_usd,
            "status": "pending",
        },
    )
    return rows[0] if rows else {}
