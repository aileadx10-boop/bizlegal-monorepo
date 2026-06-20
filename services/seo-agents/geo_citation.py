#!/usr/bin/env python3
"""
geo_citation.py - Perplexity-based AI citation polling.

Daily 07:00 UTC. Polls 10-30 product-relevant queries against Perplexity
sonar API, counts how often bizlegal-ai.com is cited vs competitors.
Writes decisions/geo-citation-report-YYYY-MM-DD.md and updates Supabase
agent_runs.

Setup: PERPLEXITY_API_KEY in vault (https://docs.perplexity.ai/)
Cost: ~$0.005/search * 30/day = $4.50/mo
"""

import os
import re
import sys
import json
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

VAULT_PATH = Path('/opt/bizlegal/curator/.env')
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://ydghhcuuopqzgqcicubg.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))
PERPLEXITY_KEY = os.getenv('PERPLEXITY_API_KEY', '')
REPORTS_DIR = Path('/opt/bizlegal/decisions')

DOMAINS = [
    'bizlegal-ai.com', 'brai.bizlegal-ai.com', 'tracr.bizlegal-ai.com',
    'lexaudit.bizlegal-ai.com', 'docai.bizlegal-ai.com', 'forge.bizlegal-ai.com',
    'leadforge.bizlegal-ai.com', 'blog.bizlegal-ai.com',
]
COMPETITORS = [
    'chainalysis.com', 'trmlabs.com', 'elliptic.co', 'scorechain.com',
    'merklescience.com', 'ciphertrace.com', 'crystalblockchain.com',
    'sumsub.com', 'onfido.com', 'jumio.com', 'persona.com',
    'complyadvantage.com', 'refinitiv.com', 'thomsonreuters.com',
    'vanta.com', 'drata.com', 'secureframe.com', 'auditboard.com',
    'tugboatlogic.com', 'bitsight.com', 'upguard.com',
]

QUERY_BANK = [
    'sanctions screening crypto wallet 2026',
    'MiCA compliance requirements 2026',
    'VARA Dubai crypto license requirements',
    'OFAC sanctions crypto compliance',
    'counterparty risk crypto exchange',
    'Travel Rule compliance crypto',
    'FATF VASP guidance 2026',
    'BOI filing FinCEN CTA requirements',
    'beneficial ownership information report',
    'SOC 2 compliance checklist 2026',
    'ISO 27001 implementation steps',
    'GDPR compliance for US companies',
    'HIPAA compliance software',
    'best crypto compliance software 2026',
    'best sanctions screening tool crypto',
    'best SOC 2 compliance platform',
    'alternatives to Chainalysis',
    'alternatives to TRM Labs',
    'alternatives to Vanta SOC 2',
    'best wallet analysis tool for law enforcement',
    'SEC crypto enforcement 2026',
    'CFTC prediction markets regulation',
    'MiCA Article 68 white paper',
    'DORA Digital Operational Resilience Act',
    'AML compliance 6AMLD EU',
    'PMLA India crypto compliance',
    'Singapore PSA Payment Services Act crypto',
    'crypto compliance trends 2026',
    'AI in regulatory compliance 2026',
    'stablecoin regulation comparison',
]


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
        result = urllib.request.urlopen(req, timeout=15)
        return result.status in (200, 201)
    except urllib.error.HTTPError as e:
        print('  [supabase] ' + table + ': HTTP ' + str(e.code))
        return False


def call_perplexity(query):
    if not PERPLEXITY_KEY:
        return {'error': 'no PERPLEXITY_API_KEY'}
    body = json.dumps({
        'model': 'sonar',
        'messages': [{'role': 'user', 'content': query}],
        'max_tokens': 600,
    }).encode()
    req = urllib.request.Request(
        'https://api.perplexity.ai/chat/completions',
        data=body,
        headers={
            'Authorization': 'Bearer ' + PERPLEXITY_KEY,
            'Content-Type': 'application/json',
        },
        method='POST',
    )
    try:
        r = urllib.request.urlopen(req, timeout=30)
        return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {'error': str(e.code) + ' ' + e.read().decode()[:150]}
    except Exception as e:
        return {'error': str(e)[:150]}


def extract_citations(resp):
    text = json.dumps(resp)
    urls = re_mod.findall(r'https?://[a-z0-9.-]+\.[a-z]{2,}', text)
    return list(dict.fromkeys(urls))


def classify_citation(url):
    u = url.lower()
    for d in DOMAINS:
        if d in u:
            return 'OURS'
    for c in COMPETITORS:
        if c in u:
            return 'COMPETITOR'
    return 'OTHER'


def load_env():
    """Load env from /opt/bizlegal/curator/.env if not in os.environ."""
    global SUPABASE_KEY, PERPLEXITY_KEY
    if SUPABASE_KEY and PERPLEXITY_KEY:
        return
    if not VAULT_PATH.exists():
        return
    for line in VAULT_PATH.read_text().splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            os.environ.setdefault(k.strip(), v.strip())
    SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))
    PERPLEXITY_KEY = os.getenv('PERPLEXITY_API_KEY', '')


def main():
    load_env()
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    limit = 30
    if any('--limit=' in a for a in sys.argv):
        limit = int([a for a in sys.argv if a.startswith('--limit=')][0].split('=', 1)[1])
    queries = QUERY_BANK[:limit]
    print('[' + today + '] geo_citation: polling ' + str(len(queries)) + ' queries via Perplexity')

    results = []
    for i, q in enumerate(queries):
        if not PERPLEXITY_KEY:
            print('  [' + str(i+1) + '/' + str(len(queries)) + '] SKIP (no API key)')
            continue
        resp = call_perplexity(q)
        if 'error' in resp:
            print('  [' + str(i+1) + '/' + str(len(queries)) + '] ERR ' + q[:40] + ': ' + resp['error'][:80])
            results.append({'query': q, 'error': resp['error']})
            continue
        urls = extract_citations(resp)
        ours = [u for u in urls if classify_citation(u) == 'OURS']
        comp = [u for u in urls if classify_citation(u) == 'COMPETITOR']
        print('  [' + str(i+1) + '/' + str(len(queries)) + '] ' + q[:50].ljust(50) + ' ours=' + str(len(ours)) + ' comp=' + str(len(comp)))
        results.append({
            'query': q,
            'ours_citations': ours,
            'competitor_citations': comp[:5],
            'total_citations': len(urls),
        })
        time.sleep(1.5)

    our_cited = sum(1 for r in results if r.get('ours_citations'))
    rate = (our_cited / len(results) * 100) if results else 0
    top_comp = {}
    for r in results:
        for c in r.get('competitor_citations', []):
            m = re.match(r'https?://([^/]+)/?', c)
            if m:
                d = m.group(1)
                top_comp[d] = top_comp.get(d, 0) + 1
    top_comp = sorted(top_comp.items(), key=lambda x: -x[1])[:10]
    gaps = [r for r in results if r.get('competitor_citations') and not r.get('ours_citations')]

    report = '# GEO Citation Report - ' + today + '\n\n'
    report += '**Author:** geo_citation.py (Hermes)\n'
    report += '**Queries polled:** ' + str(len(results)) + '\n'
    report += '**Our citation rate:** ' + str(round(rate, 1)) + '%\n\n'
    report += '## Top competitor citations\n\n'
    for d, c in top_comp:
        report += '- **' + d + '** - ' + str(c) + ' of our queries cite them\n'
    report += '\n## Gap queries (competitor cited, we are not) - priority\n\n'
    for g in gaps[:15]:
        report += '- ' + g['query'] + '\n'
        for c in g.get('competitor_citations', [])[:3]:
            report += '  - ' + c + '\n'
    report += '\n## Details\n\n'
    for r in results:
        if 'error' in r:
            report += '- [ERR] ' + r['query'] + '\n'
            continue
        ours = len(r.get('ours_citations', []))
        comp = len(r.get('competitor_citations', []))
        flag = 'OUR' if ours else ('GAP' if comp else 'NORMAL')
        report += '- `' + flag + '` ' + r['query'] + ' (ours=' + str(ours) + ' comp=' + str(comp) + ')\n'

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / ('geo-citation-report-' + today + '.md')
    out.write_text(report)
    supabase_insert('agent_runs', [{
        'agent_name': 'geo_citation',
        'workflow_id': 'daily-seo-pipeline',
        'action': 'perplexity_poll',
        'status': 'success' if not any('error' in r for r in results) else 'partial',
        'details': {
            'queries_polled': len(results),
            'citation_rate': round(rate, 1),
            'gap_count': len(gaps),
        },
    }])
    print('\n[geo_citation] rate: ' + str(round(rate, 1)) + '%  report: ' + str(out))


if __name__ == '__main__':
    main()
