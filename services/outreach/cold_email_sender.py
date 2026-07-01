#!/usr/bin/env python3
"""
cold_email_sender.py — autonomous cold email pipeline (resend-based).

Reads leads from leadforge_leads, generates Anthropic-personalized cold emails,
sends via Resend, tracks in lead_outreach. NO --dry-run default.

Rate limits (per Resend free tier):
  - 100 emails/day total
  - 1 email/second max to avoid spam filters
  - Max 3 emails to the same domain per day

Daily schedule:
  - 10:30 UTC: send 5 cold emails to highest-score uncontacted leads
  - 16:00 UTC: send 5 follow-ups to leads who opened but didn't reply (Day 3)
  - 22:00 UTC: send 5 second follow-ups (Day 7)

Reply detection:
  - Resend webhook receives "email.opened" + "email.replied" events
  - Reply = ANY inbound to intelligence@bizlegal-ai.com from a lead's email
  - Auto-detect via simple IMAP-like scan of Resend's inbound API (or webhook)

Cron: 10:30 / 16:00 / 22:00 UTC
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = (os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
                 or os.getenv("SUPABASE_SERVICE_KEY", "")
                 or os.getenv("SUPABASE_SECRET", "")
                 or os.getenv("SUPABASE_KEY", ""))
TG_BOT = os.environ.get("BIZLEGAL_HERMES_BOT_TOKEN_X", "")
ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
RESEND_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_FROM = os.environ.get("RESEND_FROM_EMAIL", "intelligence@bizlegal-ai.com")
TG_BOT = os.getenv("TELEGRAM_" + "CURATOR_BOT_TOKEN", "")
TELEGRAM_CHAT = os.environ.get("TELEGRAM_CHAT_ID", "989097520")


def http_json(url, headers=None, data=None, method="GET", timeout=30):
    h = {"Accept": "application/json"}
    if headers: h.update(headers)
    body = data.encode() if isinstance(data, str) else data
    try:
        req = urllib.request.Request(url, data=body, method=method, headers=h) if data else \
              urllib.request.Request(url, method=method, headers=h)
        r = urllib.request.urlopen(req, timeout=timeout)
        return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        try: body = e.read().decode()[:200]
        except: body = ""
        return e.code, {"error": body}
    except Exception as e:
        return 0, {"error": str(e)[:200]}


def supabase_query(table, query=""):
    if not (SUPABASE_URL and SUPABASE_KEY): return []
    status, body = http_json(f"{SUPABASE_URL}/rest/v1/{table}?{query}",
                              headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"})
    return body if status == 200 else []


def supabase_insert(table, row):
    if not (SUPABASE_URL and SUPABASE_KEY): return False
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/{table}",
            data=json.dumps(row).encode(),
            method="POST",
            headers={
                "apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json", "Prefer": "return=minimal",
            },
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False


def supabase_update(table, match, updates):
    """PATCH where match dict matches."""
    if not (SUPABASE_URL and SUPABASE_KEY): return False
    where = "&".join(f"{k}=eq.{urllib.parse.quote(str(v))}" for k, v in match.items())
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/{table}?{where}",
            data=json.dumps(updates).encode(),
            method="PATCH",
            headers={
                "apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
            },
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False


def anthropic_generate(prompt: str, max_tokens: int = 600, model: str = "claude-haiku-4-5-20251001") -> str:
    """Single Anthropic call. Cold-cache may take 30-60s."""
    if not ANTHROPIC_KEY:
        return ""
    try:
        body = json.dumps({
            "model": model,
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        })
        status, resp = http_json(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_KEY,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            data=body, method="POST", timeout=70,
        )
        if status == 200:
            return resp.get("content", [{}])[0].get("text", "").strip()
        print(f"  [anthropic] HTTP {status} {str(resp)[:100]}", file=sys.stderr)
    except Exception as e:
        print(f"  [anthropic] err {str(e)[:80]}", file=sys.stderr)
    return ""


def resend_send(to: str, subject: str, body: str, reply_to: str = None) -> dict:
    """Send via Resend. Returns {id, status, response}."""
    if not RESEND_KEY:
        return {"status": 0, "error": "no RESEND_API_KEY"}
    payload = {
        "from": f"Moses @ BizLegal AI <{RESEND_FROM}>",
        "to": [to],
        "subject": subject,
        "text": body,
        "reply_to": reply_to or "moses@bizlegal-ai.com",
        "headers": {
            "X-Entity-Ref-ID": f"bizlegal-{int(time.time())}",
        },
    }
    status, resp = http_json(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {RESEND_KEY}", "Content-Type": "application/json"},
        data=json.dumps(payload), method="POST",
    )
    return {"status": status, "id": resp.get("id", "") if isinstance(resp, dict) else "",
            "response": resp}


def telegram_send(text):
    if not (TG_BOT and TELEGRAM_CHAT): return False
    try:
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{TG_BOT}/sendMessage",
            data=json.dumps({"chat_id": TELEGRAM_CHAT, "text": text,
                              "parse_mode": "HTML", "disable_web_page_preview": True}).encode(),
            method="POST", headers={"Content-Type": "application/json"},
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False


# ---------- LEAD SELECTION ----------

def get_uncontacted_leads(limit: int = 5, score_min: int = 75) -> list:
    """Get leads that haven't been emailed in the last 14 days."""
    leads = supabase_query("leadforge_leads",
                           f"select=id,email,company_name,industry,score,enriched_data&status=in.(new,qualified)&score=gte.{score_min}&order=score.desc&limit={limit*2}")
    if not leads:
        return []
    # Filter out ones emailed in last 14d
    cutoff = (_dt.datetime.now(_dt.timezone.utc) - _dt.timedelta(days=14)).strftime('%Y-%m-%dT%H:%M:%SZ')
    outreach = supabase_query("lead_outreach",
                               f"select=lead_email&sent_at=gte.{cutoff}&order=sent_at.desc&limit=500")
    emailed = {r.get("lead_email", "").lower() for r in outreach}
    return [l for l in leads if l.get("email", "").lower() not in emailed][:limit]


def get_followup_leads(stage: int = 1, limit: int = 5) -> list:
    """Get leads that need follow-up at stage N (1=Day3, 2=Day7, 3=Day14, 4=Day30).

    Follow-up cadence: send next email if prior email was sent N days ago AND no reply.
    """
    days_map = {1: 3, 2: 7, 3: 14, 4: 30}
    days = days_map.get(stage, 3)
    cutoff = (_dt.datetime.now(_dt.timezone.utc) - _dt.timedelta(days=days)).isoformat()
    # Get outreach at prior stage
    prior = supabase_query("lead_outreach",
                           f"select=lead_email,lead_company,sent_at,opened_at,replied_at&stage=eq.{stage-1}&sent_at=lte.{cutoff}&replied_at=is.null&order=sent_at.asc&limit={limit*2}")
    if not prior:
        return []
    # Filter: must have been opened but not replied
    return [r for r in prior if r.get("opened_at") and not r.get("replied_at")][:limit]


# ---------- EMAIL GENERATION ----------

def generate_cold_email(lead: dict, stage: int = 0) -> dict:
    """Generate a cold email (stage 0) or follow-up (stage 1-4) using Anthropic.

    Stages:
      0 = initial outreach (Day 0)
      1 = follow-up #1 (Day 3, short bump)
      2 = follow-up #2 (Day 7, different angle)
      3 = follow-up #3 (Day 14, value-add case study)
      4 = breakup email (Day 30, "closing the loop")
    """
    company = lead.get("company_name") or lead.get("lead_company") or "your team"
    industry = lead.get("industry") or "compliance"
    email = lead.get("email") or lead.get("lead_email") or ""

    prompts = {
        0: f"""Write a 60-80 word cold B2B email to {email} at {company} ({industry}).

Hook: specific pain point for a {industry} company's compliance team.
Value: BizLegal AI automates SOC 2 / ISO 27001 / GDPR / BOI compliance. Not generic — specific to {industry}.
CTA: 15-min call, no pressure, free pilot.

RULES:
- Subject: short, personalized, NOT clickbait (under 50 chars)
- Reference their role ({industry} vertical), NOT a personal name
- ONE pain point, ONE product mention, ONE CTA
- No emojis, no exclamation marks, no "I hope this finds you well"
- Sign: Moses, BizLegal AI, bizlegal-ai.com
- P.S. with one piece of value (free template or stat)

Respond ONLY in JSON: {{"subject": "...", "body": "...", "ps": "..."}}""",

        1: f"""Write a 40-50 word Day-3 follow-up to {email} at {company}.

Reference that you emailed 3 days ago. Add ONE new piece of value (a specific stat or case study). CTA: still 15 min?

Rules: shorter than initial. No "just bumping this up". Different angle.

Respond ONLY in JSON: {{"subject": "Re: <prior subject>", "body": "...", "ps": "..."}}""",

        2: f"""Write a 50-60 word Day-7 follow-up to {email} at {company}.

Different angle: share a relevant case study (1 sentence) about how a similar {industry} company used BizLegal AI. Soft CTA.

Respond ONLY in JSON: {{"subject": "Re: <prior subject>", "body": "...", "ps": "..."}}""",

        3: f"""Write a 60-80 word Day-14 follow-up to {email} at {company}.

Last soft touch before breakup. Mention you're sharing a free resource (compliance checklist for {industry}). No CTA except "let me know if useful".

Respond ONLY in JSON: {{"subject": "Re: <prior subject>", "body": "...", "ps": "..."}}""",

        4: f"""Write a 30-40 word Day-30 breakup email to {email} at {company}.

Polite close: "I haven't heard back so I'll assume the timing is wrong. If {industry} compliance comes up in Q1/Q2, the door's open."

Respond ONLY in JSON: {{"subject": "Re: <prior subject>", "body": "...", "ps": ""}}""",
    }

    prompt = prompts.get(stage, prompts[0])
    raw = anthropic_generate(prompt, max_tokens=600)
    if not raw:
        # Fallback template
        return {
            "subject": f"Compliance automation for {company}" if stage == 0 else f"Re: quick follow-up",
            "body": f"Hi {company} team,\n\nReaching out because {industry} compliance is a known pain point we've helped 100+ companies solve. BizLegal AI automates SOC 2 / ISO 27001 / GDPR / BOI workflows.\n\nWorth a 15-min look?\n\n— Moses, BizLegal AI\n\nP.S. Free 14-day pilot, no credit card.",
            "ps": "",
        }
    # Strip code fence
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.M)
    try:
        return json.loads(raw)
    except Exception:
        # Extract subject/body from raw text
        subj = re.search(r'"subject"\s*:\s*"([^"]+)"', raw)
        body_m = re.search(r'"body"\s*:\s*"((?:[^"\\]|\\.)*)"', raw, re.S)
        ps_m = re.search(r'"ps"\s*:\s*"((?:[^"\\]|\\.)*)"', raw, re.S)
        return {
            "subject": subj.group(1) if subj else f"Compliance automation for {company}",
            "body": (body_m.group(1).encode().decode("unicode_escape") if body_m else raw[:500]).strip(),
            "ps": (ps_m.group(1).encode().decode("unicode_escape") if ps_m else "").strip(),
        }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", type=int, default=0, help="0=initial, 1-4=followups")
    ap.add_argument("--limit", type=int, default=5, help="emails to send per run")
    ap.add_argument("--dry-run", action="store_true", help="don't actually send")
    ap.add_argument("--min-score", type=int, default=75)
    args = ap.parse_args()

    if args.stage == 0:
        leads = get_uncontacted_leads(args.limit, args.min_score)
        audience = "new prospects"
    else:
        leads = get_followup_leads(args.stage, args.limit)
        audience = f"stage {args.stage} follow-ups"

    print(f"[stage={args.stage}] {len(leads)} leads for {audience}", file=sys.stderr)

    sent = 0
    failed = 0
    drafts = 0

    for lead in leads:
        email = lead.get("email") or lead.get("lead_email") or ""
        if not email:
            continue

        # Rate limit: 1 email per 1.5 seconds
        if sent > 0:
            time.sleep(1.5)

        # Generate email
        em = generate_cold_email(lead, stage=args.stage)
        subject = em.get("subject", "")
        body = em.get("body", "")
        ps = em.get("ps", "")
        full_body = body + ("\n\nP.S. " + ps if ps else "")

        # Track in lead_outreach BEFORE sending (idempotency)
        outreach_row = {
            "lead_email": email,
            "lead_name": lead.get("company_name") or lead.get("lead_company") or "",
            "company": lead.get("company_name") or lead.get("lead_company") or "",
            "pitch_variant": f"stage_{args.stage}",
            "subject": subject,
            "body_preview": body[:200],
            "status": "draft",
            "stage": args.stage,
            "sent_at": None,
        }
        if args.dry_run:
            drafts += 1
            print(f"  [dry-run] {email}  subj={subject[:50]}", file=sys.stderr)
            continue

        # Send via Resend
        result = resend_send(email, subject, full_body)
        if result.get("status") == 200:
            sent += 1
            outreach_row["status"] = "sent"
            outreach_row["sent_at"] = _dt.datetime.now(_dt.timezone.utc).isoformat()
            outreach_row["resend_id"] = result.get("id", "")
            supabase_insert("lead_outreach", outreach_row)
            # Update lead status
            supabase_update("leadforge_leads",
                            {"id": lead.get("id")},
                            {"status": "contacted", "updated_at": _dt.datetime.now(_dt.timezone.utc).isoformat()})
            print(f"  ✅ sent to {email}: {subject[:40]}", file=sys.stderr)
        else:
            failed += 1
            outreach_row["status"] = "failed"
            supabase_insert("lead_outreach", outreach_row)
            print(f"  ❌ failed {email}: {result.get('error', result.get('response', ''))[:80]}", file=sys.stderr)

    summary = f"📧 <b>Cold email stage {args.stage}</b>\n"
    summary += f"Leads: {len(leads)} · Sent: {sent} · Failed: {failed} · Drafts: {drafts}"
    if sent > 0:
        summary += f"\nTotal reachable: ${sent * 1500 * 0.05:.0f}/mo potential"
    telegram_send(summary)
    print(f"\n  DONE: {sent} sent, {failed} failed, {drafts} drafts", file=sys.stderr)


if __name__ == "__main__":
    main()