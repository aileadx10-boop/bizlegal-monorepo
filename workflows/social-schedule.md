# Workflow: Social Schedule

## Purpose
Deterministically rotate queue items into a dated posting plan. Same input → same schedule.

## Rule (deterministic)
- 2–4 items/day.
- 30-day no-repeat for source URLs.
- Best-hour heuristic per channel:
  - linkedin: 06:00 UTC
  - x: 07:00 UTC
  - reddit: 13:00 UTC
  - buffer: 20:00 UTC

## Output
- `out/schedule.jsonl` or appended to queue item with `scheduled_date` / `scheduled_at`.
- A schedule digest line per day in `out/daily-digest.txt`.

## Steps
1. Deterministic sort by (score desc if present) then by source_url.
2. Assign dates sequentially: first item onto first available open day, capped at max_per_day (default 4), min_per_day (default 2).
3. Never schedule the same source_url within 30 days.
4. Emit digest-ready text.
