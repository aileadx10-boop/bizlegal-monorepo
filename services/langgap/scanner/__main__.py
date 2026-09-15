"""LangGap scanner CLI.

Usage:
  python -m services.langgap.scanner --config services/langgap/config.json --run [--diff] [--max-pages 300] [--workers 6] [--outdir langgap_out]
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .queue import scan_target, write_target_output


def main(argv=None):
    ap = argparse.ArgumentParser(description="LangGap cross-language content-gap scanner")
    ap.add_argument("--config", required=True)
    ap.add_argument("--run", action="store_true")
    ap.add_argument("--diff", action="store_true", help="only NEW gaps vs previous run")
    ap.add_argument("--max-pages", type=int, default=300)
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--delay", type=float, default=0.25)
    ap.add_argument("--outdir", default="langgap_out")
    ap.add_argument("--stage-top", type=int, default=10, help="stage top-N OWN gaps to pending_review CSV")
    args = ap.parse_args(argv)

    cfg = json.loads(Path(args.config).read_text(encoding="utf-8"))
    outdir = Path(args.outdir)
    outdir.mkdir(exist_ok=True)
    (outdir / "state").mkdir(exist_ok=True)

    summary = []
    for target in cfg["targets"]:
        result = scan_target(target, args.max_pages, args.workers, args.delay, outdir / "state")
        if result is None:
            summary.append({"domain": target["domain"], "error": "no sitemap"})
            continue
        rows, manifest = result
        manifest = write_target_output(rows, manifest, outdir, args.diff)
        if target.get("role") == "own":
            _stage_pending_review(rows, manifest, outdir, args.stage_top)
        summary.append(manifest)

    (outdir / "run_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"\n[summary] -> {outdir / 'run_summary.json'}")
    for m in summary:
        if "error" in m:
            print(f"  {m['domain']}: ERROR {m['error']}")
        else:
            print(f"  {m['domain']}: {m['gap_count']} gap pages ({m['fetch_errors']} errors)")


def _stage_pending_review(rows: list[dict], manifest: dict, outdir: Path, top_n: int):
    """Stage top-N own gaps into a pending_review CSV for the review gate."""
    top = rows[:top_n]
    if not top:
        return
    target_dir = outdir / "pending_review"
    target_dir.mkdir(exist_ok=True)
    safe = manifest["domain"].replace(".", "_")
    csv_path = target_dir / f"{safe}_pending_review.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["url", "title", "missing", "localized_seed", "reviewer", "status"])
        w.writeheader()
        for r in top:
            w.writerow({
                "url": r["url"],
                "title": _guess_title(r["url"]),
                "missing": r["missing"],
                "localized_seed": "",
                "reviewer": "",
                "status": "pending-review",
            })
    print(f"  staged {len(top)} own-site gaps -> {csv_path}")


def _guess_title(url: str) -> str:
    slug = url.rstrip("/").split("/")[-1].replace("-", " ").strip()
    return slug or url


if __name__ == "__main__":
    if not sys.argv[1:]:
        print(main.__doc__)
        sys.exit(1)
    main()
