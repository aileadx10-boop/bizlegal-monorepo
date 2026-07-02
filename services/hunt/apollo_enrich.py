#!/usr/bin/env python3
"""
apollo_enrich.py
================
Phase 5 of PLATFORM-BUILD-2026-07-02 — Hunt subsystem.

Enriches leads from the `leadforge_leads` Supabase table using the
Apollo.io People Enrichment API (https://api.apollo.io/v1/people/match).

If APOLLO_API_KEY is not set, the script prints a warning and skips
enrichment but still lists which leads would be processed.

Updates enriched leads with: job_title, seniority, linkedin_url,
company_name, company_size, city, state, country.

Usage:
  python3 apollo_enrich.py
  python3 apollo_enrich.py --dry-run
  python3 apollo_enrich.py --limit 20 --dry-run
"""
from __future__ import annotations

# ---------------------------------------------------------------------------
# Heartbeat
# ---------------------------------------------------------------------------
try:
    import sys as _sys, os as _os
    _sys.path.insert(0, _os.path.join(_os.path.dirname(__file__), '..', 'seo-agents'))
    from ops_heartbeat import ping_once as _ping
    _ping('hetzner/hunt', status='alive', last_action='apollo-enrich')
except Exception:
    pass

import argparse
import json
import os
import pathlib
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
VAULT_PATH = pathlib.Path('/opt/bizlegal/curator/.env')
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://ydghhcuuopqzgqcicubg.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))
APOLLO_API_KEY = os.getenv('APOLLO_API_KEY', '')
USER_AGENT = 'Mozilla/5.0 (compatible; BizLegalHuntBot/1.0; +https://bizlegal-ai.com)'

DEFAULT_LIMIT = 20


# ---------------------------------------------------------------------------
# Env loading
# ---------------------------------------------------------------------------
def load_env() -> None:
    global SUPABASE_KEY, APOLLO_API_KEY
    if SUPABASE_KEY and APOLLO_API_KEY:
        return
    if not VAULT_PATH.exists():
        return
    for line in VAULT_PATH.read_text(encoding='utf-8').splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            os.environ.setdefault(k.strip(), v.strip())
    SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))
    APOLLO_API_KEY = os.getenv('APOLLO_API_KEY', '')


# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------
def supabase_query(table: str, params: str = '') -> list[dict]:
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


def supabase_update(table: str, row_id: str, data: dict) -> bool:
    url = SUPABASE_URL + f'/rest/v1/{table}?id=eq.{urllib.request.quote(row_id)}'
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode(),
        method='PATCH',
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status in (200, 204)
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')[:200]
        print(f'  [supabase update] HTTP {e.code}: {body}', file=sys.stderr)
        return False
    except Exception as e:
        print(f'  [supabase update] {e}', file=sys.stderr)
        return False


# ---------------------------------------------------------------------------
# Apollo enrichment
# ---------------------------------------------------------------------------
def apollo_enrich_person(email: str, first_name: str = '', last_name: str = '') -> dict | None:
    """Call Apollo People Match API to enrich a lead by email."""
    body = json.dumps({
        'api_key': APOLLO_API_KEY,
        'email': email,
        'first_name': first_name or None,
        'last_name': last_name or None,
        'reveal_personal_emails': False,
        'reveal_phone_number': False,
    }).encode()
    req = urllib.request.Request(
        'https://api.apollo.io/v1/people/match',
        data=body, method='POST',
        headers={
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'User-Agent': USER_AGENT,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read())
            person = data.get('person') or {}
            if not person:
                return None
            org = person.get('organization') or {}
            return {
                'job_title': person.get('title', ''),
                'seniority': person.get('seniority', ''),
                'linkedin_url': person.get('linkedin_url', ''),
                'company_name': org.get('name', ''),
                'company_size': org.get('estimated_num_employees', ''),
                'city': person.get('city', ''),
                'state': person.get('state', ''),
                'country': person.get('country', ''),
                'apollo_enriched_at': datetime.now(timezone.utc).isoformat(),
            }
    except urllib.error.HTTPError as e:
        if e.code == 422:
            print(f'  [apollo] 422 for {email} — not found in Apollo', file=sys.stderr)
        else:
            print(f'  [apollo] HTTP {e.code} for {email}', file=sys.stderr)
        return None
    except Exception as e:
        print(f'  [apollo] {email}: {e}', file=sys.stderr)
        return None


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def run(limit: int = DEFAULT_LIMIT, dry_run: bool = False) -> None:
    load_env()

    if not SUPABASE_KEY:
        print('[hunt/apollo] ERROR: Supabase key not set — cannot fetch leads')
        return

    if not APOLLO_API_KEY:
        print('[hunt/apollo] WARNING: APOLLO_API_KEY not set — will list leads but skip enrichment')

    # Fetch un-enriched leads (no apollo_enriched_at field or null)
    params = (
        f'select=id,email,first_name,last_name,company'
        f'&apollo_enriched_at=is.null'
        f'&order=created_at.desc'
        f'&limit={limit}'
    )
    leads = supabase_query('leadforge_leads', params)

    if not leads:
        # Fallback: try without the filter (table may not have this column yet)
        params = f'select=id,email,first_name,last_name,company&order=created_at.desc&limit={limit}'
        leads = supabase_query('leadforge_leads', params)

    print(f'[hunt/apollo] found {len(leads)} leads to process (limit={limit})')

    enriched = 0
    skipped = 0

    for lead in leads:
        email = lead.get('email', '')
        if not email:
            skipped += 1
            continue

        lead_id = lead.get('id', '')
        first = lead.get('first_name', '') or ''
        last = lead.get('last_name', '') or ''

        print(f'  processing {email}')

        if dry_run:
            print(f'    -> DRY RUN: would enrich via Apollo')
            enriched += 1
            continue

        if not APOLLO_API_KEY:
            print(f'    -> skip (no Apollo key)')
            skipped += 1
            continue

        enrichment = apollo_enrich_person(email, first, last)
        if not enrichment:
            print(f'    -> not found in Apollo')
            skipped += 1
            time.sleep(0.5)
            continue

        if lead_id:
            ok = supabase_update('leadforge_leads', lead_id, enrichment)
            if ok:
                print(f'    -> enriched: {enrichment.get("job_title", "")} @ {enrichment.get("company_name", "")}')
                enriched += 1
            else:
                print(f'    -> update failed for {lead_id}')
                skipped += 1
        else:
            print(f'    -> no id field to update')
            skipped += 1

        time.sleep(0.5)  # Apollo rate limit: ~200/hr on free tier

    print(f'[hunt/apollo] done — enriched={enriched}, skipped={skipped}')


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dry-run', action='store_true', help='Print what would be updated; no writes')
    ap.add_argument('--limit', type=int, default=DEFAULT_LIMIT,
                    help=f'Max leads to process (default {DEFAULT_LIMIT})')
    args = ap.parse_args()
    run(limit=args.limit, dry_run=args.dry_run)
    return 0


if __name__ == '__main__':
    sys.exit(main())
