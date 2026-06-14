"""Unit tests for services/hetzner/quality_gate.py.

All tests are pure Python — no network calls, no Claude API, no Supabase.
Run: pytest services/hetzner/tests/test_quality_gate.py -v
"""
from __future__ import annotations

import copy
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from quality_gate import (
    Finding,
    QualityGateError,
    audit,
    validate,
    _check_structure,
    _check_citations,
    _check_visuals,
    _check_word_count,
    _check_faq,
    _check_internal_links,
    _check_banned_phrases,
    _check_emdash_density,
)
from tests.conftest import GOOD_DRAFT


# ── helpers ──────────────────────────────────────────────────────────


def _with(base: dict, **overrides) -> dict:
    """Return a copy of base with overrides applied (shallow)."""
    out = copy.deepcopy(base)
    out.update(overrides)
    return out


def block_codes(draft: dict) -> list[str]:
    return [f.code for f in audit(draft) if f.severity == "BLOCK"]


def warn_codes(draft: dict) -> list[str]:
    return [f.code for f in audit(draft) if f.severity == "WARN"]


# ── good draft passes everything ─────────────────────────────────────


def test_good_draft_passes_all_gates():
    errors = validate(GOOD_DRAFT)
    assert errors == [], f"Good draft should pass all gates; got: {errors}"


def test_good_draft_has_no_block_findings():
    findings = audit(GOOD_DRAFT)
    blocks = [f for f in findings if f.severity == "BLOCK"]
    assert blocks == [], f"Expected no BLOCK findings; got: {blocks}"


# ── structure gate ────────────────────────────────────────────────────


def test_no_h1_blocks():
    body_without_h1 = GOOD_DRAFT["mdx_body"].replace("# MiCA", "MiCA")
    draft = _with(GOOD_DRAFT, mdx_body=body_without_h1)
    assert "no_h1" in block_codes(draft)


def test_h1_present_passes():
    assert "no_h1" not in block_codes(GOOD_DRAFT)


def test_one_h2_blocks():
    # Strip all H2s and replace with plain text except one
    body = "# Title\n\nContent.\n\n## Only One Section\n\nText.\n\n## FAQ\n\n**Q: q?** A: a.\n\n**Q: q2?** A: a2.\n\n**Q: q3?** A: a3."
    draft = _with(GOOD_DRAFT, mdx_body=body)
    codes = block_codes(draft)
    assert "few_h2" in codes


def test_three_h2s_passes():
    assert "few_h2" not in block_codes(GOOD_DRAFT)


# ── citations gate ────────────────────────────────────────────────────


def test_two_https_citations_blocks():
    draft = _with(GOOD_DRAFT, sources=[
        "https://eur-lex.europa.eu/foo",
        "https://esma.europa.eu/bar",
    ])
    assert "few_citations" in block_codes(draft)


def test_http_not_https_doesnt_count():
    draft = _with(GOOD_DRAFT, sources=[
        "http://eur-lex.europa.eu/foo",   # http:// — doesn't count
        "https://esma.europa.eu/bar",
        "https://nist.gov/baz",
    ])
    # Only 2 valid https sources → should block
    assert "few_citations" in block_codes(draft)


def test_three_https_citations_passes():
    assert "few_citations" not in block_codes(GOOD_DRAFT)


def test_sources_not_a_list_blocks():
    draft = _with(GOOD_DRAFT, sources="https://example.com")
    assert "sources_not_list" in block_codes(draft)


def test_missing_sources_key_blocks():
    draft = copy.deepcopy(GOOD_DRAFT)
    del draft["sources"]
    assert "few_citations" in block_codes(draft) or "sources_not_list" in block_codes(draft)


# ── visual gate ───────────────────────────────────────────────────────


def test_mermaid_alone_passes_visual_gate():
    draft = _with(
        GOOD_DRAFT,
        mdx_body=_body_without_tables(),
        mermaid=["flowchart TD\n  A --> B"],
    )
    assert "no_visual" not in block_codes(draft)


def test_markdown_pipe_table_passes_visual_gate():
    body_with_table = _body_without_mermaid() + "\n| col1 | col2 |\n|------|------|\n| a | b |\n"
    draft = _with(GOOD_DRAFT, mdx_body=body_with_table, mermaid=[])
    assert "no_visual" not in block_codes(draft)


def test_html_table_passes_visual_gate():
    body_with_html = _body_without_mermaid() + "\n<table><tr><td>a</td></tr></table>\n"
    draft = _with(GOOD_DRAFT, mdx_body=body_with_html, mermaid=[])
    assert "no_visual" not in block_codes(draft)


def test_comparison_tables_field_passes_visual_gate():
    draft = _with(GOOD_DRAFT, mermaid=[], comparison_tables=["| a | b |\n|---|---|\n| 1 | 2 |"])
    body_no_tables = _body_without_tables()
    draft["mdx_body"] = body_no_tables
    assert "no_visual" not in block_codes(draft)


def test_no_visual_element_blocks():
    draft = _with(GOOD_DRAFT, mermaid=[], mdx_body=_body_without_tables())
    draft.pop("comparison_tables", None)
    assert "no_visual" in block_codes(draft)


def test_empty_mermaid_list_doesnt_pass():
    draft = _with(GOOD_DRAFT, mermaid=[], mdx_body=_body_without_tables())
    assert "no_visual" in block_codes(draft)


def test_whitespace_only_mermaid_doesnt_pass():
    draft = _with(GOOD_DRAFT, mermaid=["   \n  "], mdx_body=_body_without_tables())
    assert "no_visual" in block_codes(draft)


# ── word count gate ───────────────────────────────────────────────────


def test_thin_word_count_blocks():
    draft = _with(GOOD_DRAFT, mdx_body="# Title\n\n## Intro\n\nShort body.\n\n## FAQ\n\n**Q: q?** A: a.\n\n## Sources")
    assert "thin_word_count" in block_codes(draft)


def test_bloated_word_count_blocks():
    filler = " ".join(["word"] * 1600)  # 1600 plain words
    body = f"# Title\n\n## Section One\n\n{filler}\n\n## FAQ\n\n**Q: q?** A: a.\n\n## Sources\n\nhttps://example.gov"
    draft = _with(GOOD_DRAFT, mdx_body=body)
    assert "bloated_word_count" in block_codes(draft)


def test_code_fences_excluded_from_word_count():
    # A mermaid block should not inflate the count
    mermaid_block = "```mermaid\n" + "\n".join(["flowchart"] * 900) + "\n```"
    body = GOOD_DRAFT["mdx_body"] + "\n" + mermaid_block
    draft = _with(GOOD_DRAFT, mdx_body=body)
    # Word count check should still pass for the main body
    assert "bloated_word_count" not in block_codes(draft)


def test_good_word_count_passes():
    assert "thin_word_count" not in block_codes(GOOD_DRAFT)
    assert "bloated_word_count" not in block_codes(GOOD_DRAFT)


# ── FAQ gate ──────────────────────────────────────────────────────────


def test_faqs_list_with_three_entries_passes():
    draft = _with(GOOD_DRAFT, faqs=[
        {"q": "Q1?", "a": "A1."},
        {"q": "Q2?", "a": "A2."},
        {"q": "Q3?", "a": "A3."},
    ])
    assert "no_faq_section" not in block_codes(draft)
    assert "thin_faq" not in block_codes(draft)


def test_faqs_list_fewer_than_three_falls_through_to_body():
    draft = _with(GOOD_DRAFT, faqs=[{"q": "Q1?", "a": "A1."}])
    # Even with sparse faqs[], the body's ## FAQ section should still pass
    assert "thin_faq" not in block_codes(draft)


def test_no_faq_section_and_empty_faqs_blocks():
    body_no_faq = "\n".join(
        line for line in GOOD_DRAFT["mdx_body"].splitlines()
        if not line.startswith("## FAQ") and "**Q:" not in line and "A:" not in line
    )
    draft = _with(GOOD_DRAFT, mdx_body=body_no_faq, faqs=[])
    codes = block_codes(draft)
    assert "no_faq_section" in codes or "thin_faq" in codes


def test_faq_section_with_three_questions_passes():
    assert "no_faq_section" not in block_codes(GOOD_DRAFT)
    assert "thin_faq" not in block_codes(GOOD_DRAFT)


# ── internal links gate (WARN only) ──────────────────────────────────


def test_no_internal_links_is_warn_not_block():
    draft = _with(GOOD_DRAFT, mdx_body=_body_strip_internal_links(GOOD_DRAFT["mdx_body"]), internal_links=[])
    errors = validate(draft)
    # validate() returns only BLOCK — WARN shouldn't appear here
    warn_present = any("few_internal_links" in e for e in errors)
    assert not warn_present, "few_internal_links should be WARN, not BLOCK"


def test_no_internal_links_appears_in_audit_as_warn():
    draft = _with(GOOD_DRAFT, mdx_body=_body_strip_internal_links(GOOD_DRAFT["mdx_body"]), internal_links=[])
    assert "few_internal_links" in warn_codes(draft)


def test_internal_links_in_frontmatter_field_count():
    draft = _with(GOOD_DRAFT, internal_links=[
        "/gap/eu/mica-article-68-requirements",
        "/gap/us/sec-crypto-enforcement-2024",
        "/gap/eu/esma-defi-guidance",
    ])
    assert "few_internal_links" not in warn_codes(draft)


# ── banned phrases gate ───────────────────────────────────────────────


@pytest.mark.parametrize("phrase", [
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
])
def test_banned_phrase_blocks(phrase: str):
    body = GOOD_DRAFT["mdx_body"] + f"\n\nSome text: {phrase} some more text."
    draft = _with(GOOD_DRAFT, mdx_body=body)
    assert "banned_phrases" in block_codes(draft), f"Expected BLOCK for phrase: {phrase!r}"


def test_clean_body_has_no_banned_phrases():
    assert "banned_phrases" not in block_codes(GOOD_DRAFT)


def test_banned_phrase_detection_is_case_insensitive():
    body = GOOD_DRAFT["mdx_body"] + "\n\nIt's Important To Note that this matters."
    draft = _with(GOOD_DRAFT, mdx_body=body)
    assert "banned_phrases" in block_codes(draft)


# ── em-dash density gate (WARN only) ─────────────────────────────────


def test_high_emdash_density_is_warn_not_block():
    em_heavy = " word" * 200 + " — " * 20  # ~4.4 em-dashes per 1000 words
    body = GOOD_DRAFT["mdx_body"] + em_heavy
    draft = _with(GOOD_DRAFT, mdx_body=body)
    errors = validate(draft)
    warn_present = any("emdash_density" in e for e in errors)
    assert not warn_present, "emdash_density should be WARN, not BLOCK"


def test_high_emdash_density_appears_in_audit_as_warn():
    em_heavy = " word" * 200 + " — " * 20
    body = GOOD_DRAFT["mdx_body"] + em_heavy
    draft = _with(GOOD_DRAFT, mdx_body=body)
    assert "emdash_density" in warn_codes(draft)


def test_low_emdash_density_doesnt_warn():
    assert "emdash_density" not in warn_codes(GOOD_DRAFT)


# ── Finding dataclass ─────────────────────────────────────────────────


def test_finding_str_format():
    f = Finding("BLOCK", "no_h1", "mdx_body has no H1")
    assert str(f) == "[BLOCK] no_h1: mdx_body has no H1"


def test_finding_is_frozen():
    f = Finding("BLOCK", "no_h1", "msg")
    with pytest.raises((AttributeError, TypeError)):
        f.severity = "WARN"  # type: ignore[misc]


def test_quality_gate_error_stores_errors():
    errs = ["[BLOCK] no_h1: ...", "[BLOCK] few_h2: ..."]
    ex = QualityGateError(errs)
    assert ex.errors == errs


def test_audit_returns_list_of_findings():
    results = audit(GOOD_DRAFT)
    assert isinstance(results, list)
    assert all(isinstance(f, Finding) for f in results)


# ── validate() is a strict subset of audit() ─────────────────────────


def test_validate_returns_only_block_strings():
    findings = audit(GOOD_DRAFT)
    errors = validate(GOOD_DRAFT)
    block_messages = {str(f) for f in findings if f.severity == "BLOCK"}
    assert set(errors) == block_messages


# ── helpers ──────────────────────────────────────────────────────────


def _body_without_tables() -> str:
    """Return GOOD_MDX_BODY with no markdown pipe tables."""
    return "\n".join(
        line for line in GOOD_DRAFT["mdx_body"].splitlines()
        if not line.strip().startswith("|")
    )


def _body_without_mermaid() -> str:
    """Return GOOD_MDX_BODY — mermaid is in the frontmatter field, not inline."""
    return GOOD_DRAFT["mdx_body"]


def _body_strip_internal_links(body: str) -> str:
    """Remove any internal links from body text."""
    import re
    return re.sub(r"\]\(https?://(?:blog|forge|www)?\.?bizlegal-ai\.com[^)]*\)", "](#)", body)
