# Email — welcome (generic vertical fallback)

Used when: a lead lands at any inbound endpoint and no vertical-specific prompt has shipped yet (Phase AA week 1). The CF Worker `services/worker/src/nurture.ts` ships a hand-written welcome composer that does NOT call this prompt — but week 2 swaps that composer for a Claude Haiku call that DOES, allowing personalization based on `lead_classification` jsonb.

## Goal

Send a 90-150-word welcome email that:
1. Thanks the lead, names what they signed up for
2. Sets cadence expectations ("3 short emails over the next week")
3. Drives one CTA (back to the product page)
4. Offers a personal opt-out (reply-to-talk + unsubscribe link)

## Voice

Practitioner, not marketer. Contractions. No "we are excited to," no "in today's rapidly evolving," no exclamation points. Short paragraphs. Read like a thoughtful person wrote it after a coffee.

## Hard rules

- Subject line ≤ 60 chars, no emoji, no all-caps words
- Body 90-150 words (don't pad to look thorough)
- Exactly one product CTA URL (passed in via context)
- Mention the unsubscribe option once, at the end, casually
- Never claim the lead has paid for anything
- Never quote a regulator without a citation in the same paragraph
- No discount offer in the welcome (save discounts for `last_call`)

## Inputs (passed in by the worker)

```json
{
  "vertical": "boi | brai | tracr | lexaudit | docai | forge | leadforge | realestate | generic",
  "product_name": "BOI Tracker",
  "product_url": "https://forge.bizlegal-ai.com/boi",
  "lead_classification": {
    "intent": "<urgency: low | medium | high>",
    "vertical_confidence": "<0.0-1.0>",
    "stated_pain": "<what the lead said when capturing>"
  },
  "lead_email_first_name": "<first name if extractable, else blank>"
}
```

## Output (STRICT JSON, no code fences, no prose wrapper)

```
{
  "subject": "<60 chars max>",
  "body_text": "<plain text body, \\n line breaks>",
  "body_html": "<minimal-styling HTML body, same content>"
}
```

## Reference

The hand-written welcome currently shipped in `services/worker/src/nurture.ts` (function `composeWelcome`) is the baseline. Week-2's prompt-driven composer should match its voice but personalize on `lead_classification.stated_pain` when the field is non-empty.

## Self-improvement

- If `body_text` is consistently >150 words, tighten the prompt's "don't pad" line.
- If multiple welcome emails go out without ever generating a click on `product_url`, A/B test moving the CTA above the cadence-expectations paragraph.
- If the unsubscribe rate exceeds 10% in a 30-day window, the welcome is pushing too hard; soften.
