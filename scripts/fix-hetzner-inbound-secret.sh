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

# ── Update secret ───────────────────────────────────────────────────────────
if grep -q "^BIZLEGAL_INBOUND_SECRET=" "$ENV_FILE"; then
  sed -i "s|^BIZLEGAL_INBOUND_SECRET=.*|BIZLEGAL_INBOUND_SECRET=${CANONICAL_SECRET}|" "$ENV_FILE"
  echo "Updated BIZLEGAL_INBOUND_SECRET in $ENV_FILE"
else
  echo "BIZLEGAL_INBOUND_SECRET=${CANONICAL_SECRET}" >> "$ENV_FILE"
  echo "Added BIZLEGAL_INBOUND_SECRET to $ENV_FILE"
fi

# ── Update Ollama model ──────────────────────────────────────────────────────
if grep -q "^SCOUT_OLLAMA_MODEL=" "$ENV_FILE"; then
  sed -i "s|^SCOUT_OLLAMA_MODEL=.*|SCOUT_OLLAMA_MODEL=gemma4:12b|" "$ENV_FILE"
else
  echo "SCOUT_OLLAMA_MODEL=gemma4:12b" >> "$ENV_FILE"
fi
echo "Set SCOUT_OLLAMA_MODEL=gemma4:12b"

# ── Pull Gemma 4 12B ────────────────────────────────────────────────────────
echo "Pulling Gemma 4 12B (this may take 5-10 minutes, ~8GB download)..."
ollama pull gemma4:12b 2>&1 | tail -5 || {
  echo "gemma4:12b not available yet, trying gemma3:12b..."
  ollama pull gemma3:12b 2>&1 | tail -5 || {
    echo "gemma3:12b not available, keeping mistral-nemo fallback"
    sed -i "s|^SCOUT_OLLAMA_MODEL=gemma4:12b|SCOUT_OLLAMA_MODEL=mistral-nemo|" "$ENV_FILE"
  }
}

# ── Git pull monorepo ────────────────────────────────────────────────────────
MONOREPO_PATHS=("/opt/bizlegal-monorepo" "/opt/bizlegal")
for p in "${MONOREPO_PATHS[@]}"; do
  if [ -d "$p/.git" ]; then
    echo "Pulling latest monorepo at $p..."
    cd "$p" && git pull --ff-only && echo "Git pull OK"
    break
  fi
done

# ── Restart services ─────────────────────────────────────────────────────────
echo "Restarting curator services..."
systemctl restart curator-bot 2>/dev/null && echo "curator-bot restarted" || echo "curator-bot restart failed (check name)"
systemctl restart curator-publisher 2>/dev/null && echo "curator-publisher restarted" || echo "curator-publisher restart failed"

echo ""
echo "=== Verification ==="
echo "Ollama models:"
ollama list
echo ""
echo "Curator status:"
systemctl is-active curator-bot curator-publisher 2>/dev/null
echo ""
echo "DONE. Test HMAC chain with:"
echo "  curl -X POST https://bizlegal-ai.com/api/ops/log -H 'Content-Type: application/json' ..."
