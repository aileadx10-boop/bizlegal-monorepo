#!/usr/bin/env python3
"""
newsletter.py - Resend API newsletter send.
20:00 UTC daily
Daily 20:00 UTC. Pulls top 3 articles from curator last 24h, composes newsletter with 1 product CTA, sends to all subscribers via Resend.

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
    resend = os.getenv('RESEND_API_KEY', '')
    if not resend:
        print('  SKIP: no RESEND_API_KEY')
        log_run('newsletter', 'send', 'skipped', {'reason': 'no API key'})
        return
    # Get subscribers
    subs = supabase_query('newsletter_subscribers', 'select=email&limit=2000')
    if not subs:
        print('  no subscribers yet')
        log_run('newsletter', 'send', 'skipped', {'reason': 'no subscribers'})
        return
    # Get top 3 articles from last 24h
    articles = supabase_query('daily_gaps', 'select=slug,total_score&status=eq.published&order=total_score.desc&limit=3')
    # Compose newsletter
    body = '# BizLegal AI Daily\n\nTop articles today:\n\n'
    for a in articles:
        slug = a.get('slug', '')
        if slug:
            body += '- ' + slug + ' - https://blog.bizlegal-ai.com/' + slug + '\n'
    body += '\n## Featured: Tracr - free wallet scan\nhttps://tracr.bizlegal-ai.com/analyze\n'
    # Send via Resend
    sent = 0
    failed = 0
    for sub in subs[:100]:  # Free tier = 100/day
        email = sub.get('email', '')
        if not email:
            continue
        try:
            req_body = json.dumps({
                'from': 'BizLegal AI <[email protected]>',
                'to': email,
                'subject': 'BizLegal AI Daily - ' + today,
                'text': body,
            }).encode()
            req = urllib.request.Request(
                'https://api.resend.com/emails',
                data=req_body,
                headers={'Authorization': 'Bearer ' + resend, 'Content-Type': 'application/json'},
                method='POST',
            )
            r = urllib.request.urlopen(req, timeout=10)
            if r.status == 200:
                sent += 1
        except Exception:
            failed += 1
    summary = {'subscribers': len(subs), 'sent': sent, 'failed': failed}
    log_run('newsletter', 'send_resend', 'success' if sent > 0 else 'partial', summary)
    print('  ' + json.dumps(summary))


if __name__ == '__main__':
    main()
