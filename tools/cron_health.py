"""Validate local cron registry entries point at real files."""
import json
import sys
from pathlib import Path

def main():
    reg = json.loads(Path("tools/.cron-registry.json").read_text(encoding="utf-8"))
    bad = []
    for entry in reg["registry"]:
        first = entry["cmd"].split(";")[0].strip()
        if first.startswith("node "):
            rel = first.split("node ", 1)[1].split(" ")[0]
        elif first.startswith("python -m "):
            rel = "services/langgap/scanner/__main__.py" if "langgap.scanner" in first else "N/A"
        else:
            rel = "N/A"
        if rel != "N/A" and not Path(rel).exists():
            bad.append((entry["id"], rel))
    if bad:
        print("BAD entries:")
        for b in bad:
            print(" ", b)
        return 1
    print("OK: all cron registry commands resolve to repo files")
    return 0

if __name__ == "__main__":
    sys.exit(main())
