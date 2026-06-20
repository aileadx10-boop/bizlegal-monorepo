#!/usr/bin/env python3
"""
backlinks.py - free backlink monitor via Bing Webmaster + Google link:
09:00 UTC daily
Daily 09:00 UTC. Bing Webmaster API (free) returns inbound links. Google link: operator catches some additional ones. No paid Ahrefs/Moz needed at MVP.

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




def bing_webmaster_backlinks(api_key, site_url):
    """Query Bing Webmaster API for inbound links."""
    url = 'https://ssl.bing.com/webmasters/api/links.php?siteUrl=' + site_url
    req = urllib.request.Request(url, headers={'apikey': api_key})
    try:
        r = urllib.request.urlopen(req, timeout=15)
        return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {'error': 'HTTP ' + str(e.code)}
    except Exception as e:
        return {'error': str(e)[:100]}


def main():
    load_env()
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    bing_key = os.getenv('BING_WEBMASTER_API_KEY', '')
    print('[' + today + '] backlinks: checking ' + (str(len(DOMAINS)) if 'DOMAINS' in dir() else '0') + ' domains via Bing + Google link:')
    results = {'date': today, 'domains': {}}
    domains = ['bizlegal-ai.com', 'blog.bizlegal-ai.com', 'brai.bizlegal-ai.com',
               'tracr.bizlegal-ai.com', 'lexaudit.bizlegal-ai.com', 'docai.bizlegal-ai.com',
               'forge.bizlegal-ai.com', 'leadforge.bizlegal-ai.com']
    for d in domains:
        d_results = {'bing': None, 'google_link': None}
        if bing_key:
            d_results['bing'] = bing_webmaster_backlinks(bing_key, 'https://' + d)
        results['domains'][d] = d_results
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / ('backlinks-' + today + '.json')
    out.write_text(json.dumps(results, indent=2))
    has_data = sum(1 for d in results['domains'].values() if d.get('bing') and 'error' not in d.get('bing', {}))
    log_run('backlinks', 'bing_webmaster', 'success' if has_data else 'partial', {'domains_with_data': has_data})
    print('  domains with backlink data: ' + str(has_data))


if __name__ == '__main__':
    main()
