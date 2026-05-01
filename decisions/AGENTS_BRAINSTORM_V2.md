# AGENTS_BRAINSTORM_V2 — 7 emerging-2026 compliance pains where we can plug in

**Phase S — superseded only by V3 if/when these get scored against actual revenue.**

The 9 V1 agents covered the immediate pain space (PSP, DocAI SQA/DPA, BOI, Risk Engine, Compliance Monitor, LexAudit, Forge BOI Kit, Forge Passport, TRACR). V2 looks at regulatory deadlines hitting between now and end-2026 where the pain is sharp, the buyer is identified, and we already have most of the engineering primitives in place (Firecrawl scraper, Sonnet semantic diff, ops_events stream, HMAC inbound, Resend templates, Supabase migrations pattern).

---

## Scoring methodology (carried from V1)

Each agent gets four scores, 1-5:

- **Volume** — how many addressable buyers exist globally?
- **Pay** — average revenue per paying customer per year (or one-time AOV)?
- **Margin** — gross margin after Anthropic + Firecrawl + email + Vercel costs?
- **Defense** — how hard for a competitor to clone us in 60 days?

Total score is the sum. Anything ≥ 16 is a Q3 ship candidate.

---

## V2.1 — AI-Act Risk Classifier (`/agents/ai-act`)

**The pain:** EU AI Act becomes applicable for general-purpose AI obligations 2026-08-02. Every SaaS using AI must classify their system as minimal/limited/high/unacceptable risk. Misclassification = up to €35M or 7% of global turnover. Most B2B SaaS founders have no idea where their feature lands — Article 6 is a maze.

**The product:**
- $99 one-time classification report (assessment of which risk tier applies, citing Article 6 + Annex III)
- $49/mo monitoring (alerts when EU Commission updates Annex III — they will, frequently — and when the user's system description requires re-classification)

**Why we're already 80% there:**
- LexAudit Compliance Monitor pipeline (Q2) already does Firecrawl + Sonnet semantic diff on EU regulator pages — point it at the AI Act + Implementing Regulations
- DocAI's KB-aware drafter pattern works for the classification report — feed system description + Annex III + Article 6 into a Sonnet prompt with a strict output schema

**Differentiator vs ChatGPT-DIY:** we cite actual Article numbers + Implementing Regulations + Commission delegated acts. Our compliance pillar.

**Scores:** Volume **5** (every B2B SaaS using AI in the EU) · Pay **4** ($99 + $49/mo recurring) · Margin **4** (Sonnet costs ~$0.10/report) · Defense **3** (any compliance-tech firm could do this; first-mover + Firecrawl pipeline buys ~6 months) · **Total: 16 ✓**

**Q3 ship cost:** ~6 days. Fastest of the V2 set.

---

## V2.2 — MiCA Token-Launch Auditor (`/agents/mica-launch`)

**The pain:** MiCA fully applicable Dec 2024. CASPs already feel it; token *issuers* (white-paper requirements) are still scrambling. A non-compliant white paper = €5M+ fine and supervisor power to halt the offering.

**The product:**
- $999 one-time white-paper audit + AML/sanctions screening of the project's wallets + counterparty list
- Output: 25-30 page report scoring the white paper against MiCA Title II + III, flagging gaps, suggesting language fixes
- Includes a TRACR forensic scan of the project's known wallets (we already have this pipeline)

**High-AOV niche.** Each token launch is ~€2-10M raised, so $999 is rounding error for the issuer's legal budget. But each audit takes ~3-4 hours of human review on top of the AI-generated draft (Moses or external counsel sign-off), so this is not a fully automated product — it's an AI-assisted service.

**Why we're already 80% there:**
- BRAI / TRACR forensic scan = the wallet-screening half
- Firecrawl + Sonnet on MiCA + ESMA Q&A pages = the regulatory-side half
- DocAI document-comparison pattern = the white-paper-vs-regulation gap analysis

**Scores:** Volume **2** (~50-200 token launches/mo globally targeting EU) · Pay **5** ($999 AOV) · Margin **3** (human-review tax) · Defense **5** (high-difficulty product, requires regulatory expertise to maintain) · **Total: 15 ⚠**

Below the cut, but the highest single-deal AOV in the V2 set. Worth shipping if first-3 V2 agents land.

---

## V2.3 — DAO Wrapper-Entity Picker (`/agents/dao-wrapper`)

**The pain:** Every DAO faces the "where do we incorporate?" question and most pick wrong because the choice depends on jurisdiction-of-tokenholders, treasury composition, and proposed activities. Cayman foundation vs Wyoming DAO LLC vs Marshall Islands non-profit vs Liechtenstein foundation are all defensible answers depending on facts.

**The product:**
- $499 one-time decision report. Founder fills a 12-question intake; we generate a 15-page decision memo recommending the structure with citations to the relevant statutes + tax treaties + recent enforcement.
- SEO target: "where to incorporate a DAO 2026" (hard keyword, low CPC, high commercial intent — perfect organic target)

**Why we're already 80% there:**
- Jurisdictions/compare engine on hub already does multi-jurisdiction structured comparison
- Firecrawl scraper points at jurisdictional statute pages

**Scores:** Volume **2** (~100-500 DAO formations/mo globally) · Pay **4** ($499 AOV) · Margin **4** (mostly automated; statute scraper handles the heavy data-gathering) · Defense **3** (a16z legal team could clone this in 90 days but won't — wrong audience) · **Total: 13**

Below cut. Park as a Q4 candidate.

---

## V2.4 — Privacy Policy Auto-Refresh (`/agents/policy-refresh`)

**The pain:** GDPR + CCPA + CPRA + Quebec Law 25 + Colorado CPA + Connecticut DPA + Texas DPSA all keep amending their notice + opt-out + retention requirements. Most B2B SaaS privacy policies are 6-24 months stale. A stale policy is a regulatory finding — enforcement actions cite "policy did not reflect current data flows" verbatim.

**The product:**
- $29/mo: monthly redline of the customer's privacy policy against the 7 tracked frameworks
- Slack notification when a redline is ready
- One-click "accept and re-publish" via Vercel hook (for customers hosting policy on Vercel/Next/Cloudflare Pages)

**Why we're already 80% there:**
- Compliance Monitor (Q2) does the regulator-side scraping
- DocAI compare engine does the document redline against tracked language
- Resend integration already in place

**Scores:** Volume **5** (every B2B SaaS) · Pay **3** ($29/mo recurring) · Margin **5** (high-margin recurring; near-zero variable cost per customer per month) · Defense **3** (Termly / iubenda already exist but are static — our Sonnet semantic-diff is the moat) · **Total: 16 ✓**

**Q3 ship cost:** ~5 days. Cheapest V2 agent to ship; highest LTV per dollar of dev. Probably the next agent we should build after spear-product traffic stabilises.

---

## V2.5 — OFAC SDN Wallet Sweeper (`/agents/sdn-sweeper`)

**The pain:** OFAC adds ~5-30 wallet addresses to the SDN list per week. A single payment received from a SDN address can be a felony. BRAI's Sanctions Pro is one-time; this is the recurring-monitoring complement.

**The product:**
- $59/mo: scan customer's payment-receiving addresses against OFAC SDN delta every Mon/Wed/Fri
- Email + Telegram alert on any match (false-positive rate < 0.1% — exact-string match only, no fuzzy)
- API endpoint for fintechs to integrate into their own onboarding pipeline (we POST to their webhook on hits)

**Why we're already 80% there:**
- TRACR + BRAI use the OFAC SDN list already
- Worker pattern from `bizlegal-lead-intake` covers the cron + webhook side
- HMAC inbound pattern works for the API endpoint

**Scores:** Volume **3** (every fintech / payment-receiving SaaS) · Pay **3** ($59/mo) · Margin **5** (cron + diff = near-zero cost) · Defense **2** (Chainalysis Compliance does this but at $5K+/yr; we're cheaper but they have brand) · **Total: 13**

Below cut. Defensible only if BRAI Sanctions Pro has traction first — that's the customer pipeline.

---

## V2.6 — Stripe Connect Marketplace Compliance (`/agents/connect-comp`)

**The pain:** B2B marketplaces using Stripe Connect handle 1099-K tax filings + state money-transmitter exemptions + customer-due-diligence. The marketplace is the 1099-K issuer. Fail to file by Jan 31 → $310/missed-1099 + interest. Tens of thousands of marketplaces don't realise they're on the hook.

**The product:**
- $199/mo: tracks each connected account's annual GMV, generates 1099-Ks, monitors state-by-state money-transmitter triggers, and pings when the marketplace crosses a state's $5K/$10K/$20K threshold
- Tier 2 ($499/mo): also handles the customer-due-diligence (CDD) checks — each connected account's KYC + sanctions + adverse-media screening

**Why we're already 80% there:**
- BRAI Sanctions Pro = the sanctions piece
- The state-MT-tracker is a deterministic state-machine — easy to ship
- Stripe Connect API is well-documented; we just need the read-side integration

**Scores:** Volume **2** (US marketplaces using Connect — ~5-10K) · Pay **5** ($199-499/mo recurring) · Margin **4** (state-MT logic is one-time; sanctions piece costs scale with connected accounts) · Defense **4** (high regulatory complexity per state; competitor takes 6+ months to match) · **Total: 15 ⚠**

Below cut by 1 point but the **highest-AOV recurring product** in V2. Worth a closer look once V2.1 + V2.4 land.

---

## V2.7 — AI Hallucination Audit for legal teams (`/agents/legal-ai-audit`)

**The pain:** Lawyers using ChatGPT / Claude / Copilot to draft client-facing memos increasingly get sanctioned for citing fake cases. Mata v. Avianca is the canonical example but it keeps happening — minimum 12 reported sanctions in 2025.

**The product:**
- $99/mo per lawyer: paste any AI-drafted memo, we verify every citation against Westlaw/PACER + every statute against the actual statute book + every quote against the source
- Tier 2 ($249/mo): API integration — lawyer's IDE (e.g. NetDocuments, iManage) calls us before any AI output reaches the client

**Why we're already 80% there:**
- LexAudit's Safe layer (PII redaction) is the firm-tier infrastructure
- The citation-verification pattern is brain.py's numeric-claim verifier (Hetzner curator pattern) reused
- Anthropic API + Westlaw API integrations are the unique pieces

**Scores:** Volume **4** (~1.3M US lawyers) · Pay **4** ($99/mo) · Margin **4** (Westlaw API per-call = main cost; defensible at $99 if call rate is bounded) · Defense **3** (LexisNexis / Thomson Reuters could ship this in 90 days but their incentive is to push their own AI) · **Total: 15 ⚠**

Below cut. Compelling story but the API access pattern (Westlaw is expensive, PACER has a quota) makes margin uncertain. Park.

---

## Summary table

| ID | Agent | Vol | Pay | Margin | Defense | Total | Q3 ship? |
|----|-------|-----|-----|--------|---------|-------|----------|
| V2.1 | AI-Act Risk Classifier | 5 | 4 | 4 | 3 | **16** | **✓** |
| V2.4 | Privacy Policy Auto-Refresh | 5 | 3 | 5 | 3 | **16** | **✓** |
| V2.2 | MiCA Token-Launch Auditor | 2 | 5 | 3 | 5 | 15 | ⚠ if cap |
| V2.6 | Stripe Connect Marketplace | 2 | 5 | 4 | 4 | 15 | ⚠ |
| V2.7 | Lawyer AI Hallucination Audit | 4 | 4 | 4 | 3 | 15 | ⚠ |
| V2.3 | DAO Wrapper Picker | 2 | 4 | 4 | 3 | 13 | park |
| V2.5 | OFAC SDN Wallet Sweeper | 3 | 3 | 5 | 2 | 13 | park |

**Recommendation: ship V2.1 + V2.4 in Q3.** Both clear the 16-point bar and reuse 80%+ of the infrastructure we built in O+P+Q. Combined ship cost ~11 days. Combined revenue ceiling at year 1: ~$15K MRR if penetration matches V1 spear products.

V2.2 and V2.6 are the high-AOV runners-up — revisit when V2.1/V2.4 prove out (or drop) the AI-Act + privacy-policy market, since the marketing learnings transfer directly.

---

## What this brainstorm is NOT

- A roadmap commitment. These are scored options. The actual decision waits until first paying customer + first 30 days of organic traffic data tell us what the audience is willing to pay for.
- An exhaustive list. The 2026 regulatory landscape will surface 2-3 more sharp pains by end of Q3 (DORA fining cycles, MiCA Phase 2, US BOI evolution). Re-run this exercise quarterly.
- An exclusion list. Anything not here can still be considered if it fits the 80%-already-built rule.
