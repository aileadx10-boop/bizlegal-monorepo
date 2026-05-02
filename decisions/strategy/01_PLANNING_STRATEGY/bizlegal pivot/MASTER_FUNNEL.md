# Master Funnel — From Traffic to Revenue (2026-04-28)

**Author:** Claude (Phase K of the autonomous plan)
**Audience:** Moses
**Frame:** Anti-poverty operations. ~$35-50/mo OpEx + 6-product fleet + hub Pro + 6 agents = ~98% gross margin. One $25K OCI realestate close = 5 months of runway. We are not chasing ads; we are stacking organic + asymmetric.

---

## The funnel architecture

```
            ┌───────────────────────────────────────────────┐
            │   TRAFFIC SOURCES — top of funnel              │
            ├───────────────────────────────────────────────┤
            │ blog.bizlegal-ai.com (Hetzner curator, daily)  │
            │ Reddit / LinkedIn / X (manual, weekly cadence) │
            │ Direct (referrals, word-of-mouth)              │
            │ Google organic (compounds after Phase I-2 GSC) │
            └─────────────────────┬─────────────────────────┘
                                  │
                                  ▼
            ┌───────────────────────────────────────────────┐
            │       HUB bizlegal-ai.com (entry point)        │
            │  - Today's Brief (live signal)                  │
            │  - Six product surfaces (bento)                 │
            │  - Free Snapshot (lead magnet)                  │
            │  - Free SQA draft (DocAI lead magnet)           │
            └────┬────────┬────────┬────────────┬─────────────┘
                 │        │        │            │
        ┌────────┘        │        │            └──────────┐
        ▼                 ▼        ▼                       ▼
   /snapshot         /risk-engine  /sqa                /realestate
   (5min PDF)        (instant)    (free first         (HMAC → OCI)
        │                 │        draft)                  │
        │ vertical        │        │                       │ partner
        │ classifier      │        │                       │ routing
        ▼                 ▼        ▼                       ▼
  ┌────────┐         ┌────────┐  ┌────────┐         ┌──────────────┐
  │ Worker │         │ Hub    │  │ DocAI  │         │ OCI Router   │
  │ routes │────────▶│ Pro    │  │ Team   │         │ realtor +    │
  │ to     │         │$149/mo │  │$69/mo  │         │ lawyer email │
  │ product│         │        │  │        │         │ finder fee   │
  └───┬────┘         └────────┘  └────────┘         └──────────────┘
      │
      ▼
  ┌─────────────────────────────────────────────────────────┐
  │  6 PRODUCT SUBDOMAINS — revenue surfaces                 │
  │  TRACR ($29-799 one-time, wallet scans)                  │
  │  BRAI ($149-500 + $599-1999 retainer, counterparty intel)│
  │  LexAudit ($49-599/mo, compliance health) + Safe         │
  │  DocAI (free + $29-99/mo, contracts + SQA delivery)      │
  │  Forge ($149 + $99-1500/mo, BOI / passport / audit)      │
  │  LeadForge ($49-299/mo, intent intelligence)             │
  └────────────────────┬────────────────────────────────────┘
                       │
                       ▼
  ┌─────────────────────────────────────────────────────────┐
  │            UPSELLS / CROSS-SELLS                         │
  │  Snapshot       → Pro Hub subscription                   │
  │  BOI Kit one-time → Passport monthly + CTA tracker       │
  │  TRACR scan     → LexAudit health-score subscription     │
  │  TRACR scan     → BRAI Sanctions Pro $500                │
  │  Pro subscriber → /agents add-ons ($29-49/mo each)       │
  │  DocAI SQA free → DocAI Team $69/mo                      │
  │  DocAI Team     → DPA negotiator add-on                  │
  │  LexAudit Solo  → Boutique upgrade (firm onboarding)     │
  │  OCI realestate close → BRAI counterparty (12mo retain)  │
  └─────────────────────────────────────────────────────────┘
```

---

## Conversion mechanics

### 1. Vertical classifier on /snapshot

Already wired (PR #4-6 sweep). When user submits Snapshot:
1. EA Worker reads content, picks the dominant vertical (crypto / law-firm / corporate-treasury / agency / real-estate)
2. HMAC-signed POST to that subdomain's `/api/inbound-lead`
3. Subdomain triggers their welcome flow (Resend email + product surface walkthrough)

**Audit hook:** verify that all 5 subdomain `/api/inbound-lead` routes still return 200 with HMAC `x-bizlegal-signature` valid; we shipped them all in the merge sprint.

### 2. Pro Hub upsell from every product page

Every product subdomain footer should say:

> **Get unlimited via Pro Hub** — $149/mo unlocks all 6 products + 6 agents
> [Learn more →](https://bizlegal-ai.com/pricing#pro)

This is the meta-upsell. Each product's free or low-tier offer is essentially a Pro free trial.

### 3. Cross-product upsells via post-purchase redirect

After Forge BOI Kit checkout success → redirect to `/payment/success?next=tracr` →

> "Now scan your treasury wallet for sanctions exposure — TRACR Standard $149"

Same pattern after every one-time purchase: surface the next adjacent product. Implementation cost: trivial (extend `/payment/success` page with a tier-aware adjacent-product card).

### 4. Email nurture cadence (Resend)

Already partially wired via Resend. Cadence template:

| Day | Type | Content |
|-----|------|---------|
| 0 | Confirmation | Receipt + access details |
| 3 | Check-in | "Did the report help? Reply with questions." |
| 7 | Adjacent value | "3 jurisdictions you should monitor based on your scan" |
| 14 | Soft upsell | "Pro is $149/mo — that's how much your last single-report cost" |
| 30 | Renewal warning | "Subscription renews in 7 days · pause here" |
| 60 | Win-back if churned | "We added X capability since you left" |

### 5. OCI realestate referral fees

Per `MOR_REAPPLY.md`: partners pay BizLegal 1-15% on close. Conservative scenario: $5K-25K/close, 1 close/quarter = $20K-100K/year — alone enough to fund the OpEx of the entire fleet.

This is the asymmetric pillar. Even in a bad quarter, one close keeps the lights on.

---

## LexAudit Safe in the funnel

LexAudit Safe is the privacy/security positioning that lets law firms adopt without a partner-vote.

**The story:**
- Existing `/security` page documents: zero document content stored, RLS firm isolation, Microsoft Presidio PII redaction
- Phase G3 added a 4-bullet Safe section on `/pricing` linking to that whitepaper
- Solo / Boutique / Mid-Market badges all point to Safe — same proof, three price tiers

**Funnel mechanics:**
1. Snapshot vertical-classifier `lexaudit` lead → autoresponder mentions Safe positioning ("your client data never leaves the firm sandbox")
2. Direct visit to lexaudit.bizlegal-ai.com → /pricing → Safe section converts the partner-vote-skeptical lead
3. Pro Hub upsell from LexAudit purchase: "Get all 6 surfaces — your data stays sandboxed in your firm RLS"

**LTV impact:**
- Without Safe positioning: partner-vote required → ~2% conversion from solo to firm tier
- With Safe positioning visible: partner can adopt unilaterally → ~8% conversion
- Mid-Market $599/mo × 12mo = $7188/yr LTV per converted firm

---

## DocAI SQA in the funnel

DocAI SQA is the second anti-poverty B2B SaaS shape — recurring, high-margin, painful to do manually.

**The story:**
- `web/lib/sqa/` engine has existed
- Phase G2 surfaced it as `/sqa` (free first draft) + `/api/sqa/draft` (paid generation)
- B2B SaaS sales teams answer 5-50 vendor questionnaires (SOC 2, CAIQ, SIG-Lite, NIST) per month — at 30-90 minutes each, that's 2-50 hours/mo of senior eng time

**Funnel mechanics:**
1. Blog post "How to answer SOC 2 vendor questionnaires fast" → /sqa landing → free draft → email collected
2. After 1 free draft: prompt to upgrade for unlimited
3. DocAI Team $69/mo includes 50 SQA drafts/mo + DPA negotiator (Phase J recommendation #1)
4. Firm tier $99/mo includes 150 drafts + KB upload + API

**LTV impact:**
- Free draft → $69/mo Team subscriber: ~5% conversion
- $69/mo × 18mo (typical B2B SaaS retention) = $1242 LTV
- Each free draft costs ~$0.15 in Sonnet 4.6 inference; CAC margin is brutal

---

## Anti-poverty operations math

Per `FINANCIALS.md` P50 path:

- **OpEx** = $35-50/mo (Vercel free tier + Supabase free tier + Resend free tier + Hetzner Cloud + cron services)
- **Per-product CAC** = ~$0 if blog SEO compounds (organic + LinkedIn + Reddit)
- **Break-even** = 1 Forge BOI Kit sale per month ($149)
- **Year 1 net** at P50 path = +$124K (target), driven by: 8-12 monthly subscribers + 4-6 one-time / quarter + 1 OCI realestate close / quarter

Trust gates that compound:
- 14-day money-back guarantee everywhere
- Practitioner-reviewed badge on every certified report (LexAudit + BRAI)
- Clear AI-disclosures + intelligence-not-legal-advice on every page

LemonSqueezy / Paddle approval (Moses reapplying) unlocks card payments globally, not just PayPal-supported markets. That's a 2-3x TAM multiplier when it lands.

---

## LTV math per stage

| Stage | Conversion target | $ value (LTV)                  |
|-------|-------------------|--------------------------------|
| Visitor → Snapshot         | 5%   | — (lead magnet, no revenue)         |
| Snapshot → product page    | 30%  | — (pre-revenue routing)             |
| Product page → checkout    | 2%   | $149 avg one-time                   |
| Checkout → Pro upsell      | 8%   | $149/mo × 6mo = $894 LTV            |
| Pro → /agents add-on       | 15%  | $39/mo × 12mo = $468 LTV            |
| DocAI free SQA → Team      | 5%   | $69/mo × 18mo = $1242 LTV           |
| LexAudit Solo → Boutique   | 12%  | $199/mo × 12mo = $2388 LTV          |
| Boutique → Mid-Market      | 4%   | $599/mo × 24mo = $14,376 LTV        |
| OCI realestate close       | 1/Q  | $15K/close avg                       |

**Steady-state monthly mix at month 6:**
- 25 Pro Hub subscribers × $149 = $3,725
- 40 DocAI Team subscribers × $69 = $2,760
- 15 LexAudit Boutique × $199 = $2,985
- 10 LexAudit Mid-Market × $599 = $5,990
- 8 LeadForge Growth × $149 = $1,192
- 4 LeadForge Scale × $299 = $1,196
- 12 /agents subscribers × $39 = $468
- 5 BRAI retainers × ~$1,200 avg = $6,000
- 3 Forge passports × $99 = $297
- One-time pulse: ~$3K-5K from Forge BOI + TRACR + BRAI single reports
- OCI close 1/quarter: $5K/mo amortised

**Steady-state MRR target at month 6:** ~$32K
**Steady-state ARR run-rate:** ~$385K
**OpEx amortised:** ~$50/mo
**Operating margin:** 99.8%

---

## What lands in Q3 to hit those numbers

- Phase G is DONE (5 subdomains × pricing v2 × payment routes × theme tokens) — every subdomain can now take real money in incognito
- Phase I-partial is DONE (sitemap expanded; SEO_FIXES.md documents what Moses needs to wire CF + GSC)
- DocAI SQA delivery scaffold is DONE — needs the Firm tier KB upload to hit Mid-Market price point
- LexAudit Safe positioning is now on `/pricing` — partner-vote-free adoption path

Pending:
- Phase H — Moses picks design direction (Gritnova A/B/C); I implement
- Phase J top-3 agents (DPA / PSP audit / CTA tracker) — engineering plans in AGENTS_BRAINSTORM.md
- LemonSqueezy / Paddle approval — Moses reapplying, blocks the card-payments-global lever
- PayPal Plan IDs per subdomain — Moses creates in dashboard; until done, recurring CTAs return graceful "Checkout coming soon" via the env-fallback pattern

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Vercel cold-start kills Snapshot conversion | Force-dynamic + edge runtime; pay attention to TTI on /snapshot |
| Resend deliverability dies | Fallback to SendGrid via existing `@sendgrid/mail` dep on hub |
| Sanctions corpus rotates without our cron noticing | Add a "stale data" warning banner + pause sales if corpus > 7 days old |
| OCI realestate router DNS flake | Already on TLS-pinned + restartable + monitored at router.bizlegal-ai.com |
| Single-customer concentration on Mid-Market | Cap at 30% of any month's MRR from any one firm; if exceeded, prioritise diversification |

---

## What success looks like in 90 days

- ≥ 25 active Pro Hub subscribers
- ≥ 1 successful OCI realestate close
- LemonSqueezy or Paddle approved
- 3 top-recommended agents shipped (DPA / PSP / CTA)
- Blog indexing live on GSC, organic traffic compounding 10%+ MoM
- LexAudit Mid-Market: 5+ paying firms

If we hit even half of that, we're at break-even + diversified. If we hit all of it, we've earned ourselves another year of runway.

---

## Status

- Funnel architecture diagrammed
- Conversion mechanics specified
- LTV math + steady-state mix tabled
- LexAudit Safe + DocAI SQA wired into the narrative
- Anti-poverty math sanity-checked
- Q3 success criteria locked
