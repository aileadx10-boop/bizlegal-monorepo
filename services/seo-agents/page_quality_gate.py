"""
page_quality_gate.py — the gate a programmatic page must pass before a human
ever sees it.

Extends `services/hetzner/quality_gate.py` (the curator's article gate) rather
than forking it: the banned-phrase list, the Finding/severity vocabulary and
the em-dash heuristic are shared, so a phrase banned for the blog is banned
here the day it is added there.

What this gate adds on top of the curator's rubric, per the plan's item P3:

  1. **>=600 words** — thinner than the curator's 800 because a glossary term
     genuinely is shorter than a feature article, but 600 is the floor below
     which Google treats a programmatic set as thin.
  2. **>=3 citations that resolve to the registry** — every citation's URL must
     appear in page_factory_matrix.json's citation_registry. An LLM cannot
     invent a source: an unknown URL is a BLOCK, not a warning.
  3. **Unique FAQ, >=3 Q/As** — questions must be distinct from each other AND
     not a restatement of the page title.
  4. **>=5 internal links to existing hub URLs** — each link is checked against
     a known-URL set (guides.ts + the matrix's own families + the core list).
     A link to a page that does not exist is a BLOCK.
  5. **Banned boilerplate** — the curator's list plus the programmatic-page
     tells ("in this article we will", "as an AI language model", ...).
  6. **No outcome guarantees** — "guarantee", "will pass", "ensures compliance"
     and friends. This is YMYL content for a company that is explicitly not a
     law firm; a promise here is a liability, not a conversion.
  7. **YMYL disclaimer present** — the not-legal-advice line must survive into
     the stored body or be present in the row's metadata.

Public API mirrors the curator gate:

    from page_quality_gate import audit_page, validate_page
    findings = audit_page(page, known_urls=..., registry_urls=...)
    blockers = validate_page(page, ...)     # [] means: promote draft -> review

`page` is the dict the factory assembles:
    {slug, hub, title, body_md, faq:[{q,a}], key_dates:[], citations:[{...}],
     internal_links:[...]}

CLI:
    python page_quality_gate.py path/to/page.json
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Iterable, Iterator

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / "services" / "hetzner"))

from quality_gate import (  # noqa: E402  (path bootstrap must run first)
    BANNED_PHRASES as CURATOR_BANNED_PHRASES,
    Finding,
    QualityGateError,
)

__all__ = [
    "audit_page",
    "validate_page",
    "Finding",
    "QualityGateError",
    "MIN_WORDS",
    "MIN_CITATIONS",
    "MIN_FAQ_ENTRIES",
    "MIN_INTERNAL_LINKS",
]

# ── Tunables ──────────────────────────────────────────────────────
MIN_WORDS = 600
MIN_CITATIONS = 3
MIN_FAQ_ENTRIES = 3
MIN_INTERNAL_LINKS = 5
MIN_FAQ_ANSWER_WORDS = 20

# Programmatic-page tells on top of the curator's list. Lower-case substring.
EXTRA_BANNED_PHRASES = (
    "in this article we will",
    "in this article, we will",
    "as an ai language model",
    "as we mentioned earlier",
    "let's dive in",
    "let's take a look",
    "in summary,",
    "to sum up",
    "at the end of the day",
    "unlock the power",
    "game-changer",
    "ever-evolving",
    "ever-changing landscape",
    "comprehensive guide to everything",
    "look no further",
    "whether you're a",
    "[insert",
    "lorem ipsum",
    "as of my knowledge cutoff",
)

BANNED_PHRASES = tuple(CURATOR_BANNED_PHRASES) + EXTRA_BANNED_PHRASES

# Outcome guarantees. BizLegal is research software and not a law firm; any of
# these in a YMYL page is a compliance-claim problem, not a style problem.
#
# Deliberately NOT a blanket ban on the word "guarantee": in compliance prose
# "the Act guarantees data principals the right to correction" is accurate and
# necessary. What is forbidden is a guarantee of a COMPLIANCE OUTCOME, and any
# first-person promise. Patterns target that shape, not the word.
GUARANTEE_PATTERNS = (
    r"\b(?:we|bizlegal|this (?:tool|page|guide|report|scan)|our \w+)\s+(?:can\s+|will\s+)?guarantee",
    r"\bguarantee[sd]?\s+(?:compliance|approval|a pass|your compliance|certification|"
    r"that you (?:will|are|won't|will not)|no (?:fine|penalty|enforcement))",
    r"\bguaranteed\s+(?:compliance|approval|outcome|result)\b",
    r"\bwill (?:pass|be compliant|make you compliant|ensure compliance)\b",
    r"\bensures? (?:compliance|you are compliant|full compliance)\b",
    r"\b100% compliant\b",
    r"\bfully compliant\b",
    r"\bno risk of (?:a )?(?:fine|penalty|enforcement)\b",
    r"\bnever be fined\b",
    r"\bcannot be fined\b",
    r"\bimmune from enforcement\b",
    r"\bwe are your (?:lawyer|law firm|attorney)\b",
)
# "legal advice" alone is legitimate inside the disclaimer ("not legal advice"),
# so it is checked separately with negative context below.
_LEGAL_ADVICE_OK = re.compile(r"(?:not|isn't|is not|does not constitute|no)\s+legal advice", re.IGNORECASE)

DISCLAIMER_MARKERS = (
    "not legal advice",
    "does not constitute legal advice",
    "not a law firm",
)


# ── Public API ────────────────────────────────────────────────────
def validate_page(
    page: dict,
    *,
    known_urls: Iterable[str] = (),
    registry_urls: Iterable[str] = (),
) -> list[str]:
    """Returns BLOCK-severity error strings. Empty list => promote to 'review'."""
    findings = audit_page(page, known_urls=known_urls, registry_urls=registry_urls)
    return [str(f) for f in findings if f.severity == "BLOCK"]


def audit_page(
    page: dict,
    *,
    known_urls: Iterable[str] = (),
    registry_urls: Iterable[str] = (),
) -> list[Finding]:
    """Every Finding (BLOCK + WARN) for one factory page."""
    known = {_norm_path(u) for u in known_urls}
    registry = {u.strip() for u in registry_urls if isinstance(u, str)}
    findings: list[Finding] = []
    findings.extend(_check_word_count(page))
    findings.extend(_check_citations(page, registry))
    findings.extend(_check_faq(page))
    findings.extend(_check_internal_links(page, known))
    findings.extend(_check_banned_phrases(page))
    findings.extend(_check_guarantees(page))
    findings.extend(_check_disclaimer(page))
    findings.extend(_check_structure(page))
    return findings


# ── Individual checks ─────────────────────────────────────────────
def _body(page: dict) -> str:
    return page.get("body_md") or page.get("content") or ""


def _words(text: str) -> int:
    no_code = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    return len(re.findall(r"\b[\w'’-]+\b", no_code))


def _norm_path(url: str) -> str:
    """Compare hub URLs by path, so '/guides/x' == 'https://bizlegal-ai.com/guides/x'."""
    u = (url or "").strip()
    u = re.sub(r"^https?://(?:www\.)?bizlegal-ai\.com", "", u)
    u = u.split("#", 1)[0].split("?", 1)[0]
    if not u.startswith("/"):
        return ""
    return u.rstrip("/") or "/"


def _check_word_count(page: dict) -> Iterator[Finding]:
    n = _words(_body(page))
    if n < MIN_WORDS:
        yield Finding("BLOCK", "thin_word_count", f"{n} words (need >={MIN_WORDS})")


def _check_citations(page: dict, registry: set[str]) -> Iterator[Finding]:
    cites = page.get("citations") or []
    if not isinstance(cites, list):
        yield Finding("BLOCK", "citations_not_list", "citations must be a list")
        return
    resolved, unknown = [], []
    for c in cites:
        url = (c.get("url") or "").strip() if isinstance(c, dict) else ""
        if not url:
            continue
        (resolved if url in registry else unknown).append(url)
    if unknown:
        yield Finding(
            "BLOCK",
            "citation_off_registry",
            f"{len(unknown)} citation(s) not in the source registry (invented or drifted): "
            + ", ".join(sorted(set(unknown))[:3]),
        )
    if len(set(resolved)) < MIN_CITATIONS:
        yield Finding(
            "BLOCK",
            "few_citations",
            f"{len(set(resolved))} registry-resolved citations (need >={MIN_CITATIONS})",
        )


def _check_faq(page: dict) -> Iterator[Finding]:
    faq = page.get("faq") or []
    if not isinstance(faq, list):
        yield Finding("BLOCK", "faq_not_list", "faq must be a list of {q,a}")
        return
    pairs = [f for f in faq if isinstance(f, dict) and (f.get("q") or "").strip() and (f.get("a") or "").strip()]
    if len(pairs) < MIN_FAQ_ENTRIES:
        yield Finding("BLOCK", "thin_faq", f"{len(pairs)} complete Q/A pairs (need >={MIN_FAQ_ENTRIES})")
        return
    norms = [_norm_question(p["q"]) for p in pairs]
    if len(set(norms)) != len(norms):
        yield Finding("BLOCK", "duplicate_faq", "two or more FAQ questions are the same question")
    title_norm = _norm_question(page.get("title") or "")
    if title_norm and title_norm in norms:
        yield Finding("BLOCK", "faq_restates_title", "an FAQ question is just the page title restated")
    short = [p["q"] for p in pairs if _words(p["a"]) < MIN_FAQ_ANSWER_WORDS]
    if short:
        yield Finding(
            "WARN",
            "short_faq_answer",
            f"{len(short)} FAQ answer(s) under {MIN_FAQ_ANSWER_WORDS} words — Google rarely surfaces those",
        )


def _norm_question(q: str) -> str:
    return re.sub(r"[^a-z0-9 ]+", "", (q or "").lower()).strip()


def _check_internal_links(page: dict, known: set[str]) -> Iterator[Finding]:
    declared = page.get("internal_links") or []
    body = _body(page)
    inline = re.findall(r"\]\((/[^)\s]*|https?://(?:www\.)?bizlegal-ai\.com[^)\s]*)\)", body)
    candidates = [u for u in list(declared) + inline if isinstance(u, str)]
    paths = {_norm_path(u) for u in candidates}
    paths.discard("")
    if not known:
        # No URL set supplied — degrade to a count-only WARN rather than a
        # false BLOCK. Callers should always pass known_urls.
        if len(paths) < MIN_INTERNAL_LINKS:
            yield Finding("BLOCK", "few_internal_links", f"{len(paths)} internal links (need >={MIN_INTERNAL_LINKS})")
        return
    good = {p for p in paths if p in known}
    bad = sorted(paths - known)
    if bad:
        yield Finding(
            "BLOCK",
            "internal_link_404",
            f"{len(bad)} internal link(s) point at hub URLs that do not exist: " + ", ".join(bad[:3]),
        )
    if len(good) < MIN_INTERNAL_LINKS:
        yield Finding(
            "BLOCK",
            "few_internal_links",
            f"{len(good)} verified internal links (need >={MIN_INTERNAL_LINKS})",
        )


def _check_banned_phrases(page: dict) -> Iterator[Finding]:
    lower = _body(page).lower()
    hits = [p for p in BANNED_PHRASES if p in lower]
    if hits:
        yield Finding("BLOCK", "banned_phrases", "boilerplate tells: " + ", ".join(hits[:5]))


def _check_guarantees(page: dict) -> Iterator[Finding]:
    body = _body(page)
    faq_text = " ".join(
        f"{f.get('q', '')} {f.get('a', '')}" for f in (page.get("faq") or []) if isinstance(f, dict)
    )
    haystack = f"{body}\n{faq_text}"
    hits: list[str] = []
    for pat in GUARANTEE_PATTERNS:
        m = re.search(pat, haystack, re.IGNORECASE)
        if m:
            hits.append(m.group(0))
    # "legal advice" is fine only in a negated disclaimer form.
    for m in re.finditer(r"[^.]*\blegal advice\b[^.]*\.", haystack, re.IGNORECASE):
        if not _LEGAL_ADVICE_OK.search(m.group(0)):
            hits.append("legal advice (non-disclaimer use)")
            break
    if hits:
        yield Finding(
            "BLOCK",
            "outcome_guarantee",
            "outcome/advice claims BizLegal cannot make: " + ", ".join(sorted(set(hits))[:5]),
        )


def _check_disclaimer(page: dict) -> Iterator[Finding]:
    haystack = f"{_body(page)}\n{page.get('disclaimer', '')}".lower()
    if not any(marker in haystack for marker in DISCLAIMER_MARKERS):
        yield Finding("BLOCK", "no_disclaimer", "YMYL disclaimer missing (needs a 'not legal advice' line)")


def _check_structure(page: dict) -> Iterator[Finding]:
    body = _body(page)
    h2 = len(re.findall(r"^## [^\n]+", body, re.MULTILINE))
    if h2 < 3:
        yield Finding("BLOCK", "few_h2", f"{h2} H2 sections (need >=3)")
    if re.search(r"^# ", body, re.MULTILINE):
        yield Finding(
            "WARN",
            "body_has_h1",
            "body starts with an H1 — the route renders the title as the H1, so this duplicates it",
        )


# ── CLI ───────────────────────────────────────────────────────────
def _default_sets() -> tuple[set[str], set[str]]:
    """Load the real registry + known-URL set from the matrix, so the CLI gates
    a page the same way the factory does instead of blocking every citation."""
    try:
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        from page_factory_rows import (  # noqa: PLC0415 — optional at import time
            build_rows,
            known_hub_urls,
            load_guides,
            load_matrix,
            registry_urls,
        )

        matrix = load_matrix()
        guides = load_guides()
        rows = build_rows(matrix, guides)
        return known_hub_urls(matrix, guides, rows), registry_urls(matrix)
    except Exception as err:  # noqa: BLE001 — CLI must still run standalone
        print(f"[warn] matrix not loadable ({type(err).__name__}); "
              "falling back to the page's own _known_urls/_registry_urls", file=sys.stderr)
        return set(), set()


def _main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: python page_quality_gate.py path/to/page.json", file=sys.stderr)
        return 2
    page = json.loads(Path(argv[1]).read_text(encoding="utf-8"))
    known, registry = _default_sets()
    findings = audit_page(
        page,
        known_urls=page.get("_known_urls") or known,
        registry_urls=page.get("_registry_urls") or registry,
    )
    if not findings:
        print("PASS — all gates green")
        return 0
    for f in findings:
        print(f)
    return 1 if any(f.severity == "BLOCK" for f in findings) else 0


if __name__ == "__main__":
    sys.exit(_main(sys.argv))
