"""Smoke tests: prompt loads, output extractor handles edge cases."""
from pathlib import Path

import llm


def test_prompt_template_loads():
    text = (Path(__file__).resolve().parents[1] / "prompts" / "router.txt").read_text(encoding="utf-8")
    assert "{LEAD_TEXT}" in text
    assert "<output_schema>" in text
    assert "v1.0.0-p1" in text


def test_extract_output_takes_last_block():
    sample = (
        "<thinking>analysis here</thinking>\n"
        '<output>{"a": 1}</output>\n'
        '<output>{"a": 2, "classification": "LOW_VALUE"}</output>'
    )
    parsed = llm._extract_output(sample)
    assert parsed == {"a": 2, "classification": "LOW_VALUE"}


def test_extract_output_returns_none_on_garbage():
    assert llm._extract_output("no tags here") is None
    assert llm._extract_output("<output>not json</output>") is None


def test_render_substitutes_lead_text():
    rendered = llm._render("Hello world")
    assert "Hello world" in rendered
    assert "{LEAD_TEXT}" not in rendered
