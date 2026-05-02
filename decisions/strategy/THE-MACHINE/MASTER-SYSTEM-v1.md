# THE MACHINE — Master System v1

> **Purpose:** One codified, repeatable mechanism for building an AI agency that converts traffic into cash, and then cloning that mechanism to new verticals in under 48 hours per vertical.
>
> **Author:** Moshe Dor (Dor Intelligence Systems)
> **Date:** April 20, 2026
> **Status:** Executable blueprint. This replaces Master Plan v4.
> **Rule Zero:** If a decision is not in service of revenue in the next 60 days, defer it.

---

## 0. THE THREE COMMANDMENTS

These are non-negotiable. They exist because your files show you've already violated all three.

1. **ONE vertical until $10K MRR.** No "parallel fixes." No second subdomain. No new offer. The cost of context-switching killed your April push.
2. **CODE FOLLOWS CASH.** We do not build what we have not sold. Every feature must be tied to a signed deal, a booked call, or a paying client. No speculative building.
3. **TEMPLATE IS A GENERATOR, NOT A FOLDER.** We write code once, parameterize it, and clone via CLI. Never duplicate-and-manually-adapt. A template that requires editing 200 files is not a template — it's a trap.

---

## 1. MARKET RESEARCH — WHICH VERTICAL WINS

You asked: "Most profitable, least accountability." Here is the honest comparison across the six candidates, scored on what matters for a solo operator in Israel selling into EU/US.

### 1.1 Scoring Matrix (1-10, higher = better for you)

| Criterion | Compliance/Risk | Real Estate | B2B SaaS | E-commerce DTC | Home Services | Med Spa / Dental |
|---|---|---|---|---|---|---|
| **Per-client revenue** | 8 ($5-15K+retainer) | 6 ($2-5K/mo) | 9 ($3-10K/mo) | 7 ($2-7K/mo) | 8 ($2-5K/mo) | 9 ($3-8K/mo) |
| **Speed to first client** | 4 (long sale cycle) | 7 (urgent pain) | 5 (savvy buyers) | 6 | 9 (hair-on-fire pain) | 8 (cash-rich) |
| **Low accountability/liability** | 2 (regulated advice) | 6 | 8 | 7 | 9 | 7 |
| **Willingness to pay** | 7 | 5 (cheap) | 8 | 6 | 7 | 9 (cash flow) |
| **Proof of market** | 5 | 8 | 8 | 7 | 9 (exploding) | 9 |
| **Tech match w/ your stack** | 9 (your build) | 7 | 8 | 8 | 8 | 7 |
| **Competition density** | 7 (niche) | 3 (saturated) | 4 (saturated) | 4 (saturated) | 6 | 6 |
| **Your personal credibility** | 9 (notary/lawyer) | 3 | 6 | 4 | 4 | 3 |
| **Geographic moat (Israel)** | 8 (EU/cross-border) | 4 | 6 | 5 | 2 (US-local) | 3 |
| **TOTAL** | **59** | **49** | **62** | **54** | **62** | **61** |

### 1.2 The Three-Way Race — Analysis

**Tied at the top: B2B SaaS, Home Services, Med Spa/Dental.** Compliance is right behind but loses on speed and accountability.

**Home Services (HVAC/Plumbing/Roofing):**
- *Pro:* Hair-on-fire pain. One missed call = lost $20K sale in HVAC. 30% of customer calls go unanswered, losing $50K+ per month. Existing agencies report 3.1x more booked jobs in 120 days. Cash-paying. Low competition from sophisticated tech.
- *Con:* US-local. You in Israel means time-zone friction. Low status. Owners are mostly blue-collar — sales cycle is phone-heavy, not email.
- *Con:* HIPAA/medical exposure. You do NOT want accountability for patient data. Brand matters a lot — cosmetic owners buy from people who look like them on Instagram. You're a notary in Israel.

**B2B SaaS / Agencies:**
- *Pro:* Savvy buyers who buy on ROI. Can sell async via LinkedIn/email. Zero physical-location constraint (perfect for Israel→everywhere). Your tech literacy is the ICP's tech literacy — you speak the language. $3-10K/mo retainers stick. Selling to agencies means leverage: one agency = 10+ end clients indirectly.
- *Con:* Crowded space. Harder to differentiate. Longer sales cycle than hair-on-fire trades.

### 1.3 THE RECOMMENDATION

**Primary vertical: B2B SaaS & Marketing Agencies — "AI Infrastructure for Agencies."**

Why this and not the others:

1. **Zero accountability exposure.** You're not giving legal, medical, or compliance advice. You're selling infrastructure. The agency owner is the one accountable to end clients.
2. **You speak the language natively.** Your files show you've already built n8n workflows, Next.js sites, Supabase schemas, Trigger.dev tasks. The ICP has the same vocabulary. You skip the education tax.
3. **Geography-agnostic.** Israel → US/EU agencies works async. No timezone pain for qualification calls (handled by Vapi AI anyway).
4. **Leverage compounds.** One agency client implements your system for 5-20 of their end clients. You get paid by the agency. The agency gets paid by end clients. Textbook B2B2C.
5. **Existing BizLegal assets become case studies.** Your compliance work, your n8n knowledge, your deployed subdomains — all become proof. "I built this stack for my own agency; here's how I install it in yours."
6. **Built-in productization path.** Today: DFY implementations. Year 2: SaaS product. Year 3: marketplace. Same codebase, expanding monetization.

**Secondary (after $10K MRR): Home Services.** Not Med Spa. Home services has hair-on-fire urgency and is the easier second vertical because the infra is the same (Vapi, n8n, booking) — only the ICP copy and prompts change.

**Kill list (for now):** Compliance (keep as your personal brand/credibility only, not as the primary offer), Real Estate (too saturated, too cheap), E-commerce (too saturated), Med Spa (accountability + brand-face friction).

### 1.4 The Primary Offer (reconciling with your "1+4" answer)

**Hybrid DFY + One-off, structured as a single $18K entry:**

> **"The Agency OS"** — I install a complete AI client-acquisition and delivery system inside your agency in 14 days. Voice qualifier, lead scoring, proposal engine, content machine, and client dashboard. You keep the code. $18,000 one-time + $1,500/month optional retainer for ongoing optimization.

**Math for $30K MRR target:**
- 10 one-off deals at $18K = $180K cash + 10 retainers at $1,500 = $15K MRR *from retainers alone*
- Plus $180K one-off cash funds 6+ months of runway and builds case studies
- Path to $30K MRR: 20 retainer clients (achievable in 12 months at 1.5-2/month close rate)

**Why this beats pure retainer or pure one-off:**
- Pure retainer alone: $30K MRR requires 15-20 clients. 6-month sales cycle. Slow.
- Pure one-off alone: Churn-and-burn. You're always selling.
- Hybrid: Big cash upfront → funds the build → retainer makes it recurring → upsell the retainer later.
---

## 2. THE MACHINE — ARCHITECTURE

### 2.1 The Central Metaphor

Think of this as a **factory, not a workshop.**

- Workshop: you build each thing by hand, each one slightly different.
- Factory: you build a production line once. Then you feed it raw material (vertical config) and it outputs finished products (deployed agency sites) with predictable quality.

### 2.2 The 7 Layers

```
LAYER 0: THE GENERATOR      ← CLI that scaffolds new verticals
LAYER 1: PLANNING           ← ICP/Offer/Funnel spec (markdown)
LAYER 2: FOUNDATION          ← Next.js + Supabase + Vercel skeleton
LAYER 3: AI PATTERNS CORE    ← 4 n8n patterns, parametrized
LAYER 4: KING FUNNEL         ← The 6-stage conversion machine
LAYER 5: AGENTS              ← Deploy only what the funnel needs
LAYER 6: MARKETING & SCALE   ← Content, outbound, video (after $5K MRR)
```

### 2.3 The Two Repos

**Repo 1: `@dor/agency-core`** (the factory machinery — shared library)
- Conversion components (StatCounter, ShimmerButton, TrustMarquee, etc.)
- King Funnel page templates (landing, scan, qualify, book, offer, onboard)
- n8n workflow JSON templates (parameterized by vertical)
- Claude Code prompts for each phase
- Skill packs: lead-engine, outreach-operator, proposal-generator, etc.
- Supabase migrations schema
- CLI: `npx create-agency <n>`

**Repo 2: `<vertical>-agency`** (the product — what gets deployed)
- `vertical.config.ts` — THE ONLY FILE THAT CHANGES per vertical
- `planning/` — markdown docs from Phase 1
- `app/` — Next.js pages (90% imported from core, 10% custom)
- `n8n/` — workflow exports (imported from core, prompts swapped)
- `CLAUDE.md` — references core + planning
- Everything else: inherited from core

**Migration to a new vertical is one command:**
```bash
npx create-agency realestate-ai --from-template=agency-core
cd realestate-ai
# edit vertical.config.ts (15 minutes)
# edit planning/icp.md, planning/offer.md (2 hours)
npm run deploy
```

### 2.4 File Structure — The Exact Blueprint

```
dor-agency-system/                          ← monorepo root
├── packages/
│   ├── core/                                ← THE FACTORY
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── conversion/             ← All shared UI
│   │   │   │   │   ├── StatCounterBlock.tsx
│   │   │   │   │   ├── StepProcessBar.tsx
│   │   │   │   │   ├── ShimmerButton.tsx
│   │   │   │   │   ├── TrustMarquee.tsx
│   │   │   │   │   ├── RiskCalculator.tsx
│   │   │   │   │   ├── AnnouncementPill.tsx
│   │   │   │   │   └── AccordionFAQ.tsx
│   │   │   │   └── layout/
│   │   │   │       ├── NavBar.tsx
│   │   │   │       └── Footer.tsx
│   │   │   ├── funnel/                      ← Funnel state machine
│   │   │   │   ├── pages/
│   │   │   │   │   ├── landing.tsx
│   │   │   │   │   ├── scan.tsx
│   │   │   │   │   ├── qualify.tsx
│   │   │   │   │   ├── book.tsx
│   │   │   │   │   ├── offer.tsx
│   │   │   │   │   └── onboarding.tsx
│   │   │   │   └── state.ts
│   │   │   ├── n8n-templates/              ← Workflow JSONs
│   │   │   │   ├── 01-lead-qualifier.json
│   │   │   │   ├── 02-outbound-outreach.json
│   │   │   │   ├── 03-newsletter.json
│   │   │   │   ├── 04-video-pipeline.json
│   │   │   │   └── 05-support-agent.json
│   │   │   ├── prompts/                     ← Claude Code phase prompts
│   │   │   │   ├── phase-1-planning.md
│   │   │   │   ├── phase-2-foundation.md
│   │   │   │   ├── phase-3-ai-patterns.md
│   │   │   │   ├── phase-4-king-funnel.md
│   │   │   │   ├── phase-5-agents.md
│   │   │   │   ├── phase-6-marketing.md
│   │   │   │   └── phase-7-replication.md
│   │   │   ├── supabase/
│   │   │   │   └── migrations/
│   │   │   │       ├── 001_leads.sql
│   │   │   │       ├── 002_qualifier_responses.sql
│   │   │   │       ├── 003_content.sql
│   │   │   │       └── 004_orders.sql
│   │   │   └── skills/                       ← Claude skills
│   │   │       ├── lead-engine/
│   │   │       ├── outreach-operator/
│   │   │       ├── proposal-generator/
│   │   │       ├── client-onboarding/
│   │   │       └── research-pipeline/
│   │   └── package.json
│   │
│   └── cli/                                  ← THE GENERATOR
│       ├── bin/create-agency.ts              ← Entry point
│       ├── src/
│       │   ├── prompts.ts                    ← Interactive Q&A
│       │   ├── scaffold.ts                   ← File generation
│       │   ├── deploy.ts                     ← Vercel + Supabase bootstrap
│       │   └── templates/
│       │       └── vertical.config.template.ts
│       └── package.json
│
├── verticals/
│   ├── agency-os/                            ← VERTICAL #1 (your first)
│   │   ├── CLAUDE.md
│   │   ├── vertical.config.ts                ← ★ THE ONLY CUSTOM FILE
│   │   ├── planning/
│   │   │   ├── icp.md
│   │   │   ├── offer.md
│   │   │   ├── king-funnel.md
│   │   │   ├── pricing.md
│   │   │   └── content-strategy.md
│   │   ├── app/
│   │   │   ├── page.tsx                      ← Imports from core
│   │   │   ├── scan/page.tsx
│   │   │   ├── qualify/page.tsx
│   │   │   ├── book/page.tsx
│   │   │   └── api/
│   │   │       ├── leads/route.ts
│   │   │       └── scan/route.ts
│   │   ├── n8n/                               ← Exported + customized
│   │   ├── src/trigger/                       ← Trigger.dev tasks
│   │   │   ├── daily-content.ts
│   │   │   ├── weekly-newsletter.ts
│   │   │   └── lead-enrichment.ts
│   │   ├── public/
│   │   ├── .env.example
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   ├── home-services-ai/                     ← VERTICAL #2 (after $10K MRR)
│   └── bizlegal-ai/                          ← Your existing repo (parked, see §4)
│
├── .github/
│   └── workflows/
│       └── deploy.yml                         ← CI/CD per vertical
└── package.json                               ← Monorepo root
```

### 2.5 The `vertical.config.ts` File — The Single Source of Difference

```typescript
// verticals/agency-os/vertical.config.ts
import type { VerticalConfig } from '@dor/agency-core';

export const config: VerticalConfig = {
  // IDENTITY
  name: 'Agency OS',
  domain: 'agency-os.io',
  tagline: 'AI infrastructure for digital agencies',

  // ICP
  icp: {
    title: 'Founder of a 5-30 person digital agency',
    painPoints: [
      'Manually qualifying leads wastes 10+ hrs/week',
      'Clients churn because onboarding takes 3+ weeks',
      'Can\'t scale delivery without hiring',
    ],
    budget: '$10k-50k annual tooling',
    triggerEvent: 'Lost a client due to slow response time',
  },

  // OFFER
  offer: {
    headline: 'Install a complete AI ops system in your agency in 14 days',
    price: 18000, // USD, one-time
    retainer: 1500, // USD, monthly, optional
    guarantee: 'Book 3 new client calls in 30 days or full refund',
    duration: '14 days',
  },

  // BRAND TOKENS (Quantum DNA derived)
  brand: {
    colors: {
      bg: '#08080f',
      bgLow: '#0d0d1a',
      accent: '#00FF94',
      primary: '#a5b4fc',
      gold: '#d4a853',
    },
    fonts: {
      display: 'Instrument Serif',
      body: 'Geist',
      mono: 'DM Mono',
    },
  },

  // LEAD MAGNET
  leadMagnet: {
    type: 'interactive-audit',
    name: 'Agency AI Readiness Audit',
    questions: 7,
    output: 'personalized-report',
  },

  // FUNNEL TARGETS
  funnelTargets: {
    landingToScan: 0.35,
    scanToEmail: 0.65,
    emailToQualified: 0.30,
    qualifiedToBooked: 0.20,
    bookedToClose: 0.40,
  },

  // INTEGRATIONS (env var names only)
  integrations: {
    vapi: 'VAPI_API_KEY',
    resend: 'RESEND_API_KEY',
    stripe: 'STRIPE_SECRET_KEY',
    supabase: 'SUPABASE_SERVICE_KEY',
    n8nWebhook: 'N8N_WEBHOOK_URL',
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
  },
};
```

**That's it.** Every other file in the repo reads from this config. To clone to a new vertical, swap this file's contents. Nothing else changes.

---

## 3. THE KING FUNNEL — WHERE MONEY IS MADE

Since you're at 0 clients and you answered "build the King Funnel first," this is the entire focus of weeks 1-3.

### 3.1 The 6-Stage Funnel

```
STAGE 1: COLD TRAFFIC          → 1,000 visitors/month target
  ↓
STAGE 2: LANDING PAGE          → 35% click CTA (350)
  ↓
STAGE 3: LEAD MAGNET (SCAN)    → 65% give email (230)
  ↓
STAGE 4: AI QUALIFIER CALL     → 30% pass (70)
  ↓
STAGE 5: BOOKING               → 20% book call (14)
  ↓
STAGE 6: SALES CALL + CLOSE    → 40% close (6 clients)
                                 → $108K cash + $9K MRR
```

Run this once per month at 1,000 visitors: **6 clients × $18K + $9K MRR.**

### 3.2 Stage-by-Stage Spec

#### Stage 1: Cold Traffic
- **Source mix (first 90 days):** 60% cold outbound (LinkedIn + email), 30% SEO articles, 10% organic social. No paid ads until you have 3 case studies.
- **Tools:** Apify (scrape ICP), LinkedIn Agent (automate outreach), Claude for personalization.
- **Metric:** 1,000 unique visitors to landing by month 2.

#### Stage 2: Landing Page (`/`)
- **Single primary CTA** above the fold: "Get your free Agency AI Readiness Audit" (NOT "Learn More").
- **Structure:** Hero → Trust bar → 3 pain points → Solution (1 sentence) → How it works (3-step) → 1 case study → CTA repeat → FAQ → Footer.
- **Anti-generic rules (from Nate's design doc):** no default Tailwind blue, every interactive has hover+focus-visible+active, layered shadows only, display serif + clean sans pair.
- **Conversion target:** 35% click → scan.

#### Stage 3: Lead Magnet (`/scan`) — "Agency AI Readiness Audit"
- **7 questions** covering: team size, monthly lead volume, time spent on qualification, current tools, biggest bottleneck, revenue range, timeline to implement AI.
- **Output:** personalized 2-page report scoring them across 5 dimensions with specific recommendations.
- **Gating:** Email required to see the detailed report. Ungated score preview on screen.
- **Tech:** Next.js form → `/api/scan` → uses **Evaluator-Optimizer pattern** (Phase 3) to generate the report → saves lead to Supabase → fires n8n webhook.
- **Conversion target:** 65% give email.

#### Stage 4: AI Qualifier Call — Vapi
- **Trigger:** Email sent 2 minutes after scan completion offering a "5-minute AI consult call to discuss your results."
- **Scheduling:** Cal.com embed, next-available-slot.
- **Call script (Vapi AI):** adapted from `Outbound Lead Qualifier.json`. Asks: budget confirmation, timeline, decision authority, current stack, biggest pain.
- **Scoring:** Hot (80+) = auto-book sales call + text you; Warm (50-79) = 5-day email nurture; Cold (<50) = newsletter list.
- **Conversion target:** 30% of emails pass qualifier.

#### Stage 5: Booking (`/book`)
- **Access:** Hot leads get direct calendar link via SMS. Warm leads get it after day 3 of nurture if they engage (click 2+ emails).
- **Calendar:** Cal.com (or Calendly), 30-min slots, your timezone, buffer 15 min before.
- **Pre-call:** Auto-sends pre-call prep form (5 questions) + Loom intro video (record once, use forever).
- **Conversion target:** 20% of qualified book.

#### Stage 6: Sales Call + Close
- **Format:** 30 min Zoom.
- **Structure:** 5 min rapport → 10 min diagnosis (their pain, not your pitch) → 10 min showing them their audit report + Loom case study walkthrough → 5 min close.
- **Close:** Stripe payment link sent in chat during call. $18K split: $9K now, $9K day 14 on delivery acceptance.
- **Conversion target:** 40% close on first call.

### 3.3 The Monthly Unit Economics

Assume 1,000 cold visitors in month 3 (after SEO spin-up):

| Stage | Count | Rate |
|---|---|---|
| Visitors | 1,000 | — |
| Scans started | 350 | 35% |
| Emails captured | 230 | 65% |
| Qualifier pass | 70 | 30% |
| Calls booked | 14 | 20% |
| Closes | 6 | 40% |

**Revenue per month at 1,000 visitors:** 6 × $18,000 = **$108,000 cash** + 6 × $1,500 = **$9,000 new MRR** (assume 50% take retainer).

**Cost to serve:** Your time + $500-800 API costs. Solo operator, margin >90%.

**To hit $30K MRR:** 20 retainer clients. At 3 closes/month with 50% taking retainer = 18 months. At 6 closes/month = 7 months. **The variable is traffic volume, not funnel conversion.**

---

## 4. WHAT TO DO WITH THE BROKEN BIZLEGAL STUFF

You overrode my advice on this, so I'll give you the least-bad path that still respects your choice.

### 4.1 The Parking Strategy (recommended)

Do NOT "fix in parallel." Instead:

1. **Week 1:** Put "Coming Q3 2026 — join the waitlist" pages on BRAI, TRACR, LexAudit, LeadForge. Email capture only. Takes 2 hours.
2. **Week 1:** Keep Forge and DocAI live as-is (the only ones with real function). Mark DocAI clearly as beta. Add the "Back to BizLegal" bar.
3. **Weeks 1-12:** Build Agency OS vertical to $10K MRR.
4. **Month 4+:** Revisit BizLegal subdomains. By then you'll have working conversion components from Agency OS, real case studies, and can decide which to resurrect.

### 4.2 Why "Parallel Fix" Fails

- 6 products × all needing legal pages, testimonials, scanners, payments = ~120 hours of work
- You have 0 clients. Every hour on BizLegal fixes is an hour NOT getting first client.
- Once Agency OS hits $10K MRR, you have the money to hire someone to fix BizLegal. Or you archive it.

**If you absolutely must fix something on BizLegal:** ONLY fix the 4 P0 items from MORNING-REPORT (BRAI backend, LeadForge 404, TRACR anchors, DocAI loading state). One day total. Nothing more. No new features. No design polish.

### 4.3 The "Compliance" Positioning Play

Here's how BizLegal actually helps Agency OS instead of competing with it:

> Your BizLegal site becomes your **credibility pillar**. "I built an AI compliance product from scratch as a solo operator in Israel. Now I help agencies install the same infrastructure." BizLegal = proof that you can build what you sell.

Do NOT try to monetize BizLegal in the first 6 months. Use it as a portfolio piece.
---

## 5. THE 7 PHASES — EXECUTION

### Phase 0: Decisions & Setup (Day 0)
- Register `agency-os.io` domain (or similar)
- Create GitHub org: `dor-agency-system`
- Provision: Supabase project, Vercel team, n8n Docker on PC1, Trigger.dev project
- Install Claude Code, Cursor (optional), frontend-design skill
- Set up Executive Assistant per `Executive Assistant Initialize Prompt.txt`

### Phase 1: Planning (Days 1-2)
**Command Claude Code:**
```
Read:
- SKOOL-NATE/01_PLANNING_STRATEGY/WAT.CLAUDE (2).md
- SKOOL-NATE/01_PLANNING_STRATEGY/TIER1_COMPLIANCE_RISK_AGENCY_BLUEPRINT.md
- SKOOL-NATE/executive assistant/context/goals.md

Produce in verticals/agency-os/planning/:
- icp.md (ICP: agency founder, 5-30 employees)
- offer.md ($18K one-off + $1,500/mo retainer)
- king-funnel.md (6 stages, each with conversion target)
- pricing.md (3-tier structure)
- content-strategy.md (5 SEO articles, 5 video scripts, 90 days)

Ask me 10 questions before writing. Wait for answers.
DO NOT write code. Planning only.
```

**Output:** 5 markdown files. Go/no-go checkpoint: does the offer pass the "would you pay $18K for this?" test?

### Phase 2: Foundation (Days 3-5)
**Command Claude Code:**
```
Read:
- SKOOL-NATE/02_FOUNDATION_INFRASTRUCTURE/n8n Cheatsheet 2026.pdf
- SKOOL-NATE/deploy project/CLAUDE-workflowbuilder).md
- SKOOL-NATE/deploy project/trigger-ref.md
- verticals/agency-os/planning/king-funnel.md

Tasks:
1. Scaffold Next.js 14 in verticals/agency-os/
2. Install: @supabase/ssr, resend, stripe, @trigger.dev/sdk
3. Create vertical.config.ts from template
4. Supabase migrations: leads, qualifier_responses, content, orders
5. /api/leads POST → Supabase + n8n webhook
6. Base layout (NavBar + Footer) using vertical.config.ts brand tokens
7. Git init + push + Vercel connect

DO NOT build marketing pages yet.
Output: curl https://agency-os.vercel.app returns 200.
```

### Phase 3: AI Patterns (Day 6)
**Command Claude Code (n8n side):**
```
Import and customize for Agency OS vertical:
- SKOOL-NATE/03_AI_PATTERNS_CORE/Prompt_Chaining.json → Agency audit report pipeline
- SKOOL-NATE/03_AI_PATTERNS_CORE/Parallelization.json → Multi-angle lead scoring
- SKOOL-NATE/03_AI_PATTERNS_CORE/Routing.json → Inbound classifier
- SKOOL-NATE/03_AI_PATTERNS_CORE/Evaluator_Optimizer.json → Outreach message QA

For each: rename to agency-os-<pattern>, swap prompts, test with real data.
Export JSONs to verticals/agency-os/n8n/.
```

### Phase 4: King Funnel (Days 7-14) — THE MOST IMPORTANT PHASE
**Command Claude Code:**
```
Read:
- verticals/agency-os/planning/king-funnel.md
- verticals/agency-os/planning/offer.md
- SKOOL-NATE/01_PLANNING_STRATEGY/Outbound Lead Qualifier.json
- SKOOL-NATE/11_DOCUMENTATION_RESOURCES/I Built a Voice Agent That Calls Every New Lead (n8n + Vapi).pdf
- SKOOL-NATE/01_PLANNING_STRATEGY/CLAUDE (-website design).md
- SKOOL-NATE/01_PLANNING_STRATEGY/CLAUDE_CODE_SITE_BUILDING_WORKFLOW.md

Always invoke frontend-design skill before any frontend code.

Build in this exact order, testing on localhost before moving on:
1. Homepage (/) — hero + 3 pains + solution + 3-step + case study + CTA
2. Lead magnet (/scan) — 7-question audit, gated report
3. Qualifier trigger (/qualify) — form → Vapi call → n8n → Google Sheets
4. Booking (/book) — Cal.com embed, hot-lead only
5. Offer page (/offer) — 3-min VSL + case studies + book CTA
6. Onboarding (/onboarding) — post-payment portal

Anti-generic guardrails (hard rules):
- No default Tailwind palette
- Layered shadows only
- transform/opacity animations only
- Every interactive has hover + focus-visible + active
- Screenshot every page, 2-pass Puppeteer self-review

Push to GitHub ONLY when I say so.
```

### Phase 5: Agents (Days 15-21)
**Deploy order — STOP after 3 until first client closes:**
1. Lead Qualifier Agent (done in Phase 4)
2. Inbox Management Agent (triage inbound client emails)
3. Calendar Agent (booking confirmations + reminders)
--- PAUSE — close 2-4 clients first ---
4. Research Agent (client-specific intel)
5. Content Agent (SEO + social)
6. Invoice Agent
7. LinkedIn Agent (outbound at scale)
8. Personal Assistant (central hub — LAST)

### Phase 6: Marketing & Scale (Weeks 4-8, AFTER first client)
- Weekly newsletter (Newsletter Automation workflow)
- Daily LinkedIn + X posts (Blotato)
- 3 SEO articles/week (Blog Post workflow)
- Faceless video 3-5/day (AI Marketing Team workflow) — only if $5K MRR hit

### Phase 7: Replication (Month 4+, after $10K MRR)
- Extract `packages/core` from `verticals/agency-os`
- Build CLI: `npx create-agency <n>`
- Scaffold `verticals/home-services-ai`
- Deploy in <48 hours

---

## 6. THE TECH STACK (LOCKED)

No substitutions without a decision log entry.

| Layer | Tool | Runs On |
|---|---|---|
| Frontend | Next.js 14 App Router | PC2 → Vercel |
| Styling | Tailwind + CSS custom props (Quantum DNA) | — |
| Database | Supabase PostgreSQL | Cloud |
| Auth | Supabase Auth | Cloud |
| Payments | Stripe (primary) + Paddle (EU VAT) | Cloud |
| Email | Resend | Cloud |
| Automation | n8n self-hosted Docker | PC1 |
| Scheduled jobs | Trigger.dev v4 | Cloud |
| AI (local) | Ollama (gemma2:9b, llama3.2:3b) | PC1 |
| AI (cloud) | Claude Opus/Sonnet, GPT-4o | API |
| Voice AI | Vapi | Cloud |
| Scraping | Apify | Cloud |
| Vector DB | Pinecone | Cloud |
| Booking | Cal.com | Cloud |
| Video | Runway + ElevenLabs + Creatomate | API |
| Distribution | Blotato | API |
| Monitoring | Marimo ops dashboard | PC1 |

**Monthly cost at zero clients:** ~$280. **At 10 clients:** ~$450.

---

## 7. OFFER ENGINEERING — THE $18K DFY + RETAINER

### 7.1 What They Get (the $18K package)

**"Agency OS Installation — 14 Days"**

Week 1:
- Day 1: Kickoff call + access grants (Supabase, GoHighLevel, Slack)
- Day 2-3: ICP analysis + outbound list build (500 target accounts)
- Day 4-5: Vapi voice qualifier deployed + tested
- Day 6-7: Lead routing rules + CRM sync

Week 2:
- Day 8-9: Content machine setup (newsletter + social scheduler)
- Day 10-11: Proposal generator + onboarding flow
- Day 12-13: Client dashboard + team training (2 sessions, 1hr each)
- Day 14: Handoff + 30-day support window

### 7.2 The Guarantee

> "If you don't book 3 qualified sales calls within 30 days of go-live, I refund $9K (the second installment) and you keep the system."

This works because: (a) you control the system so you know it works, (b) book-rate is the easiest metric to hit, (c) refund is only half the money so you're never upside-down on cost to deliver.

### 7.3 Pricing Psychology

| Tier | Price | Positioning |
|---|---|---|
| Starter | $9,000 | "Pilot" — stripped down, landing + qualifier only |
| **Pro** | **$18,000** | **The main offer — full install** |
| Elite | $35,000 | "White-glove" — full install + 90 days hands-on + quarterly optimization |

**Sell Pro. Use Starter as a downsell for hesitant buyers. Use Elite as anchor pricing.** Never lead with Starter.

### 7.4 The Retainer ($1,500/mo)

- Monthly optimization call
- A/B testing on landing + scan
- Monthly content package (4 articles, 12 social posts)
- Priority support

**Keep it lightweight.** The retainer is about retention, not delivery. If it becomes more work than a monthly call + 1-2 hours of tweaks, raise the price.

---

## 8. THE 30-DAY EXECUTION PLAN

Days 1-2: Phase 1 (Planning)
Days 3-5: Phase 2 (Foundation)
Day 6: Phase 3 (AI Patterns)
Days 7-14: Phase 4 (King Funnel build + test)
Day 15: First 50 cold outbound sends
Days 15-21: Phase 5 agents 1-3 + continuous outbound
Days 22-30: First sales calls + close first client

**Day-30 target: 1 paying client at $18K, 3 calls booked, 200 emails captured.**

If not hit: stop building. Debug. Do not start vertical #2.

---

## 9. WHAT NOT TO DO

These are the patterns you fell into with BizLegal. Naming them so we don't repeat:

1. ❌ Build 6 subdomains before 1 works
2. ❌ Design 5 verticals before revenue in 1
3. ❌ Fake functionality ("demo mode" scanners) that signals amateur
4. ❌ Parallel fixes that never complete
5. ❌ Pretty landing pages with no conversion instrumentation
6. ❌ Adding features before the sales cycle is profitable
7. ❌ Chasing a "perfect" system instead of shipping v1 for real users
8. ❌ Talking about video pipelines while the landing page has no CTA
9. ❌ Master plans longer than 40 pages (this one is 15. That's on purpose.)

---

## 10. THE ONE-SENTENCE VERSION

> Build one 6-stage conversion funnel for one vertical, extract it into a generator, clone to verticals 2 and 3. Ship in 30 days. Kill anything that doesn't serve a signed deal.

---

*Companion documents in this folder:*
- `PHASE-PROMPTS.md` — Exact Claude Code prompts for each of the 7 phases
- `CLAUDE.md` — Drop-in system prompt for every vertical repo
- `DAY-BY-DAY-30-DAYS.md` — Hour-by-hour execution calendar
