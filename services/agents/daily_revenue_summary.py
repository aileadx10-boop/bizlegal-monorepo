#!/usr/bin/env python3
"""
daily_revenue_summary.py — daily 18:00 UTC summary to ai.leadx10@gmail.com.

Aggregates: revenue, leads, outreach, payments, pipeline state.
Sends via Resend (intelligence@intelligence.bizlegal-ai.com).
Schedule: 0 18 * * *
"""
from __future__ import annotations
import os, json, urllib.request, urllib.error
from datetime import datetime, timezone, timedelta
from pathlib import Path
import sys as _sys
_sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
import _env

SUPABASE_URL, SUPABASE_KEY = _env.get_supabase()
if not SUPABASE_URL: SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
RESEND_KEY = _env.get_resend_key()
FROM_EMAIL = "BizLegal AI <intelligence@intelligence.bizlegal-ai.com>"
TO_EMAIL = "ai.leadx10@gmail.com"

def _q(path: str) -> list:
    try:
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"})
        return json.loads(urllib.request.urlopen(req, timeout=10).read())
    except Exception: return []

def _q_count(path: str) -> int:
    try:
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Prefer": "count=exact"})
        r = urllib.request.urlopen(req, timeout=10)
        return int(r.headers.get("content-range", "0-0/0").split("/")[-1])
    except Exception: return 0

def _send(html: str, subject: str) -> str:
    if not RESEND_KEY: return "no-resend-key"
    try:
        body = json.dumps({"from": FROM_EMAIL, "to": [TO_EMAIL], "subject": subject, "html": html}).encode()
        req = urllib.request.Request("https://api.resend.com/emails", data=body,
            headers={"User-Agent": "bizlegal-agent/1.0", "Authorization": "Bearer " + RESEND_KEY, "Content-Type": "application/json"})
        r = urllib.request.urlopen(req, timeout=10)
        return r.read().decode()[:200]
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}: " + e.read().decode()[:200]
    except Exception as e:
        return f"ERR: {str(e)[:200]}"

def run(ctx=None) -> dict:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_start = today + "T00:00:00Z"
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")
    today_payments = _q(f"payment_orders?select=amount_cents,gateway,status&status=eq.active&gateway=neq.simulated&created_at=gte.{today_start}")
    week_payments = _q(f"payment_orders?select=amount_cents,gateway,status&status=eq.active&gateway=neq.simulated&created_at=gte.{week_ago}")
    rev_today = sum(float(p.get("amount_cents") or 0) / 100 for p in today_payments)
    rev_week = sum(float(p.get("amount_cents") or 0) / 100 for p in week_payments)
    leads_today = _q_count(f"leadforge_leads?select=id&created_at=gte.{today_start}")
    outreach_drafts = _q_count("lead_outreach?select=id&status=eq.drafted")
    deal_rooms = _q_count("deal_rooms?select=id&status=eq.open")
    daily_target = 667
    gap = max(0, daily_target - rev_today)
    html = f"""<html><body style="font-family:system-ui;max-width:780px;margin:0 auto;padding:20px;">
<h1>\U0001F4CA Daily Revenue Summary \u2014 {today}</h1>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0;">
<div style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;">
<div style="font-size:24px;font-weight:700;color:#0ea5e9;">${rev_today:,.2f}</div>
<div>Today (real)</div>
</div>
<div style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;">
<div style="font-size:24px;font-weight:700;color:#8b5cf6;">${rev_week:,.2f}</div>
<div>7d (real)</div>
</div>
<div style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;">
<div style="font-size:24px;font-weight:700;color:#10b981;">{leads_today}</div>
<div>New leads</div>
</div>
<div style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;">
<div style="font-size:24px;font-weight:700;color:#f59e0b;">{outreach_drafts}</div>
<div>Drafts</div>
</div>
</div>
<p><b>Daily target:</b> ${daily_target} \u00b7 <b>Gap:</b> ${gap:,.2f}</p>
<p><b>Open deal rooms:</b> {deal_rooms}</p>
<p><b>MRR trajectory:</b> at current rate \u2192 ${rev_today * 30:,.0f}/mo. Target $20K MRR (8 clients @ $2,500).</p>
<hr>
<p><em>Auto-sent by daily_revenue_summary.py</em></p>
</body></html>"""
    res = _send(html, f"\U0001F4CA Daily Revenue \u2014 {today} \u2014 ${rev_today:,.0f} today / ${rev_week:,.0f} 7d")
    return {"ok": True, "agent": "daily_revenue_summary", "rev_today": rev_today,
            "rev_week": rev_week, "leads_today": leads_today,
            "outreach_drafts": outreach_drafts, "deal_rooms": deal_rooms,
            "send_result": res[:300]}

if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
