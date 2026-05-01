# Workflow 01 — Daily Regulatory Scout

**Trigger**: Cron 06:00 UTC every weekday  
**Owner**: n8n → `daily_pipeline.json`  
**Agent**: Ollama `gemma2:9b` → Claude Haiku QA  
**Output**: Gap data in `gaps/YYYY-MM-DD.json` + Supabase `intelligence_items`

---

## Purpose

Discover, classify, and score new regulatory events across SEC, MiCA, VARA, FATF, FCA, MAS, GDPR, FinCEN every day. Feed the Intelligence Feed on bizlegal-ai.com and trigger downstream content/alert workflows.

---

## Inputs

| Source | Method | Frequency |
|---|---|---|
| SEC EDGAR RSS | HTTP GET | Daily |
| EUR-Lex CELLAR API | HTTP GET | Daily |
| VARA press releases | Crawlee scrape | Daily |
| FATF news | Crawlee scrape | Weekly |
| FCA enforcement | Crawlee scrape | Daily |
| MAS regulatory updates | HTTP GET | Daily |
| FinCEN advisories | HTTP GET | Weekly |

---

## Process

```
1. n8n fetches all sources (parallel HTTP nodes)
2. Raw items → deduplicate via judge_dedup.py
3. De-duped items → scout_ollama.py (gemma2:9b)
   - Classify: category, jurisdiction, risk_level (1–100)
   - Extract: affected_entities, key_dates, products_impacted
4. Scored items → writer_haiku_qa.py (llama3.2:3b)
   - Quality check: is_relevant, clarity_score > 0.7
5. Passed items → Supabase insert (intelligence_items table)
6. Failed items → gaps/YYYY-MM-DD-rejected.json
7. n8n triggers: 03_content_writer (if risk > 60) + 05_traffic_engine (SEO)
```

---

## Output Schema (intelligence_items)

```json
{
  "id": "uuid",
  "title": "string",
  "category": "SEC|MiCA|VARA|FATF|FCA|MAS|GDPR|FinCEN",
  "jurisdiction": "string",
  "risk_level": 0-100,
  "summary": "string (2-3 sentences)",
  "full_text": "string",
  "source_url": "string",
  "products_impacted": ["tracr", "brai", "lexaudit"],
  "key_dates": ["YYYY-MM-DD"],
  "published_at": "ISO 8601",
  "status": "draft|live|archived",
  "created_at": "ISO 8601"
}
```

---

## Error Handling

- Source unreachable → log to `logs/scout-errors.log`, skip source, continue
- Ollama timeout (>30s) → retry once, then fallback to rule-based classifier
- Supabase insert fail → write to `gaps/YYYY-MM-DD-failed.json` for manual review
- Duplicate detected → silently skip, increment dedup counter in log

---

## Success Criteria

- ≥ 3 new intelligence items per day
- Zero duplicate slugs in Supabase
- Risk scores within 1–100 range for all items
- Processing time < 5 minutes total

---

## Learnings Log

| Date | Learning |
|---|---|
| — | First run baseline |
