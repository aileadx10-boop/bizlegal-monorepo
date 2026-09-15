"""Signals ingestion router (normalize -> dedupe -> classify -> embedding via Neon)."""
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()

@router.post("/signals/ingest")
def ingest() -> dict:
    return {"inserted": 0, "duplicates": 0, "errors": 0}
