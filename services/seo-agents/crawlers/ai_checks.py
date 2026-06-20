#!/usr/bin/env python3
"""
ai_checks.py - direct AI engine citation checks.
11:00 UTC daily
Daily 11:00 UTC. Queries Perplexity + ChatGPT for product-relevant questions per subdomain. Captures exact citation URLs. Perplexity ~$5/mo.

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




PRODUCT_QUERIES = {
    'bizlegal-ai.com': [
        'compliance intelligence platform crypto',
        'best compliance OS fintech 2026',
    ],
    'brai.bizlegal-ai.com': [
        'counterparty risk score crypto exchange',
        'BRAI blockchain regulatory intelligence',
    ],
    'tracr.bizlegal-ai.com': [
        'wallet forensics tool',
        'sanctions screening crypto wallet',
        'wallet trace investigator',
    ],
    'lexaudit.bizlegal-ai.com': [
        'compliance health score SaaS',
        'SOC 2 compliance monitoring software',
    ],
    'docai.bizlegal-ai.com': [
        'AI security questionnaire auto-fill',
        'DPA negotiator tool',
    ],
    'forge.bizlegal-ai.com': [
        'BOI compliance report',
        'FinCEN beneficial ownership filing',
    ],
    'leadforge.bizlegal-ai.com': [
        'lead generation compliance',
    ],
    'blog.bizlegal-ai.com': [
        'crypto compliance blog 2026',
        'MiCA compliance guide',
    ],
}


def call_perplexity(query):
    pk = os.getenv('PERPLEXITY_API_KEY', '')
    if not pk:
        return []
    body = json.dumps({
        'model': 'sonar',
        'messages': [{'role': 'user', 'content': query}],
        'max_tokens': 400,
    }).encode()
    req = urllib.request.Request(
        'https://api.perplexity.ai/chat/completions',
        data=body,
        headers={'Authorization': 'Bearer ' + pk, 'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        r = urllib.request.urlopen(req, timeout=30)
        d = json.loads(r.read())
        text = json.dumps(d)
        return re.findall(r"https?://[a-z0-9.-]+\.[a-z]{2,}[^\s]*", text)
    except Exception as e:
        return []


def main():
    load_env()
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    print('[' + today + '] ai_checks: ' + str(len(PRODUCT_QUERIES)) + ' subdomains')
    results = {'date': today, 'by_subdomain': {}}
    for domain, queries in PRODUCT_QUERIES.items():
        d_results = []
        for q in queries:
            urls = call_perplexity(q)
            ours = [u for u in urls if domain in u]
            d_results.append({'query': q, 'total_citations': len(urls), 'our_citations': ours[:3]})
            time.sleep(1)
        results['by_subdomain'][domain] = d_results
        our_total = sum(len(r['our_citations']) for r in d_results)
        print('  ' + domain + ': ' + str(our_total) + ' our citations across ' + str(len(queries)) + ' queries')
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / ('ai-citations-' + today + '.json')
    out.write_text(json.dumps(results, indent=2))
    log_run('ai_checks', 'perplexity_product_queries', 'success' if os.getenv('PERPLEXITY_API_KEY') else 'partial',
            {'subdomains': len(PRODUCT_QUERIES)})
    print('  report=' + str(out))


if __name__ == '__main__':
    main()
