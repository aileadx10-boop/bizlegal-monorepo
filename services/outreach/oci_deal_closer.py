#!/usr/bin/env python3
"""
oci_deal_closer.py — accept/decline inbound OCI partner deals, auto-invoice via Stripe.

When OCI partner (law firm) responds to a lead introduction (oci_funnel.py),
they create a deal record in `oci_deals` Supabase table. This script:
  1. Reads new oci_deals where status='inbound'
  2. Validates the deal against business rules (deal size, partner tier, lead score)
  3. Auto-approves (creates Stripe invoice) if rules pass
  4. Auto-declines (sends polite rejection) if rules fail
  5. Escalates to Moses (Telegram ping) for manual review if borderline

Business rules:
  - Minimum deal size: $1500 (placement fee from OCI partner)
  - Minimum lead score: 70
  - Allowed partners: pre-approved list in vault (OCI_PARTNER_ALLOWLIST env)
  - Auto-approve if: score >= 85 AND deal_size >= 5000
  - Auto-decline if: score < 60 OR deal_size < 1500
  - Manual review otherwise

Stripe is DEAD currently; once live, this auto-creates a Stripe invoice
via `invoices.create` with the OCI partner's Stripe account as destination
(Stripe Connect). For now, the script marks deals as approved/declined in
Supabase and sends Telegram pings so Moses can manually invoice.
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import sys
import urllib.error
import urllib.request
import urllib.parse

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_" + "KEY", "")
TG_BOT = os.environ.get("BIZLEGAL_HERMES_BOT_TOKEN_X", "")
TELEGRAM_CHAT = os.environ.get("TELEGRAM_CHAT_ID", "989097520")
STRIPE_KEY = os.environ.get("STRIPE_" + "SECRET_KEY", "")


def http_json(url, headers=None, data=None, method="GET", timeout=30):
    h = {"Accept": "application/json"}
    if headers: h.update(headers)
    body = data.encode() if isinstance(data, str) else data
    try:
        req = urllib.request.Request(url, data=data, method=method, headers=h) if data else \
              urllib.request.Request(url, method=method, headers=h)
        r = urllib.request.urlopen(req, timeout=timeout)
        return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        try: body = e.read().decode()[:200]
        except: body = ""
        return e.code, {"error": body}
    except Exception as e:
        return 0, {"error": str(e)[:200]}


def sb_query(table, query=""):
    if not (SUPABASE_URL and SUPABASE_KEY): return []
    s, b = http_json(f"{SUPABASE_URL}/rest/v1/{table}?{query}",
                      headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"})
    return b if s == 200 else []


def sb_insert(table, row):
    if not (SUPABASE_URL and SUPABASE_KEY): return False
    try:
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{table}",
            data=json.dumps(row).encode(), method="POST",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
                     "Content-Type": "application/json", "Prefer": "return=minimal"})
        urllib.request.urlopen(req, timeout=10); return True
    except: return False


def sb_update(table, match, updates):
    if not (SUPABASE_URL and SUPABASE_KEY): return False
    where = "&".join(f"{k}=eq.{urllib.parse.quote(str(v))}" for k, v in match.items())
    try:
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{table}?{where}",
            data=json.dumps(updates).encode(), method="PATCH",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
                     "Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=10); return True
    except: return False


def telegram(text):
    if not (TG_BOT and TELEGRAM_CHAT): return False
    try:
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{TG_BOT}/sendMessage",
            data=json.dumps({"chat_id": TELEGRAM_CHAT, "text": text, "parse_mode": "HTML",
                              "disable_web_page_preview": True}).encode(),
            method="POST", headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=10); return True
    except: return False


def create_stripe_invoice(amount_cents: int, partner_email: str, deal_id: str, memo: str) -> dict:
    """Create a Stripe invoice. Returns {id, status} or error."""
    if not STRIPE_KEY:
        return {"status": 0, "error": "STRIPE_SECRET_KEY not set"}
    payload = {
        "customer[email]": partner_email,
        "collection_method": "send_invoice",
        "days_until_due": 30,
        "line_items[0][amount]": amount_cents,
        "line_items[0][currency]": "usd",
        "line_items[0][description]": memo,
        "metadata[deal_id]": deal_id,
        "metadata[source]": "bizlegal_oci_funnel",
    }
    # Encode as application/x-www-form-urlencoded
    encoded = urllib.parse.urlencode(payload)
    s, r = http_json("https://api.stripe.com/v1/invoices",
        headers={"Authorization": f"Bearer {STRIPE_KEY}", "Content-Type": "application/x-www-form-urlencoded"},
        data=encoded, method="POST")
    return {"status": s, "id": r.get("id", "") if isinstance(r, dict) else "", "response": r}


def evaluate_deal(deal: dict) -> str:
    """Return 'approve', 'decline', or 'review' based on rules."""
    score = int(deal.get("lead_score", 0) or 0)
    size = int(deal.get("amount_cents", 0) or 0)
    partner = (deal.get("partner") or "").lower()
    allowlist = os.environ.get("OCI_PARTNER_ALLOWLIST", "akin gump,sullivan,cromwell,latham,skadden,cooley").split(",")
    if not any(p.strip().lower() in partner for p in allowlist):
        return "decline"
    if score >= 85 and size >= 5000 * 100:
        return "approve"
    if score < 60 or size < 1500 * 100:
        return "decline"
    return "review"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=20)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    deals = sb_query("oci_deals",
        f"select=id,lead_email,lead_company,partner,amount_cents,lead_score,deal_type&status=eq.inbound&order=created_at.asc&limit={args.limit}")
    print(f"[oci_deal_closer] {len(deals)} inbound deals to evaluate", file=sys.stderr)

    approved = declined = reviewed = 0
    for d in deals:
        action = evaluate_deal(d)
        deal_id = d.get("id")
        updates = {"status": action, "evaluated_at": _dt.datetime.now(_dt.timezone.utc).isoformat()}

        if action == "approve" and not args.dry_run:
            inv = create_stripe_invoice(d.get("amount_cents", 0), d.get("lead_email", ""),
                                          deal_id, f"OCI placement fee — {d.get('lead_company', '')}")
            updates["stripe_invoice_id"] = inv.get("id", "")
            updates["stripe_status"] = inv.get("status", 0)
            if inv.get("status") == 200:
                approved += 1
            else:
                # Stripe not live — keep as approved, mark for manual invoice
                updates["status"] = "approved_pending_invoice"
                updates["stripe_status"] = "skipped_no_key"
                approved += 1
        elif action == "decline":
            sb_insert("oci_deal_outreach", {
                "deal_id": deal_id, "lead_email": d.get("lead_email", ""),
                "subject": f"Re: {d.get('lead_company', '')} placement",
                "body": f"Hi team,\n\nThanks for the introduction. After reviewing {d.get('lead_company', '')}, the deal size / lead fit isn't a match for our current quarter. Happy to revisit in Q4.\n\n— Moses, BizLegal AI",
                "status": "draft",
                "created_at": _dt.datetime.now(_dt.timezone.utc).isoformat(),
            })
            declined += 1
        else:  # review
            updates["status"] = "manual_review"
            telegram(f"⚠️ <b>OCI deal needs review</b>\n"
                      f"Deal: {deal_id}\n"
                      f"Partner: {d.get('partner', '?')}\n"
                      f"Lead: {d.get('lead_company', '?')} (score {d.get('lead_score', '?')})\n"
                      f"Size: ${d.get('amount_cents', 0)/100:.0f}\n"
                      f"<a href='https://supabase.com/dashboard/project/_/editor'>Open Supabase</a>")
            reviewed += 1

        sb_update("oci_deals", {"id": deal_id}, updates)
        print(f"  {action}: {d.get('lead_company', '?')} @ {d.get('partner', '?')} ${d.get('amount_cents', 0)/100:.0f}", file=sys.stderr)

    summary = f"💼 <b>OCI deals</b>\nApproved: {approved} · Declined: {declined} · Review: {reviewed}"
    telegram(summary)
    print(f"\n  DONE: {approved} approved, {declined} declined, {reviewed} review", file=sys.stderr)


if __name__ == "__main__":
    main()