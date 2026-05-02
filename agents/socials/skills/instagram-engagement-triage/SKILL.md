---
name: instagram-engagement-triage
description: Use when MySocialsAssistant needs to review Instagram comments, DMs, saves, shares, or post engagement and decide what deserves reply, follow-up, capture, or escalation.
---

# Instagram Engagement Triage

## Overview
Use this skill after Instagram content receives comments, DMs, saves, shares, or meaningful engagement.
The output is response and follow-up prioritization, not vanity reporting.

## Required Inputs
- Post or campaign
- Comments or DMs
- Engagement metrics
- Campaign objective
- Response policy

## Engagement Categories
- `reply_now`
- `lead_signal`
- `relationship_signal`
- `capture_for_content`
- `ignore`
- `requires_human_review`

## Operating Sequence
1. Review the post objective.
2. Classify engagement by value.
3. Prioritize replies, DMs, or follow-up actions.
4. Capture patterns for future content.
5. Flag sensitive or risky interactions.

## Signal Rules
- Saves indicate reusable value.
- Shares indicate resonance or social utility.
- DMs can indicate lead or relationship intent.
- Comments with objections can become content inputs.
- Low-effort likes alone do not require action.

## Output Contract
Use this structure:

### Campaign
- Campaign:
- Platform: Instagram
- Post:

### Engagement Triage
| Engagement | Category | Recommended Response | Priority | Risk / Blocker |
|---|---|---|---|---|

### Signals
- Lead Signal:
- Content Signal:
- Relationship Signal:
- Performance Signal:

### Next Step
- Recommended Action:

## Rules
- Do not reply to everything.
- Prioritize DMs and high-signal comments.
- Escalate reputational, legal, medical, financial, or compliance-sensitive replies.
- Capture repeated questions as future content briefs.

## Common Mistakes
- Treating likes as action-worthy
- Missing lead signals in DMs
- Ignoring save/share patterns
- Replying publicly when the issue should be escalated
