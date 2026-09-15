"""LangGap analysis: hreflang + English detection + scoring."""
from __future__ import annotations

import re
from typing import Optional, Set, Tuple
from urllib.parse import urlparse

from .discovery import fetch

HREFLANG_RES = [
    re.compile(r'<link[^>]+rel=["\']alternate["\'][^>]+hreflang=["\']([^"\']+)["\']', re.I),
    re.compile(r'<link[^>]+hreflang=["\']([^"\']+)["\'][^>]+rel=["\']alternate["\']', re.I),
]
PATH_LANG_RE = re.compile(r"^/(de|es|fr|pt|it|nl|ja|ko|zh|pl|ru)(/|$|[-_])", re.I)
LANG_SETS = {
    "de": {"de", "de-de", "de-at", "de-ch"},
    "es": {"es", "es-es", "es-mx", "es-ar", "es-co", "es-cl"},
    "fr": {"fr", "fr-fr", "fr-be", "fr-ch", "fr-ca"},
}
EN_CODES = {"en", "en-us", "en-gb", "en-au", "en-ca", "x-default"}
SECTION_WEIGHTS = [
    (re.compile(r"/(blog|guides?|resources|learn|academy|glossary|wiki|help|docs|faq)/", re.I), 100),
    (re.compile(r"/(compare|vs|alternatives|pricing|industries|use-cases|topics)/", re.I), 80),
    (re.compile(r"/(products?|solutions?|platform|security|integrations?|frameworks?)/", re.I), 60),
    (re.compile(r"/(company|about|careers|contact|legal|privacy|terms)/", re.I), 10),
]
DEFAULT_WEIGHT = 50


def hreflangs_of(page_url: str) -> Optional[Set[str]]:
    html = fetch(page_url, timeout=12)
    if html is None:
        return None
    codes: Set[str] = set()
    for rx in HREFLANG_RES:
        codes.update(rx.findall(html))
    return {c.lower() for c in codes}


def looks_english(url: str, codes: Optional[Set[str]]) -> bool:
    if codes:
        return bool(codes & EN_CODES)
    return not PATH_LANG_RE.match(urlparse(url).path)


def section_weight(url: str) -> int:
    path = urlparse(url).path
    for rx, w in SECTION_WEIGHTS:
        if rx.search(path):
            return w
    if path in ("", "/"):
        return 10
    return DEFAULT_WEIGHT


def depth_penalty(url: str) -> int:
    segs = [s for s in urlparse(url).path.split("/") if s]
    return 3 * max(0, len(segs) - 1)


def recency_boost(lastmod: Optional[str]) -> int:
    if not lastmod:
        return 0
    try:
        y = int(re.match(r"(\d{4})", lastmod).group(1))
    except (AttributeError, ValueError):
        return 0
    age = max(0, 2026 - y)
    return max(0, 30 - 5 * age)


def score(url: str, lastmod: Optional[str] = None) -> int:
    return section_weight(url) + recency_boost(lastmod) - depth_penalty(url)
