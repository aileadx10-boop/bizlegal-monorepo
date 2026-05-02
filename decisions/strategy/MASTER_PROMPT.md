# AI Automation Society — Complete Implementation Prompt

> **Course:** 7 Day AIS Challenge (Nate Herk / AI Automation Society)  
> **Framework:** WAT (Workflows → Agents → Tools)  
> **Architecture:** Multi-vertical, conversion-focused, repo-migratable  
> **Version:** 2026-April-v4

---

## EXECUTIVE SUMMARY

This prompt contains the complete knowledge base for building AI automation systems using the Skool-Nate methodology. It covers 11 phases from planning to scaling, with ready-to-deploy n8n workflows, agent configurations, and infrastructure patterns.

**Core Philosophy:**
- AI reasons. Code executes. Never let AI do what code can do.
- Self-Improvement Loop: Broke → Fix → Verify → Update workflow → Move on.
- Build once, deploy everywhere (vertical-agnostic architecture)

---

## PHASE OVERVIEW

| Phase | Name | Status | Key Assets |
|-------|------|--------|------------|
| 01 | **Planning & Strategy** | ✅ Ready | WAT Framework, Blueprint, Lead Qualifier |
| 02 | **Foundation Infrastructure** | ✅ Ready | n8n setup, Developer Agent, Cheatsheet |
| 03 | **AI Patterns Core** | ✅ Ready | 4 Core Patterns (Chaining, Parallel, Routing, Evaluator) |
| 04 | **Single Agents** | ✅ Ready | 8 Production Agents |
| 05 | **Multi-Agent Systems** | ✅ Ready | Agent Swarms, Benefits Analysis |
| 06 | **Data Intelligence** | ✅ Ready | Apify, Twitter/X Scraper |
| 07 | **Marketing & Leads** | ✅ Ready | Newsletter, Blotato Posting |
| 08 | **Website Deployment** | ✅ Ready | Claude Code Workflow, 17 Nodes |
| 09 | **Automation Workflows** | ✅ Ready | AI Marketing Team |
| 10 | **Scaling Operations** | 📋 Planned | Expansion framework |
| 11 | **Documentation Resources** | ✅ Ready | PDFs, References, Cost Analysis |

---

## THE WAT FRAMEWORK (START HERE)

**For EVERY task, follow this sequence:**

```
1. WORKFLOW → Read workflows/[relevant].md
2. AGENT   → Choose who handles it (Claude Opus / Claude Code / Ollama / n8n)
3. TOOLS   → Execute with deterministic scripts
```

**Rule:** AI reasons. Code executes. Never let AI do what code can do.

**Self-Improvement Loop:**
```
Broke → Fix → Verify → Update workflow → Move on
```

---

## REPO STRUCTURE

```
ai-automation-society/
│
├── 📁 01_PLANNING_STRATEGY/
│   ├── WAT_FRAMEWORK.md              # Core WAT methodology
│   ├── AGENCY_BLUEPRINT.md           # Service offerings, pricing
│   ├── LEAD_QUALIFIER/
│   │   ├── Outbound_Lead_Qualifier.json    # n8n workflow
│   │   └── vapi_qualification_script.md    # AI phone call script
│   └── VERTICAL_TEMPLATES/
│       ├── compliance_risk/
│       ├── cross_border_arbitrage/
│       ├── privacy_gdpr/
│       └── [your_vertical]/
│
├── 📁 02_FOUNDATION_INFRASTRUCTURE/
│   ├── n8n/
│   │   ├── docker-compose.yml        # Self-hosted n8n setup
│   │   ├── n8n_Developer_Agent.json  # Meta-agent for building workflows
│   │   └── CHEATSHEET.md             # 17 core nodes reference
│   ├── code_snippets/
│   │   ├── ExtractInfoCode.txt       # Data extraction patterns
│   │   └── IncreaseCountCode.txt     # Loop patterns
│   └── infrastructure/
│       ├── pc1_setup.sh              # 34GB + RTX 5060 config
│       └── pc2_setup.sh              # 16GB production config
│
├── 📁 03_AI_PATTERNS_CORE/
│   ├── 01_Prompt_Chaining/
│   │   ├── workflow.json             # n8n implementation
│   │   └── examples/
│   │       ├── blog_pipeline.md
│   │       └── compliance_doc_pipeline.md
│   ├── 02_Parallelization/
│   │   ├── workflow.json
│   │   └── examples/
│   │       ├── multi_lens_risk_analysis.md
│   │       └── sentiment_parallel.md
│   ├── 03_Routing/
│   │   ├── workflow.json
│   │   └── examples/
│   │       ├── email_intake_router.md
│   │       └── compliance_inquiry_router.md
│   └── 04_Evaluator_Optimizer/
│       ├── workflow.json
│       └── examples/
│           ├── policy_quality_gate.md
│           └── content_evaluator.md
│
├── 📁 04_SINGLE_AGENTS/
│   ├── _Master_Agent/
│   │   └── Personal_Assistant_AI_Agent_2_0.json
│   ├── Communication/
│   │   ├── Email_Agent.json
│   │   └── Inbox_Management_Agent.json
│   ├── Scheduling/
│   │   └── Calendar_Agent.json
│   ├── Project_Management/
│   │   └── Projects_Agent.json
│   ├── Research/
│   │   └── Research_Agent.json
│   ├── Finance/
│   │   └── Invoice_Agent.json
│   └── Social/
│       └── LinkedIn_Agent.json
│
├── 📁 05_MULTI_AGENT_SYSTEMS/
│   ├── Agent_Swarm.json                # Coordinated threat response
│   ├── Multi_Agent_System_Benefits.json
│   └── patterns/
│       ├── orchestrator_worker.md
│       ├── publisher_subscriber.md
│       └── consensus_based.md
│
├── 📁 06_DATA_INTELLIGENCE/
│   ├── Scraping/
│   │   ├── Apify.json                  # Business verification
│   │   ├── Twitter_X_Scraper.json      # Threat intelligence
│   │   └── firecrawl_claude.md         # Website scraping guide
│   └── Processing/
│       └── data_cleaning_workflows/
│
├── 📁 07_MARKETING_LEADS/
│   ├── Newsletter/
│   │   ├── Newsletter_Automation.json
│   │   └── AI_Newsletter_System.json
│   ├── Social/
│   │   └── Blotato_Posting.json        # LinkedIn + X automation
│   └── Lead_Capture/
│       └── lead_magnets/
│
├── 📁 08_WEBSITE_DEPLOYMENT/
│   ├── CLAUDE_CODE_WORKFLOW.md         # Nate's 5-hack methodology
│   ├── WEBSITE_WORKFLOW.md             # Lead capture automation
│   ├── 17_NODES_MASTER.json            # Essential n8n nodes
│   └── templates/
│       ├── landing_page/
│       ├── saas_dashboard/
│       └── agency_site/
│
├── 📁 09_AUTOMATION_WORKFLOWS/
│   └── AI_Marketing_Team/
│       ├── AI_Marketing_Team.json      # Main orchestrator
│       ├── LinkedIn_Post.json
│       ├── Blog_Post.json
│       ├── Create_Image.json
│       ├── Edit_Image.json
│       ├── Search_Images.json
│       └── Faceless_Video.json
│
├── 📁 10_SCALING_OPERATIONS/
│   ├── multi_tenant/
│   ├── vertical_expansion/
│   └── team_onboarding/
│
├── 📁 11_DOCUMENTATION_RESOURCES/
│   ├── reactive_prompting.pdf
│   ├── agent_costs.pdf
│   ├── creatomate_template.pdf
│   └── voice_agent_vapi.pdf
│
├── 📁 EXECUTIVE_ASSISTANT/
│   ├── initialize_prompt.txt           # Claude Code second brain setup
│   ├── context/
│   │   ├── me.md
│   │   ├── work.md
│   │   ├── team.md
│   │   ├── current_priorities.md
│   │   └── goals.md
│   ├── decisions/
│   │   └── log.md
│   └── templates/
│
├── 📁 DEPLOY/
│   ├── trigger-ref.md                  # Trigger.dev v4 patterns
│   ├── mcp.json                        # MCP server config
│   └── deployment_guide.md
│
├── 📁 BRAND_ASSETS/
│   ├── quantum_dna/
│   │   ├── tokens.css
│   │   ├── typography.css
│   │   └── components/
│   ├── gritnova_patterns/              # Reference only
│   └── web3go_patterns/                # Reference only
│
└── 📁 LANDING_PAGES/
    ├── index.html
    ├── forge-v0-dark.html
    ├── forge-v1-white.html
    ├── forge-v2-green.html
    ├── forge-v3-purple.html
    └── forge-v4-crimson.html
```

---

## PHASE 01: PLANNING & STRATEGY

### WAT Framework Integration

**File:** `01_PLANNING_STRATEGY/WAT_FRAMEWORK.md`

```markdown
# WAT Framework v4

## Core Principle
AI reasons. Code executes. Never let AI do what code can do.

## Layer 1: Workflows (Instructions)
- Markdown SOPs in `workflows/`
- Define: objective, inputs, tools, outputs, edge cases
- Written like team briefings

## Layer 2: Agents (Decision-Makers)
- Read workflows
- Run tools in sequence
- Handle failures gracefully
- Ask clarifying questions
- Connect intent to execution

## Layer 3: Tools (Execution)
- Python scripts in `tools/`
- API calls, transformations, file operations
- Credentials in `.env`
- Consistent, testable, fast

## The 90% Rule
If each AI step is 90% accurate:
- 5 steps = 59% success rate
- Offload execution to deterministic scripts
- Stay focused on orchestration

## Self-Improvement Loop
1. Identify what broke
2. Fix the tool
3. Verify the fix
4. Update the workflow
5. Move on (stronger system)
```

### Agency Blueprint

**File:** `01_PLANNING_STRATEGY/AGENCY_BLUEPRINT.md`

**7 Service Offerings:**
1. Regulatory Compliance Audits
2. Risk Assessment & Mitigation
3. Policy Drafting & Review
4. Training & Certification Programs
5. Ongoing Compliance Monitoring
6. Incident Response Planning
7. Jurisdiction Arbitrage Consulting

### Lead Qualifier Setup

**File:** `01_PLANNING_STRATEGY/LEAD_QUALIFIER/setup.md`

```markdown
# Lead Qualifier Implementation

## n8n Workflow: Outbound_Lead_Qualifier.json

### Prerequisites
- n8n self-hosted on PC1
- Vapi account (voice AI)
- Google Sheets
- OpenAI API key

### Configuration
1. Import JSON into n8n
2. Replace form fields:
   - name
   - phone
   - email
   - company
   - jurisdiction
   - industry
   - risk_concern
   - budget
3. Configure Vapi AI script for compliance qualification
4. Map Google Sheets columns:
   - Risk Tier
   - Regulatory Framework
   - Urgency
   - Budget Range
   - Service Match
5. Connect to /contact form webhook

### Vapi Qualification Script
"Hello, this is [Name] from BizLegal AI. I see you're interested in 
compliance services. Let me ask a few quick questions to understand 
your needs..."
```

---

## PHASE 02: FOUNDATION INFRASTRUCTURE

### n8n Self-Hosted Setup

**File:** `02_FOUNDATION_INFRASTRUCTURE/n8n/docker-compose.yml`

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - WEBHOOK_URL=https://n8n.yourdomain.com
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
    volumes:
      - ~/.n8n:/home/node/.n8n
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:alpine
    restart: always

  postgres:
    image: postgres:15
    restart: always
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=n8n
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Developer Agent

**File:** `02_FOUNDATION_INFRASTRUCTURE/n8n/n8n_Developer_Agent.json`

Meta-agent that builds n8n workflows from natural language.

**Capabilities:**
- "Build a workflow that monitors SEC enforcement actions"
- "Create a workflow to scrape regulatory updates daily"
- "Set up lead scoring from form submissions"

### 17 Core Nodes Cheatsheet

**File:** `02_FOUNDATION_INFRASTRUCTURE/n8n/CHEATSHEET.md`

```markdown
# n8n 17 Core Nodes (2026)

## Triggers
1. Webhook - HTTP requests
2. Schedule - Cron jobs
3. Manual - Testing
4. Chat Message - Conversational

## AI/LLM
5. AI Agent - Main agent node
6. LLM Chain - Direct LLM calls
7. Chat Model - OpenAI, Anthropic, local
8. Vector Store - Pinecone, Supabase
9. Embeddings - Text vectorization

## Data
10. Code - JavaScript/Python
11. Function - Legacy (use Code)
12. Set - Modify data structure
13. Merge - Combine branches
14. Split - Conditional routing

## Apps
15. HTTP Request - APIs
16. Google Sheets - Spreadsheets
17. Telegram - Messaging

## Advanced Patterns
- Tool Workflows (modular)
- Sub-workflows (reuse)
- Error handling (Continue On Fail)
- Looping (SplitInBatches)
```

---

## PHASE 03: AI PATTERNS CORE

### Pattern 1: Prompt Chaining

**File:** `03_AI_PATTERNS_CORE/01_Prompt_Chaining/workflow.json`

**Use Case:** Compliance doc pipeline
- Step 1: Regulation Extract → Extract requirements
- Step 2: Gap Analyzer → Identify gaps
- Step 3: Remediation Writer → Write fixes
- Step 4: Google Docs → Export final

### Pattern 2: Parallelization

**File:** `03_AI_PATTERNS_CORE/02_Parallelization/workflow.json`

**Use Case:** Multi-lens risk analysis
- Branch 1: Regulatory Risk
- Branch 2: Contractual Risk
- Branch 3: Data Privacy Risk
- Aggregate: Combined Risk Score

### Pattern 3: Routing

**File:** `03_AI_PATTERNS_CORE/03_Routing/workflow.json`

**Use Case:** Intake routing
- Input: Compliance inquiry
- Route A: Regulatory Inquiry → Specialist
- Route B: Data Breach → Escalation
- Route C: Contract Review → Legal team

### Pattern 4: Evaluator-Optimizer

**File:** `03_AI_PATTERNS_CORE/04_Evaluator_Optimizer/workflow.json`

**Use Case:** Policy quality gate
- Draft → Check mandatory criteria
- If fails → Revise
- Loop until passes
- Ship final version

---

## PHASE 04: SINGLE AGENTS

### Agent Deployment Order

```
1. Compliance Assistant (central hub) ✓ FIRST
2. Email Triage + Inbox Monitor (communication)
3. Deadline Tracker (calendar)
4. Risk Register (projects)
5. Regulatory Research (research)
6. Invoice Auditor (documents)
7. Reputation Monitor (social)
```

### Master Agent (Personal Assistant 2.0)

**File:** `04_SINGLE_AGENTS/_Master_Agent/Personal_Assistant_AI_Agent_2_0.json`

**Capabilities:**
- Central query hub
- Policy lookups
- Deadline tracking
- Multi-tool orchestration

**APIs:** OpenAI, Slack, Pinecone, Google Sheets

### Communication Agents

**Email Agent:** `04_SINGLE_AGENTS/Communication/Email_Agent.json`
- Auto-classify regulatory notices
- Auto-classify audit requests

**Inbox Management Agent:** `04_SINGLE_AGENTS/Communication/Inbox_Management_Agent.json`
- Track compliance correspondence
- Flag deadlines
- Escalate urgent items

### Scheduling Agent

**Calendar Agent:** `04_SINGLE_AGENTS/Scheduling/Calendar_Agent.json`
- Audit schedules
- Filing deadlines
- Regulatory review dates

### Research Agent

**Research Agent:** `04_SINGLE_AGENTS/Research/Research_Agent.json`
- Monitor regulatory changes
- Summarize new laws
- APIs: OpenAI, SerpAPI, Federal Register

---

## PHASE 05: MULTI-AGENT SYSTEMS

### Agent Swarm

**File:** `05_MULTI_AGENT_SYSTEMS/Agent_Swarm.json`

**Use Case:** Coordinated threat response
```
Alert → Investigate → Document → Notify
```

### Multi-Agent Compliance Engine

**File:** `05_MULTI_AGENT_SYSTEMS/Multi_Agent_System_Benefits.json`

**Parallel Execution:**
- AML check
- KYC verification
- Risk scoring

All run simultaneously, results aggregated.

---

## PHASE 06: DATA INTELLIGENCE

### Scraping Setup

**Apify:** `06_DATA_INTELLIGENCE/Scraping/Apify.json`
- Business verification
- Location intelligence
- Due diligence

**Twitter/X:** `06_DATA_INTELLIGENCE/Scraping/Twitter_X_Scraper.json`
- Threat intelligence
- Sentiment analysis
- Brand risk monitoring

---

## PHASE 07: MARKETING & LEADS

### Newsletter Automation

**Files:**
- `07_MARKETING_LEADS/Newsletter/Newsletter_Automation.json`
- `07_MARKETING_LEADS/Newsletter/AI_Newsletter_System.json`

**Schedule:** Weekly regulatory intelligence brief
**Process:**
1. Auto-draft (Tavily + Claude)
2. Human review
3. Send via Resend

### Social Posting

**File:** `07_MARKETING_LEADS/Social/Blotato_Posting.json`

**Platforms:** LinkedIn + X
**Content:** Compliance thought leadership
**Schedule:** Automated posting

---

## PHASE 08: WEBSITE DEPLOYMENT

### Claude Code Workflow

**File:** `08_WEBSITE_DEPLOYMENT/CLAUDE_CODE_WORKFLOW.md`

**Nate's 5-Hack Methodology:**

#### Hack #0: Create claude.md
```markdown
# Claude.md — Project Rules

## Core Rules
- Always invoke frontend-design skill before writing front-end code
- Use brand_assets/ folder
- Follow brand guidelines (colors, typography, tone)
- Test on localhost before pushing to GitHub

## Screenshot Workflow
- After building, take screenshots with Puppeteer
- Review and polish with 2-pass comparison
- Name descriptively (hero-v1.png, stats-v2.png)

## Deployment Rules
- All changes tested on localhost first
- Only push to GitHub when explicitly told
- Never push incomplete/broken code
```

#### Hack #1: Install Frontend-Design Skill
```bash
claude skill install frontend-design
claude skill enable frontend-design
```

#### Hack #2: Screenshot Loop (Self-Correction)
- Build → Screenshot → Review → Polish → Repeat
- Bridges 60% → 95%+ automatically
- Uses Puppeteer for headless screenshots

#### Hack #3: Clone Websites
1. Find inspiration (Dribbble, Godly, Awwwards)
2. Capture full-page screenshot (DevTools)
3. Copy CSS/style code
4. Prompt: "Clone this website" + screenshot + code

#### Hack #4: Add Individual Components
- Source: 21st.dev
- Copy component code
- "Work this in behind hero text"
- Disable screenshot loop for animations

#### Hack #5: Deploy Workflow
```
Claude Code → GitHub → Vercel
```

### 17 Nodes Reference

**File:** `08_WEBSITE_DEPLOYMENT/17_NODES_MASTER.json`

Essential n8n nodes for website automation.

---

## PHASE 09: AUTOMATION WORKFLOWS

### AI Marketing Team

**Main Orchestrator:** `09_AUTOMATION_WORKFLOWS/AI_Marketing_Team/AI_Marketing_Team.json`

**Sub-Workflows:**
- LinkedIn_Post.json
- Blog_Post.json
- Create_Image.json
- Edit_Image.json
- Search_Images.json
- Faceless_Video.json

**Pipeline:**
```
GPT-4.1 (script) → Runway (video) → ElevenLabs (voice)
→ Creatomate (render) → Blotato (distribute)
```

**Cost:** $2-5/video, 3-5/day
**ROI:** One viral video = thousands of free visitors

---

## PHASE 10: SCALING OPERATIONS

### Multi-Tenant Setup

**Architecture:**
- Single codebase
- Multiple clients
- Isolated data
- Shared infrastructure

### Vertical Expansion

**Migration Pattern:**
```
1. Swap brand tokens in site-content.ts
2. Swap product cards
3. Swap CSS custom properties
4. Swap Supabase table references
5. Swap n8n workflow topics
6. Deploy — same code, new business
```

---

## PHASE 11: DOCUMENTATION RESOURCES

### Cost Analysis

**Agent Costs (from Marketing_Team_Agent_Costs.pdf):**

| Task | Agent | Cost |
|------|-------|------|
| New page/component | Claude Code | Low |
| Legal reasoning | Claude Opus | Medium |
| Content draft | Ollama gemma2:9b | Free (local) |
| Content QA | Ollama llama3.2:3b | Free (local) |
| Lead qualification | Vapi AI | Per-call |
| Video generation | GPT-4.1→Runway | $2-5/video |

### Reactive Prompting

**File:** `11_DOCUMENTATION_RESOURCES/Mastering_Reactive_Prompting.pdf`

Techniques for dynamic AI agent conversations.

---

## EXECUTIVE ASSISTANT SETUP

**File:** `EXECUTIVE_ASSISTANT/initialize_prompt.txt`

**Claude Code Second Brain:**

```
CLAUDE.md          → Main brain file
context/
  me.md           → Your profile
  work.md         → Business details
  team.md         → Team structure
  current-priorities.md → Focus areas
  goals.md        → Quarterly goals
decisions/
  log.md          → Append-only decisions
templates/        → Reusable outputs
projects/         → Active workstreams
```

**Installation:**
1. Create folder structure
2. Populate context files
3. Reference in CLAUDE.md
4. Claude Code reads entire context on startup

---

## DEPLOYMENT (Trigger.dev)

**File:** `DEPLOY/trigger-ref.md`

**Scheduled Tasks:**
```typescript
// Daily SEO generation (06:00 UTC)
schedules.task({
  id: "daily-seo",
  cron: "0 6 * * *",
  run: async () => { /* ... */ }
});

// Weekly newsletter (Friday 8am)
schedules.task({
  id: "weekly-newsletter",
  cron: "0 8 * * 5",
  run: async () => { /* ... */ }
});

// Regulatory monitoring (every 8hrs)
schedules.task({
  id: "regulatory-monitor",
  cron: "0 */8 * * *",
  run: async () => { /* ... */ }
});
```

**Pattern:** Orchestrator + Processor
- Orchestrator: Lightweight check task
- Processor: Heavy work task
- Idempotency keys prevent duplicates

---

## QUICK START CHECKLIST

### Day 1: Planning
- [ ] Download all Skool assets
- [ ] Set up folder structure
- [ ] Import WAT Framework
- [ ] Review Agency Blueprint

### Day 2: Foundation
- [ ] Install n8n on PC1 (Docker)
- [ ] Import n8n Developer Agent
- [ ] Configure OpenAI/Anthropic keys
- [ ] Set up Google Sheets

### Day 3: AI Patterns
- [ ] Import 4 core pattern workflows
- [ ] Customize for your use case
- [ ] Test each pattern

### Day 4: Single Agents
- [ ] Deploy Compliance Assistant first
- [ ] Add Email Triage
- [ ] Add Calendar Agent

### Day 5: Multi-Agent
- [ ] Set up Agent Swarm
- [ ] Configure parallel processing

### Day 6: Marketing
- [ ] Import Newsletter Automation
- [ ] Set up Blotato posting

### Day 7: Deploy
- [ ] Build website with Claude Code
- [ ] Deploy to Vercel
- [ ] Set up Trigger.dev schedules

---

## COST BREAKDOWN

### Infrastructure (Monthly)
- Vercel Pro: $20
- Supabase Pro: $25
- Render (FastAPI): $7
- n8n self-hosted: $0 (on PC1)
- **Total: ~$52/month**

### AI APIs (Variable)
- OpenAI: $20-100
- Anthropic: $20-100
- Vapi: Per-call (~$0.05/min)
- Tavily: $20
- **Total: ~$60-240/month**

### Video Pipeline (Optional)
- Runway: $28
- ElevenLabs: $5
- Creatomate: $15
- Blotato: $20
- **Total: ~$68/month** (for 20-30 videos)

**Grand Total: ~$180-360/month** (for full operation)

---

## REVENUE TARGETS

| Phase | Monthly Traffic | Revenue | Year 1 |
|-------|-----------------|---------|--------|
| Foundation | 1,000 | $500 | $6K |
| Agents Working | 10,000 | $30K | $360K |
| Marketing On | 50,000 | $150K | $1.8M |
| Video Machine | 125,000+ | $378K | $4.5M |

---

## SUPPORT & RESOURCES

- **Skool Community:** skool.com/ai-automation-society
- **Claude Code:** anthropic.com/claude-code
- **n8n Docs:** docs.n8n.io
- **Trigger.dev:** trigger.dev/docs

---

*Generated from SKOOL-NATE course materials*  
*Framework: WAT v4*  
*Last Updated: April 2026*
