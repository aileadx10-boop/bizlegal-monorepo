#!/usr/bin/env python3
"""
competitor_content.py
=====================
Phase 5 of PLATFORM-BUILD-2026-07-02 — Spy subsystem.

Scrapes competitor blog RSS/sitemaps and checks which of BizLegal's
30 target keywords each competitor is covering. Gaps = opportunities.

Writes findings to Supabase `spy_intel` (intel_type='content_gap').
Fallback: JSON in /opt/bizlegal/decisions/.

Usage:
  python3 competitor_content.py
  python3 competitor_content.py --dry-run
"""
from __future__ import annotations

# ---------------------------------------------------------------------------
# Heartbeat
# ---------------------------------------------------------------------------
try:
    import sys as _sys, os as _os
    _sys.path.insert(0, _os.path.join(_os.path.dirname(__file__), '..', 'seo-agents'))
    from ops_heartbeat import ping_once as _ping
    _ping('hetzner/spy', status='alive', last_action='content-scan')
except Exception:
    pass

import argparse
import json
import os
import pathlib
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
VAULT_PATH = pathlib.Path('/opt/bizlegal/curator/.env')
DECISIONS_DIR = pathlib.Path('/opt/bizlegal/decisions')
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://ydghhcuuopqzgqcicubg.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))
USER_AGENT = 'Mozilla/5.0 (compatible; BizLegalSpyBot/1.0; +https://bizlegal-ai.com)'

# Competitor blog/sitemap endpoints
COMPETITOR_BLOGS = [
    {'name': 'drata',    'sitemap': 'https://drata.com/blog-sitemap.xml',        'blog': 'https://drata.com/blog'},
    {'name': 'vanta',    'sitemap': 'https://www.vanta.com/blog-sitemap.xml',     'blog': 'https://www.vanta.com/blog'},
    {'name': 'sprinto',  'sitemap': 'https://sprinto.com/blog/sitemap.xml',       'blog': 'https://sprinto.com/blog'},
    {'name': 'chainalysis', 'sitemap': 'https://www.chainalysis.com/sitemap.xml', 'blog': 'https://www.chainalysis.com/blog'},
]

# BizLegal's 30 target keywords to check coverage for
TARGET_KEYWORDS = [
    'mica compliance',
    'soc2 automation',
    'dpa review ai',
    'boi filing fintech',
    'vara license',
    'aml compliance crypto',
    'dao legal wrapper',
    'gdpr b2b saas',
    'travel rule compliance',
    'boi cta fintech',
    'psp risk assessment',
    'compliance health score',
    'contract risk analysis',
    'regulatory risk report',
    'blockchain kyc aml',
    'gdpr dpa processor',
    'iso 27001 b2b saas',
    'fintech compliance checklist',
    'crypto exchange compliance',
    'aml kyc automation',
    'sec reporting requirements',
    'fincen cta compliance',
    'web3 dao compliance',
    'real estate compliance cross-border',
    'eu ai act compliance',
    'llm compliance risk',
    'ai governance framework',
    'data processing agreement',
    'sub-processor compliance',
    'saas vendor security review',
]


# ---------------------------------------------------------------------------
# Env loading
# ---------------------------------------------------------------------------
def load_env() -> None:
    global SUPABASE_KEY
    if SUPABASE_KEY:
        return
    if not VAULT_PATH.exists():
        return
    for line in VAULT_PATH.read_text(encoding='utf-8').splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            os.environ.setdefault(k.strip(), v.strip())
    SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------
def _fetch(url: str, *, timeout: int = 20) -> str:
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode('utf-8', errors='replace')
    except Exception as e:
        print(f'  [fetch] {url}: {e}', file=sys.stderr)
        return ''


def _extract_urls(xml_or_html: str) -> list[str]:
    """Extract URLs from sitemap XML or HTML."""
    # Try sitemap <loc> tags first
    urls = re.findall(r'<loc>\s*(https?://[^\s<]+)\s*</loc>', xml_or_html)
    if urls:
        return urls
    # Fallback: extract all hrefs
    return re.findall(r'href=["\']?(https?://[^\s"\'<>]+)', xml_or_html)


def _url_matches_keyword(url: str, keyword: str) -> bool:
    """Check if a URL slug might cover this keyword."""
    slug = url.lower().rstrip('/')
    # Normalize keyword: spaces → dashes, remove special chars
    kw_slug = re.sub(r'[^a-z0-9]+', '-', keyword.lower()).strip('-')
    # Check if enough words from the keyword appear in the URL
    words = [w for w in kw_slug.split('-') if len(w) > 3]
    if not words:
        return False
    matches = sum(1 for w in words if w in slug)
    return matches >= max(1, len(words) // 2)


# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------
def supabase_insert(rows: list[dict]) -> bool:
    if not SUPABASE_KEY:
        return False
    url = SUPABASE_URL + '/rest/v1/spy_intel'
    req = urllib.request.Request(
        url,
        data=json.dumps(rows).encode(),
        method='POST',
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status in (200, 201)
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')[:200]
        print(f'  [supabase] HTTP {e.code}: {body}', file=sys.stderr)
        return False
    except Exception as e:
        print(f'  [supabase] {e}', file=sys.stderr)
        return False


def write_fallback_json(data: dict) -> pathlib.Path:
    DECISIONS_DIR.mkdir(parents=True, exist_ok=True)
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    out = DECISIONS_DIR / f'spy-content-gaps-{today}.json'
    out.write_text(json.dumps(data, indent=2), encoding='utf-8')
    return out


# ---------------------------------------------------------------------------
# Analysis
# ---------------------------------------------------------------------------
def analyze_competitor(comp: dict) -> dict:
    name = comp['name']
    print(f'[spy/content] scanning {name}')

    # Try sitemap first, fall back to blog HTML
    content = _fetch(comp['sitemap'])
    if not content:
        print(f'  sitemap failed, trying blog page')
        content = _fetch(comp['blog'])

    urls = _extract_urls(content)
    print(f'  found {len(urls)} URLs')

    covered: list[str] = []
    gaps: list[str] = []

    for kw in TARGET_KEYWORDS:
        hits = [u for u in urls if _url_matches_keyword(u, kw)]
        if hits:
            covered.append(kw)
        else:
            gaps.append(kw)

    return {
        'competitor': name,
        'urls_scanned': len(urls),
        'keywords_covered': covered,
        'keywords_missing': gaps,
        'coverage_pct': round(len(covered) / len(TARGET_KEYWORDS) * 100, 1),
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def run(dry_run: bool = False) -> None:
    load_env()
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    all_results = []
    rows = []

    for comp in COMPETITOR_BLOGS:
        result = analyze_competitor(comp)
        all_results.append(result)

        # One spy_intel row per competitor summarizing gaps
        finding = (
            f"Coverage: {result['coverage_pct']}% of BizLegal keywords. "
            f"Missing: {', '.join(result['keywords_missing'][:10])}{'...' if len(result['keywords_missing']) > 10 else ''}. "
            f"Covered: {len(result['keywords_covered'])} of {len(TARGET_KEYWORDS)}."
        )
        rows.append({
            'intel_type': 'content_gap',
            'competitor': comp['name'],
            'finding': finding,
            'source_url': comp['blog'],
            'raw_data': result,
            'relevance_score': 70,
        })
        time.sleep(1)

    summary = {
        'date': today,
        'target_keywords': TARGET_KEYWORDS,
        'competitors': all_results,
        'opportunities': [
            kw for kw in TARGET_KEYWORDS
            if all(kw in r['keywords_missing'] for r in all_results)
        ],
    }
    print(f'[spy/content] {len(summary["opportunities"])} keyword opportunities not covered by any competitor')

    if dry_run:
        print(f'[spy/content] DRY RUN — would write {len(rows)} row(s) to spy_intel:')
        for r in rows:
            print(f'  {r["competitor"]}: {r["finding"][:100]}')
        return

    ok = supabase_insert(rows)
    if ok:
        print(f'[spy/content] wrote {len(rows)} row(s) to spy_intel')
    else:
        path = write_fallback_json(summary)
        print(f'[spy/content] Supabase insert failed — wrote fallback to {path}')


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dry-run', action='store_true', help='Print what would be written; no writes')
    args = ap.parse_args()
    run(dry_run=args.dry_run)
    return 0


if __name__ == '__main__':
    sys.exit(main())
