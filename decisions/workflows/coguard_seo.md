# CoGuard SEO Acquisition Workflow

**WAT layer:** Workflow (this SOP)
**Agent:** Hetzner curator pipeline (existing `brain.py` + `publisher.py`)
**Tools:** Programmatic Next.js pages + existing SEO infrastructure

---

## Objective

Capture high-intent co-parenting communication software searches via:
1. 20-30 programmatic comparison landing pages
2. 10-15 long-form informational blog posts via existing Hetzner curator
3. Schema markup (SoftwareApplication + FAQPage)

No cold outreach. All inbound. Hard rule #7 compliant.

---

## Target Keywords (Priority Order)

| Cluster | Volume Est. | Intent | Page |
|---|---|---|---|
| "ourfamilywizard alternative" | 3K/mo | High | /vs/ourfamilywizard |
| "talkingparents alternative" | 1.5K/mo | High | /vs/talkingparents |
| "co-parenting app court admissible" | 800/mo | High | /features/court-admissible |
| "coparenting communication app" | 5K/mo | Mid | / (landing) |
| "parallel parenting communication tool" | 600/mo | High | /vs/ourfamilywizard#parallel |
| "high conflict custody communication" | 2K/mo | High | /blog/high-conflict-custody |
| "biff communication co-parenting" | 400/mo | High | /biff-method |
| "email evidence family court" | 1.2K/mo | High | /features/court-binder |
| "coparenting email documentation tool" | 700/mo | High | /features/court-binder |
| "document custody communication" | 900/mo | High | /features/immutable-log |

---

## Programmatic Comparison Pages

Template: `apps/coguard/app/vs/[competitor]/page.tsx`

Competitors to target (20-30 pages):
- OurFamilyWizard ($16.95-$24.95/mo) — high price, no BIFF, no court binder
- TalkingParents (free/$8.29/mo) — basic logging, no AI neutralization
- 2houses ($13.99/mo) — schedule-focused, no evidentiary features
- AppClose (free) — limited, no legal features
- Custody X Change (scheduling) — different use case, cross-sell angle
- coParenter (messaging) — no AI, no binder
- WeParent (free) — no evidentiary features
- FamilyWall (free) — family calendar, no legal
- Docketwise (legal software) — different audience, comparison angle

Each page:
- H1: "CoGuard vs {Competitor} — [2026 Comparison]"
- Feature table (BIFF neutralization, SHA-256 logging, court binder, attorney portal, pricing)
- "Why subscribers switched" section
- Pricing comparison
- CTA to free trial / pricing

---

## Informational Blog Posts (via Hetzner Curator)

Feed to `daily_gaps` table with vertical_interest='co-parenting':

1. "BIFF Method for Co-Parenting: The Complete Guide (With Examples)"
2. "How to Document Co-Parenting Communication for Court"
3. "7 Signs You Need a Co-Parenting Communication App"
4. "What Makes Co-Parenting Emails Admissible in Family Court?"
5. "Parallel Parenting vs Co-Parenting: Which Communication Style?"
6. "How to Stop High-Conflict Co-Parenting Emails From Escalating"
7. "Court Binder for Custody Cases: What to Include and How to Format"
8. "BIFF vs. DEAR MAN: Communication Methods for High-Conflict Co-Parenting"
9. "Attorney Tips for Co-Parenting Communication Documentation"
10. "How AI Can Help High-Conflict Custody Communication Stay Professional"

---

## Schema Markup

Add to landing page and /pricing:
```json
{
  "@type": "SoftwareApplication",
  "name": "CoGuard",
  "applicationCategory": "Communication Software",
  "operatingSystem": "Web",
  "offers": [
    { "@type": "Offer", "name": "Solo Shield", "price": "14.99", "priceCurrency": "USD" },
    { "@type": "Offer", "name": "Litigation", "price": "29.99", "priceCurrency": "USD" }
  ],
  "description": "AI co-parenting communication platform with BIFF neutralization and court-admissible evidence logging"
}
```

Add FAQPage schema on /features/court-admissible with the 5 most common questions.

---

## Growth Loops

1. **Binder footer → attorney → firm referral**: Attorney sees binder footer → asks client what they used → searches CoGuard → firm buys Litigation plan for all clients
2. **Outgoing footer → ex discovers → ex subscribes**: BIFF footer on every sent reply → ex-partner sees professional communication tool → searches → subscribes (solo plan)
3. **Comparison pages → long-tail traffic**: "OurFamilyWizard too expensive" searches → /vs/ourfamilywizard → CoGuard pricing

---

## Execution

Phase 1 (immediate): Scaffold /vs/[competitor] dynamic route + comparison table component
Phase 2 (Week 2): Populate 5 highest-priority comparison pages
Phase 3 (Week 3): Feed 10 blog topics to Hetzner curator via daily_gaps
Phase 4 (Ongoing): Schema markup + IndexNow submissions via gsc-bot

---

## Competitor Research Notes

OurFamilyWizard pricing: $16.95-$24.95/mo per parent (both parents must subscribe for max features).
CoGuard advantage: Only ONE subscription needed. BIFF AI. Court binder. Attorney portal.
Price advantage at Solo: $14.99 vs $33.90+ (both parents at OFW base plan).
