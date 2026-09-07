# Campaign #2 — law-practice bookkeepers and practice consultants → affiliate invitation

**Product:** the affiliate program (existing: `affiliates`, `affiliate_clicks`, `/api/cron/affiliate-reconcile`; 20% on referred one-time purchases). **Why:** partners sell so Moses does not. **Jurisdiction:** US only. **Status:** draft until Moses approves on `/sales`.

Same rules as campaign #1: one true specific from their site, one sourced number, async CTA, footer appended by the package, no calls.

## Variant A

Subject: `A report your law-firm clients can use`

```
{{greeting}}

{{specific}} — which is why I am writing to you rather than to your clients. The lawyers you keep books for carry two totals nobody adds up for them each quarter: what is past due 60+ days, and what was worked but never invoiced.

I built a Practice Revenue Report: the lawyer uploads their invoice CSV, the browser replaces client names with codes, and the page returns aging, unbilled work, collection and realization rates and drafted reminders. Free totals; $99 for the full report.

There is an affiliate program (20% on referred purchases, tracked by a link, paid out weekly). No calls, no onboarding meeting — a link and a written explainer: {{cta_url}}

Moses Dor, founder, BizLegal AI — a software company, not a law firm
```

## Follow-up (day 5, then stop)

```
{{greeting}}

One follow-up only. If a revenue read-back for your law-firm clients is not a fit, reply STOP. If it might be, the affiliate explainer is here: {{cta_url}}

Moses
```

## Approved reply set

- **interested** — "Thank you. The explainer and sign-up are at {{cta_url}}; the link is minted instantly and the report page carries your code. Everything is in writing; reply with any question."
- **question: how are referrals tracked** — "A referral link sets a first-touch cookie; a purchase within its window is attributed to your code and appears in your affiliate view. Payouts reconcile weekly."
- **pricing / commission** — "20% of referred one-time purchases. The report is $99, so $19.80 per unlock; there is nothing to buy on your side."
- **objection: I do not recommend tools to clients** — "Understood. Some bookkeepers use the free totals themselves as a quarter-end read-back for a client and never mention the paid report; the affiliate link is optional."
- **not_now** — "Understood; no follow-up from me."
- **wants_call** — "I work in writing, so no calls — but every question gets a written answer, usually the same day." (also escalated)
- **legal_question** — escalated to Moses; never answered by the machine.
