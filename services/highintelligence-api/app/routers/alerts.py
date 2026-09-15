"""Alerts + dispatch (Gmail preferred, Resend fallback)."""
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()

@router.post("/alerts/dispatch")
def dispatch() -> dict:
    return {"dispatched": 0}
