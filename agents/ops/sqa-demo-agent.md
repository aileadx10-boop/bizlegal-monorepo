---
name: sqa-demo-agent
description: Runs a live DocAI SQA demo for a prospect — takes a sample questionnaire, generates a draft, and sends to the prospect's email
schedule: On-demand (triggered by cold email response or direct request)
model: claude-sonnet-4-6
tools:
  - resend
  - supabase
  - event-log
  - anthropic-api
---

# SQA Demo Agent

Converts a cold email response into a product trial by running a live demo.

## Trigger
Cold email response contains: "yes", "interested", "sure", "how does it work", "can you show me"

## Demo Flow

### Step 1 — Identify questionnaire type
Ask (or infer from company): CAIQ / SIG-Lite / SOC 2 Type II / ISO 27001 / NIST CSF

### Step 2 — Generate sample draft (30-60 seconds)
Use DocAI SQA API to generate a 10-question sample draft:
```
POST https://docai.bizlegal-ai.com/api/sqa/draft
{
  "framework": "CAIQ",
  "company_context": "B2B SaaS, cloud-native, AWS, SOC 2 Type II certified",
  "questions": [first 10 standard CAIQ questions]
}
```

### Step 3 — Send personalized demo email
```
Subject: Here's your CAIQ draft — generated in 47 seconds

Hi [Name],

Ran your CAIQ through DocAI. Here are the first 10 questions, 
drafted from a standard B2B SaaS cloud context:

[paste 3-4 best answers as inline preview]

Full 10-question draft: [link or PDF attachment]

The answers are ~80% ready — you'd review and adjust architecture-specific 
details. The framework handles the boilerplate.

Full access (50 questionnaires/month): docai.bizlegal-ai.com/pricing
Free tier: docai.bizlegal-ai.com/sqa

Worth upgrading? Reply and I'll set you up with a team trial.
Moses
```

### Step 4 — Log + follow-up
- Log `demo.sent` event with prospect email + questionnaire type
- If no response in 3 days → send follow-up via cold-email-agent Touch 2
- If converted → trigger thank-you-agent

## Success Metric
Demo → trial conversion rate target: 30%+
