"""
Hetzner curator — humanize pass.

Takes a `draft` dict from brain.py (Claude Sonnet long-form output),
runs the body through Claude Haiku 4.5 with a strict humanize prompt,
returns a NEW dict with `mdx_body` rewritten. Preserves every other
field — citations, mermaid, hero_prompt, sources — untouched.

Why Haiku, not Sonnet:
  - 3-4× cheaper per call (~$0.10 vs ~$0.30 per article)
  - Plenty smart enough for "rewrite without semantic drift"
  - Faster (lower latency, more articles per hour at peak)

Why a separate pass instead of harder DRAFT_PROMPT:
  - Scoping. Humanize is one job. The drafting prompt already juggles
    sources, structure, anti-tells, citation discipline, agent CTAs,
    target routing. Adding more steering to it crashes the budget.
  - Auditability. We commit before/after diffs in the daily_gaps row
    so we can A/B compare "would this have ranked without humanize?".
  - Reversibility. If humanize ever degrades quality (model regresses,
    prompt drift), turn it off with one flag. The pre-humanize draft
    is still on disk.

Banned-phrase list intentionally overlaps with quality_gate.py — Haiku
gets explicit instruction here, quality_gate.py is the safety net.
"""
from __future__ import annotations

import json
import os
import re
import textwrap

import httpx
from dotenv import load_dotenv

load_dotenv()


# ── Config ────────────────────────────────────────────────────────
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_HUMANIZE_MODEL = os.getenv(
    "ANTHROPIC_HUMANIZE_MODEL", "claude-haiku-4-5-20251001"
)
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"

HUMANIZE_PROMPT = textwrap.dedent("""
    You are a senior compliance editor at BizLegal-AI. Your job: take
    the draft below and rewrite ONLY the `mdx_body` so it reads like a
    human practitioner wrote it, not an AI.

    HARD RULES (every one is a fail):
      1. Keep the H1, every H2, and every H3 exactly as-is.
      2. Keep all citations, all linked URLs, all numeric claims unchanged.
      3. Keep the same overall length within 15% of original word count
         (the post-pass sanity check tolerates up to 35%, but stay tight).
      4. Keep all the agent CTAs (e.g. links to bizlegal-ai.com/agents/*)
         exactly as the source draft has them.
      5. Keep all code fences (```mermaid ...```, ```python ...```) untouched.
      6. Do NOT introduce new claims, facts, dates, or names.

    THINGS TO KILL (fail-fast if any survive):
      "it's important to note", "moreover,", "furthermore,",
      "in conclusion", "navigating the landscape", "delve into",
      "dive deep", "in today's rapidly evolving", "the world of",
      "tapestry", "rapidly changing", "it is crucial to understand"

    THINGS TO ADD (per H2 section, exactly one of):
      - A practitioner aside: "In practice, ...", "What this means
        for a 5-attorney boutique:", "The litigation we've seen most:"
      - A specific micro-example with an invented company name only IF
        the source draft already has invented examples; otherwise stick
        to documented cases the source already cites.
      - A short "Watch out:" / "Edge case:" sentence highlighting a
        non-obvious mistake.

    THINGS TO TIGHTEN:
      - Vary sentence length (1-5 sentences per paragraph, mix short + long).
      - Use contractions naturally ("can't", "won't", "we've seen").
      - Vary sentence openings (no two consecutive sentences with the
        same subject).
      - Trim filler. If a sentence doesn't add a fact, opinion, or
        warning, delete it.
      - Em-dash density: max 3 per 1000 words.

    OUTPUT — STRICT JSON, single object, no code fences, no prose wrapper:
    {{
      "mdx_body": "<the rewritten body, fully preserved structure>"
    }}

    === SOURCE DRAFT ===
    Title: {title}
    Slug: {slug}
    Vertical/Regulation: {vertical} / {regulation_tag}

    --- mdx_body ---
    {mdx_body}
    === END SOURCE ===
""").strip()


# ── Public API ────────────────────────────────────────────────────
class HumanizeError(Exception):
    pass


def humanize(draft: dict) -> dict:
    """Returns a NEW dict with mdx_body rewritten. Original dict is
    never mutated. Raises HumanizeError on any structural failure;
    callers should fall back to the original draft on failure (don't
    crash the pipeline because Haiku had a hiccup)."""
    if not ANTHROPIC_KEY:
        raise HumanizeError("ANTHROPIC_API_KEY not configured")
    body = draft.get("mdx_body", "")
    if not body:
        raise HumanizeError("draft has no mdx_body to humanize")

    # Escape any literal { } in the article body before calling .format() so
    # Python doesn't try to parse MDX content / JSON examples as format keys.
    # The HUMANIZE_PROMPT already uses {{ }} for its JSON output example,
    # which .format() converts back to { } after substitution.
    safe_body = body.replace("{", "{{").replace("}", "}}")
    prompt = HUMANIZE_PROMPT.format(
        title=draft.get("title", ""),
        slug=draft.get("slug", ""),
        vertical=draft.get("vertical", "") or draft.get("category", ""),
        regulation_tag=draft.get("regulation_tag", ""),
        mdx_body=safe_body,
    )

    try:
        rewritten = _call_haiku(prompt)
    except Exception as err:
        raise HumanizeError(f"Haiku call failed: {err}") from err

    new_body = rewritten.get("mdx_body")
    if not new_body or not isinstance(new_body, str):
        raise HumanizeError("Haiku response missing mdx_body")

    # Sanity check: length within 35% of original. Prompt asks for
    # ≤15% but Haiku occasionally rewrites with more conversational
    # asides (which is the whole point) and the natural rewrite swings
    # 15-30%. 35% is the "something went really wrong" boundary.
    # Caller catches HumanizeError and falls back to original draft;
    # quality_gate then catches surviving AI-tells either way.
    orig_words = len(re.findall(r"\b\w+\b", body))
    new_words = len(re.findall(r"\b\w+\b", new_body))
    if orig_words and abs(new_words - orig_words) / orig_words > 0.35:
        raise HumanizeError(
            f"length swing too big: {orig_words} -> {new_words} words "
            f"({abs(new_words - orig_words) / orig_words * 100:.0f}%)"
        )

    out = dict(draft)  # shallow copy is fine; we only replace mdx_body
    out["mdx_body"] = new_body
    out["_humanized"] = True
    return out


# ── Anthropic call ────────────────────────────────────────────────
def _call_haiku(prompt: str) -> dict:
    res = httpx.post(
        ANTHROPIC_URL,
        headers={
            "x-api-key": ANTHROPIC_KEY,
            "anthropic-version": ANTHROPIC_VERSION,
            "content-type": "application/json",
        },
        json={
            "model": ANTHROPIC_HUMANIZE_MODEL,
            "max_tokens": 8192,
            # 0.2 — tight enough that Haiku follows the "≤15% length swing"
            # rule reliably; loose enough to actually vary sentence openings.
            # 0.4 (the original) was producing 25-30% length blowouts that
            # tripped the post-pass sanity check and silently fell back to
            # the un-humanized Sonnet draft.
            "temperature": 0.2,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=120,
    )
    res.raise_for_status()
    body = res.json()
    text = next((c["text"] for c in body.get("content", []) if c.get("type") == "text"), "")
    if not text:
        raise RuntimeError("Haiku empty response")
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)
    # Defensive: if Haiku narrates before the JSON ("Here's the rewrite: {...}"),
    # extract the first balanced {...} block. Rare at temp=0.2 but cheap
    # to guard. Same pattern in factual_review.py._call_sonnet.
    m = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if m:
        cleaned = m.group(0)
    return json.loads(cleaned)


# ── CLI for ad-hoc testing ────────────────────────────────────────
if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("usage: python humanize.py path/to/draft.json", file=sys.stderr)
        sys.exit(2)
    with open(sys.argv[1], encoding="utf-8") as fh:
        draft = json.load(fh)
    out = humanize(draft)
    json.dump(out, sys.stdout, indent=2, ensure_ascii=False)
