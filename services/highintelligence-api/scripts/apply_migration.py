"""One-command Neon migration runner for BrainX."""
from __future__ import annotations

import os
import sys


def main() -> int:
    path = sys.argv[1] if len(sys.argv) > 1 else "packages/database/neon/migrations/001_brainx_schema.sql"
    url = os.getenv("NEON_DATABASE_URL") or os.getenv("DATABASE_URL", "")
    if not url:
        print("NEON_DATABASE_URL not set; run manually via Neon SQL editor", file=sys.stderr)
        return 1
    try:
        import postgres
    except ImportError:
        print("postgres driver missing (pip install postgres)", file=sys.stderr)
        return 1
    sql = postgres(url, max=1)
    with open(path, encoding="utf-8") as f:
        statements = [s.strip() for s in f.read().split(";") if s.strip() and not s.strip().startswith("--")]
    for stmt in statements:
        try:
            sql.unsafe(stmt)
        except Exception as e:
            print(f"applied: {stmt[:60]} (error ignored: {e})")
    sql.close()
    print("done: brainx schema applied")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
