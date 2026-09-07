# Workflow — Outbound campaign (rule 7 v2)

**Objective:** put an async offer in front of verified, lawfully-contactable US professionals without Moses writing, sending or answering anything except an approval and escalations. Decision: `decisions/OUTBOUND-V2-RULE-7-AMENDED-2026-09-07.md`.

**Inputs:** a campaign row (`sales_campaign`: ICP, templates, reply set, cap, jurisdictions, product, CTA) filed by the routine or a session; the env switches in the vault.

**Tools:**
1. **Source + draft** — cloud routine `bizlegal-outbound-headhunter` (`agents/outbound/ROUTINE-headhunter.md`), Clay + Supabase connectors. Writes `sales_lead` (with `source_url`) and `sales_outreach` (`drafted`). Never sends.
2. **Approve** — Moses on `/sales` → Campaigns panel → "Approve — may send within caps" (`PATCH /api/sales/campaigns`, sets `running` + `approved_by`). Enter the Instantly campaign id there if it is not set.
3. **Verify + send** — `/api/cron/outbound-dispatch` every 30 min: ZeroBounce verification once per lead, lawful basis from `lib/outbound/lawful-basis.ts`, campaign state from tables (`lib/outbound/campaign.ts`), then `sendOutbound()` in `@bizlegal/email` which refuses unless every invariant holds (verified `valid`, not a role inbox or blocked domain, basis + `source_url`, not suppressed, campaign running + approved, `OUTBOUND_AUTOSEND=1`, caps, cooldown, touch cap, real postal address, unsubscribe, sender domain, reputation not breached). Sends go to Instantly on the dedicated domain, never to Resend.
4. **Feedback** — Instantly → `/api/webhooks/outbound` (shared secret, idempotent): bounces/complaints/unsubscribes → `email_suppression_list`; replies → `sales_reply`.
5. **Reply** — the routine classifies `sales_reply`, auto-answers only interested / question / pricing / objection from the approved set; escalates legal questions, call requests and low-confidence replies to Moses (Telegram + `/sales` hot replies).
6. **Learn** — two variants per campaign; the routine reports reply rate per variant after 100 sends each; Moses edits templates.
7. **Report** — the morning brief prints sent / bounced / complained / replied / unsubscribed / free reports / paid, all from tables.

**Caps (rows in `sales_cap`, migration `20260908_outbound_v2.sql`):** 20 per mailbox per day (hard max 50 in code) · 3 touches per lead per 30 days · 5-day cooldown · 2 follow-ups · auto-pause at 2% bounces or 0.1% complaints over the trailing 200 sends (≥ 50 sends).

**Ramp:** week 1 = 20/mailbox/day on 2 warmed mailboxes; week 3 = 40; never above 50. Warm-up runs 2–4 weeks before the first campaign is approved.

**Edge cases:** campaign auto-paused → Telegram; Moses cleans the list and presses Resume. Unmatched webhook email → logged, no action. Lead replies STOP in any form → suppressed, lead `unsubscribed`. A draft approved from the old per-message panel with an `outbound_*` source is queued, never sent from there.

**Never:** constructed addresses · EU or Israel recipients · role inboxes · a call in any template · a legal answer from the machine · a number without a source · a send while `OUTBOUND_AUTOSEND` is unset.
