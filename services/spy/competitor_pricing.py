#!/usr/bin/env python3
"""
competitor_pricing.py
=====================
Phase 5 of PLATFORM-BUILD-2026-07-02 — Spy subsystem.

Scrapes competitor pricing pages (vanta, drata, sprinto, chainalysis),
sends the HTML to Anthropic for structured pricing extraction, and
writes findings to Supabase `spy_intel` table.

Fallback: if Supabase is unavailable, writes JSON to /opt/bizlegal/decisions/.

Usage:
  python3 competitor_pricing.py
  python3 competitor_pricing.py --dry-run
"""
from __future__ import annotations

# ---------------------------------------------------------------------------
# Heartbeat — non-fatal if ops_heartbeat module not present
# ---------------------------------------------------------------------------
try:
    import sys as _sys, os as _os
    _sys.path.insert(0, _os.path.join(_os.path.dirname(__file__), '..', 'seo-agents'))
    from ops_heartbeat import ping_once as _ping
    _ping('hetzner/spy', status='alive', last_action='starting')
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
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')
USER_AGENT = 'Mozilla/5.0 (compatible; BizLegalSpyBot/1.0; +https://bizlegal-ai.com)'

COMPETITORS = [
    {'name': 'vanta', 'url': 'https://www.vanta.com/pricing'},
    {'name': 'drata', 'url': 'https://drata.com/pricing'},
    {'name': 'sprinto', 'url': 'https://sprinto.com/pricing'},
    {'name': 'chainalysis', 'url': 'https://www.chainalysis.com/pricing'},
]


# ---------------------------------------------------------------------------
# Env loading
# ---------------------------------------------------------------------------
def load_env() -> None:
    global SUPABASE_KEY, ANTHROPIC_API_KEY
    if SUPABASE_KEY and ANTHROPIC_API_KEY:
        return
    if not VAULT_PATH.exists():
        return
    for line in VAULT_PATH.read_text(encoding='utf-8').splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            os.environ.setdefault(k.strip(), v.strip())
    SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')


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


def _strip_tags(html: str) -> str:
    """Very light HTML → text: remove tags, collapse whitespace."""
    text = re.sub(r'<style[^>]*>.*?</style>', ' ', html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<script[^>]*>.*?</script>', ' ', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()[:6000]  # cap at 6K chars for Anthropic


def anthropic_parse_pricing(competitor: str, page_text: str, api_key: str) -> str:
    """Ask Anthropic to extract pricing tiers and key price points from raw page text."""
    prompt = (
        f'You are a competitive intelligence analyst. Below is the text from {competitor}\'s '
        f'pricing page. Extract: tier names, prices (monthly/annual), key features per tier, '
        f'and any notable positioning. Return a concise JSON object with keys: '
        f'"tiers" (list), "price_range", "key_differentiators", "positioning_summary". '
        f'If pricing is hidden/enterprise-only, note that. Keep it under 400 tokens.\n\n'
        f'PAGE TEXT:\n{page_text}'
    )
    body = json.dumps({
        'model': 'claude-haiku-4-5',
        'max_tokens': 500,
        'messages': [{'role': 'user', 'content': prompt}],
    }).encode()
    req = urllib.request.Request(
        'https://api.anthropic.com/v1/messages',
        data=body, method='POST',
        headers={
            'Content-Type': 'application/json',
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01',
            'User-Agent': USER_AGENT,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.loads(r.read())
            return data['content'][0]['text']
    except Exception as e:
        print(f'  [anthropic] {competitor}: {e}', file=sys.stderr)
        return f'{{"error": "{e}", "raw": "Anthropic call failed"}}'


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


def write_fallback_json(rows: list[dict], tag: str) -> pathlib.Path:
    DECISIONS_DIR.mkdir(parents=True, exist_ok=True)
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    out = DECISIONS_DIR / f'spy-pricing-{tag}-{today}.json'
    out.write_text(json.dumps(rows, indent=2), encoding='utf-8')
    return out


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def run(dry_run: bool = False) -> None:
    load_env()

    if not ANTHROPIC_API_KEY:
        print('[spy/pricing] WARNING: ANTHROPIC_API_KEY not set — will store raw text only')

    results = []
    for comp in COMPETITORS:
        name = comp['name']
        url = comp['url']
        print(f'[spy/pricing] scraping {name} ({url})')
        html = _fetch(url)
        if not html:
            print(f'  -> skip (empty response)')
            continue

        page_text = _strip_tags(html)
        if ANTHROPIC_API_KEY:
            finding = anthropic_parse_pricing(name, page_text, ANTHROPIC_API_KEY)
        else:
            # Store first 500 chars of raw text as finding
            finding = page_text[:500]

        row = {
            'intel_type': 'pricing',
            'competitor': name,
            'finding': finding,
            'source_url': url,
            'raw_data': {'page_text_chars': len(page_text), 'scraped_at': datetime.now(timezone.utc).isoformat()},
            'relevance_score': 80,
        }
        results.append(row)
        print(f'  -> found pricing intel ({len(finding)} chars)')
        time.sleep(1)  # polite crawl delay

    if not results:
        print('[spy/pricing] no results to write')
        return

    if dry_run:
        print(f'[spy/pricing] DRY RUN — would write {len(results)} row(s):')
        for r in results:
            print(f'  {r["competitor"]}: {r["finding"][:120]}')
        return

    ok = supabase_insert(results)
    if ok:
        print(f'[spy/pricing] wrote {len(results)} row(s) to spy_intel')
    else:
        path = write_fallback_json(results, 'all')
        print(f'[spy/pricing] Supabase insert failed — wrote fallback to {path}')


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dry-run', action='store_true', help='Print what would be written; no writes')
    args = ap.parse_args()
    run(dry_run=args.dry_run)
    return 0


if __name__ == '__main__':
    sys.exit(main())
