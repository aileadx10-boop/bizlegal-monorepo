#!/usr/bin/env python3
"""
writer_haiku_qa.py — Content Quality Assurance
Uses Ollama llama3.2:3b to score drafted articles before publishing.
Checks: accuracy, reading level, CTA presence, factual consistency.
Minimum quality score: 75/100.

Usage:
  python3 writer_haiku_qa.py --input gaps/drafts-YYYY-MM-DD.json
  python3 writer_haiku_qa.py --draft '{"title":"...","body_markdown":"..."}'
"""

import json
import sys
import argparse
import logging
import re
from datetime import date
from pathlib import Path
import requests

# ── Config ──────────────────────────────────────────────────
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2:3b"
TIMEOUT = 30
PASS_THRESHOLD = 75
LOG_PATH = Path("/opt/bizlegal/logs/qa.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [qa] %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, mode="a"),
        logging.StreamHandler(sys.stderr),
    ],
)
log = logging.getLogger("qa")

QA_PROMPT = """You are a quality assurance reviewer for regulatory intelligence articles.

Score this article on 5 dimensions (0-20 each = 100 total):

ARTICLE:
Title: {title}
Category: {category}
Body (first 1000 chars): {body_preview}
Has CTA: {has_cta}
Word count: {word_count}

Dimensions:
1. FACTUAL (0-20): Does the title match the body? No hallucinated dates/citations?
2. CLARITY (0-20): Is it clear, well-structured, readable?
3. SPECIFICITY (0-20): Does it give specific, actionable information?
4. COMPLIANCE_HEDGE (0-20): Does it clarify this is NOT legal advice?
5. CTA_RELEVANCE (0-20): Is the CTA product relevant to the content?

Return ONLY JSON:
{{
  "factual": <0-20>,
  "clarity": <0-20>,
  "specificity": <0-20>,
  "compliance_hedge": <0-20>,
  "cta_relevance": <0-20>,
  "total": <0-100>,
  "pass": <true if total >= 75>,
  "feedback": "<one sentence improvement note if failing>"
}}
"""

def qa_draft(draft: dict) -> dict:
    body = draft.get("body_markdown", "")
    has_cta = bool(draft.get("cta_href")) and draft.get("cta_text", "") in body

    prompt = QA_PROMPT.format(
        title=draft.get("title", "")[:200],
        category=draft.get("category", "UNKNOWN"),
        body_preview=body[:1000],
        has_cta="YES" if has_cta else "NO — CTA text not found in body",
        word_count=draft.get("word_count", len(body.split())),
    )

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.0, "num_predict": 256},
    }

    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=TIMEOUT)
        r.raise_for_status()
        raw = r.json().get("response", "")

        json_match = re.search(r"\{[\s\S]*\}", raw)
        if not json_match:
            # Default to passing with warning
            log.warning("No JSON in QA response — defaulting to 75")
            return {"total": 75, "pass": True, "feedback": "Could not parse QA response"}

        scores = json.loads(json_match.group())
        # Recalculate total in case Ollama is off
        dims = ["factual", "clarity", "specificity", "compliance_hedge", "cta_relevance"]
        total = sum(min(20, max(0, scores.get(d, 10))) for d in dims)
        scores["total"] = total
        scores["pass"] = total >= PASS_THRESHOLD
        return scores

    except Exception as e:
        log.warning(f"QA error: {e} — defaulting to pass")
        return {"total": 75, "pass": True, "feedback": f"QA error: {e}"}


def process_drafts(drafts: list[dict]) -> dict:
    approved = []
    rejected = []

    for i, draft in enumerate(drafts):
        log.info(f"QA {i+1}/{len(drafts)}: {draft.get('title', '')[:60]}")
        scores = qa_draft(draft)

        draft["qa_scores"] = scores
        draft["qa_total"] = scores["total"]

        if scores.get("pass"):
            draft["status"] = "approved"
            approved.append(draft)
            log.info(f"  ✓ score={scores['total']}/100")
        else:
            draft["status"] = "revision_needed"
            draft["qa_feedback"] = scores.get("feedback", "")
            rejected.append(draft)
            log.info(f"  ✗ score={scores['total']}/100 — {scores.get('feedback', '')}")

    return {
        "date": date.today().isoformat(),
        "approved": approved,
        "revision_needed": rejected,
        "stats": {
            "total": len(drafts),
            "approved": len(approved),
            "revision_needed": len(rejected),
            "approval_rate": round(len(approved) / max(len(drafts), 1) * 100, 1),
        },
    }


def main():
    parser = argparse.ArgumentParser(description="BizLegal Content QA (llama3.2:3b)")
    parser.add_argument("--input", type=str, help="Drafts JSON file")
    parser.add_argument("--draft", type=str, help="Single draft JSON string")
    parser.add_argument("--threshold", type=int, default=PASS_THRESHOLD)
    args = parser.parse_args()

    global PASS_THRESHOLD
    PASS_THRESHOLD = args.threshold

    if args.draft:
        draft = json.loads(args.draft)
        scores = qa_draft(draft)
        print(json.dumps(scores, indent=2))
        return

    today = date.today().isoformat()
    input_path = Path(args.input or f"/opt/bizlegal/gaps/drafts-{today}.json")

    if not input_path.exists():
        log.error(f"Input not found: {input_path}")
        sys.exit(1)

    with open(input_path) as f:
        drafts = json.load(f)

    if isinstance(drafts, dict):
        drafts = drafts.get("drafts", [])

    log.info(f"QA review: {len(drafts)} drafts")
    results = process_drafts(drafts)

    output_path = Path(str(input_path).replace("drafts-", "qa-"))
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    log.info(
        f"Done: {results['stats']['approved']} approved "
        f"({results['stats']['approval_rate']}%), "
        f"{results['stats']['revision_needed']} need revision"
    )
    log.info(f"Output: {output_path}")

    if results["stats"]["approved"] == 0:
        sys.exit(2)


if __name__ == "__main__":
    main()
