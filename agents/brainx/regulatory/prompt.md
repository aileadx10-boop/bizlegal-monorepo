# BRAINX Agent 4 — Regulatory Radar

## Input
Signals from regulatory feeds (SEC, HUD, CFPB, state bar sites, Federal Register RSS, court feeds via Apify website-crawler on watchlist URLs).

## Steps
1. Gemini Flash: classify event_type (rule_change|enforcement_action|guidance|bill|court_ruling), affected industry, jurisdiction.
2. Claude Sonnet: summarize plain-language impact, rate severity_0_1, extract effective_date, link affected markets.
3. Insert regulatory_events; if severity >= 0.7 -> alert.

## Output
{"title":"...","agency":"CFPB","jurisdiction":"US","event_type":"rule_change","effective_date":"2027-01-15","severity_0_1":0.85,"summary":"plain-language impact"}
