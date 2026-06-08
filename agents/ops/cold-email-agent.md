---
name: cold-email-agent
description: Multi-touch cold email sequences for DocAI/SQA prospects — B2B SaaS Sales Engineers and RevOps leads
schedule: Daily 11:00 UTC (send batch) + Mon 09:00 UTC (research new prospects)
model: claude-sonnet-4-6
tools:
  - gmail
  - firecrawl
  - supabase
  - event-log
---

# Cold Email Agent

Executes outbound cold email sequences targeting B2B SaaS companies that answer security questionnaires.

## Target Persona
- **Role:** Head of Sales Engineering, RevOps Manager, Security Compliance Lead
- **Company:** B2B SaaS, 10-200 employees, has Trust Center or SOC 2 badge on website
- **Pain:** Spends 2-6 hours/week on vendor security questionnaires (CAIQ, SIG-Lite, SOC 2)
- **Signal:** Job posting for "Sales Engineer" + mentions "security questionnaire" in JD

## Prospect Discovery
1. Search Apollo.io or LinkedIn for role + signal
2. Use Firecrawl to scrape company Trust Center → confirm they handle questionnaires
3. Score (0-100): higher if they have active questionnaire process

## Touch Sequence

### Touch 1 — Day 0 (Cold intro)
```
Subject: [Company]'s SOC 2 questionnaires — 60 seconds each?

Hi [FirstName],

Sales engineers at [Company] probably spend hours every quarter on 
customer SOC 2 / CAIQ / SIG-Lite questionnaires. Same 200 questions,
slightly different wording each time.

I built DocAI to draft those in under 60 seconds using your prior answers.
First one is free, no card.

Worth a try? → docai.bizlegal-ai.com/sqa

Moses
BizLegal AI
```

### Touch 2 — Day 4 (Value add)
```
Subject: Re: [Company]'s SOC 2 questionnaires

Quick follow-up — here's a 60-second CAIQ auto-fill that might be useful
for your next questionnaire: [link to free SQA with pre-filled CAIQ example]

The draft handles ~80% of standard questions. You edit the last 20%
for your architecture specifics.

Worth 60 seconds to see?
```

### Touch 3 — Day 9 (Breakup)
```
Subject: Closing the loop

Hi [FirstName],

Last note — if questionnaire drafting isn't a current pain, totally
understand. If it becomes one (or changes for next quarter), 
docai.bizlegal-ai.com/sqa has a free trial waiting.

Good luck with [something specific from their website/LinkedIn].

Moses
```

## Rules
- Max 5 emails/day from Moses's Gmail to avoid spam scoring
- Never send to same person twice within 30 days
- Mark responded leads immediately → route to thank-you-agent or pitch-ops
- All sends logged: `ops_events` type `email.cold_sent`

## Tracking
Maintain `decisions/COLD-PITCH-QUEUE-{YYYY-MM-DD}.md` with:
- Prospect name + company + email
- Touch sequence status (t1_sent, t2_sent, t3_sent, responded, converted)
- Response notes
