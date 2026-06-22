#!/usr/bin/env python3
"""
telegram_bot.py - Telegram bot auto-responder for BIZLEGALFORGEBOT.

Handles /commands from Moses in Telegram chat 989097520:
  /stats - last 24h task summary
  /sales - revenue breakdown
  /leads - new leads
  /subs - subscriber count
  /help - show commands

Run: persistent (use nohup + systemd, or as cron every 1 min)
"""

import os, json, urllib.request, urllib.error
from datetime import datetime, timezone, timedelta

VAULT_PATH = '/opt/bizlegal/curator/.env'
SUPABASE_URL = 'https://ydghhcuuopqzgqcicubg.supabase.co'
SUPABASE_KEY = os.getenv('SUPABASE_SECRET', '')


def load_env():
    global SUPABASE_KEY
    if SUPABASE_KEY:
        return
    if not os.path.exists(VAULT_PATH):
        return
    for line in open(VAULT_PATH):
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        os.environ[k.strip()] = v.strip()
    SUPABASE_KEY = os.environ.get('SUPABASE_SECRET', '')


def supabase_query(table, params=''):
    url = SUPABASE_URL + '/rest/v1/' + table + ('?' + params if params else '')
    req = urllib.request.Request(url, headers={'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY})
    try:
        r = urllib.request.urlopen(req, timeout=15)
        return json.loads(r.read())
    except Exception:
        return []


def telegram_get_updates(bot_token, offset=0):
    req = urllib.request.Request(
        'https://api.telegram.org/bot' + bot_token + '/getUpdates?timeout=30&offset=' + str(offset),
        timeout=35)
    try:
        r = urllib.request.urlopen(req, timeout=35)
        return json.loads(r.read())
    except Exception as e:
        return {'ok': False, 'error': str(e)}


def telegram_send(bot_token, chat_id, text):
    body = json.dumps({'chat_id': chat_id, 'text': text, 'disable_web_page_preview': True}).encode()
    req = urllib.request.Request(
        'https://api.telegram.org/bot' + bot_token + '/sendMessage',
        data=body, headers={'Content-Type': 'application/json'}, method='POST')
    try:
        r = urllib.request.urlopen(req, timeout=10)
        return r.status == 200
    except Exception:
        return False


def handle_command(bot_token, chat_id, command):
    if command == '/start' or command == '/help':
        return 'BizLegal AI EA Bot\n\nCommands:\n/stats - last 24h tasks\n/sales - revenue 24h\n/leads - new leads\n/subs - newsletter subs\n/report - read latest DAILY-REPORT'
    elif command == '/stats':
        yesterday = (datetime.now(timezone.utc) - timedelta(hours=24)).strftime('%Y-%m-%dT%H:%M:%SZ')
        runs = supabase_query('agent_runs', 'select=agent_name,status&created_at=gte.' + yesterday)
        by_status = {}
        for r in runs:
            s = r.get('status', '?')
            by_status[s] = by_status.get(s, 0) + 1
        return 'Tasks 24h: ' + str(len(runs)) + '\n' + json.dumps(by_status, indent=2)
    elif command == '/sales':
        yesterday = (datetime.now(timezone.utc) - timedelta(hours=24)).strftime('%Y-%m-%dT%H:%M:%SZ')
        orders = supabase_query('payment_orders', 'select=amount_cents,gateway,status&created_at=gte.' + yesterday + '&status=eq.paid')
        if not orders:
            return 'No sales in last 24h.'
        total = sum(int(o.get('amount_cents', 0) or 0) for o in orders) / 100
        return 'Sales 24h: ' + str(len(orders)) + ' txns = $' + str(total) + '\nGateways: ' + json.dumps(list(set(o.get('gateway') for o in orders)))
    elif command == '/leads':
        yesterday = (datetime.now(timezone.utc) - timedelta(hours=24)).strftime('%Y-%m-%dT%H:%M:%SZ')
        leads = supabase_query('inbound_leads', 'select=email,product&created_at=gte.' + yesterday)
        if not leads:
            return 'No new leads in last 24h.'
        msg = 'New leads 24h: ' + str(len(leads)) + '\n'
        for l in leads[:10]:
            msg += '- ' + str(l.get('email', '?')) + ' (' + str(l.get('product', '?')) + ')\n'
        return msg
    elif command == '/subs':
        subs = supabase_query('newsletter_subscribers', 'select=count')
        count = subs[0].get('count', 0) if subs else 0
        return 'Newsletter subscribers: ' + str(count)
    elif command == '/report':
        import os.path
        today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        path = '/opt/bizlegal/decisions/EA-DAILY-REPORT-' + today + '.md'
        if os.path.exists(path):
            with open(path) as f:
                return f.read()[:3500]
        return 'No report yet today.'
    else:
        return 'Unknown command. Try /help'


def main():
    load_env()
    bot_token = os.environ.get('BIZLEGALFORGEBOT', os.environ.get('TELEGRAM_CURATOR_BOT_TOKEN', ''))
    if not bot_token:
        print('NO BOT TOKEN')
        return
    print('telegram_bot started. Polling...')
    offset = 0
    import time
    while True:
        try:
            updates = telegram_get_updates(bot_token, offset)
            if updates.get('ok') and updates.get('result'):
                for u in updates['result']:
                    offset = u['update_id'] + 1
                    msg = u.get('message', {})
                    text = msg.get('text', '')
                    chat_id = str(msg.get('chat', {}).get('id', ''))
                    if text.startswith('/'):
                        reply = handle_command(bot_token, chat_id, text.split('@')[0])
                        telegram_send(bot_token, chat_id, reply)
                        print('  reply to ' + chat_id + ': ' + text)
        except KeyboardInterrupt:
            print('stopped')
            break
        except Exception as e:
            print('  ERR: ' + str(e)[:100])
            time.sleep(5)


if __name__ == '__main__':
    main()
