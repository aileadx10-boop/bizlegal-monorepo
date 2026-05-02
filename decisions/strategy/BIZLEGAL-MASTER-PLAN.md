# BIZLEGAL AI — MASTER PLAN v4

> **Generated:** April 14, 2026 · **Updated:** April 14, 2026  
> **Framework:** WAT (Workflows → Agents → Tools)  
> **Architecture:** Conversion-focused, vertical-agnostic, repo-migratable  
> **Design System:** Quantum DNA (the one already in production — NOT GritNova, NOT Web3Go)  
> **Video Pipeline:** AI-managed content machine (separate from product features)  
> **Last Deploy:** f3c71fd → main (P0 hub fixes live on Vercel)  

---

## 0. INFRASTRUCTURE

### Machine Assignments

| Machine | Specs | Role | What Runs On It |
|---------|-------|------|-----------------|
| **PC1 (Power)** | 34GB RAM, 2TB SSD, RTX 5060 | AI engine + automation + 3 clouds | Ollama (paid), n8n, Trigger.dev, crawlers, video pipeline, local LLM inference |
| **PC2 (Production)** | 16GB RAM | BizLegal runtime | Next.js dev server, Supabase MCP, Vercel CLI, git, build pipeline |

**Rule:** Everything runs on PC1 or PC2 using the same method and mechanism. The architecture is conversion-focused — designed to either add verticals OR migrate the repo to a completely different business with ease.

### 3 Cloud Instances (PC1-managed)

| Cloud | Purpose | Provider |
|-------|---------|----------|
| Cloud 1 | Vercel — all frontend deploys (hub + 6 subdomains) | Vercel |
| Cloud 2 | Supabase — all databases (DB1 hub + DB2 runtime) | Supabase |
| Cloud 3 | Render — backend API (BRAI FastAPI, webhooks) | Render |

### Ollama (Paid) on PC1

| Model | Purpose | When |
|-------|---------|------|
| gemma2:9b | Content drafts, scoring, social copy | Content generation |
| llama3.2:3b | Fast checks, dedup, formatting | QA pipeline |
| claude-opus (API) | Strategy, legal reasoning, complex planning | Manual escalation |
| claude-sonnet (API) | Building, deploying, fixing code | Claude Code sessions |

---

## 1. THE 5 VERTICALS — Conversion-First Architecture

Each vertical uses the **exact same repo structure, same mechanism, same conversion funnel**. To add a vertical: duplicate the config, swap content. To migrate to a different business: swap brand tokens, domain, and content — the code stays.

| # | Vertical | Domain | Status | Revenue Model |
|---|----------|--------|--------|---------------|
| 1 | **Regulatory Compliance & Risk** | bizlegal-ai.com + 6 subdomains | LIVE (broken — see audit below) | SaaS tiers + agent add-ons |
| 2 | **Cross-Border Arbitrage** | bizlegal-ai.com/jurisdictions | Route exists, needs content | Reports + consulting leads |
| 3 | **Privacy & Data Protection** | bizlegal-ai.com/tools (GDPR calculators) | Tools exist, needs funnel | Freemium tools → paid scans |
| 4 | **Surplus Funds Recovery** | New vertical — same repo | Not started | Lead generation fees |
| 5 | **Grants & Incentives** | New vertical — same repo | Not started | Report sales + consulting |

### Migration Pattern (Vertical-Agnostic)

```
To add a new vertical OR migrate to a different business:
1. Swap brand tokens in site-content.ts (name, URLs, descriptions)
2. Swap product cards in site-content.ts (6 products)
3. Swap CSS custom properties (product accent colors)
4. Swap Supabase table references (seo_pages → new vertical content)
5. Swap n8n workflow topics (regulatory → new domain)
6. Deploy — same code, new business
```

---

## 2. CURRENT STATE — BRUTAL AUDIT

### Hub (bizlegal-ai.com)

| Page | Score | Status |
|------|-------|--------|
| Homepage (3JS Globe) | 85 | LIVE — Globe renders, nav updated, enterprise removed, focus-visible on all interactives |
| /agents | 75 | LIVE — 6 agent cards, pricing, request access, .agent-cta class |
| /risk-engine | 75 | LIVE — Best interactive page, real form inputs |
| /trust | 70 | LIVE — Trust Center, merged Security content, .link-hover-muted class |
| /disclaimer | 75 | LIVE — With downstairs T&C, .link-hover-muted class |
| /terms | 60 | LIVE — Has NavBar+Footer now |
| /privacy | 60 | LIVE — Has NavBar+Footer now |
| /pricing | 65 | LIVE — Enterprise renamed to Scale |
| /contact | 70 | LIVE — team@bizlegal-ai.com, partnership (not enterprise) |
| /leadforge | 60 | LIVE — Notify Me button now calls /api/leads with email capture |

### Hub P0 Bug Fixes — COMPLETED (commit f3c71fd, deployed to Vercel)

| # | Bug | File | Fix | Status |
|---|-----|------|-----|--------|
| 1 | Unsubscribe link href="#" | `lib/resend.ts` line 51 | Real URL via process.env | DONE |
| 2 | Hardcoded webhook URL | `app/api/brai/invoice/route.ts` line 38 | Dynamic `appUrl` variable | DONE |
| 3 | LeadForge Notify Me no handler | `app/leadforge/page.tsx` | useState + POST to /api/leads | DONE |
| 4 | Missing focus-visible/active states | `app/globals.css` | Added to all interactive elements | DONE |

### Product Subdomains — ONLY 2 PARTIALLY WORK

| Product | Score | Scanner | Payments | Legal Pages | Critical Issue |
|---------|-------|---------|----------|-------------|----------------|
| **Forge** | **50** | PARTIALLY REAL | NOWPayments badge | 5/6 (missing acceptable-use) | Best subdomain. BOI form is real. Payment unconfirmed. |
| **DocAI** | **40** | UNVERIFIABLE | NO | 4/6 | /generate stuck on "Loading...". DorInnovations branding. |
| **TRACR** | **35** | UNVERIFIABLE | Text only | Pages exist but footer links are `#` dead anchors | Stats all show 0. Anonymous testimonials. |
| **LexAudit** | **30** | NO | NO | 3/6 (best legal pages) | Login page is a shell. No auth. No checkout. |
| **BRAI** | **25** | FAKE (hardcoded) | Partial (endpoint exists) | ALL 404 | Scanner uses keyword matching, not AI. All legal pages broken. |
| **LeadForge** | **0** | N/A | N/A | N/A | 404 — subdomain doesn't resolve |

### Summary: ONLY Forge and DocAI have any real functionality. The rest are marketing shells.

---

## 3. WAT FRAMEWORK — ALWAYS START HERE

**Source:** `C:\Users\Moshe Dor\Downloads\SKOOL-NATE\01_PLANNING_STRATEGY\WAT.CLAUDE (2).md`

```
FOR EVERY TASK:
1. WORKFLOW → Read infrastructure/workflows/[relevant].md
2. AGENT   → Choose who handles it (Claude Opus / Claude Code / Ollama)
3. TOOLS   → Execute with deterministic scripts

RULE: AI reasons. Code executes. Never let AI do what code can do.
SELF-IMPROVEMENT LOOP: Broke → Fix → Verify → Update workflow → Move on.
```

---

## 4. SKOOL-NATE PHASES — MAPPED TO BIZLEGAL

### Phase 1: PLANNING — Agency Blueprint + Lead Qualifier

| SKOOL-NATE Asset | BizLegal Application | Implementation |
|-------------------|---------------------|----------------|
| `TIER1_COMPLIANCE_RISK_AGENCY_BLUEPRINT.md` | 7 service offerings defined | Already mapped — see §5 below |
| `Outbound Lead Qualifier.json` | Client intake → AI phone call (Vapi) → risk profiling → Google Sheets | Import into n8n, swap form fields for compliance intake, route Vapi to compliance qualification script |
| `WAT.CLAUDE (2).md` | WAT Framework integrated into CLAUDE.md | DONE — §0.5 in CLAUDE.md |

**Implementation:**
```
1. Import Outbound Lead Qualifier.json into n8n on PC1
2. Replace form fields: name, phone, email, company, jurisdiction, industry, risk concern, budget
3. Configure Vapi AI call script for compliance qualification questions
4. Map Google Sheets columns to: Risk Tier, Regulatory Framework, Urgency, Budget Range, Service Match
5. Connect to hub /contact form submission webhook
```

### Phase 2: FOUNDATION — n8n + Developer Agent

| SKOOL-NATE Asset | BizLegal Application | Implementation |
|-------------------|---------------------|----------------|
| `n8n Cheatsheet 2026.pdf` | Reference for all 17 core nodes | Read on PC1 before building workflows |
| `n8n_Developer_Agent.json` | Meta-agent that builds n8n workflows from natural language | Import, swap docs reference to BizLegal compliance SOPs, deploy on PC1 n8n instance |
| `ExtractInfoCode.txt` + `IncreaseCountCode.txt` | Code snippets for data extraction and loops | Use in custom nodes |

**Implementation:**
```
1. Install n8n on PC1 (self-hosted with Docker)
2. Import n8n_Developer_Agent.json
3. Upload BizLegal compliance SOPs to Google Doc (referenced by the agent)
4. Configure n8n API credential for auto-deployment of generated workflows
5. Test: "Build a workflow that monitors SEC enforcement actions"
```

### Phase 3: AI PATTERNS — 4 Core Patterns

| Pattern | SKOOL-NATE JSON | BizLegal Application |
|---------|-----------------|---------------------|
| **Prompt Chaining** | `Prompt_Chaining.json` | Compliance doc pipeline: Regulation Extract → Gap Analyzer → Remediation Writer → Google Docs |
| **Parallelization** | `Parallelization.json` | Multi-lens risk analysis: Regulatory Risk + Contractual Risk + Data Privacy Risk → Aggregated Score |
| **Routing** | `Routing.json` | Intake routing: Regulatory Inquiry → specialist, Data Breach → escalation, Contract Review → legal team |
| **Evaluator-Optimizer** | `Evaluator_Optimizer.json` | Policy quality gate: Draft → Check mandatory criteria → Revise → Ship |

**Implementation:**
```
1. Import all 4 JSON workflows into n8n on PC1
2. Prompt Chaining: swap blog pipeline → compliance document pipeline
3. Parallelization: swap emotion/intent/bias → regulatory/contractual/privacy risk
4. Routing: swap email categories → compliance intake types
5. Evaluator-Optimizer: swap biography criteria → compliance policy criteria
6. Test each pattern with real BizLegal data
```

### Phase 4: SINGLE AGENTS — 8 Core Agents

| Agent | SKOOL-NATE JSON | BizLegal Role | Required APIs |
|-------|-----------------|---------------|---------------|
| **Compliance Assistant** | `__Personal_Assistant_AI_Agent_2_0.json` | Central hub: queries, policy lookups, deadline tracking | OpenAI, Slack, Pinecone, Google Sheets |
| **Email Triage** | `__Email_Agent.json` | Auto-classify regulatory notices, audit requests | OpenAI, Gmail |
| **Inbox Monitor** | `___Inbox_Management_Agent.json` | Track compliance correspondence, flag deadlines | OpenAI, Gmail |
| **Deadline Tracker** | `__Calendar_Agent.json` | Audit schedules, filing deadlines, regulatory review dates | OpenAI, Google Calendar |
| **Risk Register** | `__Projects_Agent.json` | Track risk items, mitigation status, compliance timelines | OpenAI, Google Sheets |
| **Regulatory Research** | `__Research_Agent.json` | Monitor regulatory changes, summarize new laws | OpenAI, SerpAPI, Federal Register |
| **Invoice Auditor** | `__Invoice_Agent.json` | Auto-validate invoices, flag anomalies | OpenAI, Telegram, Google Sheets |
| **Reputation Monitor** | `__LinkedIn_Agent.json` | Public sentiment, executive due diligence | OpenAI, LinkedIn |

**Deployment Order:**
```
1. Compliance Assistant (central hub — PC1)
2. Email Triage + Inbox Monitor (communication)
3. Deadline Tracker (calendar)
4. Risk Register (projects)
5. Regulatory Research (research)
6. Invoice Auditor (documents)
7. Reputation Monitor (social)
```

### Phase 5: MULTI-AGENT — Swarm Intelligence

| Asset | BizLegal Application |
|-------|---------------------|
| `Agent Swarm.json` | Coordinated threat response: alert → investigate → document → notify |
| `Multi_Agent_System_Benefits.json` | Multi-agent compliance engine: parallel AML + KYC + risk scoring |

### Phase 6: DATA INTELLIGENCE — Scrapers

| Asset | BizLegal Application |
|-------|---------------------|
| `Apify.json` | Business verification, location intelligence, due diligence |
| `Twitter_X_Scraper.json` | Threat intelligence, sentiment analysis, brand risk monitoring |

### Phase 7: MARKETING — Newsletter + Social

| Asset | BizLegal Application |
|-------|---------------------|
| `Newsletter_Automation (1) (1).json` | Weekly regulatory intelligence brief for clients |
| `AI Newsletter System.json` | Scheduled weekly brief — auto-draft, human review, then send |
| `Blotato Posting.json` | Scheduled compliance thought leadership on LinkedIn + X |

### Phase 8: WEBSITE — Build + Deploy

| Asset | BizLegal Application |
|-------|---------------------|
| `CLAUDE_CODE_SITE_BUILDING_WORKFLOW.md` | Build new vertical sites using Claude Code + Anti-Generic Guardrails |
| `WEBSITE_WORKFLOW.md` | Website lead capture automation via n8n |

---

## 5. DESIGN SYSTEM — QUANTUM DNA (ONE SYSTEM, NOT THREE)

**Decision: Quantum DNA.** Already in production, fully aligned with SKOOL-NATE Anti-Generic Guardrails. GritNova and Web3Go are reference sites for specific component patterns — NOT alternative design systems. We take inspiration from their stat counters and step processes, but build them WITHIN Quantum DNA, not alongside it.

### Quantum DNA (The System)
```
--bg:        #08080f    --gold:      #d4a853
--bg-low:    #0d0d1a    --primary:   #a5b4fc
--accent:    #00FF94    --white:     #f0f2ff
--muted:     #636680

Instrument Serif → display    Geist → body    DM Mono → labels
Glass cards, quantum-label, quantum-h1/h2/h3, eyebrow-pill
```

### Anti-Generic Guardrails (from SKOOL-NATE, already applied)
- Colors: Never default Tailwind. Use `var(--gold)`, `var(--primary)`, `var(--accent)`
- Shadows: Layered, color-tinted. Never flat `shadow-md`
- Typography: Display/serif + clean sans. Tight tracking on headings, generous line-height on body
- Gradients: Multiple radial gradients + SVG noise filter for depth
- Animations: Only transform + opacity. Spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)`
- Interactive states: hover, focus-visible, active on ALL clickables
- Depth: Surface layering — base → elevated → floating

### Premium Components to Add (from 21st.dev, selectively)
| Component | Use For | Status |
|-----------|---------|--------|
| animated-counter | Hero stats, scan results, jurisdiction counts | INSTALLING |
| shimmer-button | Primary CTAs (Free Risk Scan, Request Access) | INSTALLING |
| marquee | Trust bar, partner logos, certification badges | INSTALLING |

> **Note:** `npx 21st add` CLI is not on npm. Components will be installed manually by copying source from 21st.dev into `components/conversion/` and adapting to Quantum DNA tokens.

### Custom Components to Build (Quantum DNA native, inspired by GritNova/Web3Go patterns)
| Component | Inspired By | Use For |
|-----------|-------------|---------|
| StatCounterBlock | GritNova stat numbers | Trust metrics, scan results |
| NumberedFeatureCard | GritNova 01/02/03 badges | Product feature grids |
| StepProcessBar | GritNova step connectors | Scan → Analyze → Act onboarding |
| TrustMarquee | GritNova trust bar | SOC2/GDPR/VARA certification logos |
| AnnouncementPill | GritNova live banner | "MiCA regulation live" alerts |
| RiskCalculator | Web3Go exchange calculator | Risk score estimator |
| AccordionFAQ | Web3Go FAQ accordion | Product page FAQ sections |
| ThreeStepOnboarding | Web3Go 3-step flow | Input → Process → Results |

---

## 5.5 AUTOMATED AGENT CIRCLE

The complete automation loop. n8n orchestrates, Ollama executes, Trigger.dev schedules, and AI Brian (Marimo dashboard) monitors.

```
┌─────────────────────────────────────────────────────────────────┐
│                        PC1 (34GB + RTX 5060)                      │
│                                                                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│  │  n8n      │    │  Ollama  │    │ Trigger  │    │  Vapi    │   │
│  │  (orch.)  │───▶│  (local  │    │  .dev    │    │  (voice) │   │
│  │          │    │   AI)    │    │ (sched.) │    │          │   │
│  └────┬─────┘    └──────────┘    └──────────┘    └──────────┘   │
│       │                                                          │
│       │  ┌──────────────────────────────────────────────────┐    │
│       │  │              MARIMO OPS DASHBOARD                │    │
│       │  │  (AI Brian — monitors all workflows, shows       │    │
│       │  │   status, errors, revenue, pipeline health)      │    │
│       │  └──────────────────────────────────────────────────┘    │
│       │                                                          │
│  ┌────▼──────────────────────────────────────────────────────┐   │
│  │                    WORKFLOW PIPELINE                        │   │
│  │                                                            │   │
│  │  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐  │   │
│  │  │Lead Qual │──▶│Research │──▶│Content  │──▶│Publish  │  │   │
│  │  │(Vapi+   │   │(Ollama+ │   │Draft    │   │(Blotato+│  │   │
│  │  │ Sheets)  │   │ SerpAPI)│   │(Ollama) │   │ Buffer) │  │   │
│  │  └─────────┘   └─────────┘   └─────────┘   └─────────┘  │   │
│  │                                                            │   │
│  │  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐  │   │
│  │  │Video    │──▶│Newsletter│──▶│SEO      │──▶│Social   │  │   │
│  │  │(Runway+ │   │(Tavily+ │   │(Auto    │   │(LinkedIn│  │   │
│  │  │ Eleven) │   │ Claude) │   │ Generator│   │  + X)   │  │   │
│  │  └─────────┘   └─────────┘   └─────────┘   └─────────┘  │   │
│  │                                                            │   │
│  │  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐  │   │
│  │  │Compliance│──▶│Email    │──▶│Deadline │──▶│Risk     │  │   │
│  │  │Assistant │   │Triage   │   │Tracker  │   │Register │  │   │
│  │  │(Central) │   │(Gmail)  │   │(Calendar│   │(Sheets) │  │   │
│  │  └─────────┘   └─────────┘   └─────────┘   └─────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              VIDEO CONTENT MACHINE (AI-managed)          │    │
│  │                                                          │    │
│  │  GPT-4.1 (script) → Runway (video) → ElevenLabs (voice)│    │
│  │  → Creatomate (render) → Blotato (distribute)           │    │
│  │                                                          │    │
│  │  NOT about BizLegal products. About AI compliance,      │    │
│  │  risk, regulation topics that drive traffic.            │    │
│  │  3-5 videos/day, $2-5 each, per vertical.               │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        PC2 (16GB RAM)                             │
│                                                                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │ Next.js  │    │ Supabase │    │ Vercel   │                   │
│  │ dev srvr │    │ MCP      │    │ CLI      │                   │
│  └──────────┘    └──────────┘    └──────────┘                   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  BIZLEGAL-AI HUB + 6 SUBDOMAINS (Vercel production)    │    │
│  │  bizlegal-ai.com | brai | tracr | docai | lexaudit     │    │
│  │  forge | leadforge                                      │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### How the Circle Works

1. **Lead comes in** → Contact form → n8n webhook → Lead Qualifier (Vapi AI call) → Risk Tier → Google Sheets
2. **Research triggers** → n8n cron (daily 06:00 UTC) → SerpAPI + Ollama research → Regulatory Monitor agent → Newsletter + Social
3. **Content publishes** → SEO Generator (Ollama + Claude) → Supabase seo_pages → Vercel rebuild → Auto-tweeted by Blotato
4. **Video publishes** → GPT-4.1 script → Runway video → ElevenLabs voice → Creatomate render → Blotato distribution
5. **Ops monitored** → Marimo dashboard (AI Brian) shows all workflow status, errors, revenue, pipeline health

### Executive Assistant (from SKOOL-NATE)

The `Executive Assistant Initialize Prompt.txt` from SKOOL-NATE sets up a Claude Code-based second brain:

```
CLAUDE.md          → Main brain file (references context files)
context/me.md      → Profile (Moshe, notary/lawyer, Israel, 5 verticals)
context/work.md    → BizLegal AI business details
context/team.md    → Team structure
context/current-priorities.md → What's focused now
context/goals.md   → Quarterly goals
decisions/log.md   → Append-only decision log
templates/         → Session summaries, reusable outputs
projects/          → Active workstreams
```

This runs IN Claude Code on PC2 — the assistant knows the entire codebase, the master plan, and the WAT framework.

### Trigger.dev (Scheduled Tasks)

From `deploy project/mcp.json` — Trigger.dev v4 SDK for cron-based automation:

```
Daily SEO generation (06:00 UTC)    → schedules.task cron "0 6 * * *"
Weekly newsletter (Friday)           → schedules.task cron "0 8 * * 5"
Social posting (after publish)       → event-triggered via webhook
Regulatory monitoring (every 8hrs)  → schedules.task cron "0 */8 * * *"
Video pipeline trigger (3x/day)      → schedules.task cron "0 9,14,19 * * *"
```

All scheduled tasks use the Orchestrator + Processor pattern from Trigger.dev:
- Orchestrator: lightweight check task (polls for new items)
- Processor: heavy work task (per-item LLM calls, API requests)
- Idempotency keys prevent duplicate processing

---

## 6. PHASED EXECUTION PLAN

### PHASE 1: PLANNING (Week 1) — WAT + Blueprint + Lead Qualifier

```
□ Import WAT Framework into PC1 n8n instance
□ Import Outbound Lead Qualifier.json → configure for compliance intake
□ Import n8n_Developer_Agent.json → configure with BizLegal SOPs
□ Set up Google Sheets for: client risk register, lead tracking, compliance log
□ Configure Vapi AI for compliance qualification phone calls
□ Define 7 service offerings per TIER1_BLUEPRINT
□ Set up PC1 → PC2 sync (git push/pull, Supabase shared)
```

### PHASE 2: FOUNDATION (Week 2) — n8n + 4 AI Patterns

```
□ Install n8n self-hosted on PC1 (Docker)
□ Import all 4 AI pattern workflows (Chaining, Parallel, Routing, Evaluator-Optimizer)
□ Customize each for compliance use cases
□ Set up Pinecone on PC1 for compliance knowledge base
□ Configure OpenAI + Anthropic + OpenRouter API keys
□ Test each pattern with real compliance data
```

### PHASE 3: BUILDING (Week 3-4) — Single Agents + Website Fixes

```
□ Deploy 8 single agents in order (Compliance Assistant first)
□ FIX: BRAI — deploy FastAPI backend to Render, fix fake scanner
□ FIX: TRACR — fix footer `#` dead anchors, fix 0 stats
□ FIX: LexAudit — implement auth, add payment flow
□ FIX: DocAI — fix /generate "Loading..." stuck, remove DorInnovations branding
□ FIX: Forge — add acceptable-use page
□ FIX: LeadForge — deploy under-construction page on subdomain (currently 404)
□ Create 15 missing legal pages across subdomains
□ Add "Back to BizLegal" top bar to all 6 subdomains
```

### PHASE 4: EXECUTION (Week 5-6) — Multi-Agent + Data Intelligence

```
□ Deploy Agent Swarm for coordinated threat response
□ Deploy Multi-Agent Compliance Engine (parallel risk scoring)
□ Set up Apify for business verification workflows
□ Set up Twitter/X Scraper for threat intelligence
□ Build conversion-focused lead funnels on all product pages
□ Add email capture gates to TRACR, DocAI, Forge
□ Add testimonials to LexAudit, DocAI, Forge
```

### PHASE 5: MARKETING (Week 7-8) — Newsletter + Social + Video

```
□ Import Newsletter Automation → configure for weekly regulatory brief
□ Import AI Newsletter System → scheduled weekly, human review before send
□ Import Blotato Posting → schedule compliance thought leadership
□ Set up AI Marketing Team workflow (GPT-4.1 → Runway → ElevenLabs → Creatomate → Blotato)
□ Launch faceless video content per vertical:
  - Compliance: "3 gaps that cost companies $1M+"
  - Arbitrage: "This jurisdiction loophole saves $500K"
  - Privacy: "Your website is illegal in California"
□ Build Instagram + TikTok + YouTube distribution
```

### PHASE 6: REVENUE (Week 9-12) — Scale + Vertical Expansion

```
□ Add Vertical 2 (Cross-Border Arbitrage) — same repo, swap content
□ Add Vertical 3 (Privacy & Data Protection) — same repo, swap content
□ Build Mission Control dashboard (ops monitoring)
□ Scale n8n workflows for multi-client management
□ Deploy n8n Developer Agent for client-specific workflow generation
□ Revenue targets:
  - Without video: $30K/mo
  - With video (low): $53K/mo
  - With video (high): $378K/mo
```

---

## 7. TECH STACK

| Layer | Technology | Runs On | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js 14 (App Router) | PC2 (dev) → Vercel (prod) | SSR + SSG hybrid |
| **Styling** | Tailwind CSS + CSS custom properties | PC2 → Vercel | Quantum DNA + GritNova patterns |
| **3D** | Three.js + React Three Fiber v8 + drei v9 | PC2 → Vercel | Regulatory globe (React 18 compat) |
| **Database** | Supabase (PostgreSQL) | Cloud 2 | seo_pages, orders, leads, profiles |
| **Backend API** | FastAPI (Python) | Cloud 3 (Render) | BRAI scanner, webhook handlers |
| **Payments** | NOWPayments + PayPal | Cloud 3 | Multi-method checkout |
| **Email** | Resend | Cloud 1 | Transactional + newsletter |
| **Automation** | n8n (self-hosted) | PC1 | All SKOOL-NATE workflows |
| **Local AI** | Ollama (paid) | PC1 | gemma2:9b (drafts), llama3.2:3b (QA) |
| **Cloud AI** | Claude Opus + Sonnet | API | Strategy + code building |
| **Vector DB** | Pinecone | PC1 / Cloud | Compliance knowledge base |
| **Voice AI** | Vapi | Cloud | Outbound qualification calls |
| **Research** | Tavily + SerpAPI + Federal Register API | PC1 | Regulatory intelligence |
| **Scraping** | Apify + Crawlee | PC1 | Business verification, lead scraping |
| **Video** | Runway + ElevenLabs + Creatomate | PC1 | Faceless content machine |

---

## 8. AGENT ROUTING TABLE

| Task | Agent | Runs On | API Cost |
|------|-------|---------|----------|
| New page/component | Claude Code (Sonnet) | PC2 | Low |
| Legal reasoning | Claude Opus | API | Medium |
| Content draft | Ollama gemma2:9b | PC1 | Free (local) |
| Content QA/scoring | Ollama llama3.2:3b | PC1 | Free (local) |
| Lead qualification | Vapi AI | Cloud | Per-call |
| Regulatory research | Ollama + SerpAPI | PC1 | Low |
| Workflow generation | n8n Developer Agent | PC1 | Low |
| Social posting | Blotato + n8n | PC1 | Low |
| Newsletter | Claude + Tavily + n8n | PC1 | Low |
| Video generation | GPT-4.1 → Runway → Creatomate | PC1 | $2-5/video |

---

## 9. REPO STRUCTURE (Conversion-First, Vertical-Agnostic)

```
bizlegal-ai/
├── app/
│   ├── page.tsx                          ← Hub homepage
│   ├── agents/page.tsx                   ← AI agent add-ons (conversion: request access)
│   ├── risk-engine/page.tsx              ← Free scanner (conversion: lead capture)
│   ├── posts/[slug]/page.tsx             ← SEO articles (conversion: product CTA)
│   ├── [vertical]/                       ← NEW: vertical-specific pages
│   │   ├── page.tsx                      ← Vertical landing
│   │   ├── tools/page.tsx                ← Vertical-specific tools
│   │   └── posts/[slug]/page.tsx         ← Vertical-specific articles
│   ├── [product]/page.tsx               ← Product pages (redirect to subdomain)
│   └── ...existing pages
├── components/
│   ├── conversion/                       ← NEW: conversion-focused components
│   │   ├── StatCounterBlock.tsx          ← GritNova stat counters
│   │   ├── NumberedFeatureCard.tsx       ← GritNova 01/02/03 cards
│   │   ├── StepProcessBar.tsx           ← GritNova step connectors
│   │   ├── TrustMarquee.tsx             ← GritNova trust bar
│   │   ├── AnnouncementPill.tsx         ← GritNova live announcement
│   │   ├── RiskCalculator.tsx           ← Web3Go exchange calculator
│   │   ├── AccordionFAQ.tsx            ← Web3Go FAQ accordion
│   │   └── ThreeStepOnboarding.tsx      ← Web3Go 3-step flow
│   ├── hero/Globe.tsx                    ← 3JS regulatory globe
│   ├── layout/NavBar.tsx                 ← Unified nav
│   └── layout/Footer.tsx                 ← Unified footer
├── app/lib/
│   ├── site-content.ts                   ← BRAND TOKENS (swap for new vertical/business)
│   ├── verticals/                         ← NEW: vertical config files
│   │   ├── compliance.ts                 ← Vertical 1 config
│   │   ├── arbitrage.ts                  ← Vertical 2 config
│   │   ├── privacy.ts                    ← Vertical 3 config
│   │   └── template.ts                  ← Blank vertical template
│   └── seo-factory-experience.ts
├── lib/
│   ├── social.ts
│   └── product-urls.ts
├── CLAUDE.md                              ← WAT Framework reference
└── next.config.js                         ← Redirects, rewrites
```

### Brand Token Swap (for migration)
```
To change business entirely, edit site-content.ts:
- founderProfile.name → "New Business Name"
- founderProfile.heroSummary → new tagline
- productCards[] → new product cards
- productLinks → new subdomain URLs
- faqItems[] → new FAQ items
- socialLinks[] → new social handles
- CSS --product-accent colors → new brand palette
```

---

## 10. CONVERSION FUNNEL (Every Page Follows This)

```
1. AWARENESS: SEO article / social video → lands on /posts/[slug]
2. INTEREST: Article CTA → Free Risk Scan (/risk-engine)
3. CONSIDERATION: Risk score → Product recommendation (6 products)
4. ACTION: Product page → Start Free / Subscribe / Request Agent Access
5. RETENTION: Newsletter + regulatory alerts → repeat engagement
6. EXPANSION: Agent add-ons → upsell from BRAi/DocAI/TRACR
```

Every page must have exactly ONE primary CTA. No dead ends. No pages without conversion paths.

---

## 11. REVENUE TARGETS

| Scenario | Monthly Traffic | Monthly Revenue | Year 1 |
|----------|----------------|-----------------|--------|
| Current (broken products) | ~1,000 | $500 | $6K |
| After fixes (all products working) | ~10,000 | $30K | $360K |
| After marketing (newsletter + social) | ~50,000 | $150K | $1.8M |
| After video (faceless content machine) | ~125,000+ | $378K | $4.5M |

---

## 12. PRIORITY ACTION LIST

### P0 — BLOCKING (This Week)
1. Deploy BRAI FastAPI backend to Render (scanner is 100% fake)
2. Fix LeadForge subdomain (currently 404 — deploy under-construction page)
3. Fix TRACR footer dead anchors (legal pages exist but links are `#`)
4. Fix DocAI /generate "Loading..." stuck state
5. Remove "DorInnovations" branding from DocAI + Forge legal pages

### P1 — CRITICAL (Next Week)
6. Create 15 missing legal pages across 5 subdomains
7. Add "Back to BizLegal" top bar to all 6 subdomains
8. Fix LexAudit auth (login page is a shell)
9. Add payment checkout to LexAudit, DocAI pricing pages
10. Standardize all subdomain design to Quantum DNA + GritNova patterns

### P2 — GROWTH (Week 3-4)
11. Set up n8n on PC1 — import all SKOOL-NATE workflows
12. Deploy Outbound Lead Qualifier for compliance intake
13. Deploy Newsletter Automation for weekly regulatory brief
14. Build conversion components (StatCounterBlock, StepProcessBar, etc.)

### P3 — SCALE (Week 5-8)
15. Deploy AI Marketing Team video pipeline
16. Launch faceless video content per vertical
17. Add Vertical 2 (Cross-Border Arbitrage)
18. Add Vertical 3 (Privacy & Data Protection)

---

## 13. SKOOL-NATE INTEGRATION MAP

| Phase | Status | Next Step |
|-------|--------|-----------|
| 01 Planning (WAT + Blueprint + Lead Qualifier) | WAT in CLAUDE.md DONE | Import Lead Qualifier JSON to n8n |
| 02 Foundation (n8n + Developer Agent) | NOT STARTED | Install n8n on PC1, import Developer Agent |
| 03 AI Patterns (4 core) | NOT STARTED | Import all 4 JSON workflows |
| 04 Single Agents (8 agents) | NOT STARTED | Deploy Compliance Assistant first |
| 05 Multi-Agent (Swarms) | NOT STARTED | After Phase 4 agents are running |
| 06 Data Intelligence (Apify + Twitter) | NOT STARTED | Set up after Phase 4 |
| 07 Marketing (Newsletter + Social) | NOT STARTED | Import Newsletter Automation |
| 08 Website (Build + Deploy) | Hub DONE, subdomains broken | Fix subdomains per P0/P1 |
| 09 Automation (Marketing Team) | NOT STARTED | After Phase 7 |
| 10 Scaling | NOT STARTED | After all phases running |

---

## 14. DESIGN DECISION — QUANTUM DNA (NOT GritNova, NOT Web3Go)

**We use Quantum DNA. Period.** It's already in production, already aligned with Anti-Generic Guardrails, and already in `globals.css`. GritNova and Web3Go are reference sites for specific component inspiration (stat counters, step processes, trust marquees) — we build those patterns WITHIN Quantum DNA, not as separate systems.

### Why Quantum DNA (not GritNova or Web3Go)
1. **Already implemented** — 729 lines of CSS, live on bizlegal-ai.com
2. **Already aligned** with SKOOL-NATE Anti-Generic Guardrails (no default Tailwind, no flat shadows, display+body font pair, spring easing)
3. **Brand-consistent** — gold (#d4a853), indigo (#a5b4fc), green (#00FF94) are the brand
4. **GritNova/Web3Go are Framer templates** — they sell the same design to everyone. We're building our own.
5. **Switching would mean rewriting 60+ pages** — that's weeks of work for zero business value

### What we take from GritNova (component inspiration only)
- Stat counter animations (built in Quantum DNA style)
- Numbered feature badges (01/02/03 with `var(--gold)` accent)
- Step process connectors (Scan → Analyze → Act)
- Trust marquee (SOC 2 / GDPR / VARA logos)

### What we take from Web3Go (component inspiration only)
- Accordion FAQ (built with `glass-card` Quantum DNA styling)
- Risk calculator (built with Quantum DNA colors)
- 3-step onboarding flow (Input → Process → Results)

### What we take from 21st.dev (premium components, installed selectively)
- `animated-counter` — hero stats with count-up animation
- `shimmer-button` — primary CTAs with light sweep effect
- `marquee` — trust bar / certification logos

---

## 15. VIDEO CONTENT PIPELINE (AI-Managed, Separate from Product)

The video stream is NOT about what BizLegal sells. It's about what AI can do for compliance, risk, and regulation. It drives traffic, not product features.

### Pipeline (runs on PC1)
```
GPT-4.1 (script) → Runway (video) → ElevenLabs (voice)
→ Creatomate (render) → Blotato (distribute to IG + TikTok + YouTube)
```

### Content Topics (per vertical)
| Vertical | Hook | CTA |
|----------|------|-----|
| Compliance | "3 compliance gaps that cost companies $1M+" | Free risk scan |
| Arbitrage | "This jurisdiction loophole saves $500K" | Free report |
| Privacy | "Your website is illegal in California" | Free scan |
| Surplus Funds | "There's $50B in unclaimed property" | Free search |
| Grants | "5 government grants you don't know about" | Free report |

### Cost & Output
- **Cost:** $2-5/video, 3-5/day = $300-750/mo
- **ROI:** One viral video = thousands of free visitors
- **Runs on:** n8n AI Marketing Team workflow (already in SKOOL-NATE)

---

## 16. PRIORITY ACTION LIST (HUB ONLY)

### P0 — DONE (deployed to Vercel, commit f3c71fd)
1. ~~Fix unsubscribe link in `lib/resend.ts` (href="#")~~ DONE
2. ~~Fix BRAI invoice webhook hardcoded URL in `app/api/brai/invoice/route.ts`~~ DONE
3. ~~Fix LeadForge "Notify Me" button (no handler)~~ DONE
4. ~~Add focus-visible + active states to CSS globals~~ DONE

### P1 — IN PROGRESS (conversion improvement)
5. Install 3 premium components (animated-counter, shimmer-button, marquee) from 21st.dev
6. Build 3 custom components (StatCounterBlock, StepProcessBar, AnnouncementPill) within Quantum DNA
7. ~~Update master plan in SKOOL-NATE folder with v4~~ DONE

### P2 — LATER (subdomain fixes, separate sessions)
8. BRAI: Deploy backend, mark scanners as demo, fix legal pages (separate repo)
9. TRACR: Fix hardcoded stats (separate repo)
10. LexAudit: Fix auth + payment flow (separate repo)
11. DocAI: Fix branding + legal routes (separate repo)
12. Forge: Fix branding + social links (separate repo)
13. LeadForge: Fix subdomain resolution (Vercel config)

### P3 — INFRASTRUCTURE (n8n setup, separate from code)
14. Install n8n on PC1 (Docker)
15. Import all SKOOL-NATE workflows (8 phases)
16. Set up Trigger.dev for scheduled tasks
17. Set up Executive Assistant in Claude Code
18. Configure Vapi for lead qualification calls
19. Set up Marimo ops dashboard (AI Brian)

---

*This master plan lives at: `C:\Users\Moshe Dor\Downloads\SKOOL-NATE\BIZLEGAL-MASTER-PLAN.md`*  
*CLAUDE.md: `C:\Users\Moshe Dor\BIZLEGAL PROJECTS\bizlegal-ai\CLAUDE.md`*  
*WAT Framework: `C:\Users\Moshe Dor\Downloads\SKOOL-NATE\01_PLANNING_STRATEGY\WAT.CLAUDE (2).md`*  
*Tier 1 Blueprint: `C:\Users\Moshe Dor\Downloads\SKOOL-NATE\01_PLANNING_STRATEGY\TIER1_COMPLIANCE_RISK_AGENCY_BLUEPRINT.md`*  
*Executive Assistant: `C:\Users\Moshe Dor\Downloads\SKOOL-NATE\executive assistant\Executive Assistant Initialize Prompt.txt`*  
*Trigger.dev Reference: `C:\Users\Moshe Dor\Downloads\SKOOL-NATE\deploy project\trigger-ref.md`*  
*MCP Config: `C:\Users\Moshe Dor\Downloads\SKOOL-NATE\deploy project\mcp.json`*  
*Morning Report: `C:\Users\Moshe Dor\Downloads\SKOOL-NATE\MORNING-REPORT-APRIL14.md`*