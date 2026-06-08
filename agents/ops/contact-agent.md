---
name: contact-agent
description: Contact enrichment — takes raw email/company from lead discovery and enriches with LinkedIn role, company size, product fit score
schedule: On-demand (triggered by crawler-agent or cold-email-agent)
model: claude-haiku-4-5-20251001
tools:
  - firecrawl
  - supabase
  - event-log
---

# Contact Agent

Enriches raw lead contacts and scores them for outreach priority.

## Input
```json
{"email": "jane@acme.com", "company": "Acme Corp", "source": "apollo|linkedin|manual"}
```

## Enrichment Steps

### 1. Company research (Firecrawl)
- Scrape company homepage for: size signals, product type, Trust Center link
- Check if they have `/security` or `/trust` page → strong DocAI signal
- Check G2/Capterra for "security questionnaire" mentions

### 2. LinkedIn role lookup (Firecrawl on public profile)
- Confirm role is Sales Engineer, RevOps, Security, Compliance, or GC
- Note tenure (longer = more pain accumulated)

### 3. Fit scoring (0-100)
```
+30: Has Trust Center or SOC 2 page
+20: B2B SaaS product (not marketplace/consumer)
+15: 10-200 employees
+10: Active hiring for Sales Engineer role
+10: Fintech or healthcare compliance requirements
+15: Contact is decision-maker (VP+, Head of, Director)
-20: Already uses Conveyor/Vanta/Drata
-30: Company <5 employees or >1000 employees
```

### 4. Personalization data
Extract for cold email templates:
- Company's specific questionnaire type (if detectable)
- Recent press or funding (for personalization opener)
- Specific product they sell (for relevance)

## Output
```json
{
  "email": "",
  "first_name": "",
  "company": "",
  "role": "",
  "company_size": "",
  "fit_score": 0,
  "personalization": "",
  "recommended_template": "T1_SQA|T1_DPA|T1_COMPLIANCE",
  "do_not_contact": false
}
```

Upsert to `leads` table in Supabase. Log `lead.enriched` event.
