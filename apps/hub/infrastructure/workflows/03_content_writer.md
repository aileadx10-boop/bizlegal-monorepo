# Workflow 03 — Content Writer

**Trigger**: Called by 01_daily_scout (risk > 60) or manual  
**Owner**: `tools/writer_draft.py` → `tools/writer_haiku_qa.py`  
**Agent**: Ollama `gemma2:9b` (draft) → `llama3.2:3b` (QA) → Haiku (final polish optional)  
**Output**: Published blog post in Supabase `posts` table + GitHub commit

---

## Purpose

Turn a scouted regulatory event into a publish-ready intelligence article for bizlegal-ai.com/posts. The article must be factual, SEO-optimised, and include a product CTA.

---

## Inputs

```json
{
  "title": "string",
  "category": "SEC|MiCA|VARA|...",
  "summary": "string",
  "full_text": "string",
  "risk_level": 67,
  "jurisdiction": "string",
  "products_impacted": ["tracr", "brai"],
  "key_dates": ["2026-04-30"],
  "source_url": "string"
}
```

---

## Process

```
1. writer_draft.py (gemma2:9b)
   - Prompt: skills/writer-prompt.txt
   - Generate: title, slug, meta_description, H1, 3-5 H2 sections, conclusion
   - Add: regulatory_context, who_is_affected, what_to_do_now, expert_note
   - Word count: 600–900 words
   - Tone: analytical, authoritative, no legal advice hedge

2. writer_haiku_qa.py (llama3.2:3b)
   - Check: factual consistency (does article match source?)
   - Check: reading_grade (target: Grade 12–14, Flesch 40–60)
   - Check: CTA present and relevant to products_impacted?
   - Check: No hallucinated dates or regulatory citations
   - Score: quality_score 0–100 (must be ≥ 75 to publish)
   - If score < 75 → return to writer with feedback for revision

3. builder_github.py
   - Commit article as MDX to app/posts/[slug]/content.mdx
   - Trigger Vercel rebuild

4. Supabase insert
   - Table: posts
   - Status: live
   - Linked intelligence_item_id

5. Trigger: 05_traffic_engine (SEO ping) + 08_social_posting
```

---

## Article Template

```mdx
---
title: "{title}"
slug: "{slug}"
category: "{category}"
risk_level: {risk_level}
jurisdiction: "{jurisdiction}"
published_at: "{ISO 8601}"
products: ["{product1}", "{product2}"]
---

## What Happened

{2-3 paragraph factual summary}

## Who Is Affected

{bullet list of affected entities}

## Risk Assessment

**Risk Level: {risk_level}/100** — {risk_label}

{1 paragraph risk analysis}

## What You Should Do Now

{actionable steps bullet list}

## Expert Note

> {1-2 sentence authoritative commentary — hedged as analysis not legal advice}

---

**Related tools**: [{Product} →]({product_href})
```

---

## CTA Mapping

| Products Impacted | CTA Link |
|---|---|
| tracr | Get a Blockchain Forensics Report → /tracr |
| brai | Run a Wallet Risk Check → /brai |
| lexaudit | Get Your Compliance Certificate → /lexaudit |
| docai | Generate a Compliant Contract → /docai |
| forge | Scan Your Business for Gaps → /forge |
| all | Run Your Risk Assessment → /risk-engine |

---

## Success Criteria

- Quality score ≥ 75/100
- Word count: 600–900
- ≥ 1 product CTA per article
- Slug is URL-safe, unique in Supabase
- Published within 2 hours of scout trigger

---

## Learnings Log

| Date | Learning |
|---|---|
| — | Baseline |
