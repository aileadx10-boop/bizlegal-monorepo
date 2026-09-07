# Rule 7 amended — outbound v2 (2026-09-07)

**Status:** decided by Moses · **Order:** O-021 · **Instruction:** "diverse from rule 7 — llm and ai can scrape, persuade, headhunt and sell" · **Choices:** per-campaign approval then auto-send; Clay + dedicated cold sender + ZeroBounce-class verification; cap moves from ≤$200 to ≤$350/mo with an itemised outbound line.

## 1. What rule 7 said, and why

"Outbound is inbound-only" was written after the 2026-07-10 incident (`INCIDENT-SPAM-PIPELINE-HALT-2026-07-10.md`, `SPAM-PIPELINE-LESSONS-2026-07-10.md`): a pipeline that **fabricated addresses** by slugifying company names, sent 63 unsolicited mails from the transactional domain with **no approval step**, created 244 fake $2,500 invoices, had a **kill-switch that failed open**, and **under-reported by 17×**. The rule was made mechanical on 2026-08-20 as a vocabulary ban in `scripts/audit-shared-stream.mjs`.

## 2. Rule 7 v2

Outbound is allowed when, for every recipient:

1. the address is **provider-verified** (`valid`), never constructed or guessed; role inboxes and government / competitor domains are refused;
2. a **lawful basis** for the recipient's jurisdiction is recorded with the `source_url` where the business address was published (v1: US CAN-SPAM only);
3. suppression, one-click unsubscribe, bounce and complaint feedback are enforced **inside `@bizlegal/email`** (`kind: 'outbound'`), with a fail-closed store lookup;
4. the campaign is approved **and** running **and** `OUTBOUND_AUTOSEND=1`; any of the three absent → nothing sends;
5. caps are `sales_cap` constants with a hard 50/mailbox/day ceiling in code that no row can raise; 3 touches per lead per 30 days; 5-day cooldown; 2 follow-ups;
6. the CAN-SPAM footer (real postal address, unsubscribe, "This is not legal advice.", STOP, "not a law firm") is assembled by the package, never by a template; a placeholder address refuses;
7. a campaign whose trailing bounce rate exceeds 2% or complaint rate 0.1% (over ≥ 50 of the last 200 sends) pauses itself and pings Telegram;
8. every send writes `sales_consent_log` → `email_send_log` → `sales_outreach` → `sales_lead`, in that order;
9. auto-replies only for interested / question / pricing / objection from the campaign's approved set; legal questions and call requests always escalate; nothing ever offers a call.

Cold mail goes through the dedicated warmed domain on the Instantly adapter. It never touches Resend (its AUP forbids it) or `intelligence.bizlegal-ai.com`. Numbers reported to Moses come from tables.

## 3. Incident lesson → code

| Lesson (2026-07-10) | Where it is enforced now |
|---|---|
| Never scraped/guessed addresses | invariant 1: `verifiedAt` + `valid`; routine writes only provider-returned published addresses with `source_url` |
| Suppression before any send | `sendOutbound()` → `isSuppressed()` fail-closed; webhook writes bounces/complaints/unsubscribes to the list |
| Log every send with consent reference | dispatch cron writes consent log + send log per send |
| Caps are constants, no ctx override | `sales_cap` rows + `HARD_MAX_PER_MAILBOX_PER_DAY` in code |
| Bounce feedback must be wired | `/api/webhooks/outbound` (shared secret, idempotent) |
| Reports must be true | digest counts from tables; `email.sent` events per send |
| Kill-switch must fail closed | `OUTBOUND_AUTOSEND` unset → refuse; campaign not running → refuse |

## 4. Legal matrix

See `REVENUE-OS-IDEAS-RATED-2026-09-07.md` §5 and `apps/hub/lib/outbound/lawful-basis.ts`. Moses confirms before any non-US row is enabled, and confirms that Israeli Amendment 40 does not bind an Israeli sender mailing US businesses, and that dropping "Adv." from sales mail resolves the Israel Bar advertising question.

## 5. Budget

Instantly ~$37–97/mo · 2 pre-warmed mailboxes ~$8–14/mo + domain ~$12/yr · ZeroBounce PAYG ~$20 per 2,000 · Clay workspace credits (Moses sets a ceiling) · Firecrawl/Apify already paid. Outbound line ≤ $150/mo; fleet cap ≤ $350/mo. Anthropic API credit unaffected: the routine runs on the subscription.

## 6. What changed in the repo

`packages/email/src/{outbound,senders/instantly,senders/types}.ts` (+33 tests) · `apps/hub/lib/outbound/{lawful-basis,verify,icp,campaign}.ts` (+5 tests) · `apps/hub/app/api/cron/outbound-dispatch` · `apps/hub/app/api/webhooks/outbound` · `apps/hub/app/api/sales/campaigns` · `apps/hub/app/sales/CampaignsPanel.tsx` · `/api/sales/drafts` queues `outbound_*` drafts instead of sending via Resend · `supabase/migrations/20260908_outbound_v2.sql` · `scripts/audit-shared-stream.mjs` check 3 → transport + call-site checks · `apps/hub/vercel.json` cron · vault names `OUTBOUND_AUTOSEND`, `OUTBOUND_SENDING_DOMAIN`, `OUTBOUND_POSTAL_ADDRESS`, `INSTANTLY_API_KEY`, `INSTANTLY_WEBHOOK_SECRET`, `ZEROBOUNCE_API_KEY` · `agents/outbound/` (routine prompt, templates, reply sets) · root `CLAUDE.md` §6 rule 7. `services/cron_jobs.txt` is untouched: nothing outbound runs on Hetzner.

## 7. What is still forbidden

Constructed or pattern-generated addresses under any name · EU or Israel recipients · role inboxes · LinkedIn automation or DMs · direct LinkedIn scraping (Clay providers only) · a call in any template · a legal answer from the machine · a number without a source · any send while `OUTBOUND_AUTOSEND` is unset.

**Sending domain decision (Moses, 2026-09-07):** a subdomain of bizlegal-ai.com, `notes.bizlegal-ai.com`, not a purchased domain. SPF/DKIM/DMARC records for the subdomain come from Instantly when the mailboxes are created; the transactional subdomain `intelligence.bizlegal-ai.com` stays separate. Vault: `OUTBOUND_SENDING_DOMAIN=notes.bizlegal-ai.com`.
