"""O-028 Phase A baseline generator.

Produces a dated week-0 baseline artifact for the growth engine, even
when GSC/Plausible data is not yet available — the file records the
measurement gaps explicitly (no fabricated numbers).
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def main(argv=None):
    ap = argparse.ArgumentParser(description="O-028 baseline generator")
    ap.add_argument("--outdir", default="langgap_out", help="where run_summary.json/latest baseline lives")
    ap.add_argument("--date", default=None, help="baseline date, default today")
    args = ap.parse_args(argv)

    outdir = Path(args.outdir)
    outdir.mkdir(exist_ok=True, parents=True)
    run_summary = outdir / "run_summary.json"
    coverage = {}
    if run_summary.exists():
        data = json.loads(run_summary.read_text(encoding="utf-8"))
        for m in data:
            if "error" in m:
                coverage[m["domain"]] = {"error": m["error"]}
            else:
                coverage[m["domain"]] = {
                    "role": m.get("role"),
                    "sitemap_urls": m.get("sitemap_urls", 0),
                    "pages_analyzed": m.get("pages_analyzed", 0),
                    "gap_count": m.get("gap_count", 0),
                    "fetch_errors": m.get("fetch_errors", 0),
                }

    baseline = {
        "schema": "bizlegal-ops-growth-baseline-v1",
        "date": args.date,
        "coverage_sitemap_placeholder": True,
        "gsc_clicks": None,
        "gsc_impressions": None,
        "plausible_uniques": None,
        "measurement_ready": {
            "gsc_verified": _env_flag("GSC_VERIFIED"),
            "plausible_created": _env_flag("PLAUSIBLE_CREATED"),
            "anthropic_credits_nonzero": _env_flag("ANTHROPIC_CREDITS_NONZERO"),
        },
        "coverage": coverage,
        "notes": "Week-0 baseline. GSC/Plausible numbers appear after Moses verifies properties.",
    }
    dest = outdir / "baseline-week0.json"
    dest.write_text(json.dumps(baseline, indent=2), encoding="utf-8")
    print(f"[baseline] -> {dest}")
    return baseline


def _env_flag(name: str) -> bool:
    import os
    return os.getenv(name) == "1"


if __name__ == "__main__":
    main()
