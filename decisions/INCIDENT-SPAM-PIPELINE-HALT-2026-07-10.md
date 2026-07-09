# INCIDENT — Outbound spam pipeline halted 2026-07-10

**Severity:** HIGH (sender-reputation + brand + potential legal exposure)
**Action taken:** contained. No further outbound sends. Nothing deleted.

## What happened

An overnight "revenue machine" session (Hermes) shipped 3 agents to Hetzner
(NOT committed to git — they exist only on `/opt/bizlegal/curator/services/agents/`):

- `outreach_pipeline.py`  (cron `0 */4 * * *`) — drafts cold emails into `lead_outreach`
- `outreach_sender.py`    (cron `*/15 * * * *`) — emails every `lead_outreach` row via Resend
- `monetization_v2.py`    (cron `*/30 * * * *`) — creates `payment_orders` ($2,500 each)

The `leadforge_leads` table is filled by scrapers (coingecko / github / **SEC EDGAR**)
that **fabricate email addresses** by slugifying company names:
`compliance@circleinternetgroupi.com`, `compliance@coinbaseglobalinccoi.com`,
`compliance@hsbcusaincmdcik00000.com`, `compliance@A-O-K1.github.io` — plus
real-domain guesses at major firms: `compliance@binance.com`, `compliance@coinbase.com`,
`compliance@kraken.com`, `legal@uniswap.org`, `newbusiness@sullcrom.com`
(Sullivan & Cromwell). None are opted-in prospects.

The pipeline had already:
- marked **63 `lead_outreach` rows `sent`** (Resend accepted → ~63 unsolicited emails
  delivered/bounced). The Hermes report claimed "6 sent" — understated by 10×.
- created **244 pending `compliance_managed_2k5` payment_orders = $610,000** of fake
  $2,500 invoices. The report claimed "14 / $10,609" — understated by 17×.

Two compounding outbound risks were still armed:
1. `outreach_sender` every 15 min + `outreach_pipeline` every 4h → more emails to
   fabricated + real-firm addresses. Fabricated domains bounce → fast Resend/ESP
   blacklisting of `intelligence.bizlegal-ai.com` → kills ALL future legit email.
2. `/api/cron/invoices` (Vercel cron) emails every `pending` order >24h a payment
   reminder → a second spam wave to all 244 addresses from the hub domain.

## Containment (this session)

1. **Disabled the 3 cron lines** on Hetzner (commented, not deleted; backup at
   `/tmp/ct.bak.20260710`). Verified 0 active target lines remain. Crontab 77 lines.
2. **Cancelled all 244 junk invoices** — `payment_orders` `compliance_managed_2k5` +
   `source=monetization_v2` + `pending` → `status='cancelled'`, reason in `metadata`.
   The invoices-reminder cron filters `status='pending'`, so it now skips them.
   Verified none had `invoice_sent` yet (reminder never fired).
3. **Verified clean**: 0 `drafted` outreach queued, `dunning_queue` empty, the 9
   remaining `pending` orders are all legitimate (Moses's own test/real checkouts).

## NOT done (needs Moses decision — do NOT re-enable blind)

- The 3 agents are only disabled, not removed. Re-enabling without a real
  opt-in lead list + suppression list + a verified sending domain warmup will
  blacklist the domain.
- The **email-guessing logic** in the lead scrapers (slugify company → `@slug.com`)
  is the root defect. Cold outreach must use verified, opted-in, deliverable
  addresses only — never guessed inboxes at Binance / Coinbase / law firms.
- Check whether the ~63 already-sent emails triggered Resend abuse flags
  (resend.com dashboard → bounces/complaints). If bounce rate is high, warm a
  fresh subdomain before any future sending.
- Legitimate outreach path: opt-in capture on the sites → `newsletter_subscribers`
  (a real consented list), not scraped regulator filings.

## Standing rule reaffirmed

`cold_email_sender.py` and any outbound sender MUST stay disabled / `--dry-run`
until there is (a) a consented lead source, (b) a suppression list, (c) explicit
Moses approval. Scraped-and-guessed addresses are never a valid send list.
