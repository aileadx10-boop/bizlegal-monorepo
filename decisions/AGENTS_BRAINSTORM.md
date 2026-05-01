# Agents Brainstorm — New Pains + Cures (2026-04-28, updated 2026-04-29)

**Author:** Claude (Phase J of the autonomous plan)
**Audience:** Moses (decide which 3 to ship next quarter)
**Methodology:** Pain-first — each candidate is a real pain a real customer pays a lawyer ≥$500/hr to solve today. The agent has to be at least 70% as good for ~$30-100/mo.

## Status update (2026-04-29) — Phase L wave shipped

Of the original 9 candidates, **4 are now live**:

| # | Candidate | Status | PRs |
|---|-----------|--------|-----|
| 1 | CTA-2024 BOI Amendment Tracker | ✅ Live at `/agents/boi-tracker` | bizlegal-ai#32 |
| 2 | Token Howey-Test Classifier (deeper) | ⏳ Deferred (existing Howey Helper at $29/mo covers v1) | — |
| 3 | MAS Family-Office FFR Readiness | ⏳ Deferred (low-volume, defer) | — |
| 4 | DAC8 EU Crypto-Asset Reporting | ⏳ Deferred (post-MoR) | — |
| 5 | DPA Negotiator | ✅ Live at `docai.bizlegal-ai.com/dpa` | docai-monorepo#5 |
| 6 | Data-Residency Picker | ⏳ Deferred (low margin) | — |
| 7 | PSP/MoR AUP Audit | ✅ Live at `/psp-risk` (combined with #8 below) | bizlegal-ai#34 |
| 8 | Sanctions Pro (deeper) | ⏳ BRAI Extended Sanctions tier already covers ($500) | — |
| 9 | NIS2 Critical-Infra Readiness | ⏳ Deferred until EU traction | — |

Plus **2 candidates added by Moses on 2026-04-29 — both shipped**:

| Candidate | Status | PRs |
|-----------|--------|-----|
| Compliance Monitor / Reg Change Radar | ✅ Live at `/compliance-monitor` ($99/mo) + `/agents/compliance-monitor-pro` | lexaudit#5, bizlegal-ai#35, bizlegal-ai#36 |
| Payment Freeze Recovery (combined w/ PSP AUP audit per Moses) | ✅ Live at `/psp-risk` (Recovery mode tab) | bizlegal-ai#34 |

**Net result:** /agents page went from 6 → 10 agents. Recurring MRR ceiling expanded by ~$3-5K/mo at modest adoption.

---

The hub already runs **6 agents** at $29-49/mo:
1. Risk Sentinel — wallet-scan triage
2. Compliance Daily — regulator update digest
3. Token Howey Helper — securities classification
4. Sanctions Watchdog — OFAC/UN/EU screening
5. GDPR Pulse — breach-timer + DPA audits
6. Hub Pro Co-pilot — Q&A across hub knowledge

Each one ships through the hub `/agents/[slug]` page with `AgentCheckoutButton` (PR #28).

The 9 candidates below are scored on three dimensions:

- **Volume** = monthly addressable buyers (US+EU+APAC)
- **Pay** = realistic willingness-to-pay
- **Margin** = LLM cost vs. retail price
- **Defense** = how hard for an OSS agent to commoditise it

---

## 1. CTA-2024 BOI Amendment Tracker

**The pain:** US Corporate Transparency Act BOI rule changed mid-2024 (treasury rolled back enforcement, then partially restored). Every US LLC owner who filed once now has to know whether they need to refile when ownership/address changes — and the deadline is 30 days.

**The agent:** Daily watcher on FinCEN BOI guidance; user adds their entity registration date; agent emails (a) deadline reminders, (b) any amendment to the rule that affects them, (c) refile check-list.

**Pricing:** $29/mo (single entity) · $99/mo (firm tier, up to 50 entities)
**Volume:** 32M US LLCs filed under CTA
**Pay:** very high — non-filing fine is $500/day capped at $10K
**Margin:** very high (rule-pull is cron'd; LLM inference once per rule-change event)
**Defense:** medium — public data, but the workflow + email cadence is the moat
**Hub surface:** `/agents/cta-boi-tracker`
**Funnel hook:** Forge BOI Kit one-time customers → free 30-day BOI tracker → $29/mo conversion

**3-step daily workflow:**
1. Fetch FinCEN BOI rules digest from federalregister.gov + treasury.gov RSS
2. For each subscriber: check if their entity record has any due-date in the next 30 days
3. If yes → email reminder; if rule change affects their entity type → email summary

---

## 2. Token Howey-Test Classifier (deeper than current Howey Helper)

**The pain:** Current Howey Helper is a Q&A. Real founders need a **report**: "Here's why this token is/isn't a security under Howey, with citations to *SEC v. W.J. Howey Co.* + 8 enforcement actions in the last 24 months." Lawyers charge $5K-15K for this analysis; founders need it before launching.

**The agent:** Structured report generator. Pulls token whitepaper + tokenomics; runs through the 4-prong Howey test; cites recent SEC actions (Coinbase v Coin, Ripple, Terraform, Telegram); outputs PDF with red/amber/green per prong.

**Pricing:** $149 one-time / $299/mo unlimited (firm tier)
**Volume:** ~3K-5K new tokens launching/year that need this analysis
**Pay:** very high — alternative is a lawyer at $500/hr × 10h
**Margin:** high (Sonnet 4.6 + 8 cited cases is ~$1-2 of LLM)
**Defense:** medium — moat is the curated SEC enforcement corpus
**Hub surface:** `/agents/howey-classifier-pro`
**Funnel hook:** Risk Engine token-classifier free → upsell to full Howey Pro

**3-step daily workflow** (this is one-shot, not daily):
1. User pastes whitepaper + tokenomics + go-to-market description
2. Agent retrieves top 8 cited SEC enforcement actions matching pattern (vector search over a curated SEC corpus)
3. Sonnet 4.6 produces a 4-prong analysis with citations → PDF output

---

## 3. MAS Family-Office FFR Readiness

**The pain:** Singapore MAS tightened family-office rules in 2023 (S13O / S13U schemes). Family offices migrating from HK + UAE need to evidence local employment, AUM thresholds, and local economic substance. Existing legal advice runs $30K-80K per filing.

**The agent:** FFR readiness scorecard. Uploads of corporate structure, AUM, headcount → matches to MAS S13O/S13U requirements → outputs gap analysis + remediation roadmap.

**Pricing:** $499 one-time scorecard / $1499/mo retainer
**Volume:** ~150-300 SG family-office migrations/year
**Pay:** very high — alternative is Allen & Gledhill at $30K
**Margin:** high
**Defense:** high — needs a curated MAS corpus + boutique-firm analyst review (Verified Intelligence Network)
**Hub surface:** `/agents/mas-family-office`
**Funnel hook:** OCI realestate router → SG buyers → MAS family-office check

**3-step workflow:**
1. User uploads corporate structure JSON + AUM evidence
2. Agent matches against MAS S13O/S13U/13X requirements
3. Outputs scorecard + recommended next steps

---

## 4. DAC8 EU Crypto-Asset Reporting Auto-Filer

**The pain:** EU's DAC8 (Directive on Administrative Cooperation, 8th amendment) requires crypto service providers + DAOs to report user transactions to local tax authorities starting 2026. Most DAOs/exchanges have NO infrastructure for this. Penalty is €10K per missed filing.

**The agent:** DAC8 readiness audit + auto-filing template. Maps user's transaction-volume metadata to the DAC8 schema; outputs filing-ready XML for each EU member state.

**Pricing:** $299/mo (audit + template) / $999/mo (full filer)
**Volume:** ~2K-4K EU-active crypto operators
**Pay:** high — €10K/missed filing is real
**Margin:** medium (XML transformation is cheap, but the legal framing is heavy)
**Defense:** high — DAC8 schema is fiddly; the moat is the engine + maintained spec
**Hub surface:** `/agents/dac8-filer`
**Funnel hook:** Risk Engine EU-resident wallet flag → DAC8 audit upsell

---

## 5. DPA Negotiation Agent for B2B SaaS

**The pain:** Every B2B SaaS sale to a regulated buyer (banking, healthcare, public sector) needs a DPA negotiation. Junior counsel charges $300-500/hr and a single deal can take 5-15 hours. Sales teams hate it; deals stall in legal.

**The agent:** Upload your standard DPA + the customer's redline → agent produces a 3-column comparison (your stance / customer ask / suggested compromise). For each suggested compromise it cites why (GDPR Article X, customer's industry baseline).

**Pricing:** $69/mo (Team tier) / $499 one-time per deal
**Volume:** ~50K B2B SaaS founders worldwide doing > $1M ARR; each does 5-20 DPAs/year
**Pay:** medium — alternative is $300-500/hr lawyer × 5-15 hours
**Margin:** very high
**Defense:** medium — DPA library + the GDPR/HIPAA/SOC 2 cross-reference is the moat
**Hub surface:** `/agents/dpa-negotiator` — also surface inside DocAI Team tier
**Funnel hook:** DocAI SQA paying customers → DPA upsell (same audience)

**3-step workflow:**
1. User uploads their DPA + customer's redline
2. Agent diffs and classifies each delta (procedural / liability / sub-processor / data residency)
3. Outputs per-clause compromise suggestion with regulatory citation

---

## 6. Data-Residency Picker for AI Products

**The pain:** AI startups storing embeddings, training data, or user prompts hit cross-border regs they don't realise apply: GDPR Article 44 transfers, China PIPL, India DPDPA, UAE PDPL, Singapore PDPA. Each has different consent + transfer rules. Founders pick "us-east-1" by default and accidentally violate 3 jurisdictions.

**The agent:** User answers 8 questions about user base + data types → agent outputs a regional-deployment recommendation matrix (vector DB region, training data region, prompt logging region) with regulatory rationale.

**Pricing:** $49 one-time / $199/mo (for active multi-region builds)
**Volume:** ~20K AI startups raising seed-Series A
**Pay:** medium-high — non-compliance fines are real, plus enterprise customers won't sign without it
**Margin:** very high
**Defense:** medium — corpus of jurisdictional rules is the moat
**Hub surface:** `/agents/ai-data-residency`
**Funnel hook:** New from-scratch (no existing audience), but pairs with DocAI's SOC 2 SQA — same buyer

---

## 7. PayPal/Stripe Acceptable-Use Audit (eat-our-own-dogfood)

**The pain:** Moses's own pain — applying for Stripe / PayPal Live for a multi-product compliance SaaS is brutal. Most applications get rejected because the business model "looks like" a high-risk MoR, even when it isn't. Founders waste 4-6 weeks on rejections + appeals.

**The agent:** Pre-flight MoR/PSP application audit. User describes business model + revenue mix → agent flags every clause in PayPal/Stripe AUP that this business will trigger + suggests workarounds (e.g., "split entity into MoR + non-MoR co", "rename product surface", "add specific disclosure").

**Pricing:** $299 one-time / $999 firm pack (multiple application audits)
**Volume:** ~10K founders/year applying to PayPal Live or Stripe Atlas + getting rejected
**Pay:** high — alternative is hiring an MoR consultant at $5K-15K
**Margin:** very high
**Defense:** very high — based on real rejection patterns Moses has seen this year
**Hub surface:** `/agents/psp-aup-audit`
**Funnel hook:** Forge BOI Kit → US LLC → PSP application → AUP audit upsell

---

## 8. Sanctions Screening Pro (deeper than current Sanctions Watchdog)

**The pain:** Current Sanctions Watchdog is a wallet/entity name match. What enterprise really needs: layered screening across **OFAC SDN + UN consolidated + EU restrictive + UK HMT + Canada AMP + Australia DFAT + UAE Local + SG MAS** + cross-chain wallet clustering + UBO trace.

**The agent:** Same input, deeper screen. Outputs a notarised PDF showing every list checked with timestamp + match logic. Suitable for audit committees + board minutes.

**Pricing:** $500/scan one-time / $2K-5K/mo retainer (Extended Sanctions tier on BRAI)
**Volume:** ~5K corporates needing this monthly (treasury + listings + OTC desks)
**Pay:** very high
**Margin:** high — list ingestion is cron'd, the per-scan cost is small
**Defense:** high — the moat is the kept-fresh sanctions corpus
**Hub surface:** Already partially exists as BRAI Extended Sanctions ($500 tier) — agent variant for hub Pro subscribers
**Funnel hook:** TRACR wallet scan flagging high-risk → upsell to Sanctions Pro report

---

## 9. NIS2 Critical-Infrastructure Readiness (EU)

**The pain:** EU NIS2 Directive (Network & Information Security 2) transposed Oct 2024. Affects ~160K EU-based entities + non-EU SaaS providers serving EU critical sectors. Compliance deadline was tight; many SaaS providers are still scrambling. Penalty: up to €10M or 2% of global turnover.

**The agent:** NIS2 readiness scorecard against the 10 mandatory measures (Article 21). Identifies gaps + outputs a remediation roadmap with cited articles.

**Pricing:** $499 one-time / $1499/mo retainer
**Volume:** ~10K-15K SaaS providers caught off-guard
**Pay:** very high (€10M / 2% turnover penalty)
**Margin:** medium-high
**Defense:** high — corpus of NIS2 + per-member-state implementation
**Hub surface:** `/agents/nis2-readiness`
**Funnel hook:** GDPR Pulse subscribers → cross-sell NIS2

---

## Recommended top 3 to ship next

Decision criteria: highest revenue probability × lowest engineering lift × clearest funnel hook.

### #1 — DPA Negotiation Agent

**Why first:** Every existing DocAI SQA customer also negotiates DPAs. We've already built the SQA delivery infrastructure (Sonnet 4.6 + RAG + payment ledger); a DPA agent is essentially the same engine with a different KB. Engineering lift: ~3-5 days. Revenue lift: doubles DocAI Team-tier ARPU.

**Engineering plan:**
- Reuse `web/lib/sqa/` engine; swap KB to a DPA-clause corpus (~200 standard clauses from GDPR + CCPA + HIPAA baselines)
- New route `/api/dpa/negotiate` accepts your-DPA + customer-redline → returns column comparison
- Surface inside DocAI Team tier as included; sell standalone at $499/deal
- Mark up DocAI Team tier from $69/mo to $89/mo on next pricing review

### #2 — PayPal/Stripe Acceptable-Use Audit

**Why second:** Moses has 6 months of empirical rejection patterns. Nobody else has this corpus. The pain is sharp, the buyer is concentrated (founders + their counsel), and the cure is genuinely defensible. Engineering lift: ~4-6 days. Revenue lift: ~$5K-15K/mo within Q3.

**Engineering plan:**
- Build a curated KB from real rejection emails + public AUP texts of PayPal/Stripe/Square/Mercury
- Sonnet 4.6 prompt: "given this business description, surface every AUP clause that will trigger, and explain why"
- Output: structured PDF with red-flagged clauses + suggested rewrites
- Leverage existing payment + Resend delivery
- Surface in Forge funnel: BOI Kit → "now apply for Stripe? get the AUP audit first"

### #3 — CTA-2024 BOI Amendment Tracker

**Why third:** Subscription-shaped (monthly recurring vs one-shot), high volume (32M US LLCs), low engineering cost (it's basically a curated cron + email cadence). Already a perfect upsell path from Forge BOI Kit. Engineering lift: ~2-3 days.

**Engineering plan:**
- Cron job pulls FinCEN BOI guidance daily (`federalregister.gov` RSS + Treasury Press)
- For each subscribed entity: check (a) due dates in next 30 days, (b) any rule change matching their entity-type
- Resend templated email
- Reuse hub `payment_orders` ledger for $29/mo subscription
- Surface in Forge BOI Kit purchase flow: "Add the tracker $29/mo, never miss an amendment"

---

## What this enables in the Master Funnel (Phase K)

These three new agents add **3 new revenue surfaces** without changing the 6-product fleet:
- Solo founder $29/mo CTA tracker (low-CAC subscription)
- Mid-deal $499 DPA negotiation (transactional, follows DocAI Team)
- One-shot $299 PSP audit (high-margin, follows Forge BOI Kit)

Combined potential: **$30K-80K/quarter** at modest adoption rates without expanding ad spend.

---

## Files touched

None — this is a planning artifact. Implementation lands as separate PRs once Moses picks a sequence.

## Status

- 9 candidates surfaced
- Top 3 recommended with engineering plans
- Awaiting Moses's pick of sequence + go/no-go per item
