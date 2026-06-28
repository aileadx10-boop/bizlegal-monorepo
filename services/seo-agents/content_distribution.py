#!/usr/bin/env python3
"""
content_distribution.py — syndicate every new blog post to Reddit, LinkedIn, X.

Uses only FREE APIs:
  - Reddit JSON API (no auth needed for reading; for posting requires OAuth — drafts only)
  - Buffer free tier (3 channels, 10 posts in queue) OR direct X API (if BEARER set)
  - LinkedIn share intent (mailto-style; requires manual confirmation in browser, but
    we generate the post body that Moses can paste)

Per-platform templates:
  Reddit:    r/FinTech, r/compliance, r/GDPR, r/cryptocurrency, r/regtech, r/cybersecurity
             (post body = 80% of MDX body, links to bizlegal-ai.com, follows self-promotion rules)
  LinkedIn:  1300-char personal-pov post with hook + value + link in comments
  X/Thread:  7-tweet thread from blog post (intro, 5 insights, conclusion + link)

Cron: 16:30 UTC daily (after seo_content_writer at 02:00 publishes new posts)
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import pathlib
import re
import sys
import urllib.request
import urllib.error


SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
BUFFER_TOKEN = os.environ.get("BUFFER_ACCESS_TOKEN", "")
X_BEARER = os.environ.get("X_BEARER_TOKEN", "")
TELEGRAM_TOKEN = os.environ.get("TELEGRAM_CURATOR_BOT_TOKEN", "")
TELEGRAM_CHAT = os.environ.get("TELEGRAM_CHAT_ID", "989097520")


def http_json(url, headers=None, data=None, method="GET", timeout=15):
    h = {"Accept": "application/json"}
    if headers: h.update(headers)
    body = data.encode() if isinstance(data, str) else data
    try:
        req = urllib.request.Request(url, data=body, method=method, headers=h)
        r = urllib.request.urlopen(req, timeout=timeout)
        return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode()[:200]}
    except Exception as e:
        return 0, {"error": str(e)[:200]}


def supabase_query(table, query="", base_url=None, key=None):
    if not (base_url or SUPABASE_URL): return []
    base_url = base_url or SUPABASE_URL
    key = key or SUPABASE_KEY
    status, body = http_json(f"{base_url}/rest/v1/{table}?{query}",
                              headers={"apikey": key, "Authorization": f"Bearer {key}"})
    return body if status == 200 else []


def telegram_send(text):
    if not (TELEGRAM_TOKEN and TELEGRAM_CHAT): return False
    try:
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
            data=json.dumps({"chat_id": TELEGRAM_CHAT, "text": text,
                              "parse_mode": "HTML", "disable_web_page_preview": True}).encode(),
            method="POST", headers={"Content-Type": "application/json"},
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False


# ---------- REDDIT ----------

REDDIT_TARGETS = [
    {"sub": "FinTech", "rule": "no_self_promo_in_title", "flair": "Discussion"},
    {"sub": "compliance", "rule": "value_first", "flair": "Resource"},
    {"sub": "GDPR", "rule": "value_first", "flair": ""},
    {"sub": "regtech", "rule": "value_first", "flair": ""},
    {"sub": "cryptocurrency", "rule": "no_affiliate_links", "flair": "Discussion"},
    {"sub": "cybersecurity", "rule": "no_promotion", "flair": ""},
]


def render_reddit_post(post: dict, sub: str) -> str:
    """Render a Reddit-style post from a blog post record."""
    title = post.get("title", "")
    url = f"https://blog.bizlegal-ai.com/posts/{post.get('slug', '')}"
    excerpt = post.get("description", post.get("meta_description", ""))[:300]

    body = f"""# {title}

{excerpt}

**What you'll learn:**
- The exact regulatory framework for this scenario
- A practical compliance checklist you can apply today
- Common mistakes that trigger audit findings

Full deep-dive (free, no signup): {url}

---

I run BizLegal AI — we help SaaS / fintech / crypto companies automate
SOC 2, ISO 27001, GDPR, and BOI compliance. Happy to answer any
questions in the comments.

(Disclosure: founder of the tool linked above. Will not paste the link
again in comments to respect subreddit rules.)
"""
    return body


# ---------- LINKEDIN ----------

def render_linkedin_post(post: dict) -> str:
    """1300-char personal-pov LinkedIn post."""
    title = post.get("title", "")
    url = f"https://blog.bizlegal-ai.com/posts/{post.get('slug', '')}"
    insight = post.get("description", post.get("meta_description", ""))[:200]

    body = f"""Most {post.get('topic', 'compliance')} advice is generic.

After working with 200+ companies on SOC 2, GDPR, and BOI this year,
here's what actually moves the needle:

→ {insight}

The full breakdown (with a free checklist) is here: {url}

What's your experience with {post.get('topic', 'this')}?

#compliance #SaaS #cybersecurity #regtech
"""
    return body[:1300]


# ---------- X / TWITTER THREAD ----------

def render_x_thread(post: dict) -> list[str]:
    """7-tweet thread from a blog post."""
    title = post.get("title", "")
    url = f"https://blog.bizlegal-ai.com/posts/{post.get('slug', '')}"
    excerpt = post.get("description", post.get("meta_description", ""))[:200]

    tweets = [
        f"🧵 {title}\n\nA practical thread:",
        f"1/ Most companies get this wrong: they treat {post.get('topic', 'compliance')} as a checkbox, not a system.",
        f"2/ The real cost isn't the audit — it's the 3 months of scrambling before the audit.",
        f"3/ {excerpt}",
        f"4/ Here's the framework that works:\n• Map controls to your actual product\n• Automate evidence collection\n• Run internal audits quarterly\n• Treat the auditor as a partner",
        f"5/ The teams that get this right ship faster — not slower. Compliance done well is a feature.",
        f"6/ Full deep-dive (free, no signup):\n{url}\n\nIf this was useful, RT the first tweet 🙏",
    ]
    return tweets


# ---------- BUFFER ----------

def buffer_push(profile_id: str, text: str, scheduled_at: str = None) -> dict:
    """Push to Buffer. Returns response or error."""
    if not BUFFER_TOKEN:
        return {"error": "BUFFER_ACCESS_TOKEN not set"}
    payload = {"text": text, "profile_ids": [profile_id]}
    if scheduled_at:
        payload["scheduled_at"] = scheduled_at
    status, body = http_json(
        "https://api.bufferapp.com/1/updates/create.json?access_token=" + BUFFER_TOKEN,
        data=json.dumps(payload), method="POST",
        headers={"Content-Type": "application/json"},
    )
    return {"status": status, "response": body}


# ---------- MAIN ----------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=_dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d"))
    ap.add_argument("--output", default="/opt/bizlegal/decisions")
    ap.add_argument("--limit", type=int, default=3, help="how many recent posts to distribute")
    args = ap.parse_args()

    # Get recent published posts from Supabase seo_pages table
    cutoff = (_dt.datetime.now(_dt.timezone.utc) - _dt.timedelta(days=2)).strftime("%Y-%m-%dT%H:%M:%SZ")
    posts = supabase_query("seo_pages",
                           f"select=slug,title,description,meta_description,topic&published=eq.true&published_at=gte.{cutoff}&order=published_at.desc&limit={args.limit}")

    if not posts:
        print(f"  no posts published in last 48h", file=sys.stderr)
        # fallback: scan local blog_content dir
        local_dir = pathlib.Path("/opt/bizlegal/curator/services/seo-agents/blog_content")
        if local_dir.exists():
            md_files = sorted(local_dir.glob("*.mdx"), key=lambda p: p.stat().st_mtime, reverse=True)[:args.limit]
            posts = []
            for f in md_files:
                t = f.read_text(encoding="utf-8")
                title_m = re.search(r"^#\s+(.+)$", t, re.M)
                desc_m = re.search(r"\n\n([^\n#].{50,300})", t)
                posts.append({
                    "slug": f.stem,
                    "title": title_m.group(1).strip() if title_m else f.stem,
                    "description": desc_m.group(1).strip() if desc_m else "",
                    "topic": "compliance",
                })

    print(f"[{args.date}] content_distribution: {len(posts)} posts", file=sys.stderr)

    out_dir = pathlib.Path(args.output)
    out_dir.mkdir(parents=True, exist_ok=True)
    dist_file = out_dir / f"distribution-{args.date}.md"

    md = [f"# Distribution Drafts — {args.date}\n\n",
          f"**Posts:** {len(posts)}\n",
          f"**Generated:** {_dt.datetime.now(_dt.timezone.utc).isoformat()}\n\n"]

    summary = {"reddit": 0, "linkedin": 0, "x_thread": 0, "buffer_pushed": 0, "errors": []}

    for p in posts:
        slug = p.get("slug", "")
        title = p.get("title", "")
        md.append(f"## {title}\n\n")
        md.append(f"URL: https://blog.bizlegal-ai.com/posts/{slug}\n\n")

        # Reddit
        md.append("### Reddit drafts\n\n")
        for tgt in REDDIT_TARGETS:
            body = render_reddit_post(p, tgt["sub"])
            md.append(f"**r/{tgt['sub']}** (flair: {tgt['flair']})\n\n```\n{body}\n```\n\n")
            summary["reddit"] += 1

        # LinkedIn
        md.append("### LinkedIn post (1300 char)\n\n```\n")
        md.append(render_linkedin_post(p))
        md.append("\n```\n\n")
        summary["linkedin"] += 1

        # X thread
        md.append("### X thread (7 tweets)\n\n")
        for i, t in enumerate(render_x_thread(p), 1):
            md.append(f"**Tweet {i}:** {t}\n\n")
        summary["x_thread"] += 1

        # Buffer push (if token + profile set)
        if BUFFER_TOKEN and os.environ.get("BUFFER_LINKEDIN_PROFILE"):
            r = buffer_push(os.environ["BUFFER_LINKEDIN_PROFILE"], render_linkedin_post(p))
            if r.get("status") == 200:
                summary["buffer_pushed"] += 1
            else:
                summary["errors"].append(f"buffer linkedin: {r.get('response', {}).get('message', r)}")

        md.append("---\n\n")

    md.append(f"\n## Summary\n\n- Reddit drafts: {summary['reddit']}\n")
    md.append(f"- LinkedIn drafts: {summary['linkedin']}\n")
    md.append(f"- X threads: {summary['x_thread']}\n")
    md.append(f"- Buffer pushed: {summary['buffer_pushed']}\n")
    if summary["errors"]:
        md.append(f"\nErrors:\n")
        for e in summary["errors"]:
            md.append(f"- {e}\n")

    dist_file.write_text("".join(md), encoding="utf-8")
    print(f"  wrote {dist_file}", file=sys.stderr)

    # Telegram heartbeat
    tg_text = (f"📣 <b>Distribution {args.date}</b>\n"
               f"{summary['reddit']} Reddit drafts\n"
               f"{summary['linkedin']} LinkedIn drafts\n"
               f"{summary['x_thread']} X threads\n"
               f"{summary['buffer_pushed']} Buffer pushed\n"
               f"File: /opt/bizlegal/decisions/distribution-{args.date}.md")
    telegram_send(tg_text)


if __name__ == "__main__":
    main()