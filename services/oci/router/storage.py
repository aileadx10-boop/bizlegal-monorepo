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
