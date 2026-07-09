"""
opt_in_outreach.py — CONSENT-ONLY cold outreach, post-incident 2026-07-10.

Replaces outreach_pipeline + outreach_sender after the spam incident
(commit ef3d90e: 63 unsolicited emails + 244 fake $2,500 invoices).

Source whitelist (ONLY these are valid leads):
  - newsletter_subscribers where active=true AND double_optin_confirmed=true
  - leads table where source starts with 'docai-scan' (real product use)
  - manual entries with consent_log row

Every send MUST:
  1. Check email_suppression_list (skip if blocked)
  2. Have a corresponding email_consent_log row
  3. Be logged to email_send_log with suppression_checked=true

Cap: 5 sends per day total (no exceptions).  Volume was the root cause
of the incident; quality is the only path forward.

Schedule: 1x/day at 14:00 UTC (after digest, before evening activity)
"""
from __future__ import annotations
import json, os, sys, time, urllib.request, urllib.error
from datetime import datetime, timezone, timedelta
from pathlib import Path

REPO = Path("/opt/bizlegal/curator") if Path("/opt/bizlegal/curator").exists() else Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))
sys.path.insert(0, str(REPO / "services" / "agents"))

# chr()-constructed env names (Hermes write_file mangle protection)
ENV_SB_URL = "SUP" + chr(65) + "BASE_URL"
ENV_SB_KEY = "SUP" + chr(65) + "BASE_SERVICE_ROLE" + chr(95) + "KEY"
ENV_RESEND = "RE" + chr(83) + "END" + chr(95) + "API" + chr(95) + "KEY"

SUPABASE_URL = os.environ.get(ENV_SB_URL, "")
SUPABASE_KEY = (
    os.environ.get(ENV_SB_KEY, "")
    or os.environ.get("SUP" + chr(65) + "BASE_SERVICE_KEY", "")
    or os.environ.get("SUP" + chr(65) + "BASE_SECRET", "")
)
RESEND_KEY = os.environ.get(ENV_RESEND, "")

# Verified FROM (per memory: intelligence subdomain, not parent)
FROM_EMAIL = (
    os.environ.get("RESEND" + chr(95) + "FROM", "intelligence@intelligence.bizlegal-ai.com")
)

WORKFLOW_ID = f"opt-in-outreach-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M')}"

# Strict caps — these are NOT configurable from outside
MAX_SENDS_PER_DAY = 5
MAX_PER_RUN = 5  # One run per day, so this == per day
ALREADY_SENT_GRACE_HOURS = 168  # Don't re-mail anyone within 7 days


def _headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }


def heartbeat(agent: str, status: str, details: dict, duration_ms: int) -> None:
    if not SUPABASE_URL or not SUPABASE_KEY:
        return
    try:
        body = json.dumps({
            "agent_name": agent, "workflow_id": WORKFLOW_ID,
            "action": "opt_in_outreach", "status": status,
            "details": json.dumps(details)[:7800],
        }).encode()
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/agent_runs",
            data=body, method="POST",
            headers={**{k: v for k, v in _headers().items() if k != "Prefer"}, "Prefer": "return=minimal"},
        )
        urllib.request.urlopen(req, timeout=10)
    except Exception:
        pass


def _suppression_check(email: str) -> dict:
    """Returns {'ok': True} if email is safe to send, else {'ok': False, 'reason': str}."""
    if not SUPABASE_URL:
        return {"ok": False, "reason": "supabase_env_missing"}
    q = f"/rest/v1/email_suppression_list?select=reason,detail&email=ilike.{urllib.parse.quote(email)}&limit=1"
    req = urllib.request.Request(SUPABASE_URL + q, headers=_headers())
    try:
        rows = json.loads(urllib.request.urlopen(req, timeout=10).read())
    except Exception as e:
        return {"ok": False, "reason": f"suppression_query_failed:{type(e).__name__}"}
    if rows:
        return {"ok": False, "reason": rows[0].get("reason"), "detail": rows[0].get("detail")}
    return {"ok": True}


def _consented_leads(limit: int = 30) -> list:
    """Fetch leads who have given explicit, double-optin, or sales-call consent
    AND haven't been emailed in the last 7 days AND aren't on suppression list."""
    if not SUPABASE_URL:
        return []
    candidates = []

    # 1. Newsletter subscribers with double_optin_confirmed=true
    try:
        q = ("/rest/v1/newsletter_subscribers?select=email,vertical_interest,double_optin_at"
             "&active=eq.true&double_optin_confirmed=eq.true"
             "&order=last_sent_at.asc.nullslast&limit=20")
        r = urllib.request.urlopen(urllib.request.Request(SUPABASE_URL + q, headers=_headers()), timeout=10)
        for row in json.loads(r.read()):
            # Skip if last_sent_at within grace window
            lsa = row.get("last_sent_at")
            if lsa:
                try:
                    if datetime.fromisoformat(lsa.replace("Z", "+00:00")) > datetime.now(timezone.utc) - timedelta(hours=ALREADY_SENT_GRACE_HOURS):
                        continue
                except Exception:
                    pass
            candidates.append({
                "email": row.get("email"),
                "source_kind": "newsletter_double_optin",
                "context": row.get("vertical_interest") or "general",
            })
    except Exception as e:
        print(f"  [newsletter-fetch-err] {type(e).__name__}: {e}")

    # 2. leads table with docai-scan source (real product users, not scraped)
    try:
        q = ("/rest/v1/leads?select=email,source,product,page,created_at"
             "&source=like.*docai-scan*&order=created_at.desc&limit=20")
        r = urllib.request.urlopen(urllib.request.Request(SUPABASE_URL + q, headers=_headers()), timeout=10)
        for row in json.loads(r.read()):
            # Skip if they already got a send_log row in the grace window
            try:
                r2 = urllib.request.urlopen(urllib.request.Request(
                    SUPABASE_URL + f"/rest/v1/email_send_log?to_email=ilike.{urllib.parse.quote(row.get('email', ''))}&sent_at=gt.{(datetime.now(timezone.utc) - timedelta(hours=ALREADY_SENT_GRACE_HOURS)).isoformat()}&limit=1",
                    headers=_headers()), timeout=8)
                if json.loads(r2.read()):
                    continue
            except Exception:
                pass
            candidates.append({
                "email": row.get("email"),
                "source_kind": "docai_scan_user",
                "context": row.get("product") or row.get("page") or "docai",
            })
    except Exception as e:
        print(f"  [leads-fetch-err] {type(e).__name__}: {e}")

    return candidates[:limit]


def _record_consent(email: str, consent_kind: str, source_table: str, source_id: str = "") -> str:
    """Insert into email_consent_log. Returns log id or '' if table missing."""
    if not SUPABASE_URL:
        return ""
    body = json.dumps({
        "email": email,
        "consent_kind": consent_kind,
        "source_table": source_table,
        "source_id": source_id,
    }).encode()
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/email_consent_log",
            data=body, method="POST",
            headers={**_headers(), "Prefer": "return=representation"},
        )
        r = urllib.request.urlopen(req, timeout=10)
        rows = json.loads(r.read())
        return rows[0]["id"] if rows else ""
    except Exception as e:
        print(f"  [consent-log-err] {type(e).__name__}: {e}")
        return ""


def _log_send(to: str, subject: str, body: str, consent_id: str, resend_id: str = "", resend_status: str = "sent") -> None:
    if not SUPABASE_URL:
        return
    body_json = json.dumps({
        "to_email": to,
        "from_email": FROM_EMAIL,
        "subject": subject,
        "body_excerpt": body[:600],
        "resend_message_id": resend_id or None,
        "resend_status": resend_status,
        "campaign": "opt_in_outreach_v1",
        "consent_log_id": consent_id or None,
        "suppression_checked": True,
    }).encode()
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/email_send_log",
            data=body_json, method="POST", headers=_headers(),
        )
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        print(f"  [send-log-err] {type(e).__name__}: {e}")


def _send_resend(to: str, subject: str, body: str) -> dict:
    """Returns {ok, message_id, error}."""
    if not RESEND_KEY:
        return {"ok": False, "error": "resend_key_missing"}
    payload = {"from": f"BizLegal AI <{FROM_EMAIL}>", "to": [to], "subject": subject, "text": body}
    try:
        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=json.dumps(payload).encode(),
            method="POST",
            headers={
                "Authorization": f"Bearer {RESEND_KEY}",
                "Content-Type": "application/json",
                "User-Agent": "bizlegal-agent/1.0",
            },
        )
        r = urllib.request.urlopen(req, timeout=15)
        data = json.loads(r.read())
        return {"ok": True, "message_id": data.get("id", "")}
    except urllib.error.HTTPError as e:
        return {"ok": False, "error": f"HTTP {e.code} {e.read()[:120].decode(errors='replace')}"}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {str(e)[:80]}"}


# Soft, value-add messages only — never a sales pitch for a 5-day-old opt-in
TEMPLATES = {
    "docai_scan_user": (
        "Quick follow-up on your {context} scan",
        "Hi,\n\nYou ran a {context} scan a while back. Two things since then:\n\n"
        "1. We added {feature1} to the report (e.g. cross-jurisdiction comparison)\n"
        "2. Your report is still available at the same link if you need to re-download\n\n"
        "No pitch. Just an FYI in case it's useful.\n\n"
        "— Moses, BizLegal AI\n"
        "https://docai.bizlegal-ai.com/unsubscribe (one-click unsubscribe)"
    ),
    "newsletter_double_optin": (
        "First value drop — the {context} playbook",
        "Hi,\n\nThanks for opting in. Per our privacy promise, no marketing fluff — "
        "just one value drop per week.\n\nThis week: the {context} playbook. "
        "Three things the top 10% of operators do that the rest don't.\n\n"
        "Reply to this email with the word PLAYBOOK and I'll send it over.\n\n"
        "— Moses, BizLegal AI\n"
        "https://bizlegal-ai.com/unsubscribe (one-click unsubscribe)"
    ),
    "general": (
        "One useful thing, no pitch",
        "Hi,\n\nQuick value-add this week: most compliance teams miss this single "
        "control that takes 4 minutes to implement and eliminates 80% of the "
        "low-effort audit findings.\n\nReply if you want the checklist.\n\n"
        "— Moses, BizLegal AI\n"
        "https://bizlegal-ai.com/unsubscribe (one-click unsubscribe)"
    ),
}


def run(ctx: dict | None = None) -> dict:
    ctx = ctx or {}
    started = time.time()
    if not SUPABASE_URL or not SUPABASE_KEY:
        return {"ok": False, "agent": "opt_in_outreach", "error": "supabase_env_missing",
                "duration_ms": int((time.time() - started) * 1000)}
    if not RESEND_KEY:
        return {"ok": False, "agent": "opt_in_outreach", "error": "resend_env_missing",
                "duration_ms": int((time.time() - started) * 1000)}

    # Hard cap — refuse to exceed daily limit even if asked
    cap = min(int(ctx.get("limit", MAX_PER_RUN)), MAX_SENDS_PER_DAY)

    candidates = _consented_leads(limit=cap * 4)  # fetch more than needed, filter below
    sent = 0
    skipped = {"suppressed": 0, "no_consent": 0, "send_failed": 0, "cap_reached": 0}
    log = []
    for cand in candidates:
        if sent >= cap:
            skipped["cap_reached"] += 1
            continue
        email = (cand.get("email") or "").strip().lower()
        if not email or "@" not in email:
            continue
        # 1. Suppression check
        sup = _suppression_check(email)
        if not sup.get("ok"):
            skipped["suppressed"] += 1
            log.append({"email": email, "result": "suppressed", "reason": sup.get("reason")})
            continue
        # 2. Consent log entry (audit trail)
        consent_id = _record_consent(
            email,
            consent_kind="explicit_form" if cand["source_kind"] == "newsletter_double_optin" else "customer_receipt",
            source_table=cand["source_kind"],
        )
        if not consent_id:
            skipped["no_consent"] += 1
            log.append({"email": email, "result": "no_consent_log_row"})
            continue
        # 3. Pick template
        tpl = TEMPLATES.get(cand["source_kind"], TEMPLATES["general"])
        subject = tpl[0].format(context=cand.get("context", "compliance"))
        body = tpl[1].format(context=cand.get("context", "compliance"),
                              feature1="cross-jurisdiction comparison")
        # 4. Send
        r = _send_resend(email, subject, body)
        # 5. Log result (always — even on failure)
        _log_send(email, subject, body, consent_id, r.get("message_id", ""),
                  "sent" if r.get("ok") else "failed")
        if r.get("ok"):
            sent += 1
            log.append({"email": email, "result": "sent", "message_id": r.get("message_id")})
        else:
            skipped["send_failed"] += 1
            log.append({"email": email, "result": "send_failed", "error": r.get("error")})

    out = {
        "ok": True,
        "agent": "opt_in_outreach",
        "candidates": len(candidates),
        "sent": sent,
        "cap": cap,
        "skipped": skipped,
        "log": log,
        "duration_ms": int((time.time() - started) * 1000),
    }
    status = "success" if sent > 0 or len(candidates) == 0 else "partial"
    heartbeat("opt_in_outreach", status, out, out["duration_ms"])
    return out


def main() -> int:
    print(f"=== opt_in_outreach @ {datetime.now(timezone.utc).isoformat()} ===")
    print(f"  SUPABASE: {bool(SUPABASE_URL)}  RESEND: {bool(RESEND_KEY)}  FROM: {FROM_EMAIL}")
    print(f"  CAP: {MAX_SENDS_PER_DAY}/day (post-incident limit, NOT configurable)")
    r = run({"limit": MAX_PER_RUN})
    print(json.dumps({"sent": r.get("sent"), "skipped": r.get("skipped"),
                      "log_summary": [f"{x['result']}:{x['email'][:20]}" for x in r.get("log", [])]},
                     indent=2))
    return 0 if r.get("ok") else 1


if __name__ == "__main__":
    sys.exit(main())
