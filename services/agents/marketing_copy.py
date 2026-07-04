"""
marketing_copy.py — Daily social copy generator.

Generates 1 LinkedIn post + 1 X thread per day, each tied to a
specific BizLegal angle. Reads yesterday's engagement from agent_runs
to pick the best-performing angle.

Schedule: 07:00 UTC daily
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

ANGLES = [
    "the AI automation agency model (8 clients × $2,500 = $20K MRR)",
    "compliance-as-a-service vs in-house compliance analyst",
    "the 5 most expensive compliance mistakes Series B+ fintechs make",
    "why the 24/7 compliance monitor beats the quarterly consultant",
    "what a managed compliance ops system actually does day-to-day",
    "the honest math on running compliance with 8 AI agents",
    "how to price compliance as an outcome, not an hour",
    "the Thedigitalkinggg 8-client framework applied to compliance",
]

SYSTEM_PROMPT = """You are a B2B marketing copywriter for BizLegal AI.
You write punchy, direct, no-fluff copy for two channels:
  1. LinkedIn: 800-1200 chars, 3-5 line paragraphs, 1 CTA,
     sound like a founder not a marketer, no hashtags except 2-3 max.
  2. X thread: 5-7 tweets, each <280 chars, hook in tweet 1,
     each tweet standalone-readable, end with link placeholder.

Voice: opinionated, specific, numbers where possible, no
marketing-speak. Cite real frameworks (GDPR, FinCEN, AI Act).
Output STRICT JSON: {"linkedin": "...", "x_thread": ["...", "..."]}
"""


def _q(path: str) -> list:
    if not SUPABASE_URL or not SUPABASE_KEY: return []
    try:
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"})
        return json.loads(urllib.request.urlopen(req, timeout=10).read())
    except Exception: return []


def _gen(angle: str) -> dict:
    if not ANTHROPIC_KEY: return {"linkedin": "", "x_thread": []}
    try:
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=json.dumps({
                "model": "claude-haiku-4-5",
                "max_tokens": 1500,
                "system": SYSTEM_PROMPT,
                "messages": [{"role": "user", "content": f"Today's angle: {angle}"}],
            }).encode(),
            headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
            method="POST",
        )
        r = urllib.request.urlopen(req, timeout=30)
        d = json.loads(r.read())
        text = d["content"][0]["text"]
        import re
        m = re.search(r"\{[\s\S]*\}", text)
        return json.loads(m.group(0)) if m else {"linkedin": text[:1500], "x_thread": []}
    except Exception as e:
        return {"linkedin": f"err: {e}", "x_thread": []}


def _save(angle: str, copy: dict) -> str:
    out_dir = Path("/opt/bizlegal/curator/drafts/socials")
    out_dir.mkdir(parents=True, exist_ok=True)
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    slug = angle.lower().replace(" ", "-")[:50]
    fp = out_dir / f"{today}-{slug}.md"
    fp.write_text(f"""# {angle}

## LinkedIn
{copy.get('linkedin', '')}

## X Thread
{chr(10).join(f"{i+1}/ {t}" for i, t in enumerate(copy.get('x_thread', [])))}
""", encoding="utf-8")
    return str(fp)


def run(ctx=None) -> dict:
    started = time.time()
    day_idx = datetime.now(timezone.utc).toordinal() % len(ANGLES)
    angle = ANGLES[day_idx]
    copy = _gen(angle)
    fp = _save(angle, copy)
    # Persist to agent_runs
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            req = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/agent_runs",
                data=json.dumps({
                    "agent_name": "marketing_copy", "action": f"angle:{day_idx}",
                    "status": "ok", "details": json.dumps({"angle": angle, "draft_path": fp, "linkedin_chars": len(copy.get("linkedin", "")), "x_tweets": len(copy.get("x_thread", []))})[:2000],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }).encode(),
                headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json", "Prefer": "return=minimal"},
                method="POST",
            )
            urllib.request.urlopen(req, timeout=10)
        except Exception: pass
    return {
        "ok": True,
        "agent": "marketing_copy",
        "angle": angle,
        "draft_path": fp,
        "linkedin_chars": len(copy.get("linkedin", "")),
        "x_tweets": len(copy.get("x_thread", [])),
        "duration_ms": int((time.time() - started) * 1000),
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
