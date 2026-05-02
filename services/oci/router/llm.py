"""LLM dispatch: Anthropic Haiku 4.5 primary, Sonnet 4.6 escalation,
Gemini + OpenAI fallback chain. Returns parsed dict from <output> block."""
from __future__ import annotations

import json
import logging
import os
import re
from pathlib import Path
from typing import Any

import anthropic
import google.generativeai as genai
from openai import OpenAI

logger = logging.getLogger(__name__)

PROMPT_PATH = Path(__file__).parent / "prompts" / "router.txt"
HAIKU_MODEL = "claude-haiku-4-5"
SONNET_MODEL = "claude-sonnet-4-6"
ESCALATE_CLASSIFICATIONS = {"UAE_REAL_ESTATE", "EU_US_BUSINESS"}
CONFIDENCE_THRESHOLD = 0.7

OUTPUT_RE = re.compile(r"<output>\s*(\{[\s\S]*?\})\s*</output>", re.DOTALL)
# Truncated path: when the model stopped at </output> via stop_sequences,
# the closing tag is removed and we want everything from <output> to end.
OUTPUT_TRUNCATED_RE = re.compile(r"<output>\s*(\{[\s\S]*\})\s*\Z", re.DOTALL)
JSON_BLOCK_RE = re.compile(r"\{[\s\S]*?\}")


def _load_template() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


_TEMPLATE = _load_template()


def _render(lead_text: str) -> str:
    return _TEMPLATE.replace("{LEAD_TEXT}", lead_text.strip())


def _extract_output(text: str) -> dict[str, Any] | None:
    """Extract the JSON envelope. Handles three cases in order of preference:
       1. Full <output>...</output> block (model emitted closing tag)
       2. Truncated <output>{...}<EOF> (stop_sequences chopped off </output>)
       3. Any JSON block containing "classification" (fallback for Gemini/OpenAI)
    """
    full = OUTPUT_RE.findall(text)
    if full:
        return _try_parse(full[-1], text)
    trunc = OUTPUT_TRUNCATED_RE.search(text)
    if trunc:
        return _try_parse(trunc.group(1), text)
    parsed_candidates = []
    for m in JSON_BLOCK_RE.finditer(text):
        try:
            obj = json.loads(m.group(0))
        except json.JSONDecodeError:
            continue
        if isinstance(obj, dict) and (
            "classification" in obj or "output" in obj
        ):
            parsed_candidates.append(obj)
    if parsed_candidates:
        return parsed_candidates[-1]
    logger.warning("no output/JSON found; raw=%s", text[:400])
    return None


def _try_parse(blob: str, full_text: str) -> dict[str, Any] | None:
    try:
        return json.loads(blob)
    except json.JSONDecodeError as exc:
        logger.warning("output JSON parse failed: %s; raw=%s", exc, blob[:600])
        # Try the JSON-block scanner as a last resort
        for m in JSON_BLOCK_RE.finditer(full_text):
            try:
                obj = json.loads(m.group(0))
                if isinstance(obj, dict) and "classification" in obj:
                    return obj
            except json.JSONDecodeError:
                continue
        return None


def _anthropic_key() -> str:
    key = (
        os.environ.get("ANTHROPIC_API_KEY")
        or os.environ.get("ANTHROPIC_API_KEY_ENRICH")
    )
    if not key:
        raise RuntimeError("no Anthropic API key in environment")
    return key


def _call_anthropic(prompt: str, model: str, prefill: bool) -> tuple[str, str]:
    client = anthropic.Anthropic(api_key=_anthropic_key())
    messages: list[dict[str, Any]] = [{"role": "user", "content": prompt}]
    # Anthropic rejects assistant content ending in whitespace, so prefill
    # must be `<thinking>` exactly (no trailing newline).
    if prefill:
        messages.append({"role": "assistant", "content": "<thinking>"})
    resp = client.messages.create(
        model=model,
        max_tokens=6144,
        # Stop right after the JSON output so we don't waste tokens on
        # post-output narration. Extractor handles missing </output>.
        stop_sequences=["</output>"],
        messages=messages,
    )
    text = "".join(block.text for block in resp.content if hasattr(block, "text"))
    if prefill:
        text = "<thinking>" + text
    if resp.stop_reason == "stop_sequence":
        text = text + "</output>"
    logger.info(
        "[anthropic] model=%s stop=%s in=%s out=%s",
        model,
        resp.stop_reason,
        getattr(resp.usage, "input_tokens", "?"),
        getattr(resp.usage, "output_tokens", "?"),
    )
    return text, model


def _call_gemini(prompt: str) -> tuple[str, str]:
    api_key = (
        os.environ.get("GEMINI_API_KEY")
        or os.environ.get("GOOGLE_API_KEYNEW")
        or os.environ.get("GOOGLE_API_KEY")
        or os.environ.get("GEMINI_API_CONTENT_1")
        or os.environ.get("GEMINI_API_CONTENT_2")
    )
    if not api_key:
        raise RuntimeError("no Gemini API key in environment")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    resp = model.generate_content(prompt)
    return resp.text or "", "gemini-2.5-flash"


def _call_openai(prompt: str) -> tuple[str, str]:
    api_key = os.environ.get("NEW_OPENAI_KEY") or os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("no OpenAI API key in environment")
    client = OpenAI(api_key=api_key)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=6144,
    )
    return resp.choices[0].message.content or "", "gpt-4o-mini"


def classify(lead_text: str) -> dict[str, Any]:
    """Run a lead through the router. Returns the parsed Phase-1..3 envelope.

    Tries Anthropic Haiku 4.5 first; escalates to Sonnet 4.6 if confidence
    is below threshold AND classification is in revenue-affecting set.
    Falls back to Gemini, then OpenAI on Anthropic failure.
    """
    prompt = _render(lead_text)
    raw_text = ""
    model_used = "unknown"
    escalated = False
    parsed: dict[str, Any] | None = None
    last_err: Exception | None = None

    try:
        raw_text, model_used = _call_anthropic(prompt, HAIKU_MODEL, prefill=True)
        parsed = _extract_output(raw_text)
    except Exception as exc:
        last_err = exc
        logger.warning("Haiku call failed: %s", exc)

    if parsed is None:
        for fallback in (_call_gemini, _call_openai):
            try:
                raw_text, model_used = fallback(prompt)
                parsed = _extract_output(raw_text)
                if parsed is not None:
                    break
            except Exception as exc:
                last_err = exc
                logger.warning("fallback %s failed: %s", fallback.__name__, exc)
        if parsed is None:
            raise RuntimeError(f"all LLM providers failed; last error: {last_err}")

    output = parsed.get("output") or {}
    confidence = float(output.get("confidence") or 0)
    classification = output.get("classification") or "LOW_VALUE"
    if (
        confidence < CONFIDENCE_THRESHOLD
        and classification in ESCALATE_CLASSIFICATIONS
        and model_used == HAIKU_MODEL
    ):
        try:
            sonnet_text, sonnet_model = _call_anthropic(prompt, SONNET_MODEL, prefill=False)
            sonnet_parsed = _extract_output(sonnet_text)
            if sonnet_parsed is not None:
                parsed = sonnet_parsed
                raw_text = sonnet_text
                model_used = sonnet_model
                escalated = True
        except Exception as exc:
            logger.warning("Sonnet escalation failed; keeping Haiku result: %s", exc)

    parsed["_router_model"] = model_used
    parsed["_escalated_to_sonnet"] = escalated
    parsed["_raw_response"] = raw_text
    return parsed
