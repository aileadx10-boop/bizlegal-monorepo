#!/bin/bash
# Install THE MACHINE cron entries on Hetzner
# Usage: bash /opt/bizlegal/curator/services/agents/install_machine_cron.sh
# Safe: reads existing crontab, appends only new entries, never wipes

set -e

CURATOR="/opt/bizlegal/curator"
AGENTS="$CURATOR/services/agents"
LOG="$CURATOR/logs/machine"
PYTHON="python3"

mkdir -p "$LOG"

CRON_ENTRIES=(
  "15 0 * * * cd $CURATOR && $PYTHON $AGENTS/orchestrator.py code >> $LOG/code.log 2>&1"
  "0 2 * * * cd $CURATOR && $PYTHON $AGENTS/orchestrator.py enrichment >> $LOG/enrichment.log 2>&1"
  "0 14 * * * cd $CURATOR && $PYTHON $AGENTS/orchestrator.py enrichment >> $LOG/enrichment-pm.log 2>&1"
  "30 4 * * * cd $CURATOR && $PYTHON $AGENTS/orchestrator.py headhunter >> $LOG/headhunter.log 2>&1"
  "0 6 * * * cd $CURATOR && $PYTHON $AGENTS/orchestrator.py content >> $LOG/content.log 2>&1"
  "0 9 * * * cd $CURATOR && $PYTHON $AGENTS/orchestrator.py socials >> $LOG/socials-am.log 2>&1"
  "0 13 * * * cd $CURATOR && $PYTHON $AGENTS/orchestrator.py socials >> $LOG/socials-noon.log 2>&1"
  "0 18 * * * cd $CURATOR && $PYTHON $AGENTS/orchestrator.py socials >> $LOG/socials-pm.log 2>&1"
  "0 8 * * 2 cd $CURATOR && $PYTHON $AGENTS/orchestrator.py newsletter >> $LOG/newsletter.log 2>&1"
  "*/15 * * * * cd $CURATOR && $PYTHON $AGENTS/orchestrator.py monetization >> $LOG/monetization.log 2>&1"
)

# Read current crontab (empty if none)
crontab -l 2>/dev/null > /tmp/machine_cron_current || true

added=0
for entry in "${CRON_ENTRIES[@]}"; do
  # Check if a line with the same orchestrator call already exists
  key=$(echo "$entry" | awk '{print $NF}')
  if ! grep -qF "$key" /tmp/machine_cron_current; then
    echo "$entry" >> /tmp/machine_cron_current
    echo "  + added: $key"
    added=$((added+1))
  else
    echo "  = exists: $key"
  fi
done

crontab /tmp/machine_cron_current
rm /tmp/machine_cron_current

echo ""
echo "Done. $added new entries added."
echo "Verify with: crontab -l | grep orchestrator"
