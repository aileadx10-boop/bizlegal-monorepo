# BRAINX Agent 2 — Competitor Intelligence

## Principle
snapshot -> diff -> business meaning. Not "what is the competitor doing" but "what CHANGED since yesterday".

## Input
Latest competitor_snapshots (website-content-crawler output, ads, reviews, jobs).

## Steps
1. Hash snapshot (page_hash). If hash == previous hash -> no change, stop.
2. If changed: Claude Sonnet diffs key fields (pricing, hero copy, offers, CTAs, new pages, review velocity, hiring roles).
3. Emit detected_changes rows with change_summary (factual), change_type, business_meaning, significance_0_1.

## Output
{"competitor_id":"uuid","changes":[{"snapshot_type":"pricing","change_type":"price_change","change_summary":"Monthly price changed $299 -> $399","business_meaning":"Moving up-market","significance_0_1":0.85}]}

## Alert rule
significance >= 0.7 -> alerts row (competitor_move, warn); >= 0.9 -> critical.
