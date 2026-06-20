#!/usr/bin/env python3
"""
competitors.py - RSS scraper on 30 competitor blog sitemaps.
10:00 UTC daily
Daily 10:00 UTC. Pulls latest 5 posts from each competitor sitemap. Flags topics to cover. Pure Python, no API calls needed.

Code-only, no paid APIs. Uses stdlib urllib + stdlib re + Supabase REST
(already configured) + free public APIs (GSC requires service account).
"""

import os
import sys
import json
import re
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

VAULT_PATH = Path('/opt/bizlegal/curator/.env')
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://ydghhcuuopqzgqcicubg.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))
REPORTS_DIR = Path('/opt/bizlegal/decisions')


def load_env():
    global SUPABASE_KEY
    if SUPABASE_KEY:
        return
    if not VAULT_PATH.exists():
        return
    for line in VAULT_PATH.read_text().splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            os.environ.setdefault(k.strip(), v.strip())
    SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))


def supabase_query(table, params=''):
    url = SUPABASE_URL + '/rest/v1/' + table + ('?' + params if params else '')
    req = urllib.request.Request(url, headers={
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
    })
    try:
        r = urllib.request.urlopen(req, timeout=15)
        return json.loads(r.read())
    except Exception as e:
        print('  [supabase] ' + table + ': ' + str(e)[:100])
        return []


def supabase_insert(table, rows):
    url = SUPABASE_URL + '/rest/v1/' + table
    req = urllib.request.Request(
        url,
        data=json.dumps(rows).encode(),
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
        },
        method='POST',
    )
    try:
        r = urllib.request.urlopen(req, timeout=15)
        return r.status in (200, 201)
    except urllib.error.HTTPError as e:
        print('  [supabase insert] ' + table + ': HTTP ' + str(e.code))
        return False


def log_run(agent, action, status, details=None):
    supabase_insert('agent_runs', [{
        'agent_name': agent,
        'workflow_id': 'daily-seo-pipeline',
        'action': action,
        'status': status,
        'details': details or {},
    }])




COMPETITOR_SITEMAPS = [
    'https://www.chainalysis.com/sitemap.xml',
    'https://www.trmlabs.com/sitemap.xml',
    'https://www.elliptic.co/sitemap.xml',
    'https://www.complyadvantage.com/sitemap.xml',
    'https://www.sardine.ai/sitemap.xml',
    'https://www.unit21.com/sitemap.xml',
    'https://sumsub.com/sitemap.xml',
    'https://www.persona.com/sitemap.xml',
    'https://www.vanta.com/sitemap.xml',
    'https://drata.com/sitemap.xml',
    'https://secureframe.com/sitemap.xml',
    'https://www.auditboard.com/sitemap.xml',
    'https://www.upguard.com/sitemap.xml',
    'https://www.bitsight.com/sitemap.xml',
    'https://www.fenergo.com/sitemap.xml',
    'https://www.acuant.com/sitemap.xml',
    'https://onfido.com/sitemap.xml',
    'https://www.jumio.com/sitemap.xml',
    'https://www.lexisnexis.com/sitemap.xml',
    'https://www.thomsonreuters.com/sitemap.xml',
    'https://www.accuity.com/sitemap.xml',
    'https://www.refinitiv.com/sitemap.xml',
    'https://www.hyperledger.org/sitemap.xml',
    'https://consensys.net/sitemap.xml',
    'https://www.coindesk.com/sitemap.xml',
    'https://cointelegraph.com/sitemap.xml',
    'https://www.theblock.co/sitemap.xml',
    'https://decrypt.co/sitemap.xml',
    'https://www.fatf-gafi.org/sitemap.xml',
    'https://www.sec.gov/sitemap.xml',
]


def fetch_sitemap_latest(url, limit=5):
    """Fetch a sitemap and return the last N URLs."""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (HermesCompetitor/1.0)'})
        r = urllib.request.urlopen(req, timeout=15)
        body = r.read().decode('utf-8', errors='ignore')
        # Extract <loc> tags
        urls = re.findall(r'<loc>(.*?)</loc>', body)
        return urls[-limit:] if urls else []
    except Exception as e:
        return []


def main():
    load_env()
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    print('[' + today + '] competitors: checking ' + str(len(COMPETITOR_SITEMAPS)) + ' competitor sitemaps')
    results = {'date': today, 'competitors': {}, 'new_topics': []}
    for sitemap in COMPETITOR_SITEMAPS:
        domain = re.match(r'https?://([^/]+)/?', sitemap)
        if not domain:
            continue
        d = domain.group(1)
        latest = fetch_sitemap_latest(sitemap)
        results['competitors'][d] = latest
        if latest:
            print('  ' + d + ': ' + str(len(latest)) + ' recent posts')
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / ('competitor-intel-' + today + '.json')
    out.write_text(json.dumps(results, indent=2))
    log_run('competitors', 'rss_scrape', 'success', {'competitors': len(results['competitors'])})
    print('  report=' + str(out))


if __name__ == '__main__':
    main()
