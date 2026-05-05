---
name: oci-referral-contract
purpose: Transparent intro email sent directly to the LEAD after partner routing. Names the partner, summarizes finder-fee terms, gives the lead authority to opt out before the introduction proceeds.
audience: end-user (the lead), not the partner
tone: plain English, no legalese; one short paragraph per topic
disclosure_version: v1.0.0-p1
---

# Referral Contract Email — fillable template

Inputs the composer agent fills:
- `{{LEAD_NAME}}`        – contact_name from the lead record (use "there" if absent)
- `{{LEAD_FIRST_NAME}}`  – derived from contact_name (first token); fallback "there"
- `{{CLASSIFICATION}}`   – e.g. UAE_REAL_ESTATE, SG_BUSINESS_SETUP
- `{{PAIN_POINT}}`       – the agent-extracted pain summary (one sentence)
- `{{PARTNER_NAME}}`     – partners.name
- `{{PARTNER_TYPE}}`     – partners.type (humanised: re_lawyer → "real-estate counsel")
- `{{PARTNER_JURIS}}`    – partners.jurisdictions joined with " / "
- `{{LEAD_ID}}`          – tracking id (last 8 chars shown)
- `{{COMMISSION_NOTE}}`  – static; see below
- `{{OPT_OUT_URL}}`      – `/api/oci/optout?lead_id={lead_id}` on bizlegal-ai.com
- `{{REPLY_TO}}`         – RESEND_REPLY_TO env, default team@bizlegal-ai.com
- `{{DISCLOSURE_VERSION}}` – v1.0.0-p1

Subject:
> BizLegal-AI Intelligence — introduction to {{PARTNER_NAME}} re your {{CLASSIFICATION_HUMAN}} matter

Body (plain text):

```
Hi {{LEAD_FIRST_NAME}},

Thanks for the inbound to BizLegal-AI. Based on what you shared
(summary: {{PAIN_POINT}}), I'm introducing you to {{PARTNER_NAME}},
{{PARTNER_TYPE}} covering {{PARTNER_JURIS}}. They're set up to scope
the engagement directly with you.

How this works (transparent):
- BizLegal-AI Intelligence operates a regulatory-intelligence platform.
  We do not represent you on this matter.
- {{PARTNER_NAME}} sets their own scope, fees, and engagement terms
  with you. We are not party to that engagement.
- BizLegal-AI may receive a finder fee from {{PARTNER_NAME}} if an
  engagement closes. The fee does not increase what you pay them and
  is disclosed here under {{DISCLOSURE_VERSION}}.

Next step: reply-all to this thread to begin scoping with
{{PARTNER_NAME}}. If you'd prefer we don't make this introduction,
reply with "stop" or click {{OPT_OUT_URL}} within 48 hours and the
introduction will not proceed.

Reference: {{LEAD_ID_SHORT}}

— BizLegal-AI Intelligence
{{REPLY_TO}}
```

Hard rules for the composer:
- Never invent a price, deadline, or service the partner offers — only what's in the partner record + the lead-record pain.
- Never imply BizLegal-AI is a law firm or providing legal advice.
- Always include the opt-out cue and the {{DISCLOSURE_VERSION}}.
- Keep it under 200 words.
