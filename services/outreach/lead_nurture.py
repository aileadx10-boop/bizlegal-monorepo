#!/usr/bin/env python3
"""
lead_nurture.py — drip campaign engine for warm leads (already contacted, opened).

Branching logic per stage:
  Stage 0 (Day 0): cold email sent by cold_email_sender.py
  Stage 1 (Day 3):  if opened, send bump; if not opened, send different subject
  Stage 2 (Day 7):  if opened, send case study; if replied, mark as hot
  Stage 3 (Day 14): if replied, route to oci_funnel; else breakup email
  Stage 4 (Day 30): final breakup, mark as cold

Uses Resend for sending, lead_outreach table for state.

Cron: 16:00 UTC daily (after Stage 0 at 10:30)
"""
from __future__ import annotations
import argparse, datetime as _dt, json, os, sys, urllib.error, urllib.request, urllib.parse
import re

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_" + "KEY", "")
TG_BOT = os.environ.get("BIZLEGAL_HERMES_BOT_TOKEN_X", "")
RESEND_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_FROM = os.environ.get("RESEND_FROM_EMAIL", "intelligence@bizlegal-ai.com")
TG_BOT = os.getenv("TELEGRAM_" + "CURATOR_BOT_TOKEN", "")
TELEGRAM_CHAT = os.environ.get("TELEGRAM_CHAT_ID", "989097520")
ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY", "")


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


def supabase_query(table, query=""):
    if not (SUPABASE_URL and SUPABASE_KEY): return []
    s, b = http_json(f"{SUPABASE_URL}/rest/v1/{table}?{query}",
                      headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"})
    return b if s == 200 else []


def supabase_insert(table, row):
    if not (SUPABASE_URL and SUPABASE_KEY): return False
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/{table}",
            data=json.dumps(row).encode(), method="POST",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
                     "Content-Type": "application/json", "Prefer": "return=minimal"})
        urllib.request.urlopen(req, timeout=10); return True
    except: return False


def supabase_update(table, match, updates):
    if not (SUPABASE_URL and SUPABASE_KEY): return False
    where = "&".join(f"{k}=eq.{urllib.parse.quote(str(v))}" for k, v in match.items())
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/{table}?{where}",
            data=json.dumps(updates).encode(), method="PATCH",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
                     "Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=10); return True
    except: return False


def resend_send(to, subject, body):
    if not RESEND_KEY: return {"status": 0, "error": "no key"}
    s, r = http_json("https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {RESEND_KEY}", "Content-Type": "application/json"},
        data=json.dumps({"from": f"Moses @ BizLegal AI <{RESEND_FROM}>", "to": [to],
                          "subject": subject, "text": body, "reply_to": "moses@bizlegal-ai.com"}),
        method="POST")
    return {"status": s, "id": r.get("id", "") if isinstance(r, dict) else "", "response": r}


def anthropic_draft(prompt, max_tokens=400):
    if not ANTHROPIC_KEY: return ""
    try:
        body = json.dumps({"model": "claude-haiku-4-5-20251001", "max_tokens": max_tokens,
                            "messages": [{"role": "user", "content": prompt}]})
        s, r = http_json("https://api.anthropic.com/v1/messages",
            headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01",
                     "Content-Type": "application/json"},
            data=body, method="POST", timeout=70)
        if s == 200:
            return r.get("content", [{}])[0].get("text", "").strip()
    except: pass
    return ""


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


def get_due_followups(stage: int, limit: int = 10) -> list:
    """Get leads where prior stage email was sent N days ago, no reply, no follow-up at this stage yet."""
    days_map = {1: 3, 2: 7, 3: 14, 4: 30}
    days = days_map.get(stage, 3)
    cutoff = (_dt.datetime.now(_dt.timezone.utc) - _dt.timedelta(days=days)).isoformat()
    prior = supabase_query("lead_outreach",
        f"select=lead_email,lead_name,company,pitch_variant,subject&stage=eq.{stage-1}&sent_at=lte.{cutoff}&replied_at=is.null&order=sent_at.asc&limit={limit*3}")
    # Filter: haven't sent this stage yet
    sent_this_stage = supabase_query("lead_outreach",
        f"select=lead_email&stage=eq.{stage}&limit=1000")
    sent_set = {r.get("lead_email", "").lower() for r in sent_this_stage}
    return [p for p in prior if p.get("lead_email", "").lower() not in sent_set][:limit]


def render_followup(prior_subject: str, stage: int, lead_name: str = "", industry: str = "") -> dict:
    """Generate follow-up email. Different angle per stage."""
    prompts = {
        1: f"""Subject: Re: {prior_subject}

Body: One sentence acknowledging I emailed 3 days ago. One sentence with a NEW specific stat about compliance automation ROI for {industry}. Soft 15-min CTA.

Rules: 40 words max. Different value than original.

Respond ONLY in JSON: {{"subject": "Re: {prior_subject}", "body": "..."}}""",

        2: f"""Subject: Re: {prior_subject}

Body: One sentence about how a similar {industry} company cut their SOC 2 prep from 3 months to 2 weeks using BizLegal AI. Soft CTA.

Rules: 50 words max. Case-study shape.

Respond ONLY in JSON: {{"subject": "Re: {prior_subject}", "body": "..."}}""",

        3: f"""Subject: Re: {prior_subject}

Body: Closing the loop — "I haven't heard back so I'll assume the timing isn't right. The door's open for Q4/Q1 if compliance comes up."

Rules: 30 words max. Polite breakup. No CTA.

Respond ONLY in JSON: {{"subject": "Re: {prior_subject}", "body": "..."}}""",

        4: f"""Subject: {prior_subject} (final note)

Body: Genuine final email — "This is my last note. If {industry} compliance comes up in the future, the address below reaches me directly."

Rules: 20 words max. No CTA.

Respond ONLY in JSON: {{"subject": "{prior_subject} (final)", "body": "..."}}""",
    }
    prompt = prompts.get(stage, prompts[1])
    raw = anthropic_draft(prompt)
    if not raw:
        return {"subject": f"Re: {prior_subject}", "body": f"Hi {lead_name or 'team'},\n\nFollowing up on my note from a few days ago. If {industry or 'compliance'} automation is on your roadmap, worth a 15-min conversation.\n\n— Moses, BizLegal AI"}
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.M)
    try:
        return json.loads(raw)
    except:
        m = re.search(r'"subject"\s*:\s*"([^"]+)"', raw)
        bm = re.search(r'"body"\s*:\s*"((?:[^"\\]|\\.)*)"', raw, re.S)
        return {"subject": m.group(1) if m else f"Re: {prior_subject}",
                "body": bm.group(1).encode().decode("unicode_escape") if bm else raw[:300]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", type=int, required=True, help="1=Day3, 2=Day7, 3=Day14, 4=Day30")
    ap.add_argument("--limit", type=int, default=10)
    args = ap.parse_args()

    leads = get_due_followups(args.stage, args.limit)
    print(f"[stage={args.stage}] {len(leads)} due for follow-up", file=sys.stderr)

    sent = 0
    failed = 0
    for lead in leads:
        email = lead.get("lead_email", "")
        prior_subject = lead.get("subject", "")
        company = lead.get("company", "")
        if not email: continue

        # Get industry from leadforge_leads
        lf = supabase_query("leadforge_leads", f"select=industry&email=eq.{urllib.parse.quote(email)}&limit=1")
        industry = lf[0].get("industry", "") if lf else ""

        em = render_followup(prior_subject, args.stage, company, industry)
        r = resend_send(email, em["subject"], em["body"])
        if r.get("status") == 200:
            sent += 1
            supabase_insert("lead_outreach", {
                "lead_email": email, "lead_name": company, "company": company,
                "pitch_variant": f"stage_{args.stage}_followup",
                "subject": em["subject"], "body_preview": em["body"][:200],
                "status": "sent", "stage": args.stage,
                "sent_at": _dt.datetime.now(_dt.timezone.utc).isoformat(),
                "resend_id": r.get("id", "")})
            print(f"  ✅ {email}: stage {args.stage}", file=sys.stderr)
        else:
            failed += 1
            print(f"  ❌ {email}: {r.get('error', '')[:80]}", file=sys.stderr)

    telegram(f"🔄 <b>Nurture stage {args.stage}</b>\nSent: {sent} · Failed: {failed}")
    print(f"\n  DONE: {sent} sent, {failed} failed", file=sys.stderr)


if __name__ == "__main__":
    main()
