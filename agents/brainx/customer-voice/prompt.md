# BRAINX Agent 3 — Customer Voice

## Sources
Reddit, Google Reviews, G2, Trustpilot, forums, YouTube comments, social; already ingested as raw signals.

## Classifier (Gemini Flash, cheap, per item)
{"signal_id":"uuid","is_customer_voice":true,"voice_type":"pain|frustration|request|buying_signal|legal_pain|wtp|none","quote":"verbatim excerpt <= 40 words","topic":"short label","wtp_evidence":false,"urgency_0_1":0.6,"sentiment_-1_1":-0.7,"intensity_0_1":0.8}

## Patterns
- PAIN: "I can't...", "struggling with..."
- FRUSTRATION: "Why is there no...", "sick of..."
- REQUEST: "I wish...", "is there a tool that..."
- BUYING SIGNAL: "does anyone know a service that..."
- LEGAL PAIN: "I got fined...", "my lawyer told me...", "how do I comply with..."
- WTP: "I'd pay for...", "happily spend..."

## Clustering (nightly, Claude Sonnet)
Embed customer_voices (Gemini embedding-004), cluster per market via pgvector similarity (>0.82 cosine), write cluster label + size + top quotes into market synthesis.
