# MRR_30K_PATH — 30/60/90/120 day plan to $30K MRR

**Phase T — math + milestones for the first paying customer through to $30K MRR.**

Plan-anchor: Phase O+P+Q+R+S+T+U (2026-04-30). Spear products locked: PSP/MoR Risk Manager + DocAI SQA/DPA + CTA-2024 BOI Tracker. Ad budget = $0 (organic-only week 1). Asymmetric pillar: OCI referrals.

---

## LTV math anchor

Blended ARPU at maturity (mix of products):

| Product             | Price        | Expected mix at $30K MRR |
|---------------------|--------------|--------------------------|
| BOI Tracker monthly | $29/mo       | 25%                      |
| BOI Tracker annual  | $290/yr ($24/mo) | 5%                  |
| DocAI Team monthly  | $69/mo       | 25%                      |
| PSP retainer        | $99/mo       | 15%                      |
| Compliance Monitor  | $99/mo       | 15%                      |
| LexAudit Boutique   | $199/mo      | 10%                      |
| LexAudit Mid-Market | $599/mo      | 5%                       |

Blended ARPU = $145/mo across the mix.

**$30K / $145 = 207 paying subscribers.**

Funnel math:

- 207 / 0.65 (12-month retention) = ~318 ever-acquired subscribers in the trailing 12 months at this revenue level
- 318 / 0.10 (trial → paid) = ~3,180 trials in 12 months
- 3,180 / 0.05 (visitor → trial) = ~63,600 unique organic visitors in 12 months ≈ 5,300/mo

That last number is reachable from organic only IF we ship at curator's promised cadence (1-2 indexed posts per day = 30-60 posts per month) and IF the post quality clears Google's helpful-content threshold (the Q1+Q2 Firecrawl + Sonnet pipeline is built for exactly this).

If trial→paid underperforms by 2x (we hit 5% instead of 10%), the path to $30K MRR slips from month 4 to month 6-7. That's still a tractable miss, not a stop-the-line failure.

---

## 30/60/90/120 day milestones

Each milestone has explicit acceptance criteria. Missing a milestone by >50% triggers a re-plan, not a doubling-down.

### Day 1-7 (week 1) — first revenue

| Milestone | Acceptance |
|-----------|------------|
| Subdomains all return 200 (Phase P done by Moses) | `for s in tracr brai lexaudit docai forge; do curl -sk -o /dev/null -w "%{http_code}\n" https://${s}.bizlegal-ai.com; done` returns 5x 200 |
| /ops/health page green across the board | HMAC self-loop OK + 0 critical missing envs + 8/8 subdomains reachable |
| 1-3 paying customers landed | `confirmed_revenue_cents_24h` > 2900 (one BOI sub) or > 14900 (one Forge BOI Kit) or > 29900 (one PSP) |
| 9 blog posts indexed | curator @ 1.3 posts/day × 7 days; gh api list shows new MDX in bizlegal-ea |
| 12-18 manual outreach posts shipped | per OUTREACH_KIT.md cadence; tracked in Telegram channel |
| 1+ `referral.received` event in /ops | OCI cold-outbound to 5-10 real-estate partners landing first signal |

**Most likely first sale:** Forge BOI Kit ($149) or BOI Tracker ($29/mo) — lowest-friction surfaces, both already live.

### Day 8-30 (month 1) — first $1K MRR

| Milestone | Acceptance |
|-----------|------------|
| 10-15 paying customers | /ops summary `active_subs_total` ≥ 10 |
| ~$1K MRR | sum of `subs_by_product[*].mrr_cents` ≥ 100,000 |
| 30+ blog posts indexed in GSC | Google Search Console clicks > 0; impressions > 500 |
| 5+ HN/Reddit/X posts per spear product | OUTREACH_KIT cadence × 4 weeks |
| First DocAI Team subscriber | `boi.subscribed` complement: a `subscription.created` event with product='docai' tier='team' |
| Monitoring shows zero false-positive Compliance Monitor alerts | Q2 semantic-diff suppression working |

**Stretch:** 1 OCI referral closed. Low probability in month 1 but every cold partner DM increases the chance.

### Day 31-60 (month 2) — first $5K MRR

| Milestone | Acceptance |
|-----------|------------|
| 35-50 paying customers | `active_subs_total` ≥ 35 |
| ~$5K MRR | mrr_cents ≥ 500,000 |
| 60+ blog posts indexed | curator at sustained cadence |
| LemonSqueezy or Paddle approved (Moses task) | unlocks card-only EU/UK markets — +25% TAM |
| First B2B SaaS yearly DocAI Team plan | `subscription.created` with `billing_interval='yearly'` for 5+ orgs |
| First V2 agent shipped (V2.1 AI-Act or V2.4 Privacy Refresh) | per AGENTS_BRAINSTORM_V2.md |

**Stretch:** First OCI referral closed ($15-25K AOV) — bumps month-2 revenue dramatically and accelerates everything downstream.

### Day 61-90 (month 3) — first $15K MRR

| Milestone | Acceptance |
|-----------|------------|
| 100+ paying customers | `active_subs_total` ≥ 100 |
| ~$15K MRR | mrr_cents ≥ 1,500,000 |
| 1-2 LexAudit Mid-Market firms ($599/mo each) | high-AOV anchor customers; require 1-2 person-weeks of sales work each |
| Monorepo (Phase U) shipped | per plan-anchor; 7-day window between week-12 and week-13 |
| Compliance Monitor at 30+ subs | $3K MRR alone from this single product |
| /ops dashboard regularly used by Moses | not a vanity metric — proxies whether the data is actionable |

**Stretch:** 2nd OCI referral close ($15-25K) — pushes us into $20-30K MRR a month early.

### Day 91-120 (month 4) — first $30K MRR

| Milestone | Acceptance |
|-----------|------------|
| 200+ paying customers | per blended ARPU math |
| $30K MRR | mrr_cents ≥ 3,000,000 |
| Compliance Monitor at 30+ subs ($3K MRR alone) | per Phase Q2 differentiator |
| DocAI Team + Firm at 80+ subs | flagship products at scale |
| 2 V2 agents live | V2.1 + V2.4 from brainstorm |
| Public traction story / Twitter thread / HN post | "$30K MRR in 4 months on $0 ad spend" — cheap brand earned media |

If conversion-rate assumptions underperform 2x, this milestone slips to month 6-7. Acceptable miss.

---

## Conversion-rate assumptions (will be validated)

| Step | Optimistic | Realistic | Pessimistic |
|------|------------|-----------|-------------|
| Visitor → trial (free Snapshot / SQA / 7-day BOI) | 8% | 5% | 2% |
| Trial → paid | 15% | 10% | 5% |
| Pro Hub upsell from product subscriber | 12% | 8% | 4% |
| 12-month retention | 75% | 65% | 50% |

We measure all four every Saturday in week 1, then weekly thereafter. Source: `/api/ops/feed` → `summary.checkout_conversion_pct` + sub `subscription.created` / `subscription.cancelled` ratios computed from `payment_orders`.

If trial→paid underperforms 2x in week 4: the spear product page copy is the bottleneck, not the channels. Iterate that first before adding more outreach.

---

## Risk register

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|-----------|
| R1 | Subdomain reachability (Phase P) takes >80 min | Med | Med | Pre-script vercel link + deploy for BRAI; doc Moses runs locally |
| R2 | Curator post quality regresses with Firecrawl injected | Low | High | Existing publisher.py numeric-claim verifier extended to citation-existence check |
| R3 | Reddit/HN posts get downvoted as spam | Med | Med | OUTREACH_KIT enforces "lessons-learned" voice + Moses approves each post via Telegram before publishing |
| R4 | Trial→paid is 3% not 10% | Med | High | Funnel review weekly; ICP example block on landing pages; pricing experiments |
| R5 | OCI realestate close doesn't happen in 90 days | Med | Low | Subscription products are the path; OCI is asymmetric upside, not load-bearing |
| R6 | Compliance Monitor alerts still false-positive after Q2 | Low | High | Q2's Sonnet "no substantive change" gate is the suppressor; if it fails, we have the extracted-content text and can train a tighter classifier |
| R7 | LemonSqueezy / Paddle / PayPal MoR rejection | Med | Med | We're crypto-first — NOWPayments + ETH on-chain are primary; card markets are bonus |
| R8 | Anthropic / Firecrawl rate limits | Low | Med | Curator runs only 3x/week; Compliance Monitor runs daily; per-call timeouts already in place |
| R9 | A regulator sends a cease-and-desist | Low | High | We're decision-support, not legal advice — boilerplate is on every disclosure (v1.0.0-p4); LexAudit Safe redacts PII before any AI call |
| R10 | The plan slips because Moses doesn't ship Phase P quickly | Med | High | Phase P-claude (smoke + health page) gives autonomous visibility into the gap; blocker tracked on /ops/health |

---

## What this plan does NOT promise

- $30K MRR in month 4 with certainty. The math is tractable; the conversion assumptions are educated guesses.
- That every spear product will hit. The portfolio approach assumes some will outperform and some will underperform. We track per-product conversion separately and reallocate outreach budget weekly.
- That OCI referrals will produce a single $25K close in 90 days. They're an asymmetric pillar — when one lands it accelerates the timeline by 2-3 months, but we don't depend on it.
- That paid ads stay at $0. After week 1, if a spear product converts > 12% on organic, we'll start small ($500/mo Reddit promoted + Google Ads on long-tail) to multiply the working channels.

---

## Decision-rule for re-planning

Re-plan if any of these fire:

1. Week-2 has 0 paying customers AND 12+ outreach posts shipped → spear product copy issue, iterate landings before adding channels
2. Month-1 has < $500 MRR → blended assumptions wrong, redo ARPU math against actual mix
3. Month-2 trial→paid is < 4% → switch from organic-only to organic + small paid pilot ($500/mo)
4. Month-3 < $5K MRR → kill the lowest-converting spear product page; reallocate dev to V2.1 (AI-Act Classifier) for the EU AI Act deadline driving urgency

The plan is a hypothesis, not a contract. Re-plan early, re-plan often, but only when data warrants it — not on vibes.
