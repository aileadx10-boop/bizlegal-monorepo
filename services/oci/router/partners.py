"""Partner selection: jurisdiction match + tier-priority round-robin."""
from __future__ import annotations

import datetime as dt
import logging
from typing import Any

from storage import supabase_get, supabase_patch

logger = logging.getLogger(__name__)

CLASSIFICATION_TO_JURISDICTION = {
    "UAE_REAL_ESTATE": "UAE",
    "SG_BUSINESS_SETUP": "SG",
    "EU_US_BUSINESS": "US",  # default; partners can also list EU
    "LEGAL_RISK_REPORT": None,  # no jurisdiction filter
    "LOW_VALUE": None,
}

LAWYER_TYPES = {"re_lawyer", "business_lawyer", "structuring_advisor", "family_office_advisor"}
REALTOR_TYPES = {"realtor"}


def _wanted_types(recommended_partner: str) -> set[str]:
    rp = (recommended_partner or "").lower()
    out: set[str] = set()
    if "realtor" in rp:
        out |= REALTOR_TYPES
    if "lawyer" in rp:
        out |= LAWYER_TYPES
    return out


def _monday(today: dt.date) -> dt.date:
    return today - dt.timedelta(days=today.weekday())


def _is_eligible(p: dict[str, Any], jurisdiction: str | None, today: dt.date) -> bool:
    if not p.get("active"):
        return False
    if jurisdiction and jurisdiction not in (p.get("jurisdictions") or []):
        return False
    week_start = p.get("current_week_start")
    count = p.get("current_week_count") or 0
    cap = p.get("weekly_cap") or 0
    monday = _monday(today).isoformat()
    if week_start != monday:
        return True  # counter resets at next selection
    return count < cap


def _bump_weekly_counter(partner: dict[str, Any], today: dt.date) -> None:
    monday = _monday(today)
    week_start = partner.get("current_week_start")
    new_count = (partner.get("current_week_count") or 0) + 1
    if week_start != monday.isoformat():
        new_count = 1
    supabase_patch(
        "partners",
        params={"id": f"eq.{partner['id']}"},
        body={
            "current_week_count": new_count,
            "current_week_start": monday.isoformat(),
        },
    )


def select_partner(
    classification: str,
    recommended_partner: str,
    today: dt.date | None = None,
) -> dict[str, Any] | None:
    """Pick best partner for this classification + recommendation.

    Strategy: filter by jurisdiction + type; rank by tier ASC, then by
    current_week_count ASC (round-robin); skip those at weekly cap.
    Falls back to placeholder (tier=5) if no real partner matches.
    Returns None only if even the placeholder is missing/inactive.
    """
    today = today or dt.date.today()
    jurisdiction = CLASSIFICATION_TO_JURISDICTION.get(classification)
    wanted_types = _wanted_types(recommended_partner) or LAWYER_TYPES | REALTOR_TYPES

    rows = supabase_get(
        "partners",
        params={
            "active": "eq.true",
            "select": "id,name,email,type,jurisdictions,specialties,tier,"
            "weekly_cap,current_week_count,current_week_start,language_codes,active",
            "order": "tier.asc,current_week_count.asc",
        },
    )

    eligible_real = [
        p for p in rows
        if p["type"] in wanted_types
        and p["type"] != "placeholder"
        and _is_eligible(p, jurisdiction, today)
    ]
    if eligible_real:
        chosen = eligible_real[0]
        _bump_weekly_counter(chosen, today)
        return chosen

    placeholders = [p for p in rows if p["type"] == "placeholder" and _is_eligible(p, None, today)]
    if placeholders:
        chosen = placeholders[0]
        _bump_weekly_counter(chosen, today)
        return chosen

    logger.warning("no eligible partner found for %s / %s", classification, recommended_partner)
    return None
