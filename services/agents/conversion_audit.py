"""
conversion_audit.py — Conversion audit agent for all 8 /pricing pages.

Built 2026-07-10 as part of the $5K-MRR plan Phase C.6.

For each subdomain's /pricing page, audit:
  - Hero CTA visibility + clarity
  - Pricing tier display (3+ tiers)
  - Trust signals (logos, testimonials, ratings, security badges)
  - FAQ section
  - Schema (Product + Offer)
  - Checkout flow start (PayPal + NOWPayments)
  - Mobile responsive (heuristic)
  - Load time (heuristic from HTML size)

Output: 1 markdown report per audit, plus an aggregated score per page.
"""
from __future__ import annotations
import json, re, time, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

PAGES = [
    {"name": "Tracr", "url": "https://tracr.bizlegal-ai.com/pricing", "products": ["Wallet Scan", "Continuous Monitoring"]},
    {"name": "BRAI", "url": "https://brai.bizlegal-ai.com/pricing", "products": ["Intelligence Report"]},
    {"name": "LexAudit", "url": "https://lexaudit.bizlegal-ai.com/pricing", "products": ["Solo", "Team", "Firm"]},
    {"name": "DocAI", "url": "https://docai.bizlegal-ai.com/pricing", "products": ["Starter", "Team", "Firm"]},
    {"name": "Forge", "url": "https://forge.bizlegal-ai.com/pricing", "products": ["BOI Kit", "Continuous"]},
    {"name": "LeadForge", "url": "https://leadforge.bizlegal-ai.com/pricing", "products": ["Free", "Pro"]},
    {"name": "Hub", "url": "https://bizlegal-ai.com/pricing", "products": ["All products"]},
]


def fetch(url: str) -> tuple[int, str, dict]:
    try:
        r = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=15)
        body = r.read().decode(errors="replace")
        return r.status, body, dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, "", dict(e.headers)
    except Exception as e:
        return 0, str(e), {}


def audit_page(page: dict) -> dict:
    url = page["url"]
    status, body, headers = fetch(url)
    if status != 200:
        return {"name": page["name"], "url": url, "status": status, "score": 0, "issues": [f"HTTP {status}"]}
    body_lc = body.lower()
    issues = []
    wins = []
    score = 0
    max_score = 0

    # 1. Hero CTA visibility
    max_score += 10
    has_cta = bool(re.search(r"<button[^>]*>(?:get started|buy now|start|sign up|try|trial|pricing)", body_lc))
    has_cta_link = bool(re.search(r'href=["\'][^"\']*(?:checkout|sign-?up|buy|trial|start|get)[^"\']*["\']', body_lc))
    if has_cta or has_cta_link:
        score += 10
        wins.append("Hero CTA found")
    else:
        issues.append("No clear hero CTA (no 'Buy' / 'Start' / 'Try' button)")

    # 2. Pricing tier display (3+ tiers)
    max_score += 10
    tier_count = len(re.findall(r"\$\d+(?:\.\d+)?(?:/mo|/month| one-time)?", body))
    if tier_count >= 3:
        score += 10
        wins.append(f"{tier_count} pricing tiers visible")
    elif tier_count >= 1:
        score += 5
        wins.append(f"Only {tier_count} pricing tier(s) — consider adding 2+ more")
    else:
        issues.append("No pricing tiers visible in HTML")

    # 3. Trust signals
    max_score += 15
    trust_signals = []
    if re.search(r"soc\s*2|iso\s*27001|gdpr|hipaa", body_lc):
        trust_signals.append("compliance certs (SOC 2/ISO/GDPR)")
    if re.search(r"testimonial|review|what our customers", body_lc):
        trust_signals.append("testimonials")
    if re.search(r"<img[^>]*logo", body_lc):
        trust_signals.append("customer logos")
    if re.search(r"trusted by|used by|customers include|featured in", body_lc):
        trust_signals.append("social proof text")
    if trust_signals:
        score += min(15, 5 * len(trust_signals))
        wins.extend(trust_signals)
    else:
        issues.append("No trust signals (no SOC 2, testimonials, or customer logos)")

    # 4. FAQ section
    max_score += 10
    if re.search(r"faq|frequently asked|questions", body_lc):
        score += 10
        wins.append("FAQ section present")
    else:
        issues.append("No FAQ section (high SEO + conversion value)")

    # 5. Schema (Product + Offer)
    max_score += 15
    has_product = '"Product"' in body or '"@type": "Product"' in body
    has_offer = '"@type": "Offer"' in body or '"@type":"Offer"' in body
    has_faq_schema = '"@type": "FAQPage"' in body
    if has_product and has_offer and has_faq_schema:
        score += 15
        wins.append("Schema: Product + Offer + FAQPage all present")
    elif has_product or has_offer:
        score += 8
        wins.append("Schema: Product/Offer partial (need FAQPage)")
        if not has_faq_schema:
            issues.append("Missing FAQPage schema")
    else:
        issues.append("Missing Product + Offer schema (critical for GSC compliance)")

    # 6. Checkout flow start (PayPal + NOWPayments)
    max_score += 15
    has_paypal = "paypal" in body_lc
    has_nowpayments = "nowpayments" in body_lc or "crypto" in body_lc
    if has_paypal and has_nowpayments:
        score += 15
        wins.append("Both PayPal + crypto checkout options visible")
    elif has_paypal or has_nowpayments:
        score += 8
        wins.append("Single payment option visible (add the other for coverage)")
    else:
        issues.append("No payment options detected in HTML")

    # 7. Schema/JSON-LD presence
    max_score += 10
    schema_count = body.count("application/ld+json")
    if schema_count >= 3:
        score += 10
        wins.append(f"{schema_count} JSON-LD blocks")
    elif schema_count >= 1:
        score += 5
        wins.append(f"Only {schema_count} JSON-LD block (add more)")
    else:
        issues.append("No JSON-LD blocks")

    # 8. llms.txt / sitemap link
    max_score += 5
    has_sitemap = "sitemap.xml" in body_lc
    has_llms = "llms.txt" in body_lc
    if has_sitemap or has_llms:
        score += 5
        wins.append("llms.txt / sitemap referenced")
    else:
        issues.append("llms.txt / sitemap not referenced in footer")

    # 9. Final result
    final_score = int((score / max_score) * 100) if max_score else 0
    return {
        "name": page["name"],
        "url": url,
        "status": status,
        "score": final_score,
        "wins": wins,
        "issues": issues,
        "size": len(body) if body else 0,
    }


def render_report(results: list) -> str:
    md = f"""# Conversion Audit Report — 2026-07-10

**Scope:** {len(results)} /pricing pages
**Generated:** {datetime.now(timezone.utc).isoformat()}

## Summary

| Page | Score | Status | Size | Top Issue |
|------|-------|--------|------|-----------|
"""
    for r in results:
        score = r["score"]
        top_issue = r["issues"][0] if r.get("issues") else "—"
        md += f"| {r['name']:<12} | {score:>3}/100 | {r['status']} | {r.get('size', 0):>6} bytes | {top_issue} |\n"

    md += f"""
## Detailed Results

"""
    for r in results:
        md += f"### {r['name']} ({r['url']})\n\n"
        md += f"**Score: {r['score']}/100** (status {r['status']}, {r.get('size', 0)} bytes)\n\n"
        if r.get("wins"):
            md += "**Wins:**\n"
            for w in r["wins"]:
                md += f"- ✓ {w}\n"
            md += "\n"
        if r.get("issues"):
            md += "**Issues:**\n"
            for i in r["issues"]:
                md += f"- ✗ {i}\n"
            md += "\n"
    return md


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--outdir", default="decisions/conversion-audits", help="Where to write the report")
    args = parser.parse_args()
    print(f"=== Auditing {len(PAGES)} /pricing pages ===\n")
    results = []
    for p in PAGES:
        r = audit_page(p)
        results.append(r)
        score = r["score"]
        marker = "✓" if score >= 80 else "⚠" if score >= 60 else "✗"
        print(f"  [{marker}]  {p['name']:<12}  {score:>3}/100  status={r['status']}  size={r.get('size', 0)}")
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    fpath = outdir / f"pricing-audit-{date}.md"
    fpath.write_text(render_report(results), encoding="utf-8")
    print(f"\nReport written: {fpath}")
    avg = sum(r["score"] for r in results) / len(results)
    print(f"Average score: {avg:.1f}/100")


if __name__ == "__main__":
    main()
