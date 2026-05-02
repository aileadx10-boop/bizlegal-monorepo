---
name: buffer-publisher
description: Use when MySocialsAssistant needs to prepare approved LinkedIn, Facebook, and Pinterest variants for Buffer queueing, scheduling, approval handoff, or publish-state tracking.
---

# Buffer Publisher

## Overview
Use this skill after platform variants exist.
The output is a Buffer-ready queue plan, not a content strategy document.

## Required Inputs
- Campaign ID or campaign name
- Platform variants
- Desired schedule or queue preference
- Approval status
- Media assets or media blockers

## Operating Sequence
1. Confirm approval status.
2. Check each platform variant for copy, CTA, and media readiness.
3. Assign queue state per platform.
4. Prepare Buffer handoff fields.
5. Surface blockers before publish.

## Queue States
- `ready_to_queue`
- `needs_approval`
- `blocked_missing_media`
- `blocked_missing_copy`
- `queued`
- `published`
- `failed`

## Buffer Handoff Fields
Use these fields:
- `campaign_id`
- `platform`
- `variant_copy`
- `media_required`
- `media_asset`
- `cta`
- `scheduled_time`
- `approval_status`
- `buffer_queue_status`

## Output Contract
Use this structure:

### Campaign
- Campaign:
- Approval Status:
- Scheduled Time:

### Buffer Queue Plan
| Platform | Buffer Queue Status | Scheduled Time | Media Required | Media Asset | Risk / Blocker |
|---|---|---|---|---|---|

### Handoff Payload
```json
[
  {
    "campaign_id": "",
    "platform": "",
    "variant_copy": "",
    "media_required": false,
    "media_asset": "",
    "cta": "",
    "scheduled_time": "",
    "approval_status": "",
    "buffer_queue_status": ""
  }
]
```

### Recommended Action
- Next Step:

## Rules
- Do not queue unapproved public posts unless policy explicitly allows it.
- Do not queue Pinterest without media.
- Do not silently skip a platform; mark it blocked with a reason.
- Keep Buffer as the Phase 1 publishing hub only.
- Track queue status separately from approval status.

## Common Mistakes
- Treating approved copy as queued content
- Ignoring missing media
- Using one scheduled time without platform awareness
- Mixing content adaptation with queue handoff
