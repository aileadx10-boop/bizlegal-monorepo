---
name: social-content-adapter
description: Use when MySocialsAssistant needs to turn one approved content brief into distinct LinkedIn, Facebook, and Pinterest variants without duplicating raw copy across platforms.
---

# Social Content Adapter

## Overview
Use this skill after `social-content-brief`.
The output is platform-specific copy for LinkedIn, Facebook, and Pinterest.

## Required Inputs
- Campaign brief
- Platforms
- CTA
- Approval status
- Media availability or media requirement

## Operating Sequence
1. Read the campaign brief.
2. Preserve the same campaign intent.
3. Adapt tone, structure, and CTA per platform.
4. Mark media requirements.
5. Return variants in the shared social output contract.

## Platform Logic
### LinkedIn
- Lead with insight or operator tension.
- Make the business implication clear.
- Use controlled, professional tone.
- CTA should invite conversation, not feel desperate.

### Facebook
- Make the copy more direct and accessible.
- Keep the value practical.
- Avoid over-formal positioning.
- CTA can be lighter and more conversational.

### Pinterest
- Treat the post as discovery and save-worthy content.
- Use clear title-style copy.
- Emphasize outcome, checklist, guide, or framework.
- Media requirement is usually required.

## Output Contract
Use this structure:

### Campaign
- Campaign:
- Source Asset:
- Approval Status:

### Variants
| Platform | Variant | Media Required | CTA | Risk / Blocker |
|---|---|---|---|---|

### Recommended Action
- Best First Platform:
- Queue Readiness:
- Next Step:

## Rules
- Same campaign, different platform variants.
- Do not publish identical raw copy across platforms.
- Do not invent proof.
- If media is required and missing, mark the variant blocked.
- Keep each variant aligned with the campaign objective.

## Common Mistakes
- Copy-pasting the same text into every platform
- Making Pinterest text behave like LinkedIn
- Overwriting the campaign CTA
- Ignoring media dependencies
