#!/usr/bin/env python3
"""
judge_dedup.py — Judge & Deduplication Filter
Removes duplicates and scores items for relevance before writer or DB insertion.
Uses llama3.2:3b for fast scoring.

Usage:
  python3 judge_dedup.py --input gaps/scored-YYYY-MM-DD.json --output gaps/judged-YYYY-MM-DD.json
"""

import json
import sys
import argparse
import hashlib
import logging
from datetime import date, timedelta
from pathlib import Path
import requests
import os

# ── Config ──────────────────────────────────────────────────
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2:3b"
TIMEOUT = 20
SEEN_HASHES_FILE = Path("/opt/bizlegal/gaps/seen_hashes.json")
LOG_PATH = Path("/opt/bizlegal/logs/judge.log")
RELEVANCE_THRESHOLD = 0.65

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [judge] %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, mode="a"),
        logging.StreamHandler(sys.stderr),
    ],
)
log = logging.getLogger("judge")

JUDGE_PROMPT = """Score this regulatory news item for quality. Return ONLY JSON, no explanation.

Title: {title}
Summary: {summary}
Category: {category}

Return:
{{
  "relevance_score": <0.0-1.0, is this fintech/crypto/legal regulatory?>,
  "recency_score": <0.0-1.0, is this actionable in next 30 days?>,
  "specificity_score": <0.0-1.0, is this specific enough to act on?>,
  "pass": <true|false, combined weighted score >= 0.65>
}}
"""

# ── Hash dedup ───────────────────────────────────────────────
def load_seen_hashes() -> set:
    if SEEN_HASHES_FILE.exists():
        with open(SEEN_HASHES_FILE) as f:
            data = json.load(f)
        # Keep only last 90 days
        cutoff = (date.today() - timedelta(days=90)).isoformat()
        return {h for h, d in data.items() if d >= cutoff}
    return set()


def save_seen_hashes(hashes: dict):
    SEEN_HASHES_FILE.parent.mkdir(parents=True, exist_ok=True)
    existing = {}
    if SEEN_HASHES_FILE.exists():
        with open(SEEN_HASHES_FILE) as f:
            existing = json.load(f)
    existing.update(hashes)
    with open(SEEN_HASHES_FILE, "w") as f:
        json.dump(existing, f)


def item_hash(item: dict) -> str:
    title = item.get("title", "").lower().strip()
    url = item.get("source_url", "")
    key = f"{title}{url}"
    return hashlib.sha256(key.encode()).hexdigest()[:16]


# ── Relevance scoring ────────────────────────────────────────
def score_item(item: dict) -> dict:
    prompt = JUDGE_PROMPT.format(
        title=item.get("title", "")[:200],
        summary=item.get("summary", item.get("raw_text", ""))[:400],
        category=item.get("category", "UNKNOWN"),
    )

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.0, "num_predict": 128},
    }

    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=TIMEOUT)
        r.raise_for_status()
        raw = r.json().get("response", "")

        import re
        json_match = re.search(r"\{[\s\S]*\}", raw)
        if not json_match:
            return {"relevance_score": 0.5, "recency_score": 0.5, "specificity_score": 0.5, "pass": True}

        scores = json.loads(json_match.group())
        combined = (
            scores.get("relevance_score", 0.5) * 0.5
            + scores.get("recency_score", 0.5) * 0.3
            + scores.get("specificity_score", 0.5) * 0.2
        )
        scores["combined"] = round(combined, 3)
        scores["pass"] = combined >= RELEVANCE_THRESHOLD
        return scores

    except Exception as e:
        log.warning(f"Scoring error: {e} — defaulting to pass")
        return {"relevance_score": 0.5, "recency_score": 0.5, "specificity_score": 0.5, "combined": 0.5, "pass": True}


# ── Main pipeline ────────────────────────────────────────────
def judge_items(items: list[dict]) -> dict:
    seen = load_seen_hashes()
    new_hashes = {}

    passed = []
    rejected = []

    for item in items:
        h = item_hash(item)

        # 1. Hash dedup
        if h in seen:
            rejected.append({**item, "reject_reason": "duplicate_hash", "hash": h})
            log.info(f"  DEDUP: {item.get('title', '')[:60]}")
            continue

        # 2. Relevance scoring
        scores = score_item(item)

        if scores.get("pass", True):
            passed.append({
                **item,
                "judge_scores": scores,
                "hash": h,
            })
            new_hashes[h] = date.today().isoformat()
            log.info(f"  PASS (combined={scores.get('combined', '?')}): {item.get('title', '')[:60]}")
        else:
            rejected.append({
                **item,
                "reject_reason": "low_relevance",
                "judge_scores": scores,
                "hash": h,
            })
            log.info(f"  REJECT (combined={scores.get('combined', '?')}): {item.get('title', '')[:60]}")

    # Persist hashes for future dedup
    save_seen_hashes(new_hashes)

    return {
        "date": date.today().isoformat(),
        "passed": passed,
        "rejected": rejected,
        "stats": {
            "total_input": len(items),
            "passed": len(passed),
            "rejected": len(rejected),
            "deduped": sum(1 for r in rejected if r.get("reject_reason") == "duplicate_hash"),
        },
    }


# ── CLI ──────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="BizLegal Judge & Dedup Filter")
    parser.add_argument("--input", type=str, help="Input JSON file (scored items)")
    parser.add_argument("--output", type=str, help="Output JSON file")
    parser.add_argument("--threshold", type=float, default=RELEVANCE_THRESHOLD,
                        help=f"Relevance threshold (default {RELEVANCE_THRESHOLD})")
    args = parser.parse_args()

    global RELEVANCE_THRESHOLD
    RELEVANCE_THRESHOLD = args.threshold

    today = date.today().isoformat()
    input_path = Path(args.input or f"/opt/bizlegal/gaps/scored-{today}.json")

    if not input_path.exists():
        log.error(f"Input not found: {input_path}")
        sys.exit(1)

    with open(input_path) as f:
        data = json.load(f)

    # Accept both array and {passed: [...]} format
    items = data if isinstance(data, list) else data.get("passed", [])
    log.info(f"Judging {len(items)} items")

    results = judge_items(items)

    output_path = Path(args.output or str(input_path).replace("scored-", "judged-"))
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    log.info(
        f"Done: {results['stats']['passed']} passed, "
        f"{results['stats']['deduped']} deduped, "
        f"{results['stats']['rejected']} total rejected"
    )
    log.info(f"Output: {output_path}")

    if results["stats"]["passed"] == 0:
        sys.exit(2)


if __name__ == "__main__":
    main()
