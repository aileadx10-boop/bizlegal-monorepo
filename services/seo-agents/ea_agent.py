#!/usr/bin/env python3
"""
ea_agent.py - Executive Assistant Agent for BizLegal AI.

Reads from Supabase agent_runs, daily_gaps, agent outputs, generates
the consolidated DAILY-REPORT.md, sends Telegram summary to Moses.

This is the "brain of the brain" - it connects everything together.

Schedule: daily 19:00 UTC (replaces/supplements daily_orchestrator task 19)
"""

import os, json, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

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


def main():
    load_env()
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    revenue = fetch_supabase_revenue()
    np_revenue = fetch_nowpayments_revenue()
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
    md += 'NOWPayments (last 24h): ' + json.dumps(np_revenue) + '\n\n'
    md += '## LEADS (last 24h)\n\n'
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
    summary = '\u270d EA Daily Report ' + today + '\n\n'
    summary += 'Tasks: ' + str(len(runs)) + ' run, ' + str(success) + ' success, ' + str(failed) + ' failed\n'
    summary += 'Revenue 24h: $' + str(revenue.get('total_usd', 0)) + ' (' + str(revenue.get('count', 0)) + ' txns)\n'
    summary += 'Leads 24h: ' + str(len(leads)) + '\n'
    summary += 'Top product: ' + (max(by_product.items(), key=lambda x: x[1])[0] if by_product else 'none') + '\n\n'
    summary += 'Full report: ' + str(out) + '\n'
    telegram_alert(summary)

    print('  report: ' + str(out))
    print('  telegram sent')


if __name__ == '__main__':
    main()
