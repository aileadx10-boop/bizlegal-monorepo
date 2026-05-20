# Cold Pitch Queue — 2026-05-20
**Status:** drafted, READY TO SEND — Moses verifies recipient + clicks send

The checkout URLs below are LIVE on production as of PR #42 merge today. The recipient clicks → email gate → "Pay with Crypto" (NOWPayments) or "Pay with PayPal/Card" (PayPal Orders v2) → real payment lands in your account.

**The live URL Moses should test FIRST (place a $1 self-purchase) before sending any of these:**
```
https://bizlegal-ai.com/checkout?product=brai&tier=standard&interval=one-time&amount=14900&name=BRAI%20Standard
```

---

## Pitch A — Compliance lead at a crypto exchange (BRAI Standard, $149)

**Subject lines (rotate per recipient):**
1. `5-min question on MiCA Title V passporting`
2. `Quick regulatory note — your Q3 prep`
3. `BRAI report on [their jurisdiction] crypto rules`

**Body (~120 words):**

```
[FirstName],

I run BizLegal AI — regulatory research software for in-house compliance teams.
Software, not a law firm.

Saw [specific signal — recent funding round, regulator filing, MiCA-related
LinkedIn post, etc.]. Thought you might find our BRAI report useful before
you brief your team this quarter.

BRAI Standard is a $149 one-time written report on a single regulatory
question (e.g. "what changes for our token under MiCA Title V passporting
between us and Germany?"). 24-hour turnaround. Citations to ESMA + national
competent authority primary sources. Software-generated, peer-reviewed
before delivery. Non-refundable once produced.

If useful, the direct checkout is:
https://bizlegal-ai.com/checkout?product=brai&tier=standard&interval=one-time&amount=14900&name=BRAI%20Standard

If not relevant right now, what IS hitting your inbox lately? Always glad
to be pointed at a primary source for our own watchlist.

— Moses
DOR INNOVATIONS · BizLegal AI
team@bizlegal-ai.com
```

**Why this works:**
- Specific personal signal (their post / filing) > generic personalization
- Frames as research tool, not legal advice (matches new positioning + reduces UPL risk)
- Single clear $149 offer with direct checkout link
- Explicit out-clause that converts "no" to "tell me what you ARE chasing"
- Closes asking THEM for info — reciprocity hook

---

## Pitch B — GC / in-house legal at B2B SaaS or fintech (DocAI Starter, $29/mo)

**Subject lines:**
1. `Quick DocAI question on contract review automation`
2. `Friday GC reading: subpoena response in 60 seconds`
3. `Document review software — first 25/month free this week`

**Body:**

```
[FirstName],

GC at [their company] — quick one. We built DocAI as a software-only
clause analyzer for in-house legal teams who don't want to spend $400/hr
on standard NDA + SOW review.

You upload a document, the software flags risky clauses (unlimited
liability, indemnification scope, governing-law conflicts) with line-level
citations + plain-English context. It's a triage tool — your final call,
your counsel's review, always.

Starter is $29/month for 25 documents:
https://bizlegal-ai.com/checkout?product=docai&tier=starter&interval=monthly&amount=2900&name=DocAI%20Starter

The cancel-anytime fine print is real — no minimum term, no auto-yearly
upgrade. Software, not a law firm; outputs are research, not legal advice.

Worth a look or no? If no — what tool you DO use for first-pass review?

— Moses
DOR INNOVATIONS · BizLegal AI
```

**Why this works:**
- Specific persona pain (NDA review costs)
- Software-tool framing, not "AI legal advisor"
- Low-commitment $29 trial
- Cancel-anytime + no auto-upgrade explicitly stated
- Disclaimer inline

---

## Pitch C — Founder of a regulated startup (Hub Pro Monthly, $149/mo)

**Subject lines:**
1. `Quick compliance question on [their company]`
2. `Regulatory monitoring SaaS — first month $149`
3. `One question on your compliance stack`

**Body:**

```
[FirstName],

Saw [signal — their funding, product launch, or jurisdiction-specific
news]. One quick question.

Are you tracking SEC, FinCEN, MiCA, GDPR (plus 3 more frameworks) by
hand or via a paid tool? Hub Pro is the latter — $149/month, software
that monitors 7 frameworks across 50+ jurisdictions and surfaces material
changes in a weekly digest.

We're not a law firm. We're a research and monitoring tool. Outside
counsel still owns your final legal calls; we make their job faster.

Direct checkout:
https://bizlegal-ai.com/checkout?product=hub&tier=pro&interval=monthly&amount=14900&name=BizLegal%20Hub%20Pro

If the tool's not relevant, what IS your current monitoring approach?
Always interested in how teams handle this.

— Moses
DOR INNOVATIONS · BizLegal AI
team@bizlegal-ai.com
```

---

## Sending playbook

1. Pick the pitch matching the recipient persona
2. Replace `[FirstName]`, `[specific signal]`, `[their jurisdiction]`, `[their company]`
3. Send 3-5 a day, NOT a blast (high deliverability over volume)
4. Best send window: Tuesday-Thursday, 09:00-10:30 recipient local time
5. Subject A/B test: alternate per batch of 5; track replies per subject

## Track replies

For every reply (positive OR negative), log to `decisions/cold-outreach-replies-2026-W21.md` with:
- Recipient name + role + company (or anonymized handle)
- Pitch variant + subject used
- Reply text (verbatim, redacted as needed)
- Action taken
- Outcome (closed sale / nurture / dead)

This is your first sales-conversion dataset.

## Tracking pixel (optional)

If you want open-tracking, append `?utm_source=cold_outreach&utm_medium=email&utm_campaign=2026_w21&utm_content=brai_standard` to the checkout URL. Hub already emits `payment.intent` events with this metadata to ops_log → you'll see which pitch converted in the dashboard.
