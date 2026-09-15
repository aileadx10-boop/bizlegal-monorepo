"""AI router — Gemini Flash for classification, Claude Sonnet for analysis, Opus for synthesis."""
from __future__ import annotations

import os

MODEL_CLASSIFY = os.getenv("GEMINI_MODEL_CLASSIFY", "gemini-2.5-flash")
MODEL_ANALYSIS = os.getenv("CLAUDE_MODEL_ANALYSIS", "claude-sonnet-4-5")
MODEL_SYNTHESIS = os.getenv("CLAUDE_MODEL_SYNTHESIS", "claude-opus-4-1")

def model_for(task: str) -> str:
    if task == "classify":
        return MODEL_CLASSIFY
    if task == "synthesis":
        return MODEL_SYNTHESIS
    return MODEL_ANALYSIS
