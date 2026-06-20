#!/usr/bin/env python3
"""
site_health.py - crawl all 8 subdomains, check 200/404/redirect.
08:00 UTC daily
Daily 08:00 UTC. Hits /, /llms.txt, /robots.txt, /sitemap.xml on each surface. Logs to decisions/site-health-YYYY-MM-DD.json + Supabase agent_runs.

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




DOMAINS = [
    'bizlegal-ai.com', 'blog.bizlegal-ai.com',
    'brai.bizlegal-ai.com', 'tracr.bizlegal-ai.com', 'lexaudit.bizlegal-ai.com',
    'docai.bizlegal-ai.com', 'forge.bizlegal-ai.com', 'leadforge.bizlegal-ai.com',
]
PATHS_TO_CHECK = ['/', '/llms.txt', '/robots.txt', '/sitemap.xml']


def main():
    load_env()
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    print('[' + today + '] site_health: checking ' + str(len(DOMAINS)) + ' domains x ' + str(len(PATHS_TO_CHECK)) + ' paths')
    results = {}
    for d in DOMAINS:
        results[d] = {}
        for p in PATHS_TO_CHECK:
            url = 'https://' + d + p
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (HermesHealthCheck/1.0)'})
                r = urllib.request.urlopen(req, timeout=10)
                results[d][p] = {'status': r.status, 'size': len(r.read())}
            except urllib.error.HTTPError as e:
                results[d][p] = {'status': e.code}
            except Exception as e:
                results[d][p] = {'error': str(e)[:100]}

    ok = sum(1 for d in results.values() for v in d.values() if v.get('status') == 200)
    err = sum(1 for d in results.values() for v in d.values() if v.get('status', 0) >= 500 or 'error' in v)
    summary = {
        'checked': sum(len(d) for d in results.values()),
        'ok': ok,
        'errors': err,
    }
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / ('site-health-' + today + '.json')
    out.write_text(json.dumps({'date': today, 'summary': summary, 'details': results}, indent=2))
    log_run('site_health', 'crawl_8_subdomains', 'success' if err == 0 else 'partial', summary)
    print('  ok=' + str(ok) + ' errors=' + str(err) + '  report=' + str(out))


if __name__ == '__main__':
    main()
