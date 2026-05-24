# Manual Outreach Template — Week 5 Track A

**Purpose:** While the Reddit scraper bakes (Track B), drive immediate inbound to OCI by 5 cold emails per Mon/Wed/Fri + 1 LinkedIn post/comment per day.

**Target:** 3 inbound leads via `/contact` form by end of Week 5.

**Brand voice:** practitioner peer-to-peer (not vendor pitching). The hook is intelligence delivered, not a product demo. Body copy never claims "we'll guarantee X" or "we replace lawyers" — both are explicit liability traps per the revenue-vs-liability rule.

---

## Cold email — variant A (compliance officer at a fintech/crypto exchange)

**Subject lines (rotate):**
1. `Quick read: MiCA Title V scope on your Q3 plans`
2. `5-min compliance brief: TCPA + your outbound stack`
3. `BOI exposure check, no signup — just a result`

**Body (~120 words):**

```
[FirstName],

I run BizLegal AI — regulatory intelligence for compliance officers and
GCs at digital-asset and fintech companies. Saw [specific recent post /
funding round / regulator filing the prospect was in] and wanted to
share something concrete.

We just published [reference one specific gap-page or blog article that
applies to their situation, e.g. "the MiCA Title V passporting walk-
through" at https://forge.bizlegal-ai.com/gap/eu/mica-title-v-passporting].
It's a 6-minute read on what changes for [issuers / MSBs / exchanges
operating in EU after July 2026 → adapt to prospect].

If you want a faster signal, our free preliminary check at
https://bizlegal-ai.com/risk-engine takes ~60 seconds and returns a
specific exposure flag — no email gate until the result is on screen.

If neither is useful right now, hit reply with what you ARE chasing and
I'll point at the relevant primary source.

— Moses
DOR INNOVATIONS · BizLegal AI
team@bizlegal-ai.com · https://bizlegal-ai.com
```

**Why this works:**
- Specific reference (their post / filing / round) > generic personalization
- Free useful content > "let's hop on a call"
- Two soft entry points (article + risk-engine) — visitor self-selects
- Explicit out-clause ("hit reply with what you ARE chasing") — converts "no" into "tell me more"
- No demo ask, no pricing in first email, no "could we get 15 minutes"

---

## Cold email — variant B (general counsel / in-house lawyer at a tech company)

**Subject lines:**
1. `Regulatory drift watchlist — your stack`
2. `Multi-framework compliance check, free`
3. `Friday GC reading: what's hitting your inbox in Q3`

**Body:**

```
[FirstName],

GC at a company in [their vertical] — your inbox right now is probably
30% Q3 framework drift (CCPA amendments, MiCA Title V, FinCEN Travel
Rule scope creep, etc.). BizLegal AI maintains a watchlist of which
frameworks ACTUALLY change behavior vs which are noise.

This week's brief covers [pick 1-2 specific frameworks relevant to
them]: https://blog.bizlegal-ai.com/[slug-or-section].

If you want to throw a specific question at our practitioner network
(real estate UAE, business setup SG, US/EU cross-border, general legal
risk), the intake at https://bizlegal-ai.com/contact gets you routed
within one business day. Free for the first inquiry.

— Moses
DOR INNOVATIONS · BizLegal AI
team@bizlegal-ai.com
```

**Why this works:**
- Frames our value as a *filter on regulatory noise* (specific, useful)
- Lists actual partner network classifications inline (sells the lead-routing)
- Free first inquiry = anchors a real conversion path, not a demo

---

## Cold email — variant C (founder of a small fintech / crypto startup)

**Subject lines:**
1. `Pre-launch compliance check: 5 min, no charge`
2. `What [SEC / MAS / VARA / FCA] cares about for your model`
3. `Your stage, your compliance burn, your exposure`

**Body:**

```
[FirstName],

Saw [company / product launch / pitch]. You're at the stage where
compliance is either "we'll deal with it post-Series A" or "this is the
single thing that kills us." It's usually the latter.

BizLegal AI runs a free preliminary check at
https://bizlegal-ai.com/risk-engine — ~60 seconds, returns the 3 most
relevant frameworks for your model + the exposure value if you ignore
them. No call, no pitch.

If you want a faster human read, our network routes inquiries to:
- UAE / DIFC operations → re_lawyer + realtor
- Singapore business setup → business_lawyer
- US/EU cross-border → structuring_advisor

First inquiry is on us. Intake: https://bizlegal-ai.com/contact

— Moses
DOR INNOVATIONS · BizLegal AI
```

**Why this works:**
- Names the stage problem directly (founder reads this in 4 seconds)
- 60-second tool is the call-to-action with the lowest possible friction
- Partner network is named — frames us as a routing engine, not a single human

---

## LinkedIn post template — daily content

Goal: one post/comment per day, riffing on whatever just landed in the curator pipeline.

### Variant 1 — explainer post (Mon, Wed, Fri)

```
[Open with the regulator name + a date]

Last [day], [regulator] published [specific filing / enforcement / guidance].

What it means in practice for [target audience — e.g. crypto MSBs]:
  • [Concrete change 1]
  • [Concrete change 2]
  • [Deadline + the cost of missing it]

The framework I'd watch next: [related framework].

Full brief (no email gate): [link to the curator-published blog or gap-page]

#RegulatoryCompliance #[Vertical] #[Framework]
```

### Variant 2 — comment on regulator news (Tue, Thu)

When a major regulator news drops on LinkedIn (FCA, MAS, SEC, MiCA, DIFC):

```
The under-reported piece here is [one specific second-order effect that
the main news coverage misses].

For [target audience], this is a [tier-1/2/3] event because [why it
matters more than the headline implies].

We wrote up the practitioner read at [link to relevant BizLegal AI brief]
— it covers [specific question the comment raised but didn't answer].
```

**Why this works:** Adds value to someone else's post (favored by the algorithm), establishes domain authority, drops the link as a citation not a promotion.

---

## Tracking

Each email + post should include a UTM-tagged URL pointing at either:
- `https://bizlegal-ai.com/contact?utm_source=outreach_email&utm_medium=cold&utm_campaign=2026-05-week-19&utm_content=[variant-id]`
- `https://bizlegal-ai.com/risk-engine?utm_source=outreach_email&utm_medium=cold&utm_campaign=2026-05-week-19&utm_content=[variant-id]`
- `https://forge.bizlegal-ai.com/gap/[slug]?utm_source=outreach_li&utm_medium=post&utm_campaign=2026-05-week-19`

Track in `/ops` dashboard: search the Live event tape for `lead.inbound` events with `metadata.utm_source=outreach_*`. Each reply that converts to a `/contact` submission becomes a `lead.inbound` event with the tagged source — Week 5 target ≥3.

---

## Operational checklist

**Mon AM (today, after deploys settle):**
- [ ] Pick 5 prospects from existing CRM / Twitter / LinkedIn (target list per variant)
- [ ] Personalize the [bracket] fields per prospect
- [ ] Send 5 cold emails before 11:00 local
- [ ] Schedule 1 LinkedIn post for 15:00 local

**Wed AM:**
- [ ] 5 more emails (rotate variant)
- [ ] 1 LinkedIn comment on a regulator news post

**Fri AM:**
- [ ] 5 more emails
- [ ] 1 LinkedIn post + 1 comment

**End of week:** count `lead.inbound` events with outreach_* UTM in /ops. Iterate variants whose CTR is below threshold.
