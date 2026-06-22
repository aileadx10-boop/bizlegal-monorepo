#!/usr/bin/env python3
"""
gsc_indexnow_pinger.py
======================
Build #4 of 10 — $10K MRR SEO Plan.

Pings IndexNow (and optionally Bing WMC + Telegram) when new content
is detected in a directory of .mdx files. Only stdlib (urllib).

IndexNow endpoint: https://api.indexnow.org/IndexNow
  Payload: { host, key, keyLocation, urlList }
  KeyLocation URL must serve the key file at /{key}.txt

State file: JSON with last_run, last_pinged_urls, totals.

Usage:
  python3 gsc_indexnow_pinger.py --input DIR --prefix URL
  python3 gsc_indexnow_pinger.py --dry-run --input DIR
  python3 gsc_indexnow_pinger.py --input DIR --force
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import pathlib
import sys
import time
import urllib.error
import urllib.request
from typing import Optional


INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow"
BING_WMC_ENDPOINT = "https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch"

USER_AGENT = "Mozilla/5.0 (compatible; BizLegalIndexNowBot/1.0; +https://bizlegal-ai.com)"
_FRONTMATTER_RE = __import__("re").compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", __import__("re").DOTALL)


# ---------------------------------------------------------------------------
# State file
# ---------------------------------------------------------------------------

DEFAULT_STATE_PATH = pathlib.Path(
    os.environ.get("INDEXNOW_STATE_PATH",
                   "/opt/bizlegal/curator/services/seo-agents/state/indexnow_state.json"))


def _load_state(path: pathlib.Path) -> dict:
    if not path.exists():
        return {"last_run": None, "last_pinged_urls": [], "total_pinged": 0, "failures": 0}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {"last_run": None, "last_pinged_urls": [], "total_pinged": 0, "failures": 0}


def _save_state(path: pathlib.Path, state: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, indent=2, default=str), encoding="utf-8")


# ---------------------------------------------------------------------------
# Front matter parsing
# ---------------------------------------------------------------------------

def _slug_from_mdx(mdx_path: pathlib.Path) -> str:
    text = mdx_path.read_text(encoding="utf-8")
    m = _FRONTMATTER_RE.match(text)
    if m:
        for line in m.group(1).splitlines():
            if line.startswith("slug:"):
                return line.partition(":")[2].strip().strip('"').strip("'")
    return mdx_path.stem


def _discover_new(input_dir: pathlib.Path, state: dict) -> list[pathlib.Path]:
    """Return .mdx files newer than state['last_run']."""
    if not input_dir.exists():
        return []
    files = sorted(input_dir.rglob("*.mdx"))
    last_run = state.get("last_run")
    if not last_run:
        return files
    cutoff = _dt.datetime.fromisoformat(last_run).timestamp()
    return [f for f in files if f.stat().st_mtime > cutoff]


# ---------------------------------------------------------------------------
# HTTP pings
# ---------------------------------------------------------------------------

def _post_json(url: str, payload: dict, *, headers: Optional[dict] = None) -> tuple[int, str]:
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url, data=body, method="POST",
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": USER_AGENT,
            **(headers or {}),
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")[:200]
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")[:200]
    except Exception as e:
        return 0, f"network error: {e}"


def ping_indexnow(host: str, key: str, key_location: str, urls: list[str]) -> tuple[int, str]:
    if not urls:
        return 0, "no urls"
    return _post_json(INDEXNOW_ENDPOINT, {
        "host": host, "key": key, "keyLocation": key_location, "urlList": urls,
    })


def ping_bing(site_url: str, urls: list[str], api_key: str) -> tuple[int, str]:
    if not urls:
        return 0, "no urls"
    return _post_json(f"{BING_WMC_ENDPOINT}?apikey={api_key}", {
        "siteUrl": site_url, "urlList": urls,
    })


def ping_telegram(token: str, chat_id: str, text: str) -> tuple[int, str]:
    return _post_json(
        f"https://api.telegram.org/bot{token}/sendMessage",
        {"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
    )


# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------

def run(input_dir: pathlib.Path, prefix: str, host: str,
        state_path: pathlib.Path, *, force: bool, dry_run: bool) -> dict:
    state = _load_state(state_path)
    if force:
        files = sorted(input_dir.rglob("*.mdx")) if input_dir.exists() else []
    else:
        files = _discover_new(input_dir, state)

    if not files:
        return {"pinged_count": 0, "urls": [], "skipped": "no new files",
                "input": str(input_dir), "state": str(state_path)}

    urls = []
    for mdx in files:
        slug = _slug_from_mdx(mdx)
        url = prefix.rstrip("/") + "/" + slug
        urls.append(url)

    # Dedupe against state
    already = set(state.get("last_pinged_urls", []))
    new_urls = [u for u in urls if u not in already]
    if not new_urls and not force:
        return {"pinged_count": 0, "urls": [], "skipped": "all already pinged"}

    result = {
        "input": str(input_dir),
        "prefix": prefix,
        "host": host,
        "files_discovered": len(files),
        "urls_attempted": new_urls,
        "elapsed_ms": 0,
        "indexnow": None,
        "bing": None,
        "telegram": None,
    }
    t0 = time.time()

    indexnow_key = os.environ.get("INDEXNOW_KEY", "")
    if indexnow_key:
        key_location = f"https://{host}/{indexnow_key}.txt"
        if dry_run:
            result["indexnow"] = (0, f"dry-run: would POST {len(new_urls)} urls to {INDEXNOW_ENDPOINT}")
        else:
            result["indexnow"] = ping_indexnow(host, indexnow_key, key_location, new_urls)
    else:
        result["indexnow"] = (0, "INDEXNOW_KEY env not set")

    bing_key = os.environ.get("BING_WMC_API_KEY", "")
    if bing_key:
        if dry_run:
            result["bing"] = (0, f"dry-run: would POST {len(new_urls)} urls to Bing WMC")
        else:
            result["bing"] = ping_bing(f"https://{host}", new_urls, bing_key)
    else:
        result["bing"] = (0, "BING_WMC_API_KEY env not set (optional)")

    tg_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    tg_chat = os.environ.get("TELEGRAM_CHAT_ID", "")
    if tg_token and tg_chat:
        text = (f"📣 *IndexNow ping* — {len(new_urls)} new URL(s) from "
                f"{input_dir.name}\n"
                f"Status: indexnow={result['indexnow'][0]} bing={result['bing'][0]}")
        if dry_run:
            result["telegram"] = (0, "dry-run: would send Telegram")
        else:
            result["telegram"] = ping_telegram(tg_token, tg_chat, text)
    else:
        result["telegram"] = (0, "TELEGRAM_* env not set (optional)")

    result["elapsed_ms"] = int((time.time() - t0) * 1000)

    if not dry_run:
        # Update state
        state["last_run"] = _dt.datetime.now(_dt.timezone.utc).isoformat()
        state["last_pinged_urls"] = list(set(state.get("last_pinged_urls", []) + new_urls))
        state["total_pinged"] = state.get("total_pinged", 0) + len(new_urls)
        if result["indexnow"][0] >= 200:
            state["failures"] = state.get("failures", 0)
        else:
            state["failures"] = state.get("failures", 0) + 1
        _save_state(state_path, state)

    return result


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--input", required=True, help="Directory of .mdx files")
    ap.add_argument("--prefix", default=os.environ.get("BLOG_PREFIX",
                                                       "https://blog.bizlegal-ai.com/posts"),
                    help="URL prefix for derived URLs")
    ap.add_argument("--host", default=os.environ.get("BLOG_HOST", "blog.bizlegal-ai.com"),
                    help="Host (for IndexNow keyLocation)")
    ap.add_argument("--state", default=str(DEFAULT_STATE_PATH), help="State file path")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--force", action="store_true", help="Re-ping all files, ignore state")
    args = ap.parse_args()

    result = run(pathlib.Path(args.input), args.prefix, args.host,
                 pathlib.Path(args.state), force=args.force, dry_run=args.dry_run)
    print(json.dumps(result, indent=2, default=str))
    return 0


if __name__ == "__main__":
    sys.exit(main())
