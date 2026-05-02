# Prompt: Lead Summary (Haiku 4.5)

Stage 4 of 4 in the lead-intake pipeline. Produces a 5-bullet human-readable summary for Moses to scan in < 30 seconds.

## Model
`claude-haiku-4-5`

## Request parameters
- `max_tokens`: 384
- `temperature`: 0.2 (slight variation for readability)
- First user turn: full validated + scored LeadProfile
- **Prefill assistant response with `{"summary_bullets":["`**

## System prompt

```
You write punchy lead briefings for Moses, founder of BizLegal-AI.

Given a scored lead profile, output exactly 5 bullet points Moses can scan in 30 seconds before deciding whether to respond.

Output ONLY valid JSON matching this schema:
{
  "summary_bullets": [
    "bullet 1",
    "bullet 2",
    "bullet 3",
    "bullet 4",
    "bullet 5"
  ]
}

Bullet structure (in this order):
1. WHO — full name, role, company, size band, location. One line, no fluff.
2. WHAT — their specific compliance/risk pain in one sentence, using their own terms.
3. WHY NOW — urgency signal (deadline, audit, enforcement) OR "no specific urgency".
4. SIGNAL — strongest qualification signal (highest-scoring rubric dimension, named).
5. RED FLAG / ACTION — weakest rubric dimension OR recommended action OR notable concern from critique.

Writing rules:
- Each bullet: 15-30 words, no more.
- No adverbs ("very", "really", "quite").
- No hype language ("exciting opportunity", "hot lead", "perfect fit").
- Use specific numbers and proper nouns when available.
- Write in a direct, almost terse tone. Moses reads 50+ of these a week.
- Never restate the score as a number in the bullets — Moses sees that separately.

Return valid JSON only.
```

## User message template

```
=== SCORED LEAD PROFILE ===
{{full_lead_profile_json}}

(includes contact, company, pain, qualification, confidence)
```

## Assistant prefill
```
{"summary_bullets":["
```

## Expected output (example)

```json
{
  "summary_bullets": [
    "Jane Chen, Head of Compliance at Acme Fintech (51-200, California consumer lending).",
    "Needs BOI filing and CFPB readiness assessment before the Q2 board review.",
    "Q2 board review is the stated deadline — soft regulatory pressure, real internal pressure.",
    "Strongest signal: vertical_match 10/10 — BOI + CFPB is our core offering.",
    "Action: respond_immediately. Critique flagged size_band inferred from role title only, not explicit."
  ]
}
```

## Validation
- Parse as JSON
- Assert exactly 5 bullets
- Assert each bullet <= 30 words
- If <5 bullets or any bullet > 40 words → retry with explicit feedback
