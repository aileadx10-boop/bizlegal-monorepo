# Workflow 02 — Judge & Filter

**Trigger**: Called by 01_daily_scout and 07_monthly_ebook  
**Owner**: Python script → `tools/judge_dedup.py`  
**Agent**: Ollama `llama3.2:3b` (fast, deterministic)  
**Output**: Filtered + deduplicated item list

---

## Purpose

Prevent duplicate content from entering Supabase or being published. Score items for relevance and quality before they reach the writer or page builder. This is the quality gate — nothing passes without a judge score ≥ 0.65.

---

## Inputs

Raw array of scouted items (from 01 or manual input):

```json
[
  {
    "title": "string",
    "source_url": "string",
    "raw_text": "string",
    "category": "string",
    "published_at": "ISO 8601"
  }
]
```

---

## Process

```
1. Dedup check
   a. Hash (title + source_url) → check against seen_hashes.json
   b. Semantic similarity: compare title embedding against last 30 days of Supabase items
   c. If similarity > 0.85 → reject as duplicate

2. Relevance scoring (llama3.2:3b)
   Prompt: skills/scout-prompt.txt → "Score relevance 0–1 for fintech/crypto regulatory content"
   Fields scored:
     - relevance_score (0–1): Is this fintech/crypto/legal regulatory?
     - recency_score (0–1): Is this actionable NOW (< 30 days)?
     - specificity_score (0–1): Is this specific enough (not vague)?
     - combined = (relevance * 0.5) + (recency * 0.3) + (specificity * 0.2)

3. Threshold gate
   - combined ≥ 0.65 → PASS
   - combined < 0.65 → REJECT (log reason)

4. Risk classification
   - Extract: affected_jurisdictions, affected_products, risk_level (1–100)
   - risk_level = (relevance_score * 40) + (recency_score * 30) + manual_boost

5. Output
   - passed_items[] → caller (01_scout or 07_ebook)
   - rejected_items[] → gaps/YYYY-MM-DD-rejected.json
```

---

## Dedup Strategy

```python
# Hash-based fast dedup
import hashlib
def item_hash(item):
    key = f"{item['title'].lower().strip()}{item['source_url']}"
    return hashlib.sha256(key.encode()).hexdigest()[:16]

# Semantic dedup (optional, requires embeddings)
# Use cosine similarity on title embeddings
# Threshold: 0.85 = near-duplicate
```

---

## Output Schema

```json
{
  "passed": [
    {
      "original_item": {},
      "judge_scores": {
        "relevance": 0.82,
        "recency": 0.90,
        "specificity": 0.75,
        "combined": 0.845
      },
      "risk_level": 67,
      "affected_products": ["tracr", "brai"],
      "hash": "abc123de"
    }
  ],
  "rejected": [
    {
      "original_item": {},
      "reason": "duplicate|irrelevant|too_old|low_specificity",
      "combined_score": 0.42
    }
  ],
  "stats": {
    "total_input": 12,
    "passed": 8,
    "rejected": 4,
    "duplicates": 2
  }
}
```

---

## Success Criteria

- Dedup accuracy: < 1% false positives (real news rejected as duplicate)
- Processing time: < 10s per 50 items
- Rejection rate: 20–50% (if < 20%, sources may be too noisy; if > 50%, thresholds may be too strict)

---

## Learnings Log

| Date | Learning |
|---|---|
| — | Baseline |
