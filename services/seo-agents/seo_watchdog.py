#!/usr/bin/env python3
"""
seo_watchdog.py - consolidate crawlers, fire IndexNow, alert.
13:00 UTC daily
Daily 13:00 UTC. Reads last 24h of agent_runs, identifies failures, fires IndexNow for new content, sends Telegram alert on regressions.

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




import urllib.parse


def fire_indexnow(urls):
    """Fire IndexNow API with batch of URLs."""
    key = os.getenv('INDEXNOW_KEY', '')
    if not key or not urls:
        return None
    body = json.dumps({'host': 'bizlegal-ai.com', 'key': key, 'urlList': urls[:100]}).encode()
    req = urllib.request.Request(
        'https://api.indexnow.org/indexnow',
        data=body,
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        r = urllib.request.urlopen(req, timeout=15)
        return {'status': r.status, 'pushed': len(urls)}
    except urllib.error.HTTPError as e:
        return {'error': 'HTTP ' + str(e.code)}


def telegram_alert(message):
    bot = os.getenv('TELEGRAM_BOT_TOKEN', '')
    chat = os.getenv('TELEGRAM_CHAT_ID', '')
    if not bot or not chat:
        return False
    body = json.dumps({'chat_id': chat, 'text': message, 'disable_web_page_preview': True}).encode()
    req = urllib.request.Request(
        'https://api.telegram.org/bot' + bot + '/sendMessage',
        data=body,
        headers={'Content-Type': 'application/json'},
    )
    try:
        r = urllib.request.urlopen(req, timeout=10)
        return r.status == 200
    except Exception:
        return False


def main():
    load_env()
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    yesterday_iso = (datetime.now(timezone.utc) - timedelta(hours=24)).strftime('%Y-%m-%dT%H:%M:%SZ')
    print('[' + today + '] watchdog: consolidating last 24h of crawlers')
    runs = supabase_query('agent_runs', 'select=agent_name,action,status,created_at,details&created_at=gte.' + yesterday_iso + '&order=created_at.desc&limit=100')
    by_status = {}
    failures = []
    for r in runs:
        s = r.get('status', '?')
        by_status[s] = by_status.get(s, 0) + 1
        if s not in ('success', 'ok'):
            failures.append(r)
    # Find new articles to push to IndexNow
    new_articles = supabase_query('daily_gaps', 'select=url,draft_slug,status&status=eq.published&published_at=gte.' + yesterday_iso + '&limit=50')
    new_urls = []
    for a in new_articles:
        blog_url = a.get('url', '')
        slug = a.get('draft_slug', '')
        if blog_url:
            new_urls.append(blog_url)
        elif slug:
            new_urls.append('https://blog.bizlegal-ai.com/' + slug)
    indexnow_result = fire_indexnow(new_urls) if new_urls else None
    summary = {
        'runs_24h': len(runs),
        'by_status': by_status,
        'failures': len(failures),
        'indexnow_pushed': len(new_urls) if new_urls else 0,
    }
    if failures:
        msg = '⚠ Watchdog: ' + str(len(failures)) + ' failures in 24h:\n'
        for f in failures[:5]:
            msg += '- ' + str(f.get('agent_name')) + ' / ' + str(f.get('action')) + ' (' + str(f.get('status')) + ')\n'
        telegram_alert(msg)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / ('seo-watchdog-' + today + '.md')
    md = '# SEO Watchdog - ' + today + '\n\n'
    md += '**Runs 24h:** ' + str(len(runs)) + '\n'
    md += '**By status:** ' + json.dumps(by_status) + '\n'
    md += '**Failures:** ' + str(len(failures)) + '\n'
    md += '**IndexNow pushed:** ' + str(len(new_urls)) + ' URLs\n'
    if indexnow_result:
        md += '**IndexNow response:** ' + json.dumps(indexnow_result) + '\n'
    out.write_text(md)
    log_run('seo_watchdog', 'consolidate', 'success' if not failures else 'partial', summary)
    print('  ' + json.dumps(summary))


from datetime import timedelta
if __name__ == '__main__':
    main()
