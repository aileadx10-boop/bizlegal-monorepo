#!/usr/bin/env python3
"""
publisher_buffer.py — Social Media Publisher via Buffer API
Schedules social posts for published intelligence articles.
Platforms: LinkedIn, Twitter/X, Instagram, Facebook, Pinterest.

Usage:
  python3 publisher_buffer.py --slug sec-defi-exchange-reporting-2026
  python3 publisher_buffer.py --input gaps/qa-YYYY-MM-DD.json
"""

import json
import sys
import os
import argparse
import logging
from datetime import date, datetime, timedelta
from pathlib import Path
import requests

LOG_PATH = Path("/opt/bizlegal/logs/publisher.log")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [buffer] %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, mode="a"),
        logging.StreamHandler(sys.stderr),
    ],
)
log = logging.getLogger("buffer")

BUFFER_API = "https://api.bufferapp.com/1"
BUFFER_TOKEN = os.environ.get("BUFFER_ACCESS_TOKEN", "")
SITE_URL = "https://bizlegal-ai.com"

# Profile IDs from Buffer account (set in .env)
PROFILES = {
    "linkedin": os.environ.get("BUFFER_LINKEDIN_ID", ""),
    "twitter": os.environ.get("BUFFER_TWITTER_ID", ""),
    "instagram": os.environ.get("BUFFER_INSTAGRAM_ID", ""),
    "facebook": os.environ.get("BUFFER_FACEBOOK_ID", ""),
    "pinterest": os.environ.get("BUFFER_PINTEREST_ID", ""),
}


# ── Post templates ───────────────────────────────────────────
def build_linkedin_post(draft: dict) -> str:
    risk = draft.get("risk_level", 50)
    risk_label = "HIGH" if risk >= 70 else "MEDIUM" if risk >= 50 else "LOW"
    category = draft.get("category", "REGULATORY")
    title = draft.get("title", "")
    slug = draft.get("slug", "")
    cta = draft.get("cta_text", "Read full analysis")
    key_points = [s.strip() for s in draft.get("body_markdown", "").split("\n")
                  if s.startswith("- ") or s.startswith("• ")][:3]
    points_text = "\n".join(f"→ {p.lstrip('- ').lstrip('• ')}" for p in key_points) or "→ See full analysis"

    return f"""⚠️ {category} Alert — Risk Level: {risk_label} ({risk}/100)

{title}

{points_text}

Full analysis + compliance guidance:
{SITE_URL}/posts/{slug}

#FinTech #Compliance #{category} #BizLegalAI #RegulatoryIntelligence"""


def build_twitter_post(draft: dict) -> str:
    risk = draft.get("risk_level", 50)
    title = draft.get("title", "")[:180]
    slug = draft.get("slug", "")
    emoji = "🔴" if risk >= 70 else "🟡" if risk >= 50 else "🟢"
    return f"""{emoji} {title}

Risk: {risk}/100 | {draft.get('category', 'REG')} | {draft.get('jurisdiction', 'GLOBAL')}

{SITE_URL}/posts/{slug} #BizLegalAI"""


def build_instagram_caption(draft: dict) -> str:
    title = draft.get("title", "")
    category = draft.get("category", "REGULATORY")
    slug = draft.get("slug", "")
    return f"""{category} Update 🔍

{title}

Full analysis via link in bio.

#FinTech #Crypto #Compliance #RegulatoryIntelligence #BizLegalAI #{category}"""


# ── Schedule logic ───────────────────────────────────────────
def next_schedule_slot(platform: str) -> str:
    """Return next optimal posting time for each platform."""
    now = datetime.utcnow()
    schedules = {
        "linkedin": [9, 11, 17],   # 09:00, 11:00, 17:00 CET
        "twitter": [8, 12, 18, 21],
        "instagram": [10, 19],
        "facebook": [9, 13],
        "pinterest": [20],
    }
    hours = schedules.get(platform, [9])

    # Find next slot today, else tomorrow first slot
    for h in hours:
        candidate = now.replace(hour=h, minute=0, second=0, microsecond=0)
        if candidate > now + timedelta(minutes=30):
            return candidate.strftime("%Y-%m-%dT%H:%M:%S+00:00")

    tomorrow = now + timedelta(days=1)
    return tomorrow.replace(hour=hours[0], minute=0, second=0, microsecond=0).strftime("%Y-%m-%dT%H:%M:%S+00:00")


def schedule_post(profile_id: str, text: str, platform: str, scheduled_at: str = None) -> bool:
    if not BUFFER_TOKEN:
        log.error("BUFFER_ACCESS_TOKEN not set")
        return False
    if not profile_id:
        log.warning(f"No profile ID for {platform} — skipping")
        return False

    payload = {
        "profile_ids[]": profile_id,
        "text": text,
        "scheduled_at": scheduled_at or next_schedule_slot(platform),
        "access_token": BUFFER_TOKEN,
    }

    try:
        r = requests.post(f"{BUFFER_API}/updates/create.json", data=payload, timeout=15)
        r.raise_for_status()
        result = r.json()
        if result.get("success"):
            log.info(f"  ✓ Scheduled on {platform}: {scheduled_at or 'auto'}")
            return True
        else:
            log.error(f"  ✗ Buffer error on {platform}: {result}")
            return False
    except Exception as e:
        log.error(f"  ✗ {platform} post failed: {e}")
        return False


def publish_article(draft: dict) -> dict:
    results = {}
    risk = draft.get("risk_level", 50)

    # LinkedIn — always
    results["linkedin"] = schedule_post(
        PROFILES["linkedin"],
        build_linkedin_post(draft),
        "linkedin",
    )

    # Twitter — always; real-time for urgent (risk >= 80)
    twitter_time = None  # immediate for high risk
    if risk < 80:
        twitter_time = next_schedule_slot("twitter")
    results["twitter"] = schedule_post(
        PROFILES["twitter"],
        build_twitter_post(draft),
        "twitter",
        twitter_time,
    )

    # Instagram — 2x/week (schedule for next slot)
    results["instagram"] = schedule_post(
        PROFILES["instagram"],
        build_instagram_caption(draft),
        "instagram",
    )

    # Facebook
    results["facebook"] = schedule_post(
        PROFILES["facebook"],
        build_linkedin_post(draft),  # reuse LinkedIn copy
        "facebook",
    )

    published = sum(1 for v in results.values() if v)
    log.info(f"Scheduled {published}/4 platforms for: {draft.get('slug')}")
    return results


def main():
    parser = argparse.ArgumentParser(description="BizLegal Social Publisher (Buffer)")
    parser.add_argument("--input", type=str, help="QA-approved drafts JSON")
    parser.add_argument("--slug", type=str, help="Specific slug to publish (from Supabase)")
    parser.add_argument("--dry-run", action="store_true", help="Preview posts without scheduling")
    args = parser.parse_args()

    if args.dry_run:
        log.info("DRY RUN — posts will be previewed but not scheduled")

    if args.slug:
        # Would normally fetch from Supabase — stub for now
        log.info(f"Single slug mode: {args.slug}")
        draft = {"slug": args.slug, "title": args.slug, "risk_level": 60, "category": "GENERAL"}
        if not args.dry_run:
            publish_article(draft)
        else:
            print(build_linkedin_post(draft))
            print("---")
            print(build_twitter_post(draft))
        return

    today = date.today().isoformat()
    input_path = Path(args.input or f"/opt/bizlegal/gaps/qa-{today}.json")

    if not input_path.exists():
        log.error(f"Input not found: {input_path}")
        sys.exit(1)

    with open(input_path) as f:
        data = json.load(f)

    drafts = data.get("approved", data if isinstance(data, list) else [])
    log.info(f"Scheduling {len(drafts)} articles to social")

    for draft in drafts:
        if args.dry_run:
            print(f"\n=== {draft.get('slug')} ===")
            print(build_linkedin_post(draft))
            print("---")
            print(build_twitter_post(draft))
        else:
            publish_article(draft)


if __name__ == "__main__":
    main()
