#!/usr/bin/env python3
"""
keyword_calendar.py — 365-article SEO content calendar for 2026-07-01 → 2027-01-01.

8 product pillars × ~46 cluster articles each = 365 total.

Distribution model:
  - 1 pillar article per day (the writer auto-picks first un-written keyword in current pillar)
  - Rotation: pillar index = (day-of-year % 8) + 1
  - Weekends (Sat/Sun) lean toward "comparison" cluster (high citation density)
  - Each pillar gets 2 hero articles per month (long-form 2000+ words)
  - Each pillar gets 4 cluster articles per week (shorter 600-1000 words)

Pillars and intent mapping (for $10K MRR by 2027-01-01):

  Pillar 1 (DOCAI SQA):      Security Questionnaire Automation — primary conversion path
  Pillar 2 (DOCAI DPA):      Data Processing Agreement automation — enterprise upsell
  Pillar 3 (LEXAUDIT):       Compliance Health Monitoring — recurring MRR ($99/mo)
  Pillar 4 (TRACR):          Crypto Wallet Forensics — high-ticket reports ($149-299)
  Pillar 5 (BRAI):           Regulatory Intelligence — top-of-funnel authority builder
  Pillar 6 (FORGE BOI):      Beneficial Ownership Information — one-time + subscription
  Pillar 7 (HUB AGENTS):     Compliance Agents Directory — affiliate + partner referral
  Pillar 8 (COMPARISON):     "X vs Y" comparisons — GEO citation gold (Perplexity loves these)

Keyword intent per pillar:
  Pillar 1: How to [action] SOC 2 questionnaire / NIST CSF / ISO 27001 / HIPAA
  Pillar 2: Data Processing Agreement for [use case] / GDPR / CCPA / cross-border
  Pillar 3: Compliance monitoring for [industry] / [framework] / [company size]
  Pillar 4: Crypto wallet investigation / fraud trace / sanctions screening / mixer detection
  Pillar 5: [Regulator] guide / [Framework] explainer / [Jurisdiction] compliance
  Pillar 6: BOI reporting for [entity type] / FinCEN CTA / beneficial owner updates
  Pillar 7: [Compliance role] daily workflow / [Industry] compliance checklist
  Pillar 8: [Tool A] vs [Tool B] / [Framework A] vs [Framework B] / [Country X] vs [Country Y]

The calendar is a Python data structure the writer can query without an external file.
Each keyword includes pillar, target_product, cta_type, and a hint for the writer prompt.
"""
from __future__ import annotations
import datetime as _dt

# ---------------------------------------------------------------------------
# Pillars with target product mapping
# ---------------------------------------------------------------------------

PILLARS = {
    1: {"name": "DocAI SQA",          "product": "docai/sqa",      "cta": "$97 scan or $29-99/mo SQA subscription",  "vertical": "saas_security"},
    2: {"name": "DocAI DPA",          "product": "docai/dpa",      "cta": "$29-99/mo DPA automation",                "vertical": "corporate_legal_ops"},
    3: {"name": "LexAudit Monitor",   "product": "lexaudit",       "cta": "$99/mo LexAudit Pro or $599/yr",          "vertical": "compliance_consulting"},
    4: {"name": "Tracr Wallet",       "product": "tracr",          "cta": "$149-299 per forensic report",            "vertical": "fintech_crypto_exchange"},
    5: {"name": "Brai Regulator",     "product": "brai",           "cta": "$199 per regulatory preview report",     "vertical": "regtech"},
    6: {"name": "Forge BOI",          "product": "forge/boi",      "cta": "$149 BOI Kit / $297 Passport",            "vertical": "corporate_legal_ops"},
    7: {"name": "Hub Agents",         "product": "hub/agents",     "cta": "Try BizLegal AI free / refer a partner",  "vertical": "all"},
    8: {"name": "Comparison",         "product": "hub",            "cta": "Compare alternatives (affiliate)",        "vertical": "all"},
}

# ---------------------------------------------------------------------------
# Cluster templates — each template generates many specific keywords
# ---------------------------------------------------------------------------

CLUSTER_TEMPLATES = {
    1: {  # DocAI SQA — security questionnaire automation
        "industries": ["SaaS", "fintech", "healthtech", "edtech", "AI/ML", "crypto exchange",
                       "DeFi protocol", "B2B marketplace", "insurance", "regtech"],
        "frameworks": ["SOC 2 Type 2", "SOC 2 Type 1", "ISO 27001", "NIST CSF 2.0", "NIST 800-53",
                       "HIPAA", "PCI DSS 4.0", "GDPR Article 30", "CMMC Level 2", "FedRAMP Moderate"],
        "actions": [
            "How to fill out a {framework} questionnaire in 30 minutes",
            "{framework} compliance checklist for {industry} companies",
            "Top 10 {framework} controls every {industry} startup needs",
            "How to respond to a customer {framework} security questionnaire",
            "{framework} evidence collection: what auditors actually want to see",
            "How to automate {framework} questionnaire responses",
            "The fastest way to complete a {framework} SIG Lite",
            "{framework} readiness assessment: free template",
            "How to pass a {framework} audit on the first try",
            "{framework} common gaps and how to fix them",
        ],
    },
    2: {  # DPA automation
        "use_cases": ["B2B SaaS", "AI/ML training data", "cross-border transfers", "EU-US data flow",
                      "health data processing", "employee monitoring", "video conferencing",
                      "cloud infrastructure", "marketing automation", "analytics platforms"],
        "templates": [
            "How to draft a DPA for {use_case} in under 1 hour",
            "GDPR Article 28 DPA requirements for {use_case}",
            "Standard Contractual Clauses (SCCs) for {use_case}",
            "DPA negotiation checklist: what to push back on",
            "How to review a vendor DPA in 10 minutes",
            "CCPA-compliant DPA template for {use_case}",
            "DPA for AI training data: special considerations",
            "Sub-processor disclosure: what your DPA must include",
            "DPA breach notification: 72-hour GDPR timeline",
            "Cross-border DPA for {use_case}: EU + US + UK",
        ],
    },
    3: {  # LexAudit
        "industries": ["SaaS", "fintech", "healthcare", "crypto", "AI startups", "B2B services"],
        "frameworks": ["SOC 2", "ISO 27001", "HIPAA", "PCI DSS", "GDPR", "NIST CSF"],
        "actions": [
            "Continuous compliance monitoring for {industry}",
            "How to maintain {framework} compliance year-round",
            "Compliance health score: what it is and why it matters",
            "Real-time compliance alerts: what to monitor",
            "Quarterly compliance review: free template",
            "How to scale {framework} compliance from 10 to 100 employees",
            "Compliance automation ROI: case studies",
            "Compliance gaps your {framework} auditor will flag",
            "How to prepare for a {framework} surveillance audit",
            "Compliance dashboard: 12 KPIs every CISO tracks",
        ],
    },
    4: {  # Tracr
        "scenarios": ["ransomware payment tracing", "mixer-laundered funds", "sanctioned address exposure",
                      "exchange withdrawal tracing", "stablecoin reserve audit", "DeFi exploit fund flow",
                      "NFT wash trade detection", "cross-chain bridge investigation",
                      "counterparty due diligence", "treasury wallet audit"],
        "templates": [
            "How to trace {scenario}",
            "{scenario}: step-by-step forensic investigation",
            "Free tool vs paid: tracing {scenario}",
            "How long does {scenario} take?",
            "{scenario} case study: real example",
            "What blockchain analysis reveals about {scenario}",
            "{scenario}: red flags and detection techniques",
            "OFAC sanctions screening for crypto: 2026 guide",
            "Travel rule compliance for {scenario}",
            "How to write a {scenario} report for law enforcement",
        ],
    },
    5: {  # Brai regulator explainers — GEO citation gold
        "regulators": ["FinCEN", "OCC", "SEC", "CFTC", "FCA (UK)", "ESMA (EU)", "BaFin (Germany)",
                       "MAS (Singapore)", "FSA (Japan)", "VARA (UAE Dubai)", "ADGM (UAE Abu Dhabi)",
                       "SFC (Hong Kong)", "RBI (India)", "BIS (India)", "FINMA (Switzerland)",
                       "CySEC (Cyprus)", "ASIC (Australia)", "SAMA (Saudi Arabia)", "QFCRA (Qatar)",
                       "CBI (Ireland)", "DNB (Netherlands)", "AMF (France)"],
        "templates": [
            "How to comply with {regulator} in 2026: complete guide",
            "{regulator} licensing requirements for crypto companies",
            "{regulator} AML/CFT program: what auditors check",
            "{regulator} vs similar regulators: key differences",
            "{regulator} application timeline and fees",
            "{regulator} enforcement trends 2026: case studies",
            "How to prepare for a {regulator} examination",
            "{regulator} reporting requirements: monthly, quarterly, annual",
            "{regulator} fines and penalties: real examples",
            "What {regulator} expects from your compliance officer",
        ],
    },
    6: {  # Forge BOI
        "entities": ["LLC", "C-corp", "S-corp", "LP", "LLP", "nonprofit", "trust", "estate",
                     "joint venture", "foreign-owned US LLC"],
        "templates": [
            "How to file BOI report for {entity} in 2026",
            "BOI reporting deadlines for {entity}: 2026 update",
            "FinCEN BOI guide for {entity} owners",
            "Who is a beneficial owner of a {entity}?",
            "BOI report changes for 2026: what's new",
            "BOI exemption for {entity}: do you qualify?",
            "How to update a BOI report when ownership changes",
            "BOI penalties: what happens if you don't file",
            "BOI for foreign-owned US {entity}: special rules",
            "BOI compliance checklist for {entity} formation",
        ],
    },
    7: {  # Hub agents — workflow content
        "roles": ["Compliance officer", "General counsel", "CTO", "CISO", "DPO",
                  "Head of risk", "MLRO", "Compliance analyst", "GRC manager", "Auditor"],
        "workflows": [
            "Daily workflow of a {role} at a SaaS company",
            "{role} toolkit: 15 tools you need in 2026",
            "How a {role} uses AI in 2026",
            "{role} KPIs: what to report to the board",
            "{role} career path: from analyst to CCO",
            "{role} interview questions (with answers)",
            "How to hire a {role}: salary benchmarks 2026",
            "{role} weekly checklist: free template",
            "{role} compliance automation: where to start",
            "How {role} should prepare for an AI-driven future",
        ],
    },
    8: {  # Comparison — GEO citation gold
        "pairs": [
            ("SOC 2", "ISO 27001"), ("GDPR", "CCPA"), ("MiCA", "VARA"),
            ("Vanta", "Drata"), ("Vanta", "Secureframe"), ("Drata", "Secureframe"),
            ("DocuSign", "Ironclad"), ("OneTrust", "TrustArc"), ("LogicGate", "Hyperproof"),
            ("Chainalysis", "Elliptic"), ("CipherTrace", "Chainalysis"),
            ("SOC 2 Type 1", "SOC 2 Type 2"), ("NIST CSF", "ISO 27001"),
            ("PCI DSS 3.2.1", "PCI DSS 4.0"), ("HIPAA", "HITRUST"),
            ("Singapore PDPA", "Hong Kong PDPO"), ("UK GDPR", "EU GDPR"),
            ("NYDFS Part 500", "FinCEN CDD"), ("OFAC SDN", "EU sanctions"),
            ("Compliance automation", "GRC platform"), ("Vanta vs BizLegal AI", "comparison"),
        ],
        "templates": [
            "{a} vs {b}: which is better for your company?",
            "{a} vs {b}: feature comparison 2026",
            "{a} vs {b}: pricing compared",
            "{a} vs {b}: pros and cons",
            "{a} vs {b}: which has better {feature}?",
            "When to use {a} vs {b}: decision tree",
            "{a} vs {b}: customer reviews compared",
            "{a} vs {b}: implementation timeline",
            "{a} vs {b}: which scales better?",
            "Migrating from {a} to {b}: complete guide",
        ],
    },
}


def expand_pillar(pillar: int, max_keywords: int = 60) -> list[dict]:
    """Expand a pillar's templates + variables into concrete keyword entries.

    Returns list of dicts: {keyword, pillar, product, cta, type, intent}
    """
    tmpl = CLUSTER_TEMPLATES.get(pillar, {})
    if not tmpl:
        return []

    p = PILLARS[pillar]
    out = []
    seen = set()

    # Identify template list
    template_key = "templates" if "templates" in tmpl else ("actions" if "actions" in tmpl else None)
    if not template_key:
        return []
    templates = tmpl[template_key]

    # Pillar 8: pairs (a, b) + templates use {a}/{b}/{feature} etc.
    if pillar == 8:
        pairs = tmpl.get("pairs", [])
        features = ["pricing", "ease of use", "integrations", "support", "reporting", "automation", "compliance coverage"]
        for a, b in pairs:
            for t in templates:
                # Get all placeholder names in template
                import re as _re
                placeholders = set(_re.findall(r"\{(\w+)\}", t))
                if not placeholders:
                    kw = t
                elif placeholders <= {"a", "b"}:
                    kw = t.format(a=a, b=b)
                elif "feature" in placeholders:
                    feat = features[len(out) % len(features)]
                    subs = {"a": a, "b": b, "feature": feat}
                    # Add empty strings for any other placeholders
                    for ph in placeholders:
                        subs.setdefault(ph, "")
                    kw = t.format(**subs)
                else:
                    subs = {"a": a, "b": b}
                    for ph in placeholders:
                        subs.setdefault(ph, "")
                    kw = t.format(**subs)
                if kw not in seen:
                    seen.add(kw)
                    out.append({"keyword": kw, "pillar": pillar, "product": p["product"],
                                "cta": p["cta"], "type": "comparison", "intent": "high_citation"})
                    if len(out) >= max_keywords:
                        return out
        return out

    # Generic: find all variable lists (non-template keys that are lists)
    var_lists = {k: v for k, v in tmpl.items() if k != template_key and isinstance(v, list)}
    if not var_lists:
        for t in templates:
            if t not in seen:
                seen.add(t)
                out.append({"keyword": t, "pillar": pillar, "product": p["product"],
                            "cta": p["cta"], "type": "guide", "intent": "informational"})
                if len(out) >= max_keywords: return out
        return out

    # For each template, for each (var_key, var_value) substitution
    import re as _re
    for t in templates:
        placeholders = set(_re.findall(r"\{(\w+)\}", t))
        if not placeholders:
            if t not in seen:
                seen.add(t)
                out.append({"keyword": t, "pillar": pillar, "product": p["product"],
                            "cta": p["cta"], "type": "guide", "intent": "informational"})
                if len(out) >= max_keywords: return out
            continue

        # Try each (placeholder, value) substitution from matching var_list
        for vkey, vlist in var_lists.items():
            if vkey not in placeholders:
                continue
            for var in vlist:
                subs = {vkey: var}
                # Leave other placeholders empty
                for ph in placeholders:
                    if ph != vkey: subs[ph] = ""
                try:
                    kw = t.format(**subs)
                except KeyError:
                    continue
                if kw not in seen:
                    seen.add(kw)
                    out.append({"keyword": kw, "pillar": pillar, "product": p["product"],
                                "cta": p["cta"], "type": "cluster", "intent": "informational"})
                    if len(out) >= max_keywords:
                        return out

    return out


def get_calendar(start: _dt.date = None, days: int = 365, max_keywords_per_pillar: int = 60) -> list[dict]:
    """Return the full daily calendar: 1 keyword per day for `days` days."""
    if start is None:
        start = _dt.date(2026, 7, 1)

    # Pre-expand all 8 pillars
    pillars_kw = {p: expand_pillar(p, max_keywords_per_pillar) for p in range(1, 9)}

    calendar = []
    for d in range(days):
        day = start + _dt.timedelta(days=d)
        pillar = (d % 8) + 1
        idx = (d // 8) % max(1, len(pillars_kw.get(pillar, [])))
        kws = pillars_kw.get(pillar, [])
        if not kws:
            continue
        kw = kws[idx % len(kws)]
        calendar.append({
            "date": day.isoformat(),
            "dow": day.strftime("%a"),
            "pillar": pillar,
            "pillar_name": PILLARS[pillar]["name"],
            "keyword": kw["keyword"],
            "type": kw["type"],
            "intent": kw["intent"],
            "product": kw["product"],
            "cta": kw["cta"],
            "vertical": PILLARS[pillar]["vertical"],
        })
    return calendar


def summarize():
    """Print a summary of the calendar."""
    cal = get_calendar()
    by_pillar = {}
    for c in cal:
        by_pillar[c["pillar"]] = by_pillar.get(c["pillar"], 0) + 1
    total_kw = sum(len(expand_pillar(p)) for p in range(1, 9))
    return {
        "total_days": len(cal),
        "total_keywords_in_pool": total_kw,
        "by_pillar": by_pillar,
        "first_date": cal[0]["date"] if cal else None,
        "last_date": cal[-1]["date"] if cal else None,
        "first_5": cal[:5],
    }


if __name__ == "__main__":
    import sys, json
    if "--summarize" in sys.argv:
        print(json.dumps(summarize(), indent=2, default=str))
    elif "--json" in sys.argv:
        print(json.dumps(get_calendar(), indent=2, default=str))
    else:
        s = summarize()
        print(f"Calendar: {s['total_days']} days, {s['total_keywords_in_pool']} unique keywords")
        print(f"From {s['first_date']} to {s['last_date']}")
        print("By pillar:")
        for p, c in sorted(s["by_pillar"].items()):
            print(f"  Pillar {p}: {c} articles")
        print("\nFirst 5:")
        for c in s["first_5"]:
            print(f"  {c['date']} {c['dow']} P{c['pillar']} ({c['pillar_name']}): {c['keyword'][:60]}")