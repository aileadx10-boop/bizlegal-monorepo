#!/usr/bin/env python3
"""
warm_intro.py
=============
Phase 5 of PLATFORM-BUILD-2026-07-02 — Hunt subsystem.

Reads intent signals from hunt-intent-signals.json (written by intent_signals.py),
uses Anthropic to generate a warm introduction request message for each
high-priority lead, and writes a Markdown file to decisions/.

Warm intro = "I noticed you opened our compliance email — here's a direct
intro to a peer who's faced the same challenge + a one-line ask."

Usage:
  python3 warm_intro.py
  python3 warm_intro.py --dry-run
  python3 warm_intro.py --input /custom/signals.json --dry-run
"""
from __future__ import annotations

# ---------------------------------------------------------------------------
# Heartbeat
# ---------------------------------------------------------------------------
try:
    import sys as _sys, os as _os
    _sys.path.insert(0, _os.path.join(_os.path.dirname(__file__), '..', 'seo-agents'))
    from ops_heartbeat import ping_once as _ping
    _ping('hetzner/hunt', status='alive', last_action='warm-intro')
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
DECISIONS_DIR = pathlib.Path('/opt/bizlegal/decisions')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')
USER_AGENT = 'Mozilla/5.0 (compatible; BizLegalHuntBot/1.0; +https://bizlegal-ai.com)'

DEFAULT_INPUT = DECISIONS_DIR / 'hunt-intent-signals.json'
DEFAULT_OUTPUT = DECISIONS_DIR / 'hunt-warm-intros.md'

# Only process top N high-priority leads per run
MAX_INTROS_PER_RUN = 10


# ---------------------------------------------------------------------------
# Env loading
# ---------------------------------------------------------------------------
def load_env() -> None:
    global ANTHROPIC_API_KEY
    if ANTHROPIC_API_KEY:
        return
    if not VAULT_PATH.exists():
        return
    for line in VAULT_PATH.read_text(encoding='utf-8').splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            os.environ.setdefault(k.strip(), v.strip())
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')


# ---------------------------------------------------------------------------
# Anthropic helpers
# ---------------------------------------------------------------------------
def generate_warm_intro(signal: dict, api_key: str) -> str:
    """Generate a warm intro request for a high-intent lead."""
    name = f"{signal.get('first_name', '')} {signal.get('last_name', '')}".strip() or signal.get('email', '')
    company = signal.get('company', '') or 'their company'
    vertical = signal.get('vertical', '') or 'compliance'
    subject = signal.get('subject', '') or 'compliance automation'
    score = signal.get('intent_score', 0)

    prompt = f"""You are a B2B sales expert at BizLegal AI, a compliance-as-a-service platform for fintech, crypto, and SaaS companies.

Write a 3-sentence warm introduction request email for this high-intent lead:
- Name: {name}
- Company: {company}
- Vertical: {vertical}
- They opened our email about: {subject}
- Intent score: {score}/100

The message should:
1. Open with genuine recognition of their interest (not "I noticed you opened our email" — be subtle)
2. Offer a peer reference or case study relevant to their vertical
3. End with a low-friction ask: a 15-min call or a direct link to a relevant tool

Keep it under 100 words. No subject line. No sign-off. Just the message body.
Return only the message text, no preamble."""

    body = json.dumps({
        'model': 'claude-haiku-4-5',
        'max_tokens': 200,
        'messages': [{'role': 'user', 'content': prompt}],
    }).encode()
    req = urllib.request.Request(
        'https://api.anthropic.com/v1/messages',
        data=body, method='POST',
        headers={
            'Content-Type': 'application/json',
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01',
            'User-Agent': USER_AGENT,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.loads(r.read())
            return data['content'][0]['text'].strip()
    except Exception as e:
        print(f'  [anthropic] {signal.get("email", "?")}: {e}', file=sys.stderr)
        return f'[Generation failed: {e}]'


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def run(
    input_path: pathlib.Path = DEFAULT_INPUT,
    output_path: pathlib.Path = DEFAULT_OUTPUT,
    dry_run: bool = False,
) -> None:
    load_env()

    if not input_path.exists():
        print(f'[hunt/warm-intro] signals file not found: {input_path}')
        print('  Run intent_signals.py first.')
        return

    data = json.loads(input_path.read_text(encoding='utf-8'))
    high_priority = data.get('high_priority', [])
    print(f'[hunt/warm-intro] {len(high_priority)} high-priority leads from {input_path}')

    if not high_priority:
        print('[hunt/warm-intro] no high-priority leads — nothing to do')
        return

    if not ANTHROPIC_API_KEY:
        print('[hunt/warm-intro] WARNING: ANTHROPIC_API_KEY not set — will use template fallback')

    now = datetime.now(timezone.utc)
    lines = [
        f'# Hunt — Warm Intro Requests',
        f'',
        f'Generated: {now.isoformat()}',
        f'Source: {input_path}',
        f'Total high-priority: {len(high_priority)} | Processing: {min(MAX_INTROS_PER_RUN, len(high_priority))}',
        f'',
        '---',
        '',
    ]

    processed = 0
    for signal in high_priority[:MAX_INTROS_PER_RUN]:
        email = signal.get('email', '')
        name = f"{signal.get('first_name', '')} {signal.get('last_name', '')}".strip() or email
        company = signal.get('company', '') or '—'
        score = signal.get('intent_score', 0)
        stage = signal.get('stage', 0)

        print(f'  [{processed + 1}] {email} (score={score})')

        if dry_run:
            intro = '[DRY RUN: message would be generated here]'
        elif ANTHROPIC_API_KEY:
            intro = generate_warm_intro(signal, ANTHROPIC_API_KEY)
            time.sleep(0.5)
        else:
            intro = (
                f"Following up on your interest in {signal.get('subject', 'our compliance tools')} — "
                f"I'd love to share how similar {signal.get('vertical', 'companies')} are solving this. "
                f"Can we connect for 15 minutes?"
            )

        lines.extend([
            f'## {name} @ {company}',
            f'',
            f'- **Email:** {email}',
            f'- **Intent score:** {score}/100',
            f'- **Stage:** {stage}',
            f'- **Vertical:** {signal.get("vertical", "—")}',
            f'- **Opened at:** {signal.get("opened_at", "—")}',
            f'',
            f'**Message:**',
            f'',
            f'> {intro}',
            f'',
            '---',
            '',
        ])
        processed += 1

    content = '\n'.join(lines)

    if dry_run:
        print(f'[hunt/warm-intro] DRY RUN — would write {processed} intro(s) to {output_path}')
        print(content[:800])
        return

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding='utf-8')
    print(f'[hunt/warm-intro] wrote {processed} warm intro(s) to {output_path}')


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dry-run', action='store_true', help='Print what would be written; no writes')
    ap.add_argument('--input', type=pathlib.Path, default=DEFAULT_INPUT,
                    help=f'Intent signals JSON path (default: {DEFAULT_INPUT})')
    ap.add_argument('--output', type=pathlib.Path, default=DEFAULT_OUTPUT,
                    help=f'Output markdown path (default: {DEFAULT_OUTPUT})')
    args = ap.parse_args()
    run(input_path=args.input, output_path=args.output, dry_run=args.dry_run)
    return 0


if __name__ == '__main__':
    sys.exit(main())
