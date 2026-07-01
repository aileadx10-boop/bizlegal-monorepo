#!/usr/bin/env python3
"""
page_audit.py — daily SEO + GEO + AEO audit across all 8 BizLegal surfaces.

For each page on each surface, scores:
  SEO:    JSON-LD presence, robots.txt allow, sitemap inclusion, title length,
          meta description, canonical, last-updated visible, internal links
  GEO:    llms.txt link, structured data blocks, AI-crawler allow in robots
  AEO:    FAQPage schema, answer-first lead paragraph (40-60 words),
          comparison tables, glossary terms
  Index:  HTTP status, page size, response time

Writes:
  - /opt/bizlegal/decisions/SEO-AUDIT-<date>.md       (human-readable)
  - supabase seo_audits table                          (one row per page)

Cron: daily 06:00 UTC (after seo_content_writer at 02:00 — audit what was written)

Usage:
  python3 page_audit.py [--domain bizlegal-ai.com] [--output /path/to/report.md]
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


# ---------- CONFIG ----------

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SECRET = os.getenv("SUPABASE_SECRET", "")

SURFACES = {
    "hub":       ("bizlegal-ai.com", ["/", "/agents", "/pricing", "/ops", "/about", "/contact", "/blog"]),
    "tracr":     ("tracr.bizlegal-ai.com", ["/", "/pricing", "/scan", "/wallet-risk", "/report-sample", "/about", "/contact"]),
    "brai":      ("brai.bizlegal-ai.com",  ["/", "/pricing", "/report-sample", "/jurisdictions", "/about", "/contact"]),
    "lexaudit":  ("lexaudit.bizlegal-ai.com", ["/", "/pricing", "/frameworks", "/monitoring", "/report-sample", "/about", "/contact"]),
    "docai":     ("docai.bizlegal-ai.com", ["/", "/pricing", "/sqa", "/dpa", "/about", "/contact"]),
    "leadforge": ("leadforge.bizlegal-ai.com", ["/", "/pricing", "/icp", "/playbooks", "/about"]),
    "forge":     ("forge.bizlegal-ai.com", ["/", "/boi", "/passport", "/pricing", "/states", "/about"]),
    "blog":      ("blog.bizlegal-ai.com",  ["/", "/posts", "/categories", "/glossary", "/about"]),
}

AI_CRAWLERS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended",
               "CCBot", "anthropic-ai", "OAI-SearchBot"]


# ---------- HELPERS ----------

def fetch(url: str, timeout: int = 12) -> tuple[int, str, float]:
    """Returns (status_code, body, response_seconds). Uses Mozilla UA so CF
    lets us through; UA-Mozilla is blocked ONLY for sb_secret_ keys
    (Supabase PostgREST pitfall) — not for public web fetches."""
    t0 = time.time()
    try:
        req = urllib.request.Request(url, headers={
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "User-Agent": "Mozilla/5.0 (compatible; BizLegalBot/1.0; +https://bizlegal-ai.com/bot)",
            "Accept-Language": "en-US,en;q=0.5",
        })
        r = urllib.request.urlopen(req, timeout=timeout)
        body = r.read().decode("utf-8", errors="ignore")
        return r.status, body, time.time() - t0
    except urllib.error.HTTPError as e:
        return e.code, "", time.time() - t0
    except Exception:
        return 0, "", time.time() - t0


def score_page(surface: str, path: str, status: int, body: str, robots_body: str) -> dict:
    """Score a single page on SEO + GEO + AEO axes. Returns a dict."""
    seo = {}
    geo = {}
    aeo = {}

    # SEO
    seo["status"] = status
    seo["size_bytes"] = len(body)
    seo["has_title"] = bool(re.search(r"<title>[^<]+</title>", body, re.I))
    seo["title_len"] = len(re.search(r"<title>([^<]+)</title>", body, re.I).group(1)) if seo["has_title"] else 0
    seo["title_optimal"] = 30 <= seo["title_len"] <= 60
    seo["has_meta_desc"] = 'name="description"' in body.lower()
    seo["meta_desc_len"] = 0
    m = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']', body, re.I)
    if m:
        seo["meta_desc_len"] = len(m.group(1))
        seo["meta_desc_optimal"] = 120 <= seo["meta_desc_len"] <= 160
    else:
        seo["meta_desc_optimal"] = False
    seo["has_canonical"] = 'rel="canonical"' in body.lower()
    seo["has_og_image"] = 'og:image' in body.lower()
    seo["has_h1"] = bool(re.search(r"<h1[^>]*>", body, re.I))
    seo["internal_links"] = len(re.findall(r'<a [^>]*href=["\']/', body))
    seo["jsonld_count"] = body.count('"@type"')
    seo["has_organization"] = '"Organization"' in body
    seo["has_breadcrumb"] = '"BreadcrumbList"' in body
    seo["has_softwareapp"] = '"SoftwareApplication"' in body
    seo["has_faq"] = '"FAQPage"' in body
    seo["has_article"] = '"Article"' in body or '"BlogPosting"' in body
    seo["last_updated_visible"] = bool(re.search(r"last[- ]?updated[:\s]+\d{4}-\d{2}-\d{2}", body, re.I))
    seo["robots_disallowed"] = f"Disallow: {path}" in robots_body if robots_body else False

    # GEO
    geo["has_llms_link"] = "/llms.txt" in body
    geo["llms_txt_reachable"] = False  # set by caller
    geo["ai_crawlers_allowed"] = sum(1 for c in AI_CRAWLERS if f"Allow: {c}" in (robots_body or ""))
    geo["ai_crawlers_blocked"] = sum(1 for c in AI_CRAWLERS if f"Disallow: {c}" in (robots_body or ""))

    # AEO
    aeo["has_faq_schema"] = seo["has_faq"]
    aeo["has_faq_section"] = bool(re.search(r"<h[23][^>]*>.*\?.*</h[23]>", body, re.I | re.S))
    # answer-first paragraph: first 200 chars of body text after </h1>
    body_text = re.sub(r"<[^>]+>", " ", body)
    body_text = re.sub(r"\s+", " ", body_text).strip()
    aeo["lead_first_200"] = body_text[:200]
    aeo["lead_word_count"] = len(body_text.split()[:60])
    aeo["has_glossary"] = bool(re.search(r"<dl[^>]*>|<dt[^>]*>", body, re.I))
    aeo["has_table"] = "<table" in body.lower()
    aeo["has_comparison"] = bool(re.search(r"vs\.?|versus|comparison", body_text, re.I)) and aeo["has_table"]

    # Composite score 0-100
    seo_score = (
        (10 if status == 200 else 0) +
        (5 if seo["title_optimal"] else 0) +
        (5 if seo["meta_desc_optimal"] else 0) +
        (5 if seo["has_canonical"] else 0) +
        (5 if seo["has_og_image"] else 0) +
        (5 if seo["has_h1"] else 0) +
        (min(seo["internal_links"], 5)) +
        (min(seo["jsonld_count"] * 2, 20)) +
        (5 if seo["has_breadcrumb"] else 0) +
        (5 if seo["has_softwareapp"] else 0) +
        (5 if seo["has_faq"] else 0) +
        (5 if seo["last_updated_visible"] else 0)
    )
    geo_score = (
        (10 if geo["has_llms_link"] else 0) +
        (10 if geo["llms_txt_reachable"] else 0) +
        (min(geo["ai_crawlers_allowed"], 5) * 2) +
        (5 if seo["jsonld_count"] >= 3 else 0)
    )
    aeo_score = (
        (10 if aeo["has_faq_schema"] else 0) +
        (10 if aeo["has_faq_section"] else 0) +
        (10 if aeo["has_table"] else 0) +
        (5 if aeo["has_comparison"] else 0) +
        (5 if aeo["has_glossary"] else 0)
    )
    total = min(100, seo_score + geo_score + aeo_score)
    grade = "A" if total >= 80 else "B" if total >= 60 else "C" if total >= 40 else "D" if total >= 20 else "F"

    return {
        "surface": surface,
        "path": path,
        "url": f"https://{SURFACES[surface][0]}{path}",
        "seo": seo,
        "geo": geo,
        "aeo": aeo,
        "scores": {"seo": seo_score, "geo": geo_score, "aeo": aeo_score, "total": total, "grade": grade},
        "audit_ts": _dt.datetime.now(_dt.timezone.utc).isoformat(),
    }


def supabase_insert(table: str, row: dict) -> bool:
    """Batched: use a single POST per page, with short timeout. Failed inserts
    are silent (logged to stderr) — they don't block the audit."""
    if not (SUPABASE_URL and SUPABASE_SECRET):
        return False
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/{table}",
            data=json.dumps(row).encode(),
            method="POST",
            headers={
                "apikey": SUPABASE_SECRET,
                "Authorization": f"Bearer {SUPABASE_SECRET}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            },
        )
        urllib.request.urlopen(req, timeout=4)
        return True
    except Exception as e:
        print(f"  [sb] insert {table} err: {str(e)[:60]}", file=sys.stderr)
        return False


# ---------- MAIN ----------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", default="/opt/bizlegal/decisions")
    ap.add_argument("--date", default=_dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d"))
    ap.add_argument("--no-supabase", action="store_true",
                    help="skip Supabase writes (audit .md still produced)")
    args = ap.parse_args()

    rows = []
    robots_cache = {}

    print(f"[{args.date}] page_audit: scanning {sum(len(p) for _, p in SURFACES.values())} pages across {len(SURFACES)} surfaces", file=sys.stderr)

    for surface, (domain, paths) in SURFACES.items():
        # Cache robots.txt per domain
        if domain not in robots_cache:
            _, robots_cache[domain], _ = fetch(f"https://{domain}/robots.txt")
        # Check llms.txt reachability
        _, llms_body, _ = fetch(f"https://{domain}/llms.txt")
        llms_reach = len(llms_body) > 100

        for path in paths:
            status, body, dt = fetch(f"https://{domain}{path}")
            row = score_page(surface, path, status, body, robots_cache[domain])
            row["geo"]["llms_txt_reachable"] = llms_reach
            row["response_seconds"] = round(dt, 2)
            rows.append(row)
            if args.no_supabase:
                continue
            print(f"  {surface:10} {path:25} {status:4} score={row['scores']['total']:3} grade={row['scores']['grade']}", file=sys.stderr)
            # Persist to seo_pages (closest matching existing table). Schema is loose;
            # page_audit metadata is informational, not used by app code.
            supabase_insert("seo_pages", {
                "slug": f"audit/{surface}{path}",
                "title": f"{surface} {path}",
                "meta_desc": f"audit score={row['scores']['total']} grade={row['scores']['grade']}",
                "content": json.dumps(row),
                "page_type": "audit",
                "topic": "audit",
                "keywords": ["audit"],
                "schema_type": "AuditReport",
                "deployed": False,
                "published": False,
                "word_count": 0,
                "reading_time": 0,
                "read_time_minutes": 0,
                "created_at": row["audit_ts"],
                "updated_at": row["audit_ts"],
            })

    # Build report
    total = len(rows)
    by_grade = {}
    for r in rows:
        g = r["scores"]["grade"]
        by_grade[g] = by_grade.get(g, 0) + 1
    avg = sum(r["scores"]["total"] for r in rows) / max(total, 1)
    failing = [r for r in rows if r["scores"]["grade"] in ("D", "F") or r["seo"]["status"] != 200]

    out = pathlib.Path(args.output) / f"SEO-AUDIT-{args.date}.md"
    out.parent.mkdir(parents=True, exist_ok=True)

    md = []
    md.append(f"# SEO AUDIT — {args.date}\n")
    md.append(f"**Surfaces:** {len(SURFACES)} · **Pages:** {total} · **Average score:** {avg:.1f}/100\n")
    md.append(f"**Grade distribution:** " + " · ".join(f"{g}={by_grade.get(g,0)}" for g in "ABCDF") + "\n\n")
    md.append(f"## ⚠ Pages needing attention ({len(failing)})\n\n")
    md.append("| Surface | Path | Score | Grade | Status | Issues |\n|---|---|---|---|---|---|\n")
    for r in failing:
        issues = []
        if r["seo"]["status"] != 200:
            issues.append(f"HTTP {r['seo']['status']}")
        if r["seo"]["jsonld_count"] == 0:
            issues.append("no JSON-LD")
        if not r["seo"]["has_canonical"]:
            issues.append("no canonical")
        if not r["seo"]["last_updated_visible"]:
            issues.append("no last-updated")
        if not r["seo"]["has_faq"] and "pricing" in r["path"]:
            issues.append("pricing missing FAQPage")
        if not r["seo"]["has_softwareapp"] and any(k in r["path"] for k in ("/", "pricing", "scan", "boi", "sqa")):
            issues.append("missing SoftwareApplication")
        if r["geo"]["ai_crawlers_allowed"] == 0:
            issues.append("AI crawlers not allowed in robots")
        md.append(f"| {r['surface']} | {r['path']} | {r['scores']['total']} | {r['scores']['grade']} | {r['seo']['status']} | {', '.join(issues) or '—'} |\n")
    md.append(f"\n## ✓ Top performers\n\n")
    top = sorted(rows, key=lambda x: -x["scores"]["total"])[:8]
    md.append("| Surface | Path | Score | Grade | Schema types |\n|---|---|---|---|---|\n")
    for r in top:
        types = []
        if r["seo"]["has_faq"]: types.append("FAQ")
        if r["seo"]["has_softwareapp"]: types.append("SoftwareApp")
        if r["seo"]["has_breadcrumb"]: types.append("Breadcrumb")
        if r["seo"]["has_organization"]: types.append("Org")
        if r["seo"]["has_article"]: types.append("Article")
        md.append(f"| {r['surface']} | {r['path']} | {r['scores']['total']} | {r['scores']['grade']} | {', '.join(types) or '—'} |\n")
    md.append(f"\n## Summary by surface\n\n")
    md.append("| Surface | Pages | Avg score | Status 200 | Schema coverage |\n|---|---|---|---|---|\n")
    for surface in SURFACES:
        srows = [r for r in rows if r["surface"] == surface]
        if not srows: continue
        s_avg = sum(r["scores"]["total"] for r in srows) / len(srows)
        s_200 = sum(1 for r in srows if r["seo"]["status"] == 200)
        s_schema = sum(1 for r in srows if r["seo"]["jsonld_count"] >= 3)
        md.append(f"| {surface} | {len(srows)} | {s_avg:.1f} | {s_200}/{len(srows)} | {s_schema}/{len(srows)} |\n")

    out.write_text("".join(md), encoding="utf-8")
    print(f"  wrote {out}", file=sys.stderr)
    print(f"  summary: avg={avg:.1f} grades={dict(by_grade)} failing={len(failing)}", file=sys.stderr)


if __name__ == "__main__":
    main()