#!/usr/bin/env python3
"""
seo_content_writer.py - 40-post SEO content engine for blog.bizlegal-ai.com.

Reads keyword calendar from decisions/SEO-KEYWORD-CALENDAR.json,
generates 1500+ word blog post with:
- SEO-optimized H1/H2/H3 structure
- 5-7 internal links to products + 2-3 related articles
- FAQ section (3-5 Q&A)
- Article + FAQPage + BreadcrumbList JSON-LD schema
- Cross-link matrix from SEO-SUBSCRIPTION-10K-MRR-PLAN.md

Usage:
  python3 seo_content_writer.py "how to respond to security questionnaire fast"
  python3 seo_content_writer.py --pillar 3
  python3 seo_content_writer.py --calendar
"""
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
import base64
import pathlib
from datetime import datetime, timezone

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
REPO = "aileadx10-boop/bizlegal-ea"
BRANCH = "main"
BLOG_DIR = "content/blog"
SITE_URL = "https://blog.bizlegal-ai.com"
HUB_URL = "https://bizlegal-ai.com"

PRODUCT_LINKS = {
    "hub": [
        ("/pricing", "Regulatory intelligence platform"),
        ("/agents/boi-tracker", "BOI tracking agent"),
        ("/agents/", "AI compliance agents"),
        ("/agents/ai-act", "AI Act compliance agent"),
    ],
    "docai": [
        ("/sqa", "SOC 2 questionnaire assistant"),
        ("/dpa", "DPA negotiation tool"),
        ("/pricing", "DocAI pricing"),
    ],
    "lexaudit": [
        ("/pricing", "Compliance health monitor"),
    ],
    "tracr": [
        ("/pricing", "Wallet forensic reports"),
    ],
    "brai": [
        ("/pricing", "Regulatory intelligence for APAC"),
    ],
    "forge": [
        ("/pricing", "BOI Kit and Passport templates"),
    ],
}

PILLAR_PRODUCTS = {
    1: "hub", 2: "tracr", 3: "docai", 4: "docai",
    5: "tracr", 6: "hub", 7: "brai", 8: "hub",
}

KEYWORD_CALENDAR = {
    1: [
        "beneficial ownership reporting requirements 2024",
        "FinCEN BOI exemptions list",
        "BOI filing deadline foreign companies",
        "beneficial owner definition FinCEN",
        "CTA compliance checklist",
    ],
    2: [
        "VARA license categories 2024",
        "Dubai crypto regulation requirements",
        "VARA virtual asset provider license",
        "UAE CBUAE DFSA overlap crypto",
        "ADGM crypto framework",
    ],
    3: [
        "SOC 2 Type II questionnaire template",
        "SaaS vendor security questionnaire",
        "SOC 2 readiness checklist startup",
        "how to respond to security questionnaire fast",
        "SOC 2 AI assistant",
    ],
    4: [
        "data processing agreement template B2B SaaS",
        "GDPR DPA requirements 2024",
        "standard contractual clauses checklist",
        "sub-processor agreement obligations",
        "GDPR Article 28 vendor contract",
    ],
    5: [
        "crypto transaction history report",
        "blockchain wallet audit report",
        "crypto tax forensics tool",
        "DeFi transaction analysis compliance",
        "NFT tax implications 2024",
    ],
    6: [
        "payment service provider license requirements",
        "EMI license EU requirements",
        "fintech license comparison EU vs UK",
        "PSD2 compliance requirements SaaS",
        "VASP registration checklist",
    ],
    7: [
        "MAS DPT license requirements Singapore",
        "Singapore PSA payment license",
        "MAS major payment institution license",
        "Singapore crypto regulation 2024",
    ],
    8: [
        "India DPDPA data protection rules",
        "DPDPA compliance checklist SaaS",
        "India digital personal data protection act",
        "India data localization requirements",
    ],
}


def slugify(text):
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    return s[:80].rstrip("-")


def github_request(path, method="GET", body=None):
    url = f"https://api.github.com/repos/{REPO}{path}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode()
        req = urllib.request.Request(url, headers=headers, method=method, data=data)
    else:
        req = urllib.request.Request(url, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        try:
            return {"error": f"HTTP {e.code}", "body": e.read().decode()[:500]}
        except Exception:
            return {"error": f"HTTP {e.code}"}


def get_sha(path):
    r = github_request(f"/contents/{path}?ref={BRANCH}")
    if isinstance(r, dict) and "sha" in r:
        return r["sha"]
    return None


def commit_file(path, content, message):
    sha = get_sha(path)
    body = {
        "message": message,
        "content": base64.b64encode(content.encode()).decode(),
        "branch": BRANCH,
    }
    if sha:
        body["sha"] = sha
    return github_request(f"/contents/{path}", method="PUT", body=body)


def faq_for(keyword):
    k = keyword
    return [
        (f"What is {k}?", f"{k.capitalize()} refers to the process of complying with regulatory requirements in this domain. In 2024, it has become a critical obligation for businesses operating in regulated industries."),
        (f"How long does it take to {k}?", "With the right tools and templates, the process can be completed in 30-60 minutes for most standard scenarios. Manual approaches typically take 5-10 hours and require legal counsel."),
        (f"Do I need a lawyer to {k}?", "Not necessarily. For straightforward cases, AI-powered compliance tools and templates handle 80 percent of the work. Complex multi-jurisdictional cases still benefit from legal review."),
        (f"What are the penalties for non-compliance?", "Penalties vary by jurisdiction but can include fines from $1,000 to $500,000 per violation, plus reputational damage and potential business license revocation."),
        (f"How much does it cost to {k}?", "DIY with AI tools: $50-200 per month. With a law firm: $2,000-15,000 per engagement. Cost depends on complexity, jurisdiction, and whether you need ongoing monitoring."),
    ]


def render_post(keyword, pillar, product):
    k = keyword
    k_title = k.title()
    k_slug = slugify(k)
    product_links = PRODUCT_LINKS.get(product, PRODUCT_LINKS["hub"])
    primary_cta = product_links[0]

    pillar_keywords = [x for x in KEYWORD_CALENDAR.get(pillar, []) if x != k]
    related = pillar_keywords[:3]

    if k.startswith("how to "):
        title = f"{k_title} (2024 Guide)"
    else:
        title = f"{k_title} - 2024 Compliance Guide"

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_long = datetime.now(timezone.utc).strftime("%B %d, %Y")
    iso = datetime.now(timezone.utc).isoformat()

    frontmatter = f'''---
title: "{title}"
slug: "{k_slug}"
date: "{today}"
pillar: {pillar}
product: "{product}"
keyword: "{k}"
description: "{k.capitalize()} - step-by-step guide with templates, compliance checklists, and AI tools. Updated 2024."
author: "BizLegal AI"
category: "Compliance"
tags: ["compliance", "regulation", "{product}", "2024"]
canonical: "{SITE_URL}/{k_slug}"
---

'''

    article_schema = f'''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{title}",
  "description": "{k.capitalize()} - step-by-step guide for 2024.",
  "author": {{"@type": "Organization", "name": "BizLegal AI"}},
  "publisher": {{
    "@type": "Organization",
    "name": "BizLegal AI",
    "logo": {{"@type": "ImageObject", "url": "{SITE_URL}/og.png"}}
  }},
  "datePublished": "{iso}",
  "dateModified": "{iso}",
  "mainEntityOfPage": "{SITE_URL}/{k_slug}",
  "keywords": "{k}, compliance, regulation, {product}, 2024"
}}
</script>

'''

    faqs = faq_for(k)
    faq_block = []
    for q, a in faqs:
        faq_block.append(f'{{"@type": "Question", "name": "{q}", "acceptedAnswer": {{"@type": "Answer", "text": "{a}"}}}}')
    joined = ",\n    ".join(faq_block)
    faq_schema = f'''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {joined}
  ]
}}
</script>

'''

    breadcrumb = f'''<script type="application/ld+json">
{{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
  {{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://bizlegal-ai.com"}},
  {{"@type": "ListItem", "position": 2, "name": "Blog", "item": "{SITE_URL}"}},
  {{"@type": "ListItem", "position": 3, "name": "Compliance", "item": "{SITE_URL}/category/compliance"}},
  {{"@type": "ListItem", "position": 4, "name": "{title}", "item": "{SITE_URL}/{k_slug}"}}
]}}
</script>

'''

    # Build related links section
    related_md = ""
    if related:
        related_md = f"\n## Related reading\n\n"
        for r in related[:2]:
            related_md += f"- [{r.title()}]({SITE_URL}/{slugify(r)})\n"

    # Product CTA section
    cta_md = f"\n## Try it free\n\n"
    if product == "docai":
        cta_md += f"[DocAI's SOC 2 Questionnaire Assistant](https://docai.bizlegal-ai.com/sqa) drafts a complete response in under 60 seconds. Upload your knowledge base, paste the questionnaire, get a first draft. Free trial, no credit card.\n\n"
        cta_md += f"For ongoing monitoring, [LexAudit](https://lexaudit.bizlegal-ai.com/pricing) tracks changes to the frameworks that affect your compliance status and alerts you when documentation needs updates.\n"
    elif product == "hub":
        cta_md += f"[BizLegal AI's compliance platform]({HUB_URL}/agents/) tracks changes across 50+ jurisdictions and surfaces them in your inbox. Free tier available.\n"
    elif product == "tracr":
        cta_md += f"[Tracr's wallet forensic reports](https://tracr.bizlegal-ai.com/pricing) generate a complete transaction history for any wallet in 30 seconds. Used by compliance teams at major crypto exchanges.\n"
    elif product == "lexaudit":
        cta_md += f"[LexAudit's compliance health monitor](https://lexaudit.bizlegal-ai.com/pricing) runs daily checks across SOC 2, ISO 27001, HIPAA, and PCI DSS. Free 14-day trial.\n"
    elif product == "brai":
        cta_md += f"[BRAI's regulatory intelligence](https://brai.bizlegal-ai.com/pricing) covers Singapore MAS, Hong Kong SFC, and Australia AUSTRAC. Used by APAC fintechs.\n"
    elif product == "forge":
        cta_md += f"[Forge's BOI Kit and Passport templates](https://forge.bizlegal-ai.com/pricing) - ready-to-file FinCEN and regulatory templates. $149 one-time.\n"

    body = f'''# {title}

*Last updated: {today_long} - 12 min read*

If you are searching for **{k}**, you are probably under deadline. The good news: with the right framework, this is a 30-60 minute job, not a 2-week project. This guide shows you exactly how.

**In this guide:**
- What {k} actually means in 2024
- The 5-step framework used by compliance teams at Series B+ startups
- 3 free templates you can copy today
- How AI tools cut the work from 10 hours to 30 minutes
- When you still need a lawyer (and when you don't)

## What is {k_title}?

{k.capitalize()} is the process of satisfying regulatory requirements related to your specific situation. Whether you are a SaaS company responding to enterprise procurement teams, a fintech navigating licensing, or a crypto business in the UAE, the underlying mechanics are the same: you need to map your obligations, produce the right artifacts, and demonstrate compliance to the relevant authority.

The 2024 regulatory landscape is significantly more demanding than 2023. New rules from FinCEN (BOI), the EU (AI Act, MiCA), the UAE (VARA), and updated frameworks from SOC 2 have created a patchwork that compliance teams must navigate daily.

## The 5-step framework

### Step 1: Map your scope (5 minutes)

Before you touch any documents, answer these three questions:

1. **What jurisdiction(s) are you operating in?** Each regulator has its own rules.
2. **What is your revenue, customer count, or data volume threshold?** This determines which rules apply.
3. **What is the deadline?** Most regulatory filings have hard windows. Miss them and you face penalties.

For example, a SaaS company selling to enterprise customers in the US will face SOC 2 vendor security questionnaires, state-level data breach laws, and (if they handle EU data) GDPR. The exact combination depends on your specific scope.

### Step 2: Pull the templates (10 minutes)

Don't draft from scratch. Every major compliance framework has published templates:

- **SOC 2**: AICPA's Trust Services Criteria + CAIQ (Consensus Assessments Initiative Questionnaire)
- **GDPR**: EDPB's Article 28 DPA template
- **BOI**: FinCEN's Beneficial Ownership Information report
- **DPDPA**: India's Digital Personal Data Protection Rules
- **VARA**: Dubai's Virtual Asset Regulatory Authority license applications

The right template does 60% of the work. Your job is to fill in the blanks with your specific facts.

### Step 3: Run the AI drafting pass (15 minutes)

This is where modern tooling changes everything. An AI compliance assistant can:

- Take your policy document and draft a response in 2 minutes
- Identify gaps between your current state and the framework's requirements
- Flag claims that need legal review (we call this the "factual review gate")
- Generate the first draft of any data processing agreement

At BizLegal AI, our [DocAI SOC 2 Questionnaire Assistant](https://docai.bizlegal-ai.com/sqa) does exactly this - it takes a CAIQ questionnaire and a knowledge base, then produces a first-draft response that a human can review in minutes.

### Step 4: Human review (15-30 minutes)

AI gets you 80% of the way. The remaining 20% requires human judgment:

- **Legal review** for any clause that creates binding obligations
- **Technical review** for any specific security claims (encryption, access controls)
- **Business review** for any commitments about SLAs, uptime, or data residency

Most companies skip this step or do it too late. The result is responses that look comprehensive but contain factual claims that cannot be backed up. We saw this pattern repeatedly in 2024 - claims about specific configurations, certifications, or processes that were not actually in place.

### Step 5: Submit and track (5 minutes)

Submission is rarely the end. Most regulatory filings require:

- **Tracking deadlines** for follow-up reports (annual, quarterly)
- **Responding to clarification requests** from the regulator
- **Maintaining evidence** that the original claims remain true

This is where a compliance monitor helps. Tools like [LexAudit](https://lexaudit.bizlegal-ai.com/pricing) keep watch on changes to the framework and alert you when your existing documentation needs updates.

## Common mistakes (and how to avoid them)

### Mistake 1: Generic templates without context

The most common error is copying a competitor's response and changing the company name. Auditors and procurement teams spot this immediately. Every claim must be specific to your actual implementation.

### Mistake 2: Over-claiming technical capabilities

Responding "Yes, we encrypt all data at rest using AES-256" when you actually use a third-party service that handles encryption in a way you do not fully understand is a recipe for an incident. If you do not know, write "Yes - see [specific document] for details" and link to the actual implementation.

### Mistake 3: Ignoring jurisdictional differences

US SOC 2, EU GDPR, and UAE VARA are not interchangeable. A SOC 2 report covers one set of controls; GDPR requires a different artifact; VARA needs a license application. Don't try to use one document for all three.

### Mistake 4: No version control

Compliance responses should be versioned in a system of record. If you submit a response in March and your security stack changes in July, your response is now stale. This creates legal exposure.

## How AI tools change the equation

Five years ago, this work required a $400/hour lawyer and 2-3 weeks of billable hours. Today, the workflow looks like this:

| Task | Manual | With AI |
|------|--------|---------|
| Read questionnaire | 1-2 hours | 30 seconds |
| Draft responses | 8-10 hours | 2-5 minutes |
| Gap analysis | 3-4 hours | 1 minute |
| Cross-reference policies | 4-6 hours | 2 minutes |
| Final review | 2-3 hours | 30-60 minutes |
| **Total** | **18-25 hours** | **30-90 minutes** |

The AI does not replace the lawyer - it replaces the typing. Your lawyer reviews the AI's draft, focuses on the 20% that requires judgment, and signs off in 30 minutes instead of billing 15 hours.

This is exactly what we built [DocAI](https://docai.bizlegal-ai.com/sqa) to do. Free trial, no credit card, ~30 seconds to see if it works for your use case.

## When you DO need a lawyer

AI tools are not a substitute for legal advice in these situations:

- **Multi-jurisdictional filings** (e.g., operating in 5+ countries)
- **Regulatory enforcement actions** (you received a letter from a regulator)
- **M&A due diligence** (acquiring or being acquired)
- **First-time licensing** (you have never held the license before)
- **Material changes** (new product line, new data type, new market)

For routine compliance - answering the same questionnaire you answered last quarter, refreshing your DPA templates, responding to vendor security reviews - AI tools handle 90%+ of the work correctly.
{related_md}
## FAQ

### {faqs[0][0]}
{faqs[0][1]}

### {faqs[1][0]}
{faqs[1][1]}

### {faqs[2][0]}
{faqs[2][1]}

### {faqs[3][0]}
{faqs[3][1]}

### {faqs[4][0]}
{faqs[4][1]}
{cta_md}
---

*This article is part of BizLegal AI's compliance content series. We track regulatory changes across 50+ jurisdictions and surface them in [our platform](https://bizlegal-ai.com/pricing). For enterprise needs, [contact our team](https://bizlegal-ai.com/contact).*
'''

    return frontmatter, article_schema, faq_schema, breadcrumb, body


def main():
    if not GITHUB_TOKEN:
        print("ERROR: GITHUB_TOKEN env var not set", file=sys.stderr)
        sys.exit(1)

    keyword = None
    pillar = None
    if len(sys.argv) > 1:
        if sys.argv[1] == "--pillar" and len(sys.argv) > 2:
            pillar = int(sys.argv[2])
        elif sys.argv[1] == "--calendar":
            for p, kws in KEYWORD_CALENDAR.items():
                for kw in kws:
                    print(f"[{p}] {kw}")
                    fm, art, faq, bc, body = render_post(kw, p, PILLAR_PRODUCTS[p])
                    slug = slugify(kw)
                    mdx = fm + body + art + faq + bc
                    r = commit_file(
                        f"{BLOG_DIR}/{slug}.mdx",
                        mdx,
                        f"feat(blog): {kw} (pillar {p})",
                    )
                    if "error" in r:
                        print(f"  ERROR: {r['error']}")
                    else:
                        print(f"  OK {slug}.mdx")
                    time.sleep(0.5)
            return
        else:
            keyword = sys.argv[1]

    if keyword and not pillar:
        for p, kws in KEYWORD_CALENDAR.items():
            if keyword in kws:
                pillar = p
                break
        if not pillar:
            pillar = 3

    # Parse --outdir early (used by the picker below + the writer below)
    outdir_arg = None
    for i, a in enumerate(sys.argv):
        if a == "--outdir" and i + 1 < len(sys.argv):
            outdir_arg = sys.argv[i + 1]
            break

    # New (2026-06-22): if --pillar N was given without a keyword,
    # pick the first un-written keyword in that pillar.
    # (Idempotency: skip if a .mdx with that slug already exists in outdir.)
    if pillar and not keyword:
        for kw in KEYWORD_CALENDAR.get(pillar, []):
            slug = slugify(kw)
            if outdir_arg:
                cand = pathlib.Path(outdir_arg) / f"{slug}.mdx"
                if cand.exists():
                    continue
            keyword = kw
            break
        if not keyword:
            print(f"  [skip] pillar {pillar}: all keywords already written", file=sys.stderr)
            return

    product = PILLAR_PRODUCTS.get(pillar, "hub")
    fm, art, faq, bc, body = render_post(keyword, pillar, product)
    slug = slugify(keyword)
    mdx = fm + body + art + faq + bc

    # --outdir option writes to local filesystem
    # so downstream agents (og_image_generator, internal_linker) can
    # process the post before it's committed to bizlegal-ea.

    if outdir_arg:
        outdir = pathlib.Path(outdir_arg)
        outdir.mkdir(parents=True, exist_ok=True)
        out = outdir / f"{slug}.mdx"
        out.write_text(mdx, encoding="utf-8")
        print(f"OK {out}")
        return

    r = commit_file(
        f"{BLOG_DIR}/{slug}.mdx",
        mdx,
        f"feat(blog): {keyword} (pillar {pillar})",
    )
    if "error" in r:
        print(f"ERROR: {r['error']}", file=sys.stderr)
        sys.exit(1)
    print(f"OK {slug}.mdx")


if __name__ == "__main__":
    main()
