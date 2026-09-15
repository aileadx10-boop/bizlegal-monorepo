"""Competitor snapshots + diff router."""
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()

@router.post("/snapshots/ingest")
def ingest_snapshot() -> dict:
    return {"snapshots": 0, "changes": 0}
