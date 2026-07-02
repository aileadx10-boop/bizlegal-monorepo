#!/usr/bin/env python3
"""
hunt_orchestrator.py
====================
Phase 5 of PLATFORM-BUILD-2026-07-02 — Hunt subsystem.

Runs the 3 Hunt steps sequentially:
  1. apollo_enrich.py   — enrich leadforge_leads from Apollo.io
  2. intent_signals.py  — identify high-intent leads from lead_outreach
  3. warm_intro.py      — generate warm intro messages for top signals

Logs to /opt/bizlegal/logs/hunt.log (created if absent).

Usage:
  python3 hunt_orchestrator.py
  python3 hunt_orchestrator.py --dry-run
"""
from __future__ import annotations

# ---------------------------------------------------------------------------
# Heartbeat
# ---------------------------------------------------------------------------
try:
    import sys as _sys, os as _os
    _sys.path.insert(0, _os.path.join(_os.path.dirname(__file__), '..', 'seo-agents'))
    from ops_heartbeat import ping_once as _ping
    _ping('hetzner/hunt', status='alive', last_action='orchestrator-start')
except Exception:
    pass

import argparse
import datetime as _dt
import os
import pathlib
import subprocess
import sys
import time

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
LOG_PATH = pathlib.Path('/opt/bizlegal/logs/hunt.log')
SCRIPT_DIR = pathlib.Path(__file__).parent
PYTHON = sys.executable

STEPS = [
    {
        'name': 'apollo_enrich',
        'script': SCRIPT_DIR / 'apollo_enrich.py',
        'args': ['--limit', '20'],
        'description': 'Enrich leadforge_leads via Apollo.io',
    },
    {
        'name': 'intent_signals',
        'script': SCRIPT_DIR / 'intent_signals.py',
        'args': [],
        'description': 'Identify high-intent signals from lead_outreach',
    },
    {
        'name': 'warm_intro',
        'script': SCRIPT_DIR / 'warm_intro.py',
        'args': [],
        'description': 'Generate warm intro messages for top signals',
    },
]


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
def _log(msg: str) -> None:
    ts = _dt.datetime.now(_dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    line = f'[{ts}] {msg}'
    print(line)
    try:
        LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with LOG_PATH.open('a', encoding='utf-8') as f:
            f.write(line + '\n')
    except Exception as e:
        print(f'[log write error] {e}', file=sys.stderr)


# ---------------------------------------------------------------------------
# Step runner
# ---------------------------------------------------------------------------
def _run_step(step: dict, dry_run: bool) -> bool:
    script = step['script']
    if not script.exists():
        _log(f'[{step["name"]}] ERROR: script not found at {script}')
        return False

    cmd = [PYTHON, str(script)] + step['args']
    if dry_run:
        cmd.append('--dry-run')

    _log(f'[{step["name"]}] START — {step["description"]}')
    _log(f'[{step["name"]}] cmd: {" ".join(str(c) for c in cmd)}')

    t0 = time.time()
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,  # 5 min max per step
        )
        elapsed = int((time.time() - t0) * 1000)

        if result.stdout:
            for line in result.stdout.strip().splitlines():
                _log(f'  [stdout] {line}')
        if result.stderr:
            for line in result.stderr.strip().splitlines():
                _log(f'  [stderr] {line}')

        if result.returncode == 0:
            _log(f'[{step["name"]}] OK ({elapsed}ms)')
            return True
        else:
            _log(f'[{step["name"]}] FAILED rc={result.returncode} ({elapsed}ms)')
            return False

    except subprocess.TimeoutExpired:
        _log(f'[{step["name"]}] TIMEOUT after 300s')
        return False
    except Exception as e:
        _log(f'[{step["name"]}] EXCEPTION: {e}')
        return False


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def run(dry_run: bool = False) -> None:
    tag = '[DRY RUN] ' if dry_run else ''
    _log(f'=== Hunt Orchestrator START {tag}===')

    results: dict[str, bool] = {}

    for step in STEPS:
        ok = _run_step(step, dry_run)
        results[step['name']] = ok
        if not ok:
            _log(f'[orchestrator] Step {step["name"]} failed — continuing with next step')
        time.sleep(2)  # brief pause between steps

    # Summary
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    _log(f'=== Hunt Orchestrator DONE: {passed}/{total} steps succeeded ===')
    for name, ok in results.items():
        _log(f'  {name}: {"OK" if ok else "FAILED"}')


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dry-run', action='store_true',
                    help='Pass --dry-run to all sub-scripts; no data written')
    args = ap.parse_args()
    run(dry_run=args.dry_run)
    return 0


if __name__ == '__main__':
    sys.exit(main())
