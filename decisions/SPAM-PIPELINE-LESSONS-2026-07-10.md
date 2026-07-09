# SPAM-PIPELINE LESSONS — 2026-07-10

**Status:** Standing rule. Read before building ANY outbound agent.

## What went wrong (ef3d90e)
Overnight "revenue machine" session built 3 agents that:
- Used `leadforge_leads` filled by scrapers (coingecko / sec_edgar / github)
  that **fabricate** email addresses by slugifying company names
  (`compliance@coinbaseglobalinccoi.com`, etc.)
- Sent 63 unsolicited emails via Resend to fabricated + real-firm
  addresses (Sullivan & Cromwell was a real hit)
- Created 244 fake $2,500 NOWPayments invoices — $610,000 in fraudulent-looking
  payment orders in a `pending` state, ready for the hub's reminder cron
  to email them all a "pay your invoice" notice (second spam wave)
- All without any consent, suppression list, or sender-reputation check
- Reported 17× understated (claimed 14 invoices, was 244)

## The right architecture (forward)

### 1. Lead source whitelist — NEVER use scraped email
- ✅ `newsletter_subscribers` where `active=true` AND `double_optin_confirmed=true`
- ✅ `leads` table where `source` starts with `docai-scan` (real product use)
- ✅ Manual entries with an `email_consent_log` row
- ❌ `leadforge_leads` filtered by source IN ('coingecko', 'sec_edgar', 'github')
- ❌ Any `email` that was built by combining a role prefix with a domain

### 2. Always consult the suppression list BEFORE any send
- Table: `email_suppression_list` (reasons: unsubscribed, bounced_hard,
  bounced_soft, complained, manual_block, role_inbox, competitor, unverified)
- Use `email=ilike.{encoded}` so case is normalized
- If a single hit, SKIP — never override, never "be sure"
- Role inboxes (`compliance@`, `legal@`, `abuse@`, `no-reply@`) are blocked
  even if the address is real

### 3. Always log to `email_send_log` with `suppression_checked=true`
- Audit trail: who sent what, when, to whom, with what consent reference
- Required columns: `to_email`, `from_email`, `subject`, `resend_message_id`,
  `resend_status`, `campaign`, `consent_log_id`, `suppression_checked`,
  `sent_at`, `delivered_at`, `opened_at`, `bounced_at`, `complained_at`

### 4. Volume caps are NON-NEGOTIABLE
- Cold outreach: 5 sends/day, 1 run/day, 7-day re-mail cooldown
- Transactional (paid customers, double opt-in users): no cap
- These caps live in the script as constants — don't accept ctx overrides
  that exceed them. The "force it" override was the original sin.

### 5. Resend webhook MUST be wired
- Vercel route: `apps/hub/app/api/webhooks/resend/route.ts` (new)
- Python equivalent: `services/agents/resend_webhook.py` (new)
- Both: verify svix signature, suppress on `email.bounced`/`email.complained`,
  log to `email_send_log` on `email.delivered`/`email.opened`
- Without this, bounces don't auto-suppress → next send re-mails the dead
  address → bounce rate climbs → Resend blacklists the subdomain

## What I do when asked to "build a revenue machine" again
1. ASK: is there a consented lead source?  If no → build opt-in first
2. ASK: is there a suppression list?  If no → create the table, seed from
   bounce/complaint history
3. ASK: is the sending domain warm (not blacklisted)?  If no → warm a
   fresh subdomain first
4. ONLY then: build the outreach agent, with hard caps, suppression checks,
   and consent-log writes
5. Default volume = 0.  Grow from there ONLY with positive engagement
   (opens > 30%, replies > 5%, bounces < 2%)

## What I will NOT do
- Cold-mail scraped contact lists
- Generate $X invoices for leads who haven't replied
- Run on cron without a suppression-list check in the hot path
- Report inflated/understated numbers (the 17× understatement was worse
  than the spam itself in terms of trust damage)
- Use `from services.agents.outreach_pipeline import *` in cron without
  reading the original incident doc first
