# agents/socials Operating Notes

Purpose: social acquisition prompt seeds, phase plans, and skills for consent-based lead capture.
Owner: BizLegal AI operator; keep bot behavior conservative and auditable.
Deploy target: external bot/runtime only; this directory does not deploy by itself.
Env surface: none directly; bot runtimes must source secrets from the canonical vault.
Allowed channels: X automation only after consent gate; LinkedIn is manual/semi-manual only.
Do not add Instagram, Reddit, or LinkedIn automated DMs without a fresh ToS review.
Every outreach link must include utm_source, utm_medium, utm_campaign, and ref.
Outbound copy must include “This is not legal advice” and a STOP opt-out.
Classifier production gate is 100-comment eval with at least 80% precision.
First-week production cap is 20 DMs/day across owned/approved surfaces.
