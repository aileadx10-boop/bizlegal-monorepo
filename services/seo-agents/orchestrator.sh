#!/bin/bash
# BizLegal AI — daily orchestrator shell.
# Run all daily tasks in order. Each task is independent and writes to
# Supabase agent_runs + decisions/.

set -e
DIR=/opt/bizlegal/curator/services/seo-agents
LOG=/var/log/daily-orchestrator.log
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "[$TS] orchestrator start" >> $LOG

cd /opt/bizlegal/curator
set -a
. ./.env
set +a

# 00 brain followup (after overnight drafts)
python3 $DIR/daily_orchestrator.py --task=00 >> $LOG 2>&1 || true
# 04 content enricher
python3 $DIR/daily_orchestrator.py --task=04 >> $LOG 2>&1 || true
# 05 visual assets
python3 $DIR/daily_orchestrator.py --task=05 >> $LOG 2>&1 || true
# 06 affiliate funnel
python3 $DIR/daily_orchestrator.py --task=06 >> $LOG 2>&1 || true
# 07 geo citation
python3 $DIR/daily_orchestrator.py --task=07 >> $LOG 2>&1 || true
# 08 site health
python3 $DIR/daily_orchestrator.py --task=08 >> $LOG 2>&1 || true
# 13 seo watchdog
python3 $DIR/daily_orchestrator.py --task=13 >> $LOG 2>&1 || true
# 15 sales
python3 $DIR/daily_orchestrator.py --task=15 >> $LOG 2>&1 || true
# 16 leads
python3 $DIR/daily_orchestrator.py --task=16 >> $LOG 2>&1 || true
# 19 daily report
python3 $DIR/daily_orchestrator.py --task=19 >> $LOG 2>&1 || true

# NEW: crawlers + watchdog + newsletter (each in their own file for cleaner errors)
python3 $DIR/crawlers/site_health.py >> $LOG 2>&1 || true
python3 $DIR/crawlers/backlinks.py >> $LOG 2>&1 || true
python3 $DIR/crawlers/competitors.py >> $LOG 2>&1 || true
python3 $DIR/crawlers/ai_checks.py >> $LOG 2>&1 || true
python3 $DIR/crawlers/index_status.py >> $LOG 2>&1 || true
python3 $DIR/crawlers/sales.py >> $LOG 2>&1 || true
python3 $DIR/crawlers/leads.py >> $LOG 2>&1 || true
python3 $DIR/crawlers/customer_q.py >> $LOG 2>&1 || true
python3 $DIR/seo_watchdog.py >> $LOG 2>&1 || true
python3 $DIR/newsletter.py >> $LOG 2>&1 || true

TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "[$TS] orchestrator end" >> $LOG
