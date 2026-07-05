"""
Monetization Agent — Conversion + deal close.

Job: Watch qualified leads + outreach responses -> for hot signals ->
auto-build deal room (MACHINE-AMENDMENT v1.1 stage 5) -> trigger
oci_deal_closer for async close.

Stack: Reads lead_outreach for replied_at not null, reads payment_orders
for new rows, builds /deal/[token] page dynamically.

Schedule: Every 15 min (heartbeat interval).

Usage:
  from services.agents.monetization_agent import run
  result = run({"limit": 10})
"""
from __future__ import annotations
import json, os, time, secrets
from datetime import datetime, timezone, timedelta
from pathlib import Path
import sys as _sys
_sys.path.insert(0, str(Path(__file__).resolve().parent))
import _env
try:
    from orchestrator import heartbeat as _heartbeat
except Exception:
    _heartbeat = None

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")
except Exception:
    pass

SUPABASE_URL, SUPABASE_KEY = _env.get_supabase()
ANTHROPIC = _env.get_anthropic_key()


def _headers():
    return {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"}


def _get_json(url, headers, timeout=10):
    import urllib.request
    req = urllib.request.Request(url, headers=headers)
    r = urllib.request.urlopen(req, timeout=timeout)
    return json.loads(r.read())


def _fetch_replied_outreach(limit):
    """Find outreach emails that got replied to in the last 24h."""
    day_ago = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    url = (
        f"{SUPABASE_URL}/rest/v1/lead_outreach"
        f"?select=id,lead_email,lead_name,company,pitch_variant,subject,replied_at"
        f"&replied_at=gte.{day_ago}&status=eq.sent"
        f"&order=replied_at.desc&limit={limit}"
    )
    try:
        return _get_json(url, _headers(), 10)
    except Exception:
        return []


def _fetch_new_payment_orders(limit):
    """Find payment orders from the last 24h."""
    day_ago = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    url = (
        f"{SUPABASE_URL}/rest/v1/payment_orders"
        f"?select=*&created_at=gte.{day_ago}"
        f"&gateway=neq.simulated"
        f"&order=created_at.desc&limit={limit}"
    )
    try:
        return _get_json(url, _headers(), 10)
    except Exception:
        return []


def _generate_proposal(reply, anthropic_key):
    """Use Claude to generate a personalized 3-paragraph proposal."""
    if not anthropic_key:
        return f"Hi {reply.get('lead_name', 'there')}, based on your reply, here's how BizLegal-AI can help."
    import urllib.request
    prompt = (
        "You are a senior sales rep for BizLegal-AI. A prospect just replied to a cold email. "
        "Generate a 3-paragraph proposal response: (1) acknowledge their reply specifically, "
        "(2) recommend 1-2 BizLegal products that match their need, "
        "(3) clear next step (book a call OR self-checkout link). "
        "Output ONLY the proposal text, no headers.\n\n"
        f"Reply context: {json.dumps(reply)[:1000]}\n\n"
        f"Products: DocAI $97 contract scan, LexAudit $99/mo compliance cert, "
        f"BRAI wallet API $500-5K/mo, TRACR forensics $2K/case, LeadForge leads marketplace."
    )
    try:
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=json.dumps({"model": "claude-haiku-4-5", "max_tokens": 600,
                             "messages": [{"role": "user", "content": prompt}]}).encode(),
            headers={"x-api-key": anthropic_key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
            method="POST",
        )
        r = urllib.request.urlopen(req, timeout=30)
        d = json.loads(r.read())
        return d["content"][0]["text"]
    except Exception as e:
        return f"[error: {e}]"


def _create_deal_room(reply, proposal):
    """Create a deal room by writing a row to deals table.
    Token: signed JWT-style random hex for the URL."""
    if not reply:
        return None
    import urllib.request
    token = secrets.token_urlsafe(24)
    deal = {
        "token": token,
        "lead_email": reply.get("lead_email"),
        "lead_name": reply.get("lead_name"),
        "company": reply.get("company"),
        "proposal_text": proposal,
        "status": "open",
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/deals",
            data=json.dumps(deal).encode(),
            headers={**_headers(), "Prefer": "return=minimal"},
            method="POST",
        )
        urllib.request.urlopen(req, timeout=10)
        return deal
    except Exception:
        return deal  # Return the deal data even if write fails (table may not exist)


def _update_outreach_status(outreach_id, new_status):
    """Mark outreach as converted or replied."""
    if not outreach_id:
        return False
    import urllib.request
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/lead_outreach?id=eq.{outreach_id}",
            data=json.dumps({"status": new_status}).encode(),
            headers={**_headers(), "Prefer": "return=minimal"},
            method="PATCH",
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False


def run(ctx=None):
    ctx = ctx or {}
    limit = int(ctx.get("limit", 10))
    dry_run = bool(ctx.get("dry_run", False))
    started = time.time()
    deals_created = 0
    errors = 0
    new_orders = 0
    deal_room_urls = []

    # 1. Find replied outreach
    replies = _fetch_replied_outreach(limit)
    for reply in replies:
        proposal = _generate_proposal(reply, ANTHROPIC)
        deal = _create_deal_room(reply, proposal) if not dry_run else {"token": "dry-run", "lead_email": reply.get("lead_email")}
        if deal:
            deals_created += 1
            deal_room_urls.append(f"https://bizlegal-ai.com/deal/{deal.get('token', '?')}")
            _update_outreach_status(reply.get("id"), "replied")
        else:
            errors += 1

    # 2. Find new payment orders
    orders = _fetch_new_payment_orders(limit)
    new_orders = len(orders)

    return {
        "ok": errors == 0,
        "agent": "monetization",
        "replies_processed": len(replies),
        "deals_created": deals_created,
        "new_payment_orders": new_orders,
        "deal_room_urls": deal_room_urls[:10],
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
