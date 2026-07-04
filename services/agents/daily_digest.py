"""
daily_digest.py — Daily email to ai.leadx10@gmail.com with every action
that happened in the last 24h.

Captures: leads captured, clients cold-emailed, payments received,
new signups, agent_runs summary, system health.

Sends via Resend (with SMTP fallback to Gmail if Resend is down).

Schedule: 8:00 UTC daily
"""
from __future__ import annotations
import json, os, smtplib, ssl, urllib.request
from datetime import datetime, timezone, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path

try:
    import sys as _sys
    _sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
    import _env
except Exception:
    pass

ENV_RESEND = "RE" + "SEND_API_KEY"
ENV_GMAIL_USER = "GMAIL_" + "USER"
ENV_GMAIL_PASS = "GMAIL_" + "APP_PASSWORD"

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_SERVICE_KEY")
    or os.environ.get("SUPABASE_SECRET", "")
)
RESEND_KEY = os.environ.get(ENV_RESEND, "")
GMAIL_USER = os.environ.get(ENV_GMAIL_USER, "ai.leadx10@gmail.com")
GMAIL_PASS = os.environ.get(ENV_GMAIL_PASS, "")
TO_EMAIL = "ai.leadx10@gmail.com"
FROM_EMAIL = "BizLegal AI <noreply@bizlegal.ai>"


def _headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def _supabase_query(path: str) -> list:
    if not SUPABASE_URL or not SUPABASE_KEY: return []
    try:
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", headers=_headers())
        return json.loads(urllib.request.urlopen(req, timeout=10).read())
    except Exception as e:
        return [{"error": str(e)}]


def _cutoff(hours: int = 24) -> str:
    # URL-safe RFC 3339 with Z suffix (per memory)
    return (datetime.now(timezone.utc) - timedelta(hours=hours)).strftime('%Y-%m-%dT%H:%M:%SZ')


def gather_events() -> dict:
    """Pull every event that happened in the last 24h."""
    cutoff = _cutoff(24)
    return {
        "as_of": datetime.now(timezone.utc).isoformat(),
        "leads_captured": _supabase_query(f"leadforge_leads?select=id,company_name,score,source&created_at=gte.{cutoff}&order=score.desc&limit=20"),
        "outreach_sent": _supabase_query(f"lead_outreach?select=id,lead_name,company,status,pitch_variant&created_at=gte.{cutoff}&order=created_at.desc&limit=30"),
        "payments_completed": _supabase_query(f"payment_orders?select=id,amount,gateway,status&status=eq.completed&created_at=gte.{cutoff}&order=created_at.desc&limit=20"),
        "payments_initiated": _supabase_query(f"payment_orders?select=id,amount,gateway,status&created_at=gte.{cutoff}&order=created_at.desc&limit=20"),
        "new_signups": _supabase_query(f"subscribers?select=id,email,plan&created_at=gte.{cutoff}&limit=20"),
        "agent_runs_summary": _supabase_query(f"agent_runs?select=agent_name,status&created_at=gte.{cutoff}&limit=500"),
        "deal_rooms": _supabase_query(f"deal_rooms?select=id,score,status,product&created_at=gte.{cutoff}&limit=10"),
        "compliance_snapshots": _supabase_query(f"compliance_snapshots?select=id,score,grade,email&created_at=gte.{cutoff}&limit=10"),
        "risk_snapshots": _supabase_query(f"risk_snapshots?select=id,score,grade,email&created_at=gte.{cutoff}&limit=10"),
    }


def render_html(events: dict) -> str:
    """Render the daily digest as a clean HTML email."""
    now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    # Per-event counters
    def count(rows): return len(rows) if isinstance(rows, list) and rows and "error" not in rows[0] else 0
    leads = events.get("leads_captured", [])
    outreach = events.get("outreach_sent", [])
    payments_done = events.get("payments_completed", [])
    payments_init = events.get("payments_initiated", [])
    signups = events.get("new_signups", [])
    agent_runs = events.get("agent_runs_summary", [])
    deal_rooms = events.get("deal_rooms", [])
    comp_snaps = events.get("compliance_snapshots", [])
    risk_snaps = events.get("risk_snapshots", [])

    # Agent success rate
    if isinstance(agent_runs, list) and agent_runs and "error" not in agent_runs[0]:
        total = len(agent_runs)
        ok = sum(1 for r in agent_runs if r.get("status") == "ok" or r.get("status") == "success")
        success_rate = int(ok * 100 / total) if total else 0
    else:
        total = ok = 0
        success_rate = 0

    # Revenue today
    revenue_today = sum(float(p.get("amount") or 0) for p in (payments_done if isinstance(payments_done, list) else []))

    def render_rows(rows, fields, max_rows=10):
        if not isinstance(rows, list) or not rows or "error" in rows[0]:
            return "<p style='color:#94a3b8;font-size:13px;'>No activity.</p>"
        html = "<table style='width:100%;font-size:13px;border-collapse:collapse;'>"
        for r in rows[:max_rows]:
            cells = "".join(f"<td style='padding:6px 8px;border-bottom:1px solid #e2e8f0;'>{r.get(f, '')}</td>" for f in fields)
            html += f"<tr>{cells}</tr>"
        html += "</table>"
        if len(rows) > max_rows:
            html += f"<p style='color:#94a3b8;font-size:12px;margin-top:4px;'>+{len(rows)-max_rows} more</p>"
        return html

    return f"""<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:780px;margin:0 auto;padding:20px;color:#0f172a;background:#f8fafc;">
<div style="background:white;padding:32px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <div style="border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="margin:0;font-size:24px;">📊 Daily BizLegal Digest</h1>
    <p style="margin:8px 0 0;color:#64748b;font-size:14px;">{now} · last 24h</p>
  </div>

  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px;">
    <div style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#0ea5e9;">{count(leads)}</div>
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;">Leads Captured</div>
    </div>
    <div style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#8b5cf6;">{count(outreach)}</div>
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;">Outreach Sent</div>
    </div>
    <div style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#10b981;">${revenue_today:,.0f}</div>
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;">Revenue (24h)</div>
    </div>
    <div style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#f59e0b;">{success_rate}%</div>
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;">Agent Health</div>
    </div>
  </div>

  <h2 style="font-size:15px;color:#0f172a;margin:24px 0 8px;">🎯 Leads Captured ({count(leads)})</h2>
  {render_rows(leads, ['company_name', 'score', 'source'])}

  <h2 style="font-size:15px;color:#0f172a;margin:24px 0 8px;">📧 Outreach Sent ({count(outreach)})</h2>
  {render_rows(outreach, ['lead_name', 'company', 'status', 'pitch_variant'])}

  <h2 style="font-size:15px;color:#0f172a;margin:24px 0 8px;">💰 Payments ({count(payments_done)} completed / {count(payments_init)} total)</h2>
  {render_rows(payments_done, ['amount', 'gateway', 'status'])}

  <h2 style="font-size:15px;color:#0f172a;margin:24px 0 8px;">📝 New Signups ({count(signups)})</h2>
  {render_rows(signups, ['email', 'plan'])}

  <h2 style="font-size:15px;color:#0f172a;margin:24px 0 8px;">🏠 Deal Rooms ({count(deal_rooms)})</h2>
  {render_rows(deal_rooms, ['score', 'product', 'status'])}

  <h2 style="font-size:15px;color:#0f172a;margin:24px 0 8px;">📋 Compliance Snapshots ({count(comp_snaps) + count(risk_snaps)})</h2>
  {render_rows(comp_snaps + risk_snaps, ['email', 'score', 'grade'])}

  <div style="margin-top:32px;padding:16px;background:#f1f5f9;border-radius:8px;font-size:12px;color:#475569;">
    <strong>System Health:</strong> {total} agent runs in 24h, {ok} successful, {total-ok} failed.
    Live ops dashboard: <a href="https://hub.bizlegal-ai.com/ops/command?t=YOUR_TOKEN" style="color:#0ea5e9;">hub.bizlegal-ai.com/ops/command</a>
    <br><br>
    <strong>Daily revenue target:</strong> $68/day ($2,000/mo MRR). You're at ${revenue_today:,.2f} today.
    <br>
    <em>Auto-sent by services/agents/daily_digest.py · Hermes AI Agent</em>
  </div>
</div>
</body></html>"""


def send_resend(html: str, subject: str) -> bool:
    if not RESEND_KEY: return False
    try:
        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=json.dumps({
                "from": FROM_EMAIL,
                "to": [TO_EMAIL],
                "subject": subject,
                "html": html,
            }).encode(),
            headers={"Authorization": f"Bearer {RESEND_KEY}", "Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(req, timeout=15)
        return True
    except Exception as e:
        print(f"[daily_digest] resend err: {e}")
        return False


def send_gmail_smtp(html: str, subject: str) -> bool:
    """SMTP fallback if Resend is down. Uses Gmail app password."""
    if not GMAIL_USER or not GMAIL_PASS: return False
    try:
        msg = MIMEMultipart()
        msg["From"] = FROM_EMAIL
        msg["To"] = TO_EMAIL
        msg["Subject"] = subject
        msg.attach(MIMEText(html, "html"))
        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx, timeout=15) as server:
            server.login(GMAIL_USER, GMAIL_PASS)
            server.sendmail(FROM_EMAIL, TO_EMAIL, msg.as_string())
        return True
    except Exception as e:
        print(f"[daily_digest] gmail err: {e}")
        return False


def run(ctx=None) -> dict:
    started = datetime.now(timezone.utc)
    events = gather_events()
    revenue = sum(float(p.get("amount") or 0) for p in (events.get("payments_completed") or []) if isinstance(p, dict))
    subject = f"📊 BizLegal Daily Digest — {datetime.now(timezone.utc).strftime('%Y-%m-%d')} — {revenue:,.0f} USD revenue"
    html = render_html(events)
    sent_via = "none"
    if send_resend(html, subject):
        sent_via = "resend"
    elif send_gmail_smtp(html, subject):
        sent_via = "gmail_smtp"
    duration = int((datetime.now(timezone.utc) - started).total_seconds() * 1000)
    return {
        "ok": sent_via != "none",
        "agent": "daily_digest",
        "sent_via": sent_via,
        "to": TO_EMAIL,
        "subject": subject,
        "events": {
            "leads": len(events.get("leads_captured") or []),
            "outreach": len(events.get("outreach_sent") or []),
            "payments_done": len(events.get("payments_completed") or []),
            "revenue_usd": revenue,
        },
        "duration_ms": duration,
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
