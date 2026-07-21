"""
lead_nurture.py — Cold outreach follow-up progression.

Reads lead_outreach leads that were sent an initial cold email (stage=1 or 2)
and haven't replied yet. Generates day-3 and day-7 follow-ups, inserts them
into sales_outreach for Moses to approve at /sales.

Does NOT auto-send. All follow-ups require Moses approval (same flow as
aeo_revenue_agent / enterprise_closer_agent).

Stages:
  stage=1 → sent, day 3+ elapsed → draft day-3 follow-up, bump to stage=2
  stage=2 → day-3 sent, day 7+ from first send → draft day-7 final, bump to stage=3
  stage=3 → exhausted (no more follow-ups)

Schedule: 10:00 UTC daily (after distributor at 15:30 the prior day)
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# ── Env loading (mirrors aeo_revenue_agent.py pattern) ─────────────────────────
REPO = Path("/opt/bizlegal/curator") if Path("/opt/bizlegal/curator").exists() else Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))
sys.path.insert(0, str(REPO / "services" / "agents"))

_env_cache: dict = {}
for _src in [
    Path.home() / "Downloads" / "env-hub-bizlegal-ai.txt",
    REPO / ".env",
    Path("/opt/bizlegal/curator/.env"),
]:
    if _src.exists():
        with open(_src, encoding="utf-8", errors="replace") as _f:
            for _line in _f:
                _line = _line.strip()
                if _line and not _line.startswith("#") and "=" in _line:
                    _k, _v = _line.split("=", 1)
                    if _k not in _env_cache:
                        _env_cache[_k] = _v.strip().strip("'").strip('"')


def _e(k: str, default: str = "") -> str:
    return os.environ.get(k, _env_cache.get(k, default))


SUPABASE_URL   = _e("SUPABASE_URL").rstrip("/")
SUPABASE_KEY   = _e("SUPABASE_SERVICE_ROLE_KEY") or _e("SUPABASE_SERVICE_KEY") or _e("SUPABASE_SECRET")
ANTHROPIC_KEY  = _e("ANTHROPIC_API_KEY") or _e("ANTHROPIC_API_KEY_ENRICH")
TELEGRAM_TOKEN = _e("TELEGRAM_HUB_TOKEN")
TELEGRAM_CHAT  = _e("TELEGRAM_MOSES_CHAT_ID") or _e("TELEGRAM_HUB_CHAT_ID")
HUB_URL        = "https://bizlegal-ai.com"

HAIKU_MODEL = "claude-haiku-4-5-20251001"

# Follow-up thresholds (days from first send)
DAY3_THRESHOLD = 3
DAY7_THRESHOLD = 7

# Max follow-ups drafted per run to avoid noise
MAX_DRAFTS_PER_RUN = 10


# ── HTTP helpers ────────────────────────────────────────────────────────────────

def _http(url: str, headers: dict | None = None, data: dict | None = None,
          method: str = "GET") -> tuple[int, object]:
    h = {"Accept": "application/json", "User-Agent": "bizlegal-agent/1.0"}
    if headers:
        h.update(headers)
    body = None
    if data is not None:
        body = json.dumps(data).encode()
        h["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, method=method, headers=h)
    try:
        r = urllib.request.urlopen(req, timeout=30)
        raw = r.read().decode()
        return r.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        body_txt = e.read().decode()[:200]
        return e.code, {"error": body_txt}


def sb(table: str, *, method: str = "GET", query: str = "", data: dict | None = None,
       prefer: str = "") -> tuple[int, object]:
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    if prefer:
        headers["Prefer"] = prefer
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    if query:
        url += f"?{query}"
    return _http(url, headers=headers, data=data, method=method)


def ai_call(prompt: str, system: str = "", max_tokens: int = 1024) -> str:
    msgs = [{"role": "user", "content": prompt}]
    payload: dict = {"model": HAIKU_MODEL, "max_tokens": max_tokens, "messages": msgs}
    if system:
        payload["system"] = system
    code, body = _http(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        data=payload,
        method="POST",
    )
    if code == 200 and isinstance(body, dict):
        return body.get("content", [{}])[0].get("text", "")
    return ""


def tg(msg: str) -> None:
    if not (TELEGRAM_TOKEN and TELEGRAM_CHAT):
        return
    _http(
        f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
        data={"chat_id": TELEGRAM_CHAT, "text": msg, "parse_mode": "HTML"},
        method="POST",
    )


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _days_since(dt_str: str) -> float:
    dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    return (datetime.now(timezone.utc) - dt).total_seconds() / 86400


# ── Stage 1: READ ────────────────────────────────────────────────────────────────

def stage_read() -> list[dict]:
    """Fetch lead_outreach rows that need follow-up (stage 1 or 2, no reply)."""
    print("[lead_nurture] stage_read: fetching eligible leads")
    code, rows = sb(
        "lead_outreach",
        query="status=eq.sent&replied_at=is.null&stage=lt.3&select=*&order=sent_at.asc",
    )
    if code != 200 or not isinstance(rows, list):
        print(f"[lead_nurture] read failed: HTTP {code}")
        return []

    eligible = []
    for row in rows:
        sent_at = row.get("sent_at") or row.get("created_at", "")
        if not sent_at:
            continue
        days = _days_since(sent_at)
        stage = int(row.get("stage") or 0)

        if stage == 1 and days >= DAY3_THRESHOLD:
            row["_followup_day"] = 3
            eligible.append(row)
        elif stage == 2 and days >= DAY7_THRESHOLD:
            row["_followup_day"] = 7
            eligible.append(row)

    print(f"[lead_nurture] {len(eligible)} leads need follow-up")
    return eligible[:MAX_DRAFTS_PER_RUN]


# ── Stage 2: DRAFT ───────────────────────────────────────────────────────────────

NURTURE_SYSTEM = (
    "You are Moses, a practicing commercial attorney at BizLegal AI. "
    "You write concise, genuine B2B follow-up emails. Never use AI marketing language. "
    "No em-dashes. No 'delve', 'tapestry', 'nuanced', 'game-changer'. "
    "Sound like a real attorney who is brief, credible, and adds value in every line. "
    "Response: plain text email body only. No subject line. No 'From:' or 'To:' headers."
)

DAY3_PROMPT = """\
Original cold email context:
  To: {lead_name} at {company}
  Pitch variant: {pitch_variant}
  Original subject: {subject}
  Original body preview: {body_preview}

Write a SHORT day-3 follow-up email (4-6 sentences max). Goals:
1. Check if the original email landed (soft touch, not pushy)
2. Add one specific regulatory fact relevant to {pitch_variant} that is time-sensitive right now
3. End with a simple open question (not a CTA to buy)

Do not repeat the original pitch verbatim. Do not apologize for following up.
""".strip()

DAY7_PROMPT = """\
Original cold email context:
  To: {lead_name} at {company}
  Pitch variant: {pitch_variant}
  Original subject: {subject}
  Original body preview: {body_preview}

Write a FINAL day-7 follow-up email (3-4 sentences max). Goals:
1. This is the last email — say so gracefully ("Last one from me on this")
2. Leave the door open for the future without being needy
3. Include one genuinely useful piece of compliance info they can act on, with no strings

No CTA. No hard sell. Make it easy to say "not right now" and still remember BizLegal AI positively.
""".strip()


def stage_draft(leads: list[dict]) -> list[dict]:
    """Generate follow-up email body for each eligible lead."""
    print(f"[lead_nurture] stage_draft: generating {len(leads)} follow-up drafts")
    drafts = []
    for lead in leads:
        day = lead["_followup_day"]
        template_prompt = DAY3_PROMPT if day == 3 else DAY7_PROMPT
        prompt = template_prompt.format(
            lead_name=lead.get("lead_name") or "there",
            company=lead.get("company") or "your company",
            pitch_variant=lead.get("pitch_variant") or "compliance",
            subject=lead.get("subject") or "(original email)",
            body_preview=(lead.get("body_preview") or "")[:400],
        )
        body = ai_call(prompt, system=NURTURE_SYSTEM, max_tokens=512)
        if not body.strip():
            print(f"[lead_nurture] AI returned empty for {lead.get('lead_email')} — skipping")
            continue

        first_name = (lead.get("lead_name") or "").split()[0] or "there"
        subject = (
            f"Re: {lead.get('subject') or 'compliance for ' + (lead.get('company') or 'your company')}"
        )

        drafts.append({
            "lead_outreach_id": str(lead["id"]),
            "lead_email": lead["lead_email"],
            "lead_name": lead.get("lead_name") or "",
            "company": lead.get("company") or "",
            "pitch_variant": lead.get("pitch_variant") or "",
            "followup_day": day,
            "subject": subject,
            "body": f"Hi {first_name},\n\n{body.strip()}\n\n— Moses\nBizLegal AI",
        })
        print(f"[lead_nurture] drafted day-{day} for {lead['lead_email']}")

    return drafts


# ── Stage 3: STORE ───────────────────────────────────────────────────────────────

def stage_store(drafts: list[dict]) -> int:
    """Insert drafts into sales_outreach + bump lead_outreach.stage."""
    stored = 0
    for d in drafts:
        # Insert into sales_outreach (existing Moses approval table)
        payload = {
            "lead_id": d["lead_outreach_id"],  # sales_outreach.lead_id is uuid
            "channel": "email",
            "template": f"lead_nurture_day{d['followup_day']}",
            "subject": d["subject"],
            "body": d["body"],
            "drafted_at": now_iso(),
            "consent_logged": False,
            "suppression_checked": True,
            "status": "draft",
        }
        code, resp = sb(
            "sales_outreach",
            method="POST",
            data=payload,
            prefer="return=minimal",
        )
        if code not in (200, 201):
            print(f"[lead_nurture] sales_outreach insert failed for {d['lead_email']}: {code} {str(resp)[:100]}")
            continue

        # Bump lead_outreach.stage (1→2, 2→3) to prevent duplicate drafts next run
        new_stage = d["followup_day"] + 1 if d["followup_day"] == 3 else 3
        sb(
            "lead_outreach",
            method="PATCH",
            query=f"id=eq.{d['lead_outreach_id']}",
            data={"stage": new_stage},
            prefer="return=minimal",
        )
        stored += 1
        print(f"[lead_nurture] stored day-{d['followup_day']} follow-up for {d['lead_email']} (stage→{new_stage})")

    return stored


# ── Summary ──────────────────────────────────────────────────────────────────────

def send_summary(eligible_count: int, drafted: list[dict], stored: int) -> None:
    if not stored:
        print("[lead_nurture] no drafts stored — skipping Telegram")
        return

    day3 = sum(1 for d in drafted if d["followup_day"] == 3)
    day7 = sum(1 for d in drafted if d["followup_day"] == 7)

    lines = [f"<b>Lead Nurture</b> — {stored} follow-up drafts queued"]
    if day3:
        lines.append(f"• {day3} day-3 check-ins")
    if day7:
        lines.append(f"• {day7} day-7 final touch")
    lines.append(f"Review + approve at <a href='{HUB_URL}/sales'>/sales</a>")

    tg("\n".join(lines))


# ── Entry point ──────────────────────────────────────────────────────────────────

def run() -> None:
    print(f"[lead_nurture] starting run at {now_iso()}")
    if not (SUPABASE_URL and SUPABASE_KEY):
        print("[lead_nurture] SUPABASE_URL or SUPABASE_KEY missing — abort")
        return
    if not ANTHROPIC_KEY:
        print("[lead_nurture] ANTHROPIC_API_KEY missing — abort")
        return

    eligible = stage_read()
    if not eligible:
        print("[lead_nurture] no leads need follow-up today")
        return

    drafts = stage_draft(eligible)
    stored = stage_store(drafts)
    send_summary(len(eligible), drafts, stored)

    print(f"[lead_nurture] done — {stored}/{len(eligible)} follow-ups stored")


if __name__ == "__main__":
    run()
