"""
Agent B — Visual Asset Generator
=================================

Daily cron: 05:00 UTC
Input:   Recently enriched blog articles (MDX without a hero PNG)
Output:  Hero PNG (1200x630 OG) + inline infographic (800x2000 vertical)
         Committed to bizlegal-ea content/blog/_assets/

Run: python3 visual_assets.py [--limit 30]
Cost: ~$0.06/image via OpenAI gpt-image-1 standard. Budget ~$5/day for 80 images.

Owner: Hermes / Moses
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
import base64
from pathlib import Path
from datetime import datetime

# Config
CONTENT_DIR = Path('/opt/bizlegal/curator/drafts')
ASSETS_DIR = CONTENT_DIR  # _assets live alongside the MDX
GH_TOKEN = os.environ.get('GH_TOKEN', '')
BLOG_REPO = 'bizlegal-ea'
BLOG_BRANCH = 'main'
OPENAI_KEY = os.environ.get('OPENAI_API_KEY', '')

# Re-use the enricher's source authority for badge consistency
HERO_SIZE = '1536x1024'   # gpt-image-1 supported; cover crop to 1200x630
INLINE_SIZE = '1024x1792'  # vertical infographic


def get_mdx_metadata(mdx: str) -> dict:
    """Extract title, first paragraph, key entities from MDX."""
    import re
    h1 = re.search(r'^#\s+(.+)$', mdx, re.MULTILINE)
    title = h1.group(1).strip() if h1 else 'BizLegal AI'
    # First meaningful paragraph
    para = re.search(r'(?<=\n\n)([^\n#|>].{60,500}?)\n', mdx)
    summary = para.group(1).strip() if para else ''
    return {'title': title, 'summary': summary[:500]}


def build_hero_prompt(meta: dict) -> str:
    """Build a prompt for the OG hero image."""
    return (
        f"Clean editorial cover image for a regulatory compliance article. "
        f"Title: '{meta['title']}'. "
        f"Style: minimal flat-design infographic, deep navy background (#0B1220), "
        f"single accent color (electric blue #2563EB), sans-serif typography mockup, "
        f"abstract regulatory symbols (scales, shield, document, chain links), "
        f"no text rendered, professional B2B financial services aesthetic, "
        f"suitable for Open Graph / Twitter card 1200x630."
    )


def build_inline_prompt(meta: dict) -> str:
    return (
        f"Vertical infographic (3:5 aspect) summarizing: '{meta['title']}'. "
        f"Style: clean editorial flowchart with 4-6 numbered steps, "
        f"deep navy background, electric blue accent, white typography, "
        f"abstract regulatory framework symbols (jurisdictions, regulators, compliance steps), "
        f"minimal text, professional B2B compliance industry aesthetic, "
        f"vertical 800x2000 layout."
    )


def generate_image(prompt: str, size: str, out_path: Path) -> bool:
    """Call OpenAI Images API and save PNG. Returns True on success."""
    if not OPENAI_KEY:
        print(f'  [SKIP] OPENAI_API_KEY not set, would have generated {out_path.name}')
        return False
    body = json.dumps({
        'model': 'gpt-image-1',
        'prompt': prompt,
        'n': 1,
        'size': size,
    }).encode()
    req = urllib.request.Request(
        'https://api.openai.com/v1/images/generations',
        data=body,
        headers={
            'Authorization': f'Bearer {OPENAI_KEY}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )
    try:
        r = urllib.request.urlopen(req, timeout=120)
        d = json.loads(r.read())
        b64 = d['data'][0]['b64_json']
        out_path.write_bytes(base64.b64decode(b64))
        return True
    except urllib.error.HTTPError as e:
        body_err = e.read().decode()[:300]
        print(f'  [ERR] {out_path.name}: {e.code} {body_err}')
        return False
    except Exception as e:
        print(f'  [ERR] {out_path.name}: {e}')
        return False


def commit_asset(slug: str, asset_path: Path, kind: str) -> bool:
    """Commit the generated image to bizlegal-ea."""
    if not GH_TOKEN:
        return False
    REPO = f'aileadx10-boop/{BLOG_REPO}'
    HEADERS = {
        'Authorization': f'token {GH_TOKEN}',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'BizLegalSEOBot/1.0',
        'Content-Type': 'application/json',
    }
    path = f'projects/bizlegal-seo-site/content/blog/_assets/{asset_path.name}'
    try:
        req = urllib.request.Request(
            f'https://api.github.com/repos/{REPO}/contents/{path}?ref={BLOG_BRANCH}',
            headers=HEADERS
        )
        r = urllib.request.urlopen(req, timeout=10)
        sha = json.loads(r.read())['sha']
    except urllib.error.HTTPError:
        sha = None
    body = {
        'message': f'asset(blog): {slug} {kind}',
        'content': base64.b64encode(asset_path.read_bytes()).decode(),
        'branch': BLOG_BRANCH,
    }
    if sha:
        body['sha'] = sha
    try:
        req = urllib.request.Request(
            f'https://api.github.com/repos/{REPO}/contents/{path}',
            headers=HEADERS,
            method='PUT',
            data=json.dumps(body).encode()
        )
        urllib.request.urlopen(req, timeout=60)
        return True
    except Exception as e:
        print(f'  [ERR] GH push {asset_path.name}: {e}')
        return False


def main():
    limit = int([a for a in sys.argv if a.startswith('--limit=')][0].split('=')[1]) if any('--limit=' in a for a in sys.argv) else 30
    dry_run = '--dry-run' in sys.argv

    # Find articles without hero PNGs
    candidates = []
    for mdx_path in sorted(CONTENT_DIR.glob('*.mdx'), key=lambda p: p.stat().st_mtime, reverse=True):
        slug = mdx_path.stem
        hero = ASSETS_DIR / f'{slug}-hero.png'
        if not hero.exists():
            candidates.append(mdx_path)
        if len(candidates) >= limit:
            break

    print(f'[visual_assets] {datetime.utcnow().date()} — {len(candidates)} articles need images (dry_run={dry_run})')

    generated = 0
    for mdx_path in candidates:
        slug = mdx_path.stem
        mdx = mdx_path.read_text(encoding='utf-8', errors='ignore')
        meta = get_mdx_metadata(mdx)
        hero_path = ASSETS_DIR / f'{slug}-hero.png'
        inline_path = ASSETS_DIR / f'{slug}-inline.png'

        # Hero
        if not hero_path.exists():
            ok = generate_image(build_hero_prompt(meta), HERO_SIZE, hero_path)
            if ok and not dry_run:
                commit_asset(slug, hero_path, 'hero')
            time.sleep(1)  # rate limit
        # Inline
        if not inline_path.exists():
            ok = generate_image(build_inline_prompt(meta), INLINE_SIZE, inline_path)
            if ok and not dry_run:
                commit_asset(slug, inline_path, 'inline')
            time.sleep(1)
        generated += 1
        print(f'  {"[DRY]" if dry_run else "✓"} {slug}')

    print(f'[visual_assets] done. {generated} articles processed.')


if __name__ == '__main__':
    main()
