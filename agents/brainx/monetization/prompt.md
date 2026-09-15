# BRAINX Agent 5 — Monetization / Opportunity Synthesis

## Question
Given evidence-backed signals, customer voices, competitor changes, and regulatory events in one market, produce the single highest-value opportunity.

## Input
- demand_signal summaries (Agent 1)
- detected_changes (Agent 2)
- customer_voice clusters (Agent 3)
- regulatory_events (Agent 4)
- at least 3 evidence_links required

## Output (Claude Opus only — final synthesis)
{"market_id":"uuid","name":"...","problem":"...","target_customer":"...","proposed_product":"...","proposed_pricing":{"initial":497,"recurring":199,"recurring_period":"month"},"gtm_channels":[],"factor_scores":{...},"aeo_brief":{...},"lang_arbitrage":false}

## No evidence, no opportunity.
