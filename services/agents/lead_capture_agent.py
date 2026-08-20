"""
Lead Capture Agent — Form submission -> 4-stage Haiku pipeline.

Job: Receive form submission -> run 4-stage Haiku pipeline (extract ->
critique -> score -> summary) -> write to leadforge_leads -> trigger
opt-in nurture picks the lead up from there (no prospecting hand-off).

Stack: Webhook from any of 7 subdomains, Haiku 4.5 for all 4 stages
(cheap, fast, deterministic), schema validation against lead-profile.json.

Output: Lead with full qualification.scores, summary_bullets, pipeline_meta,
status='qualified' if hot.

Schedule: Webhook-triggered (no cron needed).

Usage:
  from services.agents.lead_capture_agent import run
  result = run({"form_submission": {...}})
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
def _headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }


def _call_haiku(system: str, user: str, max_tokens: int = 1024) -> str:
    """Call Claude Haiku 4.5 with assistant prefill of '{' to force JSON output."""
    if not ANTHROPIC_API_KEY:
        return "{}"
    import urllib.request
    body = json.dumps({
        "model": "claude-haiku-4-5",
        "max_tokens": max_tokens,
        "temperature": 0,
        "system": system,
        "messages": [{"role": "user", "content": user}],
    }).encode()
    try:
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=body,
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            method="POST",
        )
        r = urllib.request.urlopen(req, timeout=30)
        d = json.loads(r.read())
        text = d["content"][0]["text"].strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return text
    except Exception as e:
        return json.dumps({"_error": str(e)})


SYSTEM_EXTRACT = """You extract structured data from lead form submissions for BizLegal-AI, a compliance intelligence service.
Output ONLY valid JSON matching the schema below. No prose, no markdown fences, no explanation.

Schema:
{
  "language": "ISO 639-1 code",
  "contact": {"full_name": "string", "email": "valid email or null", "phone": "string or null", "role": "string or null"},
  "company": {"name": "string or null", "website": "URL or null", "industry": "string or null", "size_band": "1-10/11-50/51-200/201-1000/1000+ or null", "hq_country": "ISO 3166-1 alpha-2 or null", "hq_region": "string or null"},
  "pain": {"extracted_challenge": "one sentence rephrase", "jurisdictions_mentioned": [], "regulations_mentioned": [], "urgency_signals": [], "budget_signals": []}
}

Rules:
- Do NOT infer facts not present. Use null for unknowns.
- Use the lead's own words for industry.
- extracted_challenge must be 1 sentence, max 30 words.
Return valid JSON only."""


SYSTEM_SCORE = """You are a senior crypto/Web3 compliance sales qualification analyst for BizLegal-AI, a $10K+/month regulatory intelligence service.

Output ONLY valid JSON:
{
  "vertical": "compliance | regulatory_risk | jurisdiction_arbitrage | business_intelligence | other",
  "scores": {"fit": 0-10, "urgency": 0-10, "budget": 0-10, "vertical_match": 0-10, "decision_authority": 0-10, "pain_clarity": 0-10},
  "overall_score": 0-10,
  "recommended_action": "respond_immediately | qualify_further | disqualify",
  "rationale": "2-3 sentence justification"
}

ICP: Crypto/Web3 company (DeFi, CEX/DEX, L1/L2, custodian, token issuer, NFT, stablecoin, RWA, crypto fund), or law firm with active crypto clients. Size: well-funded seed to listed. Active compliance pain: MiCA, VARA, BitLicense, SEC, DOJ, OFAC, Travel Rule. Decision authority: CCO, GC, Head of Legal, external crypto-specialist.

NOT ICP: retail, traditional SaaS, students, airdrop-seekers, investment advice requests.

overall = round(0.20*fit + 0.20*urgency + 0.15*budget + 0.20*vertical_match + 0.10*decision_authority + 0.15*pain_clarity, 1)
>= 8.0 -> respond_immediately; 5.5-7.9 -> qualify_further; < 5.5 -> disqualify."""


SYSTEM_SUMMARY = """You write a 5-bullet executive summary of a lead for the BizLegal founder.
Output ONLY valid JSON: {"summary_bullets": ["...", "...", "...", "...", "..."]}.
Each bullet: 1 sentence, max 25 words, specific (name regulation, jurisdiction, company, raise)."""


def _upsert_lead(profile: dict, qualification: dict, summary: dict) -> str:
    """Insert or update the lead in leadforge_leads. Returns the lead id."""
    import urllib.request
    # 2026-07-10 A8: refuse fabricated emails at insert time
    try:
        from email_guard import is_valid_lead_email as _is_valid
    except Exception:
        def _is_valid(e): return bool(e and "@" in e and "." in e)
    if not _is_valid(profile.get("contact", {}).get("email")):
        return None  # skip
    row = {
        "email": profile.get("contact", {}).get("email"),
        "full_name": profile.get("contact", {}).get("full_name"),
        "company_name": (profile.get("company", {}) or {}).get("name"),
        "industry": (profile.get("company", {}) or {}).get("industry"),
        "score": qualification.get("overall_score", 0),
        "status": (
            "qualified" if qualification.get("recommended_action") == "respond_immediately"
            else "new" if qualification.get("recommended_action") == "qualify_further"
            else "rejected"
        ),
        "enriched_data": {
            "extracted_profile": profile,
            "qualification": qualification,
            "summary_bullets": (summary or {}).get("summary_bullets", []),
        },
        "received_at": datetime.now(timezone.utc).isoformat(),
    }
    body = json.dumps(row).encode()
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/leadforge_leads",
            data=body,
            headers={**_headers(), "Prefer": "return=representation,resolution=merge-duplicates"},
            method="POST",
        )
        r = urllib.request.urlopen(req, timeout=10)
        result = json.loads(r.read())
        return result[0]["id"] if result else ""
    except Exception:
        return ""


def run(ctx: dict | None = None) -> dict:
    """Process a form submission through the 4-stage Haiku pipeline.

    ctx keys:
        form_submission (dict, required): the raw form data
            {full_name, email, phone, company, challenge}
        dry_run (bool, default False)
    """
    ctx = ctx or {}
    form = ctx.get("form_submission") or {}
    if not form:
        return {"ok": False, "agent": "lead_capture", "error": "missing form_submission"}
    dry_run = bool(ctx.get("dry_run", False))
    started = time.time()

    # Stage 1: Extract
    user_msg = (
        "Lead form submission (JSON):\n\n"
        + json.dumps({
            "full_name": form.get("full_name", ""),
            "email": form.get("email", ""),
            "phone": form.get("phone", ""),
            "company": form.get("company", ""),
            "challenge": form.get("challenge", ""),
        }, indent=2)
    )
    extracted_raw = _call_haiku(SYSTEM_EXTRACT, user_msg, max_tokens=1024)
    try:
        profile = json.loads(extracted_raw)
    except Exception:
        profile = {"_parse_error": True, "_raw": extracted_raw[:500]}

    # Stage 2: Score (skip critique for v1; full 4-stage per lead-profile.json)
    score_user = (
        "=== LEAD PROFILE ===\n"
        + json.dumps({
            "contact": profile.get("contact", {}),
            "company": profile.get("company", {}),
            "pain": profile.get("pain", {}),
            "language": profile.get("language", "en"),
        }, indent=2)
    )
    score_raw = _call_haiku(SYSTEM_SCORE, score_user, max_tokens=768)
    try:
        qualification = json.loads(score_raw)
    except Exception:
        qualification = {"_parse_error": True, "overall_score": 0, "recommended_action": "qualify_further"}

    # Stage 3: Summary (only for qualified leads)
    summary = {"summary_bullets": []}
    if qualification.get("overall_score", 0) >= 5.5:
        sum_user = (
            "Write a 5-bullet summary of this lead.\n\n"
            + json.dumps({"profile": profile, "qualification": qualification}, indent=2)[:2000]
        )
        sum_raw = _call_haiku(SYSTEM_SUMMARY, sum_user, max_tokens=512)
        try:
            summary = json.loads(sum_raw)
        except Exception:
            pass

    # Stage 4: Persist
    lead_id = ""
    if not dry_run and not profile.get("_parse_error"):
        lead_id = _upsert_lead(profile, qualification, summary)

    # Stage 5 (removed 2026-08-16): a hot lead used to be handed to
    # headhunter_agent, which queued outreach off scraped signals. The lead is
    # already inbound and already stored — the opt-in nurture worker picks it up
    # from there. No hand-off to a prospecting agent.

    return {
        "ok": "ok" in str(profile).lower() or not profile.get("_parse_error"),
        "agent": "lead_capture",
        "lead_id": lead_id,
        "qualification": qualification,
        "summary_bullets": summary.get("summary_bullets", []),
        "duration_ms": int((time.time() - started) * 1000),
        "dry_run": dry_run,
    }


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        try:
            ctx = {"form_submission": json.loads(sys.argv[1])}
        except Exception:
            print("Usage: python lead_capture_agent.py '{\"full_name\":\"...\",\"email\":\"...\"}'")
            sys.exit(1)
    else:
        ctx = {
            "form_submission": {
                "full_name": "Jane Chen",
                "email": "jane@acme.fintech",
                "phone": "+1-555-0100",
                "company": "Acme Fintech",
                "challenge": "Need BOI filing and CFPB readiness assessment before Q2 board review.",
            }
        }
    print(json.dumps(run(ctx), indent=2))
