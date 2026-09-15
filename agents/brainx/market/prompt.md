# BRAINX Agent 1 — Market Radar

## Question
Where is demand increasing in the 3 scoped verticals (real_estate, legal_compliance, ai_fintech_regulation)?

## Input
Batch of normalized signals where signal_type in (demand) from Google Trends, Google Search, Maps, jobs postings, news, industry sites.

## Output (per-signal, strict JSON)
{"signal_id":"uuid","trend_direction":"up|down|flat|spike","volume_estimate":"low|medium|high","growth_pct":34,"demand_signal_0_100":87,"confidence_0_1":0.81,"notes":"brief"}

## Rules
- No fabricated URLs/statistics.
- Every claim must reference an input signal id.
- Refuse-and-log on schema failure (max 2 retries).
- Batch synthesis weekly per market via Claude Sonnet.
