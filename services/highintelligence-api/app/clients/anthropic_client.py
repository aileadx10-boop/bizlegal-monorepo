"""Anthropic client stub — Sonnet for analysis, Opus only for synthesis."""
from __future__ import annotations

import os

MODEL_ANALYSIS = os.getenv("ANTHROPIC_MODEL_ANALYSIS", "claude-sonnet-4-5")
MODEL_SYNTHESIS = os.getenv("ANTHROPIC_MODEL_SYNTHESIS", "claude-opus-4-1")
