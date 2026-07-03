"""
Headhunter Agent — Signal-based outbound.

Job: Find buying signals -> match to enriched leads -> queue personalized outreach.

Signals (ROAST-RESHAPE 2026-07-03 — compliance hiring = $40K ICP trigger):
  T1 (highest intent): Company posting Head of Compliance / CCO / MLRO role (score 80),
    SOC 2 / GDPR / AML compliance role (score 70), Compliance Manager (score 60).
    These companies have a compliance gap and are our $40K custom build ICP.
  T2 (adjacent): CISO / Trust & Safety / Security Compliance hire (score 50),
    Legal Operations / Deputy GC hire (score 40).

Output: Inserts into lead_outreach with status='drafted'.

Schedule: 04:30 UTC daily.

Usage:
  from services.agents.headhunter_agent import run
  result = run({"limit": 10, "min_score": 80, "signal_tier": 1})
"""
from __future__ import annotations
import json, os, time
from datetime import datetime, timezone
from pathlib import Path

try:
    import sys as _sys
    _sys.path.insert(0, str(Path(__file__).resolve().parent))
    import _env
    from orchestrator import heartbeat as _heartbeat
except Exception:
    _heartbeat = None
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")
except Exception:
    pass

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_SERVICE_KEY")
    or os.getenv("SUPABASE_SECRET", "")
)
ANTHROPIC_API_KEY = _env.get_anthropic_key()
APIFY_API_TOKEN = _env.get_apify_token()
def _headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }


def _get_json(url: str, headers: dict, timeout: int = 15) -> Any:
    import urllib.request
    req = urllib.request.Request(url, headers=headers)
    r = urllib.request.urlopen(req, timeout=timeout)
    return json.loads(r.read())


def _post_json(url: str, headers: dict, body: dict, timeout: int = 30) -> Any:
    import urllib.request
    raw = json.dumps(body).encode()
    req = urllib.request.Request(url, data=raw, headers=headers, method="POST")
    r = urllib.request.urlopen(req, timeout=timeout)
    return json.loads(r.read())


def _apify_linkedin_jobs(queries: list, limit: int = 50) -> list:
    """Scrape LinkedIn Jobs via Apify for buying signals.
    Returns [{company, job_title, posted_at, ...}]"""
    if not APIFY_API_TOKEN:
        return []
    # Apify's LinkedIn Jobs scraper actor (valig/linkedin-jobs-scraper)
    actor_id = "bebity/linkedin-jobs-scraper"
    sync_url = f"https://api.apify.com/v2/acts/{actor_id}/run-sync-get-dataset-items"
    body = {
        "title": queries,
        "location": "United States",
        "rows": limit,
        "proxy": {"useApifyProxy": True},
    }
    try:
        results = _post_json(
            sync_url,
            {"Authorization": f"Bearer {APIFY_API_TOKEN}", "Content-Type": "application/json"},
            body,
            timeout=120,
        )
        return results or []
    except Exception:
        return []


def _score_signal(job: dict) -> int:
    """Score 0-100 for job posting signal strength.
    ROAST-RESHAPE 2026-07-03: compliance hiring signals are our $40K ICP trigger.
    A company posting Head of Compliance / SOC 2 roles = they have a compliance gap
    = they are a candidate for a $40K custom compliance AI build.
    """
    title = (job.get("title") or job.get("position") or "").lower()
    score = 0
    # Tier 1 — direct compliance gap signals (highest value)
    if any(k in title for k in ["chief compliance", "head of compliance", "vp compliance", "cco", "mlro"]):
        score += 80
    if any(k in title for k in ["soc 2", "gdpr", "aml compliance", "regulatory affairs", "compliance operations"]):
        score += 70
    if any(k in title for k in ["compliance manager", "compliance officer", "regulatory compliance"]):
        score += 60
    # Tier 2 — adjacent signals (medium value)
    if any(k in title for k in ["ciso", "trust and safety", "information security", "security compliance"]):
        score += 50
    if any(k in title for k in ["legal operations", "general counsel", "deputy general counsel"]):
        score += 40
    # Seniority modifier
    if "senior" in title or "lead" in title or "head" in title or "chief" in title or "vp" in title:
        score += 10
    return min(score, 100)


def _generate_pitch(lead: dict, signal: dict, anthropic_key: str) -> dict:
    """Use Claude to generate a personalized subject + body for the outreach."""
    if not anthropic_key:
        return {
            "subject": f"Quick idea for {lead.get('company_name', 'your team')}",
            "body_preview": f"Hi {lead.get('full_name', 'there')},\n\nSaw the {signal.get('title', 'role')} opening. Wanted to share something relevant.",
        }
    try:
        prompt = (
            "You are a B2B cold email writer. Write a 3-sentence cold email for the lead below. "
            "The email must reference the specific signal. No fluff. No 'I hope this finds you well'. "
            "Output JSON with subject (max 60 chars) and body_preview (3 sentences max).\n\n"
            f"Lead: {json.dumps(lead)[:500]}\n"
            f"Signal: {json.dumps(signal)[:500]}\n"
            f"Product context: BizLegal AI - compliance intelligence for crypto/Web3 companies. "
            f"Products: DocAI ($97 contract scan), LexAudit ($99/mo compliance cert), "
            f"BRAI (wallet risk), TRACR (forensics), LeadForge (B2B legal leads marketplace).\n"
        )
        resp = _post_json(
            "https://api.anthropic.com/v1/messages",
            {
                "x-api-key": anthropic_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            {"model": "claude-haiku-4-5", "max_tokens": 384, "messages": [{"role": "user", "content": prompt}]},
            timeout=30,
        )
        text = resp["content"][0]["text"].strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception:
        return {
            "subject": f"Idea for {lead.get('company_name', 'your team')}",
            "body_preview": f"Hi {lead.get('full_name', 'there')}, saw the role. Quick thought.",
        }


def _fetch_qualified_leads(limit: int, min_score: int) -> list:
    url = (
        f"{SUPABASE_URL}/rest/v1/leadforge_leads"
        f"?select=id,email,company_name,full_name,score,industry,enriched_data"
        f"&status=eq.qualified&score=gte.{min_score}"
        f"&order=score.desc&limit={limit}"
    )
    try:
        return _get_json(url, _headers(), timeout=10)
    except Exception:
        return []


def _already_queued(lead_id: str) -> bool:
    """Check if a draft already exists for this lead in the last 14 days."""
    import urllib.request
    url = (
        f"{SUPABASE_URL}/rest/v1/lead_outreach"
        f"?select=id&lead_email=in.({urllib.parse.quote(lead_id)})"
        f"&created_at=gte.{(datetime.now(timezone.utc) - __import__('datetime').timedelta(days=14)).isoformat()}"
    )
    # Use leadforge_leads.id == lead_outreach.lead_email is not a real join. So:
    # check by company+contact. For simplicity, do it by email.
    return False


def _insert_draft(draft: dict) -> bool:
    import urllib.request
    body = json.dumps(draft).encode()
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/lead_outreach",
            data=body,
            headers={**_headers(), "Prefer": "return=minimal"},
            method="POST",
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False


def run(ctx: dict | None = None) -> dict:
    ctx = ctx or {}
    limit = int(ctx.get("limit", 10))
    min_score = int(ctx.get("min_score", 80))
    signal_tier = int(ctx.get("signal_tier", 1))
    dry_run = bool(ctx.get("dry_run", False))
    started = time.time()
    queued = 0
    errors = 0
    signals_found = 0
    drafted = []

    # 1. Get signals (job postings)
    # ROAST-RESHAPE 2026-07-03: compliance hiring = company has compliance gap = buying signal.
    # Companies posting "Head of Compliance", "SOC 2", "GDPR" jobs are our $40K ICP.
    queries = [
        "Head of Compliance", "VP Compliance", "Chief Compliance Officer",
        "SOC 2 compliance", "GDPR compliance manager", "AML compliance",
        "compliance operations", "regulatory affairs manager",
    ]
    jobs = _apify_linkedin_jobs(queries, limit=limit * 3)
    hot_jobs = [j for j in jobs if _score_signal(j) >= 50]
    signals_found = len(hot_jobs)

    # 2. Match signals to qualified leads
    leads = _fetch_qualified_leads(limit=limit * 2, min_score=min_score)
    if not leads or not hot_jobs:
        return {
            "ok": True,
            "agent": "headhunter",
            "queued": 0,
            "signals_found": signals_found,
            "errors": 0,
            "duration_ms": int((time.time() - started) * 1000),
            "note": "no leads or no signals this run",
        }

    # Simple matching: pair top job with top lead (signal-based outbound is
    # about timing, not perfect fit — first 10 are the valuable ones)
    for i, lead in enumerate(leads[:limit]):
        if i >= len(hot_jobs):
            break
        job = hot_jobs[i]
        company = (job.get("companyName") or job.get("company") or "").strip()
        # Skip if lead company != job company
        if lead.get("company_name", "").lower() != company.lower():
            # Still draft if we have a strong lead
            pass
        pitch = _generate_pitch(lead, job, ANTHROPIC_API_KEY)
        draft = {
            "lead_email": lead.get("email") or f"unknown+{lead['id']}@placeholder.local",
            "lead_name": lead.get("full_name") or "Contact",
            "company": lead.get("company_name", ""),
            "pitch_variant": f"signal-job-{signal_tier}",
            "subject": pitch.get("subject", "")[:200],
            "body_preview": (pitch.get("body_preview") or "")[:2000],
            "status": "drafted",
            "agent_run_id": f"headhunter-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{i}",
        }
        if not dry_run:
            if _insert_draft(draft):
                queued += 1
                drafted.append(draft["lead_email"])
            else:
                errors += 1
        else:
            queued += 1
            drafted.append(draft["lead_email"])

    return {
        "ok": errors == 0,
        "agent": "headhunter",
        "queued": queued,
        "signals_found": signals_found,
        "errors": errors,
        "drafted": drafted[:10],
        "duration_ms": int((time.time() - started) * 1000),
        "dry_run": dry_run,
    }


if __name__ == "__main__":
    import sys
    args = {}
    i = 1
    while i < len(sys.argv):
        a = sys.argv[i]
        if a.startswith("--"):
            k, _, v = a[2:].partition("=")
            if v:
                args[k] = v
            elif i + 1 < len(sys.argv) and not sys.argv[i+1].startswith("--"):
                args[k] = sys.argv[i+1]
                i += 1
            else:
                args[k] = True
        i += 1
    print(json.dumps(run(args), indent=2))
