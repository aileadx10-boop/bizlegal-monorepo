#!/usr/bin/env python3
"""
competitor_social.py
====================
Phase 5 of PLATFORM-BUILD-2026-07-02 — Spy subsystem.

Monitors HackerNews (Algolia API) and Reddit JSON API for competitor mentions.
No auth required for either API.

Competitors monitored: vanta, drata, sprinto, chainalysis

Writes findings to Supabase `spy_intel` (intel_type='social_signal').
Fallback: JSON in /opt/bizlegal/decisions/.

Usage:
  python3 competitor_social.py
  python3 competitor_social.py --dry-run
"""
from __future__ import annotations

# ---------------------------------------------------------------------------
# Heartbeat
# ---------------------------------------------------------------------------
try:
    import sys as _sys, os as _os
    _sys.path.insert(0, _os.path.join(_os.path.dirname(__file__), '..', 'seo-agents'))
    from ops_heartbeat import ping_once as _ping
    _ping('hetzner/spy', status='alive', last_action='social-scan')
except Exception:
    pass

import argparse
import json
import os
import pathlib
import sys
import time
import urllib.error
import urllib.request
import urllib.parse
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
VAULT_PATH = pathlib.Path('/opt/bizlegal/curator/.env')
DECISIONS_DIR = pathlib.Path('/opt/bizlegal/decisions')
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://ydghhcuuopqzgqcicubg.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))
USER_AGENT = 'Mozilla/5.0 (compatible; BizLegalSpyBot/1.0; +https://bizlegal-ai.com)'

COMPETITORS = ['vanta', 'drata', 'sprinto', 'chainalysis']

# HN Algolia: https://hn.algolia.com/api — no auth
HN_SEARCH_BASE = 'https://hn.algolia.com/api/v1/search?hitsPerPage=20&query='

# Reddit search JSON: no auth (rate limit: ~30 req/min)
REDDIT_SEARCH_BASE = 'https://www.reddit.com/search.json?limit=10&q='
REDDIT_SUBREDDITS = [
    'r/compliance',
    'r/cybersecurity',
    'r/fintech',
    'r/crypto',
    'r/startup',
    'r/entrepreneur',
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
def _fetch_json(url: str, *, timeout: int = 15) -> dict | list | None:
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read())
    except Exception as e:
        print(f'  [fetch] {url[:80]}: {e}', file=sys.stderr)
        return None


# ---------------------------------------------------------------------------
# HN Algolia
# ---------------------------------------------------------------------------
def search_hn(competitor: str) -> list[dict]:
    url = HN_SEARCH_BASE + urllib.parse.quote(competitor)
    data = _fetch_json(url)
    if not data or 'hits' not in data:
        return []
    results = []
    for hit in data['hits']:
        results.append({
            'source': 'hackernews',
            'title': hit.get('title') or hit.get('story_title', ''),
            'url': hit.get('url') or f"https://news.ycombinator.com/item?id={hit.get('objectID', '')}",
            'points': hit.get('points', 0),
            'comments': hit.get('num_comments', 0),
            'created_at': hit.get('created_at', ''),
        })
    return results


# ---------------------------------------------------------------------------
# Reddit JSON API
# ---------------------------------------------------------------------------
def search_reddit(competitor: str) -> list[dict]:
    url = REDDIT_SEARCH_BASE + urllib.parse.quote(competitor) + '&sort=new&type=link'
    data = _fetch_json(url)
    if not data:
        return []
    results = []
    try:
        for child in data['data']['children']:
            post = child['data']
            results.append({
                'source': 'reddit',
                'title': post.get('title', ''),
                'url': f"https://reddit.com{post.get('permalink', '')}",
                'points': post.get('score', 0),
                'comments': post.get('num_comments', 0),
                'subreddit': post.get('subreddit_name_prefixed', ''),
                'created_at': datetime.fromtimestamp(
                    post.get('created_utc', 0), tz=timezone.utc
                ).isoformat() if post.get('created_utc') else '',
            })
    except (KeyError, TypeError):
        pass
    return results


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
    out = DECISIONS_DIR / f'spy-social-{today}.json'
    out.write_text(json.dumps(data, indent=2), encoding='utf-8')
    return out


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def run(dry_run: bool = False) -> None:
    load_env()
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    all_findings: dict[str, list[dict]] = {}
    rows: list[dict] = []

    for competitor in COMPETITORS:
        print(f'[spy/social] scanning {competitor}')
        hn_results = search_hn(competitor)
        time.sleep(1)
        reddit_results = search_reddit(competitor)
        time.sleep(2)  # Reddit rate limit is tighter

        combined = hn_results + reddit_results
        all_findings[competitor] = combined

        if not combined:
            print(f'  no mentions found')
            continue

        # High-signal posts (points > 10 or comments > 5)
        high_signal = [r for r in combined if r.get('points', 0) > 10 or r.get('comments', 0) > 5]
        print(f'  {len(combined)} mentions ({len(high_signal)} high-signal)')

        for post in combined[:10]:  # cap at 10 per competitor
            finding = (
                f"[{post['source'].upper()}] {post['title'][:200]} "
                f"({post.get('points', 0)} pts, {post.get('comments', 0)} comments)"
            )
            rows.append({
                'intel_type': 'social_signal',
                'competitor': competitor,
                'finding': finding,
                'source_url': post.get('url', ''),
                'raw_data': post,
                'relevance_score': min(95, 40 + post.get('points', 0) // 2 + post.get('comments', 0)),
            })

    summary = {'date': today, 'findings': all_findings}

    if dry_run:
        print(f'[spy/social] DRY RUN — would write {len(rows)} row(s) to spy_intel:')
        for r in rows[:5]:
            print(f'  {r["competitor"]}: {r["finding"][:100]}')
        if len(rows) > 5:
            print(f'  ... and {len(rows) - 5} more')
        return

    if not rows:
        print('[spy/social] no signal found across all competitors')
        return

    ok = supabase_insert(rows)
    if ok:
        print(f'[spy/social] wrote {len(rows)} row(s) to spy_intel')
    else:
        path = write_fallback_json(summary)
        print(f'[spy/social] Supabase insert failed — wrote fallback to {path}')


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dry-run', action='store_true', help='Print what would be written; no writes')
    args = ap.parse_args()
    run(dry_run=args.dry_run)
    return 0


if __name__ == '__main__':
    sys.exit(main())
