# BizLegal AI — Expanded Revenue Streams Plan
## Beyond the 90-day E1-E4 plan: 16 additional income streams the E1-E4 plan doesn't cover

**File:** `decisions/EXPANDED-REVENUE-STREAMS-2026-07-02.md`
**Owner:** Moses
**Date:** 2026-07-02
**Companion to:** `MRR-40K-90-DAY-PLAN-2026-07-02.md` (the four-engine E1-E4 plan)
**Supersedes nothing; composes.** The E1-E4 plan is the spine. This doc adds streams the spine doesn't activate.

---

## 0. Why this doc exists

The 90-day E1-E4 plan is honest about its ceiling: **base case $10K MRR, stretch $25-34K + one-time**. The user is asking: *what about the other 90% of income-stream surface area we're not even touching?*

The E1-E4 plan deliberately excludes:
- AdSense (deferred as 9-15 month outcome)
- New product surface area (per Operating Book §6)
- Platform phases 2-4 (deferred to post-$10K)
- OCI counting in MRR
- THE-MACHINE pivot
- Education, community, content monetisation
- API access products
- Data products
- Capital / grants

This doc enumerates **16 additional streams** across 8 categories, each with:
- Tier (T0 = today, T1 = week 1, T2 = month 1, T3 = month 2-3, T4 = month 4+)
- Effort to ship
- Time to first $1
- 90-day ceiling
- Risk
- Status (assets ready / need build / blocked)

The point is **breadth of options, not volume of work**. Most of these are *deferred-until* levers you can pull when their prerequisite unlocks.

---

## Category 1 — Direct product revenue (E1, ratified)
**Already in the 90-day plan. No additions.**

The 15 products / plans are the core spine. See plan §3.

---

## Category 2 — Services & outbound (E2, ratified)
**Already in the 90-day plan. No additions.**

White-label attorneys + BRAI/LexAudit retainers + OCI = the only engines fast enough for Q3. See plan §2.

---

## Category 3 — Marketplace, network effects, partnerships
**Three sub-streams the plan partially covers, one new one.**

### STREAM 1: T0 — Affiliate program for law firms & formation agents
**Plan status:** `/api/affiliates` route exists in CLAUDE.md, never wired. NOT in the 90-day plan.
**Effort:** 4-6 hours to wire (referral link generator, commission tracker, monthly Resend payout email).
**Time to first $1:** Immediately after wire (5 inbound leads can be invited today from the 253-lead pipeline).
**90-day ceiling:** $500-2,000/mo (1-3 deals referred; ~30% commission on $5K-25K AOV).
**Why now:** The OCI partners + inbound leads already exist. Affiliate is just a commission version of the partner motion.
**Specific action:** Add `affiliate.referred` event to `/api/ops/log`. Stripe Connect account for payouts. Email each score-95 lead with a personalised link.

### STREAM 2: T1 — "Compliance Concierge" wire/ACH-only service
**Plan status:** NOT in 90-day plan. Mentioned in §2.2 ("every proposal ≥$500 offered wire + PayPal") but not as a product.
**Effort:** 0 (just enable `wire_instructions` on landing page with wire details from bizlegal bank account).
**Time to first $1:** Day 1 (after Wire details are added to the form).
**90-day ceiling:** Variable; unlocks $5K+ deals that won't go through card rails.
**Specific action:** Moses adds wire instructions to the `apps/hub/app/pay/wire/page.tsx` (1 hour). Plus add "Request a quote" → email triggers wire-form delivery.

### STREAM 3: T2 — Reseller / white-label program for consultancies
**Plan status:** PARTIALLY in 90-day plan (E2.1 covers white-label attorneys only).
**Effort:** 2 weeks to build (multi-tenant auth, per-tenant branding on DocAI/LexAudit).
**Time to first $1:** 30-60 days (consultancy sales motion is slower than attorney).
**90-day ceiling:** $3K-8K/mo (2-3 consultancies × $1.5-3K/mo each).
**Why it's distinct from E2.1:** E2.1 = white-label for *one deal at a time*. STREAM 3 = recurring platform licensing to the consultancy itself.
**Specific action:** Add `reseller.*` to `/api/ops/log` event types. Ship a "Partner Portal" page on hub.

### STREAM 4: T2 — Marketplace listings fee (legal-tech directory)
**Plan status:** NOT in 90-day plan.
**Effort:** 1 week to build directory page + 3-4 listing categories.
**Time to first $1:** 60-90 days (need traffic first; chicken-and-egg).
**90-day ceiling:** $0-500/mo (almost zero unless traffic lands).
**Specific action:** Park unless Q3 traffic > 5K/mo.

---

## Category 4 — Content monetisation (deferred, but worth tracking)
**The 90-day plan explicitly excludes AdSense. But there are 3 sub-streams worth re-evaluating.**

### STREAM 5: T3 — Newsletter sponsorship ($1-3 CPM)
**Plan status:** NOT in 90-day plan. Listed in PASSIVE-INCOME-5K §4 as a future lever.
**Effort:** 0 to ship (Resend audience already set up; just enable "sponsor" tag).
**Time to first $1:** 60-90 days (need 1K+ newsletter subs first).
**90-day ceiling:** $200-1,500/mo (if list hits 1-5K).
**Why now:** Resend audiences already sync. Adding a "sponsor" footer block is 30 min. The blocker is just list size.
**Specific action:** Verify `RESEND_AUDIENCE_ID` env is set on hub + Hetzner (it's in the M3 group of plan). Add a sponsor footer template to the daily-brief cron.

### STREAM 6: T3 — Sponsored content / native posts
**Plan status:** NOT in 90-day plan.
**Effort:** 0 (just accept inbound requests; no product to build).
**Time to first $1:** 60-90 days (need 5K+ organic visits/mo for sponsors to bite).
**90-day ceiling:** $500-2,000/mo per sponsored post.
**Specific action:** Park. Add `sponsored_content_inquiry@bizlegal-ai.com` forwarder when traffic warrants.

### STREAM 7: T4 — Gated premium reports (jurisdiction deep-dives)
**Plan status:** NOT in 90-day plan.
**Effort:** 1 week per report (already have 209 posts as foundation).
**Time to first $1:** 30 days (gated content can be marketed to existing newsletter list).
**90-day ceiling:** $1K-3K/mo (1-2 sales/week at $199-499 each).
**Examples that match existing corpus:** "MiCA CASP Complete Application Kit 2026" ($499), "US FinCEN BOI Reference Manual for Foreign Companies" ($299), "UAE VARA Licensing Kit" ($499).
**Specific action:** Create `apps/hub/app/store/page.tsx` with 3 reports; pull the paywall trigger from `/api/pay/start`.

### STREAM 8: T4 — AdSense (the original passive plan)
**Plan status:** EXPLICITLY deferred. Plan §9: "No AdSense dependency (needs 150-300K pageviews for meaningful revenue)."
**Why keep on the list:** It's free to ship; the application can be pending; it activates the moment the corpus hits scale.
**Specific action:** Apply now (PASSIVE-INCOME-5K playbook §2 #3). Set `NEXT_PUBLIC_ADSENSE_CLIENT` on CF Pages. Don't plan around it.

---

## Category 5 — Data products (NEW — not in any plan)
**The corpus + crawlers + leads DB is a data asset. 3 sub-streams.**

### STREAM 9: T3 — "Compliance Intel" subscription feed
**Plan status:** NOT in any plan.
**The product:** A weekly/quarterly PDF digest of regulatory changes, enforcement actions, and new laws across 50+ jurisdictions. Sold to consultancies + legal ops teams.
**Pricing:** $499/mo (firms with 10+ lawyers), $199/mo (solo consultants).
**Effort:** 4 weeks to build (uses existing LexAudit Compliance Monitor + BRAI Sanctions pipelines + Sonnet summarization).
**Time to first $1:** 60-90 days (need a few sample reports to sell against).
**90-day ceiling:** $1K-5K/mo (5-10 subscribers at launch).
**Specific action:** Extract 3 sample reports from the Compliance Monitor's weekly digest; pitch via the 28 staged cold emails.

### STREAM 10: T3 — Anonymised lead-gen dataset (sell to consultancies)
**Plan status:** NOT in any plan.
**The product:** Anonymised, GDPR-clean export of "what compliance roles at what companies are hiring this quarter" — sourced from the 253-lead DB + Apollo enrichment.
**Pricing:** $2K-5K per quarterly report; $200/mo subscription to the live dataset.
**Effort:** 1 week (anonymisation pipeline + Apollo enrichment + dashboard).
**Time to first $1:** 30-60 days.
**90-day ceiling:** $2K-8K/mo (2-4 consultancies buying).
**Risk:** PII / GDPR — must be heavily anonymised; legal review required.
**Specific action:** Build a "lead digest" Supabase view first, anonymise, then pitch 3 known consultancies.

### STREAM 11: T4 — Sanctions / wallet screening API
**Plan status:** NOT in 90-day plan. Mentioned in V2.5 (OFAC SDN Sweeper, score 13 = below cut).
**The product:** A standalone REST API: `POST /api/screen/wallet { address } → { sanctioned: bool, list: string, since: date }`. Cheap, fast, no LLM.
**Pricing:** $0.01 per request, $99/mo for 10K requests, $499/mo for 100K requests.
**Effort:** 1 week (reuse TRACR + BRAI OFAC pipeline; expose REST).
**Time to first $1:** 30-60 days.
**90-day ceiling:** $1K-3K/mo (5-10 fintechs integrating).
**Specific action:** Add `/api/screen/wallet` route; document; pitch 5 fintech leads.

---

## Category 6 — Community, education, certification (NEW — not in plan)
**3 sub-streams, all deferred to month 2-3 minimum.**

### STREAM 12: T3 — "Compliance OS" paid Discord/Slack community
**Plan status:** NOT in 90-day plan.
**The product:** A private community ($49/mo or $399/yr) for compliance officers, with weekly AMA, prompt-library access, peer support.
**Effort:** 1 week to set up (Discord or Circle).
**Time to first $1:** 14 days (existing newsletter list can be invited).
**90-day ceiling:** $1K-4K/mo (20-80 members).
**Specific action:** Survey existing 209-post readers + newsletter list for interest. If 50+ say yes, ship.

### STREAM 13: T3 — Self-paced certification ("BizLegal Compliance Operator")
**Plan status:** NOT in any plan.
**The product:** A 4-week self-paced course + exam → certification. Sold to compliance teams wanting to train new hires.
**Pricing:** $499 per seat (teams: $299 × 5+).
**Effort:** 6 weeks (build the curriculum, quizzes, certificate).
**Time to first $1:** 90 days.
**90-day ceiling:** $5K-15K/mo (10-30 seats/month).
**Risk:** Time-intensive; build the corpus of training material from existing posts.
**Specific action:** Sketch the curriculum from existing content; find 5 pilot customers first.

### STREAM 14: T2 — 1:1 consulting hours (Moses's time)
**Plan status:** NOT in 90-day plan. Implicitly exists via attorney demo motion.
**The product:** Bookable 1-hour calls at $500/hr (crypto regulatory, EU AI Act, MiCA authorisation).
**Effort:** 0 (Calendly + Stripe; existing `/api/contact` endpoint).
**Time to first $1:** Immediate.
**90-day ceiling:** $5K-15K/mo (10-30 hours/month, capped at Moses's time).
**Why this isn't in the plan:** It scales with Moses's hours, not his leverage. But it's pure margin, no engineering.
**Specific action:** Add `apps/hub/app/consulting/page.tsx` with Calendly embed.

---

## Category 7 — API, infrastructure, integrations (NEW — not in plan)
**3 sub-streams, mostly deferred.**

### STREAM 15: T3 — "Compliance API" tier (paid API access to BRAI/LexAudit/Tracr/AI-Act)
**Plan status:** NOT in any plan.
**The product:** REST API access to all 4 of BizLegal's scanning agents. Pay-per-call or monthly quota.
**Pricing:** $0.10/call or $99/mo for 1,000 calls, $499/mo for 10,000.
**Effort:** 1 week (gateway + auth + rate limits + docs).
**Time to first $1:** 30-60 days.
**90-day ceiling:** $1K-4K/mo.
**Specific action:** Reuse the `@bizlegal/api-client` design from PLATFORM-BUILD Phase 2; ship a free tier + paid tier; pitch to fintechs.

### STREAM 16: T3 — Zapier / Make.com / n8n public integration
**Plan status:** NOT in 90-day plan.
**The product:** Official BizLegal apps on Zapier/Make so non-developers can wire "new compliance alert → Slack" or "sanction hit → ticket".
**Effort:** 2-4 weeks (per platform).
**Time to first $1:** 60-90 days.
**90-day ceiling:** $500-2K/mo (zaps drive API revenue).
**Specific action:** Build the Zapier integration first (largest user base); defer Make/n8n.

### STREAM 17: T4 — Compliance-as-code templates (GitHub repo)
**Plan status:** NOT in any plan.
**The product:** Open-source Rego / OPA policies + Terraform modules for compliance controls. Free repo, sponsored.
**Effort:** 1 week initial, ongoing maintenance.
**Time to first $1:** 90 days.
**90-day ceiling:** $0-2K/mo (GitHub Sponsors).
**Specific action:** Park. Useful for SEO/brand but not direct revenue in Q3.

---

## Category 8 — Capital, grants, non-dilutive (NEW — not in plan)
**3 sub-streams, mostly 90+ day horizon.**

### STREAM 18: T0 — Cloud credits (already-shipped product qualifies)
**Plan status:** NOT in 90-day plan.
**Why now:** BizLegal is an open-source-friendly compliance tool with a live deployment. Multiple programs exist:
- **Google Cloud for Startups** ($100K-350K credits, requires 501c3 or VC; easier path: Cloud research credits $5K-50K for academic-aligned projects)
- **AWS Activate** ($1K-25K for early-stage startups, just need a .com + LinkedIn)
- **Microsoft for Startups** ($25K-150K Azure credits)
- **Cloudflare Workers Free Tier upgrade** (free → $5/mo Workers Paid, easy)
- **Resend** (free → Pro at $20/mo)
- **Anthropic** (Build plan: $5 free credits, Scale plan: pay-as-you-go; no public credits program but they have a partner program for YC, a16z, etc.)
- **OpenAI credits** ($5-250K for research, requires academic paper or selection)
**Effort:** 2-4 hours per application, total 1 day.
**Time to first $1:** Indirect — saves $5K-50K of infra costs over 12 months.
**Specific action:** Apply for AWS Activate + Google Cloud + Resend Pro + Cloudflare Workers Paid today. Need LinkedIn company page + bizlegal-ai.com for most.

### STREAM 19: T2 — Government / accelerator grants
**Plan status:** NOT in 90-day plan.
**Examples:**
- **SBIR (US)** — up to $50K Phase I for "R&D with commercial potential"; BizLegal's compliance research qualifies
- **Eurostars / Horizon Europe** — EU grants for SME R&D; compliance-tech fits
- **UK Innovate UK** — similar, £25K-£500K
- **Y Combinator** (next batch) — $500K for 7%, plus credits
- **Techstars / 500 / OnDeck** — various structures
**Effort:** 40-80 hours per application, 4-6 weeks per cycle.
**Time to first $1:** 90-180 days.
**90-day ceiling:** $0 (most are 6+ month cycles).
**Specific action:** Y Combinator is the highest-leverage single application. Apply for W26 batch (deadline ~mid-Aug 2026). Other grants are 2027 plays.

### STREAM 20: T0 — Customer-funded pilots
**Plan status:** NOT in 90-day plan.
**The product:** Sell "compliance pilot" engagements at $2K-5K to design partners who get 6 months free product in exchange for case study + referrals.
**Effort:** 0 (just packaging).
**Time to first $1:** 7-14 days.
**90-day ceiling:** $5K-25K one-time (5-10 design partners).
**Why this matters:** Cash today + future subscription anchor. The first $25K matters more than $25K in MRR at 6 months out.
**Specific action:** Add `apps/hub/app/pilot/page.tsx` with case-study-required terms. Email the 30 score-95 leads.

---

## Summary table

| # | Stream | Tier | Effort | 90-day $ ceiling | Status | Plan coverage |
|---|---|---|---|---|---|---|
| 1 | Affiliate program | T0 | 4-6h | $500-2K/mo | NOT in plan | NEW |
| 2 | Wire/ACH concierge | T1 | 1h | Unlocks $5K+ deals | Mentioned in §2.2 | Add wire page |
| 3 | Reseller / white-label platform | T2 | 2w | $3K-8K/mo | Partial (E2.1 covers direct) | NEW |
| 4 | Marketplace directory listings | T2 | 1w | $0-500/mo | NOT in plan | Park |
| 5 | Newsletter sponsorship | T3 | 30m | $200-1.5K/mo | NOT in plan | NEW (adds footer block) |
| 6 | Sponsored content | T3 | 0 | $500-2K/mo per post | NOT in plan | Park |
| 7 | Gated premium reports | T3 | 1w per report | $1K-3K/mo | NOT in plan | NEW |
| 8 | AdSense | T4 | 0 to apply | $1K-3K/mo at scale | EXPLICITLY deferred | Apply now |
| 9 | Compliance Intel feed | T3 | 4w | $1K-5K/mo | NOT in plan | NEW |
| 10 | Anonymised lead-gen dataset | T3 | 1w | $2K-8K/mo | NOT in plan | NEW (PII risk) |
| 11 | Sanctions screening API | T4 | 1w | $1K-3K/mo | Mentioned V2.5 (below cut) | Re-rank |
| 12 | Paid community | T3 | 1w | $1K-4K/mo | NOT in plan | NEW |
| 13 | Certification program | T4 | 6w | $5K-15K/mo | NOT in plan | NEW (Q4) |
| 14 | Consulting hours | T2 | 0 | $5K-15K/mo (capped by Moses time) | Implicit | NEW (add page) |
| 15 | Compliance API tier | T3 | 1w | $1K-4K/mo | NOT in plan | NEW (after PLATFORM-BUILD P2) |
| 16 | Zapier / Make / n8n integration | T3 | 2-4w per platform | $500-2K/mo | NOT in plan | NEW |
| 17 | Open-source compliance-as-code | T4 | 1w + maint | $0-2K/mo | NOT in plan | Park |
| 18 | Cloud credits | T0 | 1 day | Saves $5K-50K/yr | NOT in plan | NEW |
| 19 | Y Combinator / grants | T2 | 40-80h | $25K-500K | NOT in plan | NEW |
| 20 | Customer-funded pilots | T0 | 0 | $5K-25K one-time | NOT in plan | NEW |

**Total uncapped 90-day ceiling across the 20 streams (excluding E1-E4): ~$25K-100K/mo blended, $30K-50K one-time in pilots/grants.**

---

## What to ship vs. what to park

### Ship now (T0-T1, this week):
- STREAM 1 — Affiliate program (4-6h)
- STREAM 2 — Wire/ACH page (1h)
- STREAM 14 — Consulting hours page (0h, just Calendly)
- STREAM 18 — Cloud credits applications (1 day)
- STREAM 20 — Customer-funded pilot offer (0h, just page)

**Total time: 1.5 days. Adds 4 revenue streams this week, ~$5K-30K one-time ceiling.**

### Ship week 2-4 (T1-T2):
- STREAM 7 — Gated premium reports (one product first)
- STREAM 5 — Newsletter sponsorship footer
- STREAM 11 — Sanctions screening API (after V2.5 builds)

### Ship month 2-3 (T3):
- STREAM 9 — Compliance Intel feed
- STREAM 3 — Reseller platform
- STREAM 10 — Lead-gen dataset
- STREAM 15 — Compliance API (after PLATFORM-BUILD P2)
- STREAM 16 — Zapier integration
- STREAM 12 — Paid community

### Park (T4+):
- STREAM 4 — Marketplace directory (traffic-dependent)
- STREAM 6 — Sponsored content (traffic-dependent)
- STREAM 8 — AdSense (apply now, monetise later)
- STREAM 13 — Certification (Q4)
- STREAM 17 — Open-source compliance-as-code
- STREAM 19 — Y Combinator / grants (Q3-Q4)

---

## Key insight: the E1-E4 plan leaves 16 streams on the table

The 90-day plan's base case is $10K MRR. The plan's stretch case is $25-34K + $5-25K one-time. **The streams this doc adds** are uncapped at $25-100K/mo blended at the 90-day mark, with another $30-50K in one-time pilots/grants.

**The bottleneck is NOT product surface area. It's Moses's hours.** Every stream above requires either:
- A founder-led sales motion (consulting, pilots, white-label)
- A 1-2 week build (API, reports, screening)
- A grant application (YC, SBIR)

Streams 1, 2, 14, 18, 20 cost <2 days and add $5K-30K one-time. **These are the highest-leverage actions the 90-day plan doesn't include.**

The plan is right that organic takes time. But the 5 new T0-T1 streams above are **inorganic cashflow that doesn't depend on Google sandbox lifting**. They depend on Moses responding to inbound and shipping 1.5 days of code.

---

## Action this week (1.5 days of work)

| Time | Action | Adds |
|---|---|---|
| 30 min | Add `apps/hub/app/consulting/page.tsx` with Calendly + Stripe checkout | STREAM 14 |
| 1h | Add `apps/hub/app/pay/wire/page.tsx` with bizlegal bank wire details + form | STREAM 2 |
| 4h | Wire `affiliates` route, create referral links for 30 score-95 leads, email them | STREAM 1 |
| 2h | Add `apps/hub/app/pilot/page.tsx` with "6 months free for case study" terms | STREAM 20 |
| 4h | Apply to AWS Activate, Google Cloud credits, Resend Pro, Cloudflare Workers Paid | STREAM 18 |
| **11.5h** | **4 new revenue streams live + $5-50K cloud savings** | |

Plus STREAM 19 prep (YC application draft) = another 8-12h if there's time in the week.

---

## What this plan deliberately does NOT do

- Does not change the E1-E4 90-day plan. Composes on top.
- Does not promise any specific revenue. Same honesty as the E1-E4 plan.
- Does not include the "AdSense will save us" optimism (it won't, for 9-15 months).
- Does not propose new build crews or hiring. Moses + agents is the cap.
- Does not assume any of the 20 streams convert. They are *options* with costed effort + ceiling.

---

## What this plan DOES claim

1. The E1-E4 plan covers 4 engines. This doc covers 20. **Together that's 24 distinct revenue streams.** A real $40K MRR is 2-3 of these working simultaneously.
2. **5 streams can be live by Friday** (T0-T1 list above) at <2 days of work.
3. The 90-day ceiling across all 24 streams is uncapped, but realistic estimate: **$10K base (E1-E4) + $5-15K incremental from this doc = $15-25K MRR by 2026-09-30**, with the existing E2 stretch case bringing that to $30-50K.
4. The single highest-leverage action is **STREAM 20 (customer-funded pilots)** — it gets $5-25K cash now AND turns each pilot into a $499/mo retainer AND creates case studies that fuel E2. Three-birds-one-stone.

---

## File location

This doc lives at `decisions/EXPANDED-REVENUE-STREAMS-2026-07-02.md` and is indexed in CLAUDE.md per Operating Book discipline.

---

**Status:** DRAFT (awaiting Moses approval)
**Owner:** Hermes (autonomous session) → Moses
**Next step:** Moses picks which T0-T1 streams to ship this week (5 options, 11.5h total).
