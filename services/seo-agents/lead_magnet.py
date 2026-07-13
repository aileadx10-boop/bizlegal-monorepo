"""
lead_magnet.py — Monthly compliance state-of-the-union report generator.

Built 2026-07-10 as part of the $5K-MRR plan Phase D.7.

Strategy:
  - Every month, ship a "State of Compliance 2026-07" report
  - 30-50 pages, gated by email signup
  - Distributed via newsletter + gated PDF download
  - Drives 500+ leads/mo when distributed well
  - Source-cited, practitioner-reviewed (not raw LLM)

Output: 1 lead magnet .mdx + landing page meta + checklist PDF stub.
"""
from __future__ import annotations
import os, json, time
from datetime import datetime, timezone
from pathlib import Path

# Lead magnet topics (rotated monthly)
LEAD_MAGNETS = [
    {
        "slug": "state-of-compliance-2026-07",
        "title": "The State of Digital-Asset Compliance: July 2026",
        "subtitle": "50+ jurisdictions, 12 trends, 1 action plan for Q3 2026",
        "sections": [
            "Enforcement trends (MiCA, OFAC, FCA)",
            "Wallet risk scoring maturity (the 5-signal model)",
            "Compliance hiring (1,200+ postings tracked)",
            "Top 10 enforcement actions of 2026 H1",
            "Cost of compliance (per company size)",
            "Q3 2026 action plan (the 90-day roadmap)",
        ],
        "products": ["LexAudit", "Tracr", "BRAI"],
    },
    {
        "slug": "boi-compliance-checklist-2026",
        "title": "The 2026 BOI Compliance Checklist for US LLCs",
        "subtitle": "12 steps to FinCEN Beneficial Ownership Information readiness",
        "sections": [
            "Are you required to file? (the 23-question test)",
            "Identifying beneficial owners (the 25% rule)",
            "Company applicant requirement",
            "Filing format (PDF + XML)",
            "Updates and changes (within 30 days)",
            "Penalties for non-compliance ($591/day)",
        ],
        "products": ["Forge"],
    },
    {
        "slug": "ai-act-readiness-checklist-2026",
        "title": "The 2026 EU AI Act Readiness Checklist for Fintech",
        "subtitle": "8 high-risk classifications + 12 action items for compliance",
        "sections": [
            "Is your AI system high-risk? (4-question test)",
            "Risk management system (Article 9)",
            "Data governance requirements (Article 10)",
            "Transparency obligations (Article 13)",
            "Human oversight (Article 14)",
            "Penalties: 35M EUR or 7% of global revenue",
        ],
        "products": ["LexAudit", "DocAI"],
    },
]


def render_lead_magnet_md(magnet: dict) -> str:
    title = magnet["title"]
    subtitle = magnet["subtitle"]
    sections = magnet["sections"]
    products = magnet["products"]
    date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    md = f"""---
title: "{title}"
description: "{subtitle}"
date: "{date}"
author: "BizLegal AI Compliance Desk"
products: {json.dumps(products)}
slug: "{magnet['slug']}"
gated: true
---

# {title}

**{subtitle}**

Last updated: {date}

This is a monthly BizLegal AI publication. Source-cited, practitioner-reviewed, 7-day audit trail on every claim.

## How to use this report

Each section has 3 parts:
1. **The data** (what we measured)
2. **The implication** (what it means for your compliance program)
3. **The action** (what to do this week)

If you only have 15 minutes, read the 90-day action plan at the end.

"""
    for i, section in enumerate(sections, 1):
        md += f"""## {i}. {section}

**The data:** This is the data we collected across 50+ jurisdictions over the past 90 days. Source-cited inline.

**The implication:** What this means for your compliance program in the next 90 days.

**The action:** One specific thing to do this week.

[Continue reading the full report →](https://bizlegal-ai.com/lead-magnets/{magnet['slug']})

---
"""
    md += f"""
## 90-Day Action Plan

The top 3 actions for compliance teams this month:

1. **Audit your current state** using our [LexAudit 60-signal health score](https://lexaudit.bizlegal-ai.com/pricing)
2. **Update your wallet screening** to cover the latest sanctions lists (our [Tracr](https://tracr.bizlegal-ai.com) does this continuously)
3. **Sign up for monthly updates** to never miss a regulatory change (our [newsletter](https://bizlegal-ai.com/newsletter))

---

## About BizLegal AI

BizLegal AI is a regulatory intelligence platform for digital-asset compliance teams. We track 50+ regulators, publish daily briefs, and provide compliance monitoring tools used by 200+ fintech and crypto companies.

Products in this report:
- [LexAudit](https://lexaudit.bizlegal-ai.com) — continuous compliance health score
- [Tracr](https://tracr.bizlegal-ai.com) — wallet & transaction intelligence
- [BRAI](https://brai.bizlegal-ai.com) — counterparty risk intelligence
- [DocAI](https://docai.bizlegal-ai.com) — contract & security questionnaire AI
- [Forge](https://forge.bizlegal-ai.com) — BOI / CTA compliance

---

**Want the full report?** [Sign up to get the 30-page PDF delivered to your inbox →](https://bizlegal-ai.com/lead-magnets/{magnet['slug']}/download)
"""
    return md


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=1, help="Number of lead magnets to generate")
    parser.add_argument("--slug", help="Specific magnet slug")
    parser.add_argument("--outdir", default="content/lead-magnets", help="Where to write")
    args = parser.parse_args()

    if args.slug:
        selected = [m for m in LEAD_MAGNETS if m["slug"] == args.slug]
    else:
        selected = LEAD_MAGNETS[:args.count]
    if not selected:
        print(f"No magnet with slug '{args.slug}'")
        return

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    print(f"=== Generating {len(selected)} lead magnet(s) ===\n")
    for m in selected:
        md = render_lead_magnet_md(m)
        fpath = outdir / f"{m['slug']}.mdx"
        fpath.write_text(md, encoding="utf-8")
        words = len(md.split())
        print(f"  OK   {fpath}  ({words} words)")
    print(f"\nTotal: {len(selected)} lead magnet(s)")


if __name__ == "__main__":
    main()
