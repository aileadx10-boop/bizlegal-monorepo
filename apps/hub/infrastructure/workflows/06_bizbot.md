# Workflow 06 — BizBot (AI Assistant)

**Trigger**: User message via chat widget on bizlegal-ai.com  
**Owner**: n8n `bizbot_webhook.json` → Supabase → OpenAI/Anthropic  
**Agent**: Claude Haiku (fast) for routing + Claude Sonnet (quality) for responses  
**Output**: Real-time chat response + lead capture + product upsell

---

## Purpose

BizBot is the AI-powered chat assistant embedded on bizlegal-ai.com. It handles regulatory questions, routes users to the right product, captures leads, and escalates complex queries to human review.

---

## Architecture

```
User message (chat widget)
  → POST /api/bizbot/chat (Next.js API route)
    → n8n webhook (bizbot_webhook.json)
      → Router (Haiku): classify intent
        → Handler: generate response
          → Supabase: log conversation
            → Response back to widget
```

---

## Intent Router (Claude Haiku)

Classify each message into one of these modules:

```
INTELLIGENCE  → "What's the latest on MiCA?"
              → Query Supabase intelligence_items, return top 3

COMPLIANCE    → "Am I compliant with VARA?"
              → Route to Forge product + ask qualifying questions

CONTRACTS     → "I need an NDA for a DeFi company"
              → Route to DocAI + offer template

FORENSICS     → "I need to trace a Bitcoin wallet"
              → Route to TRACR + explain report types

RISK          → "What's the risk score of this wallet?"
              → Route to BRAI + ask for wallet address

LEGAL_QUESTION → "Is DeFi regulated in the EU?"
               → Answer with hedged legal intelligence + cite source

PRICING       → "How much does it cost?"
               → Show product pricing table

LEAD_CAPTURE  → Detect high-intent signals → ask for email

ESCALATE      → Complex/sensitive/angry → flag for human review
```

---

## System Prompt

See: `skills/bizbot-system.txt`

Key rules in system prompt:
- Never give legal advice — always hedge as "intelligence, not legal counsel"
- Always try to route to a product within 2 turns
- If user gives email → save to Supabase `leads` table
- Cite source URLs when referencing regulatory content
- Keep responses under 150 words unless user asks for detail

---

## Response Templates

```
INTELLIGENCE response:
"According to [source] published [date], [1-sentence summary]. 
Risk level: [score]/100 for [affected entities].
→ Full analysis: [post link]"

PRODUCT route:
"[Product] can help with that. [1-sentence value prop].
→ [Button: Try [Product] free / See pricing]"

ESCALATE:
"This question requires expert review. Leave your email and 
our compliance team will respond within 24 hours."
```

---

## Lead Capture Logic

```
Trigger lead capture when:
  - User asks about pricing (any product)
  - User mentions their company/industry
  - User asks for a specific report or document
  - Conversation reaches 4+ turns without product click

Lead schema (Supabase leads table):
{
  "email": "string",
  "name": "string | null",
  "company": "string | null",
  "intent": "tracr|brai|lexaudit|docai|forge|leadforge",
  "message_context": "string (last 2 turns)",
  "source": "bizbot",
  "created_at": "ISO 8601"
}

After capture → Resend: send welcome email + product guide PDF
```

---

## Conversation Logging

```sql
-- Supabase: bizbot_conversations
CREATE TABLE bizbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  messages JSONB NOT NULL,   -- [{role, content, timestamp}]
  intent_path TEXT[],        -- ["intelligence", "forensics"]
  lead_captured BOOLEAN DEFAULT FALSE,
  product_clicked TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Escalation Rules

Route to human review if:
- User expresses frustration (negative sentiment detected)
- Question involves specific legal matter (not general intelligence)
- User claims to be from law enforcement or regulatory body
- Conversation > 8 turns without resolution
- Any message contains: "lawsuit", "subpoena", "complaint", "sue"

Escalation action: Flag in Supabase + notify via Telegram bot + log in n8n

---

## Success Criteria

- Response time < 3 seconds
- Lead capture rate > 15% of conversations
- Product click-through rate > 25%
- Escalation rate < 10%
- User satisfaction (thumbs up) > 70%

---

## Learnings Log

| Date | Learning |
|---|---|
| — | Baseline |
