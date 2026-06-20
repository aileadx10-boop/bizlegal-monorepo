#!/usr/bin/env python3
"""
index_status.py - GSC API index coverage + top queries.
12:00 UTC daily
Daily 12:00 UTC. Pulls indexed count, top queries (impressions/clicks/position/ctr) for each of 8 GSC properties. REQUIRES GSC service account JSON in env.

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




GSC_PROPERTIES = [
    'https://bizlegal-ai.com/',
    'https://blog.bizlegal-ai.com/',
    'https://brai.bizlegal-ai.com/',
    'https://tracr.bizlegal-ai.com/',
    'https://lexaudit.bizlegal-ai.com/',
    'https://docai.bizlegal-ai.com/',
    'https://forge.bizlegal-ai.com/',
    'https://leadforge.bizlegal-ai.com/',
]


def call_gsc(site_url, gsc_token):
    """Call GSC Search Analytics API for last 7 days."""
    body = json.dumps({
        'startDate': (datetime.now(timezone.utc) - timedelta(days=7)).strftime('%Y-%m-%d'),
        'endDate': datetime.now(timezone.utc).strftime('%Y-%m-%d'),
        'dimensions': ['query'],
        'rowLimit': 25,
    }).encode()
    encoded = urllib.parse.quote(site_url, safe='')
    url = 'https://www.googleapis.com/webmasters/v3/sites/' + encoded + '/searchAnalytics/query'
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            'Authorization': 'Bearer ' + gsc_token,
            'Content-Type': 'application/json',
        },
        method='POST',
    )
    try:
        r = urllib.request.urlopen(req, timeout=15)
        return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {'error': 'HTTP ' + str(e.code)}


def main():
    from datetime import timedelta
    load_env()
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    gsc_token = os.getenv('GSC_ACCESS_TOKEN', '')
    print('[' + today + '] index_status: ' + str(len(GSC_PROPERTIES)) + ' GSC properties')
    if not gsc_token:
        print('  SKIP: no GSC_ACCESS_TOKEN (GSC service account not configured)')
        log_run('index_status', 'gsc_query', 'skipped', {'reason': 'no GSC service account'})
        return
    results = {'date': today, 'properties': {}}
    for site in GSC_PROPERTIES:
        d = call_gsc(site, gsc_token)
        rows = d.get('rows', []) if 'error' not in d else []
        top_queries = [{'q': r['keys'][0], 'clicks': r['clicks'], 'impressions': r['impressions'],
                        'ctr': r['ctr'], 'pos': r['position']} for r in rows[:10]]
        results['properties'][site] = {'top_queries': top_queries, 'total_clicks': sum(r.get('clicks', 0) for r in rows)}
        print('  ' + site + ': ' + str(len(rows)) + ' queries, ' + str(results['properties'][site]['total_clicks']) + ' clicks')
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / ('gsc-performance-' + today + '.json')
    out.write_text(json.dumps(results, indent=2))
    log_run('index_status', 'gsc_query', 'success', {'properties': len(results['properties'])})
    print('  report=' + str(out))


if __name__ == '__main__':
    main()
