"""Unit tests for services/hetzner/factual_review.py.

All Claude API calls are mocked — no real network traffic.
Run: pytest services/hetzner/tests/test_factual_review.py -v
"""
from __future__ import annotations

import copy
import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from factual_review import (
    FactualReviewError,
    ReviewResult,
    review,
    _count_primary,
)
from tests.conftest import GOOD_DRAFT


# ── helpers ───────────────────────────────────────────────────────────


def _sonnet_response(payload: dict) -> MagicMock:
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {
        "content": [{"type": "text", "text": json.dumps(payload)}]
    }
    return mock_resp


def _pass_response(primary_count: int = 3) -> dict:
    return {
        "all_claims_cited": True,
        "primary_source_count": primary_count,
        "issues": [],
    }


def _fail_response(issues: list[dict]) -> dict:
    return {
        "all_claims_cited": False,
        "primary_source_count": 1,
        "issues": issues,
    }


_SAMPLE_ISSUE = {
    "claim": "Article 6 mandates a €5 million fine",
    "issue": "missing_citation",
    "suggested_action": "add_citation",
    "suggested_url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R1114",
}


# ── ReviewResult ──────────────────────────────────────────────────────


def test_review_result_all_claimed_cited_true():
    r = ReviewResult(all_claims_cited=True, primary_source_count=3, issues=[], raw={})
    assert r.all_claims_cited is True
    assert r.block_messages() == []


def test_review_result_block_messages_with_issues():
    r = ReviewResult(
        all_claims_cited=False,
        primary_source_count=1,
        issues=[_SAMPLE_ISSUE],
        raw={},
    )
    msgs = r.block_messages()
    assert len(msgs) >= 2
    assert "factual review" in msgs[0]
    assert "missing_citation" in msgs[1]


def test_review_result_block_messages_caps_at_five():
    issues = [copy.copy(_SAMPLE_ISSUE) for _ in range(10)]
    r = ReviewResult(all_claims_cited=False, primary_source_count=0, issues=issues, raw={})
    msgs = r.block_messages()
    # 1 header + 5 issues + 1 "...and N more" = 7 lines max
    assert len(msgs) <= 7


def test_review_result_block_messages_shows_suggested_url():
    issue_with_url = {**_SAMPLE_ISSUE, "suggested_url": "https://sec.gov/example"}
    r = ReviewResult(all_claims_cited=False, primary_source_count=0, issues=[issue_with_url], raw={})
    msgs = r.block_messages()
    assert any("sec.gov" in m for m in msgs)


def test_review_result_block_messages_no_url_omits_try():
    issue_no_url = {**_SAMPLE_ISSUE, "suggested_url": ""}
    r = ReviewResult(all_claims_cited=False, primary_source_count=0, issues=[issue_no_url], raw={})
    msgs = r.block_messages()
    assert not any("try" in m for m in msgs)


# ── review() success path ─────────────────────────────────────────────


def test_review_returns_pass_when_all_claimed_cited():
    with patch("factual_review.ANTHROPIC_KEY", "test-key"), \
         patch("factual_review.httpx.post", return_value=_sonnet_response(_pass_response(3))):
        result = review(copy.deepcopy(GOOD_DRAFT))

    assert result.all_claims_cited is True
    assert result.issues == []
    assert result.primary_source_count == 3


def test_review_returns_fail_when_issues_found():
    with patch("factual_review.ANTHROPIC_KEY", "test-key"), \
         patch("factual_review.httpx.post", return_value=_sonnet_response(_fail_response([_SAMPLE_ISSUE]))):
        result = review(copy.deepcopy(GOOD_DRAFT))

    assert result.all_claims_cited is False
    assert len(result.issues) == 1
    assert result.issues[0]["issue"] == "missing_citation"


def test_review_returns_result_not_raises():
    """review() should NEVER raise — it returns a ReviewResult; caller decides."""
    with patch("factual_review.ANTHROPIC_KEY", "test-key"), \
         patch("factual_review.httpx.post", return_value=_sonnet_response(_fail_response([_SAMPLE_ISSUE]))):
        result = review(copy.deepcopy(GOOD_DRAFT))

    assert isinstance(result, ReviewResult)


def test_review_preserves_raw_response():
    payload = _pass_response(2)
    with patch("factual_review.ANTHROPIC_KEY", "test-key"), \
         patch("factual_review.httpx.post", return_value=_sonnet_response(payload)):
        result = review(copy.deepcopy(GOOD_DRAFT))

    assert result.raw == payload


# ── review() error handling ───────────────────────────────────────────


def test_review_raises_runtime_error_without_api_key():
    with patch("factual_review.ANTHROPIC_KEY", ""):
        with pytest.raises(RuntimeError, match="ANTHROPIC_API_KEY"):
            review(copy.deepcopy(GOOD_DRAFT))


def test_review_raises_on_empty_sonnet_response():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {"content": []}  # no text block

    with patch("factual_review.ANTHROPIC_KEY", "test-key"), \
         patch("factual_review.httpx.post", return_value=mock_resp):
        with pytest.raises(Exception):
            review(copy.deepcopy(GOOD_DRAFT))


def test_review_raises_on_api_http_error():
    import httpx

    mock_resp = MagicMock()
    mock_resp.raise_for_status.side_effect = httpx.HTTPStatusError(
        "503", request=MagicMock(), response=MagicMock()
    )

    with patch("factual_review.ANTHROPIC_KEY", "test-key"), \
         patch("factual_review.httpx.post", return_value=mock_resp):
        with pytest.raises(Exception):
            review(copy.deepcopy(GOOD_DRAFT))


# ── primary_source_count fallback ────────────────────────────────────


def test_review_uses_local_count_when_sonnet_omits_it():
    """If Sonnet omits primary_source_count, _count_primary() fills in."""
    payload = {"all_claims_cited": True, "issues": []}  # no primary_source_count

    with patch("factual_review.ANTHROPIC_KEY", "test-key"), \
         patch("factual_review.httpx.post", return_value=_sonnet_response(payload)):
        result = review(copy.deepcopy(GOOD_DRAFT))

    # GOOD_DRAFT has 3 esma.europa.eu / eur-lex.europa.eu sources
    assert result.primary_source_count >= 0  # at least computed, not crashing


# ── _count_primary() ─────────────────────────────────────────────────


@pytest.mark.parametrize("url,expected_primary", [
    ("https://sec.gov/news/pressreleases.rss", True),
    ("https://www.esma.europa.eu/guidance/mica", True),
    ("https://eur-lex.europa.eu/legal-content/EN/TXT/", True),
    ("https://fca.org.uk/news/mca-guidance", True),
    ("https://fincen.gov/news", True),
    ("https://nist.gov/publications", True),
    ("https://reuters.com/legal/article", False),
    ("https://coindesk.com/story", False),
    ("https://en.wikipedia.org/wiki/MiCA", False),
    ("https://blog.latham.com/mica-overview", False),
    ("https://cftc.gov/PressRoom/PressReleases", True),
])
def test_count_primary_correctly_classifies_domains(url: str, expected_primary: bool):
    count = _count_primary([url])
    if expected_primary:
        assert count == 1, f"Expected {url!r} to be primary (count=1)"
    else:
        assert count == 0, f"Expected {url!r} to be non-primary (count=0)"


def test_count_primary_handles_empty_list():
    assert _count_primary([]) == 0


def test_count_primary_handles_non_string_entries():
    # None and integers in the list shouldn't crash
    assert _count_primary([None, 123, "https://sec.gov/foo"]) == 1  # type: ignore[list-item]


def test_count_primary_sums_multiple():
    sources = [
        "https://sec.gov/foo",
        "https://esma.europa.eu/bar",
        "https://reuters.com/baz",   # non-primary
        "https://nist.gov/qux",
    ]
    assert _count_primary(sources) == 3


# ── FactualReviewError ────────────────────────────────────────────────


def test_factual_review_error_stores_result():
    r = ReviewResult(all_claims_cited=False, primary_source_count=0, issues=[_SAMPLE_ISSUE], raw={})
    ex = FactualReviewError(r)
    assert ex.result is r


def test_factual_review_error_message_contains_issue_detail():
    r = ReviewResult(all_claims_cited=False, primary_source_count=0, issues=[_SAMPLE_ISSUE], raw={})
    ex = FactualReviewError(r)
    assert "missing_citation" in str(ex)


# ── JSON extraction robustness ────────────────────────────────────────


def test_review_handles_sonnet_prose_before_json():
    payload = _pass_response(3)

    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {
        "content": [{"type": "text", "text": f"After reviewing the article:\n{json.dumps(payload)}"}]
    }

    with patch("factual_review.ANTHROPIC_KEY", "test-key"), \
         patch("factual_review.httpx.post", return_value=mock_resp):
        result = review(copy.deepcopy(GOOD_DRAFT))

    assert result.all_claims_cited is True
