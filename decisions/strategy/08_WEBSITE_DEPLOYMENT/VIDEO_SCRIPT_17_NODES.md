# 🎬 VIDEO SCRIPT: "Master n8n With These 17 Nodes"

> Based on Nate Herk's n8n Cheatsheet 2026
> Video URL: https://www.youtube.com/watch?v=86HM0RUWhCk
> Format: Tutorial / Educational

---

## 📋 SCRIPT STRUCTURE

| Section | Duration | Content |
|---------|----------|---------|
| Intro | 0:00-0:45 | Hook + Overview |
| Nodes 1-3 | 0:45-3:30 | Triggers & Sub-workflows |
| Nodes 4-6 | 3:30-6:00 | Data Processing |
| Nodes 7-9 | 6:00-8:30 | Integrations |
| Nodes 10-11 | 8:30-10:30 | Advanced Control |
| Nodes 12-13 | 10:30-12:30 | Webhooks |
| Nodes 14-16 | 12:30-16:00 | AI & Intelligence |
| Node 17 | 16:00-18:00 | Google Sheets |
| Outro | 18:00-19:00 | CTA + Summary |

---

## 🎥 FULL SCRIPT

---

### 🎬 INTRO (0:00 - 0:45)

**[ON SCREEN: n8n logo + title "Master n8n With 17 Nodes"]**

**NARRATOR (Voiceover):**
> "If you want to master n8n, you don't need to learn hundreds of nodes. You just need to master THESE 17 nodes.
>
> In this video, I'll walk you through every single one — what it does, when to use it, and real examples you can copy.
>
> By the end, you'll be able to build ANY automation — from AI agents to full business workflows.
>
> Let's dive in."

---

### 📌 NODE 1: Schedule Trigger (0:45 - 1:30)

**[ON SCREEN: n8n canvas showing Schedule Trigger node]**

**NARRATOR:**
> "Number 1 — The Schedule Trigger.
>
> This is your starting point for ANY recurring automation. It fires your workflow on a schedule you set — every day at 8am, every Monday at 9am, or any custom pattern using CRON expressions.
>
> Use it for:
> - Automated daily reports
> - Data syncs overnight
> - Scheduled reminders
> - Running AI agents on autopilot
>
> Here's how to set it up: Add the node, choose your interval — minutes, hours, days, or weeks — set your timezone, connect it to your action nodes, and activate.
>
> Pro tip: If you need dynamic logic, set a frequent trigger like every minute, and use an IF node to decide whether to proceed.
>
> This is how you make your business run on autopilot — even while you sleep."

---

### 📌 NODE 2: Event Trigger (1:30 - 2:30)

**[ON SCREEN: Gmail Trigger + Slack Trigger examples]**

**NARRATOR:**
> "Number 2 — Event Triggers.
>
> While Schedule Triggers run on a timer, Event Triggers react to REAL-TIME events — like a new email hitting your inbox, or a message in Slack.
>
> Take the Gmail Trigger: It kicks off your workflow the moment a new email arrives. You can filter by sender, label, or even Gmail search syntax.
>
> Use it for:
> - Auto-parsing email attachments
> - Auto-replying to leads
> - Logging messages to databases
>
> The Slack Trigger works the same way — new message, reaction, or channel created — boom, your workflow fires.
>
> Key thing to know: Some triggers use polling — n8n checks every X minutes. Others use webhooks for instant notifications.
>
> Always use filters in your triggers to avoid unnecessary executions and keep your workflows focused."

---

### 📌 NODE 3: Sub-workflows (2:30 - 3:30)

**[ON SCREEN: Parent workflow calling a sub-workflow]**

**NARRATOR:**
> "Number 3 — Sub-workflows.
>
> This is how you scale. Sub-workflows let you build logic ONCE and reuse it everywhere.
>
> Think of it like a function in programming. You build a 'Send Slack Report' workflow once, and then Marketing, Sales, and Support can all call it whenever they need.
>
> Here's the setup:
> 1. Create your sub-workflow with the 'When Executed by Another Workflow' trigger
> 2. Define your input fields or accept all data
> 3. Build your logic
> 4. In your parent workflow, use the Execute Sub-workflow node and map the inputs
>
> Best practice? Keep your main workflows lean — 4 to 6 nodes max — and push complex logic into sub-workflows.
>
> Update logic in one place, and it propagates everywhere. That's how you build automation systems that scale."

---

### 📌 NODE 4: Split Out (3:30 - 4:30)

**[ON SCREEN: Array being split into individual items]**

**NARRATOR:**
> "Number 4 — Split Out.
>
> This node takes an array and breaks it into individual items for one-by-one processing. It's like the iterator node in other tools.
>
> Say you get an API response with 50 customers. Split Out turns that into 50 separate items — each one processed individually.
>
> Use it for:
> - Sending personalized emails to each contact
> - Processing rows from a spreadsheet
> - Handling AI model outputs one at a time
>
> Setup is simple: Add the node after your data source, specify the field to split, choose whether to keep other fields, and connect downstream.
>
> Always use Split Out before loops or individual actions — it guarantees each data piece gets processed without manual array handling."

---

### 📌 NODE 5: IF Node (4:30 - 5:00)

**[ON SCREEN: IF node with True/False branches]**

**NARRATOR:**
> "Number 5 — The IF Node.
>
> This is your conditional branching. It routes data down different paths based on conditions you set.
>
> Examples:
> - If lead score is above 80, send to sales
> - If email has an attachment, download and process it
> - If payment failed, trigger a retry workflow
>
> You can use multiple conditions, combine them with AND/OR logic, and chain multiple IF nodes for complex decision trees.
>
> This is the backbone of intelligent automation — your workflow makes decisions, not just follows linear steps."

---

### 📌 NODE 6: Switch Node (5:00 - 5:30)

**[ON SCREEN: Switch node with multiple output paths]**

**NARRATOR:**
> "Number 6 — The Switch Node.
>
> Think of this as IF on steroids. Instead of two paths, you can route to multiple paths based on rules or expressions.
>
> Route inquiries by department — Sales, Support, Billing. Segment users by tier — Free, Pro, Enterprise. Categorize content by type — Blog, Video, Podcast.
>
> You can match by exact value, regex, or expressions. It's the ultimate router for complex workflows."

---

### 📌 NODE 7: HTTP Request (5:30 - 6:15)

**[ON SCREEN: HTTP Request node connecting to external API]**

**NARRATOR:**
> "Number 7 — HTTP Request.
>
> This is your universal API connector. GET, POST, PUT, DELETE — if it has an API, this node can talk to it.
>
> Use it for:
> - Fetching data from Stripe, Shopify, HubSpot
> - Sending data to webhooks or external services
> - Downloading and uploading files
> - Querying any REST API
>
> You can set authentication headers, handle pagination, add query parameters, and send JSON bodies.
>
> Pro tip: Always handle errors and retries explicitly. APIs fail — your workflow shouldn't."

---

### 📌 NODE 8: HTML Extract (6:15 - 6:45)

**[ON SCREEN: Web scraping example with CSS selectors]**

**NARRATOR:**
> "Number 8 — HTML Extract.
>
> This node scrapes web pages and pulls specific elements using CSS selectors.
>
> Use it for:
> - Competitor price monitoring
> - Lead generation from directories
> - Monitoring regulatory changes on government websites
> - Aggregating industry news
>
> Use specific CSS selectors, handle pagination, and always respect rate limits. Don't be that person who gets IP banned."

---

### 📌 NODE 9: Date & Time (6:45 - 7:15)

**[ON SCREEN: Date manipulation examples]**

**NARRATOR:**
> "Number 9 — Date & Time.
>
> This node handles all your date operations — comparing, formatting, calculating differences, converting timezones.
>
> Use it for:
> - Calculating days until a deadline
> - Scheduling follow-ups — 7 days after sign-up
> - Converting timezones for global teams
> - Tracking content expiration dates
>
> Date logic is everywhere in automation. This node makes it painless."

---

### 📌 NODE 10: Merge Node (7:15 - 7:45)

**[ON SCREEN: Two data streams combining into one]**

**NARRATOR:**
> "Number 10 — Merge.
>
> This node combines data from multiple branches into one unified stream.
>
> Use it to:
> - Merge lead data from forms, LinkedIn, and email
> - Combine analytics from Google and social media
> - Unite customer data from CRM, support tickets, and billing
>
> You can append, merge by key field, or wait for all inputs before continuing. It's how you get a 360-degree view of your data."

---

### 📌 NODE 11: Loop Over Items (7:45 - 8:30)

**[ON SCREEN: Loop node with batch processing and Wait node]**

**NARRATOR:**
> "Number 11 — Loop Over Items.
>
> This is how you process large datasets without crashing or hitting rate limits.
>
> Unlike Split Out which fires everything at once, Loop processes items one batch at a time with full control.
>
> Say you need to email 500 contacts but your API allows 10 per minute. Set batch size to 1, add a 6-second Wait node, and the workflow sends one email, pauses, loops to the next, and repeats.
>
> Use this for:
> - Bulk email campaigns
> - Paginated web scraping
> - Processing thousands of records safely
>
> Always set a clear exit condition. Endless loops will eat your resources."

---

### 📌 NODE 12 & 13: Webhook + Respond to Webhook (8:30 - 10:00)

**[ON SCREEN: Webhook receiving data from external form, sending response back]**

**NARRATOR:**
> "Numbers 12 and 13 — Webhook and Respond to Webhook. Together, these turn n8n into your own custom API.
>
> The Webhook node listens for incoming HTTP requests at a unique URL. Any app that can send data — forms, payment systems, CRMs, IoT devices — can now trigger your workflow.
>
> The Respond to Webhook node sends a custom response back — JSON, text, redirects, custom status codes. This makes n8n a two-way API, not just a one-way trigger.
>
> Setup:
> 1. Add a Webhook node, set your HTTP method and path
> 2. Copy the auto-generated URL
> 3. Paste it into your form or external app
> 4. Process the data in your workflow
> 5. Add Respond to Webhook to send a response back
>
> Always test with the test URL first, switch to production only when live. Add authentication if exposing publicly.
>
> This is how you build microservices, custom endpoints, and real-time integrations without writing a single line of backend code."

---

### 📌 NODE 14: AI Agent (LLM) (10:00 - 12:30)

**[ON SCREEN: AI Agent node with connected tools and memory]**

**NARRATOR:**
> "Number 14 — The AI Agent. This is where things get powerful.
>
> The AI Agent connects to chat models — OpenAI, Claude, Gemini — and gives them memory, tools, and the ability to make decisions inside your workflows.
>
> It's not just 'send a prompt, get text back.' This agent can:
> - Remember context across conversations
> - Call external tools to fetch data, send emails, query databases
> - Make decisions on which actions to take and in what order
> - Transform, analyze, and generate insights from your data
>
> Here's how to set it up:
>
> First, add the AI Agent node and attach a chat model.
>
> Second, connect tool sub-nodes — these give your agent abilities like HTTP requests, database lookups, or sending Slack messages.
>
> Third — and this is critical — craft your system prompt. Define the agent's role, instructions, how to use tools, and your desired output format. The better your prompt, the better your results.
>
> Fourth, add memory. Use conversation history or a vector store so your agent remembers prior context.
>
> Use cases:
> - Conversational chatbots on your website
> - Automated data processing from CRMs and support tickets
> - Multi-step automation where the agent decides the order of actions
> - Lead qualification based on conversation context
>
> Pro tips:
> - Always define role and response structure in your system message
> - Use tools for calculations, web scraping, and integrations — don't make the LLM do what deterministic nodes do better
> - Test with real-world input before going live
> - AI is strongest when it can think, but use deterministic tools for actions"

---

### 📌 NODE 15: Agent Tools (12:30 - 14:00)

**[ON SCREEN: AI Agent with 4 connected tool nodes]**

**NARRATOR:**
> "Number 15 — Agent Tools. These are the hands of your AI Agent.
>
> Without tools, your AI can only think and respond. With tools, it can TAKE ACTION.
>
> Each tool node wraps an action — sending emails, making API calls, creating documents, triggering sub-workflows. Your AI Agent decides which tool to use based on the user's request.
>
> Here's a real example: Your agent has four tools:
> - Send Email — for replies and notifications
> - Research — for web lookups and API queries
> - Document Creation — for generating proposals and reports
> - Trigger Report Workflow — for calling complex n8n sub-workflows
>
> When a user says 'email this report to the team,' the agent invokes the email tool with dynamic inputs. When they ask for 'latest competitor stats,' it uses the research tool. Automatically, based on context.
>
> Best practices:
> - Clearly name each tool so the agent chooses logically
> - Describe each tool in the system prompt — when, why, and how to use it
> - Use parameter validation to avoid sending incomplete actions
> - Limit tool permissions for sensitive operations
>
> Agent Tools transform your AI from a reasoning engine into a full-powered automation assistant."

---

### 📌 NODE 16: Structured Output Parser (14:00 - 15:30)

**[ON SCREEN: AI output → JSON schema validation]**

**NARRATOR:**
> "Number 16 — Structured Output Parser.
>
> This node forces your AI to output in a precise JSON structure. No more guessing, no more string extraction hacks.
>
> Say you ask the AI: 'Summarize sales by region and list the top 3 customers for each.' You define a JSON schema, and the parser ensures the output matches EXACTLY — ready for your database, spreadsheet, or API.
>
> Setup:
> 1. In your AI node, enable 'Require Specific Output Format'
> 2. Attach the Structured Output Parser
> 3. Either generate a schema from a JSON example, or define it manually with JSON Schema
> 4. Downstream, consume fields confidently — you know exactly what you're getting
>
> If the output doesn't match your schema, the node throws an error — catching alignment issues early.
>
> Pro tips:
> - Include example outputs in your prompts to reinforce adherence
> - Use manual JSON Schema for tighter control when other systems depend on strict data types
> - For agents, parse final output only — intermediate tool calls may not respect the schema
>
> This is a core tool for production-grade automations. It eliminates unpredictable text parsing and delivers rock-solid data structures every run."

---

### 📌 NODE 17: Google Sheets (15:30 - 17:00)

**[ON SCREEN: Google Sheets node with Append, Update, Read operations]**

**NARRATOR:**
> "Number 17 — Google Sheets. The cornerstone of n8n automation.
>
> This node turns a simple spreadsheet into a cloud database, a live dashboard, and an automation queue — all in one.
>
> You can read, write, append, update, and delete rows. Keep workflow state, share data across automations, and collaborate with your team in real-time.
>
> Use it for:
> - Logging lead data and form submissions
> - Tracking status — pending, processed, error, complete
> - Syncing data from APIs or other platforms
> - Building analytics dashboards
> - Creating audit trails for compliance
>
> Setup:
> 1. Authenticate your Google account
> 2. Choose your spreadsheet and worksheet
> 3. Pick your operation — Append, Update, Read, Delete, Lookup
> 4. For updates, specify the key column — use a unique identifier like email or ID
> 5. Map fields dynamically using n8n expressions
>
> Pro tips:
> - Always use a unique key for reliable updates
> - For large sheets over 10,000 rows, use lookups and paging to avoid slowdowns
> - Set up error handling and retries for API timeouts
> - Check your Google Drive permissions for sensitive data
>
> Master Google Sheets with n8n, and you unlock vast automation potential — turning a humble spreadsheet into a real-time dashboard, an automation queue, or an always-available mini-database."

---

### 🎬 OUTRO & CTA (17:00 - 18:30)

**[ON SCREEN: Summary of all 17 nodes + AIS Plus membership info]**

**NARRATOR:**
> "Those are the 17 nodes you need to master n8n.
>
> Let's do a rapid-fire recap:
>
> Schedule Trigger for recurring tasks. Event Triggers for real-time reactions. Sub-workflows for modular, reusable logic. Split Out for array processing. IF and Switch for routing. HTTP Request for APIs. HTML Extract for scraping. Date & Time for scheduling. Merge for combining data. Loop for controlled iteration. Webhooks for custom endpoints. AI Agent for intelligent reasoning. Agent Tools for action. Structured Output for reliable JSON. And Google Sheets for storage and reporting.
>
> Master these, and you can build ANY automation.
>
> If you want the templates, the workflows, and the step-by-step breakdowns — everything I use in my own business — check out AIS Plus. Link in the description.
>
> Drop a comment with which node you're most excited about, and subscribe for more AI automation content.
>
> I'll see you in the next one."

**[ON SCREEN: End card — "Join AIS Plus" + Subscribe button]**

---

## 🎬 PRODUCTION NOTES

### Visual Elements Needed:
- [ ] n8n canvas screenshots for each node
- [ ] Flow diagrams for complex workflows
- [ ] Code/JSON examples for Structured Output
- [ ] Before/after comparisons
- [ ] End card with CTA

### B-Roll Suggestions:
- Screen recordings of n8n in action
- Workflow execution animations
- Google Sheets updating in real-time
- Slack notifications popping up
- Email auto-generation examples

### Pacing Guide:
- **0:00-0:45**: Hook + Intro (fast, engaging)
- **0:45-8:30**: Nodes 1-11 (steady, clear)
- **8:30-17:00**: Nodes 12-17 + AI deep dive (slower, more detail)
- **17:00-18:30**: Outro + CTA (energetic)

---

> **Total Runtime**: ~18-19 minutes
> **Difficulty**: Beginner to Intermediate
> **Target Audience**: Aspiring automation builders, business owners, AI agency operators
