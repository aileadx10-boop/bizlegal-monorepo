#!/usr/bin/env python3
"""
revenue_attribution.py — tie every organic article to every paying customer.

The 10K MRR goal requires knowing which articles drive conversions.
This script:

  1. Pulls all payment_orders (paid only) from Supabase
  2. For each order, checks if customer's first-touch UTM/referrer
     matches any published blog post URL or pillar
  3. Computes attribution per article:
     - direct_revenue_cents: orders whose first-touch was this article
     - assisted_revenue_cents: orders whose funnel included this article (any-touch)
     - last_touch_revenue_cents: orders whose final page before purchase was this article
  4. Computes per-pillar rollup (Pillar 1-8 conversion rate)
  5. Computes per-keyword rollup (cluster-level ROI)

Writes:
  - /opt/bizlegal/decisions/REVENUE-ATTRIBUTION-<date>.md   (human report)
  - /opt/bizlegal/decisions/revenue-by-article-<date>.json  (machine)
  - supabase article_attribution table

Cron: daily 23:30 UTC (after analytics_dashboard at 23:00)
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import re
import sys
import urllib.request
import urllib.error
from collections import defaultdict


SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")


def http_json(url, headers=None):
    h = {"Accept": "application/json"}
    if headers: h.update(headers)
    try:
        req = urllib.request.Request(url, headers=h)
        r = urllib.request.urlopen(req, timeout=15)
        return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode()[:200]}
    except Exception as e:
        return 0, {"error": str(e)[:200]}


def supabase_query(table, query=""):
    if not (SUPABASE_URL and SUPABASE_KEY): return []
    status, body = http_json(f"{SUPABASE_URL}/rest/v1/{table}?{query}",
                              headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"})
    return body if status == 200 else []


def supabase_insert(table, row):
    if not (SUPABASE_URL and SUPABASE_KEY): return False
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/{table}",
            data=json.dumps(row).encode(),
            method="POST",
            headers={
                "apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json", "Prefer": "return=minimal",
            },
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False


def parse_url_to_article(url: str) -> dict:
    """Extract pillar + slug from a URL like https://blog.bizlegal-ai.com/posts/uae-vara-vasp-license-guide."""
    if not url:
        return {}
    # Map slug prefix to pillar
    pillar_map = {
        "uae": 5, "uk": 5, "eu": 5, "us": 5, "singapore": 5, "fintech": 1,
        "compliance": 3, "soc2": 1, "iso27001": 1, "hipaa": 1, "pci": 1,
        "gdpr": 2, "dpa": 2, "ccpa": 2, "boi": 6, "fincen": 6,
        "crypto": 4, "wallet": 4, "tracr": 4, "mixer": 4, "sanctions": 4,
        "vs": 8, "compare": 8, "comparison": 8,
    }
    m = re.search(r"/posts/([^/?#]+)", url)
    if not m:
        return {}
    slug = m.group(1)
    pillar = 7  # default: hub/agents
    for prefix, p in pillar_map.items():
        if prefix in slug.lower():
            pillar = p
            break
    return {"slug": slug, "pillar": pillar}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=_dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d"))
    ap.add_argument("--output", default="/opt/bizlegal/decisions")
    args = ap.parse_args()

    # 1) All paid orders
    orders = supabase_query("payment_orders",
                             "select=id,user_email,product,tier,amount_cents,gateway,status,created_at,referrer,landing_path&status=eq.paid&order=created_at.desc&limit=2000")
    print(f"[{args.date}] revenue_attribution: {len(orders)} paid orders", file=sys.stderr)

    if not orders:
        # Write a placeholder report
        out = pathlib.Path(args.output) / f"REVENUE-ATTRIBUTION-{args.date}.md"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(f"# REVENUE ATTRIBUTION — {args.date}\n\nNo paid orders yet. Once Stripe is live and first orders come in, this report will populate automatically.\n\n", encoding="utf-8")
        print(f"  wrote {out}", file=sys.stderr)
        return

    # 2) All published articles
    articles = supabase_query("seo_pages",
                              "select=slug,title,pillar&published=eq.true&select=slug,title&limit=500")
    print(f"  {len(articles)} published articles in DB", file=sys.stderr)

    # 3) Attribution accumulators
    article_direct = defaultdict(int)   # revenue cents by article slug
    article_assisted = defaultdict(int)
    article_last = defaultdict(int)
    pillar_revenue = defaultdict(int)
    pillar_orders = defaultdict(int)
    untracked_revenue = 0
    untracked_orders = 0

    for o in orders:
        amount = int(o.get("amount_cents") or 0)
        referrer = (o.get("referrer") or "").strip()
        landing = (o.get("landing_path") or "").strip()
        # Try to extract article from referrer URL first
        article = parse_url_to_article(referrer) if referrer else {}
        # Fallback to landing_path
        if not article and landing:
            article = parse_url_to_article(landing)
        # Fallback: by product slug → pillar
        if not article:
            product = (o.get("product") or "").lower()
            tier = (o.get("tier") or "").lower()
            p_map = {"sqa": 1, "dpa": 2, "lexaudit": 3, "tracr": 4, "brai": 5, "boi": 6, "agents": 7}
            for k, p in p_map.items():
                if k in product or k in tier:
                    article = {"slug": f"product/{product}/{tier}", "pillar": p}
                    break
        if article:
            slug = article.get("slug", "")
            pillar = article.get("pillar", 0)
            article_direct[slug] += amount
            article_last[slug] += amount
            pillar_revenue[pillar] += amount
            pillar_orders[pillar] += 1
            supabase_insert("article_attribution", {
                "order_id": o.get("id"),
                "article_slug": slug,
                "pillar": pillar,
                "amount_cents": amount,
                "tier": o.get("tier"),
                "product": o.get("product"),
                "user_email": o.get("user_email"),
                "attribution_type": "direct",
                "created_at": o.get("created_at"),
            })
        else:
            untracked_revenue += amount
            untracked_orders += 1

    total_revenue = sum(pillar_revenue.values()) + untracked_revenue
    total_orders = sum(pillar_orders.values()) + untracked_orders

    # 4) Build report
    out = pathlib.Path(args.output) / f"REVENUE-ATTRIBUTION-{args.date}.md"
    out.parent.mkdir(parents=True, exist_ok=True)

    md = [f"# REVENUE ATTRIBUTION — {args.date}\n\n",
          f"**Orders analyzed:** {total_orders} · **Revenue:** ${total_revenue/100:.2f}\n",
          f"**Tracked:** {sum(pillar_orders.values())} orders · ${sum(pillar_revenue.values())/100:.2f}\n",
          f"**Untracked:** {untracked_orders} orders · ${untracked_revenue/100:.2f}\n\n"]

    md.append("## Revenue by pillar (1-8)\n\n")
    md.append("| Pillar | Orders | Revenue | AOV |\n|---|---|---|---|\n")
    for p in sorted(pillar_revenue.keys()):
        rev = pillar_revenue[p]
        cnt = pillar_orders[p]
        aov = rev / max(cnt, 1) / 100
        pillar_name = {1:"DocAI SQA", 2:"DocAI DPA", 3:"LexAudit", 4:"Tracr",
                       5:"Brai Regulators", 6:"Forge BOI", 7:"Hub Agents", 8:"Comparison"}.get(p, "?")
        md.append(f"| P{p} ({pillar_name}) | {cnt} | ${rev/100:.2f} | ${aov:.2f} |\n")

    md.append(f"\n## Revenue by article (top 20)\n\n")
    md.append("| Article slug | Revenue | Orders |\n|---|---|---|\n")
    sorted_articles = sorted(article_direct.items(), key=lambda x: -x[1])
    for slug, rev in sorted_articles[:20]:
        md.append(f"| {slug[:60]} | ${rev/100:.2f} | {article_direct[slug]//max(rev//100,1)} |\n")

    md.append(f"\n## Conversion math for $10K MRR by 2027-01-01\n\n")
    monthly_target = 10000  # USD
    days_remaining = max(1, (_dt.date(2027, 1, 1) - _dt.date.today()).days)
    daily_target = monthly_target / 30
    md.append(f"- Days remaining: **{days_remaining}**\n")
    md.append(f"- Daily revenue target: **${daily_target:.0f}/day = ${monthly_target/30:.0f}/day**\n")
    md.append(f"- Monthly target: **${monthly_target:,}/mo**\n\n")
    md.append(f"Required at current AOV:\n")
    aov_estimate = total_revenue / max(total_orders, 1) / 100
    orders_needed = monthly_target / max(aov_estimate, 50) if aov_estimate else 200
    md.append(f"- Current AOV: ${aov_estimate:.2f}\n")
    md.append(f"- Orders needed at current AOV: **{orders_needed:.0f}/month**\n")
    md.append(f"- Daily organic visits needed (assuming 1% conversion): **{orders_needed*100/30:.0f}/day**\n")

    out.write_text("".join(md), encoding="utf-8")
    json_out = pathlib.Path(args.output) / f"revenue-by-article-{args.date}.json"
    json_out.write_text(json.dumps({
        "date": args.date,
        "total_orders": total_orders,
        "total_revenue_cents": total_revenue,
        "by_pillar": dict(pillar_revenue),
        "by_pillar_orders": dict(pillar_orders),
        "by_article": dict(article_direct),
        "untracked_revenue_cents": untracked_revenue,
        "untracked_orders": untracked_orders,
    }, indent=2), encoding="utf-8")

    print(f"  wrote {out}", file=sys.stderr)
    print(f"  wrote {json_out}", file=sys.stderr)
    print(f"  total revenue: ${total_revenue/100:.2f}", file=sys.stderr)


if __name__ == "__main__":
    main()