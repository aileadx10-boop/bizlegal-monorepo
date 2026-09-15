"""BrainX scoring — Python mirror of packages/scoring (TS). Parity is asserted in tests."""
from __future__ import annotations

SCORING_VERSION = "v1"

WEIGHTS = {
    "demand": 0.20,
    "pain": 0.20,
    "wtp": 0.20,
    "competition": 0.15,
    "legal": 0.10,
    "automation": 0.08,
    "acquisition": 0.07,
}


def weighted_score(f: dict[str, float]) -> float:
    return round(sum(f[k] * WEIGHTS[k] for k in WEIGHTS), 2)


def status_for(score: float) -> str:
    if score >= 80:
        return "build"
    if score >= 65:
        return "validate"
    if score >= 50:
        return "watch"
    return "ignore"
