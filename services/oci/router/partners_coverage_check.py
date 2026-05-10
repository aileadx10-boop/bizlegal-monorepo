"""Coverage-gap report for the OCI partner roster.

W4.3 of the approved Week 3-4 plan. Reads `partners.py`'s classification
catalog, queries Supabase for the active partner roster, and reports
which classifications have zero / under-capacity coverage so Moses
knows where outreach gap is.

Run once to triage:
    cd services/oci/router
    pip install -r requirements.txt    # one-time, brings httpx + redis + dotenv
    python partners_coverage_check.py

Run from anywhere — script auto-loads `.env` from CWD or the router
directory. Exit code is 0 even if gaps are found (this is a report,
not a CI gate). Note: `redis` is a transitive import via storage.py
even though this script only reads Supabase; the router's
requirements.txt covers it.

Output:
    - Pretty markdown table to stdout (default)
    - --json emits structured JSON for piping to jq / dashboards
    - --strict exit-codes 1 when ANY non-LOW_VALUE classification has
      zero eligible real partners (use in a weekly cron alert)

Definitions (mirrors partners.py select_partner):
    - "real partner"  = active = true, type != 'placeholder'
    - "eligible"      = jurisdiction matches + under this-week's cap
    - "coverage gap"  = a classification with 0 eligible real partners
                        (placeholder fallback only)
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable

# Allow `python partners_coverage_check.py` from anywhere — resolve
# imports relative to the file's directory.
HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

try:
    from dotenv import load_dotenv  # type: ignore[import-not-found]
except ImportError:  # pragma: no cover — dotenv is optional
    load_dotenv = None  # type: ignore[assignment]

from partners import (  # noqa: E402
    CLASSIFICATION_TO_JURISDICTION,
    LAWYER_TYPES,
    REALTOR_TYPES,
    _is_eligible,
)
from storage import supabase_get  # noqa: E402


def _load_env() -> None:
    if load_dotenv is None:
        return
    # Try CWD first, then the router directory.
    for candidate in (Path.cwd() / ".env", HERE / ".env"):
        if candidate.is_file():
            load_dotenv(candidate)
            return


def _wanted_types_for(classification: str) -> set[str]:
    """Best-effort guess of partner types likely to fit this classification.

    Mirrors the heuristics in partners._wanted_types but without the
    `recommended_partner` LLM hint — we want roster coverage broadly,
    not partner pick for a single lead.
    """
    if classification == "UAE_REAL_ESTATE":
        return REALTOR_TYPES | LAWYER_TYPES
    if classification == "SG_BUSINESS_SETUP":
        return LAWYER_TYPES
    if classification == "EU_US_BUSINESS":
        return LAWYER_TYPES
    if classification == "LEGAL_RISK_REPORT":
        return LAWYER_TYPES
    return set()  # LOW_VALUE — no routing needed


def _fetch_active_partners() -> list[dict[str, Any]]:
    return supabase_get(
        "partners",
        params={
            "active": "eq.true",
            "select": (
                "id,name,email,type,jurisdictions,specialties,tier,"
                "weekly_cap,current_week_count,current_week_start,active"
            ),
            "order": "tier.asc,name.asc",
        },
    )


def _coverage_for(
    classification: str,
    partners: Iterable[dict[str, Any]],
    today: dt.date,
) -> dict[str, Any]:
    jurisdiction = CLASSIFICATION_TO_JURISDICTION.get(classification)
    wanted = _wanted_types_for(classification)
    real_partners = [
        p for p in partners
        if p.get("type") in wanted and p.get("type") != "placeholder"
    ]
    eligible_now = [
        p for p in real_partners
        if _is_eligible(p, jurisdiction, today)
    ]
    by_type: dict[str, int] = defaultdict(int)
    for p in real_partners:
        by_type[p.get("type") or "unknown"] += 1
    return {
        "classification": classification,
        "jurisdiction": jurisdiction,
        "wanted_types": sorted(wanted),
        "real_partners_total": len(real_partners),
        "eligible_now": len(eligible_now),
        "by_type": dict(by_type),
        "is_gap": len(eligible_now) == 0 and classification != "LOW_VALUE",
        "sample_eligible": [
            {"id": p.get("id"), "name": p.get("name"), "tier": p.get("tier"), "type": p.get("type")}
            for p in eligible_now[:3]
        ],
    }


def _placeholders(partners: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    return [p for p in partners if p.get("type") == "placeholder"]


def _format_markdown(report: dict[str, Any]) -> str:
    lines: list[str] = [
        "# OCI Partner Roster — Coverage Gap Report",
        "",
        f"_Generated {report['generated_at']}_",
        "",
        f"**Active partners total:** {report['active_partners_total']}  ",
        f"**Placeholders configured:** {report['placeholders_configured']}  ",
        f"**Coverage gaps (non-LOW_VALUE w/ zero eligible real partners):** "
        f"{report['gap_count']}",
        "",
        "## Per-classification coverage",
        "",
        "| Classification | Jurisdiction | Real partners | Eligible now | By type | Status |",
        "|---|---|---:|---:|---|---|",
    ]
    for row in report["per_classification"]:
        status = "🚨 GAP" if row["is_gap"] else (
            "✅ OK" if row["eligible_now"] > 0 else "—"
        )
        by_type = ", ".join(f"{k}:{v}" for k, v in sorted(row["by_type"].items())) or "—"
        lines.append(
            f"| {row['classification']} | {row['jurisdiction'] or '*any*'} | "
            f"{row['real_partners_total']} | {row['eligible_now']} | {by_type} | {status} |"
        )

    lines += [
        "",
        "## Outreach guidance",
        "",
    ]
    if report["gap_count"] == 0:
        lines.append("All non-LOW_VALUE classifications have ≥1 eligible real partner. ✅")
    else:
        lines.append("Each gap below routes through the placeholder fallback today,")
        lines.append("which means Moses sees the partner email but no real partner")
        lines.append("acts on the lead. Outreach priorities:")
        lines.append("")
        for row in report["per_classification"]:
            if not row["is_gap"]:
                continue
            lines.append(
                f"- **{row['classification']}** "
                f"({row['jurisdiction'] or 'any jurisdiction'}) — needs at least one "
                f"of: `{', '.join(row['wanted_types'])}`"
            )
    return "\n".join(lines) + "\n"


def build_report(today: dt.date | None = None) -> dict[str, Any]:
    today = today or dt.date.today()
    partners = _fetch_active_partners()
    classifications = [c for c in CLASSIFICATION_TO_JURISDICTION if c != "LOW_VALUE"]
    per_classification = [
        _coverage_for(cls, partners, today) for cls in classifications
    ]
    return {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "active_partners_total": len(partners),
        "placeholders_configured": len(_placeholders(partners)),
        "per_classification": per_classification,
        "gap_count": sum(1 for row in per_classification if row["is_gap"]),
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="emit JSON instead of markdown")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="exit code 1 when any non-LOW_VALUE classification has zero eligible real partners",
    )
    args = parser.parse_args(argv)

    _load_env()
    if not os.environ.get("SUPABASE_URL") or not os.environ.get("SUPABASE_SECRET"):
        print(
            "[partners_coverage_check] SUPABASE_URL + SUPABASE_SECRET required. "
            "Run from a directory with a .env or set them in the shell.",
            file=sys.stderr,
        )
        return 2

    try:
        report = build_report()
    except Exception as err:
        print(f"[partners_coverage_check] failed to query Supabase: {err}", file=sys.stderr)
        return 2

    if args.json:
        json.dump(report, sys.stdout, indent=2)
        sys.stdout.write("\n")
    else:
        sys.stdout.write(_format_markdown(report))

    if args.strict and report["gap_count"] > 0:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
