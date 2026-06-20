#!/usr/bin/env python3
"""Daily cleanup - archive old reports older than 7 days."""
import shutil, datetime
from pathlib import Path
SRC = Path('/opt/bizlegal/decisions')
DST = SRC / 'archive' / datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m')
DST.mkdir(parents=True, exist_ok=True)
now = datetime.datetime.now(datetime.timezone.utc)
moved = 0
for f in SRC.glob('*'):
    if f.is_file() and f.suffix in ('.json', '.md'):
        mtime = datetime.datetime.fromtimestamp(f.stat().st_mtime, datetime.timezone.utc)
        if (now - mtime).days > 7:
            shutil.move(str(f), str(DST / f.name))
            moved += 1
print('cleanup: moved ' + str(moved) + ' old reports to ' + str(DST))
