#!/usr/bin/env python3
"""
oci_funnel.py — autonomous partner matching + invoice request for OCI leads.

Reads leads with status='qualified' or 'discovered' from leadforge_leads,
matches them to OCI partner law firms (stored in partners table), and:
  1. Picks best partner (industry + jurisdiction overlap)
  2. Generates partner introduction email via Anthropic
  3. Records match in deal_router_leads table
  4. Sends via Resend (or queues to /opt/bizlegal/decisions/oci-routing-<date>.md)

Cron: daily 08:00 UTC
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
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
RESEND_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_FROM = os.getenv("RESEND_FROM_EMAIL", "intelligence@bizlegal-ai.com")

# Static OCI partner roster (curated). Replace with Supabase `partners` table once live.
OCI_PARTNERS = [
    {"id": "akg",    "name": "Akin Gump",         "url": "https://www.akingump.com",
     "email": "partners@akingump.com", "jurisdictions": ["US", "UAE", "UK"], "verticals": ["fintech", "crypto", "regtech"],
     "min_fee": 1500, "tier": "tier1"},
    {"id": "sc",     "name": "Sullivan & Cromwell","url": "https://www.sullcrom.com",
     "email": "partners@sullcrom.com", "jurisdictions": ["US", "EU", "UK"], "verticals": ["fintech", "saas"],
     "min_fee": 2000, "tier": "tier1"},
    {"id": "cleary", "name": "Cleary Gottlieb",   "url": "https://www.clearygottlieb.com",
     "email": "partners@cgsh.com", "jurisdictions": ["US", "EU", "BR"], "verticals": ["fintech", "crypto"],
     "min_fee": 1800, "tier": "tier1"},
    {"id": "milbank","name": "Milbank",            "url": "https://www.milbank.com",
     "email": "partners@milbank.com", "jurisdictions": ["US", "UAE"], "verticals": ["fintech", "project_finance"],
     "min_fee": 1200, "tier": "tier2"},
    {"id": "selendy","name": "Selendy & Gay",     "url": "https://www.selendygay.com",
     "email": "partners@selendygay.com", "jurisdictions": ["US"], "verticals": ["crypto", "regtech"],
     "min_fee": 900, "tier": "tier2"},
]


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
        print(f"  [supabase] {table}: {e}", file=sys.stderr)
        return []


def supabase_insert(table: str, row: dict) -> bool:
    if not (SUPABASE_URL and SUPABASE_SECRET):
        return False
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/{table}",
            data=json.dumps(row).encode(), method="POST",
            headers={
                "apikey": SUPABASE_SECRET, "Authorization": f"Bearer {SUPABASE_SECRET}",
                "Content-Type": "application/json", "Prefer": "return=minimal",
            },
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception as e:
        print(f"  [insert] {table}: {e}", file=sys.stderr)
        return False


def anthropic_draft(text: str, max_tokens: int = 600) -> str:
    """Single-call Anthropic helper."""
    if not ANTHROPIC_KEY:
        return ""
    try:
        body = json.dumps({
            "model": "claude-3-5-haiku-20241022",
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": text}],
        }).encode()
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=body, method="POST",
            headers={
                "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
        )
        r = json.loads(urllib.request.urlopen(req, timeout=60).read())
        return r["content"][0]["text"].strip()
    except Exception as e:
        print(f"  [anthropic] err: {e}", file=sys.stderr)
        return ""


def resend_send(to: str, subject: str, body: str) -> str:
    """Send via Resend. Returns message_id or empty string."""
    if not RESEND_KEY:
        return ""
    try:
        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=json.dumps({"from": f"BizLegal AI <{RESEND_FROM}>",
                              "to": [to], "subject": subject, "text": body}).encode(),
            method="POST",
            headers={"Authorization": f"Bearer {RESEND_KEY}",
                     "Content-Type": "application/json"},
        )
        r = json.loads(urllib.request.urlopen(req, timeout=15).read())
        return r.get("id", "")
    except urllib.error.HTTPError as e:
        body_err = e.read().decode()[:200]
        print(f"  [resend] {to}: HTTP {e.code} {body_err}", file=sys.stderr)
        return ""


def score_partner(lead: dict, partner: dict) -> int:
    """Higher score = better match."""
    score = 0
    industry = lead.get("industry", "")
    country = lead.get("enriched_data", {}).get("country", "")
    # Vertical match
    vert_map = {"fintech_crypto_exchange": "fintech", "in_house_fintech": "fintech",
                "law_firm_boutique": "legal", "saas_security": "saas",
                "compliance_consulting": "compliance", "regtech": "regtech",
                "stablecoin_issuer": "crypto"}
    mapped = vert_map.get(industry, industry)
    if mapped in partner["verticals"]:
        score += 50
    # Jurisdiction match
    if country in partner["jurisdictions"]:
        score += 30
    # Tier bonus (lower tier preferred for small deals)
    if partner["tier"] == "tier2" and lead.get("score", 0) < 80:
        score += 10
    elif partner["tier"] == "tier1":
        score += 5
    # Fee compatibility
    if partner["min_fee"] <= 1500:
        score += 10
    return score


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", default="/opt/bizlegal/decisions")
    ap.add_argument("--date", default=_dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d"))
    ap.add_argument("--send", action="store_true", help="actually send Resend emails (else draft only)")
    args = ap.parse_args()

    # Pull discovered/qualified leads (score >= 70)
    leads = supabase_select("leadforge_leads",
                            "select=id,email,company_name,industry,score,status,enriched_data&score=gte.70&status=in.(discovered,qualified)&order=created_at.desc&limit=20")
    print(f"[{args.date}] oci_funnel: {len(leads)} qualified leads", file=sys.stderr)

    out = pathlib.Path(args.output) / f"oci-routing-{args.date}.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    md = [f"# OCI ROUTING — {args.date}\n\n",
          f"**Leads:** {len(leads)} · **Partners:** {len(OCI_PARTNERS)}\n\n",
          "## Routing decisions\n\n"]

    routed = 0
    sent = 0
    for lead in leads:
        # Score each partner
        ranked = sorted(
            [(p, score_partner(lead, p)) for p in OCI_PARTNERS],
            key=lambda x: -x[1]
        )
        if not ranked or ranked[0][1] < 30:
            continue
        partner = ranked[0][0]
        score = ranked[0][1]

        # Generate partner intro email
        prompt = f"""Draft a short professional email from BizLegal AI to {partner['name']} introducing a qualified lead.
Lead: {lead['company_name']} ({lead['industry']})
Score: {lead['score']}
Partner: {partner['name']}

Write 80-120 words. Structure:
1. Hi {partner['name']} team,
2. Brief intro: we identified {lead['company_name']} as needing {partner['verticals'][0]} compliance support in jurisdiction {lead['enriched_data'].get('country','?')}.
3. Proposed fee split: $1500 placement + 15% of first-year engagement (vs industry standard 10%).
4. Soft CTA: 15-min intro call this week?
5. Sign as: Moses, BizLegal AI.

Respond ONLY with the email body, no subject line, no JSON."""
        email_body = anthropic_draft(prompt) or f"Hi {partner['name']} team,\n\nRefer to your CRM for the {lead['company_name']} lead — standard placement.\n\nMoses, BizLegal AI"

        subject = f"Placement: {lead['company_name']} ({lead['industry']}) — {lead['score']}/100 fit"
        msg_id = ""
        if args.send and RESEND_KEY:
            msg_id = resend_send(partner["email"], subject, email_body)
            if msg_id:
                sent += 1

        # Record in deal_router_leads
        supabase_insert("deal_router_leads", {
            "source": "oci_funnel",
            "source_url": "",
            "contact_email": lead["email"],
            "contact_name": lead["company_name"],
            "classification": lead["industry"],
            "buyer_type": "b2b_saas",
            "priority": "high" if lead["score"] >= 85 else "medium",
            "action": "partner_routed",
            "recommended_partner": partner["name"],
            "confidence": score,
            "agent_run_id": None,
            "created_at": _dt.datetime.now(_dt.timezone.utc).isoformat(),
        })

        # Update lead status
        try:
            req = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/leadforge_leads?id=eq.{lead['id']}",
                data=json.dumps({"status": "routed_to_oci"}).encode(),
                method="PATCH",
                headers={
                    "apikey": SUPABASE_SECRET, "Authorization": f"Bearer {SUPABASE_SECRET}",
                    "Content-Type": "application/json",
                },
            )
            urllib.request.urlopen(req, timeout=10)
        except Exception:
            pass

        md.append(f"### {lead['company_name']} -> {partner['name']} (score={score})\n\n")
        md.append(f"- Lead score: {lead['score']} / Industry: {lead['industry']} / Country: {lead.get('enriched_data', {}).get('country', '?')}\n")
        md.append(f"- Partner match: {partner['name']} ({partner['tier']}, ${partner['min_fee']}+)\n")
        if msg_id:
            md.append(f"- ✅ Resend sent: {msg_id}\n\n")
        else:
            md.append(f"- 📝 Draft only\n\n")
        md.append("```\n" + email_body[:400] + "\n```\n\n")
        routed += 1

    md.append(f"\n## Summary\n- Routed: {routed}\n- Sent: {sent}\n")
    out.write_text("".join(md), encoding="utf-8")
    print(f"  routed {routed}  sent {sent}", file=sys.stderr)
    print(f"  wrote {out}", file=sys.stderr)


if __name__ == "__main__":
    main()