"""Gemini Flash classifier + embeddings."""
from __future__ import annotations

import os
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_GEMINI_API_KEY", "")
