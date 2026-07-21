"""
growth_measure.py — 24h engagement measurement for multi-channel social posts.

Runs 24 hours after growth_agent.py posts. Polls each platform's API for
engagement metrics and writes results back to social_experiments. This closes
the feedback loop: growth_agent.py Stage 1 reads social_experiments to pick
the best angle for tomorrow.

What this does:
  - Reads social_drafts WHERE status='posted' AND measured_at IS NULL
                          AND posted_at < NOW() - 24h
  - Per channel:
      linkedin: GET /v2/socialActions/{urn}/likes + comments + shares
                GET /v2/organizationalEntityShareStatistics (impressions)
      x:        GET /2/tweets/{id}?fields=public_metrics (likes, retweets, replies, impressions)
      reddit:   GET /api/info?id=t3_{id} (score, num_comments)
  - Computes engagement_rate per channel
  - Generates 2-sentence what_worked/what_failed via Claude Haiku
  - Updates social_experiments with all metrics
  - Updates social_drafts.measured_at = NOW()
  - Gracefully skips channels with missing API tokens (logs but does not crash)

Schedule: 0 9 * * * (09:00 UTC daily — 24h after 05:30 UTC growth_agent.py run the prior morning)
"""
from __future__ import annotations

import json
import os
import re
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


SUPABASE_URL      = _e("SUPABASE_URL").rstrip("/")
SUPABASE_KEY      = _e("SUPABASE_SERVICE_ROLE_KEY") or _e("SUPABASE_SERVICE_KEY") or _e("SUPABASE_SECRET")
ANTHROPIC_KEY     = _e("ANTHROPIC_API_KEY") or _e("ANTHROPIC_API_KEY_ENRICH")
TELEGRAM_TOKEN    = _e("TELEGRAM_HUB_TOKEN")
TELEGRAM_CHAT     = _e("TELEGRAM_MOSES_CHAT_ID") or _e("TELEGRAM_HUB_CHAT_ID")
LINKEDIN_TOKEN    = _e("LINKEDIN_ACCESS_TOKEN")
LINKEDIN_AUTHOR   = _e("LINKEDIN_AUTHOR_URN")
X_BEARER_TOKEN    = _e("X_BEARER_TOKEN")
REDDIT_TOKEN      = _e("REDDIT_ACCESS_TOKEN")


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


def sb_patch(path: str, body: dict) -> bool:
    return sb(path, "PATCH", body, {"Prefer": "return=minimal"}) is not None


def tg(msg: str) -> None:
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT:
        return
    try:
        urllib.request.urlopen(
            urllib.request.Request(
                f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
                data=json.dumps({"chat_id": TELEGRAM_CHAT, "text": msg[:4000]}).encode(),
                headers={"Content-Type": "application/json"},
                method="POST",
            ),
            timeout=8,
        )
    except Exception:
        pass


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── AI call (Haiku — cheap) ───────────────────────────────────────────────────

def ai_call(prompt: str, max_tokens: int = 300) -> str:
    if not ANTHROPIC_KEY:
        return ""
    try:
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            method="POST",
            headers={
                "x-api-key": ANTHROPIC_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            data=json.dumps({
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": max_tokens,
                "messages": [{"role": "user", "content": prompt}],
            }).encode(),
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            resp = json.loads(r.read())
            return "".join(c.get("text", "") for c in resp.get("content", []) if c.get("type") == "text")
    except Exception as e:
        print(f"  [ai-err] {e}")
        return ""


# ── Platform metric fetchers ──────────────────────────────────────────────────

def _http_get(url: str, headers: dict) -> dict | None:
    try:
        req = urllib.request.Request(url, headers={**headers, "User-Agent": "bizlegal-growth/1.0"})
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        print(f"    [http-err] GET {url[:80]}: HTTP {e.code}")
        return None
    except Exception as e:
        print(f"    [http-err] GET {url[:80]}: {e}")
        return None


def measure_linkedin(posted_url: str) -> dict:
    """Poll LinkedIn API for reactions, comments, shares, impressions."""
    if not LINKEDIN_TOKEN:
        return {"skipped": True, "reason": "LINKEDIN_ACCESS_TOKEN missing"}

    # Extract UGC post URN from posted_url: .../feed/update/urn%3Ali%3AugcPost%3A.../
    urn = None
    m = re.search(r"feed/update/([^/]+)", posted_url or "")
    if m:
        urn = urllib.parse.unquote(m.group(1))
    if not urn:
        return {"skipped": True, "reason": "could not extract URN from posted_url"}

    headers = {
        "Authorization": f"Bearer {LINKEDIN_TOKEN}",
        "X-Restli-Protocol-Version": "2.0.0",
    }
    encoded_urn = urllib.parse.quote(urn, safe="")

    likes_data = _http_get(
        f"https://api.linkedin.com/v2/socialActions/{encoded_urn}/likes?count=true",
        headers,
    )
    comments_data = _http_get(
        f"https://api.linkedin.com/v2/socialActions/{encoded_urn}/comments?count=true",
        headers,
    )
    reactions = (likes_data or {}).get("paging", {}).get("total", 0)
    comments = (comments_data or {}).get("paging", {}).get("total", 0)

    # Try shares via share statistics (org entity — may 403 for personal)
    impressions = 0
    shares = 0
    if LINKEDIN_AUTHOR and LINKEDIN_AUTHOR.startswith("urn:li:organization"):
        org_id = LINKEDIN_AUTHOR.split(":")[-1]
        stats = _http_get(
            f"https://api.linkedin.com/v2/organizationalEntityShareStatistics"
            f"?q=organizationalEntity&organizationalEntity={urllib.parse.quote(LINKEDIN_AUTHOR)}"
            f"&shares[0]={encoded_urn}",
            headers,
        )
        element = ((stats or {}).get("elements") or [{}])[0]
        total = element.get("totalShareStatistics", {})
        impressions = total.get("impressionCount", 0)
        shares = total.get("shareCount", 0)

    engagement_rate = (reactions + comments + shares) / max(impressions, 1)
    return {
        "impressions": impressions,
        "reactions": reactions,
        "comments": comments,
        "shares": shares,
        "engagement_rate": round(engagement_rate, 6),
    }


def measure_x(posted_url: str) -> dict:
    """Poll X (Twitter) API v2 for public_metrics."""
    if not X_BEARER_TOKEN:
        return {"skipped": True, "reason": "X_BEARER_TOKEN missing"}

    tweet_id = None
    m = re.search(r"/status/(\d+)", posted_url or "")
    if not m:
        m = re.search(r"web/status/(\d+)", posted_url or "")
    if m:
        tweet_id = m.group(1)
    if not tweet_id:
        return {"skipped": True, "reason": "could not extract tweet ID from posted_url"}

    data = _http_get(
        f"https://api.twitter.com/2/tweets/{tweet_id}?tweet.fields=public_metrics",
        {"Authorization": f"Bearer {X_BEARER_TOKEN}"},
    )
    if not data:
        return {"skipped": True, "reason": "X API returned no data"}

    metrics = (data.get("data") or {}).get("public_metrics", {})
    reactions = metrics.get("like_count", 0)
    comments = metrics.get("reply_count", 0)
    shares = metrics.get("retweet_count", 0)
    impressions = metrics.get("impression_count", 0)
    engagement_rate = (reactions + comments + shares) / max(impressions, 1)
    return {
        "impressions": impressions,
        "reactions": reactions,
        "comments": comments,
        "shares": shares,
        "engagement_rate": round(engagement_rate, 6),
    }


def measure_reddit(posted_url: str) -> dict:
    """Poll Reddit API for score and comment count."""
    if not REDDIT_TOKEN:
        return {"skipped": True, "reason": "REDDIT_ACCESS_TOKEN missing"}

    # Extract submission ID from URL: /r/{sub}/comments/{id}/
    sub_id = None
    m = re.search(r"/comments/([a-z0-9]+)/", posted_url or "")
    if m:
        sub_id = m.group(1)
    if not sub_id:
        return {"skipped": True, "reason": "could not extract submission ID from posted_url"}

    data = _http_get(
        f"https://oauth.reddit.com/api/info?id=t3_{sub_id}",
        {"Authorization": f"Bearer {REDDIT_TOKEN}"},
    )
    if not data:
        return {"skipped": True, "reason": "Reddit API returned no data"}

    children = (data.get("data") or {}).get("children") or []
    post_data = (children[0].get("data") or {}) if children else {}
    score = post_data.get("score", 0)
    num_comments = post_data.get("num_comments", 0)
    engagement_rate = (score + num_comments) / 100  # Reddit has no impressions API
    return {
        "impressions": 0,  # not available via Reddit API without Ads access
        "reactions": max(score, 0),  # upvotes - downvotes
        "comments": num_comments,
        "shares": 0,
        "engagement_rate": round(engagement_rate, 6),
    }


CHANNEL_MEASURE = {
    "linkedin": measure_linkedin,
    "x": measure_x,
    "reddit": measure_reddit,
}


# ── Learning summary ──────────────────────────────────────────────────────────

def _learn(channel: str, angle: str, topic: str, metrics: dict) -> tuple[str, str]:
    """Generate 2-sentence what_worked / what_failed via Haiku."""
    if metrics.get("skipped"):
        return "", f"Measurement skipped: {metrics.get('reason', 'unknown')}"
    prompt = (
        f"A BizLegal AI {channel} post about '{topic}' (angle: {angle}) got these metrics:\n"
        f"impressions={metrics.get('impressions')}, reactions={metrics.get('reactions')}, "
        f"comments={metrics.get('comments')}, shares={metrics.get('shares')}, "
        f"engagement_rate={metrics.get('engagement_rate'):.4f}\n\n"
        f"In exactly 2 short sentences: (1) what likely worked in this post format/angle, "
        f"(2) what to try differently next time. Be specific — no platitudes. "
        f"Return as JSON: {{\"what_worked\": \"...\", \"what_failed\": \"...\"}}"
    )
    raw = ai_call(prompt, max_tokens=200)
    try:
        d = json.loads(raw)
        return d.get("what_worked", ""), d.get("what_failed", "")
    except Exception:
        return "", ""


# ── Main measurement loop ─────────────────────────────────────────────────────

def run() -> dict:
    print(f"\n=== growth_measure @ {now_iso()} ===")
    print(f"  SUPABASE: {bool(SUPABASE_URL)}  LI: {bool(LINKEDIN_TOKEN)}  X: {bool(X_BEARER_TOKEN)}  Reddit: {bool(REDDIT_TOKEN)}")

    if not SUPABASE_URL or not SUPABASE_KEY:
        return {"ok": False, "error": "supabase_missing"}

    cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    rows = sb(
        f"social_drafts?status=eq.posted"
        f"&measured_at=is.null"
        f"&posted_at=lt.{urllib.parse.quote(cutoff)}"
        "&select=id,channel,posted_url,source_title,source_url"
        "&order=posted_at.asc&limit=20"
    )
    if not isinstance(rows, list):
        print("  no rows to measure")
        return {"ok": True, "measured": 0}

    print(f"  {len(rows)} posts to measure")
    stats = {"measured": 0, "skipped": 0, "total_engagement": 0.0}
    summary_lines = ["📊 <b>Growth Measure</b> — 24h engagement report\n"]

    for row in rows:
        draft_id = row.get("id")
        channel = row.get("channel", "")
        posted_url = row.get("posted_url") or ""
        topic = row.get("source_title") or ""

        print(f"  [{channel}] id={draft_id} url={posted_url[:60]}")

        measurer = CHANNEL_MEASURE.get(channel)
        if not measurer:
            print(f"    no measurer for channel '{channel}' — skip")
            stats["skipped"] += 1
            continue

        metrics = measurer(posted_url)

        if metrics.get("skipped"):
            print(f"    skipped: {metrics.get('reason')}")
            stats["skipped"] += 1
            # Still mark measured_at so we don't retry forever
            sb_patch(f"social_drafts?id=eq.{draft_id}", {"measured_at": now_iso()})
            continue

        # Find corresponding social_experiments row
        exp_rows = sb(f"social_experiments?social_draft_id=eq.{draft_id}&limit=1")
        if not isinstance(exp_rows, list) or not exp_rows:
            print(f"    no social_experiments row for draft_id={draft_id} — skip")
            stats["skipped"] += 1
            continue

        exp_id = exp_rows[0].get("id")
        angle = exp_rows[0].get("angle", "")

        # Generate learning summary
        worked, failed = _learn(channel, angle, topic, metrics)
        time.sleep(0.5)

        # Update social_experiments
        sb_patch(
            f"social_experiments?id=eq.{exp_id}",
            {
                "impressions": metrics.get("impressions", 0),
                "reactions": metrics.get("reactions", 0),
                "comments": metrics.get("comments", 0),
                "shares": metrics.get("shares", 0),
                "engagement_rate": metrics.get("engagement_rate", 0),
                "posted_url": posted_url,
                "posted_at": row.get("posted_at"),
                "measured_at": now_iso(),
                "what_worked": worked or None,
                "what_failed": failed or None,
            },
        )

        # Mark social_drafts as measured
        sb_patch(f"social_drafts?id=eq.{draft_id}", {"measured_at": now_iso()})

        er = metrics.get("engagement_rate", 0)
        stats["measured"] += 1
        stats["total_engagement"] += er
        print(f"    OK: reactions={metrics.get('reactions')} comments={metrics.get('comments')} er={er:.4f}")

        summary_lines.append(
            f"{'💼' if channel == 'linkedin' else '🐦' if channel == 'x' else '🔴'} "
            f"<b>{channel}</b> ({angle})\n"
            f"  reactions={metrics.get('reactions')} impressions={metrics.get('impressions')} er={er:.4f}\n"
            f"  📝 {worked[:100] if worked else '(no analysis)'}\n"
        )

    if stats["measured"] > 0:
        avg_er = stats["total_engagement"] / stats["measured"]
        summary_lines.append(f"\nAvg engagement rate: {avg_er:.4f} across {stats['measured']} posts")
        tg("\n".join(summary_lines))

    print(f"\n  DONE: measured={stats['measured']} skipped={stats['skipped']}")
    return {"ok": True, **stats}


if __name__ == "__main__":
    result = run()
    sys.exit(0 if result.get("ok") else 1)
