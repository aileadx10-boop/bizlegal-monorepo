# services/outreach — B2B hunting + outreach fleet (Python, Hetzner)

> Read the monorepo root [`CLAUDE.md`](../../CLAUDE.md) first, then `agents/HERMES-STANDING-ORDERS.md` (send caps O2, kill switch O4).

Deploys to the Hetzner box alongside `services/seo-agents/` (SCP per `decisions/DEPLOYMENT_MAP.md`); scheduled via `services/seo-agents/crontab.txt`.

- `headhunter.py` — 8-stage pipeline: source (Firecrawl registries + curated) → extract → qualify (Anthropic ≥70) → dedupe → persist (`leadforge_leads`) → draft → send (Resend) → track (`lead_outreach`). Flags: `--icp`, `--limit`, `--max-per-domain`, `--dry-run`.
- `signal_scout.py` — signal-based lead sourcing (hiring / funding / Reddit pain), writes leads only, never emails. Pain leads are non-mailable by design (consent gates: `decisions/LOW_RISK_DOCAI_FUNNEL.md`).
- `cold_email_sender.py` — autonomous sender from `leadforge_leads` (cap via `--limit`; ramp 15→30→50 per standing orders).
- `lead_nurture.py` — drip engine (`--stage 1-4`) + `--sequence deal_room` (day 1/3/7 deal-room nudges).
- `prospects.py`, `queue_outreach.py`, `reddit_outreach.py`, `linkedin_dm_outreach.py` — curated data + draft-only outreach.
- `oci_funnel.py`, `oci_deal_closer.py`, `partner_onboarding.py` — OCI deal routing/closing/partners.

Envs (all in canonical vault): `ANTHROPIC_API_KEY`, `FIRECRAWL_API_KEY`, `RESEND_API_KEY`, `SUPABASE_*`, `TELEGRAM_CURATOR_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

Hard rule: autonomous sending is GATED — Week-1 payment gate green + Moses template approval before uncommenting the crontab block.
