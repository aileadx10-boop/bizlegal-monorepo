# wf_marketplace_match — Route a risk flag to a vetted service provider

**Objective:** When an abstract surfaces a high-severity risk flag (co-tenancy, go-dark, assignment restriction) or a renewal window opens, offer the user a vetted partner (CRE attorney or tenant-rep broker) and deliver a qualified lead on opt-in.

**Inputs:** risk flag or alert event, property geography, user opt-in click.

**Tools, in order:**
1. Partner registry (Supabase table, build phase 3) filtered by state + specialty.
2. Marketplace router formats the lead (flag excerpt, property metadata, user contact — WITH explicit consent only) and posts to the partner's webhook/CRM.
3. Log `lead.qualified` ops event with partner + fee tier for weekly reconciliation.

**Outputs:** delivered lead, attribution row for `cron_partner_recon`, revenue ledger entry ($75–$250/lead by category).

**Edge cases:**
- **No opt-in → no lead.** CTAs only; user contact data never leaves the platform without an explicit click (consent-based rule, see `feedback_no_scraped_cold_send`).
- **No partner in geography:** suppress the CTA entirely rather than routing to a mismatched partner.
- **Partner SLA breach (no response in 48h):** flag partner, exclude from rotation until reviewed.
- **Same flag re-parsed:** dedupe leads per (user, property, clause) per 90 days.
