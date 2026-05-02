---
name: social-queue-review
description: Use when MySocialsAssistant needs to inspect, summarize, or reconcile the social publishing queue across Buffer-managed LinkedIn, Facebook, and Pinterest posts.
---

# Social Queue Review

## Overview
Use this skill after content has been prepared for queueing or when reviewing what is scheduled.
The output is queue visibility and action guidance, not new content.

## Required Inputs
- Campaign or date range
- Platform queue state
- Approval state
- Scheduled times
- Known blockers or failures

## Queue States
- `ready_to_queue`
- `needs_approval`
- `blocked_missing_media`
- `blocked_missing_copy`
- `queued`
- `published`
- `failed`

## Operating Sequence
1. Group queued or planned posts by campaign.
2. Check platform coverage.
3. Compare queue state against approval state.
4. Surface gaps, conflicts, and failures.
5. Recommend the next queue action.

## Review Checks
Check for:
- Missing platform variant
- Missing media
- Unapproved post in queue
- Duplicate raw copy across platforms
- Schedule conflict
- Failed publish state
- Campaign without next action

## Output Contract
Use this structure:

### Bottom Line
[1-2 lines]

### Queue Review
| Campaign | Platform | Queue State | Approval State | Scheduled Time | Issue |
|---|---|---|---|---|---|

### Gaps
- Missing Platform:
- Missing Media:
- Approval Issue:
- Scheduling Issue:

### Next Step
- Recommended Action:

## Rules
- Queue state and approval state must stay separate.
- Do not assume Buffer succeeded unless publish state confirms it.
- Flag duplicate cross-platform copy.
- If Pinterest lacks media, mark it blocked.

## Common Mistakes
- Reporting scheduled posts without blockers
- Treating `ready_to_queue` as `queued`
- Ignoring platform coverage gaps
- Missing failed or unapproved posts
