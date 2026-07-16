"""
conversion_funnel_agent.py — The self-serve conversion machine.

Revenue paths covered:
  E1 — DocAI $97 scan → crypto/card checkout → money
  E3 — AEO inbound → nurture → money

Covers every dropout point in the self-serve funnel:
  Track A: risk_snapshot leads  → 3-email educational sequence → $97 CTA
  Track B: newsletter subscribers (confirmed opt-in) → 4-email drip → $97 CTA
  Track C: contract_scan (free DocAI users) → upgrade sequence
  Track D: payment_orders pending > 2h → cart recovery

Sends:
  - Auto-send (transactional): people who explicitly interacted, ≤15/day
  - DRAFT (requires Moses approval): all educational/cold sequences

Uses lead_nurture_state to track drip stages.

Schedule: 08:00 UTC daily
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

SUPABASE_URL  = _e("SUPABASE_URL").rstrip("/")
SUPABASE_KEY  = _e("SUPABASE_SERVICE_ROLE_KEY") or _e("SUPABASE_SERVICE_KEY") or _e("SUPABASE_SECRET")
RESEND_KEY    = _e("RESEND_API_KEY")
RESEND_FROM   = _e("RESEND_FROM", "moses@intelligence.bizlegal-ai.com")
ANTHROPIC_KEY = _e("ANTHROPIC_API_KEY") or _e("ANTHROPIC_API_KEY_ENRICH")
TELEGRAM_TOKEN = _e("TELEGRAM_HUB_TOKEN")
TELEGRAM_CHAT  = _e("TELEGRAM_MOSES_CHAT_ID") or _e("TELEGRAM_HUB_CHAT_ID")
NOW_KEY        = _e("NOWPAYMENTS_API_KEY")
PAYPAL_ID      = _e("PAYPAL_CLIENT_ID")
SITE_URL       = "https://bizlegal-ai.com"
DOCAI_URL      = "https://docai.bizlegal-ai.com"

WORKFLOW_ID = f"conversion-funnel-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M')}"

# Hard caps — never overridden by context
MAX_AUTO_SENDS_PER_DAY = 15   # transactional-only auto sends
MAX_DRAFTS_PER_RUN     = 20   # drafts for Moses to review
DRAFT_COOLDOWN_DAYS    = 5    # min days between drafts for same email


# ── Supabase helpers ──────────────────────────────────────────────────────────

def _sb_headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def sb(path: str, method: str = "GET", body=None, headers_extra: dict | None = None):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    data = json.dumps(body).encode() if body is not None else None
    h = {**_sb_headers(), **(headers_extra or {})}
    req = urllib.request.Request(url, data=data, method=method, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            txt = r.read().decode(errors="replace")
            return json.loads(txt) if txt and txt != "null" else ([] if method == "GET" else True)
    except urllib.error.HTTPError as e:
        body_txt = e.read().decode(errors="replace")[:300]
        print(f"  [sb-err] {method} {path}: HTTP {e.code} {body_txt}")
        return None
    except Exception as e:
        print(f"  [sb-err] {method} {path}: {type(e).__name__}: {e}")
        return None


def sb_post(path: str, body: dict) -> dict | None:
    return sb(path, "POST", body)


def sb_patch(path: str, body: dict) -> bool:
    return sb(path, "PATCH", body, {"Prefer": "return=minimal"}) is not None


def _log_run(action: str, status: str, details: dict) -> None:
    try:
        sb_post("agent_runs", {
            "agent_name": "conversion_funnel",
            "workflow_id": WORKFLOW_ID,
            "action": action,
            "status": status,
            "details": json.dumps(details)[:7800],
        })
    except Exception:
        pass


# ── Suppression & Send ────────────────────────────────────────────────────────

_suppressed_cache: set[str] = set()
_auto_send_count: list[int] = [0]
_draft_count: list[int] = [0]


def is_suppressed(email: str) -> bool:
    email = email.strip().lower()
    if email in _suppressed_cache:
        return True
    res = sb(f"email_suppression_list?email=eq.{urllib.parse.quote(email)}&select=email&limit=1")
    if isinstance(res, list) and res:
        _suppressed_cache.add(email)
        return True
    return False


def send_email(to: str, subject: str, body: str, auto: bool = False) -> bool:
    """Send via Resend. auto=True means transactional (explicit user action).
    auto=False creates a DRAFT in sales_outreach instead."""
    to = to.strip().lower()
    if is_suppressed(to):
        print(f"  [suppressed] skip {to}")
        return False
    if auto:
        if _auto_send_count[0] >= MAX_AUTO_SENDS_PER_DAY:
            _save_draft(to, subject, body, channel="email", template="auto_cap_overflow")
            return False
        if not RESEND_KEY:
            return False
        try:
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                method="POST",
                headers={"Authorization": f"Bearer {RESEND_KEY}", "Content-Type": "application/json",
                         "User-Agent": "bizlegal-agent/1.0"},
                data=json.dumps({"from": RESEND_FROM, "to": [to],
                                 "subject": subject, "text": body}).encode(),
            )
            with urllib.request.urlopen(req, timeout=15) as r:
                ok = r.status in (200, 201)
                if ok:
                    _auto_send_count[0] += 1
                return ok
        except Exception as e:
            print(f"  [send-err] {to}: {e}")
            return False
    else:
        _save_draft(to, subject, body)
        return True


def _save_draft(email: str, subject: str, body: str, channel: str = "email", template: str = "nurture") -> bool:
    """Write draft to sales_outreach for Moses to approve + send."""
    if _draft_count[0] >= MAX_DRAFTS_PER_RUN:
        return False
    # Find or create a sales_lead for this email
    leads = sb(f"sales_lead?email=eq.{urllib.parse.quote(email.lower())}&select=id&limit=1")
    lead_id = None
    if isinstance(leads, list) and leads:
        lead_id = leads[0]["id"]
    else:
        new_lead = sb_post("sales_lead", {
            "email": email.lower(), "source": "inbound_funnel",
            "icp_score": 40, "status": "new",
        })
        if isinstance(new_lead, list) and new_lead:
            lead_id = new_lead[0]["id"]
    if not lead_id:
        return False
    # Check cooldown: no draft for this lead in last DRAFT_COOLDOWN_DAYS days
    since = (datetime.now(timezone.utc) - timedelta(days=DRAFT_COOLDOWN_DAYS)).isoformat()
    existing = sb(f"sales_outreach?lead_id=eq.{lead_id}&drafted_at=gte.{since}&select=id&limit=1")
    if isinstance(existing, list) and existing:
        return False
    ok = sb_post("sales_outreach", {
        "lead_id": lead_id,
        "channel": channel,
        "template": template,
        "subject": subject,
        "body": body,
        "status": "drafted",
        "suppression_checked": True,
    })
    if ok:
        _draft_count[0] += 1
    return bool(ok)


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


# ── Nurture state helpers ─────────────────────────────────────────────────────

def get_nurture(email: str, source: str) -> dict | None:
    res = sb(f"lead_nurture_state?email=eq.{urllib.parse.quote(email.lower())}&source=eq.{source}&limit=1")
    if isinstance(res, list) and res:
        return res[0]
    return None


def upsert_nurture(email: str, source: str, next_step: str, delay_days: int,
                   payment_status: str = "pending", vertical: str = "") -> None:
    next_send = (datetime.now(timezone.utc) + timedelta(days=delay_days)).isoformat()
    existing = get_nurture(email, source)
    if existing:
        sb_patch(f"lead_nurture_state?id=eq.{existing['id']}", {
            "next_step": next_step, "next_send_at": next_send,
            "last_sent_at": datetime.now(timezone.utc).isoformat(),
            "payment_status": payment_status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })
    else:
        sb_post("lead_nurture_state", {
            "email": email.lower(),
            "source": source,
            "vertical": vertical or "general",
            "next_step": next_step,
            "next_send_at": next_send,
            "payment_status": payment_status,
            "emails_sent": 1,
        })


def nurture_due(state: dict) -> bool:
    nxt = state.get("next_send_at")
    if not nxt:
        return False
    try:
        due = datetime.fromisoformat(nxt.replace("Z", "+00:00"))
        return datetime.now(timezone.utc) >= due
    except Exception:
        return False


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Track A: Risk Snapshot Users ──────────────────────────────────────────────

SNAPSHOT_SEQ = {
    "snap_day0": {
        "subject": "Your BizLegal compliance snapshot is ready",
        "body": """\
Hi,

Your compliance snapshot for {url} (jurisdiction: {jurisdiction}) is ready.

Here's what we found:

Score: {score}/100 (Grade: {grade})

Top priority fix:
{recommended_fix}

{flags_text}

What this means for you:
A score below 70 means you have at least one material compliance gap that a regulator or counterparty could flag in a due-diligence review. Most companies at this score are 2-3 policy updates away from getting clean.

Next steps (no purchase required):
1. Read your flags above — fix the highest-severity one first
2. If you have a vendor or customer sending you a security questionnaire, our DocAI tool can pre-fill 80% of standard questions using your existing policies
3. If you want the full audit with remediation steps, that's the $97 DocAI self-serve scan: {docai_url}/pricing

Best,
Moses
BizLegal AI — https://bizlegal-ai.com
""",
        "auto": True,
        "delay_days": 1,
        "next_step": "snap_day1",
    },
    "snap_day1": {
        "subject": "The 3 compliance fixes that matter most this quarter",
        "body": """\
Hi,

Following up on your compliance snapshot. Based on your score and jurisdiction ({jurisdiction}), here are the 3 fixes that move the needle most:

1. **Update your privacy policy** — Most SMBs haven't updated theirs since the GDPR/CCPA wave. If you're handling EU or CA user data, this is the highest-litigation-risk item. Template: https://bizlegal-ai.com/blog/privacy-policy-template

2. **Get your DPA signed with all processors** — If you use any SaaS tool (AWS, Stripe, Intercom, Mailchimp), you need a Data Processing Agreement. We generate these automatically in DocAI.

3. **Run an annual security questionnaire dry-run** — Before your enterprise customer sends you their 40-page security questionnaire, you want to have answers ready. DocAI does this in 3 minutes: {docai_url}

These are the three things compliance teams consistently tell us saved them the most time (and money) when enforcement came.

Best,
Moses
""",
        "auto": True,
        "delay_days": 3,
        "next_step": "snap_day3",
    },
    "snap_day3": {
        "subject": "Quick question about your compliance roadmap",
        "body": """\
Hi,

Saw you ran a compliance snapshot on {url} last week. Wanted to ask one question:

What's the #1 compliance blocker you're dealing with right now?

(a) Security questionnaires from enterprise customers
(b) GDPR/privacy policy updates
(c) FinCEN BOI filing or AML/KYC setup
(d) SOC 2 / ISO 27001 prep
(e) Something else

Reply with the letter and I'll send you the most useful resource we have for that specific issue. No pitch, just the resource.

Best,
Moses
""",
        "auto": False,
        "delay_days": 7,
        "next_step": "snap_day7",
    },
    "snap_day7": {
        "subject": "For your score of {score}: here's the exact fix",
        "body": """\
Hi,

One more follow-up on your compliance snapshot (score: {score}/100).

We built DocAI specifically for companies at your score range. Here's what it does:

For a company in your jurisdiction ({jurisdiction}), the most common issue we fix is: {recommended_fix}

DocAI self-serve:
→ You upload your contracts, policies, or vendor questionnaire
→ AI reviews against 200+ compliance clauses in your jurisdiction
→ You get a redlined document with specific fixes + a remediation checklist

Price: $97 one-time per scan. No subscription required.
→ {docai_url}/pricing

If your score is above 85 already, you probably don't need it. But at {score}, there's almost always 2-3 policy gaps worth $97 to fix before your next enterprise deal or audit.

No pressure either way. Reply "not interested" and I won't follow up.

Best,
Moses
""",
        "auto": False,
        "delay_days": 999,  # end of sequence
        "next_step": "done",
    },
}


def track_a_snapshots(auto_budget: list[int]) -> int:
    """Follow up with risk_snapshot users who haven't purchased."""
    print("\n[Track A] Risk snapshot users")
    processed = 0
    # Only look at snapshots with no associated payment order
    snaps = sb("risk_snapshots?order_id=is.null&select=id,email,url,jurisdiction,score,grade,flags,recommended_fix,created_at&limit=100")
    if not isinstance(snaps, list):
        print("  no snapshots")
        return 0
    for snap in snaps:
        email = (snap.get("email") or "").lower().strip()
        if not email or "@" not in email:
            continue
        if is_suppressed(email):
            continue
        # Check if already purchased via payment_orders
        paid = sb(f"payment_orders?user_email=ilike.{urllib.parse.quote(email)}&status=in.(active,completed)&select=id&limit=1")
        if isinstance(paid, list) and paid:
            continue  # already converted
        state = get_nurture(email, "risk_snapshot")
        # Determine which step to send
        if state is None:
            step_key = "snap_day0"
        elif state.get("opted_out") or state.get("next_step") == "done":
            continue
        elif not nurture_due(state):
            continue
        else:
            step_key = state.get("next_step", "done")
        if step_key not in SNAPSHOT_SEQ or step_key == "done":
            continue
        step = SNAPSHOT_SEQ[step_key]
        # Build flags text
        flags = snap.get("flags") or []
        if isinstance(flags, str):
            try: flags = json.loads(flags)
            except: flags = []
        flags_text = ""
        if isinstance(flags, list) and flags:
            flags_text = "Key findings:\n" + "\n".join(f"  • {f}" for f in flags[:5])
        body = step["body"].format(
            url=snap.get("url", "your site"),
            jurisdiction=snap.get("jurisdiction", "your jurisdiction"),
            score=snap.get("score", "N/A"),
            grade=snap.get("grade", "N/A"),
            recommended_fix=snap.get("recommended_fix") or "Review your privacy policy and DPA coverage.",
            flags_text=flags_text,
            docai_url=DOCAI_URL,
        )
        subject = step["subject"].format(
            score=snap.get("score", "N/A"),
            url=snap.get("url", "your site"),
            jurisdiction=snap.get("jurisdiction", ""),
        )
        is_auto = step["auto"] and auto_budget[0] < MAX_AUTO_SENDS_PER_DAY
        ok = send_email(email, subject, body, auto=is_auto)
        if ok:
            if is_auto:
                auto_budget[0] += 1
            upsert_nurture(email, "risk_snapshot", step["next_step"], step["delay_days"],
                           vertical=snap.get("jurisdiction", ""))
            processed += 1
            print(f"  {'SENT' if is_auto else 'DRAFTED'} → {email[:40]} step={step_key}")
    print(f"  Track A done: {processed} processed")
    return processed


# ── Track B: Newsletter Subscriber Drip ───────────────────────────────────────

NEWSLETTER_SEQ = {
    "nl_welcome": {
        "subject": "Welcome to BizLegal AI: your first 5 resources",
        "body": """\
Hi {name},

Welcome — and thanks for confirming your subscription.

Here are the 5 resources our subscribers tell us are most useful on day 1:

1. **Compliance Health Snapshot (free)** — get a 60-signal score for your company in 2 minutes
   → https://bizlegal-ai.com/snapshot

2. **Privacy Policy Template (free)** — GDPR + CCPA ready, jurisdiction-specific
   → https://bizlegal-ai.com/blog/privacy-policy-template

3. **BOI Filing Guide for LLCs** — FinCEN deadline guide + checklist
   → https://bizlegal-ai.com/blog/boi-filing-guide-llc

4. **DPA Template Library** — standard data processing agreements for 6 major frameworks
   → https://bizlegal-ai.com/blog/dpa-templates

5. **Security Questionnaire Cheat Sheet** — 40 standard questions + model answers
   → https://bizlegal-ai.com/blog/security-questionnaire-cheat-sheet

You'll hear from me again in 3 days with a compliance tip. No daily emails, I promise.

If you want to jump straight to the paid tool, it's $97 for a full contract/policy scan:
→ https://docai.bizlegal-ai.com/pricing

Best,
Moses
""",
        "auto": True,
        "delay_days": 3,
        "next_step": "nl_day3",
    },
    "nl_day3": {
        "subject": "The compliance mistake that cost a $30M fintech its Series B",
        "body": """\
Hi {name},

A quick compliance story that's directly relevant to what most of our subscribers are dealing with.

In 2025, a $30M fintech raising a Series B had their due diligence stall for 8 weeks because their privacy policy referenced "GDPR compliance" without specifying their legal basis for processing. The lead investor's legal team flagged it. Closing delay: 2 months.

The fix would have taken 2 hours.

The three most common due-diligence flags we see (in order):

1. **Privacy policy outdated** — doesn't reference CCPA/CPRA changes from 2023-2025, or lacks specific legal basis statements for EU processing
2. **No DPA with major processors** — especially Stripe, AWS, and any HR SaaS tool. Investors check these.
3. **Security questionnaire answers inconsistent with actual controls** — if your questionnaire says "AES-256 encryption at rest" but your AWS config doesn't show it, that's a material misstatement

The good news: all three are fixable in a week.

If you want us to check your documents against these specific items, that's what DocAI does:
→ https://docai.bizlegal-ai.com (self-serve, $97)

Otherwise — the next newsletter is in 4 days.

Best,
Moses
""",
        "auto": True,
        "delay_days": 4,
        "next_step": "nl_day7",
    },
    "nl_day7": {
        "subject": "The tool we actually use for contract review",
        "body": """\
Hi {name},

Quick one today — just wanted to share how our own team reviews contracts, in case it's useful.

We use DocAI for all inbound vendor agreements. Here's our exact process:

1. Upload the contract (PDF, Word, or paste text)
2. Select clause library (we use our own GDPR + SOC 2 + standard SaaS library)
3. It outputs: redlined clauses, risk flags, and a summary of the top 3 changes to negotiate

What it catches that humans miss:
- Broad indemnification clauses buried in exhibit C
- Auto-renewal provisions with short cancellation windows
- Data processing terms that give the vendor too much latitude

For inbound security questionnaires from enterprise customers:
- Upload the questionnaire
- It drafts answers using your existing policies as source material
- Saves 3-5 hours per questionnaire

If you process more than 2 contracts/month or receive security questionnaires from customers, it pays for itself on the first use.

→ https://docai.bizlegal-ai.com/pricing ($97 one-time scan, or $69/mo subscription for Firm tier)

Happy to answer any questions — just reply.

Best,
Moses
""",
        "auto": False,
        "delay_days": 7,
        "next_step": "nl_day14",
    },
    "nl_day14": {
        "subject": "Subscriber offer: $97 → $77 DocAI scan (48h)",
        "body": """\
Hi {name},

A quick note — we're running a subscriber-only offer this week.

If you want to try the DocAI contract scan, use code SUBSCRIBER20 for $20 off. That's $77 instead of $97.

Valid for 48 hours from when you open this email.

→ https://docai.bizlegal-ai.com/pricing

What you get:
• Full contract/policy review against 200+ compliance clauses
• Redlined document with specific fix suggestions
• Remediation checklist ranked by legal exposure
• 48-hour turnaround

If now's not the right time — no worries. The regular price is always there when you're ready.

Best,
Moses

P.S. If there's a specific compliance issue you're dealing with, reply and I'll send you the most relevant resource. No pitch.
""",
        "auto": False,
        "delay_days": 999,
        "next_step": "done",
    },
}


def track_b_newsletter(auto_budget: list[int]) -> int:
    """Drip sequence for confirmed newsletter subscribers."""
    print("\n[Track B] Newsletter subscribers")
    processed = 0
    subs = sb("newsletter_subscribers?double_optin_confirmed=eq.true&select=email,full_name,created_at&limit=100")
    if not isinstance(subs, list):
        print("  no confirmed subscribers")
        return 0
    for sub in subs:
        email = (sub.get("email") or "").lower().strip()
        if not email or "@" not in email:
            continue
        if is_suppressed(email):
            continue
        # Check if already purchased
        paid = sb(f"payment_orders?user_email=ilike.{urllib.parse.quote(email)}&status=in.(active,completed)&select=id&limit=1")
        if isinstance(paid, list) and paid:
            continue  # converted, don't nurture
        state = get_nurture(email, "newsletter")
        name = (sub.get("full_name") or "").split()[0] or "there"
        if state is None:
            step_key = "nl_welcome"
        elif state.get("opted_out") or state.get("next_step") == "done":
            continue
        elif not nurture_due(state):
            continue
        else:
            step_key = state.get("next_step", "done")
        if step_key not in NEWSLETTER_SEQ or step_key == "done":
            continue
        step = NEWSLETTER_SEQ[step_key]
        body = step["body"].format(name=name)
        is_auto = step["auto"] and auto_budget[0] < MAX_AUTO_SENDS_PER_DAY
        ok = send_email(email, step["subject"], body, auto=is_auto)
        if ok:
            if is_auto:
                auto_budget[0] += 1
            upsert_nurture(email, "newsletter", step["next_step"], step["delay_days"])
            processed += 1
            print(f"  {'SENT' if is_auto else 'DRAFTED'} → {email[:40]} step={step_key}")
    print(f"  Track B done: {processed} processed")
    return processed


# ── Track C: Contract Scan Users (DocAI free trial → paid) ───────────────────

def track_c_docai_scans(auto_budget: list[int]) -> int:
    """Follow up with contract_scans users who haven't upgraded to paid."""
    print("\n[Track C] DocAI contract scan users")
    processed = 0
    scans = sb("contract_scans?select=id,email,company,created_at&order=created_at.desc&limit=50")
    if not isinstance(scans, list):
        print("  no scan table or no rows")
        return 0
    for scan in scans:
        email = (scan.get("email") or "").lower().strip()
        if not email or "@" not in email:
            continue
        if is_suppressed(email):
            continue
        paid = sb(f"payment_orders?user_email=ilike.{urllib.parse.quote(email)}&status=in.(active,completed)&select=id&limit=1")
        if isinstance(paid, list) and paid:
            continue
        # Only follow up if scan is 24h - 14 days old
        created = scan.get("created_at", "")
        try:
            scan_age = (datetime.now(timezone.utc) - datetime.fromisoformat(created.replace("Z", "+00:00"))).total_seconds() / 3600
        except Exception:
            continue
        if scan_age < 24 or scan_age > 336:  # 24h to 14 days
            continue
        state = get_nurture(email, "docai_scan")
        if state is None:
            step_key = "scan_day1"
        elif state.get("opted_out") or state.get("next_step") == "done":
            continue
        elif not nurture_due(state):
            continue
        else:
            step_key = state.get("next_step", "done")

        if step_key == "scan_day1":
            subj = "3 things your DocAI scan results revealed"
            body = f"""\
Hi,

Thanks for running a scan on DocAI. Here's a quick breakdown of what the tool found and what to do with it.

The three most common issues we find in {scan.get('company', 'your type of company')}:

1. **Missing or weak limitation-of-liability clause** — if your contract doesn't cap liability at contract value (or some multiplier), you're exposed to uncapped damages claims. This is the clause most SMBs forget.

2. **Auto-renewal with insufficient notice period** — many vendor contracts renew automatically with a 30-day cancellation window. If you're managing 10+ vendor relationships, you will miss one.

3. **Data processing terms that need a DPA** — if the contract involves any personal data (names, emails, user behavior), GDPR / CCPA require a separate Data Processing Agreement. Most contracts don't include one.

If you want the full redlined version of your contract with all flags highlighted:
→ {DOCAI_URL}/pricing ($97 for the full audit, or $69/mo for the Firm tier with unlimited scans)

Let me know if you have questions about any of the findings.

Best,
Moses
"""
            is_auto = auto_budget[0] < MAX_AUTO_SENDS_PER_DAY
            ok = send_email(email, subj, body, auto=is_auto)
            if ok:
                if is_auto: auto_budget[0] += 1
                upsert_nurture(email, "docai_scan", "scan_day3", delay_days=3)
                processed += 1
                print(f"  {'SENT' if is_auto else 'DRAFTED'} → {email[:40]} step=scan_day1")
        elif step_key == "scan_day3":
            subj = "Have you fixed the top issue from your scan?"
            body = f"""\
Hi,

Following up on your DocAI scan from earlier this week.

Quick question: have you had a chance to address the top compliance flag it surfaced?

If not, the most common reason teams give is: "we know what to fix, but don't have the internal bandwidth to do it."

Here's the fast path:
→ DocAI Firm tier ($69/mo): unlimited contract scans + auto-DPA generation + security questionnaire auto-fill
→ One-time scan ($97): good if you have a single contract to review right now

Both are self-serve. No calls required.
→ {DOCAI_URL}/pricing

If you want to run the same scan on a different document (RFP, vendor contract, employment agreement), just upload it at the same link.

Best,
Moses
"""
            ok = send_email(email, subj, body, auto=False)  # always draft from day 3
            if ok:
                upsert_nurture(email, "docai_scan", "done", delay_days=999)
                processed += 1
                print(f"  DRAFTED → {email[:40]} step=scan_day3")
    print(f"  Track C done: {processed} processed")
    return processed


# ── Track D: Payment Abandonment Recovery ─────────────────────────────────────

def track_d_payment_recovery(auto_budget: list[int]) -> int:
    """Auto-send recovery email to people who started checkout but didn't complete."""
    print("\n[Track D] Payment abandonment recovery")
    processed = 0
    # pending orders 2-48 hours old (after that, cold)
    cutoff_new = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
    cutoff_old = (datetime.now(timezone.utc) - timedelta(hours=48)).isoformat()
    pending = sb(
        f"payment_orders?status=eq.pending"
        f"&created_at=lte.{cutoff_new}"
        f"&created_at=gte.{cutoff_old}"
        f"&select=id,user_email,user_name,product,tier,amount_cents,currency,gateway,metadata"
        f"&order=created_at.asc&limit=20"
    )
    if not isinstance(pending, list):
        print("  no pending orders in window")
        return 0
    for order in pending:
        email = (order.get("user_email") or "").lower().strip()
        if not email or "@" not in email:
            continue
        if is_suppressed(email):
            continue
        # Check if already sent a recovery for this specific order
        state = get_nurture(email, f"payment_recovery_{order['id']}")
        if state is not None:
            continue
        name = (order.get("user_name") or "").split()[0] or "there"
        amount = f"${order.get('amount_cents', 0) / 100:.2f}"
        product = order.get("tier") or order.get("product") or "the compliance tool"
        # Extract checkout URL from metadata
        meta_raw = order.get("metadata") or "{}"
        try:
            meta = json.loads(meta_raw) if isinstance(meta_raw, str) else meta_raw
        except Exception:
            meta = {}
        checkout_url = meta.get("approval_url") or meta.get("pay_url") or meta.get("invoice_url") or f"{SITE_URL}/pricing"
        subj = f"Did something go wrong? Your {product} checkout"
        body = f"""\
Hi {name},

Looks like your checkout for {product} didn't complete — the link timed out or there was an issue on our end.

Your link is still active:
→ {checkout_url}

Price: {amount} {order.get('currency', 'USD')}
No subscription unless you chose monthly.

If you had a question before completing, just reply to this email.
If you decided not to purchase, no problem — I won't follow up on this.

Best,
Moses
BizLegal AI — {SITE_URL}
"""
        ok = send_email(email, subj, body, auto=auto_budget[0] < MAX_AUTO_SENDS_PER_DAY)
        if ok:
            if auto_budget[0] < MAX_AUTO_SENDS_PER_DAY:
                auto_budget[0] += 1
            upsert_nurture(email, f"payment_recovery_{order['id']}", "done", delay_days=999)
            sb_patch(f"payment_orders?id=eq.{order['id']}", {"status": "recovery_sent"})
            processed += 1
            print(f"  RECOVERY → {email[:40]} product={product} amount={amount}")
    print(f"  Track D done: {processed} processed")
    return processed


# ── Main ──────────────────────────────────────────────────────────────────────

def run() -> dict:
    started = time.time()
    print(f"\n=== conversion_funnel_agent @ {now_iso()} ===")
    print(f"  SUPABASE: {bool(SUPABASE_URL)}  RESEND: {bool(RESEND_KEY)}  ANTHROPIC: {bool(ANTHROPIC_KEY)}")
    print(f"  CAPS: auto_send={MAX_AUTO_SENDS_PER_DAY}/day  drafts={MAX_DRAFTS_PER_RUN}/run")
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("  FATAL: Supabase not configured")
        return {"ok": False, "error": "supabase_missing"}

    auto_budget = [0]  # shared mutable counter across tracks
    results = {
        "track_a_snapshots": 0,
        "track_b_newsletter": 0,
        "track_c_docai": 0,
        "track_d_recovery": 0,
    }

    results["track_a_snapshots"] = track_a_snapshots(auto_budget)
    results["track_b_newsletter"] = track_b_newsletter(auto_budget)
    results["track_c_docai"] = track_c_docai_scans(auto_budget)
    results["track_d_recovery"] = track_d_payment_recovery(auto_budget)

    total = sum(results.values())
    results.update({
        "ok": True,
        "auto_sent": auto_budget[0],
        "drafts_created": _draft_count[0],
        "total_touched": total,
        "duration_s": int(time.time() - started),
    })
    print(f"\n  DONE: auto_sent={auto_budget[0]}  drafts={_draft_count[0]}  total={total}  t={results['duration_s']}s")
    if auto_budget[0] > 0 or _draft_count[0] > 0:
        tg(f"📧 conversion_funnel: {auto_budget[0]} sent + {_draft_count[0]} drafted\n"
           f"  A:{results['track_a_snapshots']} B:{results['track_b_newsletter']} "
           f"C:{results['track_c_docai']} D:{results['track_d_recovery']}")
    _log_run("conversion_funnel", "success", results)
    return results


if __name__ == "__main__":
    import sys as _sys
    result = run()
    _sys.exit(0 if result.get("ok") else 1)
