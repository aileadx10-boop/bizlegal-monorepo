"""
cron_installer.py — Idempotent cron job installer.

Reads the canonical job list from services/cron_jobs.txt (single source
of truth — this script never embeds or overwrites it) and rebuilds ONE
managed block in the crontab between BEGIN/END markers. Also removes:
  - legacy duplicate managed blocks (old header style, marker never matched)
  - any unmanaged line that invokes a script the managed block owns
Everything else in the crontab is preserved byte-for-byte.

Usage:
  python3 services/cron_installer.py [--dry-run]
"""
from __future__ import annotations
import json, os, re, subprocess, sys, time
from pathlib import Path

REPO = Path("/opt/bizlegal/curator")
BEGIN = "# BEGIN bizlegal-managed (cron_installer.py — do not edit by hand)"
END = "# END bizlegal-managed"
LEGACY_HEADERS = (
    "# BizLegal cron jobs (auto-installed by cron_installer.py)",
    "# DO NOT EDIT BY HAND — run cron_installer.py to update",
    "# bizlegal-agent-installed",
)
SCRIPT_RE = re.compile(r"/opt/bizlegal/curator/services/agents/([\w.-]+\.py)")


def _read_crontab() -> str:
    r = subprocess.run(["crontab", "-l"], capture_output=True, text=True, timeout=10)
    return r.stdout if r.returncode == 0 else ""


def _write_crontab(content: str) -> bool:
    """Write to temp file then `crontab <file>` (stdin pipe silently swallows errors)."""
    import tempfile
    fd, path = tempfile.mkstemp(suffix=".cron")
    try:
        os.write(fd, content.encode())
        os.close(fd)
        # Strip CRLF (Windows-originated files)
        subprocess.run(["sed", "-i", "s/\r$//", path], capture_output=True, timeout=5)
        r = subprocess.run(["crontab", path], capture_output=True, text=True, timeout=10)
        return r.returncode == 0
    finally:
        try:
            os.unlink(path)
        except Exception:
            pass


def _canonical_jobs() -> list[str]:
    path = REPO / "services" / "cron_jobs.txt"
    if not path.exists():
        raise FileNotFoundError(f"canonical job list missing: {path}")
    jobs = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip().rstrip("\r")
        if line and not line.startswith("#"):
            jobs.append(line)
    if not jobs:
        raise ValueError(f"{path} contains no job lines — refusing to install an empty block")
    return jobs


def run(ctx=None, dry_run: bool = False) -> dict:
    started = time.time()
    jobs = _canonical_jobs()
    managed_scripts = {m.group(1) for j in jobs for m in [SCRIPT_RE.search(j)] if m}

    current = _read_crontab()
    kept: list[str] = []
    removed: list[str] = []
    in_managed = False
    for line in current.splitlines():
        stripped = line.strip()
        if stripped == BEGIN:
            in_managed = True
            continue
        if stripped == END:
            in_managed = False
            continue
        if in_managed:
            removed.append(stripped)
            continue
        if stripped in LEGACY_HEADERS:
            removed.append(stripped)
            continue
        m = SCRIPT_RE.search(stripped)
        if m and m.group(1) in managed_scripts and not stripped.startswith("#"):
            # Unmanaged duplicate of a managed job (any schedule/log path) — managed block wins.
            removed.append(stripped)
            continue
        kept.append(line)

    # Collapse runs of blank lines left behind by removals
    cleaned: list[str] = []
    for line in kept:
        if line.strip() == "" and cleaned and cleaned[-1].strip() == "":
            continue
        cleaned.append(line)

    new_crontab = "\n".join(cleaned).rstrip() + "\n\n" + BEGIN + "\n" + "\n".join(jobs) + "\n" + END + "\n"

    if dry_run:
        ok = True
    else:
        ok = _write_crontab(new_crontab)

    verify = new_crontab if dry_run else _read_crontab()
    installed = [l for l in verify.splitlines() if SCRIPT_RE.search(l) and not l.strip().startswith("#")]
    dupes = [l for l in set(installed) if installed.count(l) > 1]
    return {
        "ok": ok and not dupes,
        "agent": "cron_installer",
        "dry_run": dry_run,
        "managed_jobs": len(jobs),
        "agent_lines_total": len(installed),
        "duplicates": dupes[:5],
        "removed_stale_lines": len(removed),
        "duration_ms": int((time.time() - started) * 1000),
    }


if __name__ == "__main__":
    print(json.dumps(run(dry_run="--dry-run" in sys.argv), indent=2))
