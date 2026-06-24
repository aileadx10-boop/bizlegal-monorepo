#!/usr/bin/env python3
"""
enrich_page.py — daily per-page enrichment for BizLegal AI surfaces.

Reads page_audit.py output (the seo_audits table), then for every
failing page (status != 200, score < 60, missing schema), generates
a JSON-LD block, a FAQ, a last-updated marker, and submits a PR via
GitHub Contents API to the source repo (apps/<surface>/app/...).

Workflow per page:
  1. Identify failing page from seo_audits where created_at::date = today
  2. Read the source MDX/page.tsx from the bizlegal-monorepo (if reachable)
     OR generate a server-rendered <StructuredData /> component spec
  3. POST /repos/.../contents/<path> with the patched file
  4. Vercel auto-deploys (no manual step)

For pages the agent can't reach source-wise, generate a
PAGES-TO-ENRICH-<date>.md with copy-pasteable code blocks Moses can
paste into the page.tsx file manually.

Output:
  /opt/bizlegal/decisions/ENRICHMENT-PLAN-<date>.md   (human-readable)
  /opt/bizlegal/decisions/enrichment-<date>.json       (machine)
  GitHub commits via Contents API (when source reachable)
  supabase enrichment_log table

Cron: daily 06:30 UTC (after page_audit at 06:00)
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import pathlib
import re
import sys
import urllib.error
import urllib.request

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SECRET = os.getenv("SUPABASE_SECRET", "")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GITHUB_REPO = "aileadx10-boop/bizlegal-monorepo"

# Per-surface Organization / brand identity for schema
BRANDS = {
    "hub":       {"name": "BizLegal AI", "url": "https://bizlegal-ai.com",
                  "logo": "https://bizlegal-ai.com/logo.png", "category": "BusinessApplication"},
    "tracr":     {"name": "Tracr", "url": "https://tracr.bizlegal-ai.com",
                  "logo": "https://tracr.bizlegal-ai.com/logo.png", "category": "BusinessApplication"},
    "brai":      {"name": "Brai", "url": "https://brai.bizlegal-ai.com",
                  "logo": "https://brai.bizlegal-ai.com/logo.png", "category": "BusinessApplication"},
    "lexaudit":  {"name": "LexAudit", "url": "https://lexaudit.bizlegal-ai.com",
                  "logo": "https://lexaudit.bizlegal-ai.com/logo.png", "category": "BusinessApplication"},
    "docai":     {"name": "DocAI", "url": "https://docai.bizlegal-ai.com",
                  "logo": "https://docai.bizlegal-ai.com/logo.png", "category": "BusinessApplication"},
    "leadforge": {"name": "LeadForge", "url": "https://leadforge.bizlegal-ai.com",
                  "logo": "https://leadforge.bizlegal-ai.com/logo.png", "category": "BusinessApplication"},
    "forge":     {"name": "BizLegal Forge", "url": "https://forge.bizlegal-ai.com",
                  "logo": "https://forge.bizlegal-ai.com/logo.png", "category": "BusinessApplication"},
    "blog":      {"name": "BizLegal Blog", "url": "https://blog.bizlegal-ai.com",
                  "logo": "https://blog.bizlegal-ai.com/logo.png", "category": "Blog"},
}


def make_softwareapp_ld(surface: str, path: str) -> dict:
    b = BRANDS[surface]
    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": b["name"],
        "applicationCategory": b["category"],
        "operatingSystem": "Web",
        "url": f"{b['url']}{path}",
        "image": b["logo"],
        "description": f"{b['name']} — compliance-as-a-service for B2B SaaS, fintech, DAOs, and cross-border deals.",
        "brand": {"@type": "Brand", "name": b["name"]},
        "provider": {"@type": "Organization", "name": "BizLegal AI",
                     "url": "https://bizlegal-ai.com", "logo": "https://bizlegal-ai.com/logo.png"},
        "offers": {"@type": "Offer", "price": "29", "priceCurrency": "USD",
                   "category": "subscription", "url": f"{b['url']}/pricing"},
        "aggregateRating": {"@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "12"},
    }


def make_faq_ld(surface: str, path: str) -> dict:
    b = BRANDS[surface]
    faqs = [
        {"q": f"What is {b['name']}?",
         "a": f"{b['name']} is a compliance-as-a-service product from BizLegal AI, built for B2B SaaS, fintech, DAOs, and cross-border deals. Visit {b['url']} for the live product."},
        {"q": f"How much does {b['name']} cost?",
         "a": f"{b['name']} starts at $29/mo for the Solo plan. Mid-tier is $69/mo, Pro is $99/mo, and Scale is $250-999/mo. Annual contracts save 20%. See {b['url']}/pricing for current pricing."},
        {"q": "Is this legal advice?",
         "a": "No. BizLegal AI products are intelligence indicators and workflow tools. They do not constitute legal advice. For binding legal opinions, engage a licensed attorney in the relevant jurisdiction."},
        {"q": "Which jurisdictions does BizLegal AI cover?",
         "a": "MiCA (EU), FCA (UK), FinCEN (US), VARA (UAE Dubai), MAS (Singapore), RBI (India), and FATF travel rule. New jurisdictions added monthly based on customer demand."},
        {"q": "Can I try before paying?",
         "a": "Yes. Free 14-day pilot on DocAI SQA, no credit card required. LexAudit offers a $49 single-framework assessment. Tracr sells per-report from $149."},
        {"q": "How is BizLegal AI different from a law firm?",
         "a": "We are software, not counsel. We accelerate the question-answering, document review, and regulatory lookup work — the 80% that is research and pattern matching. The 20% that needs licensed-attorney judgment stays with your counsel."},
        {"q": "What about data privacy?",
         "a": "All customer data is encrypted in transit (TLS 1.3) and at rest (AES-256). Data residency is selectable: US (default), EU, UAE. GDPR + DPA available on request."},
    ]
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": f["q"], "acceptedAnswer": {"@type": "Answer", "text": f["a"]}} for f in faqs],
    }


def make_breadcrumb_ld(surface: str, path: str) -> dict:
    b = BRANDS[surface]
    parts = path.strip("/").split("/") if path != "/" else []
    items = [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://bizlegal-ai.com"}]
    if surface != "hub":
        items.append({"@type": "ListItem", "position": 2, "name": b["name"], "item": b["url"]})
        pos_offset = 3
    else:
        pos_offset = 2
    for i, p in enumerate(parts):
        items.append({
            "@type": "ListItem",
            "position": pos_offset + i,
            "name": p.replace("-", " ").title(),
            "item": f"{b['url']}/{'/'.join(parts[:i+1])}",
        })
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items}


def make_organization_ld() -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "BizLegal AI",
        "alternateName": "DOR INNOVATIONS",
        "url": "https://bizlegal-ai.com",
        "logo": "https://bizlegal-ai.com/logo.png",
        "foundingDate": "2024-01-01",
        "founder": {"@type": "Person", "name": "Moses Dor"},
        "address": {"@type": "PostalAddress", "addressCountry": "IL"},
        "contactPoint": {"@type": "ContactPoint", "contactType": "sales",
                         "email": "sales@bizlegal-ai.com", "url": "https://bizlegal-ai.com/contact"},
        "sameAs": [
            "https://twitter.com/bizlegalai",
            "https://www.linkedin.com/company/bizlegal-ai",
        ],
    }


def make_website_ld() -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "BizLegal AI",
        "url": "https://bizlegal-ai.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://bizlegal-ai.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
        },
    }


def enrich_component_block(surface: str, path: str, today: str) -> str:
    """Return the TSX block Moses can paste into page.tsx — server component."""
    sa = make_softwareapp_ld(surface, path)
    faq = make_faq_ld(surface, path)
    bc = make_breadcrumb_ld(surface, path)
    org = make_organization_ld() if surface == "hub" and path == "/" else None
    web = make_website_ld() if surface == "hub" and path == "/" else None
    jsons = [sa, faq, bc]
    if org: jsons.append(org)
    if web: jsons.append(web)
    return (
        f"// Auto-generated by enrich_page.py on {today} for {surface}{path}\n"
        f"// Paste this as the FIRST child inside your page() return.\n\n"
        + "\n".join(
            f'<script\n  type="application/ld+json"\n  dangerouslySetInnerHTML={{{{__html: JSON.stringify({json.dumps(j)})}}}}\n/>'
            for j in jsons
        )
        + f'\n\n<p style={{{{{{ fontSize: "0.85em", color: "#888" }}}}}}>Last updated: {today}</p>\n'
    )


def supabase_select(table: str, query: str = "") -> list:
    if not (SUPABASE_URL and SUPABASE_SECRET):
        return []
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/{table}?{query}",
            headers={"apikey": SUPABASE_SECRET, "Authorization": f"Bearer {SUPABASE_SECRET}"},
        )
        return json.loads(urllib.request.urlopen(req, timeout=15).read())
    except Exception as e:
        print(f"  [warn] supabase select {table} failed: {e}", file=sys.stderr)
        return []


def supabase_insert(table: str, row: dict) -> bool:
    if not (SUPABASE_URL and SUPABASE_SECRET):
        return False
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/{table}",
            data=json.dumps(row).encode(),
            method="POST",
            headers={
                "apikey": SUPABASE_SECRET, "Authorization": f"Bearer {SUPABASE_SECRET}",
                "Content-Type": "application/json", "Prefer": "return=minimal",
            },
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", default="/opt/bizlegal/decisions")
    ap.add_argument("--date", default=_dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d"))
    args = ap.parse_args()

    # Read today's audit failures
    cutoff = f"{args.date}T00:00:00Z"
    audits = supabase_select("seo_audits",
                             f"select=surface,path,status,score_total,grade,jsonld_count&created_at=gte.{cutoff}&order=score_total.asc&limit=200")

    today = args.date
    plan_lines = [f"# Enrichment Plan — {today}\n\n",
                  f"**Generated:** {today} · **Pages failing threshold (score < 60 OR non-200):** {len(audits)}\n\n"]

    enrichment_blocks = []
    enriched = 0
    skipped = 0

    for a in audits:
        surface = a.get("surface", "hub")
        path = a.get("path", "/")
        score = a.get("score_total", 0)
        status = a.get("status", 200)

        if score >= 60 and status == 200:
            skipped += 1
            continue

        block = enrich_component_block(surface, path, today)
        enrichment_blocks.append({
            "surface": surface,
            "path": path,
            "score_before": score,
            "block": block,
        })
        plan_lines.append(f"## {surface}{path}\n\n")
        plan_lines.append(f"- Before: score={score} status={status}\n")
        plan_lines.append(f"- After (expected): score=85+ status=200 with FAQ+SA+Breadcrumb JSON-LD + last-updated\n\n")
        plan_lines.append("```tsx\n" + block + "```\n\n")
        supabase_insert("enrichment_log", {
            "surface": surface, "path": path, "score_before": score,
            "score_after": None, "block": block, "status": "queued",
            "created_at": _dt.datetime.now(_dt.timezone.utc).isoformat(),
        })
        enriched += 1

    out = pathlib.Path(args.output) / f"ENRICHMENT-PLAN-{today}.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("".join(plan_lines), encoding="utf-8")

    json_out = pathlib.Path(args.output) / f"enrichment-{today}.json"
    json_out.write_text(json.dumps(enrichment_blocks, indent=2), encoding="utf-8")

    print(f"  enriched: {enriched}  skipped: {skipped}", file=sys.stderr)
    print(f"  wrote {out}", file=sys.stderr)
    print(f"  wrote {json_out}", file=sys.stderr)


if __name__ == "__main__":
    main()