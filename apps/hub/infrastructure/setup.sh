#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# BizLegal AI — Hetzner CX32 Infrastructure Setup
# Run as root on a fresh Ubuntu 22.04 LTS server
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/aileadx10-boop/bizlegal-ai/main/infrastructure/setup.sh | bash
#   OR: bash /opt/bizlegal/infrastructure/setup.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

BIZLEGAL_DIR="/opt/bizlegal"
REPO_URL="https://github.com/aileadx10-boop/bizlegal-ai.git"
BRANCH="claude/automate-github-setup-8Yd6U"
NODE_VERSION="20"
PYTHON_VERSION="3.11"

log() { echo "[$(date +%H:%M:%S)] $*"; }
err() { echo "[ERROR] $*" >&2; exit 1; }

log "=== BizLegal AI Infrastructure Setup ==="
log "Target: $BIZLEGAL_DIR"

# ── 1. System dependencies ────────────────────────────────────
log "Installing system packages..."
apt-get update -qq
apt-get install -y -qq \
  curl git build-essential \
  python3 python3-pip python3-venv \
  nginx certbot python3-certbot-nginx \
  weasyprint \
  docker.io docker-compose \
  sqlite3 \
  chromium-browser \
  > /dev/null 2>&1

# ── 2. Node.js ────────────────────────────────────────────────
log "Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - > /dev/null 2>&1
apt-get install -y -qq nodejs > /dev/null 2>&1
log "  Node: $(node --version) | npm: $(npm --version)"

# ── 3. PM2 ───────────────────────────────────────────────────
log "Installing PM2..."
npm install -g pm2 > /dev/null 2>&1

# ── 4. Ollama ─────────────────────────────────────────────────
log "Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh > /dev/null 2>&1
systemctl enable ollama --now

log "Pulling AI models (this may take a few minutes)..."
ollama pull gemma2:9b &
ollama pull llama3.2:3b &
wait
log "  Models: gemma2:9b + llama3.2:3b ready"

# ── 5. Create directory structure ─────────────────────────────
log "Creating BizLegal directory structure..."
mkdir -p "$BIZLEGAL_DIR"/{workflows,tools,n8n,skills,gaps,logs,pdfs,templates,assets}
chmod -R 755 "$BIZLEGAL_DIR"

# ── 6. Clone repo ─────────────────────────────────────────────
log "Cloning BizLegal AI repo..."
if [ -d "$BIZLEGAL_DIR/repo/bizlegal-ai" ]; then
  log "  Repo already exists — pulling latest"
  cd "$BIZLEGAL_DIR/repo/bizlegal-ai"
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
else
  mkdir -p "$BIZLEGAL_DIR/repo"
  git clone -b "$BRANCH" "$REPO_URL" "$BIZLEGAL_DIR/repo/bizlegal-ai"
fi

# ── 7. Sync infrastructure files ─────────────────────────────
log "Syncing infrastructure files..."
cp -r "$BIZLEGAL_DIR/repo/bizlegal-ai/infrastructure/workflows/"* "$BIZLEGAL_DIR/workflows/"
cp -r "$BIZLEGAL_DIR/repo/bizlegal-ai/infrastructure/tools/"* "$BIZLEGAL_DIR/tools/"
cp -r "$BIZLEGAL_DIR/repo/bizlegal-ai/infrastructure/n8n/"* "$BIZLEGAL_DIR/n8n/"
cp -r "$BIZLEGAL_DIR/repo/bizlegal-ai/infrastructure/skills/"* "$BIZLEGAL_DIR/skills/"
chmod +x "$BIZLEGAL_DIR/tools/"*.py "$BIZLEGAL_DIR/tools/"*.js 2>/dev/null || true

# ── 8. Python environment ─────────────────────────────────────
log "Setting up Python virtualenv..."
python3 -m venv "$BIZLEGAL_DIR/.venv"
source "$BIZLEGAL_DIR/.venv/bin/activate"
pip install -q requests supabase crawlee playwright weasyprint jinja2

# ── 9. Node dependencies for Crawlee ─────────────────────────
log "Installing Crawlee dependencies..."
cd "$BIZLEGAL_DIR/tools"
npm init -y > /dev/null 2>&1
npm install --save crawlee playwright > /dev/null 2>&1
npx playwright install chromium > /dev/null 2>&1

# ── 10. n8n via Docker ───────────────────────────────────────
log "Starting n8n..."
cat > /etc/docker-compose-n8n.yml << 'N8N_EOF'
version: "3"
services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER:-admin}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://${SERVER_DOMAIN}/webhook/
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=${SUPABASE_DB_HOST}
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=postgres
      - DB_POSTGRESDB_USER=postgres
      - DB_POSTGRESDB_PASSWORD=${SUPABASE_DB_PASSWORD}
    volumes:
      - n8n_data:/home/node/.n8n
      - /opt/bizlegal:/opt/bizlegal
volumes:
  n8n_data:
N8N_EOF

docker-compose -f /etc/docker-compose-n8n.yml up -d

# ── 11. Environment setup ─────────────────────────────────────
log "Setting up .env..."
if [ ! -f "$BIZLEGAL_DIR/.env" ]; then
  cp "$BIZLEGAL_DIR/repo/bizlegal-ai/infrastructure/.env.template" "$BIZLEGAL_DIR/.env"
  log "  Created .env from template — FILL IN SECRETS before running pipelines"
else
  log "  .env already exists — skipping"
fi

# ── 12. Cron shortcuts ────────────────────────────────────────
log "Creating convenience scripts..."
cat > /usr/local/bin/bizlegal-scout << 'EOF'
#!/bin/bash
source /opt/bizlegal/.venv/bin/activate
source /opt/bizlegal/.env
python3 /opt/bizlegal/tools/scout_ollama.py "$@"
EOF
chmod +x /usr/local/bin/bizlegal-scout

cat > /usr/local/bin/bizlegal-pipeline << 'EOF'
#!/bin/bash
source /opt/bizlegal/.venv/bin/activate
source /opt/bizlegal/.env
TODAY=$(date +%Y-%m-%d)
echo "[pipeline] Starting daily pipeline for $TODAY"
python3 /opt/bizlegal/tools/scout_ollama.py --output /opt/bizlegal/gaps/scored-$TODAY.json && \
python3 /opt/bizlegal/tools/judge_dedup.py && \
python3 /opt/bizlegal/tools/writer_draft.py && \
python3 /opt/bizlegal/tools/writer_haiku_qa.py && \
python3 /opt/bizlegal/tools/builder_github.py && \
python3 /opt/bizlegal/tools/publisher_buffer.py
echo "[pipeline] Done."
EOF
chmod +x /usr/local/bin/bizlegal-pipeline

# ── 13. Log rotation ──────────────────────────────────────────
cat > /etc/logrotate.d/bizlegal << 'EOF'
/opt/bizlegal/logs/*.log {
  daily
  rotate 30
  compress
  missingok
  notifempty
}
EOF

# ── 14. Done ─────────────────────────────────────────────────
log ""
log "═══════════════════════════════════════════════"
log "✓ BizLegal AI infrastructure installed"
log ""
log "NEXT STEPS:"
log "  1. Edit /opt/bizlegal/.env with all secrets"
log "  2. Open n8n: http://$(hostname -I | awk '{print $1}'):5678"
log "  3. Import workflows from /opt/bizlegal/n8n/*.json"
log "  4. Test: bizlegal-scout --input /opt/bizlegal/gaps/test.json"
log "  5. Run full pipeline: bizlegal-pipeline"
log ""
log "Models ready:  gemma2:9b + llama3.2:3b"
log "n8n running:   docker ps | grep n8n"
log "Logs:          /opt/bizlegal/logs/"
log "═══════════════════════════════════════════════"
