"""
enterprise_closer_agent.py — High-ticket and enterprise deal machine.

Revenue paths covered:
  E2 — Outbound high-ticket ($2,500+/mo retainer + enterprise)
  E4 — OCI partner deals + deal room progression

What this does:
  Stage 1 — HIGH-TICKET PROPOSALS
    For each sales_lead with icp_score >= 75:
    • AI generates a bespoke ROI analysis (compliance cost without us vs with us)
    • Drafts a 3-paragraph executive proposal with specific use case + pricing
    • Writes to sales_outreach status='drafted' for Moses to review + send

  Stage 2 — ENTERPRISE PROPOSALS (icp_score >= 90)
    • Generates a full 5-section executive brief
    • Creates a deal_room entry for async negotiation
    • Sends Telegram alert so Moses can personalize before sending

  Stage 3 — DEAL ROOM PROGRESSION
    • deal_rooms status='new' > 24h → draft welcome + company overview
    • deal_rooms status='intro_sent' > 3 days → draft ROI follow-up
    • deal_rooms status='follow_up_sent' > 7 days → draft final close or "book a call"

  Stage 4 — PARTNERSHIP PIPELINE
    For each partner in partners table with status='prospect':
    • Draft co-marketing or referral proposal
    • Compliance consultants: rev-share proposal (20% referral on first 6 months)
    • Accounting networks: white-label embed proposal

All sends require Moses approval (status='drafted', never auto-sent).
Telegram alert on any icp_score >= 85.

Schedule: 09:00 UTC daily
"""
from __future__ import annotations
import json, os, sys, time, urllib.request, urllib.error, urllib.parse
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ── Env loading ────────────────────────────────────────────────────────────────
REPO = Path("/opt/bizlegal/curator") if Path("/opt/bizlegal/curator").exists() else Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))
sys.path.insert(0, str(REPO / "services" / "agents"))

_env_cache: dict = {}
for _src in [
    Path.home() / "Downloads" / "env-hub-bizlegal-ai.txt",
    REPO / ".env",
    Path("/opt/bizlegal/curator/.env"),
]:
    if _src.exists():
        with open(_src, encoding="utf-8", errors="replace") as _f:
            for _line in _f:
                _line = _line.strip()
                if _line and not _line.startswith("#") and "=" in _line:
                    _k, _v = _line.split("=", 1)
                    if _k not in _env_cache:
                        _env_cache[_k] = _v.strip().strip("'").strip('"')

def _e(k: str, default: str = "") -> str:
    return os.environ.get(k, _env_cache.get(k, default))

SUPABASE_URL   = _e("SUPABASE_URL").rstrip("/")
SUPABASE_KEY   = _e("SUPABASE_SERVICE_ROLE_KEY") or _e("SUPABASE_SERVICE_KEY") or _e("SUPABASE_SECRET")
ANTHROPIC_KEY  = _e("ANTHROPIC_API_KEY") or _e("ANTHROPIC_API_KEY_ENRICH")
TELEGRAM_TOKEN = _e("TELEGRAM_HUB_TOKEN")
TELEGRAM_CHAT  = _e("TELEGRAM_MOSES_CHAT_ID") or _e("TELEGRAM_HUB_CHAT_ID")
NOW_KEY        = _e("NOWPAYMENTS_API_KEY")
PAYPAL_ID      = _e("PAYPAL_CLIENT_ID")
PAYPAL_SECRET  = _e("PAYPAL_CLIENT_SECRET")
SITE_URL       = "https://bizlegal-ai.com"

WORKFLOW_ID = f"enterprise-closer-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M')}"

# Hard caps
MAX_PROPOSALS_PER_DAY = 5    # high-ticket proposals drafted
MAX_DEAL_ROOMS_PER_DAY = 3   # new deal rooms created


# ── Supabase helpers ──────────────────────────────────────────────────────────

def _sb_headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def sb(path: str, method: str = "GET", body=None, h_extra: dict | None = None):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    data = json.dumps(body).encode() if body is not None else None
    h = {**_sb_headers(), **(h_extra or {})}
    req = urllib.request.Request(url, data=data, method=method, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            txt = r.read().decode(errors="replace")
            return json.loads(txt) if txt and txt != "null" else ([] if method == "GET" else True)
    except urllib.error.HTTPError as e:
        print(f"  [sb-err] {method} {path}: HTTP {e.code} {e.read().decode()[:200]}")
        return None
    except Exception as e:
        print(f"  [sb-err] {method} {path}: {e}")
        return None


def sb_post(path: str, body: dict):
    return sb(path, "POST", body)


def sb_patch(path: str, body: dict) -> bool:
    return sb(path, "PATCH", body, {"Prefer": "return=minimal"}) is not None


def _log_run(action: str, status: str, details: dict) -> None:
    try:
        sb_post("agent_runs", {
            "agent_name": "enterprise_closer",
            "workflow_id": WORKFLOW_ID,
            "action": action,
            "status": status,
            "details": json.dumps(details)[:7800],
        })
    except Exception:
        pass


def _log_event(lead_id: str | None, outreach_id: str | None,
               event_type: str, details: dict, actor: str = "enterprise_closer") -> None:
    sb_post("sales_event", {
        "lead_id": lead_id, "outreach_id": outreach_id,
        "event_type": event_type, "details": details or {}, "actor": actor,
    })


def tg(msg: str) -> None:
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT:
        return
    try:
        urllib.request.urlopen(urllib.request.Request(
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
            data=json.dumps({"chat_id": TELEGRAM_CHAT, "text": msg[:3500]}).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        ), timeout=8)
    except Exception:
        pass


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def days_ago(n: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=n)).isoformat()


# ── Anthropic call ────────────────────────────────────────────────────────────

def ai_call(prompt: str, max_tokens: int = 1200, system: str = "") -> str:
    if not ANTHROPIC_KEY:
        return ""
    msgs = [{"role": "user", "content": prompt}]
    payload = {
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": max_tokens,
        "messages": msgs,
    }
    if system:
        payload["system"] = system
    try:
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            method="POST",
            headers={
                "x-api-key": ANTHROPIC_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            data=json.dumps(payload).encode(),
        )
        with urllib.request.urlopen(req, timeout=45) as r:
            resp = json.loads(r.read())
            return "".join(c.get("text", "") for c in resp.get("content", []) if c.get("type") == "text")
    except Exception as e:
        print(f"  [ai-err] {type(e).__name__}: {e}")
        return ""


# ── Suppression check ─────────────────────────────────────────────────────────

def is_suppressed(email: str) -> bool:
    res = sb(f"email_suppression_list?email=eq.{urllib.parse.quote(email.lower())}&limit=1")
    return isinstance(res, list) and len(res) > 0


# ── ROI Analysis Generator ────────────────────────────────────────────────────

COMPANY_PROFILES = {
    "fintech": {
        "compliance_fte_salary": 120000,
        "audit_cost_per_year": 45000,
        "penalty_risk_usd": 500000,
        "frameworks": ["GDPR", "PCI-DSS", "AML/KYC", "FinCEN BOI"],
    },
    "crypto": {
        "compliance_fte_salary": 140000,
        "audit_cost_per_year": 60000,
        "penalty_risk_usd": 1000000,
        "frameworks": ["VARA", "MiCA", "FinCEN", "FATF Travel Rule", "AML/KYC"],
    },
    "saas": {
        "compliance_fte_salary": 100000,
        "audit_cost_per_year": 30000,
        "penalty_risk_usd": 200000,
        "frameworks": ["GDPR", "CCPA", "SOC 2", "ISO 27001"],
    },
    "real_estate": {
        "compliance_fte_salary": 90000,
        "audit_cost_per_year": 25000,
        "penalty_risk_usd": 150000,
        "frameworks": ["FinCEN BOI", "FINCEN CIP", "AML"],
    },
    "law_firm": {
        "compliance_fte_salary": 130000,
        "audit_cost_per_year": 35000,
        "penalty_risk_usd": 300000,
        "frameworks": ["GDPR", "Client Confidentiality", "AML"],
    },
}


def _roi_context(lead: dict) -> str:
    industry = (lead.get("industry") or "saas").lower()
    profile = COMPANY_PROFILES.get(industry, COMPANY_PROFILES["saas"])
    cost_without = profile["compliance_fte_salary"] + profile["audit_cost_per_year"]
    cost_with = 2500 * 12  # $2,500/mo retainer
    savings = cost_without - cost_with
    return (
        f"Industry: {industry}\n"
        f"Typical FTE compliance cost: ${profile['compliance_fte_salary']:,}/yr\n"
        f"Typical annual audit cost: ${profile['audit_cost_per_year']:,}/yr\n"
        f"Penalty risk (top 3 frameworks): ${profile['penalty_risk_usd']:,}\n"
        f"Key frameworks: {', '.join(profile['frameworks'])}\n"
        f"Annual cost WITHOUT BizLegal: ~${cost_without:,}\n"
        f"Annual cost WITH BizLegal ($2,500/mo retainer): ${cost_with:,}\n"
        f"Net savings: ~${savings:,}/yr (not counting penalty risk reduction)"
    )


def generate_proposal(lead: dict, tier: str = "standard") -> tuple[str, str]:
    """Generate a bespoke proposal. Returns (subject, body)."""
    name = (lead.get("full_name") or "").split()[0] or "there"
    company = lead.get("company") or lead.get("company_domain") or "your company"
    industry = lead.get("industry") or "technology"
    jurisdiction = lead.get("jurisdiction") or "your jurisdiction"
    icp_score = lead.get("icp_score", 75)
    source = lead.get("source") or "inbound"
    signals = lead.get("intent_signals") or []
    signal_text = ""
    if isinstance(signals, list) and signals:
        sig = signals[0] if isinstance(signals[0], dict) else {}
        signal_text = f"Signal: {sig.get('type', 'inbound')} from {sig.get('source', 'our platform')}"
    roi_ctx = _roi_context(lead)

    if tier == "enterprise":
        system = (
            "You are Moses Dor, founder of BizLegal AI, a compliance-as-a-service firm. "
            "Write a 5-section executive proposal for a potential enterprise client. "
            "Tone: senior legal professional, specific, no fluff, no emojis. "
            "Under 350 words. Sections: Why Now, What We Offer, ROI Case, Proposed Next Step, P.S. note. "
            "Focus on the specific frameworks and risk vectors for their industry."
        )
        prompt = (
            f"Write an enterprise compliance proposal for:\n"
            f"Company: {company}\nIndustry: {industry}\nJurisdiction: {jurisdiction}\n"
            f"Contact: {name}\nICP Score: {icp_score}/100\n{signal_text}\n\n"
            f"ROI context:\n{roi_ctx}\n\n"
            f"Proposal product: $2,500/mo Managed Compliance Ops (includes 2-week free trial). "
            f"The proposed next step should be: reply to schedule a 15-min async Loom walkthrough "
            f"or a written Q&A exchange — NOT a live call unless they request it."
        )
    else:
        system = (
            "You are Moses Dor, founder of BizLegal AI. "
            "Write a concise, personalized 3-paragraph outreach for a high-ticket compliance lead. "
            "Tone: one compliance expert to another, direct, no corporate fluff. "
            "Under 200 words. End with ONE specific CTA (book a 15-min Loom call or reply to this email). "
            "Don't mention pricing in the first email — the goal is a reply."
        )
        prompt = (
            f"Write a personalized high-ticket outreach for:\n"
            f"Company: {company}\nIndustry: {industry}\nJurisdiction: {jurisdiction}\n"
            f"Contact: {name}\nICP Score: {icp_score}/100\n{signal_text}\n\n"
            f"Our service: $2,500/mo Managed Compliance Ops for B2B SaaS / fintech / crypto.\n"
            f"Key ROI point: {roi_ctx.split(chr(10))[5] if chr(10) in roi_ctx else roi_ctx}\n\n"
            f"Make it feel like Moses wrote it personally after researching {company}."
        )

    body_text = ai_call(prompt, max_tokens=800, system=system)
    if not body_text or len(body_text) < 100:
        # Template fallback
        profile = COMPANY_PROFILES.get(industry.lower(), COMPANY_PROFILES["saas"])
        frameworks = ", ".join(profile["frameworks"][:3])
        body_text = (
            f"Hi {name},\n\n"
            f"I came across {company} and wanted to reach out because of the compliance complexity "
            f"in the {industry} space — specifically around {frameworks}.\n\n"
            f"We run a managed compliance ops service for companies in this space. "
            f"The short version: we handle the ongoing monitoring, policy updates, and audit prep "
            f"for $2,500/mo — typically less than 2% of what a single compliance hire costs, "
            f"and you're not starting from scratch every time a framework updates.\n\n"
            f"Worth a 15-min async Loom overview? I can walk through what this looks like "
            f"for a {industry} company in {jurisdiction} specifically.\n\n"
            f"Best,\nMoses\nhttps://bizlegal-ai.com"
        )

    subject = f"Compliance ops for {company}: a specific question"
    if tier == "enterprise":
        subject = f"BizLegal AI — Compliance partnership proposal for {company}"

    return subject, body_text.strip()


# ── Stage 1: High-ticket Proposals ────────────────────────────────────────────

def stage_high_ticket(draft_count: list[int]) -> int:
    """Draft proposals for sales_lead with icp_score >= 75 and no pending outreach."""
    print("\n[Stage 1] High-ticket proposals (icp_score >= 75)")
    drafted = 0
    leads = sb(
        "sales_lead?icp_score=gte.75&icp_score=lt.90"
        "&status=in.(qualifying,new)"
        "&select=id,email,full_name,company,company_domain,industry,jurisdiction,icp_score,source,intent_signals,created_at"
        "&order=icp_score.desc&limit=20"
    )
    if not isinstance(leads, list):
        print("  no qualifying leads table")
        return 0

    for lead in leads:
        if draft_count[0] >= MAX_PROPOSALS_PER_DAY:
            break
        email = (lead.get("email") or "").lower().strip()
        if not email or is_suppressed(email):
            continue
        # Skip if already has outreach
        existing = sb(f"sales_outreach?lead_id=eq.{lead['id']}&select=id&limit=1")
        if isinstance(existing, list) and existing:
            continue
        # Only engage leads created > 4 hours ago (give intake time to settle)
        created = lead.get("created_at", "")
        try:
            age_h = (datetime.now(timezone.utc) - datetime.fromisoformat(created.replace("Z", "+00:00"))).total_seconds() / 3600
            if age_h < 4:
                continue
        except Exception:
            pass

        subject, body = generate_proposal(lead, tier="standard")
        res = sb_post("sales_outreach", {
            "lead_id": lead["id"],
            "channel": "email",
            "template": "high_ticket_intro",
            "subject": subject,
            "body": body,
            "status": "drafted",
            "suppression_checked": True,
        })
        if isinstance(res, list) and res:
            draft_count[0] += 1
            drafted += 1
            _log_event(lead["id"], res[0]["id"], "draft_generated",
                       {"tier": "standard", "icp_score": lead.get("icp_score"), "subject": subject[:80]})
            sb_patch(f"sales_lead?id=eq.{lead['id']}", {"status": "qualifying"})
            print(f"  DRAFTED high-ticket → {email[:40]} score={lead.get('icp_score')}")

    print(f"  Stage 1 done: {drafted} drafted")
    return drafted


# ── Stage 2: Enterprise Proposals ─────────────────────────────────────────────

def stage_enterprise(draft_count: list[int], deal_room_count: list[int]) -> int:
    """Full enterprise proposal + deal room creation for icp_score >= 90."""
    print("\n[Stage 2] Enterprise proposals (icp_score >= 90)")
    drafted = 0
    leads = sb(
        "sales_lead?icp_score=gte.90"
        "&status=in.(qualifying,new)"
        "&select=id,email,full_name,company,company_domain,industry,jurisdiction,icp_score,source,intent_signals"
        "&order=icp_score.desc&limit=10"
    )
    if not isinstance(leads, list):
        return 0

    for lead in leads:
        if draft_count[0] >= MAX_PROPOSALS_PER_DAY:
            break
        email = (lead.get("email") or "").lower().strip()
        if not email or is_suppressed(email):
            continue
        existing = sb(f"sales_outreach?lead_id=eq.{lead['id']}&select=id&limit=1")
        if isinstance(existing, list) and existing:
            continue

        subject, body = generate_proposal(lead, tier="enterprise")
        res = sb_post("sales_outreach", {
            "lead_id": lead["id"],
            "channel": "email",
            "template": "enterprise_proposal",
            "subject": subject,
            "body": body,
            "status": "drafted",
            "suppression_checked": True,
        })
        if isinstance(res, list) and res:
            draft_count[0] += 1
            drafted += 1
            _log_event(lead["id"], res[0]["id"], "draft_generated",
                       {"tier": "enterprise", "icp_score": lead.get("icp_score")})
            # Create deal room
            if deal_room_count[0] < MAX_DEAL_ROOMS_PER_DAY:
                import hashlib
                token = hashlib.sha256(f"{lead['email']}-{time.time()}".encode()).hexdigest()[:24]
                sb_post("deal_rooms", {
                    "token": token,
                    "lead_name": lead.get("full_name") or "",
                    "lead_email": email,
                    "company": lead.get("company") or lead.get("company_domain") or "",
                    "product": "managed_compliance_2500",
                    "score": lead.get("icp_score"),
                    "ai_summary": body[:500],
                    "status": "new",
                })
                deal_room_count[0] += 1
            # Telegram alert for enterprise
            tg(
                f"🔥 ENTERPRISE LEAD (score={lead.get('icp_score')})\n"
                f"Company: {lead.get('company', 'N/A')}\n"
                f"Email: {email}\n"
                f"Industry: {lead.get('industry', 'N/A')}\n"
                f"→ Check /sales to review & approve proposal"
            )
            print(f"  ENTERPRISE DRAFT → {email[:40]} score={lead.get('icp_score')}")

    print(f"  Stage 2 done: {drafted} enterprise proposals")
    return drafted


# ── Stage 3: Deal Room Progression ────────────────────────────────────────────

DEAL_STAGE_FLOWS = {
    "new": {
        "action": "draft welcome",
        "next_status": "intro_sent",
        "min_age_hours": 24,
        "template": "deal_room_welcome",
        "auto_advance": False,
    },
    "intro_sent": {
        "action": "draft ROI follow-up",
        "next_status": "follow_up_sent",
        "min_age_hours": 72,  # 3 days
        "template": "deal_room_roi",
        "auto_advance": False,
    },
    "follow_up_sent": {
        "action": "draft final close",
        "next_status": "final_sent",
        "min_age_hours": 168,  # 7 days
        "template": "deal_room_final",
        "auto_advance": False,
    },
}

DEAL_ROOM_TEMPLATES = {
    "deal_room_welcome": {
        "subject": "Your BizLegal AI compliance partnership overview",
        "body": """\
Hi {name},

Thanks for your interest in working with BizLegal AI.

I've put together a brief overview of what a compliance partnership would look like for {company}, based on the signals we have about your compliance needs:

**What we'd handle:**
• Monthly regulatory monitoring across your active frameworks ({frameworks})
• On-call policy review and redlining for inbound contracts
• Security questionnaire auto-response (using your existing policies)
• Quarterly compliance health score with priority recommendations

**The two engagement models:**
1. Self-serve ($97/scan for one-off reviews, $69/mo for unlimited DocAI)
2. Managed ops ($2,500/mo — we handle everything above, you get a monthly brief)

**Next step:**
Reply to this email with one question about your current compliance setup and I'll give you a direct, honest answer about whether we're the right fit.

I'm not trying to close you on the first email. I want to understand your specific situation first.

Best,
Moses
https://bizlegal-ai.com
""",
    },
    "deal_room_roi": {
        "subject": "ROI breakdown for {company}",
        "body": """\
Hi {name},

Following up on my last note — wanted to share a quick ROI breakdown specific to {company}.

**The math for a {industry} company:**

Without BizLegal:
• Compliance FTE (partial or full): $80K–$150K/yr
• Annual audit/advisory cost: $25K–$60K/yr
• Total: $105K–$210K/yr

With BizLegal ($2,500/mo = $30K/yr):
• Continuous monitoring + policy updates: included
• Contract review on-call: included
• Security questionnaire automation: included
• Savings: $75K–$180K/yr

What's not included: litigation support and regulatory filings (those stay with your lawyer). We handle the operational compliance layer so your legal team can focus on the high-value work.

If the math works, the next step is a 2-week free trial where we run your current compliance posture through our framework and give you a score + priority list. No contract required.

Interested? Reply "trial" and I'll set it up.

Best,
Moses
""",
    },
    "deal_room_final": {
        "subject": "Last note from BizLegal AI",
        "body": """\
Hi {name},

One final note on the compliance partnership discussion.

I know this may not be the right time — compliance investments often get delayed until there's a specific trigger (audit, enterprise deal requirement, regulatory change).

Two things I want to leave you with:

1. **The free snapshot** — if you ever want a 60-second compliance health score for {company}, it's always available at https://bizlegal-ai.com/snapshot. No sign-up, no pitch.

2. **The deal structure hasn't changed** — $2,500/mo, 2-week free trial, cancel any time. The offer stays open.

I'll stop following up after this. But if something changes on your end, just reply to any of my emails and we can pick it up.

Good luck with everything.

Best,
Moses
""",
    },
}


def stage_deal_rooms(draft_count: list[int]) -> int:
    """Progress deal rooms through their stage sequence."""
    print("\n[Stage 3] Deal room progression")
    progressed = 0
    deal_rooms = sb(
        "deal_rooms?status=in.(new,intro_sent,follow_up_sent)"
        "&select=id,token,lead_name,lead_email,company,product,score,ai_summary,status,created_at,updated_at"
        "&order=updated_at.asc&limit=20"
    )
    if not isinstance(deal_rooms, list):
        print("  no deal rooms")
        return 0

    for room in deal_rooms:
        if draft_count[0] >= MAX_PROPOSALS_PER_DAY:
            break
        status = room.get("status", "")
        flow = DEAL_STAGE_FLOWS.get(status)
        if not flow:
            continue
        # Check age
        updated = room.get("updated_at") or room.get("created_at", "")
        try:
            age_h = (datetime.now(timezone.utc) - datetime.fromisoformat(updated.replace("Z", "+00:00"))).total_seconds() / 3600
        except Exception:
            continue
        if age_h < flow["min_age_hours"]:
            continue
        email = (room.get("lead_email") or "").lower().strip()
        if not email or is_suppressed(email):
            continue
        name = (room.get("lead_name") or "").split()[0] or "there"
        company = room.get("company") or "your company"
        industry = "technology"  # default, could be enriched later
        tmpl = DEAL_ROOM_TEMPLATES.get(flow["template"], {})
        frameworks = "GDPR, SOC 2, FinCEN"  # default
        body = tmpl.get("body", "").format(
            name=name, company=company, industry=industry, frameworks=frameworks,
        )
        subject = tmpl.get("subject", "Follow-up from BizLegal AI").format(
            name=name, company=company,
        )
        # Save to sales_outreach
        lead_res = sb(f"sales_lead?email=eq.{urllib.parse.quote(email)}&select=id&limit=1")
        lead_id = None
        if isinstance(lead_res, list) and lead_res:
            lead_id = lead_res[0]["id"]
        else:
            new_lead = sb_post("sales_lead", {
                "email": email, "company": company,
                "source": "deal_room", "icp_score": room.get("score") or 70,
                "status": "qualifying",
            })
            if isinstance(new_lead, list) and new_lead:
                lead_id = new_lead[0]["id"]
        if lead_id:
            res = sb_post("sales_outreach", {
                "lead_id": lead_id,
                "channel": "email",
                "template": flow["template"],
                "subject": subject,
                "body": body,
                "status": "drafted",
                "suppression_checked": True,
            })
            if isinstance(res, list) and res:
                draft_count[0] += 1
                _log_event(lead_id, res[0]["id"], "draft_generated",
                           {"template": flow["template"], "deal_room": room["id"]})
        # Advance deal room status
        sb_patch(f"deal_rooms?id=eq.{room['id']}", {
            "status": flow["next_status"],
            "updated_at": now_iso(),
        })
        progressed += 1
        print(f"  DEAL ROOM → {company[:30]} {status}→{flow['next_status']} draft saved")
    print(f"  Stage 3 done: {progressed} deal rooms progressed")
    return progressed


# ── Stage 4: Partnership Pipeline ─────────────────────────────────────────────

def stage_partnerships(draft_count: list[int]) -> int:
    """Draft co-marketing / referral proposals for compliance consultant partners."""
    print("\n[Stage 4] Partnership pipeline")
    drafted = 0
    partners = sb(
        "partners?status=eq.prospect"
        "&select=id,email,name,company,vertical,notes,created_at"
        "&order=created_at.asc&limit=10"
    )
    if not isinstance(partners, list) or not partners:
        print("  no partner prospects in DB")
        return 0

    for partner in partners:
        if draft_count[0] >= MAX_PROPOSALS_PER_DAY:
            break
        email = (partner.get("email") or "").lower().strip()
        if not email or is_suppressed(email):
            continue
        # Check for existing outreach
        existing = sb(f"lead_outreach?lead_email=eq.{urllib.parse.quote(email)}&select=id&limit=1")
        if isinstance(existing, list) and existing:
            continue
        name = (partner.get("name") or "").split()[0] or "there"
        company = partner.get("company") or "your firm"
        vertical = partner.get("vertical") or "compliance advisory"

        body = (
            f"Hi {name},\n\n"
            f"I'm Moses, founder of BizLegal AI — we publish daily compliance briefs across 50+ jurisdictions "
            f"and run AI-powered contract review and compliance health scoring for B2B SaaS, fintech, and crypto firms.\n\n"
            f"I came across {company} and wanted to explore whether a referral or co-marketing arrangement "
            f"makes sense. Here's the short version:\n\n"
            f"• You refer clients who need compliance tech (contract review, security questionnaires, regulatory monitoring)\n"
            f"• We handle the tech layer, you keep the advisory relationship\n"
            f"• Rev share: 20% of first 6 months of any referred client's subscription\n\n"
            f"We're not trying to replace your firm — we handle the operational/tooling layer "
            f"so you can focus on the high-value advisory work.\n\n"
            f"If this is interesting, I can send a one-pager on how the referral program works. "
            f"Or if you'd prefer, just reply with a quick question and we can go from there.\n\n"
            f"Best,\nMoses\nhttps://bizlegal-ai.com"
        )
        subj = f"Compliance tech referral program — {company}"

        # Save to lead_outreach (not sales_outreach — this is a partner)
        ok = sb_post("lead_outreach", {
            "lead_email": email,
            "lead_name": name,
            "company": company,
            "subject": subj,
            "body_preview": body,
            "pitch_variant": "partner_referral",
            "status": "drafted",
            "agent_run_id": f"enterprise_closer-partner-{int(time.time())}",
        })
        if ok:
            sb_patch(f"partners?id=eq.{partner['id']}", {
                "status": "outreach_drafted",
            })
            draft_count[0] += 1
            drafted += 1
            print(f"  PARTNER DRAFT → {email[:40]} company={company}")

    print(f"  Stage 4 done: {drafted} partner drafts")
    return drafted


# ── Main ──────────────────────────────────────────────────────────────────────

def run() -> dict:
    started = time.time()
    print(f"\n=== enterprise_closer_agent @ {now_iso()} ===")
    print(f"  SUPABASE: {bool(SUPABASE_URL)}  ANTHROPIC: {bool(ANTHROPIC_KEY)}")
    print(f"  CAPS: proposals={MAX_PROPOSALS_PER_DAY}/day  deal_rooms={MAX_DEAL_ROOMS_PER_DAY}/day")
    if not SUPABASE_URL or not SUPABASE_KEY:
        return {"ok": False, "error": "supabase_missing"}

    draft_count = [0]
    deal_room_count = [0]
    results = {
        "high_ticket_drafted": stage_high_ticket(draft_count),
        "enterprise_drafted": stage_enterprise(draft_count, deal_room_count),
        "deal_rooms_progressed": stage_deal_rooms(draft_count),
        "partner_drafts": stage_partnerships(draft_count),
    }
    total = sum(results.values())
    results.update({
        "ok": True,
        "total_drafts": draft_count[0],
        "deal_rooms_created": deal_room_count[0],
        "total_actions": total,
        "duration_s": int(time.time() - started),
    })
    print(f"\n  DONE: drafts={draft_count[0]}  deal_rooms={deal_room_count[0]}  t={results['duration_s']}s")
    if total > 0:
        tg(
            f"💼 enterprise_closer: {draft_count[0]} proposals drafted\n"
            f"  HT:{results['high_ticket_drafted']} ENT:{results['enterprise_drafted']} "
            f"DR:{results['deal_rooms_progressed']} PRTNR:{results['partner_drafts']}\n"
            f"  → Review at bizlegal-ai.com/sales"
        )
    _log_run("enterprise_closer", "success", results)
    return results


if __name__ == "__main__":
    import sys as _sys
    result = run()
    _sys.exit(0 if result.get("ok") else 1)
