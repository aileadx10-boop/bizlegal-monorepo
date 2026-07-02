#!/usr/bin/env python3
"""
apply_ops_migrations.py — apply Phase 1 ops migrations to Supabase.

PLATFORM-BUILD-2026-07-02 Phase 1.

Reads SQL from the migration files in apps/hub/supabase/migrations/ and
applies them via a direct Postgres connection. The connection string is
read from the SUPABASE_DB_URL env var.

Get the connection string from:
  Supabase dashboard → Project → Settings → Database → Connection string (URI)

Format: postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres

Usage:
  export SUPABASE_DB_URL="postgresql://postgres:..."
  python3 apply_ops_migrations.py
"""
import os
import sys
from pathlib import Path

try:
    import psycopg2
except ImportError:
    print("psycopg2 not installed. Install with: pip install psycopg2-binary")
    sys.exit(1)

DB_URL = os.environ.get("SUPABASE_DB_URL", "").strip()
if not DB_URL:
    print("SUPABASE_DB_URL env var not set.")
    print()
    print("MANUAL STEPS:")
    print("  1. Open https://app.supabase.com/project/ydghhcuuopqzgqcicubg/sql")
    print("  2. New query")
    print("  3. Paste contents of apps/hub/supabase/migrations/20260702_agent_heartbeats.sql")
    print("  4. Run")
    print("  5. New query")
    print("  6. Paste contents of apps/hub/supabase/migrations/20260702_agent_alerts_log.sql")
    print("  7. Run")
    sys.exit(1)

migrations_dir = Path(__file__).parent / "apps" / "hub" / "supabase" / "migrations"
files = sorted(migrations_dir.glob("20260702_*.sql"))
print(f"Found {len(files)} Phase-1 migration(s) to apply:")
for f in files:
    print(f"  - {f.name}")

try:
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    for f in files:
        print(f"\nApplying {f.name}...")
        cur.execute(f.read_text())
        print(f"  OK")
    cur.close()
    conn.close()
    print("\nAll migrations applied successfully.")
except Exception as e:
    print(f"\nERROR: {e}")
    sys.exit(1)
