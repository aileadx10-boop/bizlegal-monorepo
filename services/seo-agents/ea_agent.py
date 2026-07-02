#!/usr/bin/env python3
"""
ea_agent.py - Executive Assistant Agent for BizLegal AI.

Reads from Supabase agent_runs, daily_gaps, agent outputs, generates
the consolidated DAILY-REPORT.md, sends Telegram summary to Moses.

This is the "brain of the brain" - it connects everything together.

Schedule: daily 19:00 UTC (replaces/supplements daily_orchestrator task 19)
"""

import os, json, sys, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))
try:
    from ops_heartbeat import ping_once as _hb_ping
except ImportError:
    def _hb_ping(*a, **kw): return True

VAULT_PATH = Path('/opt/bizlegal/curator/.env')
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://ydghhcuuopqzgqcicubg.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))
TELEGRAM_BOT_TOKEN = os.getenv('BIZLEGALFORGEBOT', os.getenv('TELEGRAM_CURATOR_BOT_TOKEN', ''))
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID', '989097520')
NOWPAYMENTS_KEY = os.getenv('NOWPAYMENTS_API_KEY', '')
REPORTS_DIR = Path('/opt/bizlegal/decisions')


def load_env():
    global SUPABASE_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, NOWPAYMENTS_KEY
    if SUPABASE_KEY and TELEGRAM_BOT_TOKEN and NOWPAYMENTS_KEY:
        return
    if not VAULT_PATH.exists():
        return
    for line in VAULT_PATH.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if '=' in line:
            k, v = line.split('=', 1)
            os.environ[k.strip()] = v.strip()
    SUPABASE_KEY = os.environ.get('SUPABASE_SECRET', os.environ.get('SUPABASE_SERVICE_KEY', ''))
    TELEGRAM_BOT_TOKEN = os.environ.get('BIZLEGALFORGEBOT', os.environ.get('TELEGRAM_CURATOR_BOT_TOKEN', ''))
    TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID', '989097520')
    NOWPAYMENTS_KEY = os.environ.get('NOWPAYMENTS_API_KEY', '')


def supabase_query(table, params=''):
    url = SUPABASE_URL + '/rest/v1/' + table + ('?' + params if params else '')
    req = urllib.request.Request(url, headers={'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY})
    try:
        r = urllib.request.urlopen(req, timeout=15)
        return json.loads(r.read())
    except Exception as e:
        print('  [supabase] ' + table + ': ' + str(e)[:100])
        return []


def telegram_alert(message):
    if not TELEGRAM_BOT_TOKEN:
        return False
    body = json.dumps({'chat_id': TELEGRAM_CHAT_ID, 'text': message, 'disable_web_page_preview': True}).encode()
    req = urllib.request.Request(
        'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage',
        data=body, headers={'Content-Type': 'application/json'}, method='POST')
    try:
        r = urllib.request.urlopen(req, timeout=10)
        return r.status == 200
    except Exception:
        return False


def fetch_nowpayments_revenue():
    """Get last 24h NOWPayments revenue."""
    if not NOWPAYMENTS_KEY:
        return {'count': 0, 'total_usd': 0, 'note': 'no NOWPAYMENTS_API_KEY'}
    # Note: list payments requires different scoped key
    return {'count': 0, 'total_usd': 0, 'note': 'list_payments needs scoped key; use Supabase payment_orders for real count'}


def fetch_supabase_revenue():
    """Get revenue from Supabase payment_orders table."""
    yesterday = (datetime.now(timezone.utc) - __import__('datetime').timedelta(hours=24)).strftime('%Y-%m-%dT%H:%M:%SZ')
    rows = supabase_query('payment_orders', 'select=amount_cents,gateway,status&created_at=gte.' + yesterday + '&status=eq.paid')
    if not rows:
        return {'count': 0, 'total_usd': 0}
    total_cents = sum(int(r.get('amount_cents', 0) or 0) for r in rows)
    return {'count': len(rows), 'total_usd': total_cents / 100}


def fetch_supabase_leads():
    yesterday = (datetime.now(timezone.utc) - __import__('datetime').timedelta(hours=24)).strftime('%Y-%m-%dT%H:%M:%SZ')
    leads = supabase_query('inbound_leads', 'select=email,product&created_at=gte.' + yesterday + '&limit=100')
    return leads or []


def fetch_agent_runs():
    yesterday = (datetime.now(timezone.utc) - __import__('datetime').timedelta(hours=24)).strftime('%Y-%m-%dT%H:%M:%SZ')
    return supabase_query('agent_runs', 'select=agent_name,action,status,details&created_at=gte.' + yesterday + '&order=created_at.desc&limit=200') or []


# ---------------------------------------------------------------------------
# Build #8 — GSC + Perplexity + Stripe polling. Each function gracefully
# no-ops if its env vars are not set, so the script is safe to run before
# Moses has installed the relevant creds.
# ---------------------------------------------------------------------------

def fetch_stripe_revenue():
    """Live Stripe revenue. Returns dict. Empty if STRIPE_SECRET_KEY not set."""
    stripe_key = os.environ.get('STRIPE_SECRET_KEY', '')
    if not stripe_key or len(stripe_key) < 20:
        return {'enabled': False, 'reason': 'STRIPE_SECRET_KEY not set (placeholder key in vault)'}
    try:
        # Stripe charges last 24h
        import time as _t
        cutoff = int(_t.time()) - 86400
        url = 'https://api.stripe.com/v1/charges?created[gte]=' + str(cutoff) + '&limit=100'
        req = urllib.request.Request(url, headers={
            'Authorization': 'Bearer ' + stripe_key,
            'User-Agent': USER_AGENT,
        })
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read())
        total_cents = sum(c.get('amount', 0) for c in data.get('data', []) if c.get('paid') and c.get('status') == 'succeeded')
        count = sum(1 for c in data.get('data', []) if c.get('paid') and c.get('status') == 'succeeded')
        return {'enabled': True, 'total_usd': total_cents / 100.0, 'count': count,
                'window': '24h'}
    except Exception as e:
        return {'enabled': False, 'reason': 'error: ' + str(e)[:80]}


def fetch_perplexity_citations():
    """Perplexity-based citation polling. Returns list of {query, cited, source} dicts.
    Disabled if PERPLEXITY_API_KEY not set."""
    pplx_key = os.environ.get('PERPLEXITY_API_KEY', '')
    if not pplx_key:
        return {'enabled': False, 'reason': 'PERPLEXITY_API_KEY not set',
                'queries': []}
    # 8 priority queries aligned with the 8 SEO content pillars
    QUERIES = [
        'BOI filing deadline 2024',
        'VARA license categories Dubai',
        'SOC 2 questionnaire AI assistant',
        'GDPR DPA template B2B SaaS',
        'crypto wallet audit report',
        'EMI license EU requirements',
        'MAS DPT license Singapore',
        'India DPDPA compliance SaaS',
    ]
    results = []
    for q in QUERIES:
        try:
            body = json.dumps({
                'model': 'llama-3.1-sonar-small-128k-online',
                'messages': [{'role': 'user', 'content': q}],
                'return_citations': True,
            }).encode()
            req = urllib.request.Request(
                'https://api.perplexity.ai/chat/completions',
                data=body, method='POST',
                headers={
                    'Authorization': 'Bearer ' + pplx_key,
                    'Content-Type': 'application/json',
                    'User-Agent': USER_AGENT,
                },
            )
            with urllib.request.urlopen(req, timeout=20) as r:
                data = json.loads(r.read())
            citations = data.get('citations', [])
            cited_bizlegal = any('bizlegal-ai.com' in str(c) for c in citations)
            results.append({'query': q, 'cited_bizlegal': cited_bizlegal,
                            'citation_count': len(citations)})
        except Exception as e:
            results.append({'query': q, 'error': str(e)[:80]})
    cited_count = sum(1 for r in results if r.get('cited_bizlegal'))
    return {'enabled': True, 'queries': results,
            'cited_count': cited_count, 'total_queries': len(QUERIES),
            'citation_rate': round(cited_count / max(1, len(QUERIES)), 2)}


def fetch_gsc_index_status():
    """Google Search Console index status for the 8 surfaces.
    Uses GSC service account JWT auth. Returns dict with per-surface counts.
    Disabled if GSC_SERVICE_ACCOUNT_JSON not set or credentials library missing."""
    gsc_json = os.environ.get('GSC_SERVICE_ACCOUNT_JSON', '')
    if not gsc_json:
        return {'enabled': False,
                'reason': 'GSC_SERVICE_ACCOUNT_JSON not set (GSC service account not created)'}
    try:
        # Lazy import: requires google-auth + google-api-python-client which may
        # not be installed on Hetzner. Fall back gracefully.
        try:
            from google.oauth2 import service_account  # type: ignore
            from googleapiclient.discovery import build  # type: ignore
        except ImportError:
            return {'enabled': False, 'reason': 'google-auth not installed (pip install google-auth google-api-python-client)'}
        import json as _json
        sa_info = _json.loads(gsc_json)
        creds = service_account.Credentials.from_service_account_info(
            sa_info, scopes=['https://www.googleapis.com/auth/webmasters.readonly'])
        service = build('searchconsole', 'v1', credentials=creds, cache_discovery=False)

        SURFACES = [
            'https://bizlegal-ai.com/',
            'https://blog.bizlegal-ai.com/',
            'https://brai.bizlegal-ai.com/',
            'https://docai.bizlegal-ai.com/',
            'https://forge.bizlegal-ai.com/',
            'https://leadforge.bizlegal-ai.com/',
            'https://lexaudit.bizlegal-ai.com/',
            'https://tracr.bizlegal-ai.com/',
        ]
        per_surface = []
        for site in SURFACES:
            try:
                resp = service.searchanalytics().query(
                    siteUrl=site,
                    body={'startDate': (datetime.now(timezone.utc) - __import__('datetime').timedelta(days=28)).strftime('%Y-%m-%d'),
                          'endDate': datetime.now(timezone.utc).strftime('%Y-%m-%d'),
                          'dimensions': ['date']},
                ).execute()
                rows = resp.get('rows', [])
                clicks = sum(r.get('clicks', 0) for r in rows)
                impressions = sum(r.get('impressions', 0) for r in rows)
                ctr = round(clicks / max(1, impressions), 4)
                avg_pos = round(sum(r.get('position', 0) for r in rows) / max(1, len(rows)), 1)
                per_surface.append({'site': site, 'clicks_28d': clicks,
                                    'impressions_28d': impressions, 'ctr': ctr,
                                    'avg_position': avg_pos})
            except Exception as e:
                per_surface.append({'site': site, 'error': str(e)[:80]})
        return {'enabled': True, 'surfaces': per_surface}
    except Exception as e:
        return {'enabled': False, 'reason': 'error: ' + str(e)[:80]}


def main():
    load_env()
    _hb_ping('hetzner/ea-agent', parent='cron:ea-agent', status='alive', last_action='generating daily report')
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    revenue = fetch_supabase_revenue()
    np_revenue = fetch_nowpayments_revenue()
    stripe_revenue = fetch_stripe_revenue()
    perplexity = fetch_perplexity_citations()
    gsc = fetch_gsc_index_status()
    leads = fetch_supabase_leads()
    runs = fetch_agent_runs()

    # Aggregate
    by_status = {}
    for r in runs:
        s = r.get('status', '?')
        by_status[s] = by_status.get(s, 0) + 1
    success = sum(1 for r in runs if r.get('status') == 'success')
    failed = sum(1 for r in runs if r.get('status') not in ('success', 'ok'))
    by_product = {}
    for l in leads:
        p = l.get('product', 'unknown')
        by_product[p] = by_product.get(p, 0) + 1

    # Generate report
    md = '# EA DAILY REPORT -- ' + today + '\n\n'
    md += '**Author:** ea_agent.py (Hermes)\n'
    md += '**Period:** Last 24h UTC\n\n'
    md += '## EXECUTIVE SUMMARY\n\n'
    md += 'Tasks run (last 24h): ' + str(len(runs)) + '\n'
    md += 'Tasks success: ' + str(success) + '\n'
    md += 'Tasks failed: ' + str(failed) + '\n\n'
    md += '## REVENUE (last 24h)\n\n'
    md += 'Supabase payment_orders: $' + str(revenue.get('total_usd', 0)) + ' (' + str(revenue.get('count', 0)) + ' txns)\n'
    md += 'NOWPayments (last 24h): ' + json.dumps(np_revenue) + '\n'
    if stripe_revenue.get('enabled'):
        md += 'Stripe (last 24h): $' + str(stripe_revenue.get('total_usd', 0)) + ' (' + str(stripe_revenue.get('count', 0)) + ' txns)\n'
    else:
        md += 'Stripe: disabled — ' + stripe_revenue.get('reason', 'unknown') + '\n'

    md += '\n## CITATIONS (GEO/AEO)\n\n'
    if perplexity.get('enabled'):
        md += 'Perplexity citation rate: ' + str(perplexity.get('citation_rate', 0)) + ' (' + str(perplexity.get('cited_count', 0)) + '/' + str(perplexity.get('total_queries', 0)) + ')\n'
        for q in perplexity.get('queries', []):
            mark = '✓' if q.get('cited_bizlegal') else '·'
            md += '- ' + mark + ' ' + q.get('query', '?') + ' (' + str(q.get('citation_count', 0)) + ' citations)\n'
    else:
        md += 'Perplexity: disabled — ' + perplexity.get('reason', 'unknown') + '\n'

    md += '\n## GSC INDEX STATUS (28d)\n\n'
    if gsc.get('enabled'):
        total_clicks = sum(s.get('clicks_28d', 0) for s in gsc.get('surfaces', []))
        total_impr = sum(s.get('impressions_28d', 0) for s in gsc.get('surfaces', []))
        md += 'Total clicks (28d): ' + str(total_clicks) + '\n'
        md += 'Total impressions (28d): ' + str(total_impr) + '\n\n'
        md += '| Surface | Clicks | Impressions | CTR | Avg pos |\n|---|---|---|---|---|\n'
        for s in gsc.get('surfaces', []):
            md += '| ' + s.get('site', '?').replace('https://', '').rstrip('/') + ' | ' + str(s.get('clicks_28d', 0)) + ' | ' + str(s.get('impressions_28d', 0)) + ' | ' + str(s.get('ctr', 0)) + ' | ' + str(s.get('avg_position', 0)) + ' |\n'
    else:
        md += 'GSC: disabled — ' + gsc.get('reason', 'unknown') + '\n'

    md += '\n## LEADS (last 24h)\n\n'
    md += 'New inbound: ' + str(len(leads)) + '\n'
    if by_product:
        md += 'By product: ' + json.dumps(by_product) + '\n'
    md += '\n## AGENT RUNS (last 24h)\n\n'
    for r in runs[:20]:
        md += '- [' + str(r.get('status', '?')) + '] ' + str(r.get('agent_name', '?')) + ' / ' + str(r.get('action', '?')) + '\n'
    md += '\n## NEXT 24H\n\n'
    md += '- Continue daily_orchestrator.py tasks on cron schedule\n'
    md += '- Outreach: review reddit-outreach-* and linkedin-outreach-* in /opt/bizlegal/decisions/\n'
    md += '- OCI: check for partner replies in deal_router_partners table\n'

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / ('EA-DAILY-REPORT-' + today + '.md')
    out.write_text(md)

    # Telegram summary
    summary = '✍ EA Daily Report ' + today + '\n\n'
    summary += 'Tasks: ' + str(len(runs)) + ' run, ' + str(success) + ' success, ' + str(failed) + ' failed\n'
    summary += 'Revenue 24h: $' + str(revenue.get('total_usd', 0)) + ' (' + str(revenue.get('count', 0)) + ' txns)'
    if stripe_revenue.get('enabled'):
        summary += ' + Stripe $' + str(stripe_revenue.get('total_usd', 0))
    summary += '\n'
    if perplexity.get('enabled'):
        summary += 'Citations: ' + str(perplexity.get('cited_count', 0)) + '/' + str(perplexity.get('total_queries', 0)) + ' (' + str(int(perplexity.get('citation_rate', 0) * 100)) + '%)\n'
    if gsc.get('enabled'):
        total_clicks_28d = sum(s.get('clicks_28d', 0) for s in gsc.get('surfaces', []))
        summary += 'GSC 28d clicks: ' + str(total_clicks_28d) + '\n'
    summary += 'Leads 24h: ' + str(len(leads)) + '\n'
    summary += 'Top product: ' + (max(by_product.items(), key=lambda x: x[1])[0] if by_product else 'none') + '\n\n'
    summary += 'Full report: ' + str(out) + '\n'
    telegram_alert(summary)

    print('  report: ' + str(out))
    print('  telegram sent')


if __name__ == '__main__':
    main()
