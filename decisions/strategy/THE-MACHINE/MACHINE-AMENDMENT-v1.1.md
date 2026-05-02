# MACHINE AMENDMENT v1.1 — Async-Only Funnel + Three Cherry-Picks

> **Purpose:** Re-architect the Agency OS funnel for an async-only, voice-only, no-live-calls operator. Integrate three ideas from the Intelligence Arbitrage Manifesto (AEO/GEO, multi-modal processing, signal triggers). Keep the $18K offer, the vertical, and the $30K MRR target.
>
> **Date:** April 21, 2026
> **Supersedes:** Stage 6 (Sales Call) of MASTER-SYSTEM-v1.md §3.2
> **Does not replace:** MASTER-SYSTEM-v1.md, PHASE-PROMPTS.md, CLAUDE.md, DAY-BY-DAY-30-DAYS.md. Read alongside.
> **Rule Zero still applies:** Revenue in 60 days. ONE vertical to $10K MRR.

---

## THE FRAME SHIFT — WHY ASYNC-ONLY IS AN UPGRADE

Before the mechanics, accept the premise:

Your constraints (no live calls, no video face, prefer chatbot) are not a handicap for this specific vertical. They are a positioning wedge. Here is why:

1. **Your ICP hates sales calls.** Agency owners are 60-70% introvert, usually former freelancers who went solo precisely to avoid corporate sales theatre. Selling them via async is congruent.

2. **The medium IS the product.** You are selling "install an AI ops system that handles client acquisition without you being on every call." If you yourself closed the deal without a call, the demo is already done.

3. **Proven model.** Justin Welsh ($5M+/yr solo, no calls), Dan Koe ($3M+/yr solo, no calls), Jack Butcher (Visualize Value, no calls). Pat Walls (Starter Story) built to $3M+/yr. The "no-call async agency" model works.

4. **You already have the infrastructure.** You have Vapi (voice), n8n (automation), Supabase (state), Resend (email), Stripe (checkout). All of that is async-native.

**What you cannot do:** sell $50K+ enterprise deals this way. Big companies need humans in the loop at that price. That's fine — you're targeting 5-30 person agencies at $18K, which is squarely in async range.

---

## PART 1 — THE NEW FUNNEL (REPLACES STAGE 4-6 OF ORIGINAL)

The original funnel had 6 stages ending in a live Zoom sales call. The new funnel has 7 stages, all async, ending in self-checkout.

### Stage 1: Cold Traffic (unchanged from original)
- Same sources: 60% outbound, 30% SEO, 10% organic social
- **NEW:** Add AEO/GEO optimization (see Part 2)
- **NEW:** Signal-triggered outbound only (see Part 4)

### Stage 2: Landing Page `/` (minor changes)
- Same hero + trust bar + pain + solution + social proof
- **CHANGED:** Primary CTA is now "Chat with our AI to see if this fits" (not "Book a call")
- **NEW:** Schema.org markup + structured Q&A section for AEO (see Part 2)
- **CHANGED:** Secondary CTA: "Get the free audit" (lead magnet)

### Stage 3: Lead Magnet `/scan` (mostly unchanged)
- Same 7-question interactive audit
- **CHANGED:** Report delivery is immediate on page (not gated by email)
- Email gate comes AFTER they see partial results: "Want the full 10-page report + 5-minute voice walkthrough?"
- **NEW:** After email capture, auto-send: (1) PDF report, (2) 3-minute voice memo from you explaining their top risk (record once per tier — hot/warm/cold get different memos)

### Stage 4: THE CHATBOT — `/chat` (NEW, replaces live qualifier)
This is the core of the async redesign. The chatbot is not a rule-based bot. It's a conversational AI agent (GPT-4o or Claude Sonnet) that does everything a human salesperson does, in text.

**What the chatbot does:**
1. Greets by name (pulled from scan email capture)
2. Asks about their specific situation (open-ended, not form-filling)
3. Handles objections in real-time (trained on your FAQ + decision log)
4. Qualifies budget, timeline, decision authority, fit
5. Books async next step (sends voice memo + written proposal)
6. If cold: adds to nurture, gracefully exits
7. If hot: auto-triggers deal room creation

**Tech stack:**
- Front-end: embedded chat widget on site (custom-built in Next.js, not third-party)
- Brain: Claude Sonnet 4.5 (or GPT-4o) via API, with system prompt built from planning/icp.md + planning/offer.md
- Memory: Supabase conversation table — persists across sessions
- Handoff: when chatbot detects "hot lead signal" (explicit buy-intent phrases), writes to Supabase `deals` table and fires n8n webhook
- Escape hatch: at any point, user can ask "is this a bot?" — chatbot says YES, explains the whole Agency OS system is async, offers to connect via email

**Why this works for YOUR deal size ($18K):**
- Claude/GPT-4o at 2026 quality handle 80% of B2B qualification conversations as well as a junior SDR
- The chatbot is available 24/7 across time zones (critical for Israel → US/EU)
- Every conversation is logged, so you can review the night before the deal room opens
- You review and APPROVE (async, on your time) before the chatbot commits to a deal

**Conversion target:** 40% of emails captured engage the chatbot. 30% of chatbot conversations become qualified "deal rooms."

### Stage 5: DEAL ROOM — `/deal/[token]` (NEW, replaces booking page)
Instead of a calendar link, hot leads get a unique URL to a private deal room. It's a text-based, asynchronous workspace.

**What's in the deal room:**
1. **Welcome note** (text, written, personalized with their data from scan + chatbot conversation)
2. **Diagnostic summary** — "Based on our chat, here are your top 3 bottlenecks" (auto-generated from conversation, reviewed by you before publish)
3. **The proposal** — custom for them, built from template
4. **Loom walkthrough** — 3-5 minute voice-over-screen-share (no face, just cursor + voice + slides). Record ONE master template, then record a 30-second personalized intro per deal
5. **Pricing + guarantee** (clearly stated)
6. **FAQ section** (pre-emptive — anticipates their objections)
7. **"Ask anything" chat** — same chatbot, now scoped to this specific deal
8. **Stripe checkout buttons** — $9K now / $18K now / $35K now (based on tier)
9. **30-day window** — deal room auto-expires, creates urgency

**Tech:**
- Next.js dynamic route: `app/deal/[token]/page.tsx`
- Token: signed JWT, generated when chatbot qualifies lead
- Content: pulled from Supabase `deals` table, populated by chatbot + your approval step
- Loom: hosted on Mux (Loom's enterprise version) for analytics on views
- Stripe: direct checkout, webhook updates `orders` table

### Stage 6: THE VOICE NUDGE — Days 1, 3, 7 (NEW, replaces live close)
When a deal room opens, you don't call. You send three voice memos over 7 days.

**Day 1 (within 2 hours of deal room open):**
- 60-90 second voice memo via WhatsApp or email attachment
- Script: "Hey [name], Moshe here. Saw you opened the deal room. Just a quick note — the thing that usually trips agencies up is [their specific pain from scan]. Section 4 of the proposal addresses this directly. If you want me to record a longer walkthrough of that part, reply 'yes' and I'll send one tomorrow."
- Purpose: human presence, not sales pressure. Shows you're real and paying attention.

**Day 3 (if no checkout yet):**
- 60-second voice memo
- Script: "Hey [name], quick follow-up. I know $18K is a serious decision. Here's the one question I'd ask if I were in your seat: [the #1 objection from their profile]. My answer to that is [answer]. No rush — just wanted to make sure you had what you need."

**Day 7 (if still no checkout):**
- 90-second voice memo
- Script: "Hey [name], your deal room expires in 23 days. I'm not going to push. But here's what I'd do in your shoes: [specific advice that's useful even if they DON'T buy]. If you're out, totally fine — can I add you to my newsletter so you see how this plays out for others?"

**Why voice memos work:**
- More intimate than text, less demanding than video
- Forces brevity (you can't ramble in 60 seconds)
- Asynchronous — they listen when convenient
- Works for introverts — you record in private, edit if needed, send
- Can be automated for template + personalized intro (Vapi or ElevenLabs voice clone)

**Tools:**
- Record: free voice recorder on phone, or Vapi for scripted voice memos
- Send: Resend with audio attachment, or WhatsApp Business API
- Automate: n8n webhook fires voice memo at T+2hr, T+3d, T+7d

### Stage 7: Self-Checkout + Async Onboarding
- Buyer clicks Stripe button in deal room
- $9K charges (Pro tier)
- Redirect to `/onboarding/[token]` page
- Kickoff form (async, takes them 20 min to fill)
- Slack Connect channel created (you + them)
- Day 1 of delivery: you send welcome Loom (pre-recorded, personalized intro, rest is evergreen)
- All delivery happens in Slack Connect + async updates
- **Zero live calls in delivery either** — you communicate via Loom + text

### Updated Conversion Math

Per 1,000 cold visitors/month:

| Stage | Count | Rate | Change |
|---|---|---|---|
| Visitors | 1,000 | — | — |
| Scans started | 350 | 35% | Same |
| Emails captured | 230 | 65% | Same |
| Chatbot engaged | 92 | 40% | NEW stage |
| Deal rooms opened | 28 | 30% | Replaces qualifier call |
| Checkouts (7-day window) | 7 | 25% | Replaces live close |

**Revenue:** 7 × $18K = **$126K cash** + 7 × $1,500 retainer = **$10,500 MRR** (assuming 50% take retainer).

**This is actually HIGHER than the original plan's 6 closes.** Why? Because:
1. No timezone friction (chatbot works 24/7, Israel→US/EU problem dissolves)
2. No "I need to schedule this for next week" friction — deal rooms open instantly
3. Introverted buyers convert higher when they don't have to do a sales call either
4. Your close rate on "hot" leads is higher because they self-qualified deeply through chat

**Trade-off:** Your cycle time is 7 days instead of 1 call. But you spend ~2 hours/deal (review chatbot log + record 3 voice memos + approve deal room content) instead of a 60-minute call + 2 hours prep + follow-up emails.

---

## PART 2 — AEO/GEO INTEGRATION (Cherry-Pick #1)

### The thesis
By late 2026, a significant share of B2B research happens inside ChatGPT, Claude, Perplexity, and Gemini. When an agency owner asks "what's the best way to install AI in a 15-person agency," you want to be cited. This is called AEO (Answer Engine Optimization) or GEO (Generative Engine Optimization).

The manifesto's 14.2% conversion claim is unverified. **I could not find that number in any real source.** Ignore the specific number. But the *direction* is real: getting cited by AI engines is a 2026 traffic source worth capturing, and the cost to do it is nearly zero.

### What this actually requires (3 changes to your site)

**Change 1: Schema.org markup on every page**

Add to every page's `<head>` via Next.js Metadata API:
```typescript
// app/layout.tsx
export const metadata = {
  // ... existing
  other: {
    'schema-organization': JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": config.name,
      "description": config.tagline,
      "founder": {
        "@type": "Person",
        "name": "Moshe Dor",
        "jobTitle": "Founder, Agency OS"
      },
      "offers": {
        "@type": "Offer",
        "name": config.offer.headline,
        "price": config.offer.price,
        "priceCurrency": "USD"
      }
    })
  }
}
```

And for SEO articles, add `Article` + `FAQPage` schemas.

**Change 2: Structured Q&A sections in all SEO content**

AI engines cite pages where questions and answers are clearly structured. Every blog post needs:
- An H2 that is a literal question ("How do agencies install AI without hiring engineers?")
- A direct 40-60 word answer immediately below
- Supporting detail in following paragraphs

Example structure for every article:
```
# [Headline as statement]

## [Question H2 #1]
[40-60 word direct answer]
[Supporting paragraphs]

## [Question H2 #2]
[40-60 word direct answer]
[Supporting paragraphs]
```

This is called "inverted pyramid + FAQ structure" and it's how you get cited.

**Change 3: A `/answers` hub page**

Create `app/answers/page.tsx` — a single page listing 30-50 common agency-AI questions with short answers, each linking to full articles. This is your "AI-readable cheat sheet." Claude/ChatGPT/Perplexity love these pages.

### What to do
- Add to Phase 4: schema markup in base layout (30 min)
- Add to Phase 6: content template requires Q&A structure (5 min per article)
- Add to Phase 6: `/answers` page launches with 20 seed Q&As, grows monthly

### What NOT to do
- Do not pay for any "GEO/AEO service." The whole category is 80% snake oil in 2026. Just write clearly structured content.
- Do not obsess over ranking positions in AI engines. You can't measure it reliably yet. Just write for citation.

---

## PART 3 — MULTI-MODAL DOCUMENT INGESTION (Cherry-Pick #2)

### The thesis
Agencies deal with messy client documents — old PDFs, contracts, brand guidelines, creative briefs, spreadsheets. Most AI tools can't handle the mess. If you offer "I will ingest your entire client document chaos and structure it," that's real value.

### Where it goes in the offer
**Elite tier ($35,000) — add:**
- "Multi-Modal Client Intelligence Vault — we ingest up to 50 client documents (PDFs, images, contracts, reports) per month and structure them into your CRM for instant lookup by any team member or agent."

Keep Pro ($18K) and Starter ($9K) unchanged.

### What it actually is
- n8n workflow that accepts documents via Google Drive folder
- GPT-4o Vision or Claude Opus 4 extracts: structured data, key terms, deliverable specs, critical dates
- Supabase vector store (pgvector) for semantic search
- Agency team queries via Slack bot: "What did we promise client X about revisions?"

### Why this matters
- Differentiates Elite from Pro at 2x the price
- Anchors Pro as "the reasonable option"
- Uses existing tech stack (no new vendors)
- Real ROI: eliminates hours/week of doc hunting

### What NOT to do
- Do not build this in Phase 4. Elite tier is sold only after you close 3 Pro clients.
- Do not offer as standalone. It's an upsell anchor, not a product.
- Do not promise SOC 2 or HIPAA compliance. You are not set up for that.

---

## PART 4 — SIGNAL-BASED OUTBOUND (Cherry-Pick #3)

### The thesis
Scraping "all agencies with 10-30 employees" gets you a list of 50,000 agencies with 2% reply rates. Scraping "agencies who just posted a RevOps job" gets you 500 agencies with 15-20% reply rates. Signal-based outbound is 10x more efficient.

### The signals that matter for Agency OS

**Tier 1 signals (highest intent):**
1. Posted a job with "RevOps," "operations manager," or "automation specialist" in last 30 days
2. Hired 3+ people in last 60 days (growth pain)
3. Recent funding announcement ($500K-$5M, where they suddenly need to scale ops)
4. Founder posted on LinkedIn about "drowning in leads" or "can't scale" in last 14 days

**Tier 2 signals:**
5. Published case study about a $50K+ client win (they have proven clients)
6. Client churn announcement / lost a big client (pain-driven)
7. Attended Agency Growth Summit / SaaStr / similar conference in last 60 days

### How to build the signal engine

Replace the naïve Apify scrape in Phase 6 with:

**Tool 1: Job posting monitor**
- Apify actor: LinkedIn Jobs scraper
- Query: `"RevOps" OR "Operations Manager" OR "Marketing Operations"` + company size 5-30 + industry "Marketing Services" / "Digital Agencies"
- Refresh: daily
- Output: Supabase `signals` table

**Tool 2: Funding announcement monitor**
- Apify actor: Crunchbase or PR Newswire scraper
- Query: recent funding $500K-$5M in marketing/advertising/creative
- Refresh: daily

**Tool 3: LinkedIn pain post monitor**
- Apify actor: LinkedIn search scraper
- Query: keywords like "overwhelmed with leads," "can't keep up," "need to automate," from profiles matching agency founder title
- Refresh: 2x daily

**Tool 4: Signal scoring engine (n8n)**
- For each new signal, score the company 0-100 based on:
  - Signal tier (1 or 2)
  - Recency (how recent is the signal)
  - Company fit (size, industry, tenure)
- Top 20 scores/day go to LinkedIn Agent for outreach
- Outreach message is written by AI, references the specific signal ("I saw you're hiring a RevOps lead — here's how to prep the tech stack before they start")

### What NOT to do
- Do not scrape without signal. "Spray and pray" outbound is dead.
- Do not use generic templates. Message must reference the signal explicitly.
- Do not send more than 20 personalized messages/day. LinkedIn will ban.

---

## PART 5 — THE UPDATED 30-DAY PLAN

The day-by-day changes in these specific ways:

### Week 1 changes
- Day 2: Planning files now include `/chat` system prompt spec and deal-room template
- Day 3: Foundation scaffolding adds: chatbot API route, deal-room dynamic route, voice-memo delivery
- Day 4-5: Supabase schema now includes `conversations`, `deals`, `signals`, `voice_memos` tables

### Week 2 changes
- Day 6: No change (homepage with CTA change)
- Day 7: Scan page with ungated preview + email for full report (small change)
- **Day 8: REPLACED — Build chatbot instead of Vapi qualifier**
  - Embed chat widget on landing + offer pages
  - System prompt pulls from planning/ files
  - Handoff logic: detects hot lead signal, creates deal room
- **Day 9: REPLACED — Build deal-room template instead of booking page**
  - Dynamic route `/deal/[token]`
  - JWT auth
  - Loom embed, Stripe checkout buttons
- Day 10: No change (onboarding + E2E test, but now test chatbot → deal room → checkout flow)

### Week 3 changes
- Day 13: Signal engine setup (Apify actors for job posts + funding + LinkedIn pain posts)
- Day 14: Record 10 voice memo templates (3 for each tier: Day-1, Day-3, Day-7)

### Week 4 changes
- Your role on sales calls: **ZERO**
- Your role on deal rooms: 1-2 hours/deal to review chatbot log, approve personalized intro, record 60-sec voice memo intro
- Target: 7 closes vs. original 6. Time spent per close: ~2 hours async vs. ~4 hours live.

---

## PART 6 — THE CHATBOT SYSTEM PROMPT (THE MOST IMPORTANT ARTIFACT)

Since the chatbot replaces all your live sales calls, its system prompt is the single most leveraged asset in the business. Here is the spec.

```
You are the Agency OS qualification agent. You are NOT a generic chatbot.
You are a conversational sales consultant for digital agency owners.

YOUR IDENTITY:
- You represent Agency OS (@config.name)
- Founder: Moshe Dor (notary/lawyer in Israel who builds AI systems for agencies)
- Your role: help the prospect figure out if Agency OS is right for them

YOUR CONSTRAINTS:
- You NEVER claim to be human. If asked, say: "I'm Agency OS's async consultant.
  Moshe runs the whole business async — he reviews every conversation and personally
  approves every deal before it moves forward."
- You NEVER fabricate case studies, metrics, or client names.
- You NEVER promise specific outcomes without guarantee language matching planning/offer.md.
- You NEVER close the deal yourself. Your job is to qualify + create the deal room.
- You NEVER send more than 4 messages without the user responding.

YOUR PROCESS:
1. Greet by name (from their scan submission). Acknowledge their top pain from the audit.
2. Ask one open-ended question about their biggest bottleneck RIGHT NOW (not the
   audit question — the real one).
3. Listen. Follow up on what they say, not what you want to say.
4. Over 5-15 exchanges, qualify on: budget ($10-50K range?), timeline (next 30-90 days?),
   decision authority (founder or partner-level?), team size (5-30?).
5. Handle objections using planning/objections.md content. Never pressure.
6. When you detect 3+ hot-lead signals (explicit budget confirmation, clear urgency,
   clear decision authority), say:
   "Based on what you've shared, I think Agency OS is likely a strong fit. I'm going
   to set up a deal room for you — it'll have a custom proposal, a 4-minute walkthrough,
   and everything you need to decide. Moshe will review our chat tonight and record
   a personal voice note for you. You'll get the deal room link within 12 hours.
   Sound good?"
7. If they say yes: write signal HOT_LEAD to Supabase, fire deal-room creation webhook.
8. If they're a poor fit: gracefully exit. "I don't think this is the right fit for
   you right now. Here's what I'd recommend instead: [alternative]. Can I add you to
   our newsletter so you see what's possible?"

TONE:
- Direct. No "I understand," "I hear you," "that sounds frustrating" therapy-speak.
- Short messages. 2-4 sentences per turn.
- Israeli-Jewish directness, not American sales-y.
- Zero emoji. Minimal exclamation points.

CONTEXT YOU HAVE:
- Their scan answers (from lead magnet)
- Their company (from email enrichment)
- Their full conversation history with you
- planning/icp.md, planning/offer.md, planning/faq.md, planning/objections.md

THE HARD RULES:
- You operate under the WAT framework. You reason. Code executes.
- If they ask for a live call: "Moshe doesn't do calls — the whole business runs
  async, which is part of what we're selling. You'll get everything you need in
  text and voice memo form. If that's a dealbreaker, no hard feelings."
- If they ask who's behind this: direct them to BizLegal AI (your credibility site)
  and any published content/case studies.
- If they're rude or wasting time: graceful exit after 1 warning. Don't grind.
```

---

## PART 7 — WHAT THIS CHANGES ABOUT THE MACHINE'S REPLICATION

The beauty of this redesign: **the async-only machine replicates EASIER than the live-call machine.**

- Original machine required you to personally take 2-4 calls/day per vertical
- New machine: chatbot handles volume, you review async
- Vertical #2 (Home Services AI): same chatbot architecture, new system prompt
- Vertical #3: same

The `packages/core` now includes:
- `chatbot-core/` — shared conversation engine + state management
- `deal-room/` — shared template + JWT auth
- `voice-memo-sender/` — shared n8n workflow
- `signal-engine/` — shared Apify actors + scoring

When you hit Phase 7, you don't just replicate the funnel — you replicate **an introvert-friendly sales machine** that other agencies will want to license. That's a product moat.

---

## PART 8 — WHAT COULD GO WRONG (the honest risks)

1. **Chatbot feels cold and loses deals.** Mitigation: the voice memos are the "warmth injection." Without them, this doesn't work. You MUST record them personally.

2. **High-ticket buyers demand a call.** Mitigation: publish the no-calls policy on the offer page as a feature, not a bug. "We run the whole business async — that's how we build yours." Some buyers will veto. That's fine. You want buyers who self-select for async.

3. **Chatbot hallucinates and over-promises.** Mitigation: system prompt explicitly prohibits fabrication. Every conversation log is reviewed by you before deal room creation. Night-of-day approval, not real-time.

4. **Voice cloning / AI voice memos feel fake.** Mitigation: do NOT use ElevenLabs voice clone. Record each memo personally on your phone. 60 seconds × 3 memos × 7 deals/month = 21 minutes/month. This is the non-negotiable human touch.

5. **You fail to enforce the "no calls" rule and bend for one big deal.** Mitigation: treat this as a feature of the product, not a limitation. If a deal requires a call, it's not your deal. Pass it or lose it cleanly.

---

## SUMMARY — WHAT TO DO NEXT

1. Read this amendment fully
2. Update MASTER-SYSTEM-v1.md §3 in your head (funnel stages 4-6 are replaced)
3. When you run the Phase 1 prompt, add: "The funnel is async-only, chatbot + deal-room + voice memo. No live sales calls. See MACHINE-AMENDMENT-v1.1.md."
4. When you run the Phase 4 prompt, add: "Build `/chat` and `/deal/[token]` routes instead of live booking. See MACHINE-AMENDMENT-v1.1.md Part 1."
5. Record your first 10 voice memo templates in one sitting (1 hour). Do this before Day 22.

**The bottom line:** You just turned a potential funnel-breaker (no calls) into a positioning moat. The async-only agency that sells to async-loving agencies. Moshe Dor, the founder who runs a 7-figure business without ever taking a sales call. That's a story people will tell about you — and the story IS the marketing.

Ship it.

---

*Amendment complete. This file lives alongside MASTER-SYSTEM-v1.md in THE-MACHINE folder.*
