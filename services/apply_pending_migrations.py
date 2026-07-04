#!/usr/bin/env python3
"""
apply_pending_migrations.py — Idempotent migration runner.

Reads all .sql files under supabase/migrations/ in chronological order
(NNNN prefix), applies any not yet recorded in schema_migrations, and
records them. Safe to run repeatedly.

Requires SUPABASE_DB_URL in env (postgres://user:pass@host:port/db).
"""
import os, sys, glob
from pathlib import Path

try:
    import psycopg2
except ImportError:
    print("psycopg2 not installed. Run: pip3 install --break-system-packages psycopg2-binary")
    sys.exit(1)

DB_URL = os.environ.get("SUPABASE_DB_URL")
if not DB_URL:
    print("SUPABASE_DB_URL not set. Add it to /opt/bizlegal/curator/.env to enable migrations.")
    sys.exit(2)

REPO = Path(__file__).resolve().parents[2]
MIG_DIR = REPO / "supabase" / "migrations"

conn = psycopg2.connect(DB_URL)
conn.autocommit = False
cur = conn.cursor()

# Ensure tracking table
cur.execute("""
    CREATE TABLE IF NOT EXISTS schema_migrations (
        filename text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
    )
""")
conn.commit()

cur.execute("SELECT filename FROM schema_migrations")
applied = {r[0] for r in cur.fetchall()}

files = sorted(glob.glob(str(MIG_DIR / "*.sql")))
applied_count = 0
for f in files:
    fn = os.path.basename(f)
    if fn in applied: continue
    print(f"  applying {fn} ...", end=" ", flush=True)
    with open(f) as fh:
        sql = fh.read()
    try:
        cur.execute(sql)
        cur.execute("INSERT INTO schema_migrations (filename) VALUES (%s)", (fn,))
        conn.commit()
        print("OK")
        applied_count += 1
    except Exception as e:
        conn.rollback()
        print(f"FAIL: {e}")
        print(f"  -> migration {fn} failed; not recorded. Fix and re-run.")
        sys.exit(3)

print(f"\nDone. Applied {applied_count} new migration(s). {len(applied)} total already on record.")
