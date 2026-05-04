"""
Hetzner curator — factual review pass.

Auditor function: every claim of fact in mdx_body must be traceable
to a primary source in `draft['sources']`. The existing publisher.py
already does NUMERIC verification (dates, dollar amounts, deadlines).
This module covers the broader category — case names, statute citations,
named regulators, deadlines, jurisdiction-specific rules.

Why a separate Sonnet call (not Haiku):
  - Stakes are higher than humanize. A bad humanize = ugly prose.
    A bad factual review = we publish made-up enforcement that gets us
    sued.
  - Sonnet does substantially better at cross-referencing claim →
    source URL than Haiku. Worth the ~$0.30/article.

Failure mode (intentional): if any claim has no primary-source citation,
the article is REJECTED — pushed back to brain.py for retry with the
specific claim flagged. We do NOT auto-strip claims; that produces
half-articles. The agent has to rewrite with the citation or drop the
claim.

Public API:

    result = review(draft)
    if not result.all_claims_cited:
        # publisher.py raises before commit; bot.py nudges Telegram
        # with the specific issues for human override or retry
        raise FactualReviewError(result)

`primary source` = government, regulator, official guidance, court
filing, or peer-reviewed research. NOT a law firm blog, not a press
roundup, not Wikipedia. The audit prompt enforces this distinction.
"""
from __future__ import annotations

import json
import os
import re
import textwrap
from dataclasses import dataclass
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv()


# ── Config ────────────────────────────────────────────────────────
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_REVIEW_MODEL = os.getenv("ANTHROPIC_REVIEW_MODEL", "claude-sonnet-4-6")
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"

# Domains we trust as primary sources. Heuristic — Sonnet still does
# the actual classification, this is a backstop tightener.
PRIMARY_DOMAINS = (
    ".gov", ".gov.uk", ".eu", ".gov.eu", "europa.eu", ".gov.au",
    ".gov.ca", ".gov.sg", ".gov.uae", ".gov.il", ".gov.jp",
    "fincen.gov", "sec.gov", "cftc.gov", "ftc.gov", "treasury.gov",
    "fca.org.uk", "esma.europa.eu", "edpb.europa.eu",
    "nist.gov", "enisa.europa.eu", "nydfs.ny.gov",
    "supremecourt.gov", "uscourts.gov", "courtlistener.com",
)


REVIEW_PROMPT = textwrap.dedent("""
    You are a fact-checker for BizLegal-AI's regulatory intelligence
    desk. Your only job: confirm every factual claim in the article
    body is backed by a PRIMARY-SOURCE citation in the sources[] list.

    A "factual claim" is anything that could be wrong:
      - Statute citations (e.g. "18 U.S.C. § 1956", "Article 6 EU AI Act")
      - Dollar amounts in fines, penalties, settlements
      - Specific dates: enforcement actions, deadlines, effective dates
      - Named cases or named parties (companies, regulators, judges)
      - Jurisdiction-specific rules ("In Texas, ..." / "Under MiCA, ...")
      - Quoted regulator language

    A "primary source" is:
      ✅ Regulator website (.gov, .europa.eu, fca.org.uk, etc.)
      ✅ Court filing or judicial opinion
      ✅ Statute / regulation official text
      ✅ Government press release or enforcement action page
      ❌ Law firm blog
      ❌ News roundup (Reuters, Bloomberg, Coindesk, etc. — even when accurate)
      ❌ Wikipedia
      ❌ Industry whitepapers from non-regulators

    INPUTS:

    sources[] (URLs the drafter was given):
    {sources_block}

    mdx_body:
    {mdx_body}

    OUTPUT — STRICT JSON, single object, no code fences:
    {{
      "all_claims_cited": <true if every factual claim has a primary-source citation in sources[]; false otherwise>,
      "primary_source_count": <integer; how many sources[] are primary>,
      "issues": [
        {{
          "claim": "<the exact claim that has a problem, max 200 chars>",
          "issue": "<one of: missing_citation | non_primary_source | unverifiable | possibly_invented>",
          "suggested_action": "<one of: drop_claim | swap_to_primary_source | add_citation>",
          "suggested_url": "<URL of a primary source if you know one; empty string if you don't>"
        }}
      ]
    }}

    issues[] empty when all_claims_cited is true. Be strict.
""").strip()


# ── Public API ────────────────────────────────────────────────────
@dataclass
class ReviewResult:
    all_claims_cited: bool
    primary_source_count: int
    issues: list[dict[str, str]]
    raw: dict[str, Any]

    def block_messages(self) -> list[str]:
        """Format for Telegram nudge / publisher rejection."""
        if self.all_claims_cited:
            return []
        out = [f"factual review: {len(self.issues)} issue(s)"]
        for i, issue in enumerate(self.issues[:5], 1):
            out.append(
                f"  {i}. {issue.get('issue', '?')}: "
                f"{issue.get('claim', '')[:140]}…  "
                f"→ {issue.get('suggested_action', '?')}"
                + (f" (try {issue.get('suggested_url')})" if issue.get("suggested_url") else "")
            )
        if len(self.issues) > 5:
            out.append(f"  …and {len(self.issues) - 5} more")
        return out


class FactualReviewError(Exception):
    def __init__(self, result: ReviewResult):
        super().__init__("\n".join(result.block_messages()))
        self.result = result


def review(draft: dict) -> ReviewResult:
    """Calls Claude Sonnet to audit factual claims against sources[].

    Never raises — returns a ReviewResult. Caller decides what to do
    with `all_claims_cited == False`. (publisher.py raises FactualReviewError
    to abort the publish step; bot.py nudges Telegram for human override.)"""
    if not ANTHROPIC_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY not configured")
    body = draft.get("mdx_body", "")
    sources = draft.get("sources") or []
    sources_block = "\n".join(f"- {s}" for s in sources) if sources else "(none provided)"

    prompt = REVIEW_PROMPT.format(
        sources_block=sources_block,
        mdx_body=body,
    )
    response = _call_sonnet(prompt)

    return ReviewResult(
        all_claims_cited=bool(response.get("all_claims_cited")),
        primary_source_count=int(response.get("primary_source_count") or _count_primary(sources)),
        issues=list(response.get("issues") or []),
        raw=response,
    )


# ── Internals ─────────────────────────────────────────────────────
def _call_sonnet(prompt: str) -> dict:
    res = httpx.post(
        ANTHROPIC_URL,
        headers={
            "x-api-key": ANTHROPIC_KEY,
            "anthropic-version": ANTHROPIC_VERSION,
            "content-type": "application/json",
        },
        json={
            "model": ANTHROPIC_REVIEW_MODEL,
            "max_tokens": 4096,
            "temperature": 0.0,  # deterministic — fact-checking, not creative writing
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=120,
    )
    res.raise_for_status()
    body = res.json()
    text = next((c["text"] for c in body.get("content", []) if c.get("type") == "text"), "")
    if not text:
        raise RuntimeError("Sonnet empty response")
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


def _count_primary(sources: list[str]) -> int:
    count = 0
    for s in sources:
        if not isinstance(s, str):
            continue
        host = s.lower()
        if any(d in host for d in PRIMARY_DOMAINS):
            count += 1
    return count


# ── CLI for ad-hoc testing ────────────────────────────────────────
if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("usage: python factual_review.py path/to/draft.json", file=sys.stderr)
        sys.exit(2)
    with open(sys.argv[1], encoding="utf-8") as fh:
        draft = json.load(fh)
    result = review(draft)
    print(json.dumps(
        {
            "all_claims_cited": result.all_claims_cited,
            "primary_source_count": result.primary_source_count,
            "issue_count": len(result.issues),
            "issues": result.issues,
        },
        indent=2,
        ensure_ascii=False,
    ))
    sys.exit(0 if result.all_claims_cited else 1)
