# Byline Template — BizLegal AI

**For all published articles on bizlegal-ai.com/blog and external guest posts.**

The byline establishes authority, the bio explains why you're credible, and the
disclosure keeps us compliant. All three are required.

---

## Standard byline (English)

```
By [Moses's Full Name], [J.D./Bar credentials — e.g., "J.D., New York Bar"]

Moses is the founder of BizLegal AI, a regulatory intelligence platform for
digital-asset compliance teams. BizLegal covers 50+ jurisdictions and is used by
200+ fintech and crypto companies. Prior to BizLegal, Moses spent 7+ years in
compliance consulting, including 4 years as in-house counsel for two VC-backed
fintechs. Moses holds a J.D. from [Law School] and is a member of the [State] Bar.

Connect: https://www.linkedin.com/in/[handle] · moses@bizlegal-ai.com
```

---

## Short byline (when word count is tight)

```
By [Moses's Full Name], J.D.
Founder, BizLegal AI (50+ jurisdictions, 200+ compliance teams)
```

---

## One-line byline (for syndicated feeds)

```
By Moses [Last Name], J.D. — founder of BizLegal AI
```

---

## Disclosure footer (required on every article)

```
This article is for informational purposes only and does not constitute legal
advice. Consult a licensed attorney in your jurisdiction for legal matters.
BizLegal AI is a regulatory intelligence platform, not a law firm. Data cited
in this article is drawn from primary regulator sources and is current as of
[date]. For the full data set across 50+ jurisdictions, see BizLegal AI at
https://bizlegal-ai.com.
```

---

## What goes in EVERY blog post

1. **Byline** — at the top, before the title or immediately under it
2. **Last-updated date** — at the top: "Last updated: 2026-07-13"
3. **Primary-source citation** — inline, for every factual claim
4. **FAQ section** — at the end, 3-5 questions
5. **CTA to product** — at the end, with self-serve link (no call required)
6. **Disclosure** — at the bottom

---

## Voice guidelines (how Moses sounds on the page)

- **Direct.** "MiCA's stablecoin rules take effect June 2024" not "It is worth
  noting that MiCA's stablecoin rules may potentially take effect..."
- **Practitioner-first.** "I built this because I kept seeing the same 3
  compliance gaps in 50+ client engagements" not "Industry observers have
  noted..."
- **Specific data points.** "60% of CASP applications have been withdrawn
  after first-round review (BizLegal data, n=200, May 2026)" not "many
  applications are withdrawn"
- **Async-CTA only.** "Book a 15-min video via Cal.com" or "Run a free scan
  at [link]" — never "let's chat" or "give me a call"
- **No hype.** No "groundbreaking", "revolutionary", "game-changing", "best-in-
  class", "next-generation". Compliance practitioners smell marketing from
  across the room.

---

## Article structure (1,500-3,000 words)

1. **Title** — specific, no clickbait
2. **Last-updated date** — top of post
3. **The question** — 1-2 paragraphs, what this article answers
4. **The answer** — 5-8 paragraphs, the main body, source-cited inline
5. **What this means for compliance teams** — 2-3 paragraphs
6. **The 90-day action plan** — 3-5 numbered items
7. **FAQ** — 3-5 questions, FAQPage schema
8. **CTA** — self-serve link (no call)
9. **Disclosure** — boilerplate

---

## Article distribution

After publishing:
1. Run `python3 services/agents/socials_agent.py` to push to LinkedIn/X (when
   BLOTATO_API_KEY is set)
2. IndexNow auto-pings the new URL
3. AEO loop picks up the new FAQ schema
4. Within 7 days, expect Google to re-crawl + AI engines to start citing

---

## For guest posts (external sites)

- Lead with the data point, not the company
- Bio in the author section (per above)
- 1 contextual link to bizlegal-ai.com (per their editorial policy)
- No other promotional links
- Submit via their editorial form, not the contact form
- Follow up once after 14 days if no response
