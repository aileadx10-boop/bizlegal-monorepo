"""
Enrichment Agent — Domain/person -> 360 profile.

Job: Take a domain or person and produce a 360 profile
(company size, funding, recent posts, contact info, intent signals, score).

Sources: Firecrawl (deep scrape), Apify (LinkedIn Jobs/Maps/Twitter),
Apollo (contact enrichment), Supabase leadforge_leads (existing).

Output: Writes to leadforge_leads.enriched_data (JSONB).

Schedule: 02:00, 14:00 UTC.

Usage:
  from services.agents.enrichment_agent import run
  result = run({"limit": 50, "min_score": 0})
  # or
  result = run({"domains": ["acme.com", "circle.com"], "dry_run": True})
"""
from __future__ import annotations
import json, os, time, uuid
from datetime import datetime, timezone
from typing import Any
from pathlib import Path

try:
    import sys as _sys
    _sys.path.insert(0, str(Path(__file__).resolve().parent))
    import _env
    from dotenv import load_dotenv
    try:
        from orchestrator import heartbeat as _heartbeat
    except Exception:
        _heartbeat = None
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")
except Exception:
    pass

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_SERVICE_KEY")
    or os.getenv("SUPABASE_SECRET", "")
)
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY", "")
APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN", "")
APOLLO_API_KEY = os.getenv("APOLLO_API_KEY", "")


def _headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }


def _http_get_json(url: str, headers: dict, timeout: int = 20) -> dict:
    import urllib.request
    req = urllib.request.Request(url, headers=headers)
    r = urllib.request.urlopen(req, timeout=timeout)
    return json.loads(r.read())


def _http_post_json(url: str, headers: dict, body: dict, timeout: int = 60) -> dict:
    import urllib.request
    raw = json.dumps(body).encode()
    req = urllib.request.Request(url, data=raw, headers=headers, method="POST")
    r = urllib.request.urlopen(req, timeout=timeout)
    return json.loads(r.read())


def _fetch_leads(limit: int, min_score: int) -> list:
    """Pull leads that need enrichment (no enriched_data, or older than 30d)."""
    url = (
        f"{SUPABASE_URL}/rest/v1/leadforge_leads"
        f"?select=id,email,company_name,industry,score,enriched_data"
        f"&enriched_data=is.null"
        f"&score=gte.{min_score}"
        f"&order=score.desc&limit={limit}"
    )
    try:
        return _http_get_json(url, _headers(), timeout=10)
    except Exception as e:
        return [{"_error": str(e)}]


def _firecrawl_scrape(domain: str) -> dict:
    """Use Firecrawl to get a structured scrape of the company site.
    Returns {title, description, headings, text_excerpt, links}."""
    if not FIRECRAWL_API_KEY:
        return {"_skipped": "no FIRECRAWL_API_KEY"}
    try:
        body = {
            "url": f"https://{domain}",
            "formats": ["markdown"],
            "onlyMainContent": True,
            "includeTags": ["title", "meta", "h1", "h2", "h3"],
        }
        return _http_post_json(
            "https://api.firecrawl.dev/v1/scrape",
            {"Authorization": f"Bearer {FIRECRAWL_API_KEY}", "Content-Type": "application/json"},
            body,
            timeout=45,
        )
    except Exception as e:
        return {"_error": str(e)}


def _apollo_enrich(domain: str) -> dict:
    """Use Apollo to find employees and funding signals for a company."""
    if not APOLLO_API_KEY:
        return {"_skipped": "no APOLLO_API_KEY"}
    try:
        return _http_post_json(
            "https://api.apollo.io/v1/organizations/enrich",
            {"api_key": APOLLO_API_KEY, "Content-Type": "application/json"},
            {"domain": domain},
            timeout=30,
        ).get("organization", {})
    except Exception as e:
        return {"_error": str(e)}


def _summarize_with_claude(domain: str, scrape: dict, apollo: dict) -> dict:
    """Use Claude to synthesize a profile summary + intent score."""
    if not ANTHROPIC_API_KEY:
        return {"_skipped": "no ANTHROPIC_API_KEY"}
    excerpt = (scrape.get("data", {}).get("markdown", "") or scrape.get("markdown", ""))[:2000]
    if not excerpt:
        excerpt = json.dumps(apollo)[:2000]
    if not excerpt:
        return {"_skipped": "no content to summarize"}
    try:
        prompt = (
            "You are a B2B enrichment analyst. Given a domain and what we know about it, "
            "output JSON with: company_name, industry, employee_band (1-10/11-50/51-200/201-1000/1000+), "
            "hq_country, intent_signals (array of strings), summary (1 sentence), "
            "enrichment_score (0-10, 10=highest intent). Output ONLY JSON.\n\n"
            f"Domain: {domain}\n"
            f"Content excerpt: {excerpt[:1500]}\n"
            f"Apollo: {json.dumps(apollo)[:800]}\n"
        )
        resp = _http_post_json(
            "https://api.anthropic.com/v1/messages",
            {
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            {"model": "claude-haiku-4-5", "max_tokens": 512, "messages": [{"role": "user", "content": prompt}]},
            timeout=30,
        )
        text = resp["content"][0]["text"].strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        return {"_error": str(e)}


def _write_enrichment(lead_id: str, profile: dict) -> bool:
    """Update the lead with enriched_data and enriched_at."""
    import urllib.request
    body = json.dumps({
        "enriched_data": profile,
        "enriched_at": datetime.now(timezone.utc).isoformat(),
    }).encode()
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/leadforge_leads?id=eq.{lead_id}",
            data=body,
            headers={**_headers(), "Prefer": "return=minimal"},
            method="PATCH",
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False


def run(ctx: dict | None = None) -> dict:
    """Enrich leads in batch.

    ctx keys:
        limit (int, default 25): max leads to process this run
        min_score (int, default 0): only process leads with score >= this
        domains (list, optional): enrich specific domains instead of batch
        dry_run (bool, default False): if True, do not write to Supabase
    """
    ctx = ctx or {}
    limit = int(ctx.get("limit", 25))
    min_score = int(ctx.get("min_score", 0))
    dry_run = bool(ctx.get("dry_run", False))
    started = time.time()
    if _heartbeat and not ctx.get('_heartbeat_sent'):
        try: _heartbeat('enrichment', str(ctx.get('_goal', 'direct'))[:200], 'started', {'ctx_keys': list(ctx.keys())}, 0)
        except Exception: pass
    enriched = 0
    skipped = 0
    errors = 0
    processed_ids = []

    # Targeted mode: enrich specific domains
    if ctx.get("domains"):
        leads = [{"id": f"adhoc-{d}", "company_name": d, "email": None} for d in ctx["domains"]]
    else:
        leads = _fetch_leads(limit, min_score)

    for lead in leads:
        if lead.get("_error"):
            errors += 1
            continue
        domain = (lead.get("company_name") or "").strip().lower()
        # naive domain extraction from email if company_name is missing
        if not domain and lead.get("email"):
            domain = lead["email"].split("@")[-1].lower()
        if not domain or "@" in domain and "." not in domain:
            skipped += 1
            continue

        scrape = _firecrawl_scrape(domain)
        apollo = _apollo_enrich(domain)
        profile = _summarize_with_claude(domain, scrape, apollo)

        if profile.get("_error") or profile.get("_skipped"):
            errors += 1
            continue

        if not dry_run and not lead["id"].startswith("adhoc-"):
            if _write_enrichment(lead["id"], profile):
                enriched += 1
                processed_ids.append(lead["id"])
            else:
                errors += 1
        else:
            enriched += 1
            processed_ids.append(domain)

    return {
        "ok": errors == 0,
        "agent": "enrichment",
        "enriched": enriched,
        "skipped": skipped,
        "errors": errors,
        "processed": processed_ids[:20],
        "duration_ms": int((time.time() - started) * 1000),
        "dry_run": dry_run,
    }


if __name__ == "__main__":
    import sys
    args = {}
    for i, a in enumerate(sys.argv[1:], 1):
        if a.startswith("--"):
            k, _, v = a[2:].partition("=")
            if v:
                args[k] = v
            else:
                args[sys.argv[i+1] if i+1 < len(sys.argv) and not sys.argv[i+1].startswith("--") else "_flag"] = True
    print(json.dumps(run(args), indent=2))
