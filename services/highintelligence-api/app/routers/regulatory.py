"""Regulatory feed ingestion."""
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()

@router.post("/regulatory/ingest")
def ingest_regulatory() -> dict:
    return {"events": 0}
