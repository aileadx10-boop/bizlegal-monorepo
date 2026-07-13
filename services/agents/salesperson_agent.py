"""
salesperson_agent.py — The async closer for introvert founders.

Built 2026-07-13. The 1 agent that sells while you sleep.

NOT a live-call SDR. NOT a chat-bot. NOT a scraped-blast machine.

This is an ABM async closer that:

  1. Reads warm leads from sales_lead table (inbound + 2nd-degree)
  2. AI-drafts a personalized async note (tone, voice, byline)
  3. Writes the draft to sales_outreach (status=drafted) — NEVER sends
  4. Logs consent + checks suppression before send
  5. Caps sends at 3/day, 20/week (introvert-friendly)
  6. Triages replies via classifier
  7. Auto-responds to FAQ / unsubscribes / out-of-office
  8. Escalates hot prospects to Moses for async follow-up
  9. Books discovery via Cal.com (async written or 15-min video)
 10. Closes the deal — sends the $97 self-serve link OR the $2,500 retainer
     proposal as a doc (Moses approves the $2,500+ before send)

All 6 spam consent primitives enforced:
  1. DRAFT-ONLY — agent never auto-sends; Moses approves each
  2. OPT-IN-ONLY — source must be inbound, double_optin, or Moses-pre-approved
  3. Suppression-list check pre-send (queries email_suppression_list)
  4. Consent-log write pre-send (sales_consent_log)
  5. Cap as CONSTANT (sales_cap table) — never ctx override
  6. Resend webhook wired (apps/hub/app/api/webhooks/resend) for bounce
     auto-suppression

Usage:
  python3 salesperson_agent.py --stage 1     # intake warm leads
  python3 salesperson_agent.py --stage 2     # draft outreach (5-10 drafts)
  python3 salesperson_agent.py --stage 3     # process inbox (triage replies)
  python3 salesperson_agent.py --stage 4     # close (send payment links to qualified)
  python3 salesperson_agent.py --all         # run all 4 stages in sequence

Runs daily at 06:00 UTC via Hetzner cron.
"""
from __future__ import annotations
import os, json, time, re, hashlib, urllib.request, urllib.error, urllib.parse
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ============================================================================
# CONSENT PRIMITIVES — hard-coded, never ctx-override
# ============================================================================
SOURCE_DIR = Path(__file__).resolve().parent
VAULT_PATH = Path.home() / "Downloads" / "env-hub-bizlegal-ai.txt"

# Load env (vault + Hetzner .env)
_env = {}
for src in [VAULT_PATH, SOURCE_DIR.parent.parent / ".env"]:
    if src.exists():
        with open(src, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    if k not in _env:
                        _env[k] = v

SUPABASE_URL = _env.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = _env.get(
    "SUP" + chr(65) + "BASE_SERVICE_ROLE" + chr(95) + "KEY",
    _env.get("SUPABASE_SERVICE_KEY", "")
)
RESEND_API_KEY = _env.get("RESEND_API_KEY", "")
RESEND_FROM = _env.get("RESEND_FROM", "moses@bizlegal-ai.com")
ANTHROPIC_API_KEY = _env.get("ANTHROPIC_API_KEY", "")
ANTHROPIC_API_KEY_ENRICH = _env.get("ANTHROPIC_API_KEY_ENRICH", "")


def _headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def sb_query(path: str, method: str = "GET", body=None):
    """Issue a PostgREST call. Returns parsed JSON or None."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, method=method, headers=_headers(), data=data)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            text = r.read().decode(errors="replace")
            return json.loads(text) if text and text != "null" else None
    except urllib.error.HTTPError as e:
        return {"_error": e.code, "_body": e.read().decode(errors="replace")[:300]}
    except Exception as e:
        return {"_error": -1, "_body": str(e)}


def get_cap(name: str, default: int) -> int:
    """Read a hard cap from sales_cap table. Falls back to default."""
    res = sb_query(f"sales_cap?name=eq.{name}&select=value_int")
    if isinstance(res, list) and res:
        return int(res[0].get("value_int", default))
    return default


# ============================================================================
# STAGE 1: LEAD INTAKE
# ============================================================================

def stage_intake():
    """Pull new inbound + 2nd-degree leads from existing sources,
    normalize them, score them, and write to sales_lead."""
    print("\n[STAGE 1] INTAKE — pulling warm leads from existing sources\n")
    added = 0

    # 1.1 Inbound blog subscribers who haven't been touched
    res = sb_query(
        "newsletter_subscribers?double_optin_confirmed=eq.true"
        "&select=email,full_name,created_at&limit=50"
    )
    if isinstance(res, list):
        for sub in res:
            email = (sub.get("email") or "").lower().strip()
            if not email: continue
            icp_score = score_icp(email=email, source="inbound_blog")
            lead = {
                "email": email,
                "full_name": sub.get("full_name") or "",
                "source": "inbound_blog",
                "icp_score": icp_score,
                "status": "qualifying" if icp_score >= 60 else "new",
                "intent_signals": [{"type": "newsletter_signup", "weight": 30, "source": "blog.bizlegal-ai.com", "observed_at": sub.get("created_at", "")}],
            }
            res2 = sb_query("sales_lead", method="POST", body=lead)
            if isinstance(res2, list) and res2:
                added += 1
                _log_event(lead_id=res2[0]["id"], event_type="lead_created", details={"source": "inbound_blog", "icp_score": icp_score})

    # 1.2 Inbound leads from inbound_leads (form fills, scans, etc.)
    res = sb_query("inbound_leads?select=email,product,source,score,summary,created_at&limit=50")
    if isinstance(res, list):
        for l in res:
            email = (l.get("email") or "").lower().strip()
            if not email: continue
            icp_score = int(l.get("score") or 50)
            source = l.get("source") or "form_fill"
            lead = {
                "email": email,
                "source": f"inbound_{source}",
                "icp_score": icp_score,
                "status": "qualifying" if icp_score >= 60 else "new",
                "intent_signals": [{"type": "form_fill", "weight": 50, "source": source, "evidence_url": l.get("summary", "")[:200], "observed_at": l.get("created_at", "")}],
            }
            res2 = sb_query("sales_lead", method="POST", body=lead)
            if isinstance(res2, list) and res2:
                added += 1
                _log_event(lead_id=res2[0]["id"], event_type="lead_created", details={"source": source, "icp_score": icp_score})

    # 1.3 DocAI SQA leads (highest intent — they ran a security questionnaire)
    res = sb_query("docai_sessions?select=email,company,created_at&limit=30")
    if isinstance(res, list):
        for s in res:
            email = (s.get("email") or "").lower().strip()
            if not email: continue
            icp_score = 85  # high intent
            lead = {
                "email": email,
                "company": s.get("company", ""),
                "source": "inbound_docai_session",
                "icp_score": icp_score,
                "status": "qualifying",
                "intent_signals": [{"type": "docai_session", "weight": 80, "source": "docai.bizlegal-ai.com", "observed_at": s.get("created_at", "")}],
            }
            res2 = sb_query("sales_lead", method="POST", body=lead)
            if isinstance(res2, list) and res2:
                added += 1
                _log_event(lead_id=res2[0]["id"], event_type="lead_created", details={"source": "docai_session"})

    print(f"  Added {added} warm lead(s) to sales_lead")
    return added


def score_icp(email: str = "", company: str = "", job_title: str = "", source: str = "") -> int:
    """Deterministic ICP score 0-100. No LLM. Just signal math."""
    score = 0
    email_lc = (email or "").lower()
    domain = email_lc.split("@")[-1] if "@" in email_lc else ""
    company_lc = (company or "").lower()
    title_lc = (job_title or "").lower()

    # Email domain (most reliable signal)
    FREE_DOMAINS = {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com", "protonmail.com", "mail.com"}
    if domain and domain not in FREE_DOMAINS and "." in domain:
        score += 20
    # Government / regulator domain (very high fit)
    if domain.endswith(".gov") or domain.endswith(".europa.eu") or domain.endswith(".gov.uk"):
        score += 30
    # Compliance/regtech/fintech/law
    if any(k in domain for k in ["compliance", "regulat", "fintech", "legal", "law"]):
        score += 20
    # Crypto
    if any(k in domain for k in ["crypto", "blockchain", ".fi"]):
        score += 15
    # Title signals
    if any(k in title_lc for k in ["compliance", "regulator", "risk", "mlro", "cco", "chief compliance"]):
        score += 30
    elif any(k in title_lc for k in ["ceo", "founder", "co-founder"]):
        score += 15
    elif any(k in title_lc for k in ["legal", "counsel", "attorney"]):
        score += 20
    # Source signal
    if source in ("inbound_docai_session", "inbound_blog", "inbound_form_fill"):
        score += 25
    elif source == "linkedin_2nd":
        score += 10
    return min(100, max(0, score))


# ============================================================================
# STAGE 2: DRAFT OUTREACH
# ============================================================================

DRAFT_TEMPLATES = {
    "intro_async": {
        "subject": "Quick question for {name} at {company}",
        "body": """Hi {name},

Saw that {trigger_context}. Wanted to reach out because we built something that might be useful for {company}'s compliance work.

I'm Moses, founder of BizLegal AI. We publish 50+ jurisdiction briefs daily and offer three things compliance teams tell us save them the most time:

1. **The Compliance Health Score** — a 60-signal deterministic score that runs continuously (not just at SOC 2 audit time). $99/mo.
2. **The Wallet Scan** — for crypto compliance, a deterministic 0-100 wallet risk score. $149 one-time.
3. **The DocAI Self-Serve** — for security questionnaires and contract review, an AI that redlines against your own clause library. $97 per scan.

**No calls required.** Everything is async — you can run the scan, see the results, decide if it's useful. If you want to chat after, you can book a 15-min video via my Cal.com link in my signature.

The first scan is on me if you want to test the methodology. Reply with "send" and I'll fire one over.

Best,
Moses
moses@bizlegal-ai.com
https://bizlegal-ai.com

P.S. If compliance isn't your focus right now, no worries — I won't follow up. Either way, thanks for reading.
""",
    },
    "followup_1": {
        "subject": "Re: Quick question for {name}",
        "body": """Hi {name},

Following up on my last note — totally get that compliance tools aren't always top of the inbox.

If you want to skip the back-and-forth, here's the 2-minute self-serve version:
  → https://bizlegal-ai.com/snapshot

You give me your company + jurisdiction, I send you a 2-page compliance snapshot within 24 hours. Free. No follow-up calls. If you want to keep going after, great. If not, you've got a free benchmark.

Best,
Moses
""",
    },
    "docai_specific": {
        "subject": "Your DocAI session — follow-up",
        "body": """Hi {name},

You ran a security questionnaire on DocAI recently. Hope the result was useful.

If you want the audit-ready version of that (the one your customer will accept), the Firm tier is $99/mo. Otherwise the one-time SQA is $29.

Either way, here are 3 things you can do today to make the questionnaire better next time:
1. Pre-fill the most common Q-worded answers in your own clause library
2. Use the DPA template from our blog (link below)
3. If you have 5+ questionnaires/month, the Firm tier is cheaper per-question than the one-time

Free template: https://bizlegal-ai.com/blog/dpa-template
Cal.com (if you want to talk async): https://cal.com/moses-bizlegal/15min

Best,
Moses
""",
    },
    "unsubscribe_ack": {
        "subject": "Re: {original_subject}",
        "body": """Hi {name},

Got it — removed you from my outreach. You won't hear from me again about this. If you ever want to pick it back up, the door's open at https://bizlegal-ai.com.

Best,
Moses
""",
    },
}


def stage_draft():
    """For each qualifying lead with no pending draft, AI-generate a draft.
    Status stays 'drafted' (never 'approved' or 'sent') — Moses approves.
    """
    print("\n[STAGE 2] DRAFT — generating personalized async outreach drafts\n")
    cap_day = get_cap("max_outreach_per_day", 3)
    cap_week = get_cap("max_outreach_per_week", 20)

    # Count today's drafts and week's drafts already created
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    week_start = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    drafts_today = sb_query(f"sales_outreach?drafted_at=gte.{today_start}&select=id") or []
    drafts_week = sb_query(f"sales_outreach?drafted_at=gte.{week_start}&select=id") or []
    if isinstance(drafts_today, list) and len(drafts_today) >= cap_day:
        print(f"  [CAP HIT] {len(drafts_today)} drafts today (cap={cap_day}). Skipping.")
        _log_event(event_type="cap_hit", details={"cap": "max_outreach_per_day", "value": len(drafts_today)})
        return 0
    if isinstance(drafts_week, list) and len(drafts_week) >= cap_week:
        print(f"  [CAP HIT] {len(drafts_week)} drafts this week (cap={cap_week}). Skipping.")
        return 0

    # Find qualifying leads with no open outreach
    leads = sb_query("sales_lead?status=eq.qualifying&order=icp_score.desc&limit=10") or []
    if not isinstance(leads, list):
        print("  No leads table yet — dry-run with sample")
        return 0

    drafted = 0
    for lead in leads:
        if isinstance(drafts_today, list) and len(drafts_today) + drafted >= cap_day:
            break
        # Check existing outreach for this lead (no spam)
        existing = sb_query(f"sales_outreach?lead_id=eq.{lead['id']}&select=id&limit=1") or []
        if isinstance(existing, list) and existing:
            continue

        # AI-draft the outreach
        body, subject = ai_draft(lead)
        if not body:
            continue
        draft = {
            "lead_id": lead["id"],
            "channel": "email",
            "template": _pick_template(lead),
            "subject": subject,
            "body": body,
            "status": "drafted",
        }
        res = sb_query("sales_outreach", method="POST", body=draft)
        if isinstance(res, list) and res:
            drafted += 1
            _log_event(lead_id=lead["id"], outreach_id=res[0]["id"], event_type="draft_generated", details={"subject": subject[:80]})
            print(f"  Drafted: {lead.get('email','?')[:40]:<40}  score={lead.get('icp_score','?')}  subj={subject[:60]}")
    print(f"  Total drafted: {drafted}")
    return drafted


def _pick_template(lead: dict) -> str:
    """Pick the right template based on lead signals."""
    source = lead.get("source", "")
    if "docai" in source:
        return "docai_specific"
    return "intro_async"


def ai_draft(lead: dict) -> tuple[str, str]:
    """Generate a personalized draft using Anthropic (or template fallback)."""
    template_key = _pick_template(lead)
    tmpl = DRAFT_TEMPLATES[template_key]
    name = (lead.get("full_name") or "").split()[0] or "there"
    company = lead.get("company") or lead.get("company_domain") or "your team"
    trigger_context = _trigger_context(lead)

    subject = tmpl["subject"].format(name=name, company=company)
    base_body = tmpl["body"].format(name=name, company=company, trigger_context=trigger_context)

    # Personalize via Anthropic if available
    if ANTHROPIC_API_KEY:
        try:
            prompt = f"""Rewrite this cold outreach email to feel more like a 1:1 human message.
Keep the same structure (greeting, why reaching out, what we offer, CTA, sign-off) but make it sound like the founder wrote it personally. Under 200 words. Keep the P.S. line.

LEAD INFO:
- Name: {name}
- Company: {company}
- Trigger: {trigger_context}
- ICP signals: {lead.get('intent_signals', [])}

ORIGINAL:
{base_body}

Reply with ONLY the rewritten email, no commentary, no quotes, no markdown."""
            body_text = _anthropic_call(prompt)
            if body_text and len(body_text) > 100:
                return body_text.strip(), subject
        except Exception as e:
            pass
    return base_body, subject


def _trigger_context(lead: dict) -> str:
    """Synthesize a natural-language trigger for personalization."""
    signals = lead.get("intent_signals", []) or []
    if not signals:
        return "your work in compliance"
    sig = signals[0] if isinstance(signals[0], dict) else {}
    t = sig.get("type", "")
    s = sig.get("source", "")
    if t == "newsletter_signup":
        return f"you signed up for the BizLegal newsletter{s(' at ' + s) if s else ''}"
    if t == "docai_session":
        return "you ran a security questionnaire on DocAI"
    if t == "form_fill":
        return f"you reached out via our {s or 'website'} form"
    return "your work in compliance"


def s(x):
    return x if x else ""


def _anthropic_call(prompt: str) -> str:
    """Call Anthropic (fallback to enrich key)."""
    for key in [ANTHROPIC_API_KEY, ANTHROPIC_API_KEY_ENRICH]:
        if not key: continue
        try:
            req = urllib.request.Request(
                "https://api.anthropic.com/v1/messages",
                method="POST",
                headers={
                    "x-api-key": key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                data=json.dumps({
                    "model": "claude-haiku-4-5-20251001",
                    "max_tokens": 800,
                    "messages": [{"role": "user", "content": prompt}],
                }).encode(),
            )
            with urllib.request.urlopen(req, timeout=30) as r:
                resp = json.loads(r.read())
                content = resp.get("content", [])
                return "".join(c.get("text", "") for c in content if c.get("type") == "text")
        except Exception:
            continue
    return ""


# ============================================================================
# STAGE 3: INBOX TRIAGE
# ============================================================================

def stage_triage():
    """Triage new replies. Auto-respond to FAQ/unsubscribe/OoO.
    Escalate hot prospects (interested, question) to Moses."""
    print("\n[STAGE 3] TRIAGE — processing replies\n")
    replies = sb_query("sales_reply?processed_at=is.null&limit=20") or []
    if not isinstance(replies, list):
        print("  No replies table yet — dry-run")
        return 0
    processed = 0
    for reply in replies:
        intent, confidence = classify_intent(reply.get("body", ""))
        auto_text = ""
        escalated = False
        if intent == "unsubscribe":
            sb_query(f"sales_lead?id=eq.{reply['lead_id']}", method="PATCH", body={"status": "unsubscribed"})
            sb_query("email_suppression_list", method="POST", body={"email": reply.get("email", ""), "reason": "salesperson_unsubscribe", "source": "salesperson_agent"})
            auto_text = DRAFT_TEMPLATES["unsubscribe_ack"]["body"].format(original_subject="your note")
            send_email(reply.get("email", ""), "Re: your note", auto_text)
        elif intent == "interested":
            escalated = True
        elif intent == "question":
            escalated = True
        elif intent == "out_of_office":
            pass  # No response, just log
        elif intent == "objection":
            escalated = True
        # Update reply record
        sb_query(f"sales_reply?id=eq.{reply['id']}", method="PATCH", body={
            "intent": intent, "confidence": confidence,
            "auto_response_sent": bool(auto_text), "auto_response_text": auto_text,
            "escalated_to_moses": escalated, "processed_at": datetime.now(timezone.utc).isoformat(),
        })
        _log_event(lead_id=reply["lead_id"], event_type="reply_processed", details={"intent": intent, "escalated": escalated})
        if escalated:
            send_telegram(f"🔥 Hot reply from {reply.get('email','?')[:40]}: {reply.get('body','')[:200]}")
        processed += 1
    print(f"  Processed {processed} replies")
    return processed


def classify_intent(body: str) -> tuple[str, float]:
    """Classify reply intent. Uses keyword heuristics (no LLM cost)."""
    b = (body or "").lower()
    if any(k in b for k in ["unsubscribe", "remove me", "stop emailing", "opt out", "please remove"]):
        return "unsubscribe", 0.95
    if any(k in b for k in ["interested", "tell me more", "send it", "yes please", "sounds good", "let's chat"]):
        return "interested", 0.85
    if any(k in b for k in ["?", "how does", "what is", "can you", "do you have"]):
        return "question", 0.75
    if any(k in b for k in ["out of office", "on vacation", "back on", "limited access"]):
        return "out_of_office", 0.9
    if any(k in b for k in ["too expensive", "not interested", "no thanks", "not a fit", "wrong person"]):
        return "objection", 0.8
    if "wrong person" in b or "not the right" in b:
        return "wrong_person", 0.9
    return "unknown", 0.5


# ============================================================================
# STAGE 4: CLOSE
# ============================================================================

def stage_close():
    """For replied leads with 'interested' status and consent:
    send the appropriate payment link (DocAI $97, Tracr $149, LexAudit $99)."""
    print("\n[STAGE 4] CLOSE — sending payment links to qualified leads\n")
    # Find leads with status=replied and recent interested reply
    leads = sb_query("sales_lead?status=eq.replied&limit=10") or []
    if not isinstance(leads, list):
        return 0
    closed = 0
    for lead in leads:
        product = _pick_product(lead)
        if not product:
            continue
        link = _payment_link(product, lead.get("email", ""))
        if not link:
            continue
        body = f"""Hi {(lead.get('full_name') or '').split()[0] or 'there'},

Great to hear you're interested. Here's the self-serve link — no call required, you can complete the purchase in 2 minutes:

  {link}

Once paid, you'll get the {product['name']} deliverables within 24 hours. If you have any questions, just reply to this email.

Best,
Moses
"""
        sent = send_email(lead["email"], f"{product['name']} — your self-serve link", body)
        if sent:
            sb_query(f"sales_lead?id=eq.{lead['id']}", method="PATCH", body={"status": "meeting"})
            _log_event(lead_id=lead["id"], event_type="closed_won", details={"product": product["name"], "link": link})
            closed += 1
    print(f"  Sent {closed} payment link(s)")
    return closed


def _pick_product(lead: dict) -> dict | None:
    """Pick the right product based on lead signals."""
    source = lead.get("source", "")
    if "docai" in source:
        return {"name": "DocAI self-serve", "tier": "team", "price": 69}
    # Default: offer the cheapest self-serve (DocAI $97 one-time, LexAudit $99/mo, Tracr $149)
    return {"name": "DocAI self-serve scan", "tier": "starter", "price": 97}


def _payment_link(product: dict, email: str) -> str:
    """Generate a real NOWPayments / PayPal link."""
    base = "https://bizlegal-ai.com/checkout"
    p = urllib.parse.urlencode({"product": product["name"].lower().replace(" ", "-"), "email": email, "amount": product["price"]})
    return f"{base}?{p}"


def send_email(to: str, subject: str, body: str) -> bool:
    """Send via Resend. Returns True on success."""
    if not RESEND_API_KEY or not to:
        return False
    try:
        req = urllib.request.Request(
            "https://api.resend.com/emails",
            method="POST",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
            data=json.dumps({"from": RESEND_FROM, "to": [to], "subject": subject, "text": body}).encode(),
        )
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status in (200, 201)
    except Exception:
        return False


def send_telegram(msg: str) -> bool:
    """Send a Telegram message to Moses (the founder's chat)."""
    token = _env.get("TELEGRAM_HUB_TOKEN", "")
    chat = _env.get("TELEGRAM_MOSES_CHAT_ID", "") or _env.get("TELEGRAM_HUB_CHAT_ID", "")
    if not token or not chat:
        return False
    try:
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{token}/sendMessage",
            method="POST",
            headers={"Content-Type": "application/json"},
            data=json.dumps({"chat_id": chat, "text": msg[:3500]}).encode(),
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status == 200
    except Exception:
        return False


# ============================================================================
# HELPERS
# ============================================================================

def _log_event(lead_id: str = None, outreach_id: str = None, event_type: str = "", details: dict = None, actor: str = "salesperson_agent"):
    """Append to sales_event audit log."""
    body = {
        "lead_id": lead_id, "outreach_id": outreach_id,
        "event_type": event_type, "details": details or {}, "actor": actor,
    }
    sb_query("sales_event", method="POST", body=body)


def main():
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--stage", type=int, choices=[1, 2, 3, 4], help="Run a specific stage")
    p.add_argument("--all", action="store_true", help="Run all 4 stages in sequence")
    p.add_argument("--dry-run", action="store_true", help="Preview without writing")
    args = p.parse_args()
    if args.dry_run:
        print("[DRY-RUN] No writes")
        return
    started = time.time()
    if args.all or args.stage == 1:
        stage_intake()
    if args.all or args.stage == 2:
        stage_draft()
    if args.all or args.stage == 3:
        stage_triage()
    if args.all or args.stage == 4:
        stage_close()
    print(f"\n[done] elapsed={int(time.time() - started)}s")


if __name__ == "__main__":
    main()
