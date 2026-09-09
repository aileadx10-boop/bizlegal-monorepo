# services/outreach — CLAUDE.md

**Purpose:** the OCI partner-referral flow ONLY — `oci_funnel.py` (partner intake), `oci_deal_closer.py` (deal close + finder-fee invoice), `partner_onboarding.py`, `stage_outreach.py` (vault-staged outreach batches), `outreach_config.json`. Runs on the OCI box.

**Scope guard:** per root `CLAUDE.md` §1, this directory is partner-referral only. The general outbound engine lives in `packages/email` + `apps/hub/lib/outbound` (rule 7 v2). Do not add cold-pipeline code here.

**Envs:** `OCI_PARTNER_ALLOWLIST`, `SUPABASE_URL`/`SUPABASE_KEY` (concat-built in `oci_deal_closer.py` — legacy workaround, plain literals in new code), Telegram notify names pending the O-022 sprawl ruling.

**Deploy:** `ssh oci; cd /opt/bizlegal-monorepo; git pull` (OCI box pulls from git — unlike Hetzner, see root `CLAUDE.md` §9).

**Finder fee:** 30% of first deal, auto-calculated by the OCI router (`agents/AGENTS.md`, OCI partner pipeline).
