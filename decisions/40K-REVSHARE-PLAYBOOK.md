# BizLegal AI — $40K Custom Build Playbook

**Model:** $40K upfront + $30K/yr SaaS + optional $20K capped success fee  
**Roasted:** 2026-07-03 (Hermes council verdict: RESHAPE → adopted)  
**Owner:** Moses Dor

---

## THE OFFER (revised after roast)

Drop the 20% rev share. It fails procurement at every Series B+ with real legal counsel.

**Pricing:**
- $40K — custom build fee (white-labeled compliance AI tailored to their regulatory environment)
- $30K/yr — SaaS maintenance + framework updates + Hetzner pipeline runs
- $20K success fee (optional, capped, tied to one pre-agreed auditable outcome) — e.g. "SOC 2 Type II gap closed within 90 days"

**One-line pitch:**
> "You're losing enterprise deals because of missing compliance evidence. I build the AI system that generates it — in 6 weeks, at a fixed price, with a security packet your CISO can approve."

---

## WHAT YOU'RE SELLING

A private-labeled instance of the BizLegal AI stack, trained on the client's specific regulatory exposure:

| Layer | What it does | Your existing tool |
|---|---|---|
| Contract risk scan | Flags risk clauses in vendor contracts + MSAs in real-time | DocAI |
| Compliance health score | Continuous 60-signal score against their frameworks | LexAudit |
| Regulatory change alerts | Firecrawl + Sonnet diff on the regulations they're subject to | LexAudit monitor |
| Risk intelligence dashboard | Their logo, their frameworks, their data | hub + Supabase |
| Blockchain / wallet exposure (optional) | Travel Rule + AML monitoring if they handle crypto | BRAI |

**Your COGS per client:**
- 80–120 hours your time for integration + white-labeling
- API costs: ~$300–500/mo (Firecrawl + Anthropic + Supabase)
- Security packet build (one-time, reusable): ~40 hours

**Margin:** ~70–80% after year 1.

---

## THE BUYER (who to target)

**DO NOT target:** VP of Compliance, Head of Legal, Chief Compliance Officer.  
These are gatekeepers who carry personal regulatory liability. Cost-cut pitches ask them to fire themselves. They will block the deal.

**DO target:** CFO, COO, VP of Operations — whoever has the cost-cut mandate or the "close more enterprise deals" mandate.

**The trigger:** Enterprise sales blocked by missing compliance evidence. 68% of fintech CIOs rank security as the top vendor evaluation criterion (Capgemini 2024). The CFO cares because every blocked enterprise deal has a dollar value attached.

**Qualification signals (headhunter can look for these):**
- Series B+ fintech with 50–500 employees
- Recently hired a VP Compliance or Chief Compliance Officer (=they know they have a gap)
- Job postings for "SOC 2", "GDPR compliance", "AML analyst" (=they're trying to hire their way out of a problem you can automate)
- Lost a deal in the last 90 days citing compliance (LinkedIn/Glassdoor sometimes surfaces this)
- Active in regulation-heavy verticals: crypto, payments, cross-border remittance, insurance, healthcare SaaS

---

## BUILD THE SECURITY PACKET FIRST

This is the actual $30K of build cost, not the white-labeling. Without it, the deal dies in week 7 of the CISO's review. Build it once, reuse for every client.

**Security packet checklist:**
- [ ] SOC 2 Type I attestation (or in-progress letter) — start with Vanta or Drata at ~$7K/yr
- [ ] SIG Lite questionnaire pre-filled (covers 80% of CISO security questions)
- [ ] MSA template (vetted by Israeli counsel, English law, NDA included)
- [ ] DPA template (GDPR Article 28 compliant, covers EU data subjects)
- [ ] Penetration test summary (can use a $2K automated Burp Suite scan for v1)
- [ ] Business continuity plan (1-page, covers Hetzner failover)
- [ ] Subprocessor list (Anthropic, Supabase, Vercel, Firecrawl — all have their own DPAs)

**Priority:** Get the SIG Lite pre-filled and the DPA drafted first. These block 90% of deals.

---

## GTM TIMELINE (30/60/90 days)

### Week 1–2: Foundation
- [ ] Build SIG Lite questionnaire (or hire a compliance consultant for 8 hours ~$800)
- [ ] Draft MSA + DPA templates (use Clerky or a template service)
- [ ] Create 1-page offer PDF: fixed price, success fee optional, security packet ready
- [ ] Identify 5–10 warm intro sources (current BizLegal customers, OCI deal-router partners, LinkedIn connections at target companies)

### Week 3–4: Outreach
- [ ] Send warm intro requests to 5–10 connectors — "I'm looking for introductions to CFOs/COOs at Series B fintechs dealing with compliance gaps. Here's the one-pager."
- [ ] Run headhunter_agent against 200+ target companies (buying signals: job posts, LinkedIn activity, G2 reviews mentioning compliance)
- [ ] Schedule 2–3 discovery calls

### Week 5–8: Discovery + Proposal
- [ ] Discovery call: "What enterprise deals have you lost in the last 90 days due to compliance issues? What's the ARR value of those deals?"
- [ ] Live demo: run their publicly available ToS / privacy policy through DocAI during the call
- [ ] Tailored proposal: specific frameworks (their regulatory environment), specific outcomes (your SOC 2 gap list, their GDPR Article 28 audit, their AML controls)
- [ ] Submit MSA + DPA pre-signed (reduces their legal cycle from 6 weeks to 2)

### Week 9–12: Close
- [ ] Security review (CISO review SIG Lite — already pre-filled, 2.4x faster close)
- [ ] Procurement sign-off
- [ ] First payment: $40K
- [ ] Build kickoff

### Week 13–18: Build + Handover
- [ ] White-label LexAudit + DocAI instance
- [ ] Train on their frameworks
- [ ] Deploy to their domain / Vercel
- [ ] 90-day hypercare SLA at $30K/yr

---

## EMAIL TEMPLATES (warm intro channel)

### Template A — to the connector (warm intro request)
Subject: Quick intro request — compliance AI for fintechs

Hi [Name],

I'm commercializing the compliance AI I built for BizLegal — specifically the contract risk scan + regulatory monitoring stack. Looking to land 2–3 enterprise clients (Series B+ fintechs) in Q3.

The offer: $40K custom build + $30K/yr. Security packet (SOC 2 Type I, SIG Lite, MSA/DPA) is pre-built so CISO reviews move fast.

Do you know any CFOs or COOs at fintechs who've lost enterprise deals over compliance gaps in the last 6 months? Happy to send a one-pager.

Moses

---

### Template B — to the CFO/COO (after intro)
Subject: [Intro from X] — closing compliance gaps that are blocking enterprise deals

Hi [Name],

[X] mentioned you're dealing with [compliance challenge].

I built a compliance AI system for B2B fintechs — continuous SOC 2/GDPR/AML monitoring, contract risk scanning, and a compliance health score your team can show enterprise buyers.

$40K to build and integrate it for your stack, $30K/yr to maintain. SOC 2 Type I, SIG Lite pre-filled, MSA and DPA ready to redline — so your CISO review doesn't eat 3 months.

Would a 15-minute demo make sense? I can run your current vendor contracts through the scanner live.

Moses

---

## COMPARABLE DEALS (what the market pays)

| Company | Product | Price |
|---|---|---|
| Vanta | SOC 2 + GDPR monitoring SaaS | $15K–$80K/yr |
| Secureframe | Compliance automation | $20K–$60K/yr |
| LogicGate | GRC platform | $30K–$150K/yr |
| Harvey | Legal AI (custom build) | $100K–$500K/yr |
| Chainalysis | Blockchain compliance (AML) | $50K–$200K/yr |

**Position:** BizLegal is Harvey meets Vanta, at $40K + $30K/yr. Cheaper than Harvey, deeper than Vanta. That's the wedge.

---

## PIPELINE TARGET

Cold email: <2% reply rate. Need 2,000 cold contacts for 1 close.  
Warm intro: 15–25% reply rate. Need 5–10 warm intros for 1 close.

**Do not burn time on cold Apollo at 20 contacts. Build the warm intro funnel first.**

---

## AUTOMATION (what THE MACHINE already covers)

- **headhunter_agent** (04:30 UTC) — buying signal detection, job posting monitoring, LinkedIn activity signals at target accounts
- **enrichment_agent** (02:00, 14:00 UTC) — 360-degree profile of target companies + decision-makers
- **lead_capture_agent** (webhook) — inbound form submission → qualified lead
- **monetization_agent** (*/15 min) — hot lead scoring → deal room → DocAI funnel

Point these at the 200-company ICP list from headhunter, not the cold Apollo pool.

---

## 3-CLIENT BREAKEVEN

| Clients | Year 1 Revenue | Year 2+ ARR |
|---|---|---|
| 1 | $40K + $30K = $70K | $30K |
| 3 | $120K + $90K = $210K | $90K |
| 5 | $200K + $150K = $350K | $150K |

**At 3 clients:** "Compliance AI used by Series B+ fintechs handling regulated transactions" — this sentence repositions BizLegal from indie SaaS to regulatory AI infrastructure. Comparable exit comps: Chainalysis ($8.6B), Harvey (rumored $1B+).

**Timeline to first close at correct funnel:** 12–16 weeks.

---

## DEFINITION OF DONE

- [ ] Security packet built (SIG Lite + DPA + MSA)
- [ ] 1-page offer PDF finalized
- [ ] 5 warm intros sent
- [ ] 2 discovery calls booked
- [ ] First proposal sent
- [ ] First $40K received
