# Workflow — `/learn` email nurture

**Created:** 2026-07-30 (Nifty Haven Phase 0)
**Capture:** `apps/hub/app/learn/TrackSignup.tsx` → `POST /api/newsletter`

Fully async. No webinars, no cohorts, no calls, no camera. The reader reads, the
sequence lands in their inbox, and they buy or they do not.

---

## 0 — The consent rule (non-negotiable)

`/learn` signups are **double opt-in**. `POST /api/newsletter` stores
`double_optin_confirmed = false` and sends one confirmation email. Nothing else
is ever sent until they click.

This is the same rule that killed the scraped-address pipeline on 2026-07-10 and
it applies here without exception:

- **Never** send to an address that is not `double_optin_confirmed = true`.
- **Never** import an address into the `/learn` list from any other source —
  not `lead_outreach`, not a crawl, not a guess.
- The suppression list is authoritative. Unsubscribe means unsubscribe, and it
  applies across every BizLegal list, not just this one.
- Do not swap `TrackSignup` for a direct table write. That was the bug the
  2026-07-10 rebuild fixed.

Segmentation: `source = 'learn'`, `vertical_interest = <track slug>`. That field
is what makes the sequence below track-specific.

---

## 1 — The sequence (5 emails, 18 days)

Sent only after confirmation. Same skeleton for both tracks; the content differs
because the audiences do.

| # | Day | Purpose | Real Estate | Founders |
|---|---|---|---|---|
| 1 | 0 | Deliver | Link the free lessons. Nothing else. No pitch. | Same |
| 2 | +3 | Teach | One concrete thing the reader can check on their own deal today | One obligation founders routinely miss |
| 3 | +7 | Prove | Where the free lessons stop and what the rest of the track covers | Same, plus the matching guide |
| 4 | +12 | Cross-sell | DocAI $97 contract scan — the tool version of lesson 2 | Forge BOI $149 or LexAudit $99/mo, whichever the guide already recommends |
| 5 | +18 | Ask | "Is the rest of this track worth $240/yr to you? Reply yes or no." | Same at $180/yr |

Email 5 is the actual demand test. A reply is the signal; there is no checkout
to click yet, and pretending otherwise would be dishonest.

## Rules for every send
- One link per email. Two links halve the signal.
- No fabricated statistics, no invented case studies, no implied credentials.
- Every email carries the not-legal-advice line and a working unsubscribe.
- Reply-to is a monitored inbox. If it is not monitored, do not send email 5.

---

## 2 — What gets measured

Two weeks after `/learn` is live, per track:

- confirmed signups (`double_optin_confirmed = true`, `source = 'learn'`)
- free-lesson pageviews (Plausible — **blind until Moses creates the property**)
- email 5 replies: yes / no / silent
- attributed clicks to DocAI / Forge / LexAudit

**Decision rule.** Build out the track with more lessons and a real checkout only
where email 5 gets yes-replies. One track winning and one dying is the expected
outcome, not a failure — that is what running two was for. Both silent means
`/learn` stops at Phase 0 and the effort goes back to the products that already
have checkout.

---

## 3 — Automation status

- Capture: **live** (`TrackSignup` → `/api/newsletter`, double opt-in).
- Sequence: **not built.** No cron, no queue, no templates yet. Five emails
  drafted and sent by hand is the correct first version — writing a scheduler
  before knowing whether anyone signs up is exactly the mistake this whole
  demand test is meant to avoid.
- When it is worth automating, reuse `@bizlegal/nurture-enqueue` and Resend.
  Do not add a new event type (Phase Z hard rule) — `nurture_enqueued` covers it.
