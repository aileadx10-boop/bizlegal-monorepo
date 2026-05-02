---
name: social-approval-routing
description: Use when MySocialsAssistant needs to decide whether social content can be queued, must be revised, or requires human approval before public publishing.
---

# Social Approval Routing

## Overview
Use this skill before Buffer queueing or any public publishing step.
The output is an approval decision with reasons, not a rewrite.

## Required Inputs
- Campaign
- Platform variants
- Approval policy
- Risk level
- Missing assets or claims

## Approval States
- `approved`
- `needs_revision`
- `requires_human_approval`
- `blocked`

## Operating Sequence
1. Check whether the content is public-facing and reputationally sensitive.
2. Review claims, proof, CTA, tone, and media dependencies.
3. Assign one approval state per platform.
4. Explain the decision briefly.
5. Provide the next action needed to move toward queueing.

## Risk Triggers
Route to `requires_human_approval` when content includes:
- Revenue claims
- Client claims or implied case studies
- Legal, regulatory, medical, financial, or compliance claims
- Aggressive positioning that may affect reputation
- Missing proof for a strong claim

Route to `blocked` when:
- Required media is missing
- Copy is missing
- Platform requirements are not met
- The content contradicts the campaign objective

## Output Contract
Use this structure:

### Campaign
- Campaign:
- Approval Policy:

### Approval Decisions
| Platform | Approval State | Reason | Required Fix |
|---|---|---|---|

### Risk / Blocker
- Highest Risk:
- Blocker:

### Next Step
- Recommended Action:

## Rules
- Do not approve content just because it is well-written.
- Approval is separate from Buffer queue state.
- If claim support is weak, require revision or human approval.
- Public posts default to human approval unless an explicit auto-approval policy exists.

## Common Mistakes
- Treating copy quality as approval readiness
- Ignoring unsupported claims
- Approving all platforms as a batch when one platform has a blocker
- Confusing `approved` with `queued`
