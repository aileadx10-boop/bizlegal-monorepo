"""
services/agents — THE MACHINE: 8 specialist agents + 1 orchestrator.

Built 2026-07-03. See decisions/THE-MACHINE-2026-07-03.md for the plan.
Updated 2026-07-08: real package marker (was docstring-only) so the
orchestrator's `from services.agents.code_agent import run` works.

Agents (8):
  - enrichment    (Firecrawl + Apify + Apollo -> 360 lead profiles)
  - headhunter    (signal-based outbound -> qualified lead matching)
  - lead_capture  (form -> 4-stage Haiku pipeline -> qualified lead)
  - content       (AI Marketing Team: blog + linkedin + image + video)
  - socials       (Blotato-style multi-platform posting)
  - code          (monitor Vercel + endpoints -> open PRs on regression)
  - newsletter    (weekly HTML digest -> Resend audience)
  - monetization  (hot lead -> deal room -> Stripe checkout link)

Dispatch from CLI:
  python -m services.agents.orchestrator "find 10 EU crypto compliance buyers"

Status check:
  python -m services.agents.orchestrator status
"""
