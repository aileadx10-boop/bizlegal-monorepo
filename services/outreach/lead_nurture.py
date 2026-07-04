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

Also carries the deal_room sequence (--sequence deal_room): day-1/3/7 nudges
for open/viewed deal_rooms rows (qualifier chat -> private deal room funnel,
decisions/REVENUE-MACHINE-24-7-2026-07-04.md). Send-tracking rides the same
lead_outreach table (pitch_variant=deal_room_day{1,3,7}, stage=90+day so the
stage-0..4 cold sequence queries never see these rows).

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


# ──────────────────────────────────────────────────────────────────────────
# deal_room sequence — day 1 / 3 / 7 nudges for open deal rooms
# ──────────────────────────────────────────────────────────────────────────
DEAL_ROOM_DAYS = (1, 3, 7)
DEAL_ROOM_TIER_LABELS = {"pilot": "Pilot", "build": "Build", "flagship": "Flagship"}


def get_due_deal_room_nudges(limit: int = 10) -> list:
    """Rooms in open/viewed (never paid/expired) with the highest due, unsent nudge.

    Dedupe rides lead_outreach exactly like the cold stages: one row per
    send, keyed by pitch_variant=deal_room_day{d} + lead_email.
    """
    now = _dt.datetime.now(_dt.timezone.utc)
    rooms = supabase_query("deal_rooms",
        "select=token,email,offer_tier,price_usd,status,expires_at,created_at"
        "&status=in.(open,viewed)&order=created_at.asc&limit=300")
    sent_by_day = {}
    for d in DEAL_ROOM_DAYS:
        rows = supabase_query("lead_outreach",
            f"select=lead_email&pitch_variant=eq.deal_room_day{d}&limit=1000")
        sent_by_day[d] = {r.get("lead_email", "").lower() for r in rows}

    due = []
    for room in rooms:
        email = (room.get("email") or "").lower()
        if not email:
            continue
        try:
            created = _dt.datetime.fromisoformat(str(room.get("created_at", "")).replace("Z", "+00:00"))
            expires = _dt.datetime.fromisoformat(str(room.get("expires_at", "")).replace("Z", "+00:00"))
        except Exception:
            continue
        if expires <= now:  # belt-and-braces; /api/deal flips these to expired lazily
            continue
        age_days = (now - created).days
        pending = [d for d in DEAL_ROOM_DAYS if age_days >= d and email not in sent_by_day[d]]
        if not pending:
            continue
        due.append((room, max(pending)))  # one email per room per run — the latest due step
        if len(due) >= limit:
            break
    return due


def render_deal_room_email(day: int, room: dict) -> dict:
    """Static templates — the scope already lives in the room; nudges just point back."""
    tier = DEAL_ROOM_TIER_LABELS.get(room.get("offer_tier", ""), "Custom")
    price = f"${int(room.get('price_usd', 0)):,}"
    link = f"https://bizlegal-ai.com/deal/{room.get('token', '')}"
    try:
        expires = _dt.datetime.fromisoformat(str(room.get("expires_at", "")).replace("Z", "+00:00"))
        expires_label = expires.strftime("%B %d")
    except Exception:
        expires_label = "in 14 days"

    if day == 1:
        return {"subject": "I scoped this for you — your deal room",
                "body": (f"Hi,\n\nFollowing up on your conversation with our async consultant — I reviewed the "
                         f"transcript and put together a fixed-price scope for your build: Custom Build ({tier}), "
                         f"{price} one-time.\n\nEverything is in your private deal room (scope, FAQ, payment):\n"
                         f"{link}\n\nThe room is private to you and holds the price until {expires_label}. "
                         f"If the scope is off anywhere, just reply — I adjust it before you pay anything.\n\n"
                         f"— Moses, BizLegal AI")}
    if day == 3:
        return {"subject": f"Re: your {tier} scope — the two questions everyone asks",
                "body": (f"Hi,\n\nTwo things people usually want to know before opening the room:\n\n"
                         f"1) \"Why no call?\" We run fully async — scoping, delivery, and support all arrive in "
                         f"text. That's how a scoped {tier} build stays at {price} instead of agency rates, and "
                         f"you get a written record of every decision.\n\n"
                         f"2) \"How do I know it pays off?\" The scope only contains workflows you told us are "
                         f"eating hours today. Price the hours; if the math doesn't clear in a quarter, don't buy.\n\n"
                         f"Your scope and pricing: {link}\n\nReply with anything that looks wrong and I'll rework "
                         f"it.\n\n— Moses, BizLegal AI")}
    return {"subject": f"Your deal room closes {expires_label}",
            "body": (f"Hi,\n\nLast note on this. Your Custom Build ({tier}) room — scope and {price} fixed price — "
                     f"expires on {expires_label}:\n{link}\n\nAfter that the scope goes stale and we'd re-qualify "
                     f"from scratch. If the timing is simply wrong, reply and tell me — no hard feelings, and the "
                     f"door stays open for next quarter.\n\n— Moses, BizLegal AI")}


def run_deal_room_sequence(limit: int = 10):
    due = get_due_deal_room_nudges(limit)
    print(f"[deal_room] {len(due)} nudges due", file=sys.stderr)
    sent = 0
    failed = 0
    for room, day in due:
        email = room.get("email", "")
        em = render_deal_room_email(day, room)
        r = resend_send(email, em["subject"], em["body"])
        if r.get("status") == 200:
            sent += 1
            supabase_insert("lead_outreach", {
                "lead_email": email, "lead_name": "", "company": "",
                "pitch_variant": f"deal_room_day{day}",
                "subject": em["subject"], "body_preview": em["body"][:200],
                "status": "sent", "stage": 90 + day,  # 91/93/97 — outside the 0-4 cold-stage space
                "sent_at": _dt.datetime.now(_dt.timezone.utc).isoformat(),
                "resend_id": r.get("id", "")})
            print(f"  ✅ {email}: deal_room day {day}", file=sys.stderr)
        else:
            failed += 1
            print(f"  ❌ {email}: {str(r.get('error', r.get('response', '')))[:80]}", file=sys.stderr)
    telegram(f"💼 <b>Deal-room nudges</b>\nSent: {sent} · Failed: {failed}")
    print(f"\n  DONE: {sent} sent, {failed} failed", file=sys.stderr)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", type=int, help="1=Day3, 2=Day7, 3=Day14, 4=Day30 (cold sequence)")
    ap.add_argument("--sequence", choices=["stages", "deal_room"], default="stages",
                    help="stages = existing cold follow-ups (needs --stage); deal_room = day-1/3/7 deal-room nudges")
    ap.add_argument("--limit", type=int, default=10)
    args = ap.parse_args()

    if args.sequence == "deal_room":
        run_deal_room_sequence(args.limit)
        return
    if args.stage is None:
        ap.error("--stage is required when --sequence=stages")

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
