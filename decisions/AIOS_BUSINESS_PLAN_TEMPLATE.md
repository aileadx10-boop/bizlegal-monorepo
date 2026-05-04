# AIOS Business Plan — Generic Template

**Built from:** Nate Herk's AIOS Framework (3 Ms + 4 Cs) + WAT Architecture
**Design:** Copy this file, replace `[brackets]`, and you have a complete business plan.
**Niche-agnostic:** Works for compliance, legal, health, real estate, fintech — any vertical.

---

## 0 — The Core Engine (what you're actually building)

You are not building "AI agents." You are building an **AI Operating System (AIOS)** for `[target niche]` — a system that Context-knows the domain, Connections-reaches the tools, Capabilities-executes the work, and Cadence-runs without being asked.

```
┌──────────────────────────────────────────────────────────┐
│                    YOUR AIOS                             │
│                                                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│   │ CONTEXT  │→ │CONNECTIONS│→ │CAPABILITY│→ │CADENCE │ │
│   │ Knows    │  │ Reaches  │  │ Does     │  │ Runs   │ │
│   └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│                                                          │
│   Revenue: [$/mo per client] × [clients] = [$]          │
│   Delivery: [hours saved per client per week]            │
└──────────────────────────────────────────────────────────┘
```

---

## 1 — The Product (what you sell)

### Tier 1: Diagnostic / Audit ($[500-2,000] one-time)
The 4-Cs Assessment:
- **Context audit:** How much does the client's AI know about their business? Score 0-10.
- **Connections audit:** What's actually wired up? Calendar, email, CRM, tasks — or none?
- **Capability audit:** What manual processes exist that could be automated?
- **Cadence audit:** Does anything run without a human asking?

**Output:** Scorecard + Priority Map (which floor to build first)

### Tier 2: Foundation Build ($[3,000-8,000] setup + $[500-2,000]/mo)
Build Floors 1-3 of the AIOS:
- **Context layer:** CLAUDE.md, about-business.md, about-me.md, priorities.md, decisions/ archive
- **Connections layer:** `.env` setup, API integrations (calendar, email, CRM, tasks), reference docs
- **Capability layer:** 3-5 custom skills (see Section 3), WAT workflows

**Output:** Running AIOS with 3-5 production skills

### Tier 3: Full Autonomy ($[10,000-25,000] setup + $[2,000-5,000]/mo)
All 4 floors including Cadence:
- Everything in Tier 2
- **Cadence layer:** Routines (cloud), scheduled tasks, cron jobs, loop skills
- Karpathy Wiki pipeline (knowledge management)
- Artifacts dashboards for monitoring
- Monthly optimization pass

**Output:** Fully autonomous AIOS — laptop closed, work happens

---

## 2 — The Methodology (how you sell)

### The 3 Ms of Selling (from Nate's framework)

**M1 — Mindset:** You're not selling AI agents. You're selling `[outcome: e.g. "compliance without headcount" / "5x content output" / "zero missed follow-ups"]`.

**M2 — Method:** Use the constraint questions (from the 3 Ms):
- *"If 500 new clients showed up tomorrow, what would break first?"* → Bottleneck = your sale
- *"What would give you 500 more clients tomorrow?"* → Growth lever = your upsell

Run every opportunity through **EAD** (Eliminate → Automate → Delegate):
- Can they eliminate the problem entirely? (No sale needed.)
- Can they automate it? (Your service.)
- Must they delegate to a human? (Referral opportunity.)

**M3 — Machine:** Your delivery system IS the product. You build AIOS with AIOS.

### Pricing psychology (from Nate's $231k in 30 days)
| What NOT to do | What TO do |
|---|---|
| Sell by the hour | Sell by the outcome |
| Price per agent | Price per solution |
| Quote flat rates without discovery | Quote after 4-Cs Assessment |
| Charge for setup only | Charge setup + recurring (predictable MRR) |

### The 5 automations businesses actually pay for (from Nate's research)
1. **Revenue operations** — lead gen, outreach, follow-up sequencing
2. **Content operations** — writing, publishing, repurposing, distribution
3. **Customer operations** — onboarding, support triage, FAQ, retention
4. **Knowledge operations** — documentation, wiki, training materials
5. **Compliance operations** — monitoring, reporting, deadline tracking

---

## 3 — The WAT System (how you deliver)

### Directory Structure (copy this for every client)

```
[client-name]-aios/
├── .claude/
│   ├── skills/
│   │   ├── [skill-1]/skill.md
│   │   ├── [skill-2]/skill.md
│   │   └── [skill-3]/skill.md
│   └── agents/
├── context/
│   ├── about-business.md
│   ├── about-me.md
│   ├── priorities.md
│   └── CLAUDE.md
├── decisions/
├── references/
│   ├── [crm]-api.md
│   ├── [email]-api.md
│   └── [calendar]-api.md
├── workflows/          # Markdown SOPs
├── tools/              # Deterministic scripts
├── wiki/               # Karpathy-style knowledge base
│   ├── raw/            # Source documents
│   └── wiki/           # Organized, cross-linked
├── .env                # API keys (NEVER committed)
└── connections.md
```

### Delivery Workflow (W1 — Onboard)

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Discovery│   │ Context  │   │ Connect  │   │ Build    │   │ Cadence  │
│ (4-Cs    │→  │ Build    │→  │ APIs     │→  │ Skills   │→  │ Setup    │
│  Assess) │   │ CLAUDE.md│   │ .env +   │   │ 3-5 WAT  │   │ Routines │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
  2 days          1 day         1-2 days       3-5 days       1-2 days
  $500-2K         included       included       included       included
```

### Skill Building Pattern (W2 — Author a Skill)

Every skill follows the same template:

```yaml
---
name: [skill-name]
description: [what it does, when to invoke]
---
## Goal
[what the skill accomplishes]

## Steps
1. [step 1: what to do]
2. [step 2: what to do]
3. [step 3: what to do]

## Reference files
../references/[api-doc].md

## Rules
- [guardrail 1: what NOT to do]
- [guardrail 2: edge case handling]

## Self-improvement
- If [failure mode] occurs → update [section]
```

### The 6 Best Skills to Build First (from Nate's research)
1. **Onboarding skill** — /onboard: Sets up context files, runs first-time config
2. **Audit skill** — /audit: Scans for stale docs, missing connections, broken workflows
3. **Research skill** — /research: Web search + summarize + save to wiki
4. **Content skill** — /write [brief]: Generates, formats, publishes content
5. **CRM skill** — /sync: Pulls tasks, updates records, flags priorities
6. **Report skill** — /report [scope]: Generates status reports from live data

---

## 4 — The Tool Stack (deterministic execution)

### Core Tools
| Tool | Purpose | Setup |
|---|---|---|
| **Claude Code** | Primary orchestrator | VS Code extension + CLI |
| **GWS CLI** | Google Workspace (Drive, Mail, Calendar) | Google Cloud Console OAuth |
| **API Reference Docs** | Connection to every external service | `.env` + `references/*.md` |
| **.env vault** | All secrets, never in code | One file per client |
| **MCP servers** | Only when API can't do it | Configured per-client |

### Cadence Tools
| Tool | When it runs | Purpose |
|---|---|---|
| **Claude Routines** | Cloud, no laptop needed | Daily priorities, inbox scan, summary |
| **Scheduled Tasks** | Desktop, app must be open | Heavy processing, batch operations |
| **Loop skill** | Per-session, 3-day expiry | Continuous operations |
| **Cron** | Time-based triggers | Schedules, reminders, reports |
| **Karpathy Wiki** | On-demand | Knowledge management, query without RAG |

### Pricing Calculator (per client)
| Item | Cost | Notes |
|---|---|---|
| Claude Code subscription | $20/mo | Per seat |
| API usage (Anthropic, OpenAI, etc.) | $50-200/mo | Varies by volume |
| GWS CLI | Free | Open source |
| Hosting (if needed) | $5-20/mo | Vercel, Railway, etc. |
| **Total cost per client** | **$75-240/mo** | |
| **Revenue per client** | **$500-5,000/mo** | Tier-dependent |
| **Gross margin** | **85-95%** | |

---

## 5 — Business Operations

### Client Acquisition Funnel
```
Discovery Call (free, 30 min)
  → Apply EAD / constraint questions
  → Identify 2-3 bottlenecks
  ↓
4-Cs Assessment ($500-2,000)
  → Full audit across all 4 floors
  → Scorecard + Priority Map
  ↓
Proposal (free)
  → Tier 1, 2, or 3 recommendation
  → Timeline + pricing
  ↓
Build ($3,000-25,000 setup)
  → W1 Onboard workflow
  → W2 Skill authoring
  ↓
Retain ($500-5,000/mo)
  → Monthly optimization
  → New skills as needed
  → Kill Switch review
```

### MRR Stacking Model
| Month | New Clients | One-time Revenue | MRR Added | Total MRR |
|---|---|---|---|---|
| 1 | 1-2 | $5,000-15,000 | $1,000-4,000 | $1,000-4,000 |
| 2 | 1-2 | $5,000-15,000 | $1,000-4,000 | $2,000-8,000 |
| 3 | 2-3 | $10,000-40,000 | $2,000-10,000 | $4,000-18,000 |
| 6 | 3-5 | $20,000-75,000 | $5,000-20,000 | $15,000-50,000 |
| 12 | 5-10 | $50,000-200,000 | $15,000-50,000 | $50,000-200,000 |

### When to Invoke the Kill Switch
- Client automation costs more to run than it generates in value
- Maintenance > 20% of build time per month
- Client can't provide access to connections (no API keys, no permissions)
- AI accuracy consistently below 70% on key decisions

---

## 6 — Adding Verticals (the copy-paste mechanism)

### Vertical Expansion Pattern
To add a new niche, copy this entire plan and replace:

1. **`[target niche]`** everywhere → e.g. "real estate" → "healthcare" → "fintech"
2. **Skills list** → swap for vertical-specific automations
3. **Reference docs** → new external service APIs for that vertical
4. **Context templates** → domain-specific about-business, priorities
5. **Pricing** → adjust for vertical willingness-to-pay

### Example Vertical: Compliance (BizLegal AI)
```
┌──────────────────────────────────────────────────────────┐
│ CONTEXT:  Compliance regulations, client legal history   │
│ CONNECTIONS: Supabase, payment gateways, email, calendar │
│ CAPABILITY: BOI filing, DPA negotiation, risk scoring    │
│ CADENCE: Monthly compliance reports, deadline alerts     │
│ PRICING: $99-299/mo per product, enterprise $2K+/mo     │
└──────────────────────────────────────────────────────────┘
```

### Example Vertical: Real Estate
```
┌──────────────────────────────────────────────────────────┐
│ CONTEXT:  Property listings, market data, client pref's  │
│ CONNECTIONS: MLS, CRM, calendar, email, DocuSign         │
│ CAPABILITY: Lead response, listing gen, showing coord    │
│ CADENCE: Daily lead digest, weekly market report         │
│ PRICING: $500-2,000/mo per agent/team                    │
└──────────────────────────────────────────────────────────┘
```

### Example Vertical: Healthcare Practice
```
┌──────────────────────────────────────────────────────────┐
│ CONTEXT:  Practice protocols, insurance panels, patients │
│ CONNECTIONS: EHR, billing, calendar, telehealth platform │
│ CAPABILITY: Intake automation, follow-up, claims check   │
│ CADENCE: Daily schedule prep, weekly utilization report  │
│ PRICING: $1,000-3,000/mo per provider                    │
└──────────────────────────────────────────────────────────┘
```

---

## 7 — The One-Page Decision Matrix

| Client Question | Your Answer |
|---|---|
| "What do you do?" | I build AI Operating Systems that make your business run without you. |
| "How is this different from AI agents?" | Agents are point solutions. An AIOS is the whole stack — it knows your business, reaches your tools, does the work, and runs on its own. |
| "How much does it cost?" | Starts with a diagnostic ($500-2K). Full build is $3K-25K, then $500-5K/mo. |
| "What's the ROI?" | 5-20x in year one. We only build what maps to a KPI (more customers, more value, less cost). |
| "What if it doesn't work?" | Kill Switch clause — if it costs more to maintain than it saves, we tear it down. No sunk cost. |
| "How long does it take?" | 1-2 weeks to first working skill. Full AIOS in 4-6 weeks. |
| "What do I need to give you?" | Access. API keys. 2 hours of your time for context building. That's it. |

---

## 8 — Fast-Start Checklist (first 7 days)

- [ ] Pick one niche (don't try to serve all verticals at once)
- [ ] Build your own AIOS first (dogfood your product)
- [ ] Create 3 reference skills: /onboard, /audit, /research
- [ ] Run the 4-Cs Assessment on yourself (score your own AIOS)
- [ ] Set up your own Cadence (routines, cron, loop)
- [ ] Find one client willing to be your first build
- [ ] Document everything in workflows/ (this becomes your IP)
- [ ] Price your first Tier 1 Assessment at $500 (raise to $2K after 3 clients)

---

*Generated from: Nate Herk AIOS Framework (3 Ms + 4 Cs) + WAT Architecture (Workflows/Agents/Tools)*
*Last updated: 2026-05-04*
