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
import os
import sys
from datetime import datetime, timezone
from typing import Any

import httpx
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

RESEND_API_KEY = os.environ["RESEND_API_KEY"]
RESEND_URL = "https://api.resend.com/emails"
FROM_EMAIL = "hello@bizlegal-ai.com"

PRODUCT_URLS: dict[str, str] = {
    "docai": "https://docai.bizlegal-ai.com",
    "lexaudit": "https://lexaudit.bizlegal-ai.com",
    "forge": "https://forge.bizlegal-ai.com",
    "hub": "https://bizlegal-ai.com",
}

# ── Email templates ───────────────────────────────────────────────

def _subject_day3(product: str) -> str:
    names = {"docai": "DocAI", "lexaudit": "LexAudit", "forge": "Forge", "hub": "BizLegal AI"}
    return f"Quick setup reminder — your {names.get(product, 'BizLegal AI')} access is waiting"


def _body_day3(name: str, product: str) -> str:
    first = (name or "").split()[0] or "there"
    url = PRODUCT_URLS.get(product, "https://bizlegal-ai.com")
    return f"""Hi {first},

We noticed you started setting up your {product.upper() if product in ('docai',) else product.title()} account a few days ago but didn't finish. Your access is still waiting.

Getting started takes under 5 minutes. You can pick up right where you left off: {url}

If you ran into any issues or have questions, just reply to this email — I check it personally.

— Moses
BizLegal AI
"""


def _subject_day7(product: str) -> str:
    return f"What you're missing in BizLegal AI this week"


def _body_day7(name: str, product: str, amount_usd: float | None) -> str:
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


def _subject_day14(product: str) -> str:
    names = {"docai": "DocAI", "lexaudit": "LexAudit", "forge": "Forge", "hub": "BizLegal AI"}
    return f"Last reminder: {names.get(product, 'BizLegal AI')} access"


def _body_day14(name: str, product: str) -> str:
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

def _send_email(to: str, subject: str, body: str, dry_run: bool) -> bool:
    if dry_run:
        print(f"  [DRY RUN] → {to} | {subject}")
        return True
    try:
        res = httpx.post(
            RESEND_URL,
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": FROM_EMAIL,
                "to": [to],
                "subject": subject,
                "text": body,
            },
            timeout=30,
        )
        res.raise_for_status()
        return True
    except Exception as err:
        print(f"  [dunning] send failed to {to}: {err}")
        return False


def _days_since(dt_str: str) -> int:
    dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    return (datetime.now(timezone.utc) - dt).days


def process_queue(sb: Client, dry_run: bool) -> None:
    rows = (
        sb.table("dunning_queue")
        .select("*")
        .is_("converted_at", "null")
        .is_("opted_out_at", "null")
        .execute()
    )

    if not rows.data:
        print("[dunning] queue empty")
        return

    print(f"[dunning] {len(rows.data)} entries in queue")
    sent = skipped = failed = 0

    for row in rows.data:
        email = row["email"]
        name = row.get("name") or ""
        product = row.get("product") or "hub"
        amount = row.get("amount_usd")
        initiated = row.get("payment_initiated_at") or row.get("created_at", "")
        last_stage = int(row.get("last_stage_sent") or 0)

        if not initiated:
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

        print(f"[dunning] {email} — day-{stage} email ({days} days elapsed)")
        ok = _send_email(email, subject, body, dry_run)
        if ok:
            if not dry_run:
                sb.table("dunning_queue").update({
                    "last_stage_sent": stage,
                    "last_sent_at": datetime.now(timezone.utc).isoformat(),
                }).eq("id", row["id"]).execute()
            sent += 1
        else:
            failed += 1

    print(f"[dunning] done — {sent} sent, {skipped} skipped, {failed} failed")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Log without sending")
    args = parser.parse_args()

    sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SECRET"])
    process_queue(sb, dry_run=args.dry_run)
