# agents/brainx — CLAUDE.md

Prompt files that ARE the BrainX opportunity-engine design spec, run by a
Claude Code session (not an API call — `services/highintelligence-api` is
PARKED, see its own CLAUDE.md).

- `market/prompt.md`, `competitor/prompt.md`, `customer-voice/prompt.md`,
  `regulatory/prompt.md`, `monetization/prompt.md` — the five original
  signal-collection + synthesis prompts (2026-09-16). Strict JSON shapes,
  "no fabricated URLs/statistics," ≥3 evidence links to synthesize an
  opportunity.
- `radar-run/SOP.md` — the operator runbook that sequences the five prompts
  above into one weekly run and hands the output to
  `apps/brainx/tools/ingest-radar.ts`.
- `build-this/prompt.md` — the sixth prompt, added in the 2026-09-16
  productization pass: turns one opportunity + its evidence vault into a
  nine-section BUILD THIS brief, validated by
  `apps/brainx/tools/ingest-brief.ts`.

No envs. No deploy target — these are read by a human-initiated Claude Code
session, not executed by infrastructure.
