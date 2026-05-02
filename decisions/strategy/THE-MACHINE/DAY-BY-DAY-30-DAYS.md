# 30-DAY EXECUTION PLAN — AGENCY OS

> From zero to first $18K client. Hour-by-hour where it matters.
> Start date: TBD (you set the Day 1 after approving the Master System)

---

## WEEK 1 — PLANNING + FOUNDATION (Days 1-5)

### Day 1 (Monday) — Kickoff
**Morning (3h):**
- Read MASTER-SYSTEM-v1.md end to end. Sign the 3 commandments mentally.
- Open Claude Code in a new folder: `C:\Users\Moshe Dor\agency-os\`
- Paste PHASE 1 PROMPT from PHASE-PROMPTS.md
- Answer the 10 questions Claude asks

**Afternoon (4h):**
- Let Claude produce `planning/icp.md`
- Review. Push back on anything vague.
- Identify 20 real ICP companies (names, websites, founder names)

**Evening (1h):**
- Archive the 4 broken BizLegal subdomains (deploy "Q3 2026 waitlist" pages)
- Put a forwarding link on bizlegal-ai.com to agency-os.io pre-launch page

**End of day:** `planning/icp.md` done. 20 named prospects.

### Day 2 (Tuesday) — Offer + Funnel Spec
**Morning (4h):**
- Continue Phase 1: produce `planning/offer.md` and `planning/king-funnel.md`
- Stress-test: would you pay $18K for this? Would the founder of company #3 on your list pay $18K?

**Afternoon (3h):**
- Produce `planning/pricing.md` and `planning/content-strategy.md`
- Review all 5 planning files. Sleep on it.

**End of day:** All 5 planning files complete. Approved.

### Day 3 (Wednesday) — Foundation Scaffold
**Morning (3h):**
- Paste PHASE 2 PROMPT into Claude Code
- Watch it scaffold Next.js + Supabase + Stripe + Resend + Trigger.dev

**Afternoon (4h):**
- Create Supabase project, paste keys into `.env`
- Create Resend account, paste key
- Create Stripe account (if not done), get keys (test mode first)
- Deploy to Vercel, set all env vars

**End of day:** `curl https://agency-os.vercel.app` returns 200.

### Day 4 (Thursday) — DB + API Routes
**Morning (3h):**
- Run Supabase migrations. Verify 4 tables exist: leads, qualifier_responses, content, orders.
- Build and test `/api/leads` POST endpoint (local + deployed)

**Afternoon (4h):**
- Build `/api/scan` POST — stub it with mock scoring for now
- Build Stripe webhook endpoint (test with Stripe CLI)
- Commit everything, push, verify Vercel rebuild succeeds

**End of day:** End-to-end: `curl POST /api/leads` → new row in Supabase → n8n webhook fires.

### Day 5 (Friday) — AI Patterns
**All day (7h):**
- Install n8n on PC1 via Docker (if not already running)
- Paste PHASE 3 PROMPT into Claude Code
- Import 4 pattern JSONs, rename, customize, test
- Export finalized versions to `agency-os/n8n/`

**End of day:** 4 working n8n workflows. Committed.

---

## WEEK 2 — KING FUNNEL BUILD (Days 6-12)

### Day 6 (Monday) — Design System + Homepage
**Morning (2h):**
- Paste PHASE 4 PROMPT into Claude Code
- Build component library: StatCounterBlock, ShimmerButton, TrustMarquee, StepProcessBar

**Afternoon (5h):**
- Build homepage (`app/page.tsx`) per `planning/king-funnel.md` spec
- Puppeteer screenshot self-review, 2 passes
- Localhost review — ONLY localhost, no push

**End of day:** Homepage looks sharp on localhost.

### Day 7 (Tuesday) — Lead Magnet
**All day (7h):**
- Build `/scan` page: 7 questions, progress bar, form validation
- Wire `/api/scan` to real Evaluator-Optimizer pattern from Phase 3
- Email template for audit report (Resend)
- Test with 3 fake leads — verify email delivery

**End of day:** Fake lead → scan → email with report in inbox.

### Day 8 (Wednesday) — Qualifier + Vapi
**Morning (3h):**
- Build `/qualify` form page
- Set up Vapi account, create AI call agent with Agency OS script

**Afternoon (4h):**
- Import Outbound Lead Qualifier.json into n8n
- Wire: qualifier form submit → n8n webhook → Vapi call → scoring → Supabase update
- Test with your own phone number

**End of day:** Your phone rings 2 minutes after filling the form. AI talks to you. Score written to DB.

### Day 9 (Thursday) — Booking + Offer Page
**Morning (3h):**
- Build `/book` page with Cal.com embed
- Implement signed token access (only hot leads can reach /book)

**Afternoon (4h):**
- Build `/offer` page
- Record Loom VSL (2-3 min, script from planning/offer.md)
- Add pricing table, guarantee, FAQ

**End of day:** Hot lead flow works end-to-end. Offer page live on localhost.

### Day 10 (Friday) — Onboarding + E2E Test
**Morning (3h):**
- Build `/onboarding` page (post-payment)
- Stripe checkout session wiring
- Test with Stripe test card: full flow from homepage to onboarding page

**Afternoon (3h):**
- Fix all bugs found in E2E test
- Puppeteer screenshot all 6 pages, 2 passes
- Mobile responsive check (375px, 768px, 1440px)

**Evening (1h):**
- Final review on localhost
- Get approval from self: "would I pay $18K?"
- Push to GitHub → Vercel deploys

**End of day:** Full funnel live in production. Tested end-to-end with test payment.

### Days 11-12 (Weekend) — Polish
- Content: write the 5 SEO articles from planning/content-strategy.md
- Record a second Loom: 5-min walkthrough of Agency OS for LinkedIn profile
- Update LinkedIn profile banner + headline to reflect Agency OS

---

## WEEK 3 — SALES MOTION (Days 13-19)

### Day 13 (Monday) — Outbound Engine
**Morning (3h):**
- Paste PHASE 5 PROMPT — deploy Inbox Management Agent + Calendar Agent
- Wire Gmail OAuth, Cal.com webhooks

**Afternoon (4h):**
- Apify: scrape 500 ICP agency accounts from LinkedIn
- Import LinkedIn Agent, configure for 20 sends/day max
- First 20 messages go out today

**End of day:** 20 personalized LinkedIn messages sent. Inbox triage live.

### Day 14 (Tuesday) — Content Launch
**Morning (2h):**
- Publish SEO article #1 to `/posts/[slug]`
- Post to LinkedIn with link

**Afternoon (3h):**
- Email your warm list (if any) with: "I built something for agencies like yours. Here's the free audit."
- Personal DM outreach to 20 people you know (no LinkedIn automation — real messages)

**Evening (2h):**
- Replies come in — reply to every one within 1 hour
- Book discovery calls from anyone showing interest

### Days 15-19 — Sales Cycle
**Daily routine:**
- 8am: Check inbox, respond to replies
- 9am: Run LinkedIn outreach batch (20 new + 20 follow-ups)
- 10am-12pm: Discovery calls (up to 4/day)
- 1pm-3pm: Funnel optimization based on feedback
- 4pm-5pm: Write 1 LinkedIn post + 1 X post
- 6pm: Review metrics

**Target by end of Day 19:**
- 100 outbound sent
- 50 leads in Supabase (from audit scans)
- 10 qualifier calls completed
- 5 sales calls booked
- 1-2 sales calls completed

---

## WEEK 4 — CLOSE + ITERATE (Days 20-30)

### Days 20-25
**Goal: close first client.**

Daily:
- 2-4 sales calls
- Follow up with every lead from prior days
- Post 1 LinkedIn + 1 X daily
- Write and publish SEO article #2-3

**If a call doesn't close:**
- Ask: "What would need to be true for this to be a yes?"
- Document every objection in `decisions/log.md`
- If 3 calls don't close, step back and review the offer with them

### Day 26-28 — First Close Protocol

When the first "yes" happens:
1. Send Stripe link IN THE CALL, not after. $9K now.
2. Immediately: create Slack Connect channel, invite them
3. Send onboarding kickoff form via email
4. Day 1 of delivery: kickoff video call, access grants
5. Document every delivery step — this becomes your operations SOP

### Day 29-30 — Case Study + Testimonial
- Day 14 of delivery (end of first engagement): schedule testimonial call
- Record Loom walkthrough of what was built
- Create case study page on site
- Collect $9K second installment
- Ask for introductions: "Which 3 agency owners would benefit from this most?"

**End of Day 30: $18K collected. 1 case study. 3 warm referrals. Proof of concept.**

---

## WHAT FAILURE LOOKS LIKE

By Day 30, if you haven't:
- Closed 1 client → traffic problem (not enough outbound) OR offer problem (wrong ICP)
- Booked any calls → landing page problem (CTA not compelling) OR outbound problem (wrong ICP)
- Captured any emails → scan problem (too long, too demanding, wrong audience)

Diagnose, then fix the ONE thing. Do not add more features. Do not start vertical #2.

---

## WHAT DAY 30 SHOULD LOOK LIKE (target)

- $9K collected (first installment from Client #1)
- 1 client in active 14-day delivery
- 200+ emails captured in leads table
- 50+ qualifier calls completed
- 5-10 sales calls completed
- 3 case studies in progress (Client #1 + 2 being pitched)
- Content: 3-5 SEO articles live, 30 LinkedIn posts, 30 X posts
- Outbound: 500+ personalized messages sent
- Inbox triage running autonomously
- Funnel conversion rates documented (where are people dropping? optimize there)

## WHAT DAY 60 SHOULD LOOK LIKE

- $36K-54K collected (Client #1 complete + 1-2 more in delivery)
- 3-5 active clients
- $3K-7K MRR from retainers
- Content machine running autonomously (3 articles/week, daily social)
- Newsletter launched with 200+ subs
- First case study published with quantified results

## WHAT DAY 90 SHOULD LOOK LIKE

- $90K+ collected
- 5-8 clients
- $7K-12K MRR
- Case studies are closing deals on their own ("I saw what you did for X, can you do it for us?")
- Faceless video machine launched (if MRR targets met)
- Planning Phase 7 extraction — ready to clone to Home Services AI

If this plan hits Day 30 target, Phase 7 becomes realistic at Day 90-120.
If it doesn't, we fix the funnel, not add verticals.
