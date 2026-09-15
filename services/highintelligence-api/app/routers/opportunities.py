"""Opportunity evaluation + BUILD THIS actions."""
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()

@router.post("/opportunities/evaluate")
def evaluate() -> dict:
    return {"evaluated": 0}

@router.post("/intelligence/opportunities/{opportunity_id}/action")
def action(opportunity_id: str) -> dict:
    return {"opportunity_id": opportunity_id, "action": "accepted"}
