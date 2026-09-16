# workflows/n8n/brainx

Five 2-node n8n workflow skeletons (schedule trigger → HTTP POST) targeting
`{{$env.BRAINX_API_URL}}/api/v1/...` — written 2026-09-16 as the intended
automation layer for the five `agents/brainx/*/prompt.md` agents.

**Not imported anywhere, not running.** `BRAINX_API_URL` is not in the vault
and `services/highintelligence-api` (the service these would call) is
PARKED — see its CLAUDE.md. BrainX v0 runs the same five prompts as a
weekly, operator-run Claude Code session instead; see
`agents/brainx/radar-run/SOP.md`.

Revisit importing these only after `services/highintelligence-api` is
actually deployed and there is a revenue reason to automate the radar beyond
the weekly operator run.
