"""BrainX API — FastAPI service for signal ingestion, agents, scoring, and products."""
from __future__ import annotations

import os

from fastapi import Depends, FastAPI, Header, HTTPException

from .pipeline.scoring import status_for, weighted_score

app = FastAPI(title="BrainX Intelligence OS", version="0.1.0")


def require_internal_key(x_internal_key: str | None = Header(default=None)) -> None:
    expected = os.getenv("BRAINX_INTERNAL_KEY", "")
    if not expected or x_internal_key != expected:
        raise HTTPException(status_code=401, detail="missing or invalid internal key")


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "brainx"}


@app.post("/api/v1/signals/ingest", dependencies=[Depends(require_internal_key)])
def ingest_signals() -> dict:
    # Placeholder — real ingestion implemented in services.highintelligence_api.app.routers.signals
    return {"inserted": 0, "duplicates": 0, "errors": 1, "reason": "ingest router not wired yet"}


@app.post("/api/v1/opportunities/evaluate", dependencies=[Depends(require_internal_key)])
def evaluate_opportunities() -> dict:
    return {"evaluated": 0}


@app.get("/api/v1/intelligence/overview", dependencies=[Depends(require_internal_key)])
def overview() -> dict:
    return {"new_opportunities_24h": 0, "competitor_moves_7d": 0, "demand_spikes_7d": 0, "regulatory_events_30d": 0}

@app.get("/api/v1/status/score")
def score_status(score: float) -> dict:
    return {"score": round(score, 2), "status": status_for(score)}
