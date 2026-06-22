#!/usr/bin/env python3
"""
internal_linker.py
==================
Build #3 of 10 — $10K MRR SEO Plan.

Scans a directory of .mdx files and auto-injects internal product links
based on keyword matching. Only stdlib.

The linking table below is sourced from Section 5 of
decisions/SEO-SUBSCRIPTION-10K-MRR-PLAN.md.

Idempotent: never add a duplicate link.

Usage:
  python3 internal_linker.py --input DIR --output DIR
  python3 internal_linker.py --dry-run --input DIR
  python3 internal_linker.py --once FILE
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import pathlib
import re
import sys
from typing import Optional


# ---------------------------------------------------------------------------
# Linking table — keyword -> (URL, anchor).
# Source: decisions/SEO-SUBSCRIPTION-10K-MRR-PLAN.md, Section 5.
# Order matters: longer / more specific phrases first so they win over
# the shorter / more generic ones.
# ---------------------------------------------------------------------------

LINK_TABLE: list[tuple[str, str, str]] = [
    # (keyword_phrase, url, anchor_text)
    ("beneficial ownership reporting", "https://bizlegal-ai.com/agents/boi-tracker", "BOI tracking agent"),
    ("BOI filing deadline",            "https://bizlegal-ai.com/agents/boi-tracker", "BOI tracking agent"),
    ("beneficial owner",               "https://bizlegal-ai.com/agents/boi-tracker", "BOI tracking agent"),
    ("FinCEN BOI",                     "https://bizlegal-ai.com/agents/boi-tracker", "BOI tracking agent"),
    ("FinCEN",                         "https://bizlegal-ai.com/agents/boi-tracker", "BOI tracking agent"),
    ("BOI",                            "https://bizlegal-ai.com/agents/boi-tracker", "BOI tracking agent"),
    ("CTA compliance",                 "https://bizlegal-ai.com/agents/boi-tracker", "BOI tracking agent"),

    ("vendor security questionnaire",   "https://docai.bizlegal-ai.com/sqa", "SOC 2 questionnaire assistant"),
    ("security questionnaire",          "https://docai.bizlegal-ai.com/sqa", "SOC 2 questionnaire assistant"),
    ("SOC 2 questionnaire",             "https://docai.bizlegal-ai.com/sqa", "SOC 2 questionnaire assistant"),
    ("SOC 2 readiness",                 "https://docai.bizlegal-ai.com/sqa", "SOC 2 questionnaire assistant"),
    ("SOC 2 Type II",                   "https://docai.bizlegal-ai.com/sqa", "SOC 2 questionnaire assistant"),
    ("SOC 2 Type I",                    "https://docai.bizlegal-ai.com/sqa", "SOC 2 questionnaire assistant"),
    ("SOC 2 AI",                        "https://docai.bizlegal-ai.com/sqa", "SOC 2 questionnaire assistant"),
    ("SOC 2",                           "https://docai.bizlegal-ai.com/sqa", "SOC 2 questionnaire assistant"),

    ("standard contractual clauses",    "https://docai.bizlegal-ai.com/dpa", "DPA negotiation tool"),
    ("sub-processor agreement",         "https://docai.bizlegal-ai.com/dpa", "DPA negotiation tool"),
    ("sub-processor obligations",       "https://docai.bizlegal-ai.com/dpa", "DPA negotiation tool"),
    ("data processing agreement",       "https://docai.bizlegal-ai.com/dpa", "DPA negotiation tool"),
    ("Article 28",                      "https://docai.bizlegal-ai.com/dpa", "DPA negotiation tool"),
    ("DPA requirements",                "https://docai.bizlegal-ai.com/dpa", "DPA negotiation tool"),
    ("DPA",                             "https://docai.bizlegal-ai.com/dpa", "DPA negotiation tool"),
    ("GDPR",                            "https://docai.bizlegal-ai.com/dpa", "DPA negotiation tool"),

    ("blockchain wallet audit",         "https://tracr.bizlegal-ai.com/pricing", "wallet forensic report"),
    ("crypto transaction history",      "https://tracr.bizlegal-ai.com/pricing", "wallet forensic report"),
    ("crypto tax forensics",            "https://tracr.bizlegal-ai.com/pricing", "wallet forensic report"),
    ("DeFi transaction analysis",       "https://tracr.bizlegal-ai.com/pricing", "wallet forensic report"),
    ("wallet forensic",                 "https://tracr.bizlegal-ai.com/pricing", "wallet forensic report"),
    ("NFT tax",                         "https://tracr.bizlegal-ai.com/pricing", "wallet forensic report"),

    ("payment service provider license","https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),
    ("EMI license EU",                  "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),
    ("fintech license",                 "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),
    ("PSD2 compliance",                 "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),
    ("VASP registration",               "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),

    ("MAS DPT license",                 "https://brai.bizlegal-ai.com/pricing", "compliance health monitor"),
    ("MAS major payment institution",   "https://brai.bizlegal-ai.com/pricing", "compliance health monitor"),
    ("Singapore PSA payment",           "https://brai.bizlegal-ai.com/pricing", "compliance health monitor"),
    ("Singapore crypto",                "https://brai.bizlegal-ai.com/pricing", "compliance health monitor"),
    ("compliance health monitor",       "https://brai.bizlegal-ai.com/pricing", "compliance health monitor"),
    ("LexAudit",                        "https://brai.bizlegal-ai.com/pricing", "compliance health monitor"),

    ("DPDPA compliance",                "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),
    ("DPDPA",                           "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),
    ("India data localization",         "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),
    ("India digital personal",          "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),

    ("VARA virtual asset provider",     "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),
    ("VARA license",                    "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),
    ("ADGM crypto",                     "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),
    ("Dubai crypto regulation",         "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),
    ("UAE CBUAE",                       "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),
    ("VARA",                            "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),
    ("ADGM",                            "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),
    ("DIFC",                            "https://bizlegal-ai.com/agents/", "UAE regulatory intelligence"),

    ("regulatory intelligence",         "https://bizlegal-ai.com/pricing", "regulatory intelligence plan"),
    ("compliance agent",                "https://bizlegal-ai.com/pricing", "regulatory intelligence plan"),
]


# ---------------------------------------------------------------------------
# Front matter parsing
# ---------------------------------------------------------------------------

_FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", re.DOTALL)


def parse_mdx(path: pathlib.Path) -> tuple[dict, str, str]:
    """Return (front_matter_dict, body_text, full_text)."""
    text = path.read_text(encoding="utf-8")
    m = _FRONTMATTER_RE.match(text)
    if not m:
        return ({}, text, text)
    fm, body = m.group(1), m.group(2)
    out: dict = {}
    for line in fm.splitlines():
        if ":" not in line:
            continue
        key, _, val = line.partition(":")
        out[key.strip()] = val.strip().strip('"').strip("'")
    return out, body, text


# ---------------------------------------------------------------------------
# Link injection logic
# ---------------------------------------------------------------------------

_LINK_RE = re.compile(r"\[([^\]]*)\]\(([^)]+)\)")

# Build a single regex that matches any keyword phrase, case-insensitive,
# with word boundaries on the longest phrases.
_PATTERN = re.compile(
    r"(?<![\w/])(" + "|".join(re.escape(kw) for kw, _, _ in LINK_TABLE) + r")(?![\w/])",
    re.IGNORECASE,
)


def _count_links(body: str) -> int:
    return len(_LINK_RE.findall(body))


def _has_existing_link_to(body: str, url: str) -> bool:
    return any(u == url for _, u in _LINK_RE.findall(body))


def _inject_links(body: str, *, max_per_run: int = 4) -> tuple[str, list[dict]]:
    """Return (new_body, list of {phrase, url, anchor} dicts added)."""
    added: list[dict] = []
    # Track URLs already linked so we don't double-link to the same product
    seen_urls: set[str] = set()
    for _, u in _LINK_RE.findall(body):
        seen_urls.add(u)

    def repl(m: re.Match) -> str:
        if len(added) >= max_per_run:
            return m.group(0)
        phrase = m.group(1)
        # Find the LINK_TABLE entry whose keyword case-insensitively matches phrase
        for kw, url, anchor in LINK_TABLE:
            if kw.lower() == phrase.lower() and url not in seen_urls:
                added.append({"phrase": phrase, "url": url, "anchor": anchor})
                seen_urls.add(url)
                return f"[{anchor}]({url})"
        return m.group(0)

    new_body = _PATTERN.sub(repl, body)
    return new_body, added


_RELATED_FOOTER = """

---

## Related compliance agents

- [BOI tracking agent](https://bizlegal-ai.com/agents/boi-tracker) — automated FinCEN BOI filing and ownership tracking.
- [SOC 2 questionnaire assistant](https://docai.bizlegal-ai.com/sqa) — respond to vendor security questionnaires in under 30 minutes.
- [DPA negotiation tool](https://docai.bizlegal-ai.com/dpa) — generate GDPR Article 28 DPAs in one click.

*Last updated: {date}*
"""


def _ensure_related_footer(body: str) -> str:
    if "Related compliance agents" in body:
        return body
    if _count_links(body) >= 2:
        return body
    return body.rstrip() + _RELATED_FOOTER.format(date=_dt.date.today().isoformat())


# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------

def process_file(mdx_path: pathlib.Path, output_dir: Optional[pathlib.Path], *, dry_run: bool) -> dict:
    fm, body, full = parse_mdx(mdx_path)
    if not fm:
        return {"file": str(mdx_path), "skipped": True, "reason": "no front matter"}

    new_body, added = _inject_links(body)
    final_body = _ensure_related_footer(new_body)

    if not added:
        return {"file": str(mdx_path), "added": [], "footer_added": False, "skipped": True}

    if dry_run:
        return {"file": str(mdx_path), "added": added, "dry_run": True}

    new_text = f"---\n"
    for k, v in fm.items():
        new_text += f'{k}: "{v}"\n'
    new_text += f"---\n\n{final_body}"

    out_path = output_dir / mdx_path.name if output_dir else mdx_path
    out_path.write_text(new_text, encoding="utf-8")

    return {
        "file": str(out_path),
        "added": added,
        "footer_added": "Related compliance agents" not in body,
        "link_count": _count_links(final_body),
    }


def run(input_dir: pathlib.Path, output_dir: Optional[pathlib.Path], *, dry_run: bool) -> int:
    if not input_dir.exists():
        print(f"  [fatal] {input_dir} not found", file=sys.stderr)
        return 1
    files = sorted(input_dir.rglob("*.mdx"))
    if not files:
        print(f"  [warn] no .mdx files in {input_dir}", file=sys.stderr)
        return 1
    print(f"  scanning {len(files)} .mdx files in {input_dir}")
    total_added = 0
    files_modified = 0
    for mdx in files:
        result = process_file(mdx, output_dir, dry_run=dry_run)
        if result.get("skipped"):
            print(f"  [skip] {mdx.name}  reason={result.get('reason', 'no links to add')}")
            continue
        added = result["added"]
        total_added += len(added)
        files_modified += 1
        if dry_run:
            print(f"  [dry-run] {mdx.name}  +{len(added)} links")
            for a in added:
                print(f"             {a['phrase']:35s} -> {a['url']}")
        else:
            print(f"  [ok]    {mdx.name}  +{len(added)} links  "
                  f"footer={'yes' if result['footer_added'] else 'no'}  "
                  f"total_in_body={result['link_count']}")
            for a in added:
                print(f"             {a['phrase']:35s} -> {a['url']}")
    print(f"\n  modified {files_modified} of {len(files)} files, added {total_added} links")
    if dry_run:
        print("  (dry-run — no files written)")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--input", required=True, help="Directory of .mdx files")
    ap.add_argument("--output", help="Output directory (default: overwrite in place)")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--once", help="Process a single .mdx file")
    args = ap.parse_args()
    out = pathlib.Path(args.output) if args.output else None
    if args.once:
        result = process_file(pathlib.Path(args.once), out, dry_run=args.dry_run)
        print(json.dumps(result, indent=2))
        return 0
    return run(pathlib.Path(args.input), out, dry_run=args.dry_run)


if __name__ == "__main__":
    sys.exit(main())
