# THE 7 PHASE PROMPTS — Copy-Paste into Claude Code

> Each prompt is a complete, self-contained instruction. Open Claude Code in the target folder, paste the prompt, let it run. Context files are referenced by absolute path so Claude Code reads them first.

---

## PHASE 1 — PLANNING

**Run in:** empty folder, e.g. `C:\Users\Moshe Dor\agency-os\`
**Duration:** 1-2 days
**Output:** 5 markdown files in `planning/`
**DO NOT write code in this phase.**

### Prompt

```
You are the Planning Agent for a new AI agency vertical called Agency OS.

This is Phase 1 of a 7-phase build. Planning only. No code. No pages. No components.
Your job is to produce 5 markdown files that define the business before we build.

=== READ FIRST (in this order, fully) ===

1. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\01_PLANNING_STRATEGY\WAT.CLAUDE (2).md
   The WAT framework. You operate under this: Workflows define what to do,
   Agents (you) coordinate, Tools execute. Probabilistic AI reasons; deterministic
   code executes. Never let AI do what code can do.

2. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\01_PLANNING_STRATEGY\TIER1_COMPLIANCE_RISK_AGENCY_BLUEPRINT.md
   Reference only. Map the *patterns* (7 services, 4 AI patterns, service tiering).
   Don't copy the niche. We're doing Agency OS (for digital agencies), not compliance.

3. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\executive assistant\context\goals.md
   @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\executive assistant\context\current-priorities.md
   Financial constraints. $30K MRR target. ONE validated vertical first. First client 14-21 days.

4. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\MORNING-REPORT-APRIL14.md
   The anti-pattern. Do NOT recreate BizLegal's sprawl. One vertical. One offer. One funnel.

=== THE VERTICAL: AGENCY OS ===

We are building a productized service that installs an AI client-acquisition and
delivery system inside 5-30 person digital agencies. Positioning:

  "The Agency OS — I install a complete AI ops system in your agency in 14 days.
   Voice qualifier, lead scoring, proposal engine, content machine, client dashboard.
   $18,000 one-time + $1,500/month optional retainer.
   Guarantee: Book 3 new client calls in 30 days or refund half."

=== BEFORE YOU WRITE ANYTHING ===

Ask me these 10 questions, one at a time. Wait for my answer before the next.

Q1. Geography: target US, EU, or both? Any countries to exclude?
Q2. Agency size sweet-spot: 5-10 employees, 10-30, or flexible?
Q3. Agency type: generalist digital, SEO-specialist, paid-ads, or content/social?
Q4. Do I want to sell direct or via partnerships (GoHighLevel affiliates, etc.)?
Q5. First 10 ICP companies I already know personally or have warm intros to?
Q6. Do I want the "scan" (lead magnet) to be an audit form or an interactive calculator?
Q7. Cal.com vs Calendly for booking?
Q8. Stripe only, or Stripe + Paddle (for EU VAT handling)?
Q9. Do I want to disclose I'm the sole operator upfront, or position as a "studio"?
Q10. What's my unfair advantage — what do I know/have that competitors don't?

Then, based on my answers, produce these 5 files in `planning/`:

=== DELIVERABLES ===

File 1: planning/icp.md
--------
Structure:
  # Ideal Customer Profile — Agency OS
  ## One-sentence ICP
  ## Demographics (agency size, revenue range, location, tenure)
  ## Psychographics (values, fears, aspirations, daily frustrations)
  ## Pain points (list 5, ranked by severity)
  ## Trigger events (what makes them buy NOW, not in 6 months)
  ## Where they hang out (communities, podcasts, publications, conferences)
  ## Objections (anticipated top 5 + counter for each)
  ## Buying committee (who decides, who influences, who blocks)
  ## Budget ranges (tooling budget, agency budget, project budget)
  ## 20 real companies that fit (with website + founder name)

File 2: planning/offer.md
--------
Structure:
  # The Offer — Agency OS Installation
  ## Headline (one sentence, passes the "is this clear to a 12yo" test)
  ## The promise (specific outcome, timeframe, measurement)
  ## What's included (bullet every deliverable with line-item value)
  ## Price architecture (Starter $9K / Pro $18K / Elite $35K — detail what's in each)
  ## Guarantee (refund terms, cap, conditions)
  ## Timeline (day-by-day of the 14 days)
  ## Why now (what they lose by waiting 6 months)
  ## Proof required (how many case studies we need before selling)
  ## FAQ (10 anticipated questions + answers)

File 3: planning/king-funnel.md
--------
Structure (6 stages, for each: goal, copy angle, tech, conversion target, next step):
  # King Funnel — Agency OS
  ## Stage 1: Cold Traffic (source mix, budget, volume)
  ## Stage 2: Landing Page (headline, sub, CTA, sections, design direction)
  ## Stage 3: Lead Magnet / Scan (7 questions, scoring logic, report structure)
  ## Stage 4: Qualifier Call (Vapi script, scoring criteria, routing rules)
  ## Stage 5: Booking (calendar setup, pre-call prep, reminders)
  ## Stage 6: Sales Call (call structure, objection handling, close, payment)
  ## Expected unit economics (traffic → closes math at 500 / 1000 / 2500 visitors)

File 4: planning/pricing.md
--------
Structure:
  # Pricing — Agency OS
  ## 3-tier table (features × tier)
  ## Payment terms per tier (upfront, split, terms)
  ## Retainer structure (what's in it, cancellation)
  ## Discount policy (when, how much, never for new clients)
  ## Refund logic per tier
  ## Upsell sequence (day 30, 60, 90 post-install)

File 5: planning/content-strategy.md
--------
Structure:
  # Content Strategy — Agency OS, 90 days
  ## Content pillars (3 max)
  ## SEO articles: 5 titles + 1-paragraph outline each
  ## Video scripts: 5 faceless video hooks + CTA each
  ## LinkedIn posting schedule (topics by day of week)
  ## Newsletter cadence (weekly brief, topic mix)
  ## Distribution: which channel for which pillar

=== RULES ===

- Every funnel stage MUST have a numeric conversion target. No hand-waving.
- If a feature cannot be justified by "this converts X% to Y%", cut it.
- One CTA per page. No exceptions.
- Use WAT framework language in docs: Workflows = SOPs, Agents = coordinators, Tools = scripts.
- If a claim requires proof you don't have, note "PROOF NEEDED" inline.
- Reference the 20 ICP companies by name in at least one content piece.

=== FINAL STEP ===

After producing all 5 files:
1. Show me a summary table: file → line count → key decision in that file
2. List the 3 biggest risks to hitting $18K in 30 days
3. Ask me to approve or revise before we move to Phase 2 (Foundation).

DO NOT write code. DO NOT scaffold folders. DO NOT install dependencies.
Phase 1 output is 5 markdown files in planning/ and nothing else.
```

---

## PHASE 2 — FOUNDATION

**Run in:** `C:\Users\Moshe Dor\agency-os\` (same folder as Phase 1)
**Duration:** 2-3 days
**Output:** deployable Next.js skeleton, empty DB, CI/CD live
**Precondition:** Phase 1 files exist AND you approved them.

### Prompt

```
You are the Foundation Agent for Agency OS. Phase 2 of 7.
Your job: deployable skeleton. No marketing pages yet. No design polish.
The goal is: curl https://<vercel-url> returns 200, DB is live, webhooks work.

=== READ FIRST ===

1. @planning/king-funnel.md, planning/offer.md, planning/icp.md
   From Phase 1. The source of truth for config values.

2. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\02_FOUNDATION_INFRASTRUCTURE\n8n Cheatsheet 2026.pdf
   The 17 nodes you'll reference when building workflows later.

3. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\deploy project\CLAUDE-workflowbuilder).md
   TypeScript only. No Python. Every secret in .env. Validate env at top of every task.

4. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\deploy project\trigger-ref.md
   Trigger.dev v4 patterns. Use schedules.task with cron strings.

=== SCAFFOLD ===

Initialize in this exact order:

1. Next.js 14 App Router (TypeScript, Tailwind, ESLint)
   npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir=false --import-alias="@/*"

2. Install dependencies:
   - @supabase/ssr, @supabase/supabase-js
   - resend
   - stripe
   - @trigger.dev/sdk
   - zod
   - react-hook-form
   - @hookform/resolvers

3. Create vertical.config.ts at repo root with this schema (fill in from Phase 1 planning):

   export type VerticalConfig = {
     name: string;
     domain: string;
     tagline: string;
     icp: { title: string; painPoints: string[]; budget: string; triggerEvent: string };
     offer: { headline: string; price: number; retainer: number; guarantee: string; duration: string };
     brand: { colors: Record<string,string>; fonts: Record<string,string> };
     leadMagnet: { type: string; name: string; questions: number; output: string };
     funnelTargets: Record<string, number>;
     integrations: Record<string, string>;
   };

   export const config: VerticalConfig = { ... };  // fill from planning/

4. .env.example (list EVERY key the project needs):
   SUPABASE_URL=
   SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_KEY=
   RESEND_API_KEY=
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   VAPI_API_KEY=
   N8N_WEBHOOK_URL=
   OPENAI_API_KEY=
   ANTHROPIC_API_KEY=
   TRIGGER_SECRET_KEY=
   APP_URL=

5. Supabase schema — create migrations in supabase/migrations/:
   001_leads.sql:
     - id uuid PK, email text unique, phone text, company text, role text,
       score int, tier text check (tier in ('hot','warm','cold')),
       status text, source text, utm jsonb, created_at timestamptz default now()
   002_qualifier_responses.sql:
     - id uuid PK, lead_id uuid FK, questions jsonb, answers jsonb,
       ai_summary text, recommendation text, created_at timestamptz default now()
   003_content.sql:
     - id uuid PK, slug text unique, title text, body text, vertical text,
       published_at timestamptz, meta jsonb
   004_orders.sql:
     - id uuid PK, lead_id uuid FK, amount int, currency text,
       status text, stripe_id text, created_at timestamptz default now()

6. Core API routes:

   app/api/leads/route.ts (POST):
     - Validate body with zod
     - Insert into Supabase leads table
     - Fire webhook to process.env.N8N_WEBHOOK_URL with { leadId, email, source }
     - Return { ok: true, leadId }

   app/api/scan/route.ts (POST):
     - Validate 7 answers with zod
     - Create qualifier_responses row
     - Call OpenAI (gpt-4o-mini) for scoring with structured output parser
     - Update lead row with score + tier
     - Return { score, tier, summary }

   app/api/stripe/webhook/route.ts (POST):
     - Verify signature with STRIPE_WEBHOOK_SECRET
     - On checkout.session.completed → update orders.status = 'paid'
     - Fire n8n onboarding webhook

7. Base layout:
   components/layout/NavBar.tsx — reads config.name, config.brand
   components/layout/Footer.tsx — reads config.domain, legal links
   app/layout.tsx — wraps everything, loads brand fonts

8. Trigger.dev initialization:
   npx trigger.dev@latest init
   Create src/trigger/ folder. Empty for now — we'll add tasks in Phase 6.

9. Git setup:
   - git init
   - .gitignore includes .env, .env.local, .trigger/, node_modules/
   - git add + commit: "Phase 2: foundation skeleton"
   - Create GitHub repo: gh repo create agency-os --private --source=.
   - git push origin main

10. Vercel deploy:
    - vercel link
    - vercel env add SUPABASE_URL production (paste value)
    - ... all env vars
    - vercel deploy --prod

=== ACCEPTANCE CRITERIA ===

Test these BEFORE marking Phase 2 done:

[ ] curl https://agency-os.vercel.app returns 200
[ ] POST https://agency-os.vercel.app/api/leads with test body creates row in Supabase
[ ] Stripe webhook endpoint returns 200 on test event
[ ] .env.example has every key the codebase references
[ ] npm run build succeeds with zero TypeScript errors
[ ] vertical.config.ts values match planning/ files

=== RULES ===

- TypeScript only. No .js files except next.config.js.
- Every env var read MUST be guarded: const x = process.env.FOO; if (!x) throw new Error('FOO not set')
- Never log secret values. Never hardcode keys.
- No Python. No shell scripts. No Docker (yet — n8n is separate).
- Use native fetch. Not axios, not node-fetch.

=== DO NOT DO ===

- Do NOT build marketing pages (that's Phase 4)
- Do NOT install animation libraries yet
- Do NOT set up n8n workflows yet (Phase 3)
- Do NOT design. Default Next.js styling is fine for Phase 2.
- Do NOT add features not in the acceptance criteria above

When done: show me the live Vercel URL, a successful POST to /api/leads, and the
Supabase row it created. Then stop and ask for Phase 3 approval.
```

---

## PHASE 3 — AI PATTERNS CORE

**Run in:** n8n instance on PC1 + commit JSONs to `agency-os/n8n/`
**Duration:** 1 day
**Output:** 4 working n8n workflows, customized for Agency OS
**Precondition:** Phase 2 deployed, n8n running on PC1, Supabase credentials configured in n8n

### Prompt

```
You are the AI Patterns Agent. Phase 3 of 7.
Your job: import Nate's 4 AI pattern JSONs into n8n, customize each for Agency OS
use cases, test, export, and commit to the repo.

=== READ FIRST ===

1. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\03_AI_PATTERNS_CORE\Prompt_Chaining.json
2. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\03_AI_PATTERNS_CORE\Parallelization.json
3. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\03_AI_PATTERNS_CORE\Routing.json
4. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\03_AI_PATTERNS_CORE\Evaluator_Optimizer.json
5. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\03_AI_PATTERNS_CORE\17 Nodes to Master.json
6. @planning/king-funnel.md, planning/offer.md, planning/icp.md

=== THE MAPPING ===

For Agency OS, each pattern serves a specific funnel function:

Pattern 1: Prompt Chaining → Audit Report Pipeline
  Input: 7 scan answers
  Chain: Extract pain points → Score across 5 dimensions → Generate recommendations → Format as report
  Output: 2-page personalized report delivered via email

Pattern 2: Parallelization → Multi-Angle Lead Scoring
  Input: lead data from qualifier call
  Parallel agents: Budget fit | Timeline fit | Pain severity | Decision maker access
  Aggregator: weighted average → Hot/Warm/Cold tier
  Output: score + tier, written to Supabase

Pattern 3: Routing → Inbound Classifier
  Input: inbound email or chat
  Classifier: Buyer | Tire-kicker | Partner | Spam | Support | Press
  Router: sends to correct agent or inbox
  Output: classification + routing action

Pattern 4: Evaluator-Optimizer → Outreach Message QA
  Input: personalized outbound message draft
  Evaluator: checks personalization depth, clarity, CTA strength, length
  Refiner: improves and re-evaluates until threshold met
  Output: ship-ready message

=== TASKS ===

For each of the 4 patterns:

1. Import the Skool JSON into n8n (self-hosted on PC1)
2. Rename the workflow to: agency-os-<pattern-name>
3. Replace sample prompts with the mapping above
4. Wire Supabase credentials for reading/writing lead data
5. Test with 3 real examples (use seed data from planning/icp.md ICP companies)
6. Export finalized workflow JSON to agency-os/n8n/:
   - 01-audit-report-pipeline.json
   - 02-lead-scoring-parallel.json
   - 03-inbound-routing.json
   - 04-outreach-qa.json

=== ACCEPTANCE CRITERIA ===

[ ] All 4 workflows run successfully with test data
[ ] Each writes to or reads from Supabase correctly
[ ] JSONs committed to git in agency-os/n8n/
[ ] README.md in n8n/ folder documents: what each workflow does, required credentials,
    how to import in a new n8n instance, env vars needed
[ ] 3 sample outputs saved as markdown in n8n/samples/ for future reference

=== DO NOT DO ===

- Do NOT build the Vapi qualifier workflow yet (Phase 4)
- Do NOT build the content pipeline yet (Phase 6)
- Do NOT use OpenAI if Anthropic Claude works — prefer cheaper models for non-critical steps

Output: 4 working workflows + 4 committed JSONs + README.
```

---

## PHASE 4 — KING FUNNEL

**Run in:** `agency-os/` repo
**Duration:** 5-7 days
**Output:** 6 pages live, end-to-end tested with a fake lead
**Precondition:** Phases 1-3 complete. `planning/king-funnel.md` is the spec.

### Prompt

```
You are the Conversion Agent. Phase 4 of 7. THE most important phase.
Your job: build 6 pages that convert cold traffic to paying clients.

=== READ FIRST ===

1. @planning/king-funnel.md — THE SPEC. Follow it exactly.
2. @planning/offer.md — pricing, guarantee, timeline
3. @planning/icp.md — who you're writing copy for
4. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\01_PLANNING_STRATEGY\Outbound Lead Qualifier.json
   Import into n8n and adapt for Agency OS qualification call
5. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\11_DOCUMENTATION_RESOURCES\I Built a Voice Agent That Calls Every New Lead (n8n + Vapi).pdf
6. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\01_PLANNING_STRATEGY\CLAUDE (-website design).md
   THE design rules. Enforce every one.
7. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\01_PLANNING_STRATEGY\CLAUDE_CODE_SITE_BUILDING_WORKFLOW.md
   Use the 5-hack workflow. Screenshot every page with Puppeteer, 2-pass self-review.

=== ALWAYS DO FIRST ===

Invoke the frontend-design skill before writing any frontend code. Every session. No exceptions.

=== BUILD ORDER (each tested on localhost BEFORE next) ===

Page 1: Homepage (app/page.tsx)
  Structure:
    - Hero: H1 (the offer headline from planning/offer.md) + sub (one sentence outcome)
      + ONE primary CTA: "Get your free Agency AI Readiness Audit"
    - Trust bar: 6 logos (use placeholder.co for now, real logos post-launch)
    - Problem agitation: 3 pain cards from planning/icp.md (StepProcessBar component)
    - Solution: 1 sentence + StatCounterBlock (3 stats)
    - How it works: 3-step process (Scan → Qualify → Install)
    - Social proof: 1 case study card (placeholder — will replace with real after client #1)
    - CTA repeat (same button, different visual treatment)
    - AccordionFAQ: 8 FAQs from planning/offer.md
    - Footer

Page 2: Lead Magnet (app/scan/page.tsx)
  Functionality:
    - 7 questions, one per step (react-hook-form + zod)
    - Progress bar at top
    - Each question has a "why we ask" tooltip
    - Final step: email required to see full report
    - On submit: POST /api/scan → returns score preview + tier
    - Email sent via Resend with full 2-page report (uses Phase 3 Prompt Chaining workflow)
    - Thank-you state with "Book your 5-min consult" CTA → /qualify

Page 3: Qualifier Booking (app/qualify/page.tsx)
  - Simple form: name, phone, best time to call
  - On submit: fires n8n webhook → Vapi calls them within 5 minutes
  - Vapi runs the Outbound Lead Qualifier.json logic (adapted for Agency OS)
  - Post-call: scoring logic writes to Supabase, hot leads get SMS with /book link

Page 4: Booking (app/book/page.tsx)
  - Cal.com embed (or custom if no budget for Cal.com paid tier)
  - Only accessible with a signed token (generated for hot leads after qualifier)
  - Pre-call prep form: 3 questions
  - Sends Loom intro video to calendar invite

Page 5: Offer Page (app/offer/page.tsx)
  - Above fold: 2-3 min VSL (record with Loom, host on Mux or self-hosted)
  - Below: full breakdown of what's included (from planning/offer.md)
  - Pricing: 3-tier table with Pro highlighted
  - 3 case study cards (placeholder until real)
  - Guarantee section
  - FAQ (different from homepage FAQ — more technical/pricing-focused)
  - CTA: "Book Strategy Call" → /book

Page 6: Onboarding (app/onboarding/page.tsx)
  - Post-payment landing
  - Welcome video (record once, personalize name via variable)
  - Kickoff form: agency details, access grants needed
  - Day-by-day timeline of the 14-day install
  - Slack invite link (or dedicated Slack Connect channel per client)

=== COMPONENTS TO BUILD (in components/conversion/) ===

- StatCounterBlock.tsx (count-up animation on scroll)
- StepProcessBar.tsx (3-step connected bar with numbered badges)
- ShimmerButton.tsx (primary CTA with light sweep)
- TrustMarquee.tsx (infinite horizontal scroll of logos)
- RiskCalculator.tsx (the scan form wrapper)
- AnnouncementPill.tsx (top-of-page "live" banner)
- AccordionFAQ.tsx (expand/collapse)

Reference 21st.dev for design inspiration but BUILD within Quantum DNA tokens.
No npm installing 21st.dev. Copy source, adapt to our CSS custom properties.

=== ANTI-GENERIC HARD RULES (from Nate's CLAUDE-website-design.md) ===

ENFORCE ALL:
- NO default Tailwind palette (no indigo-500, no blue-600). Use config.brand.colors.
- Shadows: layered, color-tinted, low opacity. Never flat shadow-md.
- Typography: display serif (Instrument Serif) + clean sans (Geist). Tight tracking on h1.
- Gradients: multiple radial gradients + SVG noise filter for texture.
- Animations: ONLY transform and opacity. Never transition-all. Spring easing.
- Every interactive element: hover + focus-visible + active states. Every one.
- Images: gradient overlay + mix-blend-multiply treatment.
- Depth: layered surface system (base → elevated → floating).

=== SCREENSHOT WORKFLOW ===

After building each page:
1. Start dev server: node serve.mjs (serves localhost:3000)
2. Screenshot via Puppeteer: node screenshot.mjs http://localhost:3000/<path>
3. Read the PNG from temporary-screenshots/
4. Compare against planning/king-funnel.md spec
5. Note mismatches with specific measurements ("heading is 32px, should be 28px")
6. Fix, re-screenshot, re-compare
7. 2-pass minimum. Stop only when visually correct.

Disable screenshot loop for any animated sections — comparison doesn't work on animations.

=== DEPLOY WORKFLOW ===

After all 6 pages work on localhost and pass screenshot review:
  "I'm ready for your review on localhost. DO NOT push to GitHub until I say so."

Wait for user approval. Then:
  git add .
  git commit -m "Phase 4: King Funnel complete"
  git push origin main
  # Vercel auto-deploys

=== ACCEPTANCE CRITERIA ===

[ ] All 6 pages render on localhost with zero console errors
[ ] Complete end-to-end test: fake lead → scan → qualifier → book → offer
[ ] Lead row appears in Supabase with score + tier
[ ] Resend email fires with audit report
[ ] Vapi call triggers from qualifier form
[ ] Stripe checkout session creates on offer page
[ ] Lighthouse score: >90 performance, >95 accessibility on homepage
[ ] Mobile responsive on all pages (tested at 375px width)
[ ] All animations respect prefers-reduced-motion

=== DO NOT DO ===

- Do NOT add features beyond the 6 pages (no blog yet, no case studies CMS, no dashboard)
- Do NOT add A/B testing infrastructure (that's Phase 6)
- Do NOT install animation libraries beyond framer-motion
- Do NOT build a design system component library beyond what's needed for these 6 pages
- Do NOT improve the spec. Match planning/king-funnel.md exactly. If the spec is wrong, fix the spec first.

Output: 6 pages deployed to Vercel. End-to-end tested. Screenshots committed.
```

---

## PHASE 5 — AGENTS

**Run in:** n8n on PC1 + commit workflows to `agency-os/n8n/`
**Duration:** 5-7 days
**Output:** 3 agents live (STOP there until first client closes)

### Prompt

```
You are the Agent Deployment Agent. Phase 5 of 7.
Your job: deploy the 3 agents the funnel needs RIGHT NOW. Not 8. Not 4. Three.
Then STOP until first client closes.

=== READ FIRST ===

1. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\04_SINGLE_AGENTS\___Inbox_Management_Agent.json
2. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\04_SINGLE_AGENTS\__Calendar_Agent.json
3. @planning/king-funnel.md

The Lead Qualifier Agent is already live from Phase 4 (Vapi + Outbound Lead Qualifier.json).

=== DEPLOY ORDER ===

Agent 1: Inbox Management Agent (Gmail → classification → Supabase)
  Purpose: triage inbound emails. Route buyer inquiries to /book link,
  support to Slack, press to your personal inbox, spam to trash.
  Import ___Inbox_Management_Agent.json, wire Gmail OAuth, adjust prompts for
  Agency OS intent classes.

Agent 2: Calendar Agent (Cal.com → confirmation + reminders)
  Purpose: when a booking is made, send confirmation email with pre-call prep
  form and Loom intro, send reminder 24h + 1h before call, add to Google Calendar.
  Import __Calendar_Agent.json, wire Cal.com webhooks.

Agent 3: NONE YET. STOP HERE.

=== THE HARD STOP ===

Do NOT deploy Research Agent, Content Agent, Invoice Agent, LinkedIn Agent, or
Personal Assistant until these two gates pass:

  Gate 1: At least 1 paying client signed ($9K collected)
  Gate 2: Funnel has run end-to-end 10+ times with real leads

If either gate isn't met, diagnose the funnel. Don't add more agents. Adding agents
to a broken funnel is how BizLegal ended up with 6 broken subdomains. Do not repeat.

=== ACCEPTANCE CRITERIA ===

[ ] Both agents import cleanly into n8n
[ ] Inbox Agent correctly classifies 20 sample emails (log results)
[ ] Calendar Agent sends confirmation + 2 reminders for a test booking
[ ] Both exported as JSON, committed to agency-os/n8n/
[ ] README updated with credential requirements

=== DO NOT DO ===

- Do NOT deploy agents beyond these 2
- Do NOT tweak the funnel based on imagined improvements
- Do NOT start Phase 6 (marketing) until first client signs
```

---

## PHASE 6 — MARKETING & SCALE

**Run in:** n8n + Trigger.dev + agency-os repo
**Duration:** 2-4 weeks
**Output:** Content machine, outbound at scale, video pipeline
**Precondition:** First client closed. $5K MRR in sight. Funnel proven.

### Prompt

```
You are the Marketing Infrastructure Agent. Phase 6 of 7.
Your job: fill the top of the funnel with qualified traffic.

ONLY PROCEED if:
- At least 1 paying client ($9K collected)
- Funnel has processed 50+ real leads
- You have 1 real case study documented

If not, stop. Go back to funnel optimization.

=== READ FIRST ===

1. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\07_MARKETING_LEADS\Newsletter_Automation (1) (1).json
2. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\07_MARKETING_LEADS\AI Newsletter System.json
3. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\07_MARKETING_LEADS\Blotato Posting.json
4. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\09_AUTOMATION_WORKFLOWS\AI Marketing Team Workflows\AI_Marketing_Team.json
5. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\09_AUTOMATION_WORKFLOWS\AI Marketing Team Workflows\Blog_Post.json
6. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\09_AUTOMATION_WORKFLOWS\AI Marketing Team Workflows\Faceless_Video.json
7. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\06_DATA_INTELLIGENCE\Apify.json
8. @C:\Users\Moshe Dor\Downloads\SKOOL-NATE\04_SINGLE_AGENTS\__LinkedIn_Agent.json
9. @planning/content-strategy.md

=== DEPLOY ORDER ===

Week 1: Content Pipeline
  Trigger.dev task: daily-content.ts
    Cron: 0 6 * * *  (6am UTC daily)
    Logic: check Supabase content table for unpublished slots, generate if slot open,
    post to blog (Vercel ISR revalidate), notify Slack.

  Use Blog_Post.json pattern: Ollama gemma2:9b drafts → Claude Sonnet refines →
  QA by llama3.2:3b → Supabase write.

Week 2: Newsletter
  Trigger.dev task: weekly-newsletter.ts
    Cron: 0 8 * * 5  (Friday 8am UTC)
    Import Newsletter_Automation.json logic.
    Source: Tavily search for week's top 5 agency/AI news + your own blog posts.
    Draft with Claude. Human review before send (send to your email first, 24h approval window).
    On approval: Resend sends to newsletter list.

Week 3: Social Distribution
  Import Blotato Posting.json.
  Daily LinkedIn + X posts (7/week each). Topics from planning/content-strategy.md.
  Post times: LinkedIn 8am EST, X 10am + 3pm EST.

Week 4: Outbound at Scale
  Apify: scrape LinkedIn for ICP accounts (use criteria from planning/icp.md)
  LinkedIn Agent: personalized outreach, 20/day max (avoid account ban)
  Sequence: connect → day 3 message → day 7 follow-up → day 14 break-up email

Week 5+: Faceless Video (only if $5K MRR hit)
  AI_Marketing_Team.json + Faceless_Video.json
  Pipeline: GPT-4.1 script → Runway video → ElevenLabs voice → Creatomate render → Blotato post
  Target: 3 videos/week across LinkedIn, Instagram Reels, TikTok, YouTube Shorts

=== MONITORING ===

Marimo ops dashboard on PC1 shows:
- Content published this week
- Newsletter signups (Supabase count)
- LinkedIn outreach sent/replied
- Funnel conversion rates (stage by stage)
- MRR, cash flow, runway

=== ACCEPTANCE CRITERIA ===

[ ] 3 blog posts published automatically per week
[ ] Newsletter sent every Friday with approval workflow
[ ] LinkedIn + X posting 7 days/week with zero manual intervention
[ ] Outbound sending 20 personalized messages/day
[ ] (Optional, if MRR target hit) 3 videos/week published to 4 channels

=== DO NOT DO ===

- Do NOT start Phase 7 (vertical replication) until $10K MRR
- Do NOT tweak the funnel based on content performance (content is top-of-funnel,
  funnel problems are mid-funnel — don't confuse the two)
```

---

## PHASE 7 — VERTICAL REPLICATION

**Run in:** root of new monorepo
**Duration:** 1 week to extract core, 48 hours per new vertical
**Output:** `@dor/agency-core` npm package + CLI + second vertical deployed
**Precondition:** $10K MRR on Agency OS. Delivery is repeatable.

### Prompt

```
You are the Replication Agent. Phase 7 of 7.
Your job: extract the shared code into a reusable package and prove it works by
spinning up vertical #2 (Home Services AI) in 48 hours.

=== PRECONDITIONS (check before starting) ===

- Agency OS: $10K+ MRR stable for 30 days
- At least 3 clients successfully onboarded (not just paid)
- Funnel conversion rates documented and meeting planning/king-funnel.md targets
- No open P0 bugs on Agency OS

If any fail, go back. Do not start replication with a broken first vertical.

=== TASK 1: MONOREPO RESTRUCTURE ===

1. Create new root: dor-agency-system/
2. Move agency-os repo into verticals/agency-os/
3. Create packages/core/ and packages/cli/
4. Set up Turborepo or pnpm workspaces

Structure:
  dor-agency-system/
  ├── packages/
  │   ├── core/       (shared code)
  │   └── cli/        (create-agency generator)
  ├── verticals/
  │   └── agency-os/  (existing)
  └── package.json

=== TASK 2: EXTRACT TO CORE ===

From verticals/agency-os/, move to packages/core/src/:
  - components/conversion/*  (all 7 components)
  - components/layout/*       (NavBar, Footer)
  - funnel/*                  (all 6 page templates, parameterized by config)
  - n8n-templates/*            (all workflow JSONs)
  - prompts/*                  (all 7 phase prompts from this file)
  - supabase/migrations/*     (schema)
  - skills/*                  (Claude skills)

Replace direct imports in agency-os with @dor/agency-core imports.
Verify agency-os still works after refactor (run end-to-end test).

=== TASK 3: BUILD THE CLI ===

packages/cli/bin/create-agency.ts:

  #!/usr/bin/env node
  import { prompts } from '../src/prompts.js';
  import { scaffold } from '../src/scaffold.js';
  import { deploy } from '../src/deploy.js';

  const args = parseArgs();
  const verticalName = args[0];

  const config = await prompts.askVerticalConfig();
  await scaffold.createVertical(verticalName, config);
  await deploy.provisionInfrastructure(verticalName, config);

Interactive prompts (packages/cli/src/prompts.ts):
  - Vertical name
  - Domain
  - ICP description
  - Offer price + retainer
  - Guarantee language
  - Brand colors (5)
  - Font pair
  - Integrations to enable

Scaffold (packages/cli/src/scaffold.ts):
  - Copy verticals/_template/ to verticals/<n>/
  - Fill in vertical.config.ts from user inputs
  - Run npm install
  - Initialize git

Deploy (packages/cli/src/deploy.ts):
  - Create Vercel project
  - Create Supabase project (via Supabase Management API)
  - Run migrations
  - Set env vars
  - Initial deploy

=== TASK 4: PROVE IT WORKS — VERTICAL #2 ===

Target: Home Services AI (HVAC/plumbing/roofing agencies)

Run: npx create-agency home-services-ai

Then:
1. Edit vertical.config.ts (ICP = home services operators, offer = same $18K)
2. Edit planning/icp.md, planning/offer.md (2 hours)
3. Swap Vapi call script for home services qualification
4. Deploy

If this takes longer than 48 hours, the generator isn't good enough.
Fix the generator, not the vertical.

=== ACCEPTANCE CRITERIA ===

[ ] Agency OS still runs after refactor (end-to-end test passes)
[ ] packages/core published to private npm registry
[ ] CLI: npx create-agency test-vertical produces deployable repo in <10 minutes
[ ] Home Services AI deployed and accepting leads within 48 hours
[ ] verticals/agency-os and verticals/home-services-ai share 95%+ of code
[ ] Adding vertical #3 takes <24 hours (because you know the process now)

=== VERTICAL ROADMAP POST-REPLICATION ===

After #2 (Home Services AI) is live and taking leads:
- #3: Med Spa / Aesthetic (different ICP, same infra — test the machine's range)
- #4: Legal Services (leverages your notary/lawyer background)
- #5: SaaS Onboarding (meta — sell to the B2B SaaS companies your agency clients serve)

Stop at 3 verticals unless each is doing $10K+ MRR. Five verticals with $5K MRR each
is worse than two verticals with $25K MRR each. Don't dilute.
```

---

## END OF PHASE PROMPTS

**Print these. Keep them with you. Run them in order. Do not skip phases.**
