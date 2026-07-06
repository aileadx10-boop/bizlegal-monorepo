"""
Signal Scout Agent — Broader buying-signal scan.

Job: Daily scan for compliance buying signals across public web sources.
     Uses Firecrawl + Anthropic (NOT Apollo — Apollo skipped per plan).
     Queues drafts in lead_outreach for the headhunter to pick up.

Schedule: 01:00 UTC daily.

Signals tracked:
  1. Hiring   - public job listings for compliance/AML/legal roles
  2. Funding  - TechCrunch/Finsmes fintech/crypto funding news
  3. Pain     - Reddit/forum posts mentioning compliance pain points

Usage:
  python3 services/agents/signal_scout.py --limit 20
  python3 services/agents/signal_scout.py --dry-run --limit 5
"""
from __future__ import annotations
import json, os, time, re
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

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_SERVICE_KEY")
    or os.environ.get("SUPABASE_SECRET", "")
)
ANTHROPIC_API_KEY = _env.get_anthropic_key() if _env else os.environ.get("ANTHROPIC_API_KEY", "")
FIRECRAWL_API_KEY = os.environ.get("FIRECRAWL_API_KEY", "")


def _headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }


def _firecrawl_search(query: str, limit: int = 5) -> list:
    """Search the public web for a signal query. Free Firecrawl /search endpoint."""
    if not FIRECRAWL_API_KEY:
        return []
    try:
        import urllib.request
        body = json.dumps({"query": query, "limit": limit, "scrapeOptions": {"formats": ["markdown"]}}).encode()
        req = urllib.request.Request(
            "https://api.firecrawl.dev/v1/search",
            data=body,
            headers={"Authorization": f"Bearer {FIRECRAWL_API_KEY}", "Content-Type": "application/json"},
            method="POST",
        )
        r = urllib.request.urlopen(req, timeout=20)
        d = json.loads(r.read())
        return d.get("data", []) or []
    except Exception as e:
        print(f"[signal_scout] firecrawl err: {e}")
        return []


def _classify_with_claude(query: str, results: list) -> list:
    """Use Claude Haiku to score each result as a buying signal (0-100)."""
    if not results or not ANTHROPIC_API_KEY:
        return []
    try:
        import urllib.request
        # Compress results to fit in context
        compact = []
        for r in results[:8]:
            compact.append({
                "title": (r.get("title") or "")[:120],
                "url": r.get("url", "")[:200],
                "snippet": (r.get("markdown") or r.get("description") or "")[:300],
            })
        prompt = (
            "You are a buying-signal classifier for a B2B compliance AI product. "
            "Score each result 0-100 for whether it represents a REAL buying signal "
            "for a custom compliance AI build ($2.5K-$40K). "
            "High score (70+) = real company with real pain. "
            "Low score (<40) = generic content, news, or listicles. "
            'Output STRICT JSON: {"results": [{"idx": <int>, "score": <int>, "company": "<name>", "reason": "<one short sentence>"}]}\n\n'
            f"Query: {query}\n\nResults:\n{json.dumps(compact, indent=1)}"
        )
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=json.dumps({
                "model": "claude-haiku-4-5",
                "max_tokens": 1500,
                "messages": [{"role": "user", "content": prompt}],
            }).encode(),
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-05",
                "content-type": "application/json",
            },
            method="POST",
        )
        r = urllib.request.urlopen(req, timeout=30)
        d = json.loads(r.read())
        text = d["content"][0]["text"]
        m = re.search(r"\{[\s\S]*\}", text)
        if not m: return []
        scored = json.loads(m.group(0)).get("results", [])
        return scored
    except Exception as e:
        print(f"[signal_scout] claude err: {e}")
        return []


def _upsert_lead(email: str, name: str, company: str, source: str, score: int) -> str:
    """Insert or update a row in leadforge_leads. Returns lead id."""
    import urllib.request
    # Check for existing
    q = f"{SUPABASE_URL}/rest/v1/leadforge_leads?select=id&email=eq.{urllib.parse.quote(email)}&limit=1"
    try:
        req = urllib.request.Request(q, headers=_headers())
        existing = json.loads(urllib.request.urlopen(req, timeout=10).read())
    except Exception:
        existing = []
    if existing:
        return existing[0]["id"]
    body = json.dumps({
        "email": email, "full_name": name, "company_name": company,
        "source": source, "score": score, "status": "qualified",
        "industry": "fintech/crypto", "jurisdiction": "US",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).encode()
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/leadforge_leads",
        data=body, headers={**_headers(), "Prefer": "return=representation"},
        method="POST",
    )
    try:
        r = urllib.request.urlopen(req, timeout=10)
        rows = json.loads(r.read())
        return rows[0]["id"] if rows else ""
    except Exception as e:
        print(f"[signal_scout] lead insert err: {e}")
        return ""


def _enqueue_outreach(lead_id: str, lead_email: str, company: str, signal_text: str, score: int) -> bool:
    """Insert a draft into lead_outreach for headhunter to send."""
    import urllib.request
    body = json.dumps({
        "lead_email": lead_email,
        "lead_name": company,
        "company": company,
        "subject": f"Quick thought for {company}",
        "body_preview": signal_text[:1500],
        "pitch_variant": f"signal-scout-{int(time.time())}",
        "status": "drafted",
        "agent_run_id": f"signal_scout-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{lead_id[:8]}",
        "score": score,
    }).encode()
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/lead_outreach",
        data=body, headers={**_headers(), "Prefer": "return=minimal"}, method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception as e:
        print(f"[signal_scout] outreach insert err: {e}")
        return False


# 3 daily monitors
QUERIES = [
    ("hiring",   'site:linkedin.com "head of compliance" OR "AML officer" startup Series B'),
    ("hiring",   '"compliance officer" hiring fintech 2026'),
    ("funding",  'fintech Series B "compliance" 2026 announcement'),
    ("funding",  'crypto exchange "compliance hire" OR "CCO" 2026'),
    ("pain",     'site:reddit.com "compliance" fintech "wasting time" OR "manually" 2026'),
    ("pain",     'site:reddit.com "GDPR" "overwhelmed" OR "struggling" SaaS'),
    ("pain",     '"SOC 2" "drowning" OR "bottleneck" startup 2026'),
]


def run(ctx: dict | None = None) -> dict:
    ctx = ctx or {}
    limit = int(ctx.get("limit", 20))
    dry_run = bool(ctx.get("dry_run", False))
    started = time.time()
    queued = 0
    errors = 0
    scanned = 0
    drafted_leads = []

    if not FIRECRAWL_API_KEY:
        return {"ok": False, "error": "FIRECRAWL_API_KEY missing", "duration_ms": 0}
    if not ANTHROPIC_API_KEY:
        return {"ok": False, "error": "ANTHROPIC_API_KEY missing", "duration_ms": 0}

    for signal_type, query in QUERIES:
        try:
            results = _firecrawl_search(query, limit=5)
            scanned += len(results)
            if not results: continue
            scored = _classify_with_claude(query, results)
            for s in scored:
                if not isinstance(s, dict): continue
                score = int(s.get("score", 0))
                if score < 50: continue
                company = (s.get("company") or "").strip() or f"signal-{s.get('idx', 0)}"
                # Derive email placeholder (real email comes from enrichment)
                placeholder = f"lead-{int(time.time()*1000)}-{s.get('idx', 0)}@signal-scout.placeholder"
                reason = s.get("reason", "")
                if dry_run:
                    queued += 1
                    drafted_leads.append({"company": company, "score": score, "reason": reason})
                    continue
                lead_id = _upsert_lead(placeholder, company, company, f"signal:{signal_type}", score)
                if not lead_id: errors += 1; continue
                if _enqueue_outreach(lead_id, placeholder, company, reason, score):
                    queued += 1
                    drafted_leads.append({"company": company, "score": score})
                else:
                    errors += 1
        except Exception as e:
            errors += 1
            print(f"[signal_scout] {signal_type} err: {e}")

    if _heartbeat:
        try: _heartbeat("signal_scout", "ok" if errors == 0 else "partial")
        except Exception: pass

    return {
        "ok": errors == 0,
        "agent": "signal_scout",
        "scanned": scanned,
        "queued": queued,
        "errors": errors,
        "drafted": drafted_leads[:20],
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
            if v: args[k] = v
            elif i + 1 < len(sys.argv) and not sys.argv[i+1].startswith("--"):
                args[k] = sys.argv[i+1]; i += 1
            else: args[k] = True
        i += 1
    print(json.dumps(run(args), indent=2))
