"""LangGap discovery: sitemap discovery + polite fetching."""
from __future__ import annotations

import time
import threading
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Iterator, Optional, Tuple
from urllib.parse import urlparse

import requests

UA = {"User-Agent": "LangGap/1.0 (+langgap research bot; owner-operated)"}
NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
_tls = threading.local()


def session() -> requests.Session:
    if not hasattr(_tls, "s"):
        _tls.s = requests.Session()
        _tls.s.headers.update(UA)
    return _tls.s


def fetch(url: str, timeout: int = 15, retries: int = 2) -> Optional[str]:
    for attempt in range(retries + 1):
        try:
            r = session().get(url, timeout=timeout)
            if r.status_code == 200:
                return r.text
            if r.status_code in (429, 500, 502, 503):
                time.sleep(2 * (attempt + 1))
                continue
            return None
        except requests.RequestException:
            time.sleep(1)
    return None


def discover_sitemaps(domain: str) -> list[str]:
    found: list[str] = []
    seen: set[str] = set()

    def add(u: Optional[str]) -> None:
        if u and u not in seen:
            seen.add(u)
            found.append(u)

    robots = fetch(f"https://{domain}/robots.txt", timeout=10)
    if robots:
        for line in robots.splitlines():
            if line.lower().startswith("sitemap:"):
                add(line.split(":", 1)[1].strip())
    for p in ("/sitemap.xml", "/sitemap_index.xml", "/sitemap-index.xml",
              "/wp-sitemap.xml", "/sitemaps/sitemap.xml"):
        add(f"https://{domain}{p}")
    return found


def walk_sitemap(url: str, depth: int = 0, seen: Optional[set[str]] = None) -> Iterator[Tuple[str, Optional[str]]]:
    """Yield (page_url, lastmod_or_None)."""
    if seen is None:
        seen = set()
    if url in seen or depth > 4:
        return
    seen.add(url)
    body = fetch(url)
    if not body:
        return
    try:
        root = ET.fromstring(body.encode("utf-8"))
    except ET.ParseError:
        return
    if root.tag.lower().endswith("sitemapindex"):
        for loc in root.findall(".//sm:sitemap/sm:loc", NS):
            if loc.text:
                yield from walk_sitemap(loc.text.strip(), depth + 1, seen)
    else:
        for node in root.findall(".//sm:url", NS):
            loc = node.find("sm:loc", NS)
            if loc is None or not loc.text:
                continue
            lm = node.find("sm:lastmod", NS)
            yield loc.text.strip(), (lm.text.strip() if lm is not None and lm.text else None)
