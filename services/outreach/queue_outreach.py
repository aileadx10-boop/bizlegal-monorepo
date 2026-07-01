#!/usr/bin/env python3
"""queue_outreach.py — prepare personalized cold emails for top leads, queue in lead_outreach.
Status='drafted' so it shows up in Moses's review queue. No actual sends.
"""
import os, json, sys, urllib.request, urllib.error
import datetime as _dt

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ydghhcuuopqzgqcicubg.supabase.co")
SUPABASE_KEY = (os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
                  or os.environ.get("SUPABASE_SERVICE_KEY", "")
                  or os.environ.get("SUPABASE_SECRET", "")
                  or os.environ.get("SUPABASE_KEY", ""))

def http_json(url, headers=None, data=None, method="GET", timeout=30):
    h = {"Accept": "application/json"}
    if headers: h.update(headers)
    body = None
    if data is not None:
        body = json.dumps(data).encode() if not isinstance(data, bytes) else data
        h.setdefault("Content-Type", "application/json")
    req = urllib.request.Request(url, data=body, method=method, headers=h)
    try:
        r = urllib.request.urlopen(req, timeout=timeout)
        return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def get_top_leads(limit=20, min_score=85):
    url = f"{SUPABASE_URL}/rest/v1/leadforge_leads?status=eq.new&score=gte.{min_score}&order=score.desc&limit={limit}"
    code, body = http_json(url, {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"})
    if code != 200:
        print(f"  leads fetch: HTTP {code} {body[:200]}")
        return []
    return json.loads(body)


def already_queued(emails):
    if not emails: return set()
    quoted = ",".join(f'"{e}"' for e in emails)
    url = f"{SUPABASE_URL}/rest/v1/lead_outreach?select=lead_email&lead_email=in.({quoted})"
    code, body = http_json(url, {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"})
    if code != 200: return set()
    return {r["lead_email"] for r in json.loads(body)}


INDUSTRY_LABELS = {
    "fintech_crypto_exchange": "crypto exchange",
    "corporate_legal_ops": "corporate legal",
    "real_estate_crossborder": "cross-border real estate",
    "dao_defi": "DeFi / DAO",
    "b2b_saas": "B2B SaaS",
    "fintech": "fintech",
}


def generate_email_body(lead):
    company = lead.get("company_name", "your firm")
    ed = lead.get("enriched_data") or {}
    title = ed.get("title", "Compliance Team")
    industry_slug = lead.get("industry", "fintech")
    industry = INDUSTRY_LABELS.get(industry_slug, industry_slug.replace("_", " "))

    subject = f"Regulatory intelligence for {company} — 50+ frameworks, 1 dashboard"

    body = f"""Hi {title},

I'm Moses Dor, founder of BizLegal AI. We build regulatory intelligence software for in-house compliance teams at {industry} firms — covering SEC, FinCEN, MiCA, GDPR, MAS, and 47 other frameworks in one dashboard.

I see {company} is operating across multiple jurisdictions. Three things our current customers tell us they needed before they found us:

1. A single weekly digest of material regulatory changes (filtered — we don't spam on cosmetic edits). LexAudit customers spend ~5 min/week instead of 8+ hours curating alerts manually.
2. Counterparty risk scoring for new partners and protocols (BRAI — built originally for tokenized-asset desks).
3. Contract review for cross-border deals, especially NDAs, SAFTs, and DPAs (DocAI — 60-second risk-scored analysis).

We're a software tool, not a law firm, and we don't replace your existing counsel. We just compress the time your team spends on the "what changed this week and does it affect us" question.

Two options if useful:
  • 14-day LexAudit trial: https://lexaudit.bizlegal-ai.com (full access, $99/mo after trial)
  • Pay-per-scan: $97 per contract via DocAI (https://docai.bizlegal-ai.com)

If you'd like a 15-minute walkthrough of how this would look for {company} specifically, reply with a time that works and I'll send a calendar link.

— Moses Dor
BizLegal AI | DOR INNOVATIONS
intelligence@bizlegal-ai.com
"""
    return subject, body


def queue_draft(lead, subject, body):
    """Insert a draft into lead_outreach. status='drafted' = ready for Moses review."""
    ed = lead.get("enriched_data") or {}
    payload = {
        "lead_email": lead["email"],
        "lead_name": ed.get("name", ""),
        "company": lead.get("company_name", ""),
        "pitch_variant": f"score_{lead.get('score', 0)}_industry_{lead.get('industry', 'unknown')}",
        "subject": subject,
        "body_preview": body[:2000],  # truncated preview
        "status": "drafted",
    }
    url = f"{SUPABASE_URL}/rest/v1/lead_outreach"
    code, resp = http_json(url, {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
                                  "Prefer": "return=minimal"}, data=payload, method="POST")
    return code == 201, resp


def main():
    leads = get_top_leads(limit=20, min_score=90)
    print(f"  {len(leads)} candidate leads (score>=90, status=new)")

    if not leads: return

    emails = [l["email"] for l in leads]
    already = already_queued(emails)
    print(f"  {len(already)} already in lead_outreach — skipping")

    queued = 0
    skipped = 0
    failed = 0
    for lead in leads:
        if lead["email"] in already:
            skipped += 1
            continue
        subject, body = generate_email_body(lead)
        ok, resp = queue_draft(lead, subject, body)
        if ok:
            queued += 1
            print(f"    ✓ {lead['email']:<45} ({lead.get('company_name', '?')})")
        else:
            failed += 1
            print(f"    ✗ {lead['email']:<45} {resp[:100]}")

    print(f"\n  SUMMARY: queued={queued} skipped={skipped} failed={failed}")
    print(f"  All status='drafted' — no email sent, no domain risk.")
    print(f"  Moses reviews at Supabase lead_outreach table; flips to 'sent' only after manual OK.")


if __name__ == "__main__":
    main()
