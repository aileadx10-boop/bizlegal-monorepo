#!/usr/bin/env python3
"""
builder_github.py — GitHub Content Publisher
Commits approved article drafts to the Next.js repo as MDX files.
Triggers Vercel redeploy via GitHub push.

Usage:
  python3 builder_github.py --input gaps/qa-YYYY-MM-DD.json
  python3 builder_github.py --draft '{"slug":"...", "body_markdown":"..."}'
"""

import json
import sys
import argparse
import logging
import os
import subprocess
import tempfile
from datetime import date
from pathlib import Path

LOG_PATH = Path("/opt/bizlegal/logs/builder.log")
REPO_PATH = Path(os.environ.get("BIZLEGAL_REPO_PATH", "/opt/bizlegal/repo/bizlegal-ai"))
POSTS_DIR = REPO_PATH / "app" / "posts"
BRANCH = os.environ.get("GITHUB_BRANCH", "claude/automate-github-setup-8Yd6U")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [builder] %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, mode="a"),
        logging.StreamHandler(sys.stderr),
    ],
)
log = logging.getLogger("builder")


# ── MDX Template ────────────────────────────────────────────
def build_mdx(draft: dict) -> str:
    products_str = json.dumps(draft.get("products_impacted", []))
    dates_str = json.dumps(draft.get("key_dates", []))

    return f"""---
title: "{draft['title']}"
slug: "{draft['slug']}"
category: "{draft.get('category', 'GENERAL')}"
jurisdiction: "{draft.get('jurisdiction', 'GLOBAL')}"
risk_level: {draft.get('risk_level', 50)}
meta_description: "{draft.get('meta_description', '')}"
published_at: "{draft.get('published_at', date.today().isoformat())}"
products: {products_str}
key_dates: {dates_str}
source_url: "{draft.get('source_url', '')}"
status: "live"
---

{draft['body_markdown']}

---

**[{draft.get('cta_text', 'Analyze your risk')} →]({draft.get('cta_href', '/risk-engine')})**

*This article is regulatory intelligence, not legal advice. Always consult qualified counsel for jurisdiction-specific guidance.*
"""


def run_git(cmd: list[str], cwd: Path = None) -> tuple[bool, str]:
    cwd = cwd or REPO_PATH
    try:
        result = subprocess.run(
            cmd, cwd=str(cwd), capture_output=True, text=True, timeout=60
        )
        if result.returncode != 0:
            log.error(f"git error: {result.stderr}")
            return False, result.stderr
        return True, result.stdout.strip()
    except subprocess.TimeoutExpired:
        log.error(f"git timeout: {' '.join(cmd)}")
        return False, "timeout"
    except Exception as e:
        log.error(f"git exception: {e}")
        return False, str(e)


def publish_draft(draft: dict) -> bool:
    slug = draft.get("slug")
    if not slug:
        log.error("Draft has no slug — skipping")
        return False

    post_dir = POSTS_DIR / slug
    post_dir.mkdir(parents=True, exist_ok=True)

    mdx_content = build_mdx(draft)
    mdx_path = post_dir / "content.mdx"

    # Check if already exists
    if mdx_path.exists():
        log.warning(f"Post already exists: {slug} — skipping")
        return False

    mdx_path.write_text(mdx_content, encoding="utf-8")
    log.info(f"Wrote: {mdx_path}")

    # Git operations
    ok, out = run_git(["git", "checkout", BRANCH])
    if not ok:
        log.error(f"Failed to checkout branch {BRANCH}")
        return False

    ok, out = run_git(["git", "pull", "origin", BRANCH])
    if not ok:
        log.warning(f"Pull failed (may be ok if new): {out}")

    ok, out = run_git(["git", "add", str(mdx_path)])
    if not ok:
        return False

    commit_msg = f"content: {draft['title'][:72]} [{slug}]"
    ok, out = run_git(["git", "commit", "-m", commit_msg])
    if not ok:
        log.error(f"Commit failed for {slug}")
        return False

    log.info(f"Committed: {commit_msg}")

    # Push with retry
    for attempt in range(1, 4):
        ok, out = run_git(["git", "push", "-u", "origin", BRANCH])
        if ok:
            log.info(f"Pushed {slug} to {BRANCH}")
            return True
        log.warning(f"Push attempt {attempt} failed: {out}")
        import time
        time.sleep(2 ** attempt)

    log.error(f"Push failed after 3 attempts for {slug}")
    return False


def main():
    parser = argparse.ArgumentParser(description="BizLegal GitHub Content Builder")
    parser.add_argument("--input", type=str, help="QA-approved drafts JSON")
    parser.add_argument("--draft", type=str, help="Single draft JSON")
    args = parser.parse_args()

    if args.draft:
        draft = json.loads(args.draft)
        success = publish_draft(draft)
        sys.exit(0 if success else 1)

    today = date.today().isoformat()
    input_path = Path(args.input or f"/opt/bizlegal/gaps/qa-{today}.json")

    if not input_path.exists():
        log.error(f"Input not found: {input_path}")
        sys.exit(1)

    with open(input_path) as f:
        data = json.load(f)

    drafts = data.get("approved", data if isinstance(data, list) else [])
    log.info(f"Publishing {len(drafts)} approved drafts")

    published = 0
    for draft in drafts:
        if publish_draft(draft):
            published += 1

    log.info(f"Done: {published}/{len(drafts)} published")
    if published == 0 and len(drafts) > 0:
        sys.exit(2)


if __name__ == "__main__":
    main()
