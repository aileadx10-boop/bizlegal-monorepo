# Workflow: Social Verify

## Purpose
Verify the autopilot before claiming completeness (O7).

## Checks
1. Queue built from real or fixture `social_drafts` rows; count in report.
2. Schedule deterministic: same input twice → identical output.
3. Digest artifact exists (email sample or `out/daily-digest.txt`) for two consecutive days.
4. Ops-log rows present (or stdout log in local mode).
5. Zero LLM in run path: `rg -n "anthropic|openai|claude|OPENAI|ANTHROPIC" tools/social-autopilot -i` returns no hits (except comments explaining non-LLM usage).
