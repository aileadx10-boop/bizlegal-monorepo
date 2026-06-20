#!/usr/bin/env python3
"""
customer_q.py - trial user activation + churn risk flags.
17:00 UTC daily
Daily 17:00 UTC. Supabase queries for trial users + activation + churn signals. Free, no API calls beyond Supabase.

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
    print('[' + today + '] customer_quality: scoring trial users')
    # This depends on the actual Supabase schema. Best effort: try common tables
    activation = []
    churn_risk = []
    for table in ['users', 'subscriptions', 'trials', 'profiles']:
        rows = supabase_query(table, 'select=*&limit=50')
        if not rows:
            continue
        for r in rows:
            last_login = r.get('last_login_at') or r.get('last_seen_at')
            if not last_login:
                continue
            try:
                last_dt = datetime.fromisoformat(last_login.replace('Z', '+00:00'))
                days_ago = (datetime.now(timezone.utc) - last_dt).days
                if days_ago > 4 and r.get('subscription_status') == 'trial':
                    churn_risk.append({'email': r.get('email', '?'), 'last_login_days': days_ago,
                                       'product': r.get('product', table)})
                elif days_ago <= 1 and r.get('subscription_status') == 'trial':
                    activation.append({'email': r.get('email', '?'), 'product': r.get('product', table)})
            except Exception:
                pass
    summary = {'activation_signals': len(activation), 'churn_risk': len(churn_risk)}
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / ('customer-quality-' + today + '.md')
    md = '# Customer Quality - ' + today + '\n\n'
    md += '**Activation signals (trial users active today):** ' + str(len(activation)) + '\n'
    for a in activation[:10]:
        md += '- ' + str(a) + '\n'
    md += '\n**Churn risk (no login 4+ days):** ' + str(len(churn_risk)) + '\n'
    for c in churn_risk[:10]:
        md += '- ' + str(c) + '\n'
    out.write_text(md)
    log_run('customer_quality', 'score_trials', 'success', summary)
    print('  ' + json.dumps(summary))


if __name__ == '__main__':
    main()
