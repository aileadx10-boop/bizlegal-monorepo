"""LangGap queue: scan targets, emit gap queue + manifest, diff mode."""
from __future__ import annotations

import csv
import json
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Optional

from .discovery import discover_sitemaps, fetch, walk_sitemap
from .analysis import looks_english, hreflangs_of, score, section_weight


def scan_target(target: dict, max_pages: int, workers: int, delay: float, state_dir: Path):
    domain: str = target["domain"]
    langs: list[str] = target.get("languages", ["de", "es"])
    print(f"\n=== {domain} (role={target.get('role','competitor')}, langs={','.join(langs)}) ===")

    urls: dict = {}
    found_sm = False
    for sm in discover_sitemaps(domain):
        before = len(urls)
        for u, lm in walk_sitemap(sm):
            urls.setdefault(u, lm)
        if len(urls) > before:
            found_sm = True
            break
    if not found_sm and not urls:
        print(f"  ERROR: no sitemap found for {domain}")
        return None

    pages = sorted(urls.items(), key=lambda kv: -score(kv[0], kv[1]))[:max_pages]
    print(f"  sitemap: {len(urls)} URLs, analyzing top {len(pages)} by priority score")

    rows: list[dict] = []
    errors = 0
    lock = threading.Lock()
    done = [0]

    def work(item):
        nonlocal errors
        url, lastmod = item
        codes = hreflangs_of(url)
        with lock:
            done[0] += 1
            if done[0] % 25 == 0:
                print(f"  ... {done[0]}/{len(pages)}")
        if codes is None:
            with lock:
                errors += 1
            return
        if not looks_english(url, codes):
            return
        missing = [l for l in langs if not (codes & _lang_set(l, langs))]
        if missing:
            rows.append({
                "url": url,
                "score": score(url, lastmod),
                "lastmod": lastmod or "",
                "section_weight": section_weight(url),
                "declared_hreflangs": "|".join(sorted(codes)) or "(none)",
                "missing": "|".join(missing),
            })
        time.sleep(delay)

    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs = [ex.submit(work, it) for it in pages]
        for _ in as_completed(futs):
            pass

    rows.sort(key=lambda r: -r["score"])
    print(f"  done: {len(pages) - errors}/{len(pages)} pages fetched "
          f"({errors} errors), {len(rows)} EN pages missing {'/'.join(langs)}")

    manifest = {
        "domain": domain,
        "role": target.get("role", "competitor"),
        "languages": langs,
        "scanned_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "sitemap_urls": len(urls),
        "pages_analyzed": len(pages),
        "fetch_errors": errors,
        "gap_count": len(rows),
    }
    return rows, manifest


def _lang_set(code: str, langs: list[str]):
    from .analysis import LANG_SETS
    return LANG_SETS.get(code, {code})


def load_previous(state_dir: Path, domain: str):
    p = state_dir / f"{domain.replace('.', '_')}_manifest.json"
    if not p.exists():
        return set()
    old = json.loads(p.read_text(encoding="utf-8"))
    prev_csv = Path(old.get("csv", ""))
    if not prev_csv.exists():
        return set()
    with prev_csv.open(encoding="utf-8") as f:
        return {r["url"] for r in csv.DictReader(f)}


def write_target_output(rows: list[dict], manifest: dict, outdir: Path, diff: bool):
    safe = manifest["domain"].replace(".", "_")
    state_dir = outdir / "state"
    state_dir.mkdir(exist_ok=True)

    if diff:
        prev = load_previous(state_dir, manifest["domain"])
        new_rows = [r for r in rows if r["url"] not in prev]
        dropped = len(rows) - len(new_rows)
        print(f"  diff: {dropped} already known, {len(new_rows)} NEW gaps")
        rows, manifest["diff"] = new_rows, {"new": len(new_rows), "already_known": dropped}

    csv_path = outdir / f"{safe}_queue.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["score", "url", "lastmod", "section_weight",
                                          "declared_hreflangs", "missing"])
        w.writeheader()
        w.writerows(rows)

    manifest["csv"] = str(csv_path)
    (state_dir / f"{safe}_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest
