#!/usr/bin/env python3
"""
writer_draft.py — Content Draft Generator
Uses Ollama gemma2:9b to draft intelligence articles from scored regulatory items.
Reads prompt from skills/writer-prompt.txt.

Usage:
  python3 writer_draft.py --input gaps/judged-YYYY-MM-DD.json
  python3 writer_draft.py --item '{"title":"...","summary":"..."}'
"""

import json
import sys
import argparse
import logging
import re
import unicodedata
from datetime import date
from pathlib import Path
import requests

# ── Config ──────────────────────────────────────────────────
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma2:9b"
TIMEOUT = 90
SKILLS_DIR = Path("/opt/bizlegal/skills")
LOG_PATH = Path("/opt/bizlegal/logs/writer.log")
OUTPUT_DIR = Path("/opt/bizlegal/gaps")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [writer] %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, mode="a"),
        logging.StreamHandler(sys.stderr),
    ],
)
log = logging.getLogger("writer")

# ── Load base prompt ─────────────────────────────────────────
def load_writer_prompt() -> str:
    prompt_file = SKILLS_DIR / "writer-prompt.txt"
    if prompt_file.exists():
        return prompt_file.read_text()
    # Fallback inline prompt
    return """You are a regulatory intelligence writer for BizLegal AI.
Write a 700-900 word article based on the item below.
Structure: What Happened → Who Is Affected → Risk Assessment → What To Do Now → Expert Note
Tone: Analytical, authoritative. NOT legal advice — intelligence only.
End with a relevant product CTA.
Return ONLY valid JSON: {title, slug, meta_description, body_markdown, cta_product, cta_text, cta_href}
"""

# ── Slug generator ───────────────────────────────────────────
def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^\w\s-]", "", text.lower())
    text = re.sub(r"[-\s]+", "-", text).strip("-")
    return text[:80]

# ── CTA mapping ──────────────────────────────────────────────
PRODUCT_CTAS = {
    "tracr": ("Get a Blockchain Forensics Report", "/tracr"),
    "brai": ("Run a Wallet Risk Check", "/brai"),
    "lexaudit": ("Get Your Compliance Certificate", "/lexaudit"),
    "docai": ("Generate a Compliant Contract", "/docai"),
    "forge": ("Scan Your Business for Gaps", "/forge"),
    "leadforge": ("Find Compliance-Ready Leads", "/leadforge"),
}

def get_cta(products: list[str]) -> tuple[str, str, str]:
    for p in products:
        if p in PRODUCT_CTAS:
            text, href = PRODUCT_CTAS[p]
            return p, text, href
    return "hub", "Run Your Risk Assessment", "/risk-engine"

# ── Draft generation ─────────────────────────────────────────
def draft_article(item: dict) -> dict | None:
    base_prompt = load_writer_prompt()

    products = item.get("products_impacted", [])
    cta_product, cta_text, cta_href = get_cta(products)

    article_prompt = f"""{base_prompt}

ITEM TO WRITE:
Title: {item.get('title', '')}
Category: {item.get('category', '')}
Jurisdiction: {item.get('jurisdiction', '')}
Risk Level: {item.get('risk_level', 50)}/100
Summary: {item.get('summary', '')}
Full Text: {item.get('raw_text', item.get('full_text', ''))[:3000]}
Key Dates: {', '.join(item.get('key_dates', []))}
Products Impacted: {', '.join(products)}
Source URL: {item.get('source_url', '')}

CTA Product: {cta_product} → "{cta_text}" → {cta_href}

Return this exact JSON (no markdown fences, no extra text):
{{
  "title": "SEO-optimised headline (≤ 70 chars)",
  "slug": "url-friendly-slug-here",
  "meta_description": "SEO meta description (≤ 155 chars)",
  "body_markdown": "Full article in Markdown (700-900 words)",
  "cta_product": "{cta_product}",
  "cta_text": "{cta_text}",
  "cta_href": "{cta_href}",
  "word_count": <integer>
}}
"""

    payload = {
        "model": MODEL,
        "prompt": article_prompt,
        "stream": False,
        "options": {"temperature": 0.3, "num_predict": 1500},
    }

    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=TIMEOUT)
        r.raise_for_status()
        raw = r.json().get("response", "")

        json_match = re.search(r"\{[\s\S]*\}", raw)
        if not json_match:
            log.error(f"No JSON in writer response for: {item.get('title', '')[:60]}")
            return None

        draft = json.loads(json_match.group())

        # Ensure slug
        if not draft.get("slug"):
            draft["slug"] = slugify(draft.get("title", item.get("title", "unknown")))

        # Enrich with source metadata
        draft.update({
            "category": item.get("category"),
            "jurisdiction": item.get("jurisdiction"),
            "risk_level": item.get("risk_level"),
            "products_impacted": products,
            "source_url": item.get("source_url"),
            "key_dates": item.get("key_dates", []),
            "published_at": date.today().isoformat(),
            "status": "draft",
        })

        return draft

    except requests.Timeout:
        log.error(f"Writer timeout for: {item.get('title', '')[:60]}")
        return None
    except json.JSONDecodeError as e:
        log.error(f"JSON parse error: {e}")
        return None
    except Exception as e:
        log.error(f"Writer error: {e}")
        return None


# ── CLI ──────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="BizLegal Content Draft Writer")
    parser.add_argument("--input", type=str, help="Judged items JSON file")
    parser.add_argument("--item", type=str, help="Single item JSON string")
    parser.add_argument("--min-risk", type=int, default=0, help="Only draft items with risk >= this")
    args = parser.parse_args()

    if args.item:
        item = json.loads(args.item)
        draft = draft_article(item)
        print(json.dumps(draft, indent=2, ensure_ascii=False))
        return

    today = date.today().isoformat()
    input_path = Path(args.input or f"/opt/bizlegal/gaps/judged-{today}.json")

    if not input_path.exists():
        log.error(f"Input not found: {input_path}")
        sys.exit(1)

    with open(input_path) as f:
        data = json.load(f)

    items = data if isinstance(data, list) else data.get("passed", [])
    items = [i for i in items if i.get("risk_level", 0) >= args.min_risk]

    log.info(f"Writing {len(items)} articles")
    drafts = []

    for i, item in enumerate(items):
        log.info(f"Drafting {i+1}/{len(items)}: {item.get('title', '')[:60]}")
        draft = draft_article(item)
        if draft:
            drafts.append(draft)
            log.info(f"  ✓ slug={draft['slug']} words={draft.get('word_count', '?')}")
        else:
            log.warning(f"  ✗ Failed to draft")

    output_path = OUTPUT_DIR / f"drafts-{today}.json"
    with open(output_path, "w") as f:
        json.dump(drafts, f, indent=2, ensure_ascii=False)

    log.info(f"Done: {len(drafts)} drafts written to {output_path}")


if __name__ == "__main__":
    main()
