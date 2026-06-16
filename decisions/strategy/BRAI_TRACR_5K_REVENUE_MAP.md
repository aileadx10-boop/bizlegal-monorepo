# BRAI + TRACR Revenue Map: $5K/mo Battle Plan

**Created:** 2026-06-17
**Author:** Revenue Strategy Agent
**Target:** $5,000/mo MRR from BRAI (sanctions/regulatory) + TRACR (blockchain forensics)

---

## 0 — CRITICAL BLOCKERS TO FIX BEFORE ANY OUTREACH

These kill conversion even if you drive traffic. Fix in this order:

### Must-Fix in 24h (TRACR)
1. **Set `GOLDRUSH_API_KEY` on Vercel** — /analyze returns empty data without it. This is the freemium hook. Dead without it.
2. **Set `NOWPAYMENTS_IPN_SECRET` on Vercel** — webhook sig verification fails silently; no report generates after payment.
3. **Set `NEXT_PUBLIC_SITE_URL=https://tracr.bizlegal-ai.com` on Vercel** — all success/cancel/IPN URLs broken without it.

### Must-Fix in 24h (BRAI)
4. **Redirect `/network` CTA to `/scan` or a direct checkout** — the primary '$49 Full Report' button leads to an enterprise intake form. This is the main landing page CTA. It converts zero.
5. **Wire BRAI `/scan` to BRAI's own `/api/payments/nowpayments/start`** — it currently calls a TRACR-local route that doesn't exist on BRAI.

### Fix in 48h (Both)
6. **Remove "PayPal" mentions from TRACR /analyze and /report pages** — PayPal is 401 broken. False advertising on CTAs destroys trust. Replace with "Pay with crypto (USDT, BTC, ETH)".
7. **Auto-trigger report generation on webhook** — remove the manual 'Generate Full Report' button friction. Webhook already calls it; confirm it fires reliably, then remove the button.
8. **Add USDT-ETH and BTC as pay_currency options** in `/api/scan/checkout` — hardcoded `usdtbsc` means BNB Chain only. Most crypto-native buyers hold ETH or BTC.

---

## 1 — CUSTOMER MATH: Exact Mix to $5K/mo

### Conservative path (Month 2, after env fixes are live)

| Product | Volume | Price | Revenue |
|---|---|---|---|
| TRACR Bronze Forensic Report | 18 | $149 | $2,682 |
| TRACR Silver Forensic Report | 5 | $299 | $1,495 |
| BRAI Regulatory Risk Scan | 22 | $29 | $638 |
| BRAI Full Report (via /scan) | 3 | $149 | $447 |
| BRAI Enterprise Intro (Payoneer invoice) | 1 | $500 deposit | $500 |
| **Total** | | | **$5,762** |

### Why this mix:
- TRACR is the primary revenue engine. Real blockchain data = real freemium hook = believable.
- BRAI $29 scan is a volume play. Low friction, decision-tree warm lead, easy first purchase.
- One enterprise Payoneer invoice per month is realistic if you do targeted LinkedIn outreach.
- TRACR Silver at $299 requires zero additional dev — same pipeline, higher tier.

### Stretch path (Month 3, with content SEO starting to pay)

| Product | Volume | Price | Revenue |
|---|---|---|---|
| TRACR Bronze | 25 | $149 | $3,725 |
| TRACR Silver | 8 | $299 | $2,392 |
| BRAI Scans | 40 | $29 | $1,160 |
| Enterprise intros | 2 | $500 dep. | $1,000 |
| **Total** | | | **$8,277** |

---

## 2 — IDEAL CUSTOMER PROFILES

### Persona A: "The Compliance-Nervous DeFi Founder"
- **Title:** Co-founder / CTO at a DeFi protocol or crypto exchange
- **Company:** 5-30 person team, Series A or pre-revenue, registered in Cayman/BVI/Estonia
- **Geography:** US, EU (Germany, Netherlands), Singapore
- **Trigger that makes them buy TODAY:** Their lead investor or exchange listing partner just asked for a sanctions screening report or AML policy document before wiring funds or going live. Deadline is 48 hours.
- **Where to find them:**
  - Twitter/X: searching "AML compliance" "OFAC screening" "crypto compliance" in the last 7 days
  - Telegram: DeFi founders groups (DeFi Alliance, Developer DAO Discord #legal-compliance)
  - Reddit: r/ethdev, r/defi — posts asking "anyone used Chainalysis? too expensive"
  - LinkedIn: filter "DeFi" + "Founder" + "Compliance" in bio

### Persona B: "The Crypto Asset Recovery Victim"
- **Title:** Individual or small business owner whose wallet was compromised or who received funds from a flagged address
- **Company:** N/A or sole trader
- **Geography:** US, UK, Canada, Australia
- **Trigger that makes them buy TODAY:** Exchange froze their account and cited AML concerns. Or they just discovered their wallet received funds from a sanctioned address. They need a forensic report to submit to the exchange's compliance team to unlock funds.
- **Where to find them:**
  - Reddit: r/CoinBase, r/binance, r/cryptocurrency — posts about "account frozen" "AML hold" "compliance review"
  - Twitter: searching "exchange froze account" "Binance compliance" "Kraken AML"
  - BitcoinTalk: AML/compliance subforum
  - Facebook groups: Crypto recovery groups (high intent, desperate buyers)

### Persona C: "The Fintech Compliance Officer Buying Tools"
- **Title:** Chief Compliance Officer, VP of Compliance, or AML Analyst
- **Company:** Neobank, crypto on-ramp, payment processor, 50-500 employees
- **Geography:** US, UK, EU
- **Trigger that makes them buy TODAY:** Regulator exam coming up in 60 days. Or they just read that a competitor got an enforcement action. Or they need to expand their wallet screening beyond their current toolset (Chainalysis/Elliptic is too expensive per-query).
- **Where to find them:**
  - LinkedIn: "AML Analyst" "Compliance Officer" at companies tagged "Fintech" "Crypto" — message them with a specific use case
  - ACAMS (Association of Certified AML Specialists) community — post in their forums
  - Conferences: MoneyConf, Consensus, Token2049 (attend or monitor the attendee lists on LinkedIn)
  - Slack: FinTech-specific compliance Slack communities (Compliance Slack, RegTech community)

---

## 3 — ACQUISITION PLAYBOOK

### Week 1: Seed the ground with high-intent posts (2-3 hours/day)

**Reddit (primary channel, zero cost, high intent):**
- Post in r/CoinBase, r/binance, r/ethereum, r/defi: answer questions about "my account was frozen" or "AML review" threads. In your reply, mention you built a forensic wallet tool that generates court-ready reports. Do NOT spam — 1-2 replies/day max, each genuinely helpful.
- Create one value post in r/CryptoCurrency: "I analyzed 50 frozen-account cases. Here's the exact AML flag pattern exchanges use — and how to generate a report to get your funds back." Link to TRACR /analyze at the bottom.
- Create one value post in r/ethereum or r/DeFi: "How to check if your wallet interacted with a sanctioned address (OFAC SDN list)." Link to BRAI /decision-tree.

**Twitter/X:**
- Post a thread: "OFAC just added 3 new crypto addresses. Here's how to check if your wallet is exposed." Screenshot the BRAI decision-tree output for a sample address. End with link.
- Reply to any tweet about exchange account freezes with a helpful response + TRACR link.

**LinkedIn (Persona C):**
- Post: "Chainalysis costs $15K/year for SMBs. Here's a forensic wallet analysis tool for $149/report." Target your own network + fintech compliance hashtags.
- Send 10 personalized connection requests to CCOs/AML Analysts at crypto companies with a 1-line note: "Built a blockchain forensics report tool — would love your feedback."

**Day 1-3 target:** 3 Reddit posts, 2 Twitter threads, 10 LinkedIn DMs. Goal is 50 /analyze page visitors.

### Week 2: Convert interest to first paid customers

- Follow up with anyone who commented on Week 1 posts. DM them: "Saw your comment — our free wallet analysis at tracr.bizlegal-ai.com shows the risk flags immediately. What wallet address are you trying to clear?"
- Create 1 case study: take a publicly known frozen-account case (public Reddit thread, no PII), run TRACR on the wallet, write a mini-report. Post the redacted PDF on Twitter/LinkedIn. "This is the kind of report that got someone's funds unfrozen. $149."
- Cold email 5 fintech compliance officers: 3-line email. "Hi [name] — I built a forensic blockchain wallet report service ($149/report) used by DeFi founders to satisfy exchange AML requests. Would you want a free sample report on any wallet your team is reviewing?" Include a link to a sample report PDF.
- Target Telegram groups: DeFi Alliance, ETH Global Discord, Developer DAO — post in #legal or #compliance channels.

**Week 2 target:** First 2-3 TRACR paid reports. First BRAI $29 scan from someone who came through Reddit.

### Weeks 3-4: Scale what worked

- Double down on the channel that produced paying customers.
- If Reddit worked: create a weekly "wallet forensics" post with a new flagged address from public OFAC lists.
- If LinkedIn worked: expand to 20 DMs/week.
- Set up a Typeform "Request a sample report" landing — lower friction than checkout, captures enterprise leads.
- Post the first testimonial (even informal Reddit comment) everywhere.
- Submit TRACR to Product Hunt, AlternativeTo, and Capterra under "AML compliance software" category — these drive SEO intent traffic over 30 days.

---

## 4 — CONVERSION SEQUENCE

```
AWARENESS
└─ Reddit/Twitter post about AML freeze / sanctions check
   └─ "Free wallet check at tracr.bizlegal-ai.com/analyze"

INTEREST (Free Hook)
└─ /analyze page: enter wallet address → see 3 real risk flags
   └─ Email gate: "Get full 15-flag analysis" → email captured
   └─ Nurture email #1: "Here's what the flags mean + what to do"

DEMO/TRIAL (Decision Moment)
└─ Nurture email #2: "Exchanges require a forensic report for fund release"
   └─ CTA: /scan → pick tier → $149 Bronze checkout
   OR
   └─ Direct: user clicks "Order Full Report" on /analyze page

PAYMENT
└─ /scan page → tier selection → /api/scan/checkout
   └─ NOWPayments invoice (USDT-ETH, BTC, USDT-BSC)
   └─ Payment confirmed via webhook → report auto-generated
   └─ /report/[id] page: full AI forensic report rendered

ONBOARDING (Delivery)
└─ Email: "Your report is ready" + link to /report/[id]
   └─ PDF download option
   └─ Optional: 30-min Calendly consultation upsell ($99)

RESULT
└─ Customer submits report to exchange → funds released
   └─ Or: uses BRAI decision-tree output for compliance docs

REFERRAL
└─ Follow-up email at Day 7: "Did the report help? Reply and we'll
   give you a referral link for 20% commission on each sale you send."
└─ LinkedIn post from customer: "This $149 report got my Binance
   account unfrozen in 48 hours" — this is the flywheel.
```

---

## 5 — CONTENT HOOKS (3 posts that drive TRACR purchases)

### Hook 1: "How to get your frozen Binance/Coinbase account unfrozen"
- **Platform:** Reddit (r/binance, r/CoinBase) + repurpose to Twitter thread
- **Angle:** Practical "here's what to do" guide. Step 1: run a forensic wallet analysis. Step 2: generate a report. Step 3: submit to exchange compliance. Mention TRACR as a tool you built.
- **Why it converts:** This exact problem is posted 10-20 times/day across crypto subreddits. People are in acute pain. They have money trapped. They will pay $149 immediately if it has any chance of solving the problem.

### Hook 2: "OFAC just sanctioned these wallet clusters — check if your DeFi protocol received funds from them"
- **Platform:** Twitter/X thread + LinkedIn post targeted at DeFi founders
- **Angle:** Each time OFAC publishes new SDN list updates (roughly monthly), run the new addresses through TRACR, screenshot the risk flags, post as a public service. End with: "Check your own exposure free at tracr.bizlegal-ai.com/analyze"
- **Why it converts:** Creates urgency tied to a real-world event. Founders are risk-averse. If their treasury received funds from a now-sanctioned address, they need to act now. $149 is nothing vs. a regulatory fine.

### Hook 3: "I analyzed 100 wallets flagged by exchanges. Here's the pattern."
- **Platform:** LinkedIn article + Twitter thread summary
- **Angle:** Data-driven insight post. Identify the top 5 flag patterns from TRACR's analysis (mixer usage, darknet market exposure, sanctioned entity hops). This establishes BRAI/TRACR as authoritative. CTA at the end: "Get your own forensic report — $149, 48-hour delivery."
- **Why it converts:** Compliance officers and fintech teams share data-driven content. It positions TRACR as expert infrastructure, not a random SaaS. Drives Persona C.

---

## 6 — ACTIVATION TRIGGERS (Regulatory Events Creating Urgency)

### Trigger 1: OFAC Crypto Enforcement Actions (Ongoing, ~monthly)
- OFAC has sanctioned Tornado Cash, Lazarus Group wallets, and Iranian exchange clusters in the last 24 months. Each action forces DeFi protocols and exchanges to immediately screen their transaction history.
- **How to exploit:** Monitor OFAC's SDN list RSS feed. Within 24 hours of each update, post analysis content (Hook 2 above). This is time-sensitive — the urgency is highest in the 72-hour window after an announcement.

### Trigger 2: FinCEN Travel Rule Expansion (US enforcement tightening in 2025-2026)
- FinCEN has expanded Travel Rule requirements to VASPs (Virtual Asset Service Providers). Any crypto business transmitting >$3K must now collect and transmit originator/beneficiary info. Non-compliance = regulatory action.
- **How to exploit:** BRAI's sanctions screening + compliance documentation is directly relevant. Post: "Is your crypto business Travel Rule compliant? BRAI checks 7 regulatory frameworks including FinCEN in 5 minutes." Target CCOs at crypto payment companies.

### Trigger 3: MiCA (EU Markets in Crypto-Assets Regulation) — Live Since 2024, enforcement ramping
- MiCA requires crypto asset service providers in the EU to implement robust AML/KYC and conduct ongoing wallet risk monitoring. Enforcement ramps in 2026.
- **How to exploit:** EU-based crypto companies (especially those in Germany, Netherlands, France) are actively looking for compliance tools. BRAI's regulatory risk scanner + TRACR's forensic reports are directly relevant to MiCA compliance documentation. LinkedIn targeting: "Compliance" + "Germany/Netherlands" + "Crypto."

---

## 7 — PAYMENT REALITY: Overcoming Crypto Friction

### The Problem
Only NOWPayments (crypto) works. Most B2B compliance buyers — compliance officers at fintech companies, DeFi founders — are crypto-native and have wallets. But many are using USDT on Ethereum, not BNB Chain. The current hardcoded `usdtbsc` (USDT on BNB Chain) means buyers must bridge assets or hold BNB Chain USDT specifically.

### Fix #1: Add Multiple Pay Currencies (1 hour of dev)
In `/api/scan/checkout`, replace hardcoded `pay_currency: 'usdtbsc'` with a currency selection dropdown on /scan. Offer:
- `usdtbsc` (USDT BNB Chain — current)
- `usdterc20` (USDT Ethereum — most common)
- `btc` (Bitcoin — universal)
- `eth` (Ethereum — tech-native buyers)

NOWPayments supports all of these. This alone will increase conversion by 30-40% because buyers don't need to bridge.

### Fix #2: "Invoice Me" Flow for Enterprise (Payoneer)
For buyers spending $300+ or enterprise inquiries:
- Add a "Request Invoice" button on /scan and /pricing pages that opens a Typeform with: company name, VAT/EIN, wallet address to analyze, preferred tier.
- Moses manually generates a Payoneer invoice within 24 hours.
- Buyer pays via bank transfer, credit card, or PayPal (through Payoneer's link).
- This covers Persona C entirely — compliance officers at companies won't pay with crypto from a personal wallet. They need an invoice for accounting.

### Fix #3: Messaging Reframe
Instead of saying "pay with crypto," say "secure, privacy-preserving payment via blockchain." This framing resonates with compliance-adjacent buyers because it avoids the association with speculative crypto trading.

### Fix #4: Trust Signals on Checkout
Add to the /scan page before checkout:
- "Payment processed by NOWPayments (licensed payment processor)"
- "Report delivered within 48 hours via email"
- "Accepted by major exchanges for AML compliance reviews"
This reduces checkout abandonment from crypto-hesitant buyers.

---

## 8 — 7-DAY SPRINT TO FIRST $1K

### Day 1 (Fix the plumbing — non-negotiable)
- Set `GOLDRUSH_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, `NEXT_PUBLIC_SITE_URL` on Vercel for TRACR.
- Redirect BRAI landing page '$49 Full Report' CTA from /network to /scan.
- Remove all PayPal mentions from TRACR /analyze and /report pages. Replace with "Pay with USDT or BTC."
- Verify TRACR /analyze shows real blockchain data for a test wallet address (use any public Ethereum address).
- Verify TRACR checkout → NOWPayments invoice creates successfully.
- Run one test payment through NOWPayments sandbox. Confirm webhook fires and /report/[id] renders.

**Day 1 exit gate:** TRACR full flow works end-to-end on a test purchase.

### Day 2 (Content seeding — 90 minutes)
- Write and post Reddit thread in r/CoinBase: "PSA: If your Coinbase account is frozen for AML review, here's exactly what compliance teams look for and how to generate a forensic report to submit." Helpful, not spammy. Include 1 link to TRACR /analyze at the end.
- Write Twitter thread: "OFAC added new wallet clusters last month. Here's how to check if your DeFi protocol is exposed." 5 tweets, last tweet links to TRACR /analyze.
- Send 5 LinkedIn DMs to CCOs/AML Analysts at crypto companies: "Built a blockchain forensic report service ($149/report). Would you try a free analysis on any wallet your team needs to screen?"

### Day 3 (Follow the threads — 60 minutes)
- Monitor Reddit for replies and DM anyone who engaged.
- Monitor Twitter mentions and reply to every comment.
- Post one BRAI-specific value post in r/ethdev: "How to check if your smart contract interacted with OFAC-sanctioned addresses (5-question decision tree)." Link to BRAI /decision-tree.
- Check TRACR analytics — how many /analyze page hits? Any email captures?

### Day 4 (Escalate the highest-signal channel)
- If Reddit produced page visits: post a second thread in r/binance with a slightly different angle ("Binance AML review: what they're actually checking").
- If LinkedIn DMs got replies: move to phone/video call. Close the first enterprise invoice.
- Post a sample redacted TRACR report (fabricated wallet, clearly labeled "SAMPLE") on Twitter as an image carousel. "This is what a $149 forensic report looks like. It's what exchanges need to unfreeze your account."

### Day 5 (Targeted outreach to high-pain Personas)
- Search Twitter for "account frozen" + "Binance" or "Coinbase" in the last 48 hours. DM 5-10 people with: "Saw your post — the exchange's compliance team wants a forensic wallet report. We generate them for $149, usually 48h turnaround. Here's the tool: [link]. Happy to answer questions."
- Search r/CoinBase and r/binance for "frozen" posts from last 7 days. Reply with the same helpful framing.
- Submit TRACR to ProductHunt, AlternativeTo under "blockchain analytics" and "AML compliance" categories (setup takes 30 min, drives long-tail traffic for 30+ days).

### Day 6 (Close the first paid customer)
- Review all leads from Days 2-5. Follow up with everyone who clicked the link or replied.
- If someone is on the fence: offer a "free preliminary scan" — run their wallet through TRACR /analyze, email them the 3 preview flags, explain what the full report adds. This closes hesitant buyers.
- Drop into 2 Telegram groups (DeFi Alliance, any crypto compliance group) with a value post: "Quick PSA — OFAC just updated their SDN list. Here's how to run a 5-minute check on your treasury wallets." Link to free BRAI decision-tree.

### Day 7 (Collect, review, double down)
- Tally: page visits, email captures, paid orders.
- If zero paid orders: the conversion sequence has a leak. Identify where — /analyze (no data = env keys missing), /scan (payment broken = env keys missing), or post-payment (no report = webhook broken).
- If 1-3 paid orders: you have proof of concept. Spend Day 7 writing an email to your captures: "You analyzed a wallet last week — here's what the full report adds and a 20% discount code for this week only."
- Target: $500-1,000 from 3-6 TRACR reports at $149 each.

---

## 9 — 30-DAY MILESTONES

### Week 1: First Paid Customer ($149-299)
**Actions:**
- All Vercel env keys set (Day 1)
- TRACR full flow verified (Day 1)
- 3 Reddit posts seeded (Days 2-4)
- First paying customer via Reddit or Twitter DM

**Success metric:** 1 paid order. Any order. This proves the payment pipeline works end-to-end.

### Week 2: $500 in Revenue
**Actions:**
- Scale the Reddit/Twitter channel that produced Week 1 order
- Post sample report as social proof
- First LinkedIn enterprise inquiry responded to
- 5-10 wallet analyses happening per day organically

**Revenue mix:** 3 TRACR Bronze ($449) + 1-2 BRAI scans ($29-58) = ~$500

### Week 3: $1,000 in Revenue
**Actions:**
- Content starting to get picked up and shared (especially the "how to unfreeze your account" post)
- First Payoneer enterprise invoice sent ($300-500 deposit)
- Product Hunt listing getting some traffic
- 2-3 referrals from Week 1-2 customers

**Revenue mix:** 4 TRACR Bronze ($596) + 1 TRACR Silver ($299) + 3 BRAI scans ($87) + 1 enterprise deposit ($300) = ~$1,282

### Week 4: $2,500 in Revenue → Path to $5K
**Actions:**
- Consistent 2-3 TRACR orders per week from compounding content
- Blog post published: "How to get your crypto account unfrozen: the $149 report that works" — submitted to Google, optimized for "exchange frozen AML report"
- 1 enterprise deal closed ($500-1,000)
- Email nurture sequence running to 50-100 captured emails
- First organic search traffic arriving from Reddit/LinkedIn posts indexed

**Revenue mix (Week 4 alone):**
8 TRACR Bronze ($1,192) + 2 TRACR Silver ($598) + 10 BRAI scans ($290) + 1 enterprise ($500) = $2,580

**Path from $2.5K to $5K (Month 2):**
- Content SEO starts delivering (ProductHunt, Reddit posts indexed)
- Email list of 100-200 people who ran free /analyze checks — these are warm leads
- 1-2 enterprise Payoneer deals/month at $500-1,000 each
- Partnership with 1-2 crypto law firms who refer clients needing forensic reports (revenue share)
- Total addressable: 20+ TRACR orders + 30+ BRAI scans + 2 enterprise deals = $5K+

---

## 10 — THE SINGLE MOST IMPORTANT INSIGHT

**The freemium hook is the entire business.** TRACR /analyze with real blockchain data is the product. It does what Chainalysis charges $15K/year for — for free, for 3 flags, then $149 for the full forensic report. This is the pitch. The entire acquisition strategy is "get people to run their wallet through /analyze." Everything else follows.

**If the Covalent/Etherscan API keys are not set, you have no product and no business.** Fix that first, before posting a single word on Reddit.

**The buyer is in acute pain.** Frozen accounts, regulatory exams, investor diligence — these create urgency that most SaaS products never achieve. $149 is a rounding error for someone with $10K frozen at an exchange. Position accordingly: not "buy our tool" but "submit the report that gets your funds released."

---

## 11 — QUICK REFERENCE: What to Do Right Now

1. Set 3 TRACR env vars on Vercel (15 min)
2. Fix BRAI landing page CTA redirect (5 min)
3. Remove PayPal mentions from TRACR (15 min)
4. Post one Reddit thread in r/CoinBase (30 min)
5. Send 5 LinkedIn DMs to CCOs at crypto companies (30 min)

Total time investment before first potential customer: 95 minutes.
