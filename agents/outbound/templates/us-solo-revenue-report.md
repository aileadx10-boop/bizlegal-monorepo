# Campaign #1 — US solo / small hourly-billing firms → free totals on /practice-revenue

**Product:** `practice_revenue_report` (free totals → $99 unlock). **Jurisdiction:** US only (CAN-SPAM). **Status:** draft until Moses approves on `/sales`. **Sender:** the dedicated domain via Instantly; the package appends the footer (postal address, one-click unsubscribe, "This is not legal advice.", STOP, "not a law firm").

Rules for every variant: 80–110 words · subject ≤ 6 words · exactly one true specific about the firm, taken from its own website ({{specific}}) · one sourced number · one async CTA · no call, no "safe", no "compliant", no "guaranteed", no client names · first name only ({{first_name}}); if unknown, "Hello,".

## Variant A — the two numbers

Subject: `Past due 60+ days, in seconds`

```
{{greeting}}

{{specific}} — so this may be relevant. Your billing software already holds two totals most solos never add up: what is past due 60+ days, and what was worked but never invoiced.

I built a page that takes the invoice CSV you already export from your billing software and returns what is past due 60+ days in seconds, and, if you add a time-entry export, what was never billed. Client names never leave your browser — they are replaced with codes before upload.

Free totals here: {{cta_url}}

Moses Dor, founder, BizLegal AI — a software company, not a law firm
```

## Variant B — the export you already have

Subject: `Your billing export, read back`

```
{{greeting}}

{{specific}}. If you bill by the hour, your billing software already holds the answer to a question most solos never get around to asking: how much of last quarter's work was invoiced late, and how much was not invoiced.

I made a page that reads the CSV export (invoices, and time entries if you keep them) and prints the totals: open receivables by age, unbilled work, collection and realization rates, with the formula next to each number. Names are replaced with codes in your browser before anything is uploaded.

It takes about two minutes and the totals are free: {{cta_url}}

Moses Dor, founder, BizLegal AI — a software company, not a law firm
```

## Follow-ups (day 3, day 7; then stop — `outbound_followups_max = 2`)

Day 3, subject `{{original_subject}} (follow-up)`:
```
{{greeting}}

One line in case the earlier note got buried: the totals page needs only the invoice CSV, nothing is connected to your accounts, and the client names stay in your browser. {{cta_url}}

Moses
```

Day 7, subject `{{original_subject}} (follow-up)`:
```
{{greeting}}

Last note from me. If a revenue read-back is not useful this quarter, reply STOP and you will not hear from me again. If it is, the free totals are here: {{cta_url}}

Moses
```

## Approved reply set (auto-sent only for these four intents; everything else escalates)

- **interested** — "Thank you. The page is {{cta_url}}: choose the invoice CSV, the browser replaces names with codes and shows you the mapping, and the totals appear in seconds. If a column is not recognised, the page tells you which one. Reply here with anything unclear; I answer in writing."
- **question: which export / which tool** — "Any CSV with an invoice number, client, issue date and amount works; a paid amount or balance column unlocks aging. Your billing tool's invoice or bills list export normally carries these columns; if a column is not recognised, the page names which one. There is also a one-tab template on the page."

_Council note (2026-09-07): market figures (Clio 93% / 88%) return to the templates only after `CLIO_LEGAL_TRENDS_2025.verified` is true, and never with the $288 solo rate attached to Clio (that figure is Embroker/ABA). No simulated `Re:` threads. Tool-specific export paths only after someone has clicked them._
- **pricing** — "The totals are free and kept 14 days. The full report — every overdue invoice with a reminder drafted, every unbilled entry, clients ranked by collected money per hour, timing counterfactuals — is $99 once, by card or crypto, and stays available 180 days. There is no subscription."
- **objection: privacy / client confidentiality** — "Understood — that was the design constraint. Nothing connects to your inbox or practice software; you upload a CSV you already have; before upload your browser replaces every client, matter and invoice identifier with a code, and only your browser holds the key. The server stores codes and amounts. The page describes exactly that, and I am glad to answer any specific question in writing."
- **not_now** — "Understood. I will not follow up; the page stays where it is if it becomes useful."
- **stop / unsubscribe** — no reply; address suppressed.
- **wants_call** — "I work in writing — it keeps everything reviewable — so I do not take calls, but I answer every question by email, usually the same day." (escalated to Moses as well)
- **legal_question** — never answered by the machine; escalated to Moses with the thread.
