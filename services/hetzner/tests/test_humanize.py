"""Unit tests for services/hetzner/humanize.py.

All Claude API calls are mocked — no real network traffic.
Run: pytest services/hetzner/tests/test_humanize.py -v
"""
from __future__ import annotations

import copy
import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from humanize import humanize, HumanizeError
from tests.conftest import GOOD_DRAFT


# ── helpers ───────────────────────────────────────────────────────────


def _haiku_ok_response(new_body: str) -> MagicMock:
    """Build a fake httpx response that returns `new_body` as the rewritten mdx_body."""
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {
        "content": [{"type": "text", "text": json.dumps({"mdx_body": new_body})}]
    }
    return mock_resp


def _draft_with_body(body: str) -> dict:
    d = copy.deepcopy(GOOD_DRAFT)
    d["mdx_body"] = body
    return d


# ── basic success path ────────────────────────────────────────────────


def test_humanize_returns_new_dict_with_updated_body():
    original = copy.deepcopy(GOOD_DRAFT)
    rewritten = original["mdx_body"].replace("must publish", "must file")

    with patch("humanize.ANTHROPIC_KEY", "test-key"), \
         patch("humanize.httpx.post", return_value=_haiku_ok_response(rewritten)):
        result = humanize(original)

    assert result["mdx_body"] == rewritten
    assert result is not original, "humanize must return a new dict, not mutate input"


def test_humanize_does_not_mutate_input():
    original = copy.deepcopy(GOOD_DRAFT)
    original_body = original["mdx_body"]
    rewritten = original_body.replace("must publish", "must file")

    with patch("humanize.ANTHROPIC_KEY", "test-key"), \
         patch("humanize.httpx.post", return_value=_haiku_ok_response(rewritten)):
        humanize(original)

    assert original["mdx_body"] == original_body, "Input dict must not be mutated"


def test_humanize_preserves_all_other_fields():
    original = copy.deepcopy(GOOD_DRAFT)
    rewritten = original["mdx_body"].replace("must publish", "must file")

    with patch("humanize.ANTHROPIC_KEY", "test-key"), \
         patch("humanize.httpx.post", return_value=_haiku_ok_response(rewritten)):
        result = humanize(original)

    for key in original:
        if key == "mdx_body":
            continue
        assert result[key] == original[key], f"Field {key!r} should not be changed by humanize"


def test_humanize_sets_humanized_flag():
    original = copy.deepcopy(GOOD_DRAFT)
    rewritten = original["mdx_body"].replace("must publish", "must file")

    with patch("humanize.ANTHROPIC_KEY", "test-key"), \
         patch("humanize.httpx.post", return_value=_haiku_ok_response(rewritten)):
        result = humanize(original)

    assert result.get("_humanized") is True


# ── error cases ───────────────────────────────────────────────────────


def test_humanize_raises_when_no_api_key(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    # Patch the module-level constant that was already loaded
    with patch("humanize.ANTHROPIC_KEY", ""):
        with pytest.raises(HumanizeError, match="ANTHROPIC_API_KEY"):
            humanize(copy.deepcopy(GOOD_DRAFT))


def test_humanize_raises_on_empty_mdx_body():
    draft = _draft_with_body("")
    with patch("humanize.ANTHROPIC_KEY", "test-key"):
        with pytest.raises(HumanizeError, match="no mdx_body"):
            humanize(draft)


def test_humanize_raises_on_missing_mdx_body_key():
    draft = copy.deepcopy(GOOD_DRAFT)
    del draft["mdx_body"]
    with patch("humanize.ANTHROPIC_KEY", "test-key"):
        with pytest.raises(HumanizeError, match="no mdx_body"):
            humanize(draft)


def test_humanize_raises_on_haiku_api_error():
    import httpx

    mock_resp = MagicMock()
    mock_resp.raise_for_status.side_effect = httpx.HTTPStatusError(
        "500", request=MagicMock(), response=MagicMock()
    )

    with patch("humanize.ANTHROPIC_KEY", "test-key"), \
         patch("humanize.httpx.post", return_value=mock_resp):
        with pytest.raises(HumanizeError, match="Haiku call failed"):
            humanize(copy.deepcopy(GOOD_DRAFT))


def test_humanize_raises_when_response_missing_mdx_body():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {
        "content": [{"type": "text", "text": json.dumps({"other_field": "value"})}]
    }

    with patch("humanize.ANTHROPIC_KEY", "test-key"), \
         patch("humanize.httpx.post", return_value=mock_resp):
        with pytest.raises(HumanizeError, match="missing mdx_body"):
            humanize(copy.deepcopy(GOOD_DRAFT))


def test_humanize_raises_on_empty_haiku_response(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {"content": []}  # no text block

    with patch("humanize.httpx.post", return_value=mock_resp):
        with pytest.raises(HumanizeError):
            humanize(copy.deepcopy(GOOD_DRAFT))


# ── length-swing guard ────────────────────────────────────────────────


def test_humanize_raises_when_rewrite_shrinks_too_much():
    # Original body has ~900 words; shrinking to 10 words is a 98% swing
    tiny_body = "# Title\n\nJust a few words."

    with patch("humanize.ANTHROPIC_KEY", "test-key"), \
         patch("humanize.httpx.post", return_value=_haiku_ok_response(tiny_body)):
        with pytest.raises(HumanizeError, match="length swing too big"):
            humanize(copy.deepcopy(GOOD_DRAFT))


def test_humanize_raises_when_rewrite_bloats_too_much():
    # Original ~900 words -> padding to 3000 words is a >200% swing
    bloated = GOOD_DRAFT["mdx_body"] + " extra word" * 2200

    with patch("humanize.ANTHROPIC_KEY", "test-key"), \
         patch("humanize.httpx.post", return_value=_haiku_ok_response(bloated)):
        with pytest.raises(HumanizeError, match="length swing too big"):
            humanize(copy.deepcopy(GOOD_DRAFT))


def test_humanize_accepts_rewrite_within_35_percent():
    # A 20% length expansion is within tolerance
    original_body = GOOD_DRAFT["mdx_body"]
    word_count = len(original_body.split())
    # Add 15% more words
    expanded = original_body + (" extra" * int(word_count * 0.15))

    with patch("humanize.ANTHROPIC_KEY", "test-key"), \
         patch("humanize.httpx.post", return_value=_haiku_ok_response(expanded)):
        result = humanize(copy.deepcopy(GOOD_DRAFT))

    assert result["mdx_body"] == expanded


# ── JSON extraction robustness ────────────────────────────────────────


def test_humanize_handles_haiku_wrapping_json_in_prose():
    """Haiku sometimes narrates 'Here is the rewrite: {...}' before the JSON.
    The extractor must find the first balanced {...} and parse it."""
    original_body = GOOD_DRAFT["mdx_body"]
    rewritten = original_body.replace("must publish", "must file")

    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {
        "content": [{"type": "text", "text": f"Here is the rewritten body:\n{json.dumps({'mdx_body': rewritten})}"}]
    }

    with patch("humanize.ANTHROPIC_KEY", "test-key"), \
         patch("humanize.httpx.post", return_value=mock_resp):
        result = humanize(copy.deepcopy(GOOD_DRAFT))

    assert result["mdx_body"] == rewritten
