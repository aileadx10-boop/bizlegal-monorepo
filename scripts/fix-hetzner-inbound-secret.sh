#!/usr/bin/env bash
# fix-hetzner-inbound-secret.sh
# Run ON the Hetzner box as root.
# Verified against compliance-arbitrage box layout 2026-06-14.
#
# What this script does:
#   1. Patches /opt/bizlegal/curator/.env: BIZLEGAL_INBOUND_SECRET (if value differs),
#      OLLAMA_FILTER_MODEL=mistral-nemo, OLLAMA_RANK_MODEL=mistral-nemo
#   2. Patches /opt/bizlegal/curator/auto_pick.py: fixes exit-1 bug
#      (return n → return 0 in main())
#   3. Restarts curator-publisher, curator-bot (healthy but need env reload)
#   4. Resets curator-auto-pick so today's fix takes effect next timer run
#
# Usage (CANONICAL_SECRET is optional — only needed if you want to rotate):
#   CANONICAL_SECRET="$(grep ^BIZLEGAL_INBOUND_SECRET /path/to/vault | cut -d= -f2)" \
#     bash fix-hetzner-inbound-secret.sh

set -euo pipefail

ENV_FILE="/opt/bizlegal/curator/.env"
AUTO_PICK="/opt/bizlegal/curator/auto_pick.py"

# ── Sanity checks ────────────────────────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found. Wrong box?" && exit 1
fi

# ── Backup ───────────────────────────────────────────────────────────────────
cp "$ENV_FILE" "${ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"
echo "Backed up .env"

# ── Rotate BIZLEGAL_INBOUND_SECRET (only if CANONICAL_SECRET is provided) ───
CANONICAL_SECRET="${CANONICAL_SECRET:-}"
if [ -n "$CANONICAL_SECRET" ]; then
  if grep -q "^BIZLEGAL_INBOUND_SECRET=" "$ENV_FILE"; then
    sed -i "s|^BIZLEGAL_INBOUND_SECRET=.*|BIZLEGAL_INBOUND_SECRET=${CANONICAL_SECRET}|" "$ENV_FILE"
    echo "Updated BIZLEGAL_INBOUND_SECRET"
  else
    echo "BIZLEGAL_INBOUND_SECRET=${CANONICAL_SECRET}" >> "$ENV_FILE"
    echo "Added BIZLEGAL_INBOUND_SECRET"
  fi
else
  echo "CANONICAL_SECRET not provided — leaving BIZLEGAL_INBOUND_SECRET unchanged"
fi

# ── Update Ollama model vars (mistral-nemo confirmed on disk) ────────────────
set_env_var() {
  local KEY="$1" VAL="$2"
  if grep -q "^${KEY}=" "$ENV_FILE"; then
    sed -i "s|^${KEY}=.*|${KEY}=${VAL}|" "$ENV_FILE"
  else
    echo "${KEY}=${VAL}" >> "$ENV_FILE"
  fi
  echo "Set ${KEY}=${VAL}"
}

set_env_var OLLAMA_FILTER_MODEL "mistral-nemo"
set_env_var OLLAMA_RANK_MODEL   "mistral-nemo"

# ── Fix curator-auto-pick exit-1 bug ─────────────────────────────────────────
# main() returned n (row count) instead of 0, so SystemExit(1) on every pick.
if [ -f "$AUTO_PICK" ]; then
  if grep -q "    return n$" "$AUTO_PICK"; then
    sed -i 's/^    return n$/    return 0  # exit code; n is a count, not a status/' "$AUTO_PICK"
    echo "Fixed auto_pick.py: return n → return 0"
  else
    echo "auto_pick.py already patched (return n not found) — skipping"
  fi
else
  echo "WARNING: $AUTO_PICK not found — skipping auto_pick fix"
fi

# ── Restart services to pick up new env ──────────────────────────────────────
echo "Restarting curator services..."
for svc in curator-publisher curator-bot; do
  systemctl restart "$svc" 2>/dev/null \
    && echo "$svc restarted OK" \
    || echo "$svc restart failed — check: systemctl status $svc"
done

# Reset auto-pick unit so next timer run uses the fixed script
systemctl reset-failed curator-auto-pick 2>/dev/null || true
echo "curator-auto-pick failure state cleared"

# ── Verification ──────────────────────────────────────────────────────────────
echo ""
echo "=== Verification ==="
echo "Ollama models on disk:"
ollama list 2>/dev/null || echo "(ollama command not in PATH or no models)"

echo ""
echo "Curator service states:"
for svc in curator-publisher curator-bot curator-scout curator-auto-pick; do
  printf "  %-24s %s\n" "$svc" "$(systemctl is-active "$svc" 2>/dev/null || echo 'not-found')"
done

echo ""
echo "Publisher /health:"
curl -s http://127.0.0.1:8082/health 2>/dev/null | python3 -m json.tool || echo "(unreachable)"

echo ""
echo "DONE."
echo ""
echo "--- Optional: upgrade to gemma4:12b (9GB, ~10 min in background) ---"
echo "  nohup ollama pull gemma4:12b &> /tmp/ollama-pull.log &"
echo "  Then: OLLAMA_FILTER_MODEL=gemma4:12b OLLAMA_RANK_MODEL=gemma4:12b"
echo "  Then: systemctl restart curator-publisher curator-bot"
