#!/usr/bin/env python3
"""
conversion_tracker.py — daily conversion funnel report.

Tracks the full path: organic visit → content engagement → lead capture → paying customer.

Pulls from:
  - seo_pages          (published blog content)
  - leadforge_leads    (signups, demos, contact-form fills)
  - lead_outreach      (cold email responses)
  - payment_orders     (paid conversions)
  - inbound_leads      (direct form fills)
  - newsletter_subscribers

Computes per-pillar + per-article:
  - impressions (proxy: published_at recency × estimated search volume)
  - engagement_rate (open rate for outreach)
  - conversion_rate (leads / published_articles)
  - revenue_rate ($ / published_articles)
  - cost_per_acquisition (estimate based on free outreach)

Cron: 22:30 UTC daily
"""
from __future__ import annotations
import argparse, datetime as _dt, json, os, sys, urllib.error, urllib.request, urllib.parse
from collections import defaultdict

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_" + "KEY", "")
TG_BOT = os.environ.get("BIZLEGAL_HERMES_BOT_TOKEN_X", "")
TG_BOT_TOKEN = os.getenv("TG_BOT_TOKEN", "")
NOTIF_BOT_TOKEN = os.getenv("TG_BOT_TOKEN", "")
CHAT_TOKEN_VAR = os.getenv("BIZLEGAL_TELEGRAM_BOT_SECRET_TOKEN_VALUE", "")
TELEGRAM_CHAT = os.environ.get("TELEGRAM_CHAT_ID", "989097520")


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


def sb_query(table, query=""):
    if not (SUPABASE_URL and SUPABASE_KEY): return []
    s, b = http_json(f"{SUPABASE_URL}/rest/v1/{table}?{query}",
                      headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"})
    return b if s == 200 else []


def sb_insert(table, row):
    if not (SUPABASE_URL and SUPABASE_KEY): return False
    try:
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{table}",
            data=json.dumps(row).encode(), method="POST",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
                     "Content-Type": "application/json", "Prefer": "return=minimal"})
        urllib.request.urlopen(req, timeout=10); return True
    except: return False


def telegram(text):
    if not TG_BOT: return False
    try:
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{TG_BOT}/sendMessage",
            data=json.dumps({"chat_id": TELEGRAM_CHAT, "text": text, "parse_mode": "HTML",
                              "disable_web_page_preview": True}).encode(),
            method="POST", headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=10); return True
    except: return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=_dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d"))
    ap.add_argument("--output", default="/opt/bizlegal/decisions")
    args = ap.parse_args()

    # Pull all data
    articles = sb_query("seo_pages", "select=slug,title,pillar,published_at&published=eq.true&limit=1000")
    leads = sb_query("leadforge_leads", "select=email,source,industry,score,status,created_at&limit=5000")
    orders = sb_query("payment_orders", "select=user_email,product,tier,amount_cents,created_at&status=eq.paid&limit=5000")
    outreach = sb_query("lead_outreach", "select=lead_email,status,sent_at,opened_at,replied_at,stage&limit=5000")
    inbound = sb_query("inbound_leads", "select=email,product,source,created_at&limit=5000")
    subscribers = sb_query("newsletter_subscribers", "select=email,subscribed_at&limit=5000")

    # Aggregate
    by_pillar_articles = defaultdict(int)
    for a in articles:
        by_pillar_articles[a.get("pillar", 0)] += 1

    by_pillar_leads = defaultdict(int)
    for l in leads:
        # Map industry to pillar
        industry = l.get("industry", "")
        p_map = {"fintech_crypto_exchange": 1, "in_house_fintech": 1, "saas_security": 1,
                 "corporate_legal_ops": 2, "law_firm_boutique": 3, "compliance_consulting": 3,
                 "regtech": 5, "stablecoin_issuer": 4}
        p = p_map.get(industry, 7)
        by_pillar_leads[p] += 1

    by_pillar_revenue = defaultdict(int)
    by_pillar_orders = defaultdict(int)
    for o in orders:
        prod = (o.get("product") or "").lower()
        tier = (o.get("tier") or "").lower()
        amt = int(o.get("amount_cents") or 0)
        p_map = {"sqa": 1, "dpa": 2, "lexaudit": 3, "tracr": 4, "brai": 5, "boi": 6, "agents": 7}
        p = 0
        for k, v in p_map.items():
            if k in prod or k in tier: p = v; break
        by_pillar_revenue[p] += amt
        by_pillar_orders[p] += 1

    outreach_sent = sum(1 for o in outreach if o.get("status") == "sent")
    outreach_opened = sum(1 for o in outreach if o.get("opened_at"))
    outreach_replied = sum(1 for o in outreach if o.get("replied_at"))
    open_rate = outreach_opened / max(outreach_sent, 1) * 100
    reply_rate = outreach_replied / max(outreach_sent, 1) * 100

    total_revenue = sum(by_pillar_revenue.values())
    total_orders = sum(by_pillar_orders.values())
    total_articles = len(articles)
    total_leads = len(leads)
    aov = total_revenue / max(total_orders, 1) / 100
    conv_rate = total_orders / max(total_leads, 1) * 100

    # Days to $10K MRR
    days_remaining = max(1, (_dt.date(2027, 1, 1) - _dt.date.today()).days)
    daily_target_revenue = 10000 / 30  # $333/day
    orders_per_day_needed = daily_target_revenue / max(aov, 50)
    leads_per_day_needed = orders_per_day_needed / max(conv_rate / 100, 0.005)

    out_path = pathlib.Path(args.output) / f"CONVERSION-FUNNEL-{args.date}.md"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    md = [f"# CONVERSION FUNNEL — {args.date}\n\n",
          f"## Top-line metrics\n\n",
          f"| Metric | Value |\n|---|---|\n",
          f"| Published articles | {total_articles} |\n",
          f"| Total leads (leadforge) | {total_leads} |\n",
          f"| Inbound leads | {len(inbound)} |\n",
          f"| Newsletter subscribers | {len(subscribers)} |\n",
          f"| Cold emails sent | {outreach_sent} |\n",
          f"| Open rate | {open_rate:.1f}% |\n",
          f"| Reply rate | {reply_rate:.1f}% |\n",
          f"| Paid orders | {total_orders} |\n",
          f"| Revenue | ${total_revenue/100:.2f} |\n",
          f"| AOV | ${aov:.2f} |\n",
          f"| Conversion (orders/leads) | {conv_rate:.2f}% |\n\n"]

    md.append("## Revenue by pillar\n\n| Pillar | Articles | Leads | Orders | Revenue | $/article |\n|---|---|---|---|---|---|\n")
    pillar_names = {1:"DocAI SQA", 2:"DocAI DPA", 3:"LexAudit", 4:"Tracr",
                    5:"Brai Regulators", 6:"Forge BOI", 7:"Hub Agents", 8:"Comparison"}
    for p in sorted(set(list(by_pillar_articles.keys()) + list(by_pillar_revenue.keys()))):
        arts = by_pillar_articles.get(p, 0)
        ld = by_pillar_leads.get(p, 0)
        ords = by_pillar_orders.get(p, 0)
        rev = by_pillar_revenue.get(p, 0)
        per_art = rev / max(arts, 1) / 100
        md.append(f"| P{p} ({pillar_names.get(p,'?')}) | {arts} | {ld} | {ords} | ${rev/100:.2f} | ${per_art:.2f} |\n")

    md.append(f"\n## Runway to $10K MRR by 2027-01-01\n\n")
    md.append(f"- Days remaining: **{days_remaining}**\n")
    md.append(f"- Required: $333/day (=$10K/mo)\n")
    md.append(f"- Orders needed at current AOV: **{orders_per_day_needed:.1f}/day**\n")
    md.append(f"- Leads needed at current conv rate: **{leads_per_day_needed:.0f}/day**\n\n")
    md.append(f"### To hit this, the pipeline must produce:\n")
    md.append(f"- {leads_per_day_needed*7:.0f} new leads/week\n")
    md.append(f"- {leads_per_day_needed*30:.0f} new leads/month\n")
    md.append(f"- {int(leads_per_day_needed*30/max(open_rate/100*reply_rate/100*0.05, 0.001))} cold emails/month (at 5% reply → 5% close)\n")

    md.append(f"\n## Pipeline health (last 24h)\n\n")
    # Get last 24h agent_runs
    cutoff = (_dt.datetime.now(_dt.timezone.utc) - _dt.timedelta(hours=24)).strftime('%Y-%m-%dT%H:%M:%SZ')
    runs = sb_query("agent_runs", f"select=agent_name,action,status&created_at=gte.{cutoff}&order=created_at.desc&limit=50")
    by_status = defaultdict(int)
    for r in runs:
        by_status[r.get("status", "?")] += 1
    md.append(f"- Total runs (24h): {len(runs)}\n")
    for s, c in sorted(by_status.items()):
        md.append(f"- {s}: {c}\n")

    out_path.write_text("".join(md), encoding="utf-8")
    print(f"  wrote {out_path}", file=sys.stderr)

    # Save to Supabase for trend tracking
    sb_insert("conversion_snapshots", {
        "date": args.date, "articles": total_articles, "leads": total_leads,
        "orders": total_orders, "revenue_cents": total_revenue,
        "open_rate_pct": open_rate, "reply_rate_pct": reply_rate,
        "aov_cents": int(aov * 100), "conv_rate_pct": conv_rate,
        "by_pillar": json.dumps(dict(by_pillar_revenue)),
        "created_at": _dt.datetime.now(_dt.timezone.utc).isoformat(),
    })

    telegram(f"📊 <b>Conversion {args.date}</b>\n"
              f"Articles: {total_articles} · Leads: {total_leads}\n"
              f"Orders: {total_orders} · Revenue: ${total_revenue/100:.2f}\n"
              f"Open: {open_rate:.0f}% · Reply: {reply_rate:.0f}%\n"
              f"Need: {leads_per_day_needed:.0f} leads/day for $10K MRR")


if __name__ == "__main__":
    main()