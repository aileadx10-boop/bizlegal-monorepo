---
name: x-engagement-triage
description: Use when MySocialsAssistant needs to review X replies, mentions, engagement, or conversation opportunities and decide what deserves response, follow-up, or capture.
---

# X Engagement Triage

## Overview
Use this skill after X posts receive replies, mentions, or meaningful engagement.
The output is response prioritization, not general analytics.

## Required Inputs
- Post or thread
- Replies or mentions
- Engagement context
- Campaign objective
- Response policy

## Engagement Categories
- `reply_now`
- `lead_signal`
- `relationship_signal`
- `ignore`
- `capture_for_content`
- `requires_human_review`

## Operating Sequence
1. Review the engagement context.
2. Categorize each meaningful reply or mention.
3. Identify lead, relationship, or content signals.
4. Recommend response action.
5. Flag human-review risks.

## Priority Rules
Prioritize:
1. Buyer or partner signals
2. Thoughtful objections
3. High-signal questions
4. Credible amplification opportunities
5. Content ideas from repeated patterns

Ignore:
- low-effort praise
- spam
- hostile non-buyers
- irrelevant replies

## Output Contract
Use this structure:

### Campaign
- Campaign:
- Platform: X
- Post / Thread:

### Engagement Triage
| Engagement | Category | Recommended Response | Priority | Risk / Blocker |
|---|---|---|---|---|

### Signals
- Lead Signal:
- Content Signal:
- Relationship Signal:

### Next Step
- Recommended Action:

## Rules
- Do not reply to everything.
- Prioritize conversations that create leverage.
- Escalate reputationally sensitive replies.
- Capture repeated objections as future content inputs.

## Common Mistakes
- Treating likes as engagement that needs action
- Replying to low-value comments
- Missing lead signals hidden inside objections
- Ignoring content ideas from repeated replies
