"""Normalize raw payloads into Signal schema. Content-hash dedupe is computed here."""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any


def canonical_hash(raw: dict[str, Any]) -> str:
    blob = json.dumps(raw, sort_keys=True, default=str, ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()


def normalize_item(item: dict[str, Any], market_id: str, source_id: str | None = None) -> dict[str, Any]:
    raw = item.get("raw", item)
    detected = item.get("detected_at") or datetime.now(timezone.utc).isoformat()
    return {
        "market_id": market_id,
        "source_id": source_id,
        "signal_type": item.get("signal_type", "demand"),
        "title": item.get("title", ""),
        "description": item.get("description"),
        "url": item.get("url"),
        "author": item.get("author"),
        "raw_data": raw,
        "content_hash": canonical_hash(raw),
        "detected_at": detected,
        "confidence": item.get("confidence"),
        "sentiment": item.get("sentiment"),
        "intensity": item.get("intensity"),
    }
