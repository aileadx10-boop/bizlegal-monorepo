#!/usr/bin/env bash
# fix-hetzner-inbound-secret.sh
# Run this ON the Hetzner box (copy the correct VAULT value first)
# Usage: CANONICAL_SECRET="<vault_value>" bash fix-hetzner-inbound-secret.sh

set -e

# ── YOU MUST SET THIS BEFORE RUNNING ────────────────────────────────────────
# Get value from: grep ^BIZLEGAL_INBOUND_SECRET env-hub-bizlegal-ai.txt
CANONICAL_SECRET="${CANONICAL_SECRET:-REPLACE_WITH_VAULT_VALUE}"

if [ "$CANONICAL_SECRET" = "REPLACE_WITH_VAULT_VALUE" ]; then
  echo "ERROR: Set CANONICAL_SECRET env before running" && exit 1
fi

# ── Find the curator .env ───────────────────────────────────────────────────
ENV_PATHS=(
  "/opt/bizlegal/curator/.env"
  "/opt/bizlegal-monorepo/services/hetzner/.env"
  "/opt/curator/.env"
)

ENV_FILE=""
for p in "${ENV_PATHS[@]}"; do
  if [ -f "$p" ]; then
    ENV_FILE="$p"
    echo "Found .env at: $ENV_FILE"
    break
  fi
done

if [ -z "$ENV_FILE" ]; then
  echo "ERROR: Could not find curator .env" && exit 1
fi

# ── Backup ──────────────────────────────────────────────────────────────────
cp "$ENV_FILE" "${ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"
echo "Backed up to ${ENV_FILE}.bak.*"

# ── Update HMAC secret ───────────────────────────────────────────────────────
if grep -q "^BIZLEGAL_INBOUND_SECRET=" "$ENV_FILE"; then
  sed -i "s|^BIZLEGAL_INBOUND_SECRET=.*|BIZLEGAL_INBOUND_SECRET=${CANONICAL_SECRET}|" "$ENV_FILE"
  echo "Updated BIZLEGAL_INBOUND_SECRET"
else
  echo "BIZLEGAL_INBOUND_SECRET=${CANONICAL_SECRET}" >> "$ENV_FILE"
  echo "Added BIZLEGAL_INBOUND_SECRET"
fi

# ── Fast-path Ollama model: set to mistral-nemo (confirmed installed) ────────
# Actual env vars read by scout.py: OLLAMA_FILTER_MODEL + OLLAMA_RANK_MODEL
# (NOT the old SCOUT_OLLAMA_MODEL which no longer exists)
set_ollama_var() {
  local KEY="$1" VAL="$2"
  if grep -q "^${KEY}=" "$ENV_FILE"; then
    sed -i "s|^${KEY}=.*|${KEY}=${VAL}|" "$ENV_FILE"
  else
    echo "${KEY}=${VAL}" >> "$ENV_FILE"
  fi
  echo "Set ${KEY}=${VAL}"
}

# Remove stale SCOUT_OLLAMA_MODEL if it exists
sed -i '/^SCOUT_OLLAMA_MODEL=/d' "$ENV_FILE" 2>/dev/null || true

set_ollama_var OLLAMA_FILTER_MODEL "mistral-nemo"
set_ollama_var OLLAMA_RANK_MODEL "mistral-nemo"

# ── Git pull monorepo ────────────────────────────────────────────────────────
MONOREPO_PATHS=("/opt/bizlegal-monorepo" "/opt/bizlegal")
for p in "${MONOREPO_PATHS[@]}"; do
  if [ -d "$p/.git" ]; then
    echo "Pulling latest monorepo at $p..."
    cd "$p" && git pull --ff-only && echo "Git pull OK"
    break
  fi
done

# ── Restart services (brain + publisher + bot) ────────────────────────────────
echo "Restarting curator services..."
for svc in curator-brain curator-publisher curator-bot; do
  systemctl restart "$svc" 2>/dev/null \
    && echo "$svc restarted" \
    || echo "$svc restart failed (check: systemctl status $svc)"
done

# ── Verification ─────────────────────────────────────────────────────────────
echo ""
echo "=== Verification ==="
echo "Ollama models:"
ollama list
echo ""
echo "Curator service status:"
for svc in curator-brain curator-publisher curator-bot; do
  printf "%s: %s\n" "$svc" "$(systemctl is-active $svc 2>/dev/null || echo 'not found')"
done
echo ""
echo "DONE. Test HMAC chain with:"
echo "  curl -X POST https://bizlegal-ai.com/api/ops/log -H 'Content-Type: application/json' ..."
echo ""
echo "-- Optional: pull Gemma 4 12B in background for future use (8GB, ~10 min) --"
echo "  nohup ollama pull gemma4:12b &> /tmp/ollama-pull.log &"
echo "  Then update: OLLAMA_FILTER_MODEL=gemma4:12b + OLLAMA_RANK_MODEL=gemma4:12b"
echo "  Then: systemctl restart curator-brain curator-publisher curator-bot"
