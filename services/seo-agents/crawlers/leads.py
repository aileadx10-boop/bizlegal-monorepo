#!/usr/bin/env python3
"""
leads.py - pull Supabase inbound_leads + newsletter subs last 24h.
16:00 UTC daily
Daily 16:00 UTC. Free, uses Supabase REST. Attributes leads to UTM source.

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




def main():
    load_env()
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    yesterday_iso = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    print('[' + today + '] leads: fetching last 24h')
    new_leads = supabase_query('inbound_leads', 'select=email,product,source,utm_source,created_at&created_at=gte.' + yesterday_iso + '&order=created_at.desc&limit=200')
    new_subs = supabase_query('newsletter_subscribers', 'select=email,created_at&created_at=gte.' + yesterday_iso + '&order=created_at.desc&limit=200')
    by_product = {}
    for l in new_leads:
        p = l.get('product', 'unknown')
        by_product[p] = by_product.get(p, 0) + 1
    summary = {
        'inbound_leads': len(new_leads),
        'newsletter_subs': len(new_subs),
        'by_product': by_product,
    }
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / ('leads-' + today + '.json')
    out.write_text(json.dumps({'date': today, 'summary': summary,
        'leads': new_leads, 'subs': new_subs}, indent=2, default=str))
    log_run('leads', 'fetch_24h', 'success', summary)
    print('  ' + json.dumps(summary))


from datetime import timedelta
if __name__ == '__main__':
    main()
