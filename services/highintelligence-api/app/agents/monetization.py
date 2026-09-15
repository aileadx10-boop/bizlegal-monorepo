"""Monetization / Opportunity synthesis agent (Claude Opus only for final synthesis)."""
from __future__ import annotations

def run(context: dict) -> dict:
    # Requires >= 3 evidence links; emits opportunity + product bundle.
    return {"agent": "monetization", "opportunity": None}
