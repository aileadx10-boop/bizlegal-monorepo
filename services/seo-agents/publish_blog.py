#!/usr/bin/env python3
"""
publish_blog.py
===============
Build #11 companion. Syncs .mdx files from the local SEO content
directory into the bizlegal-ea clone, then commits + pushes via
the GitHub Contents API.

This is the bridge between:
  - seo_content_writer.py  (writes .mdx locally)
  - og_image_generator.py  (renders .png locally)
  - internal_linker.py     (modifies .mdx in place)
  - gsc_indexnow_pinger.py (pings IndexNow for new URLs)

...and bizlegal-ea (which CF Pages actually serves).

Usage:
  python3 publish_blog.py             # publish all new .mdx
  python3 publish_blog.py --dry-run   # show what would happen
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import pathlib
import subprocess
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(__file__))
try:
    from ops_heartbeat import ping_once as _hb_ping
except ImportError:
    def _hb_ping(*a, **kw): return True

REPO = "aileadx10-boop/bizlegal-ea"
BRANCH = "main"
BLOG_DIR = "projects/bizlegal-seo-site/content/blog"

SOURCE_DIR = pathlib.Path("/opt/bizlegal/curator/services/seo-agents/blog_content")
OG_DIR = SOURCE_DIR / "og"
PUBLIC_OG_DIR = pathlib.Path("/opt/bizlegal/bizlegal-ea/projects/bizlegal-seo-site/public/og")
TARGET_DIR = pathlib.Path("/opt/bizlegal/bizlegal-ea") / BLOG_DIR


def get_github_token() -> str:
    for line in pathlib.Path("/opt/bizlegal/curator/.env").read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        if k.strip() == "GITHUB_TOKEN":
            return v.strip()
    return os.environ.get("GITHUB_TOKEN", "")


def github_api(method: str, path: str, body: dict | None = None,
               token: str = "") -> tuple[int, dict]:
    import urllib.request
    import urllib.error
    url = f"https://api.github.com/repos/{REPO}{path}"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "BizLegalPublisher/1.0",
    }
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode()
        req = urllib.request.Request(url, data=data, method=method, headers=headers)
    else:
        req = urllib.request.Request(url, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read() or b"{}")
        except Exception:
            return e.code, {"error": str(e)}
    except Exception as e:
        return 0, {"error": str(e)[:120]}


def get_file_sha(path: str, token: str) -> str | None:
    status, data = github_api("GET", f"/contents/{path}?ref={BRANCH}", token=token)
    if status == 200 and isinstance(data, dict) and "sha" in data:
        return data["sha"]
    return None


def commit_file_via_api(path: str, content: str, message: str,
                        token: str) -> tuple[int, dict]:
    sha = get_file_sha(path, token)
    body = {
        "message": message,
        "content": base64.b64encode(content.encode()).decode(),
        "branch": BRANCH,
    }
    if sha:
        body["sha"] = sha
    return github_api("PUT", f"/contents/{path}", body=body, token=token)


def publish_one(mdx_path: pathlib.Path, token: str, dry_run: bool) -> tuple[bool, str]:
    """Copy an .mdx (and any .png) to bizlegal-ea via GitHub API."""
    rel = mdx_path.relative_to(SOURCE_DIR)
    target_path = f"{BLOG_DIR}/{rel}"
    content = mdx_path.read_text(encoding="utf-8")
    if dry_run:
        print(f"  [dry-run] {mdx_path.name}  {len(content)} bytes")
        return True, "dry-run"

    status, data = commit_file_via_api(
        target_path, content,
        f"feat(blog): {rel.stem} (via publish_blog.py)",
        token,
    )
    ok = 200 <= status < 300
    msg = "ok" if ok else str(data)[:120]
    print(f"  [{'ok' if ok else 'FAIL'}] {mdx_path.name}  HTTP {status}  {msg}")
    if not ok:
        return False, msg

    # Also commit the OG image if present
    png_path = OG_DIR / f"{mdx_path.stem}.png"
    if png_path.exists():
        png_target = f"projects/bizlegal-seo-site/public/og/{mdx_path.stem}.png"
        png_bytes = png_path.read_bytes()
        status2, data2 = commit_file_via_api(
            png_target, "",  # unused
            f"feat(og): {mdx_path.stem}.png (via publish_blog.py)",
            token,
        )
        if 200 <= status2 < 300:
            print(f"    [ok] {png_path.name}  HTTP {status2}")
        else:
            print(f"    [warn] {png_path.name}  HTTP {status2}  {str(data2)[:80]}")

    return True, "ok"


def run(dry_run: bool) -> int:
    token = get_github_token()
    if not token and not dry_run:
        print("ERROR: GITHUB_TOKEN not found")
        return 1

    if not SOURCE_DIR.exists():
        print(f"  [skip] {SOURCE_DIR} does not exist")
        return 0
    mdx_files = sorted(SOURCE_DIR.glob("*.mdx"))
    if not mdx_files:
        print(f"  [skip] no .mdx in {SOURCE_DIR}")
        return 0

    print(f"=== publish_blog.py @ {datetime.now(timezone.utc).isoformat()} ===")
    print(f"  source: {SOURCE_DIR}  ({len(mdx_files)} files)")
    print(f"  target: bizlegal-ea/{BLOG_DIR}/  (via GitHub Contents API)")

    success = 0
    for mdx in mdx_files:
        ok, msg = publish_one(mdx, token, dry_run)
        if ok:
            success += 1
    print(f"\n  published {success}/{len(mdx_files)}")
    return 0 if success > 0 or dry_run else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    _hb_ping('hetzner/publish-blog', parent='cron:publish-blog', status='alive', last_action='publishing blog posts')
    return run(dry_run=args.dry_run)


if __name__ == "__main__":
    sys.exit(main())
