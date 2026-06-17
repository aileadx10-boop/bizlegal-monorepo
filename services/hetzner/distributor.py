"""
Hetzner curator — social distribution agent (Agent S1).

For each published article with no distributed_at, generates:
  - LinkedIn post (150-200 words, English, professional)
  - X/Twitter thread (5 tweets, ≤280 chars each)
  - Substack teaser (80-100 words)

Writes output to /opt/bizlegal/curator/social/{slug}.json and marks
the Supabase row distributed_at = now().

Usage:
    python distributor.py               # all undistributed articles
    python distributor.py --slug <slug> # one specific article
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import httpx
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

ANTHROPIC_KEY = os.environ["ANTHROPIC_API_KEY"]
# Haiku — cheap model, 3-format generation per article is a simple task
HAIKU_MODEL = "claude-haiku-4-5-20251001"
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"

SOCIAL_DIR = Path("/opt/bizlegal/curator/social")

DISTRIBUTION_PROMPT = """\
You are a compliance-industry content strategist for BizLegal AI.

Given the article below, produce distribution copy for 3 channels.
Output STRICT JSON only — no code fences, no prose wrapper.

Article title: {title}
Article URL: {blog_url}
Article summary: {summary}

OUTPUT JSON:
{{
  "linkedin": "<150-200 word English post. Start with a counterintuitive hook fact \
from the article. End with 'Link in first comment →'. Include 3-5 relevant hashtags \
(#Compliance #RegTech #FinTech #MiCA #SEC etc.) on the last line. Do NOT use AI-tell \
phrases like 'it's important to note', 'delve into', 'in conclusion'.>",

  "x_thread": [
    "<Tweet 1: hook — counterintuitive or surprising fact, ≤280 chars>",
    "<Tweet 2: key point 1, ≤280 chars>",
    "<Tweet 3: key point 2, ≤280 chars>",
    "<Tweet 4: key point 3 or practical implication, ≤280 chars>",
    "<Tweet 5: CTA — 'Full breakdown: {blog_url}' + 1-2 relevant hashtags, ≤280 chars>"
  ],

  "substack": "<80-100 word teaser. Compelling, not sales-y. Ends with: \
'Read the full analysis → {blog_url}'>"
}}
""".strip()


def _call_haiku(prompt: str) -> dict:
    res = httpx.post(
        ANTHROPIC_URL,
        headers={
            "x-api-key": ANTHROPIC_KEY,
            "anthropic-version": ANTHROPIC_VERSION,
            "content-type": "application/json",
        },
        json={
            "model": HAIKU_MODEL,
            "max_tokens": 2048,
            "temperature": 0.4,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=60,
    )
    res.raise_for_status()
    body = res.json()
    text = next(
        (c["text"] for c in body.get("content", []) if c.get("type") == "text"), ""
    )
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)
    m = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if m:
        cleaned = m.group(0)
    return json.loads(cleaned)


def distribute_article(sb: Client, row: dict) -> bool:
    slug = row.get("draft_slug") or ""
    title = row.get("title") or ""
    blog_url = row.get("blog_url") or ""
    summary = row.get("summary") or row.get("short_thesis") or ""

    if not (slug and blog_url):
        print(f"[distributor] skip {slug or title[:40]} — missing slug or blog_url")
        return False

    out_path = SOCIAL_DIR / f"{slug}.json"
    if out_path.exists():
        print(f"[distributor] {slug}: already distributed, skipping")
        return True

    print(f"[distributor] {slug}: generating distribution copy…")
    prompt = DISTRIBUTION_PROMPT.format(
        title=title, blog_url=blog_url, summary=summary[:400]
    )

    try:
        content = _call_haiku(prompt)
    except Exception as err:
        print(f"[distributor] {slug}: Haiku call failed — {err}")
        return False

    # Validate structure
    if not all(k in content for k in ("linkedin", "x_thread", "substack")):
        print(f"[distributor] {slug}: malformed response — missing keys")
        return False

    if not isinstance(content["x_thread"], list) or len(content["x_thread"]) != 5:
        print(f"[distributor] {slug}: x_thread must be 5-element list")
        return False

    now = datetime.now(timezone.utc).isoformat()
    output = {
        "slug": slug,
        "blog_url": blog_url,
        "title": title,
        "distributed_at": now,
        "linkedin": content["linkedin"],
        "x_thread": content["x_thread"],
        "substack": content["substack"],
    }

    SOCIAL_DIR.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[distributor] {slug}: written to {out_path}")

    sb.table("daily_gaps").update({"distributed_at": now}).eq("url", row["url"]).execute()
    print(f"[distributor] {slug}: marked distributed in Supabase")
    return True


def run(slug_filter: str | None = None) -> None:
    sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SECRET"])

    if slug_filter:
        rows = (
            sb.table("daily_gaps")
            .select("*")
            .eq("draft_slug", slug_filter)
            .execute()
        )
    else:
        rows = (
            sb.table("daily_gaps")
            .select("*")
            .eq("status", "published")
            .is_("distributed_at", "null")
            .execute()
        )

    if not rows.data:
        print("[distributor] nothing to distribute")
        return

    print(f"[distributor] {len(rows.data)} articles to distribute")
    ok = failed = 0
    for row in rows.data:
        if distribute_article(sb, row):
            ok += 1
        else:
            failed += 1

    print(f"[distributor] done — {ok} ok, {failed} failed")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug", default=None, help="Distribute a single article by draft_slug")
    args = parser.parse_args()
    run(slug_filter=args.slug)
