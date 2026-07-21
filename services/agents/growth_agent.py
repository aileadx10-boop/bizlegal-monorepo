"""
growth_agent.py — Multi-channel Growth Agent for BizLegal AI.

Implements the HackProduct "Harnessing + Loop Engineering" pattern:
  Harnessing:       system prompt + memory (social_experiments) + tools (Supabase/Telegram/Claude)
  Loop Engineering: Plan → Draft → Score → Store → [Moses approves] → Post → Measure → Learn → Repeat

What this does each morning (05:30 UTC):
  Stage 1: PLAN
    - Reads social_experiments to find best-performing angle per channel
    - If any angle has <3 experiments → use it (data collection phase)
    - Else → use highest engagement_rate angle
    - Anchors post to a recent daily_gaps article (published last 7 days)
    - Picks Reddit subreddit based on topic keywords
  Stage 2: DRAFT
    - LinkedIn: Claude Sonnet — attorney voice, 800-1300 chars, 3-5 hashtags
    - X:        Claude Haiku — ≤240 chars, sharpest single insight from LinkedIn post
    - Reddit:   Claude Haiku — 300-600 chars, community-first, subreddit-matched
  Stage 3: SCORE
    - Self-evaluates each draft (hook + specificity + channel-fit + CTA = 0-100)
    - Retries once if any channel scores <70
  Stage 4: STORE
    - Inserts 3 rows to social_drafts (pending_approval) with unique approval tokens
    - Inserts 3 rows to social_experiments (no metrics yet — populated by growth_measure.py)
    - Writes JSON files to content/socials/{channel}/ for git-tracked audit trail
    - Sends Telegram summary with approve/reject links for each channel

Schedule: 30 5 * * * (05:30 UTC daily)
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

# ── Env loading ────────────────────────────────────────────────────────────────
REPO = Path("/opt/bizlegal/curator") if Path("/opt/bizlegal/curator").exists() else Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))

_env_cache: dict = {}
for _src in [
    REPO / ".env",
    Path("/opt/bizlegal/curator/.env"),
    Path.home() / "Downloads" / "env-hub-bizlegal-ai.txt",
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
HUB_URL        = "https://bizlegal-ai.com"

# ── Brand constants ────────────────────────────────────────────────────────────

ANGLES = [
    "regulatory-horror",     # What happens when you ignore X regulation
    "authority-insight",     # Moses's specific legal analysis
    "founder-mistake",       # Common error before retaining compliance counsel
    "regulation-explainer",  # Precise breakdown of a new rule with citations
    "cost-comparison",       # In-house CCO vs retainer math
    "myth-busting",          # Common misconception demolished
    "case-precedent",        # Court decision → what founders must do
    "industry-wrinkle",      # Crypto/DAO/fintech-specific edge case
]

HOOK_TYPES = ["question", "bold-claim", "stat", "story"]

SUBREDDIT_MAP = {
    "fintech": "r/fintech",
    "payment": "r/fintech",
    "crypto": "r/ethereum",
    "dao": "r/ethereum",
    "token": "r/ethereum",
    "web3": "r/ethereum",
    "saas": "r/SaaS",
    "software": "r/SaaS",
    "startup": "r/startups",
    "founder": "r/startups",
    "gdpr": "r/legaltech",
    "privacy": "r/legaltech",
    "boi": "r/smallbusiness",
    "llc": "r/smallbusiness",
    "compliance": "r/legaltech",
}
DEFAULT_SUBREDDIT = "r/legaltech"

GROWTH_SYSTEM_PROMPT = """You are BizLegal AI's multi-channel growth operator. Your job is to grow Moses's audience on LinkedIn, X, and Reddit — and generate qualified inbound compliance retainer inquiries.

GOAL: 10,000 LinkedIn followers + 3,000 X followers in 90 days. 3+ qualified retainer inquiries per week from fintech founders, crypto GCs, and B2B SaaS COOs. On Reddit: become the trusted practitioner in r/fintech and r/legaltech.

BRAND VOICE (Moses is a practicing commercial attorney):
- Lead with the legal insight, not the hook
- Use precise regulatory terminology — specific statute citations (31 CFR §1010.380, GDPR Art. 28, etc.)
- Never open with "I'm excited to share" / "Hot take:" / "Unpopular opinion:" / "Let's talk about"
- No bullet-point listicles masquerading as analysis
- Attorney voice: definitive, not hedged. Never "consult a lawyer" — Moses IS the lawyer.

TARGET AUDIENCE: Fintech founders (Series A-C), crypto/Web3 GCs, B2B SaaS COOs managing compliance burdens, boutique law firms, DAO operators, payments companies navigating FinCEN/VARA/GDPR.

PRODUCTS: DocAI contract risk scan ($97 one-time), Managed Compliance Ops Retainer ($5K setup + $2,500/mo), BOI Kit ($149), LexAudit health score ($99/mo), BRAI counterparty risk ($149-299).

CHANNEL RULES:
- LinkedIn: 800-1300 chars. Full attorney analysis. 3-5 focused hashtags at end. One CTA maximum (only when topic directly maps to a product). Never shill.
- X: ≤240 chars. Distil the single sharpest insight from the LinkedIn post. No hashtag spam. Can end with nothing or "Full analysis at link in bio."
- Reddit: 300-600 chars. Community-first — genuine value before any mention of BizLegal. No "link in bio" CTAs. Match subreddit tone exactly (peer-to-peer, practitioner).

Output ONLY valid JSON, no markdown fences."""

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
        with urllib.request.urlopen(req, timeout=30) as r:
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


def tg(msg: str) -> None:
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT:
        print(f"  [tg] no token/chat configured — skipping: {msg[:80]}")
        return
    try:
        urllib.request.urlopen(
            urllib.request.Request(
                f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
                data=json.dumps({"chat_id": TELEGRAM_CHAT, "text": msg[:4000], "parse_mode": "HTML"}).encode(),
                headers={"Content-Type": "application/json"},
                method="POST",
            ),
            timeout=8,
        )
    except Exception as e:
        print(f"  [tg-err] {e}")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── AI call ───────────────────────────────────────────────────────────────────

def ai_call(prompt: str, max_tokens: int = 1500, system: str = "", model: str = "claude-haiku-4-5-20251001") -> str:
    if not ANTHROPIC_KEY:
        return ""
    payload: dict = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}],
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
        with urllib.request.urlopen(req, timeout=60) as r:
            resp = json.loads(r.read())
            return "".join(c.get("text", "") for c in resp.get("content", []) if c.get("type") == "text")
    except Exception as e:
        print(f"  [ai-err] {model} {type(e).__name__}: {e}")
        return ""


# ── Stage 1: PLAN ─────────────────────────────────────────────────────────────

def _pick_subreddit(topic: str) -> str:
    t = topic.lower()
    for kw, sub in SUBREDDIT_MAP.items():
        if kw in t:
            return sub
    return DEFAULT_SUBREDDIT


def _angle_performance() -> dict[str, float]:
    """Return avg engagement_rate per angle across all channels from social_experiments."""
    rows = sb(
        "social_experiments?select=angle,engagement_rate"
        "&measured_at=not.is.null"
        "&order=created_at.desc&limit=100"
    )
    if not isinstance(rows, list) or not rows:
        return {}
    perf: dict[str, list[float]] = {}
    for r in rows:
        a = r.get("angle", "")
        e = float(r.get("engagement_rate") or 0)
        perf.setdefault(a, []).append(e)
    return {a: sum(v) / len(v) for a, v in perf.items()}


def _angle_experiment_counts() -> dict[str, int]:
    """Return how many experiments each angle has."""
    rows = sb("social_experiments?select=angle&order=created_at.desc&limit=500")
    if not isinstance(rows, list):
        return {}
    counts: dict[str, int] = {}
    for r in rows:
        a = r.get("angle", "")
        if a:
            counts[a] = counts.get(a, 0) + 1
    return counts


def _pick_angle(perf: dict[str, float], counts: dict[str, int]) -> str:
    # Prioritise data collection: angles with <3 experiments
    for angle in ANGLES:
        if counts.get(angle, 0) < 3:
            return angle
    # Else: highest engagement_rate
    if perf:
        return max(perf, key=lambda a: perf.get(a, 0))
    return ANGLES[0]


def _pick_hook_type(angle: str, counts: dict[str, int]) -> str:
    # Rotate through hook types to avoid repetition
    idx = counts.get(angle, 0) % len(HOOK_TYPES)
    return HOOK_TYPES[idx]


def _anchor_article() -> dict | None:
    """Find a recently-published daily_gap article to anchor the post."""
    cutoff = (datetime.now(timezone.utc) - timedelta(days=14)).isoformat()
    rows = sb(
        f"daily_gaps?status=in.(published,aeo_ready,distributed)"
        f"&created_at=gte.{urllib.parse.quote(cutoff)}"
        "&select=url,keyword,topic,draft_slug,description"
        "&order=created_at.desc&limit=5"
    )
    if isinstance(rows, list) and rows:
        return rows[0]
    return None


def stage_plan() -> dict:
    print("\n[Stage 1] PLAN")
    perf = _angle_performance()
    counts = _angle_experiment_counts()
    angle = _pick_angle(perf, counts)
    hook_type = _pick_hook_type(angle, counts)
    anchor = _anchor_article()

    topic = ""
    anchor_url = ""
    if anchor:
        topic = anchor.get("keyword") or anchor.get("topic") or anchor.get("draft_slug", "").replace("-", " ")
        anchor_url = anchor.get("url") or ""
    if not topic:
        # Fallback topic based on angle
        topic = {
            "regulatory-horror": "FinCEN BOI willful non-compliance penalties",
            "authority-insight": "MiCA Article 68 CASP application strategy",
            "founder-mistake": "compliance gap discovered at due diligence",
            "regulation-explainer": "GDPR Data Processing Agreement requirements",
            "cost-comparison": "compliance ops retainer vs in-house CCO",
            "myth-busting": "BOI filing exemption misconceptions",
            "case-precedent": "Van Loon v Treasury OFAC screening implications",
            "industry-wrinkle": "DAO token-weighted governance and beneficial ownership",
        }.get(angle, "B2B compliance for fintech founders")

    subreddit = _pick_subreddit(topic)
    best_angle_perf = perf.get(angle, 0)

    print(f"  angle={angle}  hook={hook_type}  topic={topic[:60]}")
    print(f"  subreddit={subreddit}  anchor={anchor_url[:60] or 'none'}")
    print(f"  angle_avg_engagement={best_angle_perf:.4f}  total_experiments={sum(counts.values())}")

    return {
        "angle": angle,
        "hook_type": hook_type,
        "topic": topic,
        "anchor_url": anchor_url,
        "subreddit": subreddit,
    }


# ── Stage 2: DRAFT ────────────────────────────────────────────────────────────

def _draft_linkedin(plan: dict) -> str:
    prompt = f"""Draft a LinkedIn post for a practicing commercial attorney who runs a B2B compliance SaaS.

Angle: {plan['angle']}
Hook type: {plan['hook_type']} (question / bold-claim / stat / story)
Topic: {plan['topic']}
Anchor article URL (include at end if provided): {plan['anchor_url'] or 'none'}

Requirements:
- 800-1300 characters total
- Attorney voice: definitive, precise, never hedged
- Lead with the legal insight — not "Here's what I've learned"
- Include at least one specific regulatory citation (statute/CFR/article number)
- 3-5 targeted hashtags at the very end (compliance-specific, not generic)
- One CTA maximum — only if topic directly maps to a BizLegal product
- Do NOT open with a question unless hook_type = 'question'

Return a JSON object:
{{"body": "<full post text>", "hook_snippet": "<first 60 chars of post>", "score_rationale": "<why this will perform>"}}"""

    raw = ai_call(prompt, max_tokens=1000, system=GROWTH_SYSTEM_PROMPT, model="claude-sonnet-4-6")
    return _parse_draft_json(raw, "linkedin")


def _draft_x(plan: dict, linkedin_body: str) -> str:
    prompt = f"""Compress this LinkedIn compliance post into a single X (Twitter) post.

LinkedIn post:
{linkedin_body[:1200]}

Requirements:
- ≤240 characters (HARD limit — count carefully)
- Extract the single sharpest legal insight or most surprising fact
- Attorney voice: precise, not dumbed down
- No hashtag spam (0-1 hashtag max, only if highly specific)
- Can end with nothing, or "Full analysis at link in bio." if article exists
- Do NOT start with "Thread:" or "1/"

Return a JSON object:
{{"body": "<tweet text ≤240 chars>", "hook_snippet": "<first 60 chars>", "char_count": <number>}}"""

    raw = ai_call(prompt, max_tokens=400, system=GROWTH_SYSTEM_PROMPT)
    return _parse_draft_json(raw, "x")


def _draft_reddit(plan: dict, linkedin_body: str) -> str:
    prompt = f"""Write a Reddit post for {plan['subreddit']} based on this compliance insight.

Topic: {plan['topic']}
Angle: {plan['angle']}
Key insight from LinkedIn post: {linkedin_body[:600]}

Requirements:
- 300-600 characters
- Community-first: lead with the problem or observation the community faces
- Peer-to-peer tone — NOT "as an attorney" or "our product"
- Provide genuine value before any mention of BizLegal
- Only mention BizLegal or link to an article at the very end, and only if it adds direct value
- No "link in bio" CTAs — Reddit users hate it
- Match {plan['subreddit']} tone: practitioner-to-practitioner, not marketing

Return a JSON object:
{{"body": "<post text>", "hook_snippet": "<first 60 chars>", "subreddit": "{plan['subreddit']}"}}"""

    raw = ai_call(prompt, max_tokens=400, system=GROWTH_SYSTEM_PROMPT)
    return _parse_draft_json(raw, "reddit")


def _parse_draft_json(raw: str, channel: str) -> dict:
    if not raw:
        return {"body": "", "hook_snippet": "", "error": "empty response"}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        m = re.search(r"\{[\s\S]*\}", raw)
        if m:
            try:
                return json.loads(m.group(0))
            except json.JSONDecodeError:
                pass
    # Fallback: treat entire response as body
    return {"body": raw.strip()[:1300], "hook_snippet": raw[:60]}


def stage_draft(plan: dict) -> list[dict]:
    print("\n[Stage 2] DRAFT")
    linkedin = _draft_linkedin(plan)
    time.sleep(1)
    x = _draft_x(plan, linkedin.get("body", ""))
    time.sleep(1)
    reddit = _draft_reddit(plan, linkedin.get("body", ""))

    drafts = [
        {"channel": "linkedin", **linkedin},
        {"channel": "x", **x},
        {"channel": "reddit", **reddit},
    ]
    for d in drafts:
        body = d.get("body", "")
        print(f"  {d['channel']}: {len(body)} chars — '{body[:60]}'")
    return drafts


# ── Stage 3: SCORE ────────────────────────────────────────────────────────────

def _score_draft(channel: str, body: str, plan: dict) -> int:
    if not body:
        return 0

    limits = {"linkedin": (800, 1300), "x": (50, 240), "reddit": (300, 600)}
    lo, hi = limits.get(channel, (100, 2000))
    length_score = 20 if lo <= len(body) <= hi else (10 if len(body) > 0 else 0)

    # Hook strength: does it start with something other than a generic opener?
    bad_openers = ["i'm excited", "hot take", "unpopular opinion", "let's talk", "i want to share", "here's what"]
    hook_score = 0 if any(body.lower().startswith(b) for b in bad_openers) else 25

    # Specificity: contains a number, citation, or specific entity
    has_specific = bool(re.search(r"\d{1,4}|\§|CFR|Art\.|GDPR|FinCEN|OFAC|MiCA|CTA|BOI", body))
    specificity_score = 25 if has_specific else 10

    # CTA discipline: LinkedIn/X should have ≤1 CTA; Reddit ideally 0
    cta_count = body.lower().count("link in bio") + body.lower().count("bizlegal") + body.lower().count("docai")
    if channel == "reddit":
        cta_score = 30 if cta_count == 0 else (15 if cta_count == 1 else 0)
    else:
        cta_score = 30 if cta_count <= 1 else (15 if cta_count == 2 else 0)

    return length_score + hook_score + specificity_score + cta_score


def stage_score(drafts: list[dict], plan: dict) -> tuple[list[dict], bool]:
    print("\n[Stage 3] SCORE")
    all_ok = True
    for d in drafts:
        score = _score_draft(d["channel"], d.get("body", ""), plan)
        d["score"] = score
        status = "OK" if score >= 70 else "LOW"
        print(f"  {d['channel']}: score={score}/100 [{status}]")
        if score < 70:
            all_ok = False
    return drafts, all_ok


# ── Stage 4: STORE ────────────────────────────────────────────────────────────

def _gen_token() -> str:
    return secrets.token_hex(16)  # 32-char hex, matches /api/social/approve/[token] regex


def _channel_meta(channel: str, plan: dict) -> dict:
    if channel == "reddit":
        sub = plan.get("subreddit", DEFAULT_SUBREDDIT).lstrip("r/")
        return {"subreddit": f"r/{sub}", "title": plan.get("topic", "")[:300]}
    if channel == "buffer":
        return {"profile_ids": _e("BUFFER_DEFAULT_PROFILE_IDS", "")}
    return {}


def _write_content_file(channel: str, slug: str, body: str, plan: dict) -> None:
    content_dir = REPO / "content" / "socials" / channel
    content_dir.mkdir(parents=True, exist_ok=True)
    fpath = content_dir / f"{slug}.json"
    payload = {
        "topic": plan.get("topic", ""),
        "angle": plan.get("angle", ""),
        "channel": channel,
        "body": body,
        "created_at": now_iso(),
    }
    if channel == "reddit":
        payload["subreddit"] = plan.get("subreddit", "")
    fpath.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def stage_store(drafts: list[dict], plan: dict) -> list[dict]:
    print("\n[Stage 4] STORE")
    today_slug = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    topic_slug = re.sub(r"[^a-z0-9]+", "-", plan.get("topic", "post").lower()).strip("-")[:50]
    base_slug = f"{today_slug}-{topic_slug}"
    stored = []

    for d in drafts:
        channel = d["channel"]
        body = d.get("body", "").strip()
        if not body:
            print(f"  {channel}: SKIP — empty body")
            continue

        token = _gen_token()
        meta = _channel_meta(channel, plan)

        # Insert to social_drafts
        row = {
            "channel": channel,
            "status": "pending_approval",
            "source_url": plan.get("anchor_url") or HUB_URL,
            "source_title": plan.get("topic", ""),
            "body": body,
            "channel_meta": meta,
            "approval_token": token,
        }
        result = sb_post("social_drafts", row)
        draft_id = None
        if isinstance(result, list) and result:
            draft_id = result[0].get("id")
        elif isinstance(result, dict):
            draft_id = result.get("id")

        # Insert to social_experiments (metrics populated later by growth_measure.py)
        exp = {
            "social_draft_id": draft_id,
            "channel": channel,
            "angle": plan["angle"],
            "hook_type": plan["hook_type"],
            "topic": plan["topic"],
            "post_body": body,
        }
        sb_post("social_experiments", exp)

        # Write content file for git audit trail
        _write_content_file(channel, base_slug, body, plan)

        approve_url = f"{HUB_URL}/api/social/approve/{token}?action=approve"
        reject_url = f"{HUB_URL}/api/social/approve/{token}?action=reject"
        stored.append({
            "channel": channel,
            "draft_id": draft_id,
            "score": d.get("score", 0),
            "hook_snippet": d.get("hook_snippet", body[:60]),
            "approve_url": approve_url,
            "reject_url": reject_url,
        })
        print(f"  {channel}: stored draft_id={draft_id} score={d.get('score')}")

    return stored


# ── Telegram summary ───────────────────────────────────────────────────────────

CHANNEL_EMOJI = {"linkedin": "💼", "x": "🐦", "reddit": "🔴"}


def send_telegram_summary(plan: dict, stored: list[dict]) -> None:
    if not stored:
        tg("⚠️ Growth Agent: no drafts stored today — check logs.")
        return

    lines = [f"🌱 <b>Growth Agent</b> — {plan['angle']} / {plan['hook_type']}\n<i>{plan['topic'][:80]}</i>\n"]
    for s in stored:
        ch = s["channel"]
        emoji = CHANNEL_EMOJI.get(ch, "📝")
        lines.append(
            f"{emoji} <b>{ch.upper()}</b> (score={s['score']}/100)\n"
            f""{s['hook_snippet'][:60]}..."\n"
            f"<a href=\"{s['approve_url']}\">✅ Approve</a>  |  <a href=\"{s['reject_url']}\">❌ Reject</a>\n"
        )
    tg("\n".join(lines))


# ── Main ──────────────────────────────────────────────────────────────────────

def run() -> dict:
    import time as _time
    started = _time.time()
    print(f"\n=== growth_agent @ {now_iso()} ===")
    print(f"  SUPABASE: {bool(SUPABASE_URL)}  ANTHROPIC: {bool(ANTHROPIC_KEY)}  TELEGRAM: {bool(TELEGRAM_TOKEN)}")

    if not SUPABASE_URL or not SUPABASE_KEY:
        tg("⚠️ growth_agent: SUPABASE not configured — aborting.")
        return {"ok": False, "error": "supabase_missing"}
    if not ANTHROPIC_KEY:
        tg("⚠️ growth_agent: ANTHROPIC_API_KEY not set — aborting.")
        return {"ok": False, "error": "anthropic_missing"}

    plan = stage_plan()
    drafts = stage_draft(plan)
    drafts, all_ok = stage_score(drafts, plan)

    # Retry once if any channel scored <70
    if not all_ok:
        print("  [score] some drafts low-scored — retrying once")
        retried = stage_draft(plan)
        retried, _ = stage_score(retried, plan)
        # Merge: keep highest score per channel
        best: dict[str, dict] = {}
        for d in drafts + retried:
            ch = d["channel"]
            if ch not in best or d.get("score", 0) > best[ch].get("score", 0):
                best[ch] = d
        drafts = list(best.values())

    stored = stage_store(drafts, plan)
    send_telegram_summary(plan, stored)

    duration = int(_time.time() - started)
    print(f"\n  DONE: {len(stored)} drafts stored  t={duration}s")
    return {"ok": True, "stored": len(stored), "angle": plan["angle"], "duration_s": duration}


if __name__ == "__main__":
    result = run()
    sys.exit(0 if result.get("ok") else 1)
