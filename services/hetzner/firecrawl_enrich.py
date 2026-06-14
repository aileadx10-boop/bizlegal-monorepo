"""
Hetzner curator — URL content enrichment via httpx + trafilatura.

Replaces the old Firecrawl /v1/extract integration (removed 2026-06-14).
Same public interface: is_configured(), enrich_url().
Same return-dict shape: scout.py and brain.py need no changes.

Trade-off: LLM-structured fields (party, penalty_usd, dates, cites) come
back as empty/zero — brain.py's Anthropic pass handles semantic extraction.
executive_summary (list of text chunks) and key_quote (first sentence) are
populated from raw page text.  No API key, no credit cost, no vendor limits.
"""
from __future__ import annotations

import logging

import httpx
import trafilatura

logger = logging.getLogger(__name__)

_TIMEOUT = 15  # seconds; regulatory press-release pages load fast
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; BizLegalBot/1.0; "
        "+https://bizlegal-ai.com)"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

_MAX_BULLETS = 6
_BULLET_LEN = 300
_QUOTE_LEN = 500


def is_configured() -> bool:
    """Always True — no API key required for local extraction."""
    return True


def enrich_url(url: str) -> dict | None:
    """Fetch *url* and extract main content using trafilatura.

    Returns a dict with the same keys as the old Firecrawl schema so
    downstream consumers (brain.py) require no changes.  LLM-structured
    fields are zeroed/empty; text content fills executive_summary + key_quote.
    Returns None on any fetch error, non-2xx response, or empty extraction.
    """
    html = _fetch(url)
    if html is None:
        return None

    text = _extract(html, url)
    if not text:
        logger.debug("[enrich] trafilatura returned empty text for %s", url)
        return None

    bullets = _to_bullets(text)
    key_quote = text[:_QUOTE_LEN].strip()

    return {
        # Text-derived fields — the data brain.py cares about most.
        "executive_summary": bullets,
        "key_quote": key_quote,
        # Structured fields previously populated by Firecrawl's LLM extraction.
        # Zeroed here; brain.py's Anthropic call handles semantic parsing.
        "party": {"regulator": "", "respondent": ""},
        "penalty_usd": 0.0,
        "effective_date": "",
        "deadline_date": "",
        "regulation_cites": [],
    }


# ── Private helpers ──────────────────────────────────────────────────────────

def _fetch(url: str) -> str | None:
    """GET *url*, return response text or None on any error / non-2xx."""
    try:
        resp = httpx.get(
            url,
            follow_redirects=True,
            timeout=_TIMEOUT,
            headers=_HEADERS,
        )
    except Exception as err:
        logger.warning("[enrich] fetch error for %s: %s", url, err)
        return None

    if resp.status_code >= 400:
        logger.warning(
            "[enrich] HTTP %s for %s — skipping enrichment",
            resp.status_code,
            url,
        )
        return None

    return resp.text


def _extract(html: str, url: str) -> str | None:
    """Run trafilatura on raw HTML; return plain text or None."""
    try:
        return trafilatura.extract(
            html,
            url=url,
            include_comments=False,
            include_tables=False,
            no_fallback=False,
            output_format="txt",
        )
    except Exception as err:
        logger.warning("[enrich] trafilatura error for %s: %s", url, err)
        return None


def _to_bullets(text: str) -> list[str]:
    """Split text into short bullet-like chunks matching old Firecrawl shape.

    Splits on double-newlines (paragraphs), trims each, keeps the first
    _MAX_BULLETS non-empty chunks up to _BULLET_LEN chars each.
    """
    parts = [p.strip()[:_BULLET_LEN] for p in text.split("\n\n") if p.strip()]
    return parts[:_MAX_BULLETS] or [text[:_BULLET_LEN].strip()]
