"""
Signal Scout Agent — Broad buying-signal scan.

Job: Broader signal detection than headhunter_agent.
     Scans Apollo for companies matching compliance ICP triggers (SOC 2 in-progress,
     GDPR compliance hire, Series B+ fintech). Matches against enriched leads.
     Queues drafts in lead_outreach.

Complements headhunter_agent (LinkedIn job postings) with Apollo company data.

Schedule: 01:00 UTC daily.

Usage:
  from services.agents.signal_scout import run
  result = run({"limit": 20})
"""
from __future__ import annotations
import json, os, time
from datetime import datetime, timezone, timedelta
from pathlib import Path

try:
    import sys as _sys
    _sys.path.insert(0, str(Path(__file__).resolve().parent))
    _sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
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
APOLLO_API_KEY = os.getenv("APOLLO_API_KEY", "")


def _headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }


def _post_json(url: str, headers: dict, body: dict, timeout: int = 30) -> list | dict:
    import urllib.request
    raw = json.dumps(body).encode()
    req = urllib.request.Request(url, data=raw, headers=headers, method="POST")
    r = urllib.request.urlopen(req, timeout=timeout)
    return json.loads(r.read())


def _get_json(url: str, headers: dict, timeout: int = 10) -> list | dict:
    import urllib.request
    req = urllib.request.Request(url, headers=headers)
    r = urllib.request.urlopen(req, timeout=timeout)
    return json.loads(r.read())


def _apollo_people_search(limit: int = 20) -> list:
    """Search Apollo for compliance-role decision makers at Series B+ fintechs."""
    if not APOLLO_API_KEY:
        return []
    try:
        results = _post_json(
            "https://api.apollo.io/v1/mixed_people/search",
            {"Content-Type": "application/json", "x-api-key": APOLLO_API_KEY},
            {
                "q_organization_num_employees_ranges": ["51,500"],
                "funding_stages": ["series_b", "series_c", "series_d"],
                "q_person_title": [
                    "CFO", "COO", "Chief Financial Officer", "Chief Operating Officer",
                    "VP Finance", "VP Operations", "Chief Compliance Officer",
                    "Head of Compliance", "CISO", "General Counsel",
                ],
                "industry_tag_names": ["Financial Services", "Fintech", "Cryptocurrency"],
                "page": 1,
                "per_page": limit,
            },
            timeout=30,
        )
        return results.get("people", []) if isinstance(results, dict) else []
    except Exception:
        return []


def _already_drafted(email: str, days: int = 14) -> bool:
    """Check if we've already sent outreach to this email in the last N days."""
    if not email or not SUPABASE_KEY:
        return False
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    import urllib.parse
    url = (
        f"{SUPABASE_URL}/rest/v1/lead_outreach"
        f"?select=id&lead_email=eq.{urllib.parse.quote(email)}"
        f"&created_at=gte.{cutoff}&limit=1"
    )
    try:
        rows = _get_json(url, _headers(), timeout=5)
        return bool(rows)
    except Exception:
        return False


def _generate_pitch(person: dict, anthropic_key: str) -> dict:
    name = person.get("name", "")
    company = (person.get("organization") or {}).get("name", "")
    title = person.get("title", "")
    if not anthropic_key:
        return {
            "subject": f"Compliance AI for {company or 'your team'}",
            "body_preview": f"Hi {name},\n\nI noticed {company} is scaling compliance. BizLegal AI builds custom compliance AI ($40K build, $30K/yr SaaS) — pre-built security packet so CISO reviews move fast.",
        }
    try:
        prompt = (
            "Write a 3-sentence cold email from Moses (BizLegal AI) to a CFO/COO/compliance decision maker. "
            "No fluff. Reference their role + company specifically. "
            "Mention $40K custom compliance AI build, 6-week delivery, security packet pre-built. "
            "Output JSON with 'subject' (max 60 chars) and 'body_preview' (3 sentences max).\n\n"
            f"Recipient: {name}, {title} at {company}\n"
        )
        resp = _post_json(
            "https://api.anthropic.com/v1/messages",
            {
                "x-api-key": anthropic_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            {
                "model": "claude-haiku-4-5",
                "max_tokens": 256,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=20,
        )
        text = resp["content"][0]["text"].strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception:
        return {
            "subject": f"Compliance AI for {company}",
            "body_preview": f"Hi {name}, building compliance evidence for enterprise sales at {company} takes too long. BizLegal AI builds it in 6 weeks — $40K, security packet included.",
        }


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
    limit = int(ctx.get("limit", 20))
    dry_run = bool(ctx.get("dry_run", False))
    started = time.time()
    queued = 0
    skipped = 0
    errors = 0
    drafted: list[str] = []

    people = _apollo_people_search(limit=limit * 2)
    if not people:
        return {
            "ok": True,
            "agent": "signal_scout",
            "queued": 0,
            "skipped": 0,
            "note": "Apollo returned 0 people (check APOLLO_API_KEY)",
            "duration_ms": int((time.time() - started) * 1000),
        }

    for person in people[:limit]:
        email = person.get("email", "")
        name = person.get("name", "")
        company = (person.get("organization") or {}).get("name", "")
        title = person.get("title", "")

        if not email or "@" not in email:
            skipped += 1
            continue
        if _already_drafted(email):
            skipped += 1
            continue

        pitch = _generate_pitch(person, ANTHROPIC_API_KEY)
        draft = {
            "lead_email": email,
            "lead_name": name,
            "company": company,
            "pitch_variant": "signal-scout-apollo",
            "subject": pitch.get("subject", "")[:200],
            "body_preview": (pitch.get("body_preview") or "")[:2000],
            "status": "drafted",
            "agent_run_id": f"signal-scout-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{queued}",
        }
        if not dry_run:
            if _insert_draft(draft):
                queued += 1
                drafted.append(email)
            else:
                errors += 1
        else:
            queued += 1
            drafted.append(email)

    return {
        "ok": errors == 0,
        "agent": "signal_scout",
        "queued": queued,
        "skipped": skipped,
        "errors": errors,
        "drafted": drafted[:10],
        "duration_ms": int((time.time() - started) * 1000),
        "dry_run": dry_run,
    }


if __name__ == "__main__":
    import sys
    args: dict = {}
    i = 1
    while i < len(sys.argv):
        a = sys.argv[i]
        if a.startswith("--"):
            k, _, v = a[2:].partition("=")
            args[k] = v if v else (sys.argv[i + 1] if i + 1 < len(sys.argv) and not sys.argv[i + 1].startswith("--") else True)
            if v == "" and i + 1 < len(sys.argv) and not sys.argv[i + 1].startswith("--"):
                i += 1
        i += 1
    print(json.dumps(run(args), indent=2))
