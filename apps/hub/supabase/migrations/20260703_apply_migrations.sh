#!/bin/bash
# ============================================================================
# 20260703_apply_migrations.sh
#
# Apply all pending platform build migrations (P1 + P3 + P5) to Supabase.
#
# Usage:
#   SUPABASE_DB_URL="postgresql://postgres.ydghhcuuopqzgqcicubg:<password>@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
#     bash apps/hub/supabase/migrations/20260703_apply_migrations.sh
#
# Get SUPABASE_DB_URL from:
#   Supabase dashboard → Project Settings → Database → URI (Connection String)
#   Use the Transaction Mode pooler URL, replace [YOUR-PASSWORD] with DB password.
#
# Tables created:
#   - agent_heartbeats    (P1: live process inspection)
#   - agent_alerts_log    (P1: Telegram dedup)
#   - extension_captures  (P3: browser extension)
#   - spy_intel           (P5: competitor intelligence)
# ============================================================================
set -e

DB_URL="${SUPABASE_DB_URL:?SUPABASE_DB_URL is required. Get from Supabase dashboard → Project Settings → Database → URI}"

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[BizLegal] Applying platform build migrations to Supabase..."
echo "[BizLegal] Project: ydghhcuuopqzgqcicubg"
echo ""

MIGRATIONS=(
  "20260702_agent_heartbeats.sql"
  "20260702_agent_alerts_log.sql"
  "20260703_extension_captures.sql"
  "20260703_spy_intel.sql"
)

for migration in "${MIGRATIONS[@]}"; do
  if [ -f "$DIR/$migration" ]; then
    echo "  → Applying $migration..."
    psql "$DB_URL" < "$DIR/$migration" 2>&1 | grep -v "^$" | sed 's/^/    /'
    echo "    ✓ done"
  else
    echo "  ! SKIP $migration — file not found (run from monorepo root)"
  fi
done

echo ""
echo "[BizLegal] All migrations applied."
echo ""
echo "Next steps:"
echo "  1. Verify tables exist: Supabase dashboard → Table Editor"
echo "  2. Set SUPABASE_DB_URL on Hetzner: echo 'SUPABASE_DB_URL=...' >> /opt/bizlegal/curator/.env"
echo "  3. Restart curator services: systemctl restart curator-bot curator-publisher"
