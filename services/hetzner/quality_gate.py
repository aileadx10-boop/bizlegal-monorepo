"""
Hetzner curator — quality gate.

Validates a `draft` dict (the JSON output from brain.py's Claude call)
against a 6-gate rubric BEFORE we waste cycles on humanize/factual/numeric
verification or burn a hero-image generation. Fail-fast on structural
problems; let the more expensive Claude passes worry about prose quality.

Public API:

    errors = validate(draft)
    if errors:
        # Reject + Telegram nudge with reasons
        ...

The 6 gates:

  1. **H1 present** — mdx_body starts with `# ` (matches title in spirit)
  2. **≥3 H2 sections** — sustained article structure, not a thin TL;DR
  3. **≥3 citations** — frontmatter['sources'] non-trivial, all https
  4. **≥1 visual** — at least one Mermaid diagram OR comparison table
                    OR <table> inside mdx_body
  5. **800-1500 words** — too thin won't rank, too bloated won't read
  6. **FAQ schema rendered** — at least 3 Q&A pairs (## FAQ section
     parsed; or frontmatter['faqs'] if brain.py emits it)

Bonus checks (warnings, not blockers):
  - ≥3 internal_links to other gap pages (crucial for SEO clusters)
  - Banned phrases removed (some still slip past the prompt's anti-tells)
  - Em-dash density under ~3 per 1000 words

Usage from brain.py:

    from quality_gate import validate, QualityGateError
    errors = validate(draft)
    if errors:
        # nudge Telegram, mark daily_gaps row 'rejected_quality',
        # log the errors list as a JSON array for retry tooling
        raise QualityGateError(errors)
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable


# ── Tunables (mirror prompt rules) ────────────────────────────────
MIN_WORDS = 800
MAX_WORDS = 1500
MIN_H2 = 3
MIN_CITATIONS = 3
MIN_FAQ_ENTRIES = 3
MIN_INTERNAL_LINKS = 3   # WARN, not BLOCK
MAX_EMDASH_PER_1000 = 3.0  # WARN, not BLOCK

# Phrases that survived the brain.py prompt's anti-AI-detection rules.
# Lower-case substring match. If any appears in mdx_body, BLOCK.
BANNED_PHRASES = (
    "it's important to note",
    "moreover,",
    "furthermore,",
    "in conclusion",
    "navigating the landscape",
    "delve into",
    "dive deep",
    "in today's rapidly evolving",
    "it is crucial to understand",
    "the world of",
    "tapestry",
    "rapidly changing",
)


# ── Public API ────────────────────────────────────────────────────
class QualityGateError(Exception):
    """Raised by callers who want fail-fast on BLOCKER-level errors."""

    def __init__(self, errors: list[str]):
        super().__init__("\n".join(errors))
        self.errors = errors


@dataclass(frozen=True)
class Finding:
    severity: str  # "BLOCK" | "WARN"
    code: str      # e.g. "no_h1", "thin_word_count"
    message: str

    def __str__(self) -> str:
        return f"[{self.severity}] {self.code}: {self.message}"


def validate(draft: dict) -> list[str]:
    """Returns a list of BLOCK-severity error strings.

    Empty list ⇒ all gates passed. Non-empty ⇒ caller should reject
    the draft. Use `audit()` for the full Finding list including WARN.
    """
    findings = audit(draft)
    return [str(f) for f in findings if f.severity == "BLOCK"]


def audit(draft: dict) -> list[Finding]:
    """Returns every Finding (BLOCK + WARN). Useful for richer
    Telegram nudges and logging."""
    findings: list[Finding] = []
    findings.extend(_check_structure(draft))
    findings.extend(_check_citations(draft))
    findings.extend(_check_visuals(draft))
    findings.extend(_check_word_count(draft))
    findings.extend(_check_faq(draft))
    findings.extend(_check_internal_links(draft))
    findings.extend(_check_banned_phrases(draft))
    findings.extend(_check_emdash_density(draft))
    return findings


# ── Individual gate checks ────────────────────────────────────────
def _check_structure(draft: dict) -> Iterable[Finding]:
    body = draft.get("mdx_body", "")
    if not re.search(r"^# [^\n]+", body, re.MULTILINE):
        yield Finding("BLOCK", "no_h1", "mdx_body has no H1 (`# ...`)")
    h2_count = len(re.findall(r"^## [^\n]+", body, re.MULTILINE))
    if h2_count < MIN_H2:
        yield Finding(
            "BLOCK",
            "few_h2",
            f"only {h2_count} H2 sections found (need ≥{MIN_H2})",
        )


def _check_citations(draft: dict) -> Iterable[Finding]:
    sources = draft.get("sources") or []
    if not isinstance(sources, list):
        yield Finding("BLOCK", "sources_not_list", "frontmatter.sources must be a list")
        return
    https_sources = [s for s in sources if isinstance(s, str) and s.strip().lower().startswith("https://")]
    if len(https_sources) < MIN_CITATIONS:
        yield Finding(
            "BLOCK",
            "few_citations",
            f"only {len(https_sources)} https citations (need ≥{MIN_CITATIONS})",
        )


def _check_visuals(draft: dict) -> Iterable[Finding]:
    mermaid = draft.get("mermaid") or []
    body = draft.get("mdx_body", "")
    has_mermaid = isinstance(mermaid, list) and any(isinstance(m, str) and m.strip() for m in mermaid)
    has_table = bool(re.search(r"^\s*\|.*\|.*\|", body, re.MULTILINE))  # markdown pipe table
    has_html_table = "<table" in body.lower()
    has_comparison_tables = bool(draft.get("comparison_tables"))
    if not (has_mermaid or has_table or has_html_table or has_comparison_tables):
        yield Finding(
            "BLOCK",
            "no_visual",
            "no Mermaid diagram, no markdown table, no <table>, no comparison_tables — need ≥1 visual",
        )


def _check_word_count(draft: dict) -> Iterable[Finding]:
    body = draft.get("mdx_body", "")
    # Strip code fences first so mermaid/code don't inflate the count
    no_code = re.sub(r"```.*?```", "", body, flags=re.DOTALL)
    words = re.findall(r"\b\w+\b", no_code)
    n = len(words)
    if n < MIN_WORDS:
        yield Finding(
            "BLOCK",
            "thin_word_count",
            f"{n} words (need ≥{MIN_WORDS}). Filler doesn't help; substance does.",
        )
    elif n > MAX_WORDS:
        yield Finding(
            "BLOCK",
            "bloated_word_count",
            f"{n} words (max {MAX_WORDS}). Trim filler before publish.",
        )


def _check_faq(draft: dict) -> Iterable[Finding]:
    """Either frontmatter.faqs has ≥3 entries, OR an FAQ ## section
    contains ≥3 question-answer pairs heuristically."""
    fm_faqs = draft.get("faqs")
    if isinstance(fm_faqs, list) and len([f for f in fm_faqs if isinstance(f, dict) and f.get("q")]) >= MIN_FAQ_ENTRIES:
        return  # ✅
    body = draft.get("mdx_body", "")
    # Find an "## FAQ" or "## Frequently Asked Questions" block
    m = re.search(r"^##\s+(?:FAQ|Frequently Asked Questions)\b(.*?)(?=^## |\Z)", body, re.MULTILINE | re.DOTALL | re.IGNORECASE)
    if not m:
        yield Finding("BLOCK", "no_faq_section", "no `## FAQ` section and no frontmatter.faqs[]")
        return
    faq_block = m.group(1)
    # Question pattern: H3, bold, or "Q:" prefix; tolerant.
    q_count = len(re.findall(r"^(?:###\s+|\*\*Q\b|\*\*\d+\.|Q\d*:|\d+\. )", faq_block, re.MULTILINE | re.IGNORECASE))
    if q_count < MIN_FAQ_ENTRIES:
        yield Finding(
            "BLOCK",
            "thin_faq",
            f"FAQ section has ~{q_count} questions (need ≥{MIN_FAQ_ENTRIES})",
        )


def _check_internal_links(draft: dict) -> Iterable[Finding]:
    """WARN-level — internal cross-links matter for SEO clusters but
    early posts can't link to siblings that don't exist yet."""
    body = draft.get("mdx_body", "")
    fm_links = draft.get("internal_links") or []
    pattern_inline = r"\]\((?:https?://(?:blog|forge|bizlegal-ai)\.bizlegal-ai\.com|/(?:blog|gap|agents))/"
    inline = len(re.findall(pattern_inline, body))
    declared = len(fm_links) if isinstance(fm_links, list) else 0
    total = inline + declared
    if total < MIN_INTERNAL_LINKS:
        yield Finding(
            "WARN",
            "few_internal_links",
            f"{total} internal cross-links (target ≥{MIN_INTERNAL_LINKS}). OK for early posts; backfill once cluster has ≥3 siblings.",
        )


def _check_banned_phrases(draft: dict) -> Iterable[Finding]:
    body_lower = (draft.get("mdx_body") or "").lower()
    hits = [p for p in BANNED_PHRASES if p in body_lower]
    if hits:
        yield Finding(
            "BLOCK",
            "banned_phrases",
            f"AI-tells survived humanize: {', '.join(hits[:5])}",
        )


def _check_emdash_density(draft: dict) -> Iterable[Finding]:
    body = draft.get("mdx_body") or ""
    em_count = body.count("—")
    words = len(re.findall(r"\b\w+\b", body))
    if words == 0:
        return
    density = em_count / (words / 1000.0)
    if density > MAX_EMDASH_PER_1000:
        yield Finding(
            "WARN",
            "emdash_density",
            f"{em_count} em-dashes / {words} words = {density:.1f} per 1000 (max {MAX_EMDASH_PER_1000:.1f})",
        )


# ── CLI for ad-hoc testing ────────────────────────────────────────
if __name__ == "__main__":
    import json
    import sys

    if len(sys.argv) != 2:
        print("usage: python quality_gate.py path/to/draft.json", file=sys.stderr)
        sys.exit(2)
    with open(sys.argv[1], encoding="utf-8") as fh:
        draft = json.load(fh)
    findings = audit(draft)
    if not findings:
        print("PASS — all gates green")
        sys.exit(0)
    block_count = sum(1 for f in findings if f.severity == "BLOCK")
    for f in findings:
        print(f)
    sys.exit(1 if block_count else 0)
