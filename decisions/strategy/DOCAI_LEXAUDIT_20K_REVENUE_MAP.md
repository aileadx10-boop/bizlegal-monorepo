# DocAI + LexAudit → $20K/mo Revenue Map

**Date:** 2026-06-17  
**Author:** Revenue Strategy (Claude Code)  
**Status:** Battle plan — actionable immediately  

---

## TL;DR — Fastest Path to First $1,000

**Fix the DocAI IPN webhook (30 min, Moses-only), then run a 7-day Reddit cold-DM blitz targeting startup founders who just signed term sheets or vendor contracts.**

The single highest-leverage action is correcting `NEXT_PUBLIC_SITE_URL` in Vercel to `https://docai.bizlegal-ai.com`. Right now every person who attempts to pay gets nothing back. The product works; the plumbing is severed at one env var. No marketing spend matters until that is fixed.

---

## 1 — CUSTOMER MATH

### Option A: 150 DocAI scans + 55 LexAudit subs = ~$20K/mo

- DocAI: 150 × $97 = $14,550
- LexAudit: 55 × $99/mo = $5,445
- **Total: $19,995**

### Option B: 100 DocAI scans + 105 LexAudit subs = ~$20K/mo

- DocAI: 100 × $97 = $9,700
- LexAudit: 105 × $99/mo = $10,395
- **Total: $20,095**

### Which is more realistic?

**Option A is more realistic in the first 6 months. Option B is the 12-month target.**

Rationale:

- DocAI is a transactional product. Each scan is an event triggered by a real document (NDA, vendor contract, term sheet). The trigger rate scales with deal flow and news cycles. 150 scans/mo = 5/day across the entire internet — achievable with 3-4 active acquisition channels.
- LexAudit requires convincing a compliance professional to commit to a recurring charge with no prior trust. The product identity crisis (two different products on the same domain) must be resolved before any subscription funnel can convert consistently. 55 subscribers is realistic only after that is fixed and after 60-90 days of content + SEO authority.
- The right framing: DocAI is the cash engine that funds the time to build LexAudit's subscriber base. Do not treat LexAudit as a parallel sprint — sequence it after DocAI is converting.

### Calibrated milestones:

| Month | DocAI scans | LexAudit subs | MRR |
|-------|-------------|---------------|-----|
| 1 | 12 | 0 | $1,164 |
| 2 | 30 | 5 | $3,405 |
| 3 | 60 | 15 | $7,305 |
| 4 | 90 | 30 | $11,730 |
| 6 | 140 | 55 | $19,130 |

---

## 2 — PRODUCT-MARKET FIT DIAGNOSIS

### DocAI: $97 vs $2K–$5K lawyer review

**What problem it solves that has no free alternative:**  
A startup founder receiving a 40-page SaaS Master Services Agreement at 11pm before a board meeting cannot get a lawyer on the phone for under $500. They cannot use ChatGPT with confidence because it hallucinates jurisdiction-specific clause implications. DocAI gives them a structured, evidence-cited risk report in under 3 minutes with specific clause references and red-flag severity ratings.

The competitor is not other AI tools — it is the silence of "I guess I'll just sign it." DocAI converts that silence into a paid action.

**PMF signal to watch:** Repeat scan rate. If a user scans a second document within 30 days, the product works. Track this in Supabase. Target: 20%+ repeat rate by month 3.

**PMF risk:** The free 2-red-flag preview must be genuinely alarming, not generic. If the preview says "this contract contains indemnification clauses" (obvious), nobody pays. If the preview says "Clause 14.3 exposes you to unlimited liability for third-party IP infringement with no carve-out — we found 2 more like this," they pay.

### LexAudit: $99/mo vs $250/hr compliance consultant

**What problem it solves that has no free alternative:**  
A 10-person fintech startup with no in-house compliance officer needs to know if the EU AI Act, DORA, or SEC cybersecurity rules changed in a way that affects their vendor contracts before their next audit. A compliance consultant charges $2,500/month for a retainer. Google Alerts miss regulatory nuance. LexAudit automated monitoring at $99/mo is a 25x cost arbitrage.

**PMF risk:** The value delivery is invisible until it fires an alert. If it never fires a relevant alert in the first 30 days, the subscriber assumes it does not work and cancels. The onboarding flow must proactively deliver a "look, we already found something" email within 72 hours of signup — even if it requires seeding the first alert manually for early users.

**Critical PMF blocker:** Resolve the dual product identity. Pick ONE:
- Option 1: LexAudit = $99/mo automated regulatory monitoring for compliance teams (B2B SMB)
- Option 2: LexAudit = $49-$599/mo law firm AI-usage compliance matter tracker (B2B legal)

**Recommendation: Option 1 (compliance teams).** It has a larger addressable market, lower friction, and naturally bundles with DocAI. Law firm matter tracking is a different sales cycle entirely (3-6 month enterprise sales, IT procurement). Pick the faster path.

---

## 3 — IDEAL CUSTOMER PROFILES

### Persona A — DocAI Primary Buyer: The Solo Founder Signing Deals

**Who:** Pre-seed to Series A founder. Legal budget: $0 to $500/month. Signing vendor MSAs, NDAs, SaaS subscription agreements, and employment contracts 2-4× per quarter.

**Pain:** Gets a contract from a bigger company. Knows they should review it. Cannot justify $1,500 for a lawyer. Signs anyway and hopes. Has been burned once.

**Trigger:** Received a contract that felt "weird." Just closed a funding round and is now in vendor due diligence. Partner asked "did legal review that?"

**Where to find them:** YCombinator forums, r/startups, r/legaladvice, r/SaaS, LinkedIn "congratulations on your funding" posts, Product Hunt new launch pages (founders just launched = they are signing contracts).

**Objection:** "Can't I just use ChatGPT for free?" Answer: "ChatGPT doesn't cite which clause page 14 of your NDA has the problem. We do."

**Scan frequency:** 2-4 scans/quarter. Revenue: $194-$388/year per customer.

### Persona B — LexAudit Subscriber: The Head of Compliance at a 50-Person Fintech

**Who:** VP/Director of Compliance or Risk at a fintech, insurtech, or healthtech company. 50-200 employees. Cannot afford a Big 4 retainer. Responsible for monitoring GDPR, PCI-DSS, SOC 2, and now AI Act.

**Pain:** Regulators update guidance quarterly. They find out 3 months late when a vendor audit flags a gap. No system in place for proactive monitoring.

**Trigger:** Just failed an internal audit. Just saw a competitor get fined. Just hired a new CISO who asked "what's our regulatory monitoring process?"

**Where to find them:** LinkedIn "Head of Compliance" + fintech company 50-200 employees. Compliance Week newsletter. IAPP community. r/compliance.

**Objection:** "How do I know the alerts are accurate?" Answer: "We cite the source URL and the specific section that changed, with a semantic diff. You verify in 2 minutes, not 2 hours."

**Churn trigger:** Never received a relevant alert in 30 days. Fix: send a "here's what changed in your tracked frameworks this month" email regardless of whether the SHA-256 diff fired, summarizing the monitoring activity.

### Persona C — Bundle Buyer: The Startup Legal Ops Lead

**Who:** Operations lead or "legal ops" at a 20-100 person company. Not a lawyer but manages contracts, compliance docs, and vendor relationships. Uses Notion, Airtable, or Ironclad.

**Pain:** Reviewing incoming vendor contracts takes 2-3 days per contract waiting for outside counsel. Monitoring regulatory changes is a quarterly manual process. Both are preventable with the right tools.

**Value:** Bundle = DocAI (scan all incoming contracts) + LexAudit (monitor frameworks their vendors reference in their MSAs). Together they cover the full contract lifecycle.

**Price point:** $149/mo bundle (10 DocAI scans + LexAudit unlimited monitoring) vs $97×10 + $99 = $1,069. Bundle is an 86% discount for regular users, framed as a seat license.

**Where to find them:** Operations-focused communities: Heavybit, SaaStr, Operators Guild Slack. LinkedIn "Head of Operations" + company 20-100 employees.

### Persona D — Enterprise/Team Buyer: GC at a 200-500 Person Company

**Who:** General Counsel or Associate GC managing a team of 2-4 paralegals. Reviewing 20-50 contracts per month. Needs audit trails, team access, and vendor-grade security documentation.

**Pain:** Outside counsel costs $400-$800/hr for first-pass review. Internal paralegals do first pass but miss nuanced AI-Act-adjacent liability clauses. Needs a first-pass tool that scales.

**Value:** $499/mo team tier = 50 DocAI scans + 5 LexAudit seats + dedicated Slack support + SOC 2 compliance documentation. ROI: saves 3 hours of paralegal time per contract × 20 contracts = 60 hours × $75/hr internal cost = $4,500 savings vs $499/mo.

**Sales cycle:** 2-4 weeks. Requires: SOC 2 readiness summary, data processing agreement (ironic — DocAI can generate this), privacy policy review. Do not attempt this until month 4+.

---

## 4 — PRICING STRATEGY REVIEW

### Is $97/scan optimal?

**Yes, for the solo-founder persona. No, for enterprise.**

Competitive landscape:
- Ironclad AI: enterprise, $1,500+/mo
- Spellbook (contract AI): $49-$99/mo subscription
- LawGeex: $99/document, enterprise
- Clio: legal practice management, not document AI
- ChatGPT with a custom prompt: free but uncited, unstructured

$97 is positioned correctly against Spellbook (same ballpark, one-time vs subscription) and dramatically cheaper than LawGeex. The risk: $97 feels arbitrary. $99 is a cleaner psychological anchor. Recommend changing to $99 (2% price increase, higher perceived value).

**Volume pricing for Persona D:**
- 1 scan: $99
- 5 scan pack: $399 ($80/scan, 19% discount)
- 20 scan pack: $1,299 ($65/scan, 34% discount)

### Should LexAudit be $99, $149, or $199/mo?

Once the dual-product identity is resolved in favor of "compliance monitoring for SMB fintechs":
- **$99/mo is the right entry price** — low enough for a solo compliance officer to expense without approval
- **$199/mo for Boutique** (5 frameworks, weekly digest, priority support) — correct
- **$499/mo for Team** (unlimited frameworks, 5 seats, audit-ready reports) — add this tier

Remove the $49/mo Solo tier. It positions LexAudit as a toy. Compliance officers do not want the cheapest option — they want the one they can defend to their CISO.

### Bundle opportunity: $149/mo = DocAI unlimited + LexAudit?

**Yes, but reframe it.** Not "unlimited scans" — that kills margin. Frame it as:

**Compliance Bundle: $149/mo**
- 10 DocAI scans/mo (additional at $79/scan)
- 3 tracked regulatory frameworks
- Monthly compliance health report
- For: solo compliance officers and legal ops leads

This bundle creates a subscription context for DocAI (recurring MRR) while giving LexAudit a lower-friction entry point bundled to a familiar transactional product.

### Enterprise tier: $499/mo for teams?

Yes. Implement in month 3. Not before. Requirements: team seats (Supabase auth multi-tenant), audit trail export, DPA template pre-generated, Slack/email support SLA. Not complex to build but needs a paying customer to justify the sprint.

---

## 5 — ACQUISITION CHANNELS (ranked by expected ROI)

### Tier 1: Highest ROI, fastest to first revenue

**1. Reddit organic (Day 1-30)**

Subreddits with buying-intent founders:
- r/legaladvice — "I got this NDA, is this clause normal?" → reply with value, mention DocAI
- r/startups — "How do you handle vendor contracts?" → community post, not ad
- r/SaaS — "How much do you spend on contract review?" → lead with the price comparison
- r/legaltech — direct product posts, community is friendly to tools

Post format that converts: "We built DocAI after a founder friend signed a vendor contract with unlimited liability exposure. Here's what our AI flagged in 3 minutes that her $2K/hr lawyer missed. [screenshot of real red flags]. Try your first contract free for the next 48 hours." Do not post ads — post results.

**2. LinkedIn cold outreach to GCs and legal ops (Day 3-30)**

Target: "Head of Legal" or "General Counsel" at companies 20-200 employees, Series A-B, fintech/SaaS/healthtech vertical.

Message sequence:
- Day 1: Connection request with note: "Saw your company just raised — congrats. We help legal ops teams cut first-pass contract review from days to minutes."
- Day 3 (if connected): "Curious what your current process is for reviewing incoming vendor MSAs. We built DocAI — here's a 60-second demo. Would a free scan of one of your actual contracts be useful?"
- Day 7 (if no reply): "Leaving this here in case it's ever relevant — our report shows exactly which clauses create exposure, with page references. No obligation." + link to sample report.

Target: 50 connection requests/day, 10% acceptance, 5% demo, 20% demo-to-pay = 5 paying customers/month from this channel alone.

**3. Twitter/X contract horror stories (Day 1-30)**

Post a weekly "contract horror story" thread: "This startup almost signed away perpetual IP rights in clause 6.2 of a standard vendor NDA. Here's what it looked like and what the red flag means." End with: "DocAI flags these in 3 minutes. Your contract is next."

Engage with founders publicly celebrating funding rounds ("Congrats on the raise! Quick tip: have someone review your first investor side letters before you sign — we've seen some nasty arbitration clauses").

### Tier 2: Slower but scalable

**4. SEO: Contract review + compliance keywords**

High-opportunity keywords (low competition, high intent):
- "nda red flags checklist" — 1,200/mo searches, DA 30-40 competitors
- "vendor contract review checklist startup" — 800/mo, sparse results
- "saas master services agreement review" — 600/mo, lawyer blogs rank, beatable
- "gdpr compliance monitoring tool small business" — 400/mo, LexAudit-specific
- "eu ai act compliance checklist" — 900/mo, growing fast, very few tool pages rank

Content strategy: 2 posts/week, each targeting one keyword with a real contract clause example analyzed by DocAI. Include a CTA to paste their own clause. The blog is already live at blog.bizlegal-ai.com — use the curator pipeline to generate these.

**5. Product Hunt launch for DocAI**

Do this in month 2 after fixing all critical blockers. Requirements before launch:
- IPN webhook fixed (NEXT_PUBLIC_SITE_URL)
- Payoneer fallback link populated (PAYONEER_DOCAI_LINK)
- Sample scan report downloadable from homepage
- "First scan free" offer for PH day only

Target: Top 5 in "Developer Tools" or "Legal Tech" category. PH launches typically generate 50-200 signups day-of. With a "first scan free" hook and a compelling sample report, expect 15-30 conversions.

**6. Cold email to compliance officers (Month 2+)**

Target list: Crunchbase + LinkedIn. Criteria: fintech/healthtech/insurtech, 50-500 employees, has a compliance or legal team listed. Estimated list: 2,000 companies in this profile.

Email sequence:
- Subject: "How [Company] tracks GDPR/SOC 2 changes"
- Body: 3 sentences. "We monitor regulatory frameworks for compliance teams that can't afford a Big 4 retainer. When GDPR guidance or DORA updates, you get an email with the exact section that changed. $99/mo, cancel anytime. Can I show you a live demo?"

Expected: 2-3% open rate on cold list, 0.5% reply rate, 20% demo-to-close = 2-3 customers per 1,000 emails.

**7. Law firm referral partnerships (Month 3+)**

Target: boutique law firms (2-15 attorneys) specializing in startup/tech/fintech. Pitch: "Refer your clients to DocAI for first-pass review. We catch the obvious issues; you handle the nuanced ones. We'll pay 20% commission on every scan a client of yours runs." This positions DocAI as a complement to lawyers, not a replacement.

10 referral partners × 3 client scans/month × $97 = $2,910/month from referral channel alone.

---

## 6 — CONVERSION OPTIMIZATION

### Free trial vs freemium for LexAudit

**Recommendation: 14-day free trial with mandatory credit card capture at signup, not open freemium.**

Freemium risk for LexAudit: The value is in the alert, not the dashboard. A freemium user who sets up 2 frameworks and never gets an alert will never convert. They will churn silently and never return.

Free trial with CC capture works because:
- Forces real commitment signal
- Allows charging immediately if they don't cancel
- Creates urgency to "see the product work" within 14 days
- During the 14-day window, manually trigger one alert per trial user (even if you have to do it by hand for the first 20 users)

### DocAI: First scan free or discounted?

**Recommendation: Free preview of 2 red flags (current), NOT a free first scan.**

Full free scan devalues the report. The current model (free preview → pay to unlock full report) is correct conceptually. The execution problem is that the free preview is not alarming enough.

Fix the preview: The two free red flags shown should be the most severe ones found, not the first two in the analysis. Reorder the API response by severity before returning the preview. This alone may double the conversion rate from preview to purchase.

**Discounted first scan:** Consider a "founding member" price of $49 for the first scan with a Reddit or PH promo code. This lowers the barrier for first-time users while capturing intent. After their first scan, charge full price — they've seen the value.

### Minimum viable demo to show value before payment

For DocAI: A static sample report on the homepage showing the analysis of a publicly available standard NDA. Show: clause reference, severity rating, specific language quoted, risk explanation, recommended action. No signup required to see this. Let the sample do the selling.

For LexAudit: A "live status" page showing the last 7 changes detected across 3 public regulatory frameworks (GDPR, SOC 2, CCPA). Updated daily. Shows the product works without requiring signup. Link from the homepage above the fold.

---

## 7 — RETENTION MECHANICS (LexAudit)

### What keeps subscribers?

The core retention loop must be: **trigger → explain → save them time**.

Every email alert must include:
1. What changed (specific section/paragraph)
2. Why it matters to their business (1-2 sentences, plain English)
3. What action they should consider (draft a vendor notification, update their privacy policy, etc.)
4. A link back to their LexAudit dashboard

Weekly digest email (Sunday evening, for Monday morning reading):
- "This week in compliance" — 3-5 items from tracked frameworks
- Your compliance health score this week: 87/100 (up 3 from last week)
- Recommended action: Update your data processing agreement template (we flagged a new GDPR guidance update)

Monthly health score report (first of month):
- Overall score, trend chart (simple % gauge is enough)
- Top 3 risks detected this month
- Frameworks monitored with last change date
- "Share this report" button (PDF export) — for compliance officers who need to report upward

### What is currently implemented?

| Mechanic | Status |
|----------|--------|
| Daily SHA-256 diff cron | Code exists, runs 06:00 UTC, but no subscribers to notify |
| Firecrawl semantic-diff enrichment | Code exists, requires API keys |
| Email alerts to subscribers | NOT IMPLEMENTED (no compliance_subs rows, no email trigger) |
| Weekly digest | NOT IMPLEMENTED |
| Monthly health score report | NOT IMPLEMENTED |
| /api/digest endpoint | Hardcoded stub — returns fake data |

**Retention is currently entirely broken** because no subscriber has ever been onboarded. The subscription provisioning bug (no compliance_subs row created after payment) must be fixed before any retention mechanic matters.

---

## 8 — REVENUE MILESTONES

### $1K MRR

**Timeline:** 3-4 weeks after blocker fixes  
**Tactics:**
- Fix NEXT_PUBLIC_SITE_URL immediately (Moses, 5 min in Vercel UI)
- Populate PAYONEER_DOCAI_LINK immediately (Moses, 5 min in Vercel UI)
- Run Reddit outreach on r/legaladvice, r/startups, r/SaaS (30 min/day for 7 days)
- Post DocAI sample report on LinkedIn (2-3 posts showing real flagged clauses)
- 12-15 DocAI scans at $97 = $1,164-$1,455

**What success looks like:** 3 separate customers paid in the same week. At least 1 repeat scan within 30 days.

### $5K MRR

**Timeline:** Month 2-3  
**Scale what worked:**
- Increase Reddit posting cadence, add r/legaltech and r/consulting
- Launch LinkedIn cold outreach sequence to 50 GC/legal ops contacts/day
- Fix LexAudit product identity (pick one product, update homepage)
- Fix LexAudit subscription provisioning bug
- Launch LexAudit free trial, target 10 trial starts per week
- 60 DocAI scans ($5,820) + 0-5 LexAudit trials converting ($495)
- Product Hunt teaser post

### $10K MRR

**Timeline:** Month 4-5  
**New channels needed:**
- Product Hunt launch (coordinate with social posts)
- Content SEO: 8 posts targeting contract-review keywords live and indexed
- Referral program: 3-5 law firm partners generating referrals
- Bundle offer launched at $149/mo
- LexAudit: 30+ active subscribers with working retention emails
- DocAI: 90+ scans/mo + 30 LexAudit subs = $10,630

### $20K MRR

**Timeline:** Month 6-8  
**Enterprise plays:**
- First enterprise tier customer ($499/mo team plan)
- Accounting firm referral network (CPA firms with fintech clients)
- LinkedIn paid ads (retargeting visitors who viewed the sample report)
- 3-5 law firm referral partners generating 30+ scans/month combined
- Blog SEO driving 500+ organic monthly sessions
- 140 DocAI scans + 55 LexAudit subs + 2-3 enterprise = ~$22K/mo

---

## 9 — 7-DAY SPRINT TO FIRST $1,000

### Day 1 (Monday) — Fix the plumbing (Moses)

- [ ] Vercel → docai project → Environment Variables → set `NEXT_PUBLIC_SITE_URL=https://docai.bizlegal-ai.com` (all environments)
- [ ] Vercel → docai project → set `PAYONEER_DOCAI_LINK` to actual Payoneer payment link
- [ ] Verify redeploy succeeded: https://docai.bizlegal-ai.com/api/payment/webhook returns 405 (not 404)
- [ ] Create and upload one real NDA to DocAI manually, attempt $97 crypto checkout, confirm NOWPayments IPN fires and report unlocks
- [ ] If IPN does not fire within 5 minutes: check NOWPayments dashboard for callback URL set on the API key — it must point to `https://docai.bizlegal-ai.com/api/payment/webhook`

**Target: DocAI payment flow works end-to-end before moving to Day 2.**

### Day 2 (Tuesday) — Create the sample report

- [ ] Take a real, publicly available standard vendor NDA (e.g., the Salesforce standard MSA from their public site)
- [ ] Run it through DocAI, screenshot the full report output
- [ ] Write a LinkedIn post: "We just scanned Salesforce's standard vendor NDA. Here's what we found: [3 specific red flags with clause numbers]. Full report took 90 seconds. We charge $97. A lawyer would charge $1,500. Try yours: [link]"
- [ ] Post same content to r/legaladvice (as a comment on an NDA thread, not a self-promo post)
- [ ] Post to r/startups as an educational post: "5 red flags in standard vendor NDAs that most founders miss (with real clause examples)"

**Target: 200 impressions, 20 link clicks, 1-2 sales.**

### Day 3 (Wednesday) — LinkedIn outreach list

- [ ] Search LinkedIn for "Head of Legal" OR "General Counsel" + company 20-100 employees + Series A + fintech/SaaS
- [ ] Send 30 connection requests with note: "Saw [Company] is scaling fast. We built DocAI to cut contract review from days to 90 seconds — happy to share a free sample report."
- [ ] Post a Twitter/X thread: "The 3 contract clauses that have destroyed more startups than any other. Thread." (educational, ends with DocAI link)
- [ ] Engage with 5 founder posts celebrating new vendor partnerships or fundraises — leave a genuine comment, not a pitch

**Target: 10 connection accepts, 2 replies, 1 demo scheduled.**

### Day 4 (Thursday) — Reddit value-add campaign

- [ ] Find 5 active threads on r/legaladvice or r/startups where someone is asking about contract clauses or legal review
- [ ] Write genuine, helpful replies (2-4 paragraphs each) with substantive legal context
- [ ] At the end of each reply, one sentence: "We built DocAI to automate exactly this kind of review — here's a sample report if you want to see what it finds: [link]"
- [ ] Do not post in the same subreddit twice in 24 hours or accounts risk shadow-ban
- [ ] Post in r/legaltech: "We shipped DocAI — automated contract risk scanning with evidence-cited red flags. Built it for founders who can't afford a lawyer for every NDA. Here's the product: [link] Happy to do a free scan for anyone in this thread."

**Target: 5 meaningful comments, 50 upvotes combined, 3-5 link clicks, 0-1 sale.**

### Day 5 (Friday) — Follow up + first LexAudit step

- [ ] Reply to anyone who clicked the DocAI link but didn't purchase (check analytics/email if any signups came through)
- [ ] If any LinkedIn connections replied: send demo link or offer free 1-scan credit in exchange for a 10-minute call
- [ ] Fix LexAudit product identity: update homepage landing-content.tsx to remove the $99/mo framing until the subscription provisioning bug is fixed — replace with "Join the waitlist for early access" or "Coming soon" to avoid selling a broken product
- [ ] Post second LinkedIn piece: a DocAI case study framed as "What we found when we scanned 10 startup vendor contracts" (use the Salesforce NDA + 2-3 public samples as the dataset)

**Target: 1 confirmed sale ($97), 1 follow-up demo scheduled for next week.**

### Day 6 (Saturday) — Content creation for week 2

- [ ] Write 2 blog posts for the curator pipeline (contract-review keyword targets):
  - "NDA red flags checklist: 12 clauses every startup founder should review before signing"
  - "Vendor contract review: what to look for in a SaaS Master Services Agreement"
- [ ] Each post should include a CTA to DocAI and a screenshot of a sample report
- [ ] Schedule both for next Tuesday and Thursday posting
- [ ] Identify 10 more LinkedIn targets for week 2 outreach

**Target: 2 SEO articles queued, 10 outreach targets identified.**

### Day 7 (Sunday) — Review and iterate

- [ ] Check NOWPayments dashboard: how many checkout attempts? How many confirmed payments?
- [ ] Check DocAI analytics: how many free preview reports generated? What is the preview-to-payment conversion rate?
- [ ] If conversion rate < 5%: the free preview is not alarming enough — reorder by severity
- [ ] If conversion rate > 15%: the channel is working — double the outreach volume immediately
- [ ] Write weekly snapshot: scans attempted, scans paid, revenue captured, channel breakdown
- [ ] Plan week 2 based on what worked

**Week 1 target: 3-5 paying customers, $291-$485 in revenue. Path to $1K is clear by week 3.**

---

## 10 — PAYMENT FRICTION SOLUTIONS

### NOWPayments (crypto) as the primary gateway

**The positioning problem:** Most B2B SaaS buyers have never used crypto and won't start for a $97 contract scan. Crypto-only checkout will block 80%+ of potential buyers.

**What to do immediately (before PayPal is fixed):**

1. **Invoice-me flow via Payoneer:** Add a button on the DocAI payment page: "Pay by card or bank transfer — get invoice via Payoneer." This button links to the PAYONEER_DOCAI_LINK (which must be populated). Payoneer generates a hosted payment page that accepts Visa/Mastercard and international bank transfers. This is the fastest non-crypto path.

2. **Manual payment option for high-value buyers:** Add a "Request invoice" form. When submitted, sends Moses an email with the buyer's info. Moses sends a Payoneer invoice manually. Report is unlocked manually after payment confirmed. This is not scalable but closes enterprise deals while the payment infra is being fixed.

3. **PayPal fix timeline:** PayPal requires fresh live API credentials (Client ID + Secret from the PayPal developer dashboard, live environment, not sandbox). This is a 20-minute fix once Moses logs into developer.paypal.com. Prioritize this for week 2.

### How to position crypto as a feature, not a bug

For the right buyer, crypto is a feature:
- "Pay in USDC — no card data stored, no bank transaction visible to your employer, instant settlement, 3% discount vs card price"
- Target: privacy-focused founders, DAOs, crypto-native companies
- Do not lead with crypto for traditional B2B buyers — lead with Payoneer/invoice

**Tiered checkout page (ideal state, build in week 2):**
1. Pay with crypto (USDC/ETH via NOWPayments) — $97
2. Pay by card (via Payoneer hosted page) — $97
3. Request invoice (bank transfer, net-15) — $97 + $10 admin fee for small amounts
4. Enterprise pricing ($499+/mo) — "Contact us"

### Bank transfer for enterprise

For Persona D (enterprise GC), offer: "We accept wire transfer for annual contracts. Email [ops@bizlegal-ai.com] with your PO number." Annual deal at $499/mo = $5,988/year → a wire transfer is worth the manual overhead.

---

## Critical Blockers Summary (Action Required Before Any Marketing)

| Priority | Blocker | Owner | Time to Fix | Impact |
|----------|---------|-------|-------------|--------|
| P0 | DocAI `NEXT_PUBLIC_SITE_URL` wrong domain | Moses (Vercel UI) | 5 min | IPN webhook fires to wrong URL, 0% payment unlock |
| P0 | `PAYONEER_DOCAI_LINK` is blank | Moses (Vault) | 10 min | No card fallback, crypto-only = 80% buyer blocked |
| P0 | LexAudit dual product identity | Strategy decision | 30 min | No page converts because buyer doesn't know what they're buying |
| P0 | LexAudit: no subscription provisioning after payment | Dev | 2-3 hours | Every LexAudit subscriber gets nothing after paying |
| P1 | DocAI preview not sorted by severity | Dev | 1 hour | Low-urgency preview = low conversion rate |
| P1 | PayPal PAYPAL_ENV=sandbox in production | Moses (Vercel UI) | 5 min | PayPal orders hit sandbox, never settle |
| P1 | LexAudit /api/digest returns hardcoded stub | Dev | 3-4 hours | Hub ops dashboard shows fake compliance data |
| P2 | DocAI template generator has no payment gate | Strategic choice | N/A | Either add paywall or commit to freemium lead gen |

**Do not run any acquisition campaign until P0 blockers are resolved. Every paid customer during P0 state gets a broken experience and will charge back or demand a refund.**

---

## The Single Highest-Leverage Action

Fix `NEXT_PUBLIC_SITE_URL=https://docai.bizlegal-ai.com` in Vercel.

This one environment variable is the difference between $0 and $1,000 in the next 7 days. The product is built. The funnel exists. The IPN webhook fires to the wrong domain and nobody gets their report. The fix takes 5 minutes in the Vercel UI. Everything else in this document is downstream of that one action.

**After that fix, the order of operations is:**
1. Populate PAYONEER_DOCAI_LINK (5 min)
2. Test a real $97 checkout end-to-end (30 min)
3. Post the sample report on LinkedIn and Reddit (2 hours)
4. Watch the first sale come in

The $20K/mo path is real. The math works. The product-market fit is real (contract review is a $50B market with genuine pain and no accessible sub-$100 option). The only thing standing between $0 and revenue is a 5-minute Vercel UI change.
