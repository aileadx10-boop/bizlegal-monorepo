#!/usr/bin/env python3
"""
intent_signals.py
=================
Phase 5 of PLATFORM-BUILD-2026-07-02 — Hunt subsystem.

Identifies high-intent leads from `lead_outreach` where:
  - stage > 0  (at least one outreach attempt made)
  - opened_at IS NOT NULL  (they opened our email)

Outputs a JSON file with the signal list for warm_intro.py to process.

Usage:
  python3 intent_signals.py
  python3 intent_signals.py --dry-run
  python3 intent_signals.py --output /custom/path/signals.json
"""
from __future__ import annotations

# ---------------------------------------------------------------------------
# Heartbeat
# ---------------------------------------------------------------------------
try:
    import sys as _sys, os as _os
    _sys.path.insert(0, _os.path.join(_os.path.dirname(__file__), '..', 'seo-agents'))
    from ops_heartbeat import ping_once as _ping
    _ping('hetzner/hunt', status='alive', last_action='intent-signals')
except Exception:
    pass

import argparse
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
VAULT_PATH = pathlib.Path('/opt/bizlegal/curator/.env')
DECISIONS_DIR = pathlib.Path('/opt/bizlegal/decisions')
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://ydghhcuuopqzgqcicubg.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))

DEFAULT_OUTPUT = DECISIONS_DIR / 'hunt-intent-signals.json'


# ---------------------------------------------------------------------------
# Env loading
# ---------------------------------------------------------------------------
def load_env() -> None:
    global SUPABASE_KEY
    if SUPABASE_KEY:
        return
    if not VAULT_PATH.exists():
        return
    for line in VAULT_PATH.read_text(encoding='utf-8').splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            os.environ.setdefault(k.strip(), v.strip())
    SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))


# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------
def supabase_query(table: str, params: str = '') -> list[dict]:
    if not SUPABASE_KEY:
        return []
    url = SUPABASE_URL + '/rest/v1/' + table + ('?' + params if params else '')
    req = urllib.request.Request(url, headers={
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read())
    except Exception as e:
        print(f'  [supabase query] {table}: {e}', file=sys.stderr)
        return []


# ---------------------------------------------------------------------------
# Signal scoring
# ---------------------------------------------------------------------------
def _score_lead(lead: dict) -> int:
    """Score a lead 0-100 based on intent signals."""
    score = 0
    if lead.get('opened_at'):
        score += 30
    stage = lead.get('stage', 0)
    if isinstance(stage, (int, float)):
        score += min(30, int(stage) * 10)
    if lead.get('clicked_at'):
        score += 20
    if lead.get('replied_at'):
        score += 20
    return min(100, score)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def run(output_path: pathlib.Path = DEFAULT_OUTPUT, dry_run: bool = False) -> list[dict]:
    load_env()

    if not SUPABASE_KEY:
        print('[hunt/signals] ERROR: Supabase key not set')
        return []

    # Query high-intent leads: stage > 0 AND opened_at IS NOT NULL
    params = (
        'select=id,email,first_name,last_name,company,stage,opened_at,clicked_at,replied_at,vertical,subject'
        '&stage=gt.0'
        '&opened_at=not.is.null'
        '&order=opened_at.desc'
        '&limit=100'
    )
    leads = supabase_query('lead_outreach', params)
    print(f'[hunt/signals] found {len(leads)} high-intent leads (stage>0 + opened)')

    if not leads:
        # Try without the opened_at filter as fallback
        params_fallback = (
            'select=id,email,first_name,last_name,company,stage,opened_at,clicked_at,replied_at,vertical,subject'
            '&stage=gt.0'
            '&order=stage.desc'
            '&limit=50'
        )
        leads = supabase_query('lead_outreach', params_fallback)
        print(f'  -> fallback query: {len(leads)} leads with stage>0')

    signals = []
    for lead in leads:
        score = _score_lead(lead)
        signals.append({
            'id': lead.get('id'),
            'email': lead.get('email', ''),
            'first_name': lead.get('first_name', '') or '',
            'last_name': lead.get('last_name', '') or '',
            'company': lead.get('company', '') or '',
            'stage': lead.get('stage', 0),
            'opened_at': lead.get('opened_at'),
            'clicked_at': lead.get('clicked_at'),
            'replied_at': lead.get('replied_at'),
            'vertical': lead.get('vertical', '') or '',
            'subject': lead.get('subject', '') or '',
            'intent_score': score,
        })

    # Sort by intent score descending
    signals.sort(key=lambda s: s['intent_score'], reverse=True)

    result = {
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'total': len(signals),
        'high_priority': [s for s in signals if s['intent_score'] >= 50],
        'all_signals': signals,
    }

    print(f'[hunt/signals] {len(result["high_priority"])} high-priority signals (score>=50)')

    if dry_run:
        print(f'[hunt/signals] DRY RUN — would write {len(signals)} signals to {output_path}')
        for s in signals[:5]:
            print(f'  {s["email"]}: score={s["intent_score"]}, stage={s["stage"]}')
        if len(signals) > 5:
            print(f'  ... and {len(signals) - 5} more')
        return signals

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(f'[hunt/signals] wrote signals to {output_path}')
    return signals


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dry-run', action='store_true', help='Print what would be written; no writes')
    ap.add_argument('--output', type=pathlib.Path, default=DEFAULT_OUTPUT,
                    help=f'Output JSON path (default: {DEFAULT_OUTPUT})')
    args = ap.parse_args()
    run(output_path=args.output, dry_run=args.dry_run)
    return 0


if __name__ == '__main__':
    sys.exit(main())
