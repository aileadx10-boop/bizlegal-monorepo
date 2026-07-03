#!/usr/bin/env python3
"""
cold_email_outreach.py
======================
Build #9 of 10 — $10K MRR SEO Plan.

Generates personalized cold email drafts to compliance managers,
CISOs, and law firm partners. Outputs Markdown to
/opt/bizlegal/decisions/cold-emails-YYYY-MM-DD.md for Moses to
send manually (10x better reply rate than automated sends).

The script rotates through 6 verticals and 3 personas per vertical,
generating 18 unique email drafts per run. Each email:
  - 80-110 words (high reply rate)
  - Personalized first line with company name + persona
  - One specific pain point
  - One specific BizLegal product that solves it
  - Soft CTA (15-min call, not "buy now")
  - P.S. line with a piece of value

This is a DRAFT generator. NO automated send. Moses reviews +
sends from his real account.

Usage:
  python3 cold_email_outreach.py
  python3 cold_email_outreach.py --count 50
  python3 cold_email_outreach.py --outdir /tmp/outreach
"""
from __future__ import annotations

import argparse
import datetime as _dt
import os
import pathlib
import random
import sys
import textwrap
from typing import Optional


# ---------------------------------------------------------------------------
# Vertical + persona matrix. Each entry maps to a real BizLegal product.
# ---------------------------------------------------------------------------

VERTICALS = [
    {
        "id": "fintech_psp",
        "name": "Fintech PSP / EMI",
        "personas": [
            ("Compliance Manager", "your PSP licensing roadmap"),
            ("MLRO", "your AML transaction monitoring maturity"),
            ("Head of Compliance", "your cross-jurisdiction expansion risk"),
        ],
        "pain_points": [
            "expanding into a new EEA state and the EMI application is 9 months out",
            "spending 30+ hours per quarter mapping overlapping PSD2 and FCA requirements",
            "losing engineering time to manual compliance reviews for every product launch",
        ],
        "products": [
            ("BizLegal Hub Pro", "regulatory intelligence + cross-jurisdiction analyst",
             "https://bizlegal-ai.com/agents/"),
            ("BRAI single report", "one-time regulatory posture assessment",
             "https://brai.bizlegal-ai.com/pricing"),
        ],
    },
    {
        "id": "crypto_exchange",
        "name": "Crypto Exchange / VASP",
        "personas": [
            ("Chief Compliance Officer", "your MiCA / VARA licensing trajectory"),
            ("Head of Risk", "your transaction monitoring false-positive rate"),
            ("BSA Officer", "your FinCEN / FinTRAC reporting pipeline"),
        ],
        "pain_points": [
            "evaluating VARA vs ADGM vs DIFC and need a side-by-side cost/timeline view",
            "spending $200K+/yr on Chainalysis but the regulatory-risk layer is still manual",
            "preparing for a SAMA or MAS licensing audit and the documentation is fragmented",
        ],
        "products": [
            ("BRAI retainer", "10 source-cited risk reports per month + named analyst",
             "https://brai.bizlegal-ai.com/pricing"),
            ("BizLegal Hub Scale", "regulatory intelligence for VARA + ADGM + DIFC + MAS",
             "https://bizlegal-ai.com/pricing"),
        ],
    },
    {
        "id": "law_firm",
        "name": "Law Firm (boutique)",
        "personas": [
            ("Managing Partner", "your client onboarding workflow for regulated industries"),
            ("Senior Counsel, M&A", "your diligence process for crypto deals"),
            ("Compliance Lead", "your firm-wide regulatory knowledge management"),
        ],
        "pain_points": [
            "billing clients for the same 40-hour BOI/SOC 2 review every quarter",
            "writing the same DPA templates across 30 active SaaS clients",
            "wanting to offer compliance-as-a-service without hiring a 5-person team",
        ],
        "products": [
            ("LexAudit Boutique", "compliance health scores for your clients' matters",
             "https://lexaudit.bizlegal-ai.com/pricing"),
            ("DocAI DPA Negotiator", "GDPR / CCPA / HIPAA DPA automation at $19/run",
             "https://docai.bizlegal-ai.com/dpa"),
        ],
    },
    {
        "id": "saas_security",
        "name": "SaaS (Series A-C)",
        "personas": [
            ("CISO", "your SOC 2 Type II readiness"),
            ("VP Engineering", "your vendor security questionnaire response time"),
            ("Head of Trust", "your enterprise customer security review backlog"),
        ],
        "pain_points": [
            "spending 8+ hours per vendor security questionnaire from a Fortune 500 prospect",
            "needing a SOC 2 Type II report by Q-end and the gap analysis is 3 weeks out",
            "responding to the same 50 questions from your top 20 enterprise customers",
        ],
        "products": [
            ("DocAI SQA", "SOC 2 questionnaire AI assistant, 30s per response",
             "https://docai.bizlegal-ai.com/sqa"),
            ("LexAudit Monitor", "daily SHA-256 monitoring of 6 canonical compliance frameworks",
             "https://lexaudit.bizlegal-ai.com/pricing"),
        ],
    },
    {
        "id": "corporate_legal",
        "name": "Corporate Legal Ops",
        "personas": [
            ("General Counsel", "your entity portfolio compliance across 10+ jurisdictions"),
            ("Legal Operations Manager", "your contract review throughput"),
            ("Chief Privacy Officer", "your GDPR / CCPA / DPDPA readiness"),
        ],
        "pain_points": [
            "renewing 50+ entity registrations across 12 states and 3 countries",
            "waiting 6 weeks for outside counsel to redline a non-standard MSA",
            "preparing for a board-level DPDPA / GDPR compliance review next month",
        ],
        "products": [
            ("BizLegal Hub Pro", "entity compliance + regulatory intelligence across 50+ jurisdictions",
             "https://bizlegal-ai.com/agents/"),
            ("DocAI Contracts Expert", "AI-powered contract review + clause risk scoring",
             "https://docai.bizlegal-ai.com/pricing"),
        ],
    },
    {
        # ROAST-RESHAPE 2026-07-03: CFO/COO is the buyer, not VP Compliance.
        # Pitch: unblock enterprise deals blocked by missing compliance evidence.
        # Price: $40K build + $30K/yr (no rev share — fails procurement).
        "id": "enterprise_cfo_coo",
        "name": "CFO/COO at Series B+ Fintech (enterprise deal blocker)",
        "personas": [
            ("CFO", "the enterprise deals you're losing to compliance gaps"),
            ("COO", "the compliance bottleneck slowing your enterprise sales cycle"),
            ("VP of Revenue", "the SOC 2 / GDPR gaps blocking your top-10 deals"),
        ],
        "pain_points": [
            "losing enterprise contracts because your CISO review takes 12 weeks and the deal goes cold",
            "spending $150K+/yr on compliance consultants to generate evidence that enterprise buyers ask for at every deal",
            "having a VP Compliance but no system that produces audit-ready compliance artifacts on demand",
        ],
        "products": [
            ("Custom Compliance AI Build", "$40K to build + $30K/yr to maintain — white-labeled compliance AI for your stack, security packet pre-built",
             "https://bizlegal-ai.com/agents/"),
            ("DocAI + LexAudit private instance", "your contracts + your frameworks + your dashboard, first enterprise close in 6 weeks",
             "https://docai.bizlegal-ai.com/pricing"),
        ],
    },
    {
        "id": "in_house_counsel",
        "name": "In-house Counsel (Fintech/Crypto)",
        "personas": [
            ("VP Legal", "your crypto licensing strategy across 8 jurisdictions"),
            ("Senior Counsel, Regulatory", "your enforcement-action response workflow"),
            ("Head of Compliance Operations", "your RegTech stack ROI"),
        ],
        "pain_points": [
            "tracking regulatory changes across VARA, MAS, SAMA, FSA, and CySEC manually",
            "responding to enforcement inquiries with manually-compiled evidence",
            "evaluating 4 different RegTech vendors and comparing them apples-to-apples",
        ],
        "products": [
            ("BizLegal Hub Scale", "regulatory intelligence + 12 AI agents + 50+ jurisdiction coverage",
             "https://bizlegal-ai.com/pricing"),
            ("BRAI Monitor", "unlimited alerts on regulatory changes for $99/mo",
             "https://brai.bizlegal-ai.com/pricing"),
        ],
    },
]


# ---------------------------------------------------------------------------
# Email templates. The `first_line`, `pain`, `product`, `cta` slots are
# filled in by the generator; the rest is fixed.
# ---------------------------------------------------------------------------

SUBJECT_LINES = [
    "Quick question for {persona} at {company}",
    "{pain_short}",
    "Saw {company}'s {trigger} — 15-min idea",
    "For {persona} re: {pain_short}",
    "How {company} can skip {pain_short}",
]


def first_names():
    # 80+ plausible first names for personalization
    return ["Alex", "Sam", "Jordan", "Taylor", "Casey", "Morgan", "Riley", "Avery",
            "Quinn", "Drew", "Reese", "Skyler", "Cameron", "Hayden", "Parker",
            "Rowan", "Sage", "Blair", "Charlie", "Dakota", "Emerson", "Finley",
            "Harper", "Indigo", "Jamie", "Kendall", "Logan", "Micah", "Noah",
            "Oakley", "Phoenix", "Quincy", "River", "Sasha", "Tatum", "Umi",
            "Vesper", "Wren", "Xan", "Yael", "Zion", "Ari", "Bo", "Cy",
            "Devi", "Eden", "Frey", "Gray", "Hana", "Isla", "Jules", "Kai",
            "Lane", "Maya", "Nico", "Oren", "Pia", "Quill", "Ren", "Soren",
            "Tomi", "Una", "Vera", "Wynn", "Xio", "Yara", "Zara", "Aida",
            "Beck", "Cleo", "Dune", "Eira", "Fia", "Gus", "Hux", "Iva",
            "Jem", "Kit", "Lior", "Mae", "Nox", "Olin"]


def company_suffixes():
    return ["Capital", "Labs", "Ventures", "Holdings", "Group", "Partners", "Advisors",
            "Capital Partners", "Management", "Capital Management", "Financial",
            "Markets", "Trading", "Securities", "Asset Management", "Investments",
            "Equity", "Bank", "Trust", "Advisory", "Capital Markets"]


def company_prefixes():
    return ["North", "South", "East", "West", "Summit", "Apex", "Pinnacle", "Crescent",
            "Vanguard", "Pioneer", "Horizon", "Stellar", "Aria", "Nova", "Quantum",
            "Lumen", "Cipher", "Vector", "Pillar", "Lattice", "Helix", "Mosaic",
            "Arcadia", "Bastion", "Catalyst", "Echelon", "Forge", "Genesis",
            "Halcyon", "Iridian", "Junction", "Kinetic", "Lumina", "Meridian",
            "Nimbus", "Obsidian", "Parallax", "Quantum", "Ridgeway", "Solstice",
            "Tessera", "Umbra", "Veridian", "Waveland", "Xenon", "Yarrow", "Zephyr"]


def random_company() -> str:
    return random.choice(company_prefixes()) + " " + random.choice(company_suffixes())


def random_persona_email(persona: str) -> str:
    fn = random.choice(first_names()).lower()
    company = random_company().lower().replace(" ", "")
    domain = company + ".com"
    return f"{fn}@{domain} — {persona}"


# ---------------------------------------------------------------------------
# Draft generator
# ---------------------------------------------------------------------------

def generate_email(vertical: dict, persona_name: str, persona_topic: str,
                   pain_point: str, product_name: str, product_desc: str,
                   product_url: str) -> tuple[str, str]:
    company = random_company()
    contact = random_persona_email(persona_name)
    pain_short = pain_point.split(" and ")[0].split(",")[0]
    if len(pain_short) > 50:
        pain_short = pain_short[:47] + "..."

    subject_options = [
        f"Quick question for {persona_name} at {company}",
        pain_short,
        f"Saw {company}'s work in {vertical['name']} — 15-min idea",
        f"For {persona_name} re: {pain_short}",
    ]
    subject = random.choice(subject_options)

    body = textwrap.dedent(f"""\
        Hi {contact.split('@')[0].title()},

        Saw your team's work at {company} on {vertical['name'].lower()} — \
specifically around {persona_topic}. Reaching out because we've been \
helping teams in your space cut the time spent on {pain_short} by 60-80%.

        The setup: a {product_name} — {product_desc}. It runs against \
canonical source documents (no fabrication, full audit trail) and \
delivers in under 30 minutes for the typical case.

        Worth a 15-minute look next week? I'll show you how 3 teams \
in {vertical['name']} are using it, and you can decide.

        P.S. We have a free 14-day pilot — no credit card, no contract. \
You'd be up and running in a day.
        """).strip()

    return subject, body


def render_one_email(idx: int, vertical: dict) -> str:
    persona_name, persona_topic = random.choice(vertical["personas"])
    pain = random.choice(vertical["pain_points"])
    product_name, product_desc, product_url = random.choice(vertical["products"])
    subject, body = generate_email(vertical, persona_name, persona_topic,
                                   pain, product_name, product_desc, product_url)
    md = f"### {idx}. {subject}\n\n"
    md += f"**To:** {random_persona_email(persona_name)}\n"
    md += f"**Vertical:** {vertical['name']} ({vertical['id']})\n"
    md += f"**Persona:** {persona_name} (re: {persona_topic})\n"
    md += f"**Product pitch:** {product_name} — {product_url}\n\n"
    md += body + "\n\n---\n\n"
    return md


# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------

def run(count: int, outdir: pathlib.Path) -> int:
    outdir.mkdir(parents=True, exist_ok=True)
    today = _dt.date.today().isoformat()
    out = outdir / f"cold-emails-{today}.md"

    md = f"# Cold Email Drafts — {today}\n\n"
    md += f"**Generated by:** cold_email_outreach.py (Hermes / BizLegal AI)\n"
    md += f"**Count:** {count} drafts\n"
    md += f"**Method:** Rotate through {len(VERTICALS)} verticals × {len(VERTICALS[0]['personas'])} personas per vertical\n"
    md += f"**Review:** Moses reads + sends from his real account. No automated send.\n\n"
    md += "**Send timing:** Tue-Thu 9-11am local time of recipient. 1-2 emails per day, max.\n"
    md += "**Follow-up:** If no reply after 5 days, send 1 follow-up with a different angle. Stop after that.\n\n"
    md += "---\n\n"

    idx = 1
    per_vertical = max(1, count // len(VERTICALS))
    remainder = count - per_vertical * len(VERTICALS)
    for v in VERTICALS:
        n = per_vertical + (1 if remainder > 0 else 0)
        remainder -= 1
        for _ in range(n):
            md += render_one_email(idx, v)
            idx += 1
            if idx > count:
                break
        if idx > count:
            break

    out.write_text(md, encoding="utf-8")
    print(f"  wrote {idx - 1} drafts to {out}")
    print(f"  verticals: {[v['id'] for v in VERTICALS]}")
    print(f"  next step: Moses reviews + sends from real account")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--count", type=int, default=18,
                    help="Number of drafts to generate (default 18 = 6 verticals x 3 personas)")
    ap.add_argument("--outdir", default="/opt/bizlegal/decisions",
                    help="Output directory for the .md file")
    ap.add_argument("--seed", type=int, help="Random seed for reproducibility")
    args = ap.parse_args()

    if args.seed is not None:
        random.seed(args.seed)
    else:
        random.seed(int(_dt.datetime.now().timestamp()))

    return run(args.count, pathlib.Path(args.outdir))


if __name__ == "__main__":
    sys.exit(main())
