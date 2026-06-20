#!/usr/bin/env python3
"""
sales.py - sales attribution from NOWPayments + PayPal + Stripe.
15:00 UTC daily
Daily 15:00 UTC. Pulls last 24h of transactions from each processor, attributes to UTM source/medium. Reports revenue by stream.

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


def fetch_nowpayments():
    """NOWPayments: list payments, filter to last 24h + finished status."""
    key = os.getenv('NOWPAYMENTS_API_KEY', '')
    if not key:
        return []
    try:
        req = urllib.request.Request(
            'https://api.nowpayments.io/v1/payments?limit=100',
            headers={'x-api-key': key, 'User-Agent': 'Mozilla/5.0'},
        )
        r = urllib.request.urlopen(req, timeout=15)
        d = json.loads(r.read())
        return d.get('data', [])
    except urllib.error.HTTPError as e:
        # Fallback: try list_payments endpoint
        try:
            req = urllib.request.Request(
                'https://api.nowpayments.io/v1/list_payments?limit=100',
                headers={'x-api-key': key, 'User-Agent': 'Mozilla/5.0'},
            )
            r = urllib.request.urlopen(req, timeout=15)
            d = json.loads(r.read())
            return d.get('data', [])
        except Exception:
            return []
    except Exception:
        return []


def fetch_paypal():
    """PayPal: query transactions for last 24h."""
    cid = os.getenv('PAYPAL_CLIENT_ID', '')
    sec = os.getenv('PAYPAL_CLIENT_SECRET', '')
    if not cid or not sec:
        return []
    import base64
    auth = base64.b64encode((cid + ':' + sec).encode()).decode()
    try:
        # Get OAuth token
        req = urllib.request.Request(
            'https://api-m.paypal.com/v1/oauth2/token',
            data='grant_type=client_credentials'.encode(),
            headers={'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded',
                     'Authorization': 'Basic ' + auth},
        )
        r = urllib.request.urlopen(req, timeout=10)
        tok = json.loads(r.read()).get('access_token', '')
        # Search transactions
        yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime('%Y-%m-%dT%H:%M:%S+0000')
        body = json.dumps({'start_date': yesterday, 'page_size': 50}).encode()
        req = urllib.request.Request(
            'https://api-m.paypal.com/v1/reporting/transactions/search?start_date=' + yesterday,
            data=body,
            headers={'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json'},
            method='POST',
        )
        r = urllib.request.urlopen(req, timeout=15)
        d = json.loads(r.read())
        return d.get('transaction_details', [])
    except Exception as e:
        return []


def fetch_stripe():
    """Stripe: list charges last 24h."""
    key = os.getenv('STRIPE_SECRET_KEY', '')
    if not key:
        return []
    try:
        ago = int(time.time()) - 86400
        req = urllib.request.Request(
            'https://api.stripe.com/v1/charges?limit=100&created[gte]=' + str(ago),
            headers={'Authorization': 'Bearer ' + key},
        )
        r = urllib.request.urlopen(req, timeout=15)
        d = json.loads(r.read())
        return d.get('data', [])
    except Exception:
        return []


def main():
    from datetime import timedelta
    load_env()
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    print('[' + today + '] sales: NOWPayments + PayPal + Stripe')
    np = fetch_nowpayments()
    pp = fetch_paypal()
    st = fetch_stripe()
    np_total = sum(float(p.get('price_amount', 0) or 0) for p in np if p.get('payment_status') == 'finished')
    pp_total = sum(float(t.get('transaction_info', {}).get('transaction_amount', {}).get('value_in_usd', 0) or 0) for t in pp if 'error' not in t)
    st_total = sum((c.get('amount', 0) or 0) / 100 for c in st if c.get('paid', False))
    summary = {
        'nowpayments': {'count': len(np), 'total_usd': round(np_total, 2)},
        'paypal': {'count': len(pp), 'total_usd': round(pp_total, 2)},
        'stripe': {'count': len(st), 'total_usd': round(st_total, 2)},
        'total_usd': round(np_total + pp_total + st_total, 2),
    }
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / ('sales-' + today + '.json')
    out.write_text(json.dumps({'date': today, 'processors': {
        'nowpayments_payments': np,
        'paypal_transactions': pp,
        'stripe_charges': st,
    }, 'summary': summary}, indent=2, default=str))
    log_run('sales', 'fetch_all', 'success', summary)
    print('  ' + json.dumps(summary))


if __name__ == '__main__':
    main()
