#!/usr/bin/env python3
"""
fix_crontab.py - rewrite the installed crontab to inline all $VAR references.

The Hetzner cron daemon (vixie-cron on Ubuntu 22.04) has a quirk where some
installations do NOT expand shell variables in command strings. The symptom
in /var/log/seo-agents.log is:

    python3: can't open file '/opt/bizlegal/curator/$DIR/services/...'

Even though the crontab source contains unescaped `$DIR`, cron on this box
passes the literal string to /bin/sh, which then expands it (this works on
some boxes). When it does NOT work, the fix is to inline the values so cron
does not depend on variable expansion at all.

Before:  0 4 * * *  cd $DIR && set -a && . ./.env && set +a && $PY $S/daily_orchestrator.py --task=04
After:   0 4 * * *  cd /opt/bizlegal/curator && set -a && . ./.env && set +a && python3 /opt/bizlegal/curator/services/seo-agents/daily_orchestrator.py --task=04

Run:      python3 /tmp/fix_crontab.py
Verify:   crontab -l | awk '!/^#/ && !/^$/' | wc -l   # should match old count
Re-run safely: it is idempotent (re-installs the same fixed crontab).
"""
import subprocess
import sys

REPLACEMENTS = {
    "$DIR":     "/opt/bizlegal/curator",
    "$PY":      "python3",
    "$PYTHON":  "python3",
    "$S":       "/opt/bizlegal/curator/services/seo-agents",
    "$C":       "/opt/bizlegal/curator/services/seo-agents/crawlers",
}


def main():
    # 1) dump current crontab
    cur = subprocess.run(["crontab", "-l"], capture_output=True, text=True)
    if cur.returncode != 0:
        print("ERROR: crontab -l failed (no crontab installed?)", file=sys.stderr)
        sys.exit(1)
    src = cur.stdout
    active_before = sum(1 for l in src.splitlines() if l.strip() and not l.strip().startswith("#"))
    print(f"current crontab: {active_before} active entries")

    # 2) inline variables
    new = src
    hits = {}
    for k, v in REPLACEMENTS.items():
        if k in new:
            hits[k] = new.count(k)
            new = new.replace(k, v)
    if not hits:
        print("no variable references found - crontab already inlined")
        return
    print(f"inlined variables: {hits}")

    # 3) install
    with open("/tmp/crontab.new", "w") as f:
        f.write(new)
    install = subprocess.run(["crontab", "/tmp/crontab.new"], capture_output=True, text=True)
    if install.returncode != 0:
        print(f"ERROR installing crontab: {install.stderr}", file=sys.stderr)
        sys.exit(1)

    # 4) verify
    verify = subprocess.run(["crontab", "-l"], capture_output=True, text=True)
    active_after = sum(1 for l in verify.stdout.splitlines() if l.strip() and not l.strip().startswith("#"))
    print(f"after install: {active_after} active entries")
    if active_after != active_before:
        print(f"WARNING: entry count changed {active_before} -> {active_after}")
    else:
        print("OK - crontab reinstalled with inlined paths")


if __name__ == "__main__":
    main()