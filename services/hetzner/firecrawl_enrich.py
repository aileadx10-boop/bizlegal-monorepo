"""
Hetzner curator — Firecrawl enrichment helper.

For each top-N picked regulatory news item, scrape the source URL via
Firecrawl's structured-extraction endpoint to capture:

  - party (regulator + counterparty/respondent)
  - penalty_usd (numeric, if applicable)
  - effective_date (ISO 8601)
  - deadline_date (ISO 8601, if cited)
  - regulation_cites (list of article numbers, statute references)
  - key_quote (a single 1-2 sentence verbatim quote with the regulatory
    bite)
  - executive_summary (3-5 bullet summary)

Output is attached to each ranked item before persistence so brain.py
gets richer source context for the long-form draft. Anti-hallucination
contract holds: the structured fields produced here are added to the
`sources` list for downstream numeric-claim verification, never invented.

Failure mode: if Firecrawl times out, errors, or the API key is unset,
this module returns the original ranked items unchanged. Curator
pipeline keeps running. Logs a warning so /ops sees the gap.

Concurrency: Firecrawl rate-limits the free/starter tiers heavily, so
each enrichment is run sequentially with a 30s per-call timeout. With
TOP_N=3 the worst case is ~90s added to the scout run, acceptable for
a Mon/Wed/Fri 06:00 cron.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any

import httpx

logger = logging.getLogger(__name__)

FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY", "")
FIRECRAWL_BASE_URL = os.getenv("FIRECRAWL_BASE_URL", "https://api.firecrawl.dev").rstrip("/")
FIRECRAWL_TIMEOUT_S = 30
FIRECRAWL_EXTRACT_PATH = "/v1/extract"

EXTRACTION_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "party": {
            "type": "object",
            "description": "The regulator that issued the action and the respondent / counterparty.",
            "properties": {
                "regulator": {"type": "string"},
                "respondent": {"type": "string"},
            },
        },
        "penalty_usd": {
            "type": "number",
            "description": "Monetary penalty in US dollars. 0 if none disclosed.",
        },
        "effective_date": {
            "type": "string",
            "description": "Action effective date in ISO 8601 (YYYY-MM-DD). Empty if not stated.",
        },
        "deadline_date": {
            "type": "string",
            "description": "Compliance deadline, application deadline, or future trigger date. Empty if not stated.",
        },
        "regulation_cites": {
            "type": "array",
            "description": "Specific statute, rule, or article references (e.g. 'Section 5(a)', 'Article 32(2)', '17 CFR 240.10b-5').",
            "items": {"type": "string"},
        },
        "key_quote": {
            "type": "string",
            "description": "1-2 sentence verbatim quote from the source that captures the regulatory bite.",
        },
        "executive_summary": {
            "type": "array",
            "description": "3-5 short bullets summarising what happened and why a compliance officer cares.",
            "items": {"type": "string"},
        },
    },
}


def is_configured() -> bool:
    return bool(FIRECRAWL_API_KEY)


def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {FIRECRAWL_API_KEY}",
        "Content-Type": "application/json",
    }


def enrich_url(url: str) -> dict[str, Any] | None:
    """Scrape + structured-extract one URL via Firecrawl. Returns None on failure."""
    if not is_configured():
        return None
    payload = {
        "urls": [url],
        "schema": EXTRACTION_SCHEMA,
        "prompt": (
            "Extract structured regulatory-action data from the source page. "
            "Use empty strings or 0 for unknowns; never invent. The respondent "
            "is the entity being penalised (often a company name); the regulator "
            "is the agency that issued the action."
        ),
    }
    try:
        res = httpx.post(
            f"{FIRECRAWL_BASE_URL}{FIRECRAWL_EXTRACT_PATH}",
            headers=_headers(),
            json=payload,
            timeout=FIRECRAWL_TIMEOUT_S,
        )
        if res.status_code >= 400:
            logger.warning("[firecrawl] %s -> HTTP %s: %s", url, res.status_code, res.text[:200])
            return None
        body = res.json()
    except Exception as err:
        logger.warning("[firecrawl] post failed for %s: %s", url, err)
        return None

    # Firecrawl returns either {data: {...}} (sync) or {success: bool, data: ...}.
    # Defensive normalisation — different API revisions vary in shape.
    if isinstance(body, dict):
        data = body.get("data") or body.get("result") or body
        if isinstance(data, list) and data:
            data = data[0]
        if isinstance(data, dict):
            extracted = data.get("extract") or data.get("structured") or data.get("metadata") or data
            if isinstance(extracted, dict):
                return _normalise(extracted)
    logger.warning("[firecrawl] unexpected response shape for %s: %s", url, json.dumps(body)[:200])
    return None


def _normalise(raw: dict[str, Any]) -> dict[str, Any]:
    """Defensive coercion so brain.py always sees the same keys."""
    party = raw.get("party") if isinstance(raw.get("party"), dict) else {}
    return {
        "party": {
            "regulator": str(party.get("regulator") or "")[:200],
            "respondent": str(party.get("respondent") or "")[:200],
        },
        "penalty_usd": _coerce_number(raw.get("penalty_usd")),
        "effective_date": str(raw.get("effective_date") or "")[:32],
        "deadline_date": str(raw.get("deadline_date") or "")[:32],
        "regulation_cites": [str(c)[:200] for c in (raw.get("regulation_cites") or []) if c][:10],
        "key_quote": str(raw.get("key_quote") or "")[:500],
        "executive_summary": [str(b)[:300] for b in (raw.get("executive_summary") or []) if b][:6],
    }


def _coerce_number(v: Any) -> float:
    if isinstance(v, (int, float)):
        return float(v)
    if isinstance(v, str):
        try:
            return float(v.replace(",", "").replace("$", "").strip())
        except Exception:
            return 0.0
    return 0.0
