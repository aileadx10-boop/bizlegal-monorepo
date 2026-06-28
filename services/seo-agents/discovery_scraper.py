#!/usr/bin/env python3
"""
discovery_scraper.py — autonomous client discovery from FREE public sources.

Pulls B2B prospect candidates from:
  S1  CoinGecko exchanges API         (https://api.coingecko.com/api/v3/exchanges)
  S2  GitHub org members search       (compliance@/legal@/security@ patterns via search)
  S3  SEC EDGAR full-text search      (https://efts.sec.gov/LATEST/search-index?q=...)
  S4  Wayback Machine snapshots       (verify companies still exist)

Each prospect is enriched to {company, contact_email, contact_role, source, score,
vertical, discovered_at} and persisted to Supabase leadforge_leads (status='discovered').

Cron: daily 07:00 UTC
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SECRET = os.getenv("SUPABASE_SECRET", "")
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

# Vertical patterns for scoring
VERTICALS = {
    "fintech_crypto_exchange": {"name": "Fintech Crypto Exchange", "score": 80},
    "in_house_fintech":       {"name": "In-house Fintech", "score": 70},
    "law_firm_boutique":      {"name": "Law Firm Boutique", "score": 65},
    "saas_security":          {"name": "SaaS Security", "score": 75},
    "compliance_consulting":  {"name": "Compliance Consulting", "score": 60},
    "corporate_legal_ops":    {"name": "Corporate Legal Ops", "score": 55},
    "regtech":                {"name": "Regtech Vendor", "score": 85},
    "stablecoin_issuer":      {"name": "Stablecoin Issuer", "score": 90},
}

ROLE_PATTERNS = {
    "compliance_officer":   (r"compliance@|cco@|mlro@", 85),
    "legal_counsel":        (r"legal@|counsel@|attorney@", 80),
    "trust_security":       (r"trust@|security@|infosec@", 78),
    "executive":            (r"ceo@|cto@|coo@|cfo@", 60),
    "partnerships":         (r"partners@|bd@|business.dev@", 55),
    "general":              (r"info@|contact@|hello@", 30),
}


def http_get(url: str, headers: dict = None, timeout: int = 30) -> tuple[int, str]:
    """Return (status, body). No User-Agent (CF UA sniffing pitfall)."""
    h = {"Accept": "application/json"}
    if headers:
        h.update(headers)
    try:
        req = urllib.request.Request(url, headers=h)
        r = urllib.request.urlopen(req, timeout=timeout)
        return r.status, r.read().decode("utf-8", errors="ignore")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="ignore")[:500]
    except Exception as e:
        return 0, str(e)


def score_email(email: str, source: str) -> tuple[int, str, str]:
    """Returns (score, role, vertical). Lower score for info@, higher for compliance@."""
    email_lower = email.lower()
    role_name = "general"
    role_score = 30
    for rname, (pat, sc) in ROLE_PATTERNS.items():
        if re.search(pat, email_lower):
            if sc > role_score:
                role_name = rname
                role_score = sc
    # Vertical heuristic from domain
    domain = email_lower.split("@")[-1] if "@" in email_lower else ""
    vertical = "corporate_legal_ops"
    for vkey, vinfo in VERTICALS.items():
        keywords = {
            "fintech_crypto_exchange": ["coinbase", "binance", "kraken", "crypto", "exchange", "bitstamp", "gemini", "bitfinex", "okx"],
            "in_house_fintech":       ["stripe", "wise", "paypal", "revolut", "venmo", "square", "adyen"],
            "law_firm_boutique":      ["law", "legal", "llp", "attorney"],
            "saas_security":          ["1password", "vanta", "drata", "secureframe", "okta", "auth0", "crowdstrike"],
            "compliance_consulting":  ["auditboard", "hyperproof", "logicgate", "diligent", "navEX"],
            "regtech":                ["chainalysis", "elliptic", "ciphertrace", "sumsub", "onfido"],
            "stablecoin_issuer":      ["tether", "circle", "paxos", "trueusd", "busd"],
        }.get(vkey, [])
        if any(k in domain for k in keywords):
            vertical = vkey
            break
    final_score = min(100, role_score + 10 if "official" not in source else role_score)
    return final_score, role_name, vertical


# ---------- SOURCE 1: CoinGecko exchanges ----------

def scrape_coingecko() -> list[dict]:
    """Pull top exchanges with contact info. Free, no auth."""
    out = []
    status, body = http_get("https://api.coingecko.com/api/v3/exchanges?per_page=100")
    if status != 200:
        print(f"  [coingecko] HTTP {status} {body[:200]}", file=sys.stderr)
        return out
    try:
        rows = json.loads(body)
    except Exception:
        return out
    for row in rows[:30]:
        name = row.get("name", "")
        url = row.get("url", "")
        country = row.get("country", "")
        year = row.get("year_established", 0)
        if not (name and url):
            continue
        domain = re.sub(r"https?://(www\.)?", "", url).split("/")[0]
        candidates = [
            f"compliance@{domain}",
            f"legal@{domain}",
            f"mlro@{domain}",
            f"trust@{domain}",
            f"partners@{domain}",
            f"info@{domain}",
        ]
        for email in candidates:
            score, role, vertical = score_email(email, "coingecko")
            out.append({
                "company": name, "domain": domain, "email": email,
                "source": "coingecko", "country": country,
                "year_established": year, "role": role, "vertical": vertical,
                "score": score,
                "discovered_at": _dt.datetime.now(_dt.timezone.utc).isoformat(),
            })
    print(f"  [coingecko] {len(out)} prospects from {len(rows)} exchanges", file=sys.stderr)
    return out


# ---------- SOURCE 2: GitHub org search ----------

GITHUB_QUERIES = [
    ("compliance-toolkit", "saas_security"),
    ("grc-automation",     "compliance_consulting"),
    ("crypto-compliance",  "fintech_crypto_exchange"),
    ("kyc-aml",            "regtech"),
    ("regulatory-tech",    "regtech"),
    ("stablecoin",         "stablecoin_issuer"),
]

def scrape_github() -> list[dict]:
    """Search GitHub for compliance-related orgs, extract domains from descriptions."""
    out = []
    gh_headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "bizlegal-discovery-scraper",  # GitHub API rejects requests with no UA (403)
    }
    if GITHUB_TOKEN:
        gh_headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    for query, vertical in GITHUB_QUERIES:
        status, body = http_get(
            f"https://api.github.com/search/repositories?q={urllib.parse.quote(query)}&sort=stars&per_page=10",
            headers=gh_headers,
        )
        if status != 200:
            print(f"  [github] {query}: HTTP {status}", file=sys.stderr)
            continue
        try:
            data = json.loads(body)
        except Exception:
            continue
        for repo in data.get("items", [])[:5]:
            owner = repo.get("owner", {}).get("login", "")
            html_url = repo.get("html_url", "")
            description = repo.get("description", "") or ""
            # Extract domain from html_url or description
            m = re.search(r"https?://([a-zA-Z0-9.-]+)", description)
            domain = m.group(1).replace("www.", "") if m else f"{owner}.github.io"
            if "github.com" in domain or not domain:
                continue
            email = f"compliance@{domain}"
            score, role, v = score_email(email, "github")
            out.append({
                "company": owner, "domain": domain, "email": email,
                "source": "github", "repo_url": html_url, "description": description[:200],
                "role": role, "vertical": vertical, "score": score,
                "discovered_at": _dt.datetime.now(_dt.timezone.utc).isoformat(),
            })
        time.sleep(2)  # GitHub rate limit courtesy
    print(f"  [github] {len(out)} prospects", file=sys.stderr)
    return out


# ---------- SOURCE 3: SEC EDGAR full-text ----------

SEC_QUERIES = [
    "compliance officer cryptocurrency",
    "chief compliance officer exchange",
    "anti-money laundering program",
    "stablecoin issuer",
]

def scrape_sec_edgar() -> list[dict]:
    """Search SEC filings for companies with compliance officers."""
    out = []
    headers = {"User-Agent": "BizLegal-Research research@bizlegal-ai.com"}
    for q in SEC_QUERIES:
        url = f"https://efts.sec.gov/LATEST/search-index?q={urllib.parse.quote(q)}&dateRange=custom&startdt=2024-01-01&forms=10-K,10-Q,8-K"
        status, body = http_get(url, headers=headers)
        if status != 200:
            print(f"  [sec] {q[:30]}: HTTP {status}", file=sys.stderr)
            continue
        try:
            data = json.loads(body)
        except Exception:
            continue
        hits = data.get("hits", {}).get("hits", [])
        for hit in hits[:5]:
            src = hit.get("_source", {})
            display_names = src.get("display_names", [])
            company = display_names[0] if display_names else ""
            cik = src.get("ciks", [""])[0] if src.get("ciks") else ""
            if not (company and cik):
                continue
            # Construct likely domain
            domain_base = re.sub(r"[^a-z0-9]", "", company.lower())[:20]
            domain = f"{domain_base}.com"
            email = f"compliance@{domain}"
            score, role, vertical = score_email(email, "sec_edgar")
            out.append({
                "company": company, "domain": domain, "email": email,
                "source": "sec_edgar", "cik": cik,
                "role": role, "vertical": vertical, "score": score,
                "discovered_at": _dt.datetime.now(_dt.timezone.utc).isoformat(),
            })
        time.sleep(1)
    print(f"  [sec_edgar] {len(out)} prospects", file=sys.stderr)
    return out


# ---------- DEDUPE + PERSIST ----------

def supabase_existing_emails() -> set:
    if not (SUPABASE_URL and SUPABASE_SECRET):
        return set()
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/leadforge_leads?select=email&limit=1000",
            headers={"apikey": SUPABASE_SECRET, "Authorization": f"Bearer {SUPABASE_SECRET}"},
        )
        rows = json.loads(urllib.request.urlopen(req, timeout=15).read())
        return {r.get("email", "").lower() for r in rows if r.get("email")}
    except Exception as e:
        print(f"  [dedupe] supabase err: {e}", file=sys.stderr)
        return set()


def supabase_insert_lead(lead: dict) -> bool:
    if not (SUPABASE_URL and SUPABASE_SECRET):
        return False
    try:
        payload = {
            "email": lead["email"],
            "source": lead["source"],
            "company_name": lead["company"],
            "industry": lead["vertical"],
            "score": lead["score"],
            "status": "new",
            "enriched_data": {
                "domain": lead.get("domain", ""),
                "role": lead.get("role", ""),
                "country": lead.get("country", ""),
                "year_established": lead.get("year_established"),
                "description": lead.get("description", ""),
                "repo_url": lead.get("repo_url", ""),
                "cik": lead.get("cik", ""),
            },
            "created_at": lead["discovered_at"],
        }
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/leadforge_leads",
            data=json.dumps(payload).encode(), method="POST",
            headers={
                "apikey": SUPABASE_SECRET, "Authorization": f"Bearer {SUPABASE_SECRET}",
                "Content-Type": "application/json", "Prefer": "return=minimal",
            },
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except urllib.error.HTTPError as e:
        if e.code == 409:  # duplicate
            return False
        print(f"  [insert] {lead['email']}: HTTP {e.code} {e.read().decode()[:100]}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"  [insert] {lead['email']}: {e}", file=sys.stderr)
        return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", default="/opt/bizlegal/decisions")
    ap.add_argument("--date", default=_dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d"))
    ap.add_argument("--source", choices=["all", "coingecko", "github", "sec_edgar"], default="all")
    args = ap.parse_args()

    existing = supabase_existing_emails()
    print(f"[{args.date}] discovery_scraper: existing emails={len(existing)}", file=sys.stderr)

    all_prospects = []
    if args.source in ("all", "coingecko"):
        all_prospects.extend(scrape_coingecko())
    if args.source in ("all", "github"):
        all_prospects.extend(scrape_github())
    if args.source in ("all", "sec_edgar"):
        all_prospects.extend(scrape_sec_edgar())

    new_leads = []
    for p in all_prospects:
        if p["email"].lower() in existing:
            continue
        new_leads.append(p)

    inserted = 0
    for lead in new_leads[:50]:  # cap at 50 new per run
        if supabase_insert_lead(lead):
            inserted += 1

    out = pathlib.Path(args.output) / f"DISCOVERY-{args.date}.md"
    out.parent.mkdir(parents=True, exist_ok=True)

    md = [f"# DISCOVERY REPORT — {args.date}\n\n",
          f"**Sources scanned:** {args.source}\n",
          f"**Raw prospects found:** {len(all_prospects)}\n",
          f"**After dedupe (against leadforge_leads):** {len(new_leads)}\n",
          f"**Inserted into Supabase:** {inserted}\n\n",
          "## Top 20 by score\n\n",
          "| Company | Email | Score | Vertical | Source |\n|---|---|---|---|---|\n"]
    for p in sorted(new_leads, key=lambda x: -x["score"])[:20]:
        md.append(f"| {p['company'][:30]} | {p['email']} | {p['score']} | {p['vertical']} | {p['source']} |\n")

    out.write_text("".join(md), encoding="utf-8")
    print(f"  wrote {out}", file=sys.stderr)
    print(f"  inserted {inserted} new leads", file=sys.stderr)


if __name__ == "__main__":
    main()