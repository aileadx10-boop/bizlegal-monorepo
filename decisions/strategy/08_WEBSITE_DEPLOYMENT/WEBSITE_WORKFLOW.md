# 🌐 WEBSITE WORKFLOW — n8n Master Automation

> Built from Nate Herk's "17 Nodes to Master" — Adapted for Website/Business Automation

---

## 📋 WORKFLOW OVERVIEW

This is a **comprehensive website automation workflow** that handles everything from **scheduled content publishing** to **real-time lead capture**, **AI-powered responses**, **data storage**, and **external API integrations** — all orchestrated through n8n's 17 core nodes.

---

## 🏗️ COMPLETE WORKFLOW ARCHITECTURE

### PHASE 1: ⏰ TRIGGERS (Entry Points)

#### 1. **Schedule Trigger** — Automated Recurring Tasks
- **Purpose**: Run workflows on fixed times/intervals
- **Website Use Cases**:
  - Daily content backups
  - Weekly analytics reports
  - Monthly SEO audits
  - Scheduled social media posting
  - Database cleanup/maintenance
- **Setup**: CRON expressions or fixed intervals (every minute/hour/day/week)
- **Best Practice**: Use conditional IF nodes with frequent triggers for dynamic scheduling

#### 2. **Event Triggers** — Real-Time Reactions
- **Gmail Trigger**: New email → auto-parse, reply, log to database
- **Slack Trigger**: New message → notify team, log ticket, trigger response
- **Website Use Cases**:
  - New inquiry email → auto-respond + log to CRM
  - Support ticket in Slack → create task + notify dev team
  - Payment notification → update order status + send receipt

#### 12. **Webhook Node** — Custom API Endpoints
- **Purpose**: Receive data from ANY external app/service
- **Website Use Cases**:
  - Custom contact form submissions
  - Payment gateway callbacks (Stripe, PayPal)
  - Third-party app notifications
  - IoT device data ingestion
  - CRM/ERP system updates
- **Setup**: Custom URL + HTTP method (POST/GET) + optional auth
- **Test/Production URLs**: Test during build, production when live

---

### PHASE 2: 🔄 DATA PROCESSING & CONTROL FLOW

#### 3. **IF Node** — Conditional Branching
- **Purpose**: Route data based on conditions
- **Website Use Cases**:
  - IF lead score > 80 → send to sales team
  - IF email contains attachment → download + process
  - IF payment failed → trigger retry workflow
  - IF user is VIP → priority support route

#### 4. **Switch Node** — Multi-Path Routing
- **Purpose**: Route to multiple paths based on rules/expressions
- **Website Use Cases**:
  - Route inquiries by department (Sales/Support/Billing)
  - Categorize content by type (Blog/Video/Podcast)
  - Segment users by tier (Free/Pro/Enterprise)

#### 5. **Set Node** — Data Transformation
- **Purpose**: Create, rename, map, or modify fields
- **Website Use Cases**:
  - Normalize incoming form data
  - Add timestamps, IDs, status flags
  - Transform API responses into consistent format
  - Prepare payloads for downstream nodes

#### 6. **Split Out / Split in Batches** — Data Division
- **Split Out**: Expand arrays into individual items
  - Process each row from a spreadsheet separately
  - Handle multiple attachments from one email
- **Split in Batches**: Process large datasets in chunks
  - Send 500 emails without hitting rate limits
  - Scrape 1000 URLs in batches of 50
  - Avoid API bans with controlled batch sizes

#### 11. **Loop Over Items** — Controlled Iteration
- **Purpose**: Process items one-by-one or in batches with loop-back
- **Website Use Cases**:
  - Send bulk emails with rate limiting (e.g., 10/min)
  - Scrape paginated results until no more data
  - Process 500 form submissions with error handling
- **Best Practice**: Use Wait nodes between iterations to throttle requests
- **Exit Condition**: Finite item list or explicit break condition

---

### PHASE 3: 🤖 AI & INTELLIGENCE

#### 14. **AI Agent (LLM)** — Autonomous Reasoning Engine
- **Purpose**: Connect to GPT-4o, Claude, Gemini + memory + tool use
- **Website Use Cases**:
  - **Conversational Assistant**: Answer visitor questions via chat widget
  - **Content Generator**: Write blog posts, product descriptions, emails
  - **Data Analyst**: Analyze form submissions, user feedback, reviews
  - **Lead Qualifier**: Score leads based on conversation context
  - **Support Agent**: Auto-resolve tickets, escalate complex issues
- **Setup**:
  1. Attach chat model (OpenAI, Anthropic, Gemini)
  2. Connect tool sub-nodes (APIs, databases, apps)
  3. Configure memory (conversation history/vector store)
  4. Craft system prompt with role, instructions, output format

#### 15. **Agent Tools** — AI's "Hands" for Action
- **Purpose**: Give AI Agent ability to perform real-world actions
- **Website Tool Examples**:
  - **Send Email Tool**: Auto-reply to inquiries
  - **Research Tool**: Web search or API lookup
  - **Document Creation Tool**: Generate proposals, invoices
  - **Database Tool**: Log data to Google Sheets/Airtable
  - **Trigger Sub-Workflow**: Call complex n8n routines
- **Best Practice**: Describe each tool in system prompt with when/how to use

#### 16. **Structured Output Parser** — Reliable JSON from AI
- **Purpose**: Force LLM to output precise JSON structures
- **Website Use Cases**:
  - Extract multiple fields from user feedback (sentiment, category, priority)
  - Generate product listings with consistent schema
  - Parse complex research into structured reports
  - Create FAQ arrays from documentation
- **Setup**:
  1. Enable "Require Specific Output Format" in AI node
  2. Attach Structured Output Parser
  3. Define schema manually or generate from JSON example
  4. Downstream nodes consume predictable output

---

### PHASE 4: 📊 DATA STORAGE & INTEGRATION

#### 17. **Google Sheets** — Cloud Database & Dashboard
- **Purpose**: Read, write, append, update, delete rows
- **Website Use Cases**:
  - **Lead Logging**: Store every form submission with status tracking
  - **Content Calendar**: Manage blog/video publishing schedule
  - **Analytics Dashboard**: Log metrics, generate weekly reports
  - **CRM Lite**: Track customer interactions, follow-ups, deal stages
  - **Audit Trail**: Record all automation actions for compliance
- **Operations**:
  - Append Row: Log new entries
  - Update Row: Change status (pending → processed → complete)
  - Read Sheet: Fetch data for reports or conditional processing
  - Lookup: Find specific row by key (email, ID) for updates
- **Best Practice**: Always use unique key column for reliable updates

---

### PHASE 5: 🌍 EXTERNAL INTEGRATIONS

#### 7. **HTTP Request** — Universal API Connector
- **Purpose**: Make GET/POST/PUT/DELETE requests to any API
- **Website Use Cases**:
  - Fetch data from SaaS platforms (Stripe, Shopify, HubSpot)
  - Send data to webhooks, Zapier, Make.com
  - Query external databases or microservices
  - Download/upload files from cloud storage
- **Best Practice**: Use pagination handling, error retries, auth headers

#### 8. **HTML Extraction** — Web Scraping
- **Purpose**: Parse web pages and extract specific elements
- **Website Use Cases**:
  - Competitor price monitoring
  - Industry news aggregation
  - Lead generation from directories
  - Monitor regulatory changes on government sites
- **Best Practice**: Use CSS selectors, handle pagination, respect rate limits

#### 9. **Date & Time** — Scheduling & Calculation
- **Purpose**: Manipulate, compare, format dates
- **Website Use Cases**:
  - Calculate days until deadline
  - Schedule follow-ups (e.g., 7 days after sign-up)
  - Convert timezones for global teams
  - Track content expiration dates

---

### PHASE 6: ⚡ ADVANCED PATTERNS

#### 10. **Merge Node** — Data Combination
- **Purpose**: Combine data from multiple branches
- **Website Use Cases**:
  - Merge lead data from multiple sources (form + LinkedIn + email)
  - Combine analytics from Google + social media
  - Unite customer data from CRM + support tickets + billing

#### 13. **Respond to Webhook** — Two-Way API Communication
- **Purpose**: Send custom HTTP response back to webhook caller
- **Website Use Cases**:
  - Return "Thank You" message after form submission
  - Send JSON response with processed data
  - Redirect user to confirmation page
  - Return calculation/validation results instantly
- **Response Types**: JSON, text, redirect, custom status codes, headers

---

## 🔄 COMPLETE WEBSITE WORKFLOW EXAMPLE

### Scenario: Automated Lead Capture → AI Qualification → CRM Update → Follow-Up

```
┌─────────────────────────────────────────────────────────────┐
│                     WEBSITE WORKFLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. WEBHOOK (POST) ← Custom Contact Form on Website        │
│         ↓                                                   │
│  2. SET NODE → Normalize data, add timestamp, lead ID       │
│         ↓                                                   │
│  3. GOOGLE SHEETS → Append new lead to "Leads" sheet        │
│         ↓                                                   │
│  4. AI AGENT (LLM) → Qualify lead based on responses        │
│     ├── Tool: Google Sheets (lookup company info)           │
│     ├── Tool: HTTP Request (enrich with Clearbit API)       │
│     └── Structured Output → {score, tier, next_action}      │
│         ↓                                                   │
│  5. IF NODE → Route by score                                │
│     ├── High Score (80+):                                   │
│     │    → Slack notification to sales team                 │
│     │    → Gmail: Send priority follow-up email             │
│     │    → Google Sheets: Update status = "Hot Lead"        │
│     │                                                       │
│     ├── Medium Score (40-79):                               │
│     │    → Email: Send nurture sequence                      │
│     │    → Google Sheets: Update status = "Nurturing"       │
│     │    → Schedule Trigger: Follow-up in 7 days            │
│     │                                                       │
│     └── Low Score (<40):                                    │
│          → Email: Send general info pack                     │
│          → Google Sheets: Update status = "Cold Lead"       │
│                                                             │
│  6. RESPOND TO WEBHOOK → Return success to website form     │
│     {status: "received", message: "We'll contact you soon"} │
│                                                             │
│  7. SCHEDULE TRIGGER (Weekly) → Analytics Report            │
│     → Google Sheets: Read all leads                         │
│     → AI Agent: Generate weekly summary                     │
│     → Gmail: Email report to team                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 DEPLOYMENT CHECKLIST

```
□ Install n8n (self-hosted or cloud)
□ Connect Google account (OAuth for Sheets)
□ Connect Gmail account
□ Connect Slack workspace
□ Set up OpenAI/Anthropic API key
□ Create Google Sheet with columns:
  - Lead ID | Name | Email | Company | Score | Status | Timestamp
□ Create Webhook endpoint on website form
□ Configure AI Agent system prompt for lead qualification
□ Set up Structured Output Parser schema
□ Test with sample form submission
□ Activate workflow
□ Monitor first few runs for accuracy
□ Set up error handling & notifications
```

---

## 🎯 ADVANCED WORKFLOW VARIATIONS

### Variation A: **Content Publishing Pipeline**
```
Schedule Trigger → AI Agent (generate content) → 
Structured Output → Google Sheets (content calendar) → 
HTTP Request (post to WordPress/CMS) → 
Slack (notify team) → 
Webhook response (log success)
```

### Variation B: **Customer Support Automation**
```
Gmail Trigger → AI Agent (classify + respond) → 
IF Node (complex? → human escalation) → 
Google Sheets (log ticket) → 
Slack (notify team) → 
Merge (combine with customer history)
```

### Variation C: **E-Commerce Order Processing**
```
Webhook (Stripe payment) → Set (extract order data) → 
Google Sheets (log order) → 
AI Agent (generate receipt + recommendations) → 
Gmail (send to customer) → 
HTTP Request (update inventory API) → 
Schedule Trigger (daily sales report)
```

---

## 💡 BEST PRACTICES SUMMARY

| Node | Key Tip |
|------|---------|
| Schedule Trigger | Use IF node for dynamic scheduling logic |
| Webhook | Always test with test URL first |
| AI Agent | Craft detailed system prompts with role + format |
| Structured Output | Generate schema from JSON example for speed |
| Google Sheets | Always use unique key column for updates |
| Loop Over Items | Add Wait nodes to respect rate limits |
| HTTP Request | Handle pagination and errors explicitly |
| Merge | Combine data before final processing step |
| Split in Batches | Use for large datasets to avoid timeouts |
| Set | Normalize all incoming data immediately |

---

## 🔗 NODE REFERENCE QUICK TABLE

| # | Node | Type | Primary Function |
|---|------|------|------------------|
| 1 | Schedule Trigger | Trigger | Time-based automation |
| 2 | Event Trigger | Trigger | Real-time app events |
| 3 | IF | Control | Conditional branching |
| 4 | Switch | Control | Multi-path routing |
| 5 | Set | Data | Field transformation |
| 6 | Split Out/Batches | Data | Array expansion/batching |
| 7 | HTTP Request | Integration | API calls |
| 8 | HTML Extract | Integration | Web scraping |
| 9 | Date & Time | Data | Date manipulation |
| 10 | Merge | Data | Combine branches |
| 11 | Loop Over Items | Control | Iteration with loop-back |
| 12 | Webhook | Trigger | Custom API endpoint |
| 13 | Respond to Webhook | Integration | HTTP response |
| 14 | AI Agent (LLM) | AI | Autonomous reasoning |
| 15 | Agent Tools | AI | Action execution |
| 16 | Structured Output | AI | JSON parsing |
| 17 | Google Sheets | Storage | Cloud database |

---

> **Source**: Nate Herk's "17 Nodes to Master" — n8n Cheatsheet 2026
> **Adapted For**: Website & Business Automation
> **Next Step**: Import into n8n and customize for your specific use case
