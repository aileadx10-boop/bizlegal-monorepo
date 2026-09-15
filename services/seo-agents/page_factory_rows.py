"""
page_factory_rows.py — the deterministic half of the page factory.

Matrix JSON + apps/hub/lib/guides.ts in, PageRow objects out. No network, no
database, no LLM: importing this module and calling build_rows() is a pure
function of two files on disk, which is what makes `page_factory.py --plan`
runnable offline and testable without credentials.

Split out of page_factory.py so neither file passes the 800-line ceiling.
"""
from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
MATRIX_PATH = HERE / "page_factory_matrix.json"
GUIDES_TS = REPO / "apps" / "hub" / "lib" / "guides.ts"
HUB_BASE = "https://bizlegal-ai.com"
STATUS_DRAFT = "draft"


def utcnow() -> str:
    import time
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


# ── Row model ─────────────────────────────────────────────────────
@dataclass
class PageRow:
    hub: str
    local_slug: str
    title: str
    meta: str
    family: str
    page_type: str
    schema_type: str
    matrix_keys: dict[str, str]
    keywords: list[str]
    regulations: list[str]
    jurisdiction: str | None = None
    facts: dict[str, Any] = field(default_factory=dict)

    @property
    def slug(self) -> str:
        """Stored slug is hub-qualified so it is unique against the 231 legacy
        blog rows and maps 1:1 to the hub route /<hub>/<local_slug>."""
        return f"{self.hub}/{self.local_slug}"

    @property
    def url(self) -> str:
        return f"{HUB_BASE}/{self.hub}/{self.local_slug}"

    def insert_payload(self) -> dict[str, Any]:
        now = utcnow()
        return {
            "slug": self.slug,
            "title": self.title,
            "meta": self.meta,
            "meta_desc": self.meta,
            "hub": self.hub,
            "status": STATUS_DRAFT,
            "matrix_family": self.family,
            "matrix_keys": self.matrix_keys,
            "page_type": self.page_type,
            "schema_type": self.schema_type,
            "keywords": self.keywords,
            "jurisdiction": self.jurisdiction,
            "regulation_tag": self.regulations[0] if self.regulations else None,
            "published": False,
            "deployed": False,
            "word_count": 0,
            "created_at": now,
            "updated_at": now,
        }


# ── Matrix loading ────────────────────────────────────────────────
def load_matrix() -> dict[str, Any]:
    return json.loads(MATRIX_PATH.read_text(encoding="utf-8"))


_GUIDE_RE = re.compile(
    r"href:\s*'(/guides/[^']+)'\s*,\s*\n\s*title:\s*'((?:[^'\\]|\\.)*)'\s*,"
    r"\s*\n\s*description:\s*'((?:[^'\\]|\\.)*)'\s*,"
    r"\s*\n\s*tag:\s*'((?:[^'\\]|\\.)*)'",
    re.MULTILINE,
)


def load_guides() -> list[dict[str, str]]:
    """Parse apps/hub/lib/guides.ts so the playbook family tracks the hub."""
    if not GUIDES_TS.exists():
        return []
    src = GUIDES_TS.read_text(encoding="utf-8")
    out: list[dict[str, str]] = []
    for href, title, desc, tag in _GUIDE_RE.findall(src):
        out.append(
            {
                "href": href,
                "slug": href.rsplit("/", 1)[-1],
                "title": _unescape(title),
                "description": _unescape(desc),
                "tag": _unescape(tag),
            }
        )
    return out


def _unescape(s: str) -> str:
    return s.replace("\\'", "'").replace('\\"', '"').replace("\\\\", "\\")


# ── Matrix expansion ──────────────────────────────────────────────
def build_rows(matrix: dict[str, Any], guides: list[dict[str, str]]) -> list[PageRow]:
    rows: list[PageRow] = []
    rows.extend(_rows_regulation_jurisdiction(matrix))
    rows.extend(_rows_tool_industry(matrix))
    rows.extend(_rows_glossary(matrix))
    rows.extend(_rows_guide_variant(matrix, guides))
    return rows


def _rows_regulation_jurisdiction(m: dict[str, Any]) -> list[PageRow]:
    hub = "compliance"
    cfg = m["hubs"][hub]
    out = []
    for reg in m["regulations"]:
        for jur in m["jurisdictions"]:
            title = f"{reg['short']} compliance in {jur['name'].replace('the ', '').title() if jur['name'].startswith('the ') else jur['name']}: who is in scope and what is owed"
            out.append(
                PageRow(
                    hub=hub,
                    local_slug=f"{reg['slug']}-compliance-{jur['slug']}",
                    title=title,
                    meta=(
                        f"How {reg['short']} applies to companies operating in or serving "
                        f"{jur['name']} — scope tests, the obligations that follow, and the "
                        f"primary sources to verify each one against."
                    ),
                    family=cfg["family"],
                    page_type=cfg["page_type"],
                    schema_type=cfg["schema_type"],
                    matrix_keys={"regulation": reg["slug"], "jurisdiction": jur["slug"]},
                    keywords=[
                        f"{reg['short']} {jur['name']}",
                        f"{reg['short']} compliance {jur['slug'].replace('-', ' ')}",
                        f"{reg['slug']} requirements {jur['slug'].replace('-', ' ')}",
                    ],
                    regulations=[reg["slug"]],
                    jurisdiction=jur["slug"],
                    facts={"regulation": reg, "jurisdiction": jur},
                )
            )
    return out


def _rows_tool_industry(m: dict[str, Any]) -> list[PageRow]:
    hub = "solutions"
    cfg = m["hubs"][hub]
    out = []
    for tool in m["tools"]:
        for ind in m["industries"]:
            out.append(
                PageRow(
                    hub=hub,
                    local_slug=f"{tool['slug']}-for-{ind['slug']}",
                    title=f"{tool['title']} for {ind['name']}: what it checks and how to read the result",
                    meta=(
                        f"How {ind['name']} use the {tool['title']} — the inputs that matter for "
                        f"this sector, what the output does and does not mean, and the obligations "
                        f"behind it."
                    ),
                    family=cfg["family"],
                    page_type=cfg["page_type"],
                    schema_type=cfg["schema_type"],
                    matrix_keys={"tool": tool["slug"], "industry": ind["slug"]},
                    keywords=[
                        f"{tool['title']} {ind['name']}",
                        f"{ind['slug'].replace('-', ' ')} compliance tool",
                    ],
                    regulations=list(tool["regulations"]),
                    facts={"tool": tool, "industry": ind},
                )
            )
    return out


def _rows_glossary(m: dict[str, Any]) -> list[PageRow]:
    hub = "glossary"
    cfg = m["hubs"][hub]
    out = []
    for term in m["glossary_terms"]:
        out.append(
            PageRow(
                hub=hub,
                local_slug=term["slug"],
                title=f"{term['term']}: definition, scope and what it obliges you to do",
                meta=(
                    f"What \"{term['term']}\" means in practice, where the definition comes from, "
                    f"and the obligations that attach once the term applies to you."
                ),
                family=cfg["family"],
                page_type=cfg["page_type"],
                schema_type=cfg["schema_type"],
                matrix_keys={"term": term["slug"]},
                keywords=[term["term"], f"{term['term']} definition", f"what is {term['term']}"],
                regulations=list(term["regulations"]),
                facts={"term": term},
            )
        )
    return out


def _rows_guide_variant(m: dict[str, Any], guides: list[dict[str, str]]) -> list[PageRow]:
    hub = "playbooks"
    cfg = m["hubs"][hub]
    out = []
    for g in guides:
        regs = _guess_regulations(f"{g['title']} {g['tag']}", m)
        for var in m["guide_variants"]:
            out.append(
                PageRow(
                    hub=hub,
                    local_slug=f"{g['slug']}-{var['slug']}",
                    title=f"{_strip_year(g['title'])} — {var['label']}",
                    meta=f"{var['label']} companion to the {g['tag']} guide: {g['description'][:140]}",
                    family=cfg["family"],
                    page_type=cfg["page_type"],
                    schema_type=cfg["schema_type"],
                    matrix_keys={"guide": g["slug"], "variant": var["slug"]},
                    keywords=[f"{g['title']} {var['label'].lower()}", f"{g['tag']} {var['label'].lower()}"],
                    regulations=regs,
                    facts={"guide": g, "variant": var},
                )
            )
    return out


_REG_HINTS = {
    "gdpr": ["gdpr", "privacy", "dsar", "data protection", "cookie", "dpa", "data transfer"],
    "ccpa": ["ccpa", "cpra", "california", "consumer protection"],
    "hipaa": ["hipaa", "health"],
    "soc2": ["soc 2", "soc2", "iso 27001", "security"],
    "ai-act": ["ai act", "ai governance", "artificial intelligence", "ai vendor"],
    "mica": ["mica", "crypto regulation", "token launch"],
    "vara": ["vara", "dubai"],
    "sec": ["sec", "securities", "regulation d", "term sheet", "equity"],
    "aml": ["aml", "kyc", "ofac", "sanctions", "fincen", "bsa", "financial crime", "msb"],
    "boi": ["boi", "beneficial ownership", "corporate compliance", "corporate transparency"],
    "dora": ["dora", "operational resilience"],
    "dpdpa": ["dpdpa", "india"],
}


def _guess_regulations(text: str, m: dict[str, Any]) -> list[str]:
    low = text.lower()
    hits = [slug for slug, hints in _REG_HINTS.items() if any(h in low for h in hints)]
    return hits or ["gdpr"]


def _strip_year(title: str) -> str:
    return re.sub(r"\s*\((?:19|20)\d{2}\)\s*$", "", title).strip()


# ── Known-URL set (internal-link verification) ────────────────────
def known_hub_urls(m: dict[str, Any], guides: list[dict[str, str]], rows: Iterable[PageRow]) -> set[str]:
    urls = set(m["internal_link_core"])
    urls.update(g["href"] for g in guides)
    urls.update(f"/regulations/{r['slug']}" for r in m["regulations"])
    urls.update(f"/tools/{t['slug']}" for t in m["tools"])
    urls.update(f"/{r.hub}/{r.local_slug}" for r in rows)
    return urls


def registry_urls(m: dict[str, Any]) -> set[str]:
    return {c["url"] for entries in m["citation_registry"].values() for c in entries}


def citations_for(m: dict[str, Any], regs: list[str]) -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    seen: set[str] = set()
    for slug in regs:
        for c in m["citation_registry"].get(slug, []):
            if c["url"] in seen:
                continue
            seen.add(c["url"])
            out.append({"regulation": slug, "section": c["section"], "url": c["url"]})
    return out


def regs_for_row(row: dict[str, Any], m: dict[str, Any], guides: list[dict[str, str]]) -> list[str]:
    keys = row.get("matrix_keys") or {}
    fam = row.get("matrix_family") or ""
    if fam == "regulation_jurisdiction":
        return [keys.get("regulation", "gdpr")]
    if fam == "tool_industry":
        tool = next((t for t in m["tools"] if t["slug"] == keys.get("tool")), None)
        return list(tool["regulations"]) if tool else ["gdpr"]
    if fam == "glossary":
        term = next((t for t in m["glossary_terms"] if t["slug"] == keys.get("term")), None)
        return list(term["regulations"]) if term else ["gdpr"]
    if fam == "guide_variant":
        g = next((g for g in guides if g["slug"] == keys.get("guide")), None)
        return _guess_regulations(f"{g['title']} {g['tag']}", m) if g else ["gdpr"]
    return [row.get("regulation_tag") or "gdpr"]


def link_menu(row: dict[str, Any], m: dict[str, Any], guides: list[dict[str, str]],
               known: set[str], size: int = 28) -> list[str]:
    """A deterministic, relevant slice of the known-URL set. Deterministic so a
    re-generated page links the same way and the gate stays reproducible."""
    keys = row.get("matrix_keys") or {}
    regs = regs_for_row(row, m, guides)
    picks: list[str] = []
    for r in regs:
        picks.append(f"/regulations/{r}")
    if keys.get("tool"):
        picks.append(f"/tools/{keys['tool']}")
    if keys.get("guide"):
        picks.append(f"/guides/{keys['guide']}")
    for t in m["glossary_terms"]:
        if set(t["regulations"]) & set(regs):
            picks.append(f"/glossary/{t['slug']}")
    for t in m["tools"]:
        if set(t["regulations"]) & set(regs):
            picks.append(f"/tools/{t['slug']}")
    for g in guides:
        if set(_guess_regulations(f"{g['title']} {g['tag']}", m)) & set(regs):
            picks.append(g["href"])
    picks.extend(m["internal_link_core"])
    seed = int(hashlib.sha256(row["slug"].encode()).hexdigest()[:8], 16)
    ordered: list[str] = []
    for p in picks:
        if p in known and p not in ordered and p != f"/{row.get('hub')}/{row['slug'].split('/', 1)[-1]}":
            ordered.append(p)
    if len(ordered) <= size:
        return ordered
    head, tail = ordered[:8], ordered[8:]
    rotated = tail[seed % len(tail):] + tail[: seed % len(tail)]
    return head + rotated[: size - 8]
