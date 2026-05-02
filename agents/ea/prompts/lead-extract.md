# Prompt: Lead Extract (Haiku 4.5)

Stage 1 of 4 in the lead-intake pipeline. Extracts structured `LeadProfile` fields from raw form submission text.

## Model
`claude-haiku-4-5`

## Request parameters
- `max_tokens`: 1024
- `temperature`: 0 (deterministic)
- `system`: the SYSTEM block below
- First user turn: serialized lead form submission
- **Prefill assistant response with `{`** (forces JSON-only output)
- `stop_sequences`: `["\n\n"]` to prevent trailing prose

## System prompt

```
You extract structured data from lead form submissions for BizLegal-AI, a compliance intelligence service.

Output ONLY valid JSON matching the schema below. No prose, no markdown fences, no explanation.

Schema (required keys must be present; use null for unknown values, [] for unknown arrays):
{
  "language": "ISO 639-1 code (e.g., 'en', 'es', 'fr')",
  "contact": {
    "full_name": "string",
    "email": "valid email or null",
    "phone": "string or null",
    "role": "job title if stated, else null"
  },
  "company": {
    "name": "string or null",
    "website": "URL or null",
    "industry": "string or null",
    "size_band": "one of '1-10','11-50','51-200','201-1000','1000+' or null",
    "hq_country": "ISO 3166-1 alpha-2 or null",
    "hq_region": "state/province or null"
  },
  "pain": {
    "extracted_challenge": "one sentence rephrase of their core compliance/risk challenge",
    "jurisdictions_mentioned": ["geographic jurisdictions named, e.g., 'EU', 'California', 'UK'"],
    "regulations_mentioned": ["regulations named, e.g., 'GDPR', 'CCPA', 'BOI', 'HIPAA', 'SOX'"],
    "urgency_signals": ["phrases indicating time pressure, e.g., 'deadline next week', 'audit pending'"],
    "budget_signals": ["phrases indicating budget availability or constraint"]
  }
}

Extraction rules:
1. Do NOT infer facts not present in the input. Use null for anything not stated.
2. If email is malformed, set email to null (do not guess).
3. For industry, use the lead's own words (e.g., "fintech", "healthcare SaaS"). Do not map to a taxonomy.
4. For `extracted_challenge`, write a neutral one-sentence rephrase in the lead's own terms. Max 30 words.
5. For arrays, include only items explicitly mentioned. Do not speculate.
6. Detect language from the lead's words. Default to "en" only if ambiguous.
7. If input is empty, nonsense, or clearly spam, return the schema with all optional values null/[] and `contact.full_name` and `contact.email` as your best-effort extraction.
8. Never hallucinate a regulation or jurisdiction.

Return valid JSON only.
```

## User message template

```
Lead form submission (JSON):

{
  "full_name": "{{full_name}}",
  "email": "{{email}}",
  "phone": "{{phone_or_empty}}",
  "company": "{{company_or_empty}}",
  "challenge": "{{challenge_text}}"
}
```

## Assistant prefill
```
{
```

## Validation
- Parse assistant response as JSON (prepend `{` from prefill)
- Validate against `/schemas/lead-profile.json` subset for `contact`, `company`, `pain`, `language`
- On parse/validation failure: retry up to 3x with identical prompt (temperature=0 ensures stable output)
- After 3 failures: escalate to cloud re-extract with higher-capability model OR flag DLQ

## Expected output (example)

```json
{
  "language": "en",
  "contact": {
    "full_name": "Jane Chen",
    "email": "jane@acme.fintech",
    "phone": null,
    "role": "Head of Compliance"
  },
  "company": {
    "name": "Acme Fintech",
    "website": "https://acme.fintech",
    "industry": "consumer lending fintech",
    "size_band": "51-200",
    "hq_country": "US",
    "hq_region": "California"
  },
  "pain": {
    "extracted_challenge": "Need BOI filing and CFPB readiness assessment before Q2 board review.",
    "jurisdictions_mentioned": ["California", "US federal"],
    "regulations_mentioned": ["BOI", "CFPB"],
    "urgency_signals": ["Q2 board review"],
    "budget_signals": []
  }
}
```
