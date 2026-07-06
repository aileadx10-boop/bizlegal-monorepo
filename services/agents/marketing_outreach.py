"""
marketing_outreach.py — Daily cold outreach drafter.

Drafts 10 personalized cold emails per day for the enterprise_cfo_coo
ICP, using the headhunter signal feed as input. Drafts go to
lead_outreach with status=drafted; the cold_email_sender cron can
flip them to sent.

Schedule: 10:00 UTC daily
"""
from __future__ import annotations
import json, os, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path

try:
    import sys as _sys
    _sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
    import _env
except Exception:
    pass

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_SERVICE_KEY")
    or os.environ.get("SUPABASE_SECRET", "")
)
ANTHROPIC_KEY = (_env.get_anthropic_key() if '_env' in dir() else os.environ.get("ANTHROPIC_" + "API_KEY", ""))

EMAIL_SYSTEM = """You write cold emails for BizLegal AI. Target buyer: CFO/COO
at Series B+ fintech/crypto/SaaS. The offer: managed compliance ops
for $2,500/mo, 4-week onboarding, first 2 weeks free.

Output STRICT JSON: {"subject": "<=60 char>", "body": "<=120 words>"}
Voice: specific, no fluff, name-drop a real pain point (regulatory
delta, audit prep, FinCEN BOI rules, etc). No emojis. No exclamation
marks. End with one soft CTA. No pricing in the email — that's the
discovery call."""


def _q(path: str) -> list:
    if not SUPABASE_URL or not SUPABASE_KEY: return []
    try:
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"})
        return json.loads(urllib.request.urlopen(req, timeout=10).read())
    except Exception: return []


def _post(path: str, body: dict) -> bool:
    if not SUPABASE_URL or not SUPABASE_KEY: return False
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/{path}",
            data=json.dumps(body).encode(),
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json", "Prefer": "return=minimal"},
            method="POST",
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception: return False


def _gen_email(lead: dict) -> dict:
    if not ANTHROPIC_KEY: return {"subject": "", "body": ""}
    try:
        company = lead.get("company_name") or "your company"
        source = lead.get("source") or "?"
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=json.dumps({
                "model": "claude-haiku-4-5", "max_tokens": 600,
                "system": EMAIL_SYSTEM,
                "messages": [{"role": "user", "content": f"Company: {company}\nSignal source: {source}\nWrite the cold email."}],
            }).encode(),
            headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
            method="POST",
        )
        r = urllib.request.urlopen(req, timeout=30)
        d = json.loads(r.read())
        text = d["content"][0]["text"]
        import re
        m = re.search(r"\{[\s\S]*\}", text)
        return json.loads(m.group(0)) if m else {"subject": "Quick thought", "body": text[:600]}
    except Exception as e:
        return {"subject": f"err: {e}", "body": ""}


def run(ctx=None) -> dict:
    started = time.time()
    # Get latest 10 high-score leads not yet drafted
    leads = _q(f"leadforge_leads?select=id,company_name,email,score,source&score=gte.60&order=created_at.desc&limit=10")
    drafted = 0
    for lead in leads:
        if not isinstance(lead, dict): continue
        # Check if already drafted in last 7 days
        existing = _q(f"lead_outreach?select=id&lead_email=eq.{urllib.parse.quote(lead.get('email',''))}&created_at=gte.{(datetime.now(timezone.utc) - __import__('datetime').timedelta(days=7)).strftime('%Y-%m-%dT%H:%M:%SZ')}&limit=1")
        if existing: continue
        email = _gen_email(lead)
        if not email.get("subject"): continue
        ok = _post("lead_outreach", {
            "lead_email": lead.get("email", ""),
            "lead_name": lead.get("company_name", ""),
            "company": lead.get("company_name", ""),
            "subject": email["subject"],
            "body_preview": email["body"],
            "pitch_variant": "marketing_outreach_daily",
            "status": "drafted",
            "agent_run_id": f"marketing_outreach-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{lead['id']}",
            "score": lead.get("score", 0),
        })
        if ok: drafted += 1
    return {
        "ok": True,
        "agent": "marketing_outreach",
        "drafted": drafted,
        "from_leads": len(leads),
        "duration_ms": int((time.time() - started) * 1000),
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
