"""
Socials Agent — Multi-platform posting (Blotato-style).

Job: Take content from content_agent -> post to LinkedIn, X, Facebook,
Instagram, TikTok, Threads, Bluesky with platform-specific formatting.

Output: Posts land on schedule; engagement metrics write back to
content_engagement table for next agent to learn from.

Schedule: 09:00, 13:00, 18:00 UTC.

Usage:
  from services.agents.socials_agent import run
  result = run({"platforms": ["linkedin", "x"], "limit": 5})
"""
from __future__ import annotations
import json, os, time
from datetime import datetime, timezone
from pathlib import Path
import sys as _sys
_sys.path.insert(0, str(Path(__file__).resolve().parent))
import _env
try:
    from orchestrator import heartbeat as _heartbeat
except Exception:
    _heartbeat = None

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")
except Exception:
    pass

SUPABASE_URL, SUPABASE_KEY = _env.get_supabase()
BLOTATO = _env.get_blotato_key()

PLATFORM_LIMITS = {
    "linkedin": 3000,
    "x": 280,
    "facebook": 5000,
    "instagram": 2200,
    "tiktok": 2200,
    "threads": 500,
    "bluesky": 300,
}


def _headers():
    return {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"}


def _find_queued_posts(limit):
    """Find LinkedIn posts in content/socials/linkedin/ that haven't been published."""
    base = Path(__file__).resolve().parents[2] / "content" / "socials" / "linkedin"
    if not base.exists():
        return []
    out = []
    for p in sorted(base.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True)[:limit]:
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
            data["_file"] = str(p)
            out.append(data)
        except Exception:
            pass
    return out


def _adapt_for_platform(body, platform):
    """Trim/adapt content for a specific platform."""
    limit = PLATFORM_LIMITS.get(platform, 2000)
    text = body.strip()
    if platform == "x":
        # Compress for X: keep first paragraph + hashtags
        if len(text) > limit:
            # Try to keep first 200 chars + a hashtag block
            head = text[:200].rsplit(".", 1)[0] + "."
            text = head + " " + (text.split("#")[-1] if "#" in text else "")
    elif platform == "bluesky":
        # Bluesky: 300 chars, no spam
        if len(text) > limit:
            text = text[:limit - 3] + "..."
    elif platform == "threads":
        if len(text) > limit:
            text = text[:limit - 3] + "..."
    return text[:limit]


def _post_via_blotato(platform, body, image_url=None):
    """Post to a single platform via Blotato API.
    Returns {ok, post_id, url} or {ok: False, error}."""
    if not BLOTATO:
        return {"ok": False, "error": "no BLOTATO_API_KEY"}
    import urllib.request
    try:
        req_body = json.dumps({
            "platform": platform,
            "content": body,
            "media": [image_url] if image_url else [],
            "scheduled_at": datetime.now(timezone.utc).isoformat(),
        }).encode()
        req = urllib.request.Request(
            "https://api.blotato.com/v2/posts",
            data=req_body,
            headers={"Authorization": f"Bearer {BLOTATO}", "Content-Type": "application/json"},
            method="POST",
        )
        r = urllib.request.urlopen(req, timeout=30)
        result = json.loads(r.read())
        return {"ok": True, "post_id": result.get("id"), "url": result.get("url")}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def _log_post(platform, post, blotato_result, dry_run):
    """Log the post attempt to content_engagement (creates if not exists)."""
    if dry_run:
        return True
    import urllib.request
    row = {
        "platform": platform,
        "topic": post.get("topic", ""),
        "post_id": blotato_result.get("post_id"),
        "url": blotato_result.get("url"),
        "status": "posted" if blotato_result.get("ok") else "failed",
        "error": blotato_result.get("error"),
        "posted_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/content_engagement",
            data=json.dumps(row).encode(),
            headers={**_headers(), "Prefer": "return=minimal"},
            method="POST",
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        # Table might not exist - that's OK, log to agent_runs
        return False


def run(ctx=None):
    ctx = ctx or {}
    platforms = ctx.get("platforms", ["linkedin", "x", "threads", "bluesky"])
    limit = int(ctx.get("limit", 3))
    dry_run = bool(ctx.get("dry_run", False))
    started = time.time()
    queued = _find_queued_posts(limit)
    posted = 0
    errors = 0
    results = []
    for post in queued:
        body = post.get("body", "")
        if not body:
            continue
        for platform in platforms:
            adapted = _adapt_for_platform(body, platform)
            result = _post_via_blotato(platform, adapted)
            _log_post(platform, post, result, dry_run)
            if result.get("ok") or dry_run:
                posted += 1
            else:
                errors += 1
            results.append({"platform": platform, "ok": result.get("ok", False), "url": result.get("url")})
    return {
        "ok": errors == 0,
        "agent": "socials",
        "posted": posted,
        "errors": errors,
        "results": results[:20],
        "duration_ms": int((time.time() - started) * 1000),
        "dry_run": dry_run,
    }


if __name__ == "__main__":
    import sys
    args = {}
    i = 1
    while i < len(sys.argv):
        a = sys.argv[i]
        if a.startswith("--"):
            k, _, v = a[2:].partition("=")
            if v:
                args[k] = v
            elif i + 1 < len(sys.argv) and not sys.argv[i+1].startswith("--"):
                args[k] = sys.argv[i+1]
                i += 1
            else:
                args[k] = True
        i += 1
    # Parse platforms as comma-separated
    if "platforms" in args and isinstance(args["platforms"], str):
        args["platforms"] = args["platforms"].split(",")
    print(json.dumps(run(args), indent=2))
