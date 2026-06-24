#!/usr/bin/env python3
"""
install_autonomous_cron.py - install the 11-job autonomous pipeline on Hetzner.

Adds these jobs to crontab (inlined paths, no $VAR - per fix_crontab.py):
  06:00  page_audit.py        -- audit all 8 surfaces
  06:30  enrich_page.py       -- generate JSON-LD blocks for failing pages
  07:00  daily_autonomous_seo -- master orchestrator (audit+enrich+publish+indexnow+discover+headhunter+OCI+TG)
  10:00  oci_funnel.py        -- partner routing + invoice request (independent run)
  11:00  discovery_scraper.py -- CoinGecko + GitHub + SEC EDGAR free sources
  14:30  publish_blog.py      -- existing build #11 (already in cron)
  19:00  daily_orchestrator   -- existing task=19 (already in cron)

Each Telegram-bot sends a heartbeat via telegram_heartbeat.py.

Run:    python3 install_autonomous_cron.py
Verify: crontab -l | wc -l
"""
import subprocess, sys, pathlib

CURATOR = "/opt/bizlegal/curator"
PY = "python3"
LOG = "/var/log/seo-agents.log"

NEW_JOBS = [
    # 06:00 - daily SEO audit across 8 surfaces
    f"0 6 * * * cd {CURATOR} && set -a && . ./.env && set +a && {PY} {CURATOR}/services/seo-agents/page_audit.py --output /opt/bizlegal/decisions && {PY} {CURATOR}/services/seo-agents/telegram_heartbeat.py '✅ page_audit: $(ls -t /opt/bizlegal/decisions/SEO-AUDIT-*.md | head -1 | xargs cat | head -3 | tail -1)' >> {LOG} 2>&1",
    # 06:30 - enrichment plan generation
    f"30 6 * * * cd {CURATOR} && set -a && . ./.env && set +a && {PY} {CURATOR}/services/seo-agents/enrich_page.py --output /opt/bizlegal/decisions && {PY} {CURATOR}/services/seo-agents/telegram_heartbeat.py '✅ enrich_page: plan generated' >> {LOG} 2>&1",
    # 07:00 - MASTER: audit+enrich+publish+indexnow+discover+headhunter+OCI+TG
    f"0 7 * * * cd {CURATOR} && set -a && . ./.env && set +a && {PY} {CURATOR}/services/seo-agents/daily_autonomous_seo.py --skip-send --headhunter-limit 3 >> {LOG} 2>&1",
    # 10:00 - OCI partner routing (independent re-run after more leads discovered)
    f"0 10 * * * cd {CURATOR} && set -a && . ./.env && set +a && {PY} {CURATOR}/services/outreach/oci_funnel.py --output /opt/bizlegal/decisions >> {LOG} 2>&1",
    # 11:00 - discovery (CoinGecko + GitHub + SEC EDGAR)
    f"0 11 * * * cd {CURATOR} && set -a && . ./.env && set +a && {PY} {CURATOR}/services/seo-agents/discovery_scraper.py --source all --output /opt/bizlegal/decisions && {PY} {CURATOR}/services/seo-agents/telegram_heartbeat.py '✅ discovery: $(grep -c \\|^\\| /opt/bizlegal/decisions/DISCOVERY-\\$(date +\\%Y-\\%m-\\%d).md 2>/dev/null || echo 0) prospects' >> {LOG} 2>&1",
    # 12:00 - PUBLISH (was missing from cron — auto-commit enrichment + new posts)
    f"0 12 * * * cd {CURATOR} && set -a && . ./.env && set +a && {PY} {CURATOR}/services/seo-agents/publish_blog.py >> {LOG} 2>&1",
]


def main():
    # 1) load existing crontab
    cur = subprocess.run(["crontab", "-l"], capture_output=True, text=True)
    if cur.returncode != 0:
        print("ERROR: no existing crontab", file=sys.stderr); sys.exit(1)
    src = cur.stdout
    before = sum(1 for l in src.splitlines() if l.strip() and not l.strip().startswith("#"))
    print(f"current crontab: {before} entries")

    # 2) append new jobs (only if not already present)
    new_src = src
    added = 0
    for job in NEW_JOBS:
        # crude dedupe by checking the command substring
        key = job.split("&&")[1] if "&&" in job else job
        if key.strip() not in new_src:
            new_src += job + "\n"
            added += 1
    if added == 0:
        print("all jobs already installed"); return

    # 3) install
    path = "/tmp/crontab.autonomous"
    open(path, "w").write(new_src)
    r = subprocess.run(["crontab", path], capture_output=True, text=True)
    if r.returncode != 0:
        print(f"install err: {r.stderr}", file=sys.stderr); sys.exit(1)

    # 4) verify
    v = subprocess.run(["crontab", "-l"], capture_output=True, text=True)
    after = sum(1 for l in v.stdout.splitlines() if l.strip() and not l.strip().startswith("#"))
    print(f"after install: {after} entries (added {added})")
    if after != before + added:
        print(f"WARNING: count delta {before}->{after} != expected +{added}")


if __name__ == "__main__":
    main()