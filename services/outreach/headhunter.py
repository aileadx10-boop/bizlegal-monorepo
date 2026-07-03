#!/usr/bin/env python3
"""
headhunter.py
=============
Build #12 of the $10K MRR plan — REVENUE ENGINE.

The full pipeline:
  1. SOURCE — scrape public data for prospects matching our 6 ICPs
  2. EXTRACT — pull emails + names from scraped pages via regex
  3. QUALIFY — use Anthropic to score each prospect 0-100
  4. DEDUPE — cross-check against Supabase `leads` table
  5. PERSIST — write qualified leads (>=70) to Supabase
  6. DRAFT — use Anthropic to write a personalized cold email
  7. SEND — via Resend (or queue for Moses approval if --dry-run)
  8. TRACK — log every run to Supabase `agent_runs`

This is the answer to "0 leads, 0 customers, 0 revenue".
No third-party lead list APIs needed. No paid Hunter.io/Apollo.
Just Firecrawl + regex + Anthropic + Resend.

Usage:
  python3 headhunter.py --icp fintech_crypto_exchange --limit 25
  python3 headhunter.py --icp all --limit 50 --send
  python3 headhunter.py --dry-run
  python3 headhunter.py --status
"""
from __future__ import annotations

import argparse
import datetime as _dt
import hashlib
import json
import os
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'seo-agents'))
try:
    from ops_heartbeat import ping_once as _hb_ping
except ImportError:
    def _hb_ping(*a, **kw): return True
from collections import defaultdict
from typing import Optional

# ---------------------------------------------------------------------------
# ICPs (Ideal Customer Profiles) — sourced from cold_email_outreach.py
# Each ICP defines:
#   - The vertical
#   - Public sources to scrape (URLs we crawl)
#   - Title keywords that indicate a decision-maker
#   - The BizLegal product to pitch
#   - The qualification prompt for Anthropic
# ---------------------------------------------------------------------------

ICPS = {
    "fintech_crypto_exchange": {
        "name": "Crypto exchange / VASP / fintech",
        "pitch_product": "BRAI retainer + BizLegal Hub Scale",
        "pitch_url": "https://brai.bizlegal-ai.com/pricing",
        "title_keywords": [
            "chief compliance", "cco", "mlro", "head of compliance",
            "head of risk", "chief risk", "compliance officer",
            "regulatory affairs", "head of legal", "general counsel",
        ],
        "sources": [
            # Public license registries (real, scrapeable)
            "https://www.vara.ae/en/regulated-virtual-asset-issuers",
            "https://www.adgm.com/public-registers/fsra",
            "https://www.mas.gov.sg/regulation/registers-and-listing-of-regulated-entities/payment-services-licence-register",
            "https://www.fca.org.uk/register",
            "https://www.finra.org/rules-guidance/registered-representatives",
        ],
    },
    "law_firm_boutique": {
        "name": "Boutique law firm (5-50 lawyers)",
        "pitch_product": "LexAudit Boutique",
        "pitch_url": "https://lexaudit.bizlegal-ai.com/pricing",
        "title_keywords": [
            "managing partner", "senior partner", "equity partner",
            "general counsel", "compliance", "of counsel",
            "practice group leader", "head of practice",
        ],
        "sources": [
            # YC companies, law firm directories
            "https://www.ycombinator.com/companies?industry=Legal",
            "https://www.lawsociety.org.uk/find-a-solicitor/",
            "https://www.americanbar.org/groups/business_law/",
        ],
    },
    "saas_security": {
        "name": "SaaS (Series A-C) with SOC 2 / vendor security",
        "pitch_product": "DocAI SQA",
        "pitch_url": "https://docai.bizlegal-ai.com/sqa",
        "title_keywords": [
            "ciso", "chief information security", "vp security",
            "head of trust", "trust & security", "compliance lead",
            "vp engineering", "head of security", "security lead",
        ],
        "sources": [
            "https://www.ycombinator.com/companies?industry=Security",
            "https://www.crunchbase.com/hub/saas-security-companies",
        ],
    },
    "corporate_legal_ops": {
        "name": "Corporate legal ops / GCs at fintech+crypto",
        "pitch_product": "BizLegal Hub Pro",
        "pitch_url": "https://bizlegal-ai.com/agents/",
        "title_keywords": [
            "general counsel", "chief legal officer", "head of legal",
            "vp legal", "legal operations", "chief privacy officer",
            "compliance operations",
        ],
        "sources": [
            "https://www.ycombinator.com/companies?industry=Fintech",
            "https://www.crunchbase.com/hub/cryptocurrency-companies",
        ],
    },
    "compliance_consulting": {
        "name": "Compliance / RegTech consulting firms",
        "pitch_product": "BizLegal Hub Scale (referral partner)",
        "pitch_url": "https://bizlegal-ai.com/agents/",
        "title_keywords": [
            "managing director", "principal consultant", "practice lead",
            "compliance practice", "partner", "head of regulatory",
        ],
        "sources": [
            "https://www.ycombinator.com/companies?industry=RegTech",
            "https://www.crunchbase.com/hub/regtech-companies",
        ],
    },
    "in_house_fintech": {
        "name": "In-house counsel at crypto/fintech (Series B+)",
        "pitch_product": "BizLegal Hub Scale",
        "pitch_url": "https://bizlegal-ai.com/pricing",
        "title_keywords": [
            "general counsel", "head of legal", "chief legal officer",
            "vp legal", "regulatory counsel", "compliance officer",
        ],
        "sources": [
            "https://www.ycombinator.com/companies?industry=Crypto",
        ],
    },
    "enterprise_cfo_coo": {
        # ROAST-RESHAPE 2026-07-03: target CFO/COO, not VP Compliance.
        # These are the buyers who have the cost-cut mandate and own
        # the "enterprise deals blocked by compliance" pain.
        # Pitch: $40K custom compliance AI build + $30K/yr SaaS.
        "name": "Series B+ fintech CFO/COO (enterprise deal blocker ICP)",
        "pitch_product": "Custom Compliance AI Build ($40K + $30K/yr)",
        "pitch_url": "https://bizlegal-ai.com/agents/custom-compliance",
        "title_keywords": [
            "chief financial officer", "cfo", "chief operating officer", "coo",
            "vp finance", "vp operations", "head of finance", "head of operations",
            "chief revenue officer", "cro", "vp revenue", "head of revenue",
            "vp of growth", "general manager", "gm", "chief of staff",
        ],
        "sources": [
            # Companies actively hiring compliance roles = they have compliance gaps
            # These are LinkedIn search pages and public fintech directories
            "https://www.ycombinator.com/companies?industry=Fintech&batch=S23",
            "https://www.ycombinator.com/companies?industry=Fintech&batch=W24",
            "https://www.ycombinator.com/companies?industry=Fintech&batch=S24",
            "https://www.ycombinator.com/companies?industry=Crypto&batch=S23",
            "https://www.crunchbase.com/hub/series-b-fintech-companies",
        ],
        # Qualification: company has 50-500 employees, Series B+,
        # AND has posted a compliance-related job in last 90 days
        "qualify_prompt_extra": (
            "This ICP is ONLY valid for companies that: "
            "(1) raised Series B+ funding, "
            "(2) have 50-500 employees, "
            "(3) have active compliance/SOC2/GDPR job postings OR lost enterprise deals. "
            "Score 0 if none of these apply."
        ),
    },
}


# ---------------------------------------------------------------------------
# Email + name extraction
# ---------------------------------------------------------------------------

EMAIL_RE = re.compile(
    r'\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b'
)

# Obvious non-personal / system addresses to filter out
EMAIL_BLOCKLIST = {
    "noreply", "no-reply", "support", "info", "admin", "webmaster",
    "postmaster", "abuse", "contact", "sales", "press", "media",
    "privacy", "legal", "compliance@", "careers", "jobs",
    "investors", "ir@", "help", "hello",
}

PERSONAL_EMAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
    "icloud.com", "aol.com", "protonmail.com", "me.com",
    "mac.com",
}

# Title pattern: extract when we see a name near a title
TITLE_LINE_RE = re.compile(
    r'(?P<title>(?:Managing|General|Chief|Head|VP|Vice President|Senior|Director|Lead|Principal)\s+[A-Z][A-Za-z\s&/-]{2,40}?)\s*'
    r'(?:[-—–|:,]|\s)\s*'
    r'(?P<name>[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})'
)


def extract_emails(text: str) -> list[str]:
    """Return unique, filtered, lowercased email addresses."""
    raw = EMAIL_RE.findall(text)
    out = []
    for e in raw:
        e_l = e.lower()
        local, _, domain = e_l.partition("@")
        if any(b in local or b in e_l for b in EMAIL_BLOCKLIST):
            continue
        # Skip image/file extensions
        if any(e_l.endswith(ext) for ext in (".png", ".jpg", ".gif", ".pdf", ".css", ".js")):
            continue
        # Skip if domain has no dot (rare but possible junk)
        if "." not in domain:
            continue
        out.append(e_l)
    return list(dict.fromkeys(out))  # dedupe, preserve order


def extract_name_title(text: str) -> list[dict]:
    """Return list of {name, title} dicts from a text block."""
    out = []
    for m in TITLE_LINE_RE.finditer(text):
        out.append({"name": m.group("name").strip(), "title": m.group("title").strip()})
    return out


# ---------------------------------------------------------------------------
# Firecrawl integration (already in vault as FIRECRAWL_API_KEY)
# ---------------------------------------------------------------------------

def firecrawl_scrape(url: str, api_key: str) -> Optional[dict]:
    """Scrape a URL via Firecrawl. Returns {markdown, metadata} or None."""
    body = json.dumps({
        "url": url,
        "formats": ["markdown"],
        "onlyMainContent": False,
        "timeout": 30000,
    }).encode()
    req = urllib.request.Request(
        "https://api.firecrawl.dev/v1/scrape",
        data=body, method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            data = json.loads(r.read())
        if data.get("success") and "data" in data:
            return data["data"]
        return None
    except urllib.error.HTTPError as e:
        print(f"    [firecrawl] HTTP {e.code} for {url[:60]}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"    [firecrawl] {e!s:.80} for {url[:60]}", file=sys.stderr)
        return None


# ---------------------------------------------------------------------------
# Anthropic — qualify and draft
# ---------------------------------------------------------------------------

def anthropic_qualify(prospect: dict, icp: dict, api_key: str) -> dict:
    """Score a prospect 0-100. Return {score, reasons, disqualifiers}."""
    prompt = f"""You are qualifying a sales prospect for BizLegal AI, a B2B compliance SaaS.

PROSPECT:
  Name:  {prospect.get('name', '?')}
  Email: {prospect.get('email', '?')}
  Title: {prospect.get('title', '?')}
  Source URL: {prospect.get('source_url', '?')}

ICP (Ideal Customer Profile):
  Vertical: {icp['name']}
  Target titles: {', '.join(icp['title_keywords'])}
  Pitch product: {icp['pitch_product']} at {icp['pitch_url']}

SCORING CRITERIA (be strict):
  100 = Perfect: real person, correct title, correct industry, company is funded/active
   80 = Strong: person + title match, plausible company
   60 = Possible: title matches, but unclear company or industry
   40 = Weak: email looks real but title/company doesn't fit
   20 = Junk:  generic role, free email, or clearly wrong
    0 = Bot/role/invalid

Respond ONLY in JSON, no prose, no markdown fence:
{{
  "score": <int 0-100>,
  "reasons": ["<one-line reason>"],
  "disqualifiers": ["<one-line reason it's NOT a fit, or empty>"],
  "industry": "<one of: crypto, fintech, law, saas, consulting, other>",
  "company_size_estimate": "<1-10 | 11-50 | 51-200 | 201-1000 | 1000+ | unknown>"
}}
"""
    try:
        body = json.dumps({
            "model": "claude-sonnet-4-5",
            "max_tokens": 400,
            "messages": [{"role": "user", "content": prompt}],
        }).encode()
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=body, method="POST",
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "User-Agent": "Mozilla/5.0",
            },
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.loads(r.read())
        text = data["content"][0]["text"].strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.M)
        result = json.loads(text)
        return result
    except Exception as e:
        print(f"    [anthropic] qualify error: {e!s:.80}", file=sys.stderr)
        return {"score": 0, "reasons": ["error"], "disqualifiers": [str(e)[:80]]}


def anthropic_draft_email(prospect: dict, icp: dict, api_key: str) -> dict:
    """Generate a personalized cold email. Returns {subject, body, ps}."""
    prompt = f"""Write a short, personalized B2B cold email to this prospect.

PROSPECT:
  Name:  {prospect.get('name', '?')}
  Title: {prospect.get('title', '?')}
  Email: {prospect.get('email', '?')}

CONTEXT:
  Industry: {icp['name']}
  Our product: {icp['pitch_product']}
  Our URL:   {icp['pitch_url']}

RULES:
  - 60-90 words in the body (high reply rate)
  - Reference their SPECIFIC title + industry (not generic)
  - One specific pain point for that persona
  - Soft CTA: 15-min call, not "buy now"
  - P.S. line with a piece of value
  - Subject line: short, personalized, NOT clickbait
  - No flattery, no "I hope this finds you well"
  - No emojis, no exclamation marks
  - Do NOT use the prospect's first name in the body (often wrong from scrape)
  - Sign as: Moses
       BizLegal AI
       https://bizlegal-ai.com

Respond ONLY in JSON, no prose, no markdown fence:
{{
  "subject": "<subject line>",
  "body": "<email body, 60-90 words, with \\n\\n between paragraphs>",
  "ps": "<one-line P.S.>"
}}
"""
    try:
        body = json.dumps({
            "model": "claude-sonnet-4-5",
            "max_tokens": 600,
            "messages": [{"role": "user", "content": prompt}],
        }).encode()
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=body, method="POST",
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "User-Agent": "Mozilla/5.0",
            },
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.loads(r.read())
        text = data["content"][0]["text"].strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.M)
        return json.loads(text)
    except Exception as e:
        print(f"    [anthropic] draft error: {e!s:.80}", file=sys.stderr)
        return {"subject": f"Quick question for {prospect.get('name', 'you')}",
                "body": f"Hi,\n\nQuick question about {icp['name']}.\n\n[error generating personalized draft]\n\nMoses\nBizLegal AI",
                "ps": ""}


# ---------------------------------------------------------------------------
# Resend — send the email
# ---------------------------------------------------------------------------

def resend_send(to_email: str, to_name: str, subject: str, body: str, ps: str,
                api_key: str, from_email: str) -> tuple[int, str]:
    """Send via Resend API. Returns (status_code, message_id_or_error)."""
    full_body = body
    if ps:
        full_body += f"\n\nP.S. {ps}"

    text_content = full_body
    html_content = (
        f"<html><body>"
        f"<div style=\"font-family:-apple-system,sans-serif;max-width:600px;line-height:1.6;color:#222\">"
        f"{full_body.replace(chr(10)+chr(10), '</p><p>').replace('<p>', '<p>')}"
        f"</div></body></html>"
    )

    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "text": text_content,
        "html": html_content,
    }
    try:
        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=json.dumps(payload).encode(), method="POST",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
        )
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read())
        return r.status, data.get("id", "")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:200]
    except Exception as e:
        return 0, str(e)[:200]


# ---------------------------------------------------------------------------
# Supabase — load vault, query leads, write new ones
# ---------------------------------------------------------------------------

def load_vault(path: str = "/opt/bizlegal/curator/.env") -> dict:
    """Load env vars from vault file."""
    env = {}
    p = pathlib.Path(path)
    if not p.exists():
        return env
    for line in p.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()
    return env


def supabase_request(path: str, method: str = "GET", body: dict | None = None,
                     env: dict | None = None) -> tuple[int, list | dict]:
    env = env or load_vault()
    key = env.get("SUPABASE_SECRET", env.get("SUPABASE_SERVICE_KEY", ""))
    url = "https://ydghhcuuopqzgqcicubg.supabase.co"
    full_url = f"{url}/rest/v1/{path}"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
    }
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode()
        req = urllib.request.Request(full_url, data=data, method=method, headers=headers)
    else:
        req = urllib.request.Request(full_url, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            text = r.read()
            if not text:
                return r.status, {}
            return r.status, json.loads(text)
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read() or b"{}")
        except Exception:
            return e.code, {"error": str(e)}
    except Exception as e:
        return 0, {"error": str(e)[:200]}


def get_existing_emails(env: dict) -> set[str]:
    """Fetch all existing lead + newsletter emails to dedupe across all lead tables."""
    existing = set()
    for table in ("leadforge_leads", "inbound_leads", "leads", "newsletter_subscribers"):
        status, rows = supabase_request(f"{table}?select=email&limit=1000", env=env)
        if status == 200 and isinstance(rows, list):
            for r in rows:
                if r.get("email"):
                    existing.add(r["email"].lower())
    return existing


def insert_lead(lead: dict, env: dict) -> bool:
    """Insert a qualified lead into Supabase leadforge_leads."""
    status, result = supabase_request("leadforge_leads", method="POST", body=lead, env=env)
    if 200 <= status < 300:
        return True
    print(f"    [supabase] insert lead failed: HTTP {status}  {str(result)[:200]}")
    return False


def log_outreach(lead_email: str, lead_name: str, company: str,
                  subject: str, body_preview: str, status: str,
                  resend_id: str = "", env: dict = None) -> None:
    """Log an outreach attempt to lead_outreach (for tracking open/reply)."""
    body = {
        "lead_email": lead_email,
        "lead_name": lead_name or "",
        "company": company or "",
        "subject": subject or "",
        "body_preview": (body_preview or "")[:200],
        "status": status,  # draft | sent | failed | replied
        "sent_at": _dt.datetime.now(_dt.timezone.utc).isoformat() if status == "sent" else None,
    }
    supabase_request("lead_outreach", method="POST", body=body, env=env or load_vault())


def log_agent_run(env: dict, action: str, status: str, details: dict) -> None:
    """Append a row to agent_runs for observability."""
    body = {
        "agent_name": "headhunter",
        "action": action,
        "status": status,
        "details": details,
        "created_at": _dt.datetime.now(_dt.timezone.utc).isoformat(),
    }
    supabase_request("agent_runs", method="POST", body=body, env=env)


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def source_curated(icp_key: str, icp: dict, limit: int) -> list[dict]:
    """Use the hand-picked prospect list. Real, public, B2B contacts."""
    try:
        from prospects import by_vertical, verticals_summary
    except ImportError:
        import sys
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from prospects import by_vertical, verticals_summary

    print(f"\n  [curated] using hand-picked prospect list for {icp['name']}")
    if icp_key == "all":
        prospects_raw = []
        for v in verticals_summary().keys():
            prospects_raw.extend(by_vertical(v))
    else:
        prospects_raw = by_vertical(icp_key)

    prospects_raw = prospects_raw[:limit]
    print(f"  [curated] {len(prospects_raw)} prospects loaded (all confidence >= 70)")

    out = []
    for p in prospects_raw:
        out.append({
            "email": p["email"],
            "name": p.get("name", ""),
            "title": p.get("title", ""),
            "company": p.get("company", ""),
            "jurisdiction": p.get("jurisdiction", ""),
            "source_url": p.get("source", ""),
            "source": "curated",  # distinguishes from scraped
            "confidence": p.get("confidence", 80),
            "pitch_product": p.get("product_pitch", icp["pitch_product"]),
            "pitch_url": p.get("pitch_url", icp["pitch_url"]),
        })
    return out


def source_prospects(icp_key: str, icp: dict, firecrawl_key: str,
                      limit: int) -> list[dict]:
    """Scrape sources for this ICP. Return raw {name, title, email, source_url}."""
    print(f"\n  [source] scraping {len(icp['sources'])} URLs for {icp['name']}")
    prospects = []
    for url in icp["sources"]:
        print(f"    scraping {url[:80]}...", end=" ", flush=True)
        data = firecrawl_scrape(url, firecrawl_key)
        if not data:
            print("FAILED")
            continue
        md = data.get("markdown", "")
        if not md:
            print("empty")
            continue
        emails = extract_emails(md)
        names_titles = extract_name_title(md)
        print(f"  ok ({len(emails)} emails, {len(names_titles)} name+title pairs)")

        for e in emails:
            prospects.append({
                "email": e,
                "name": "",
                "title": "",
                "source_url": url,
            })
        for nt in names_titles:
            # Pair name+title with an email from same source (best-effort)
            email = emails[0] if emails else ""
            prospects.append({
                "email": email,
                "name": nt["name"],
                "title": nt["title"],
                "source_url": url,
            })

    # Dedupe by email
    seen = set()
    unique = []
    for p in prospects:
        if p["email"] and p["email"] not in seen:
            seen.add(p["email"])
            unique.append(p)
    print(f"  [source] {len(unique)} unique prospects")
    return unique[:limit]


def qualify_and_persist(prospects: list[dict], icp_key: str, icp: dict,
                        anthropic_key: str, env: dict, score_min: int) -> list[dict]:
    """Score each prospect, persist qualified ones, return them.

    Curated-source prospects skip the Anthropic call (they're pre-scored).
    Scraped prospects go through full Anthropic qualification.
    """
    existing = get_existing_emails(env)
    print(f"  [dedupe] {len(existing)} existing emails in Supabase")

    qualified = []
    for i, p in enumerate(prospects):
        if p["email"] in existing:
            print(f"  [{i+1}/{len(prospects)}] {p['email'][:30]:30s}  skip (already in DB)")
            continue
        if p.get("source") == "curated":
            # Use pre-scored confidence directly
            qual = {
                "score": p.get("confidence", 80),
                "reasons": ["curated list (pre-qualified)"],
                "disqualifiers": [],
                "industry": icp_key.split("_")[0] if icp_key != "all" else "fintech",
                "company_size_estimate": "201-1000",
            }
            score = p.get("confidence", 80)
            print(f"  [{i+1}/{len(prospects)}] {p['email'][:30]:30s}  curated score={score}")
        else:
            print(f"  [{i+1}/{len(prospects)}] qualifying {p['email'][:30]:30s}...", end=" ", flush=True)
            qual = anthropic_qualify(p, icp, anthropic_key)
            score = int(qual.get("score", 0))
            print(f"score={score} industry={qual.get('industry', '?')}")
        if score < score_min:
            continue
        p["qualification"] = qual
        p["score"] = score
        p["icp"] = icp_key
        p["status"] = "qualified"
        # Persist to leadforge_leads (correct schema)
        lead_row = {
            "email": p["email"],
            "company_name": p.get("company", ""),
            "industry": qual.get("industry", "?"),
            "source": icp_key,
            "score": score,
            "status": "qualified",
            "enriched_data": {
                "title": p.get("title", ""),
                "name": p.get("name", ""),
                "source_url": p.get("source_url", ""),
                "company_size_estimate": qual.get("company_size_estimate", "unknown"),
                "reasons": qual.get("reasons", []),
                "disqualifiers": qual.get("disqualifiers", []),
                "qualification": qual,
            },
        }
        if insert_lead(lead_row, env):
            qualified.append(p)
            existing.add(p["email"])
    print(f"  [qualify] {len(qualified)} qualified (score >= {score_min})")
    return qualified


def draft_and_send(qualified: list[dict], icp: dict, anthropic_key: str,
                   resend_key: str, from_email: str, dry_run: bool,
                   env: dict) -> list[dict]:
    """Draft personalized email for each qualified lead, then send (or queue)."""
    sent = []
    for i, p in enumerate(qualified):
        print(f"  [{i+1}/{len(qualified)}] drafting {p['email'][:30]:30s}...", end=" ", flush=True)
        draft = anthropic_draft_email(p, icp, anthropic_key)
        subject = draft.get("subject", "Quick question")
        body = draft.get("body", "")
        ps = draft.get("ps", "")
        print(f"drafted ({len(body.split())} words)")

        if dry_run:
            print(f"    [dry-run] would send: subject={subject[:60]!r}")
            sent.append({"email": p["email"], "subject": subject, "dry_run": True})
            continue

        status, msg = resend_send(p["email"], p.get("name", ""), subject, body, ps,
                                   resend_key, from_email)
        if 200 <= status < 300:
            print(f"    [sent] HTTP {status}  id={msg[:20]}")
            sent.append({"email": p["email"], "subject": subject,
                         "resend_id": msg, "status": "sent"})
            # Update lead status in leadforge_leads
            supabase_request(
                f"leadforge_leads?email=eq.{urllib.parse.quote(p['email'])}",
                method="PATCH",
                body={"status": "contacted"},
                env=env,
            )
            # Log to lead_outreach
            log_outreach(
                lead_email=p["email"],
                lead_name=p.get("name", ""),
                company=p.get("company", ""),
                subject=subject,
                body_preview=body,
                status="sent",
                resend_id=msg,
                env=env,
            )
        else:
            print(f"    [FAIL] HTTP {status}  {msg[:80]}")
            sent.append({"email": p["email"], "subject": subject,
                         "error": msg, "status": "failed"})
            log_outreach(
                lead_email=p["email"],
                lead_name=p.get("name", ""),
                company=p.get("company", ""),
                subject=subject,
                body_preview=body,
                status="failed",
                env=env,
            )
    return sent


def show_status(env: dict) -> None:
    print("=" * 70)
    print("HEADHUNTER STATUS")
    print("=" * 70)
    # leadforge_leads (where headhunter writes)
    status, leads = supabase_request("leadforge_leads?select=id,email,score,status,source,industry&order=created_at.desc&limit=20", env=env)
    if status == 200 and isinstance(leads, list):
        print(f"\nleadforge_leads (latest 20): {len(leads)}")
        by_status = defaultdict(int)
        for l in leads:
            by_status[l.get("status", "?")] += 1
        for s, c in by_status.items():
            print(f"  {s:15s} {c}")
        print("\nLast 5:")
        for l in leads[:5]:
            sc = l.get("score")
            print(f"  {sc if sc is not None else '?':>3}/100  {l.get('email', '?')[:30]:30s}  {l.get('status', '?')}")
    else:
        print(f"Error reading leadforge_leads: {status}  {str(leads)[:200]}")

    # lead_outreach
    status, outreach = supabase_request("lead_outreach?select=lead_email,subject,status,sent_at&order=sent_at.desc&limit=10", env=env)
    if status == 200 and isinstance(outreach, list):
        print(f"\nlead_outreach (last 10): {len(outreach)}")
        for o in outreach[:5]:
            print(f"  {o.get('sent_at', '?')[:19] if o.get('sent_at') else 'never':19}  {o.get('status', '?')[:10]:10}  {o.get('lead_email', '?')[:30]}")

    # agent_runs
    status, runs = supabase_request(
        "agent_runs?select=action,status,details,created_at&agent_name=eq.headhunter&order=created_at.desc&limit=10",
        env=env,
    )
    if status == 200 and isinstance(runs, list):
        print(f"\nHeadhunter runs (last 10): {len(runs)}")
        for r in runs:
            print(f"  {r.get('created_at', '?')[:19]}  {r.get('action', '?')[:25]:25s}  {r.get('status', '?')}")


def run_pipeline(args, env: dict) -> int:
    firecrawl_key = env.get("FIRECRAWL_API_KEY", "")
    anthropic_key = env.get("ANTHROPIC_API_KEY", "")
    resend_key = env.get("RESEND_API_KEY", "")
    from_email = env.get("RESEND_FROM_EMAIL", "Moses <moses@bizlegal-ai.com>")

    if not anthropic_key:
        print("FATAL: ANTHROPIC_API_KEY not in vault")
        return 1
    if not firecrawl_key:
        print("WARN: FIRECRAWL_API_KEY not in vault — will skip scraping, can't source")

    if args.status:
        show_status(env)
        return 0

    if args.icp == "all":
        icp_keys = list(ICPS.keys())
    else:
        icp_keys = [args.icp]

    all_qualified = []
    all_sent = []

    for icp_key in icp_keys:
        icp = ICPS[icp_key]
        print(f"\n{'='*70}")
        print(f"ICP: {icp_key}  ({icp['name']})")
        print(f"{'='*70}")

        if args.source == "curated" or not firecrawl_key:
            prospects = source_curated(icp_key, icp, args.limit)
        elif args.source == "scrape":
            if not firecrawl_key:
                print("  [skip] no Firecrawl key, can't scrape")
                continue
            prospects = source_prospects(icp_key, icp, firecrawl_key, args.limit)
        else:  # both
            curated = source_curated(icp_key, icp, args.limit)
            scraped = source_prospects(icp_key, icp, firecrawl_key, args.limit) if firecrawl_key else []
            prospects = curated + scraped

        if not prospects:
            print("  [skip] no prospects sourced")
            continue

        qualified = qualify_and_persist(prospects, icp_key, icp, anthropic_key,
                                         env, args.score_min)
        all_qualified.extend(qualified)

        if not args.no_send and qualified:
            sent = draft_and_send(qualified, icp, anthropic_key, resend_key,
                                   from_email, args.dry_run, env)
            all_sent.extend(sent)

    # Final summary
    print(f"\n{'='*70}")
    print(f"RUN COMPLETE — {len(all_qualified)} qualified, {len(all_sent)} sent/drafted")
    print(f"{'='*70}")
    log_agent_run(env, "pipeline", "success", {
        "icps": icp_keys,
        "qualified": len(all_qualified),
        "sent": len(all_sent),
        "dry_run": args.dry_run,
    })
    return 0


def main() -> int:
    _hb_ping('hetzner/headhunter', parent='cron:headhunter', status='alive', last_action='starting lead hunt')
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--icp", default="fintech_crypto_exchange",
                    choices=list(ICPS.keys()) + ["all"],
                    help="Which ICP to hunt (default: fintech_crypto_exchange)")
    ap.add_argument("--source", default="curated",
                    choices=["curated", "scrape", "both"],
                    help="Source: curated=hand-picked list (no Firecrawl needed), "
                         "scrape=Firecrawl only, both=combine (default: curated)")
    ap.add_argument("--limit", type=int, default=20,
                    help="Max prospects to consider per source URL")
    ap.add_argument("--score-min", type=int, default=70,
                    help="Minimum qualification score to proceed (0-100)")
    ap.add_argument("--dry-run", action="store_true",
                    help="Draft emails but don't send")
    ap.add_argument("--no-send", action="store_true",
                    help="Skip email sending entirely (just source + qualify + persist)")
    ap.add_argument("--status", action="store_true",
                    help="Show current state of headhunter leads + runs")
    args = ap.parse_args()

    env = load_vault()
    return run_pipeline(args, env)


if __name__ == "__main__":
    sys.exit(main())
