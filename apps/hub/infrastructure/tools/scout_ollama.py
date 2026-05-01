#!/usr/bin/env python3
"""
scout_ollama.py — Daily Regulatory Scout
Uses Ollama gemma2:9b to classify, score, and enrich raw regulatory items.
Called by n8n daily_pipeline.json after fetching source data.

Usage:
  python3 scout_ollama.py --input gaps/raw-YYYY-MM-DD.json --output gaps/scored-YYYY-MM-DD.json
  echo '{"title":"...","text":"..."}' | python3 scout_ollama.py --stdin
"""

import json
import sys
import argparse
import logging
from datetime import date
from pathlib import Path
import requests
import re

# ── Config ──────────────────────────────────────────────────
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma2:9b"
TIMEOUT = 45
LOG_PATH = Path("/opt/bizlegal/logs/scout.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [scout] %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, mode="a"),
        logging.StreamHandler(sys.stderr),
    ],
)
log = logging.getLogger("scout")

# ── Prompt ──────────────────────────────────────────────────
SCOUT_PROMPT = """You are a regulatory intelligence analyst for a fintech/crypto compliance platform.

Analyze the following regulatory item and return ONLY valid JSON — no markdown, no explanation.

Item:
TITLE: {title}
TEXT: {text}
SOURCE: {source_url}

Return this exact JSON structure:
{{
  "category": "SEC|MiCA|VARA|FATF|FCA|MAS|GDPR|FinCEN|OTHER",
  "jurisdiction": "US|EU|UAE|SG|UK|GLOBAL|[other ISO country]",
  "risk_level": <integer 1-100>,
  "summary": "<2-3 sentence factual summary>",
  "affected_entities": ["VASPs", "exchanges", "stablecoins", ...],
  "products_impacted": ["tracr", "brai", "lexaudit", "docai", "forge", "leadforge"],
  "key_dates": ["YYYY-MM-DD"],
  "is_relevant": <true|false>,
  "relevance_reason": "<one sentence>"
}}

Risk level guide:
  90-100: Immediate enforcement / hard deadline < 30 days
  70-89:  Major regulatory change, broad impact
  50-69:  New guidance / moderate impact
  30-49:  Consultation / proposed rule
  1-29:   Low-impact / general news
"""

# ── Core ────────────────────────────────────────────────────
def classify_item(item: dict) -> dict | None:
    prompt = SCOUT_PROMPT.format(
        title=item.get("title", "")[:300],
        text=item.get("raw_text", item.get("text", ""))[:2000],
        source_url=item.get("source_url", ""),
    )

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.1, "num_predict": 512},
    }

    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=TIMEOUT)
        r.raise_for_status()
        raw = r.json().get("response", "")

        # Extract JSON from response (handle any surrounding text)
        json_match = re.search(r"\{[\s\S]*\}", raw)
        if not json_match:
            log.warning(f"No JSON found in response for: {item.get('title', '')[:60]}")
            return None

        result = json.loads(json_match.group())

        # Validate required fields
        required = ["category", "jurisdiction", "risk_level", "summary", "is_relevant"]
        if not all(k in result for k in required):
            log.warning(f"Missing fields in result for: {item.get('title', '')[:60]}")
            return None

        # Merge with original item
        return {
            **item,
            "classified": result,
            "category": result["category"],
            "jurisdiction": result["jurisdiction"],
            "risk_level": int(result["risk_level"]),
            "summary": result["summary"],
            "affected_entities": result.get("affected_entities", []),
            "products_impacted": result.get("products_impacted", []),
            "key_dates": result.get("key_dates", []),
            "is_relevant": result.get("is_relevant", True),
        }

    except requests.Timeout:
        log.error(f"Ollama timeout for: {item.get('title', '')[:60]}")
        return None
    except json.JSONDecodeError as e:
        log.error(f"JSON parse error: {e} — raw: {raw[:200]}")
        return None
    except Exception as e:
        log.error(f"Unexpected error: {e}")
        return None


def process_batch(items: list[dict]) -> dict:
    passed = []
    failed = []

    for i, item in enumerate(items):
        log.info(f"Processing {i+1}/{len(items)}: {item.get('title', '')[:60]}")
        result = classify_item(item)

        if result and result.get("is_relevant", False):
            passed.append(result)
            log.info(f"  ✓ risk={result['risk_level']} cat={result['category']}")
        else:
            failed.append({"item": item, "reason": "not_relevant" if result else "processing_error"})
            log.info(f"  ✗ rejected")

    return {
        "date": date.today().isoformat(),
        "passed": passed,
        "failed": failed,
        "stats": {
            "total": len(items),
            "passed": len(passed),
            "failed": len(failed),
        },
    }


# ── CLI ──────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="BizLegal Regulatory Scout (Ollama)")
    parser.add_argument("--input", type=str, help="Input JSON file path")
    parser.add_argument("--output", type=str, help="Output JSON file path")
    parser.add_argument("--stdin", action="store_true", help="Read single item from stdin")
    args = parser.parse_args()

    if args.stdin:
        raw = sys.stdin.read()
        item = json.loads(raw)
        result = classify_item(item)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return

    if not args.input:
        today = date.today().isoformat()
        args.input = f"/opt/bizlegal/gaps/raw-{today}.json"

    input_path = Path(args.input)
    if not input_path.exists():
        log.error(f"Input file not found: {input_path}")
        sys.exit(1)

    with open(input_path) as f:
        items = json.load(f)

    log.info(f"Processing {len(items)} items from {input_path}")
    results = process_batch(items)

    output_path = args.output or args.input.replace("raw-", "scored-")
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    log.info(f"Done: {results['stats']['passed']} passed, {results['stats']['failed']} failed")
    log.info(f"Output: {output_path}")

    # Exit with error code if nothing passed (alert n8n)
    if results["stats"]["passed"] == 0:
        sys.exit(2)


if __name__ == "__main__":
    main()
