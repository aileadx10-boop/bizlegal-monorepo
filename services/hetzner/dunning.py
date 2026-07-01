"""
Hetzner curator — dunning agent (Agent S2).

Sends staged follow-up emails to customers who initiated checkout but
haven't completed payment, or whose subscriptions have lapsed.

Stages:
  - Day 3:  Friendly setup reminder
  - Day 7:  Value reminder
  - Day 14: Final notice

Usage:
    python dunning.py             # process full queue
    python dunning.py --dry-run   # log what would be sent, no emails
"""
from __future__ import annotations

import argparse
import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = (os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
                or os.environ.get("SUPABASE_SERVICE_KEY", "")
                or os.environ.get("SUPABASE_SECRET", "")
                or os.environ.get("SUPABASE_KEY", ""))
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM_EMAIL = "intelligence@bizlegal-ai.com"  # only intelligence.bizlegal-ai.com is Resend-verified

PRODUCT_URLS = {
    "docai": "https://docai.bizlegal-ai.com",
    "lexaudit": "https://lexaudit.bizlegal-ai.com",
    "forge": "https://forge.bizlegal-ai.com",
    "hub": "https://bizlegal-ai.com",
}


def _http(url, headers=None, data=None, method="GET", timeout=20):
    h = {"Accept": "application/json"}
    if headers:
        h.update(headers)
    body = None
    if data is not None:
        body = json.dumps(data).encode() if not isinstance(data, bytes) else data
        h.setdefault("Content-Type", "application/json")
    req = urllib.request.Request(url, data=body, method=method, headers=h)
    try:
        r = urllib.request.urlopen(req, timeout=timeout)
        return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, {}


def _sb_get(table, query=""):
    if not (SUPABASE_URL and SUPABASE_KEY):
        return []
    code, body = _http(
        f"{SUPABASE_URL}/rest/v1/{table}?{query}",
        {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
    )
    return body if code == 200 and isinstance(body, list) else []


def _sb_patch(table, row_id, updates):
    if not (SUPABASE_URL and SUPABASE_KEY):
        return False
    code, _ = _http(
        f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{row_id}",
        {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
         "Prefer": "return=minimal"},
        data=updates,
        method="PATCH",
    )
    return code in (200, 204)


# ── Email templates ───────────────────────────────────────────────

def _subject_day3(product):
    names = {"docai": "DocAI", "lexaudit": "LexAudit", "forge": "Forge", "hub": "BizLegal AI"}
    return f"Quick setup reminder — your {names.get(product, 'BizLegal AI')} access is waiting"


def _body_day3(name, product):
    first = (name or "").split()[0] or "there"
    url = PRODUCT_URLS.get(product, "https://bizlegal-ai.com")
    return f"""Hi {first},

We noticed you started setting up your {product.upper() if product == 'docai' else product.title()} account a few days ago but didn't finish. Your access is still waiting.

Getting started takes under 5 minutes. You can pick up right where you left off: {url}

If you ran into any issues or have questions, just reply to this email — I check it personally.

— Moses
BizLegal AI
"""


def _subject_day7(_product):
    return "What you're missing in BizLegal AI this week"


def _body_day7(name, product, _amount):
    first = (name or "").split()[0] or "there"
    url = PRODUCT_URLS.get(product, "https://bizlegal-ai.com")
    return f"""Hi {first},

Here's what compliance teams using BizLegal AI acted on this week:

• 3 new FCA enforcement actions flagged before the industry press covered them
• MiCA Article 45 deadline clarification that affects token issuers in Q3
• A spoofing case settlement that sets a new CFTC penalty benchmark

Your account is ready to access all of this: {url}

Takes 2 minutes to log in and run your first scan.

— Moses
BizLegal AI
"""


def _subject_day14(product):
    names = {"docai": "DocAI", "lexaudit": "LexAudit", "forge": "Forge", "hub": "BizLegal AI"}
    return f"Last reminder: {names.get(product, 'BizLegal AI')} access"


def _body_day14(name, product):
    first = (name or "").split()[0] or "there"
    url = PRODUCT_URLS.get(product, "https://bizlegal-ai.com")
    return f"""Hi {first},

This is my last follow-up. I don't want to keep emailing you if BizLegal AI isn't the right fit right now.

If you'd like to keep your access, you can activate it here: {url}

If the timing is off, no problem — you can always come back when it makes sense. Just reply and I'll note that.

— Moses
BizLegal AI
"""


# ── Sending ───────────────────────────────────────────────────────

def _send_email(to, subject, body, dry_run):
    if dry_run:
        print(f"  [DRY RUN] → {to} | {subject}")
        return True
    if not RESEND_API_KEY:
        print(f"  [dunning] RESEND_API_KEY missing — skipping {to}")
        return False
    code, resp = _http(
        "https://api.resend.com/emails",
        {"Authorization": f"Bearer {RESEND_API_KEY}"},
        data={"from": FROM_EMAIL, "to": [to], "subject": subject, "text": body},
        method="POST",
    )
    if code == 200:
        return True
    print(f"  [dunning] send failed to {to}: HTTP {code} {str(resp)[:100]}")
    return False


def _days_since(dt_str):
    dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    return (datetime.now(timezone.utc) - dt).days


def process_queue(dry_run=False):
    rows = _sb_get("dunning_queue",
                   "converted_at=is.null&opted_out_at=is.null&select=*")
    if not rows:
        print("[dunning] queue empty")
        return

    print(f"[dunning] {len(rows)} entries in queue")
    sent = skipped = failed = 0

    for row in rows:
        email = row.get("email", "")
        name = row.get("name") or ""
        product = row.get("product") or "hub"
        amount = row.get("amount_usd")
        initiated = row.get("payment_initiated_at") or row.get("created_at", "")
        last_stage = int(row.get("last_stage_sent") or 0)

        if not initiated or not email:
            skipped += 1
            continue

        days = _days_since(initiated)

        if days >= 14 and last_stage < 14:
            stage = 14
            subject = _subject_day14(product)
            body = _body_day14(name, product)
        elif days >= 7 and last_stage < 7:
            stage = 7
            subject = _subject_day7(product)
            body = _body_day7(name, product, amount)
        elif days >= 3 and last_stage < 3:
            stage = 3
            subject = _subject_day3(product)
            body = _body_day3(name, product)
        else:
            skipped += 1
            continue

        print(f"[dunning] {email} — day-{stage} ({days} days elapsed)")
        ok = _send_email(email, subject, body, dry_run)
        if ok:
            if not dry_run:
                _sb_patch("dunning_queue", row["id"], {
                    "last_stage_sent": stage,
                    "last_sent_at": datetime.now(timezone.utc).isoformat(),
                })
            sent += 1
        else:
            failed += 1

    print(f"[dunning] done — {sent} sent, {skipped} skipped, {failed} failed")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Log without sending")
    args = parser.parse_args()
    process_queue(dry_run=args.dry_run)
