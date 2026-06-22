# SEO + Subscription Plan — $10K MRR Road Map
**Created:** 2026-06-23 | **Owner:** Moses  
**Goal:** $10,000 MRR from organic search alone (no paid ads, no outbound)

---

## Section 1 — Revenue Math: What $10K MRR Requires

| Scenario | Product | Price | Customers Needed |
|---|---|---|---|
| A — Blog + hub | Hub Pro | $149/mo | 68 |
| B — DocAI recurring | DocAI Team | $69/mo | 145 |
| C — Mixed stack | Hub Pro × 40 + DocAI Team × 58 | blended $105 | 95 |
| D — Scale anchor | Hub Scale × 10 + Hub Pro × 28 | blended $347 | 29 |

**Target:** Scenario C is most realistic. 95 paying users by month 6.  
**Traffic needed:** 1–3% trial→paid conversion → need 3,000–10,000 monthly signups → need ~100K monthly organic visitors.  
**Current:** estimated <5K/mo organic. Gap: 20–30× traffic growth.

---

## Section 2 — PayPal Subscription Plans to Create (Moses-only, browser)

**How to create:** PayPal dashboard → Catalog → Subscriptions → Plans → Create Plan.  
**Pattern:** Each plan creates a Plan ID (P-XXXX). Add as `PAYPAL_PLAN_ID_{PRODUCT}_{TIER}_{INTERVAL}` in Vercel env.

Priority order (highest MRR contribution first):

| Priority | Env var name | Product | Amount | Vercel project |
|---|---|---|---|---|
| 1 | `PAYPAL_PLAN_ID_HUB_SCALE_MONTHLY` | Hub Scale | $499/mo | bizlegal-ai |
| 2 | `PAYPAL_PLAN_ID_HUB_SCALE_YEARLY` | Hub Scale | $4990/yr | bizlegal-ai |
| 3 | `PAYPAL_PLAN_ID_CONDUCTOR_FIRM_MONTHLY` | Conductor Firm | $999/mo | bizlegal-ai |
| 4 | `PAYPAL_PLAN_ID_CONDUCTOR_FIRM_YEARLY` | Conductor Firm | $9990/yr | bizlegal-ai |
| 5 | `PAYPAL_PLAN_ID_HUB_PRO_MONTHLY` | Hub Pro | $149/mo | bizlegal-ai |
| 6 | `PAYPAL_PLAN_ID_HUB_PRO_YEARLY` | Hub Pro | $1490/yr | bizlegal-ai |
| 7 | `PAYPAL_PLAN_ID_LEXAUDIT_MIDMARKET_MONTHLY` | LexAudit Mid-market | $599/mo | lexaudit |
| 8 | `PAYPAL_PLAN_ID_LEXAUDIT_MIDMARKET_YEARLY` | LexAudit Mid-market | $5990/yr | lexaudit |
| 9 | `PAYPAL_PLAN_ID_LEXAUDIT_BOUTIQUE_MONTHLY` | LexAudit Boutique | $199/mo | lexaudit |
| 10 | `PAYPAL_PLAN_ID_LEXAUDIT_BOUTIQUE_YEARLY` | LexAudit Boutique | $1990/yr | lexaudit |
| 11 | `PAYPAL_PLAN_ID_CONDUCTOR_TEAM_MONTHLY` | Conductor Team | $250/mo | bizlegal-ai |
| 12 | `PAYPAL_PLAN_ID_CONDUCTOR_TEAM_YEARLY` | Conductor Team | $2500/yr | bizlegal-ai |
| 13 | `PAYPAL_PLAN_ID_DOCAI_FIRM_MONTHLY` | DocAI Firm | $199/mo | docai-frontend |
| 14 | `PAYPAL_PLAN_ID_DOCAI_TEAM_MONTHLY` | DocAI Team | $69/mo | docai-frontend |
| 15 | `PAYPAL_PLAN_ID_LEXAUDIT_MONITOR_MONTHLY` | LexAudit Monitor | $99/mo | lexaudit |

**After creating each plan:** copy the Plan ID (P-XXXX format) → add to Vercel env for the listed project → redeploy.

---

## Section 3 — Structured Data Shipped (already done, 2026-06-23)

- [x] `apps/hub/app/pricing/page.tsx` — FAQPage + SoftwareApplication + BreadcrumbList JSON-LD  
- [ ] `apps/docai/web/app/pricing/page.tsx` — FAQPage + Product schema (TODO)
- [ ] `apps/lexaudit/web/app/pricing/page.tsx` — FAQPage + Product schema (TODO)
- [ ] Per-agent pages on hub — SoftwareApplication schema (TODO)

---

## Section 4 — Blog SEO Content Pillars (blog.bizlegal-ai.com)

blog.bizlegal-ai.com is already live (209 posts, 5/week via CF Pages + curator).  
Focus: long-tail informational intent → capture at discovery → link to product.

### Pillar 1 — BOI Filing & FinCEN Compliance (→ hub)
Target keywords:
- "beneficial ownership reporting requirements 2024"
- "FinCEN BOI exemptions list"
- "BOI filing deadline foreign companies"
- "beneficial owner definition FinCEN"
- "CTA compliance checklist"

Hub internal link target: `/agents/boi-tracker`

### Pillar 2 — VARA & UAE Crypto Regulation (→ hub + tracr)
- "VARA license categories 2024"
- "Dubai crypto regulation requirements"
- "VARA virtual asset provider license"
- "UAE CBUAE DFSA overlap crypto"
- "ADGM crypto framework"

Hub internal link target: `/agents/ai-act` and `tracr.bizlegal-ai.com/pricing`

### Pillar 3 — SOC 2 & Compliance Automation (→ docai)
- "SOC 2 Type II questionnaire template"
- "SaaS vendor security questionnaire"
- "SOC 2 readiness checklist startup"
- "how to respond to security questionnaire fast"
- "SOC 2 AI assistant"

DocAI internal link: `docai.bizlegal-ai.com/sqa`

### Pillar 4 — GDPR / DPA for SaaS (→ docai)
- "data processing agreement template B2B SaaS"
- "GDPR DPA requirements 2024"
- "standard contractual clauses checklist"
- "sub-processor agreement obligations"
- "GDPR Article 28 vendor contract"

DocAI internal link: `docai.bizlegal-ai.com/dpa`

### Pillar 5 — Crypto Tax & Wallet Forensics (→ tracr)
- "crypto transaction history report"
- "blockchain wallet audit report"
- "crypto tax forensics tool"
- "DeFi transaction analysis compliance"
- "NFT tax implications 2024"

Tracr internal link: `tracr.bizlegal-ai.com/pricing`

### Pillar 6 — PSP / Payment Licensing (→ hub)
- "payment service provider license requirements"
- "EMI license EU requirements"
- "fintech license comparison EU vs UK"
- "PSD2 compliance requirements SaaS"
- "VASP registration checklist"

Hub internal link: `/agents/`

### Pillar 7 — Singapore PSA / MAS (→ hub + brai)
- "MAS DPT license requirements Singapore"
- "Singapore PSA payment license"
- "MAS major payment institution license"
- "Singapore crypto regulation 2024"

Hub + brai.bizlegal-ai.com links

### Pillar 8 — India DPDPA (→ hub)
- "India DPDPA data protection rules"
- "DPDPA compliance checklist SaaS"
- "India digital personal data protection act"
- "India data localization requirements"

---

## Section 5 — BizLegal Pages SEO: On-Page Improvements

### Hub (bizlegal-ai.com)

| Page | Current state | Action |
|---|---|---|
| `/pricing` | FAQPage + SoftwareApplication schema added 2026-06-23 | Done ✓ |
| `/agents` | ItemList schema exists | Add BreadcrumbList |
| `/agents/{slug}` | No schema | Add SoftwareApplication per agent + BreadcrumbList |
| `/snapshot` | No schema | Add WebApplication schema |
| `/` (homepage) | No schema | Add Organization + WebSite + SearchAction |

### Forge (forge.bizlegal-ai.com)

| Page | Action |
|---|---|
| `/` | Add Product schema for BOI Kit ($149), Passport ($297) |
| `/pricing` | Add FAQPage schema |

### BRAI (brai.bizlegal-ai.com)

| Page | Action |
|---|---|
| `/pricing` | Add FAQPage + Product schema ($99/mo monitor, $249 one-time) |

### LexAudit (lexaudit.bizlegal-ai.com)

| Page | Action |
|---|---|
| `/pricing` | Add FAQPage + Product schema |

### DocAI (docai.bizlegal-ai.com)

| Page | Action |
|---|---|
| `/pricing` | Add FAQPage + Product schema |
| `/sqa` | Add SoftwareApplication schema |
| `/dpa` | Add SoftwareApplication schema |

---

## Section 6 — Internal Linking Strategy

Every blog post must link to at least one product page with an exact-match anchor or close variant:

| Blog topic | Link target | Anchor text |
|---|---|---|
| BOI / FinCEN | hub `/agents/boi-tracker` | "BOI tracking agent" |
| SOC 2 questionnaire | docai `/sqa` | "SOC 2 questionnaire assistant" |
| DPA / GDPR | docai `/dpa` | "DPA negotiation tool" |
| Crypto forensics | tracr pricing | "wallet forensic report" |
| VARA / UAE | hub `/agents/` | "UAE regulatory intelligence" |
| LexAudit monitor | lexaudit pricing | "compliance health monitor" |
| Hub pricing | hub `/pricing` | "regulatory intelligence plan" |

**Blog → product CTAs:** Every post should end with a call-to-action section linking to the most relevant product with a 1–2 sentence pitch.

---

## Section 7 — Technical SEO Checklist

| Item | Status |
|---|---|
| llms.txt (AI bot crawl allowlist) | Shipped (commit e5abb5e) |
| IndexNow endpoint | Shipped (commit e5abb5e) |
| Canonical meta tags all surfaces | Fixed PR #49 |
| sitemap.xml all surfaces | Needs audit — hub has it, others TBC |
| robots.txt all surfaces | Needs audit |
| Open Graph images per product page | Missing — add 1200×630 OG images |
| Core Web Vitals < 2.5s LCP | Unknown — run Lighthouse |
| Mobile-first (all pages) | Unknown — test on 375px |
| Hreflang (en only for now) | Not needed until second language |

---

## Section 8 — 30/60/90 Day MRR Milestones (SEO path)

### Month 1 (now → 2026-07-23)
Goal: Technical foundation + 20 new SEO posts published + first 5 PayPal plans live
Actions:
- [ ] Create top 5 PayPal subscription plans (hub scale + pro)
- [ ] Add FAQPage/Product schema to docai + lexaudit pricing pages
- [ ] Add Organization + WebSite JSON-LD to hub homepage
- [ ] Publish 20 long-tail posts across pillars 1–4
- [ ] Submit all 8 surface sitemaps to GSC
- [ ] Set `NEXT_PUBLIC_SITE_URL` on all 4 sub-apps in Vercel UI

Expected: 0–3 paying customers, $0–$450 MRR

### Month 2 (2026-07-24 → 2026-08-23)
Goal: 100 blog posts live + first keyword rankings on page 2–3
Actions:
- [ ] Create remaining 10 PayPal plans
- [ ] Build per-agent JSON-LD structured data (12 agent pages)
- [ ] Add forge Product schema for BOI Kit + Passport
- [ ] Publish 20 more posts per week (curator + EA automation)
- [ ] Reddit + HN presence (2 posts/week in r/fintech, r/legaladvice, r/entrepreneur)

Expected: 5–15 paying customers, $750–$2,250 MRR

### Month 3 (2026-08-24 → 2026-09-23)
Goal: 200+ posts, first page 1 rankings, 30+ paying customers
Actions:
- [ ] FAQ-focused content targeting featured snippets (SOC 2, BOI, VARA questions)
- [ ] Link building: reach out to 5 fintech/compliance blogs for guest posts
- [ ] A/B test pricing page CTA copy
- [ ] Cold email 50 compliance managers with DocAI SOC 2 demo

Expected: 30–50 paying customers, $4,500–$7,500 MRR

### Month 4–6
- 300+ posts indexed, 10+ page-1 rankings, 50K+ monthly visitors
- SEO compound effect kicks in (domain authority builds)
- Target: 95+ customers → $10K MRR

---

## Section 9 — Quick Wins This Week

1. **Reddit posts** — Post in r/fintech, r/entrepreneur, r/legaltech with DocAI SOC 2 demo (no sales pitch, answer questions, link to free tool)
2. **GSC submissions** — Submit all 8 sitemaps to Google Search Console manually
3. **OG images** — Create a simple 1200×630 OG image for hub + docai pricing pages (use Canva)
4. **Hub homepage JSON-LD** — Add Organization + WebSite + SearchAction schema
5. **HN "Show HN"** — "Show HN: I built an AI that auto-drafts SOC 2 vendor questionnaire responses in 30 seconds" → links to docai.bizlegal-ai.com/sqa

---

## Section 10 — Blog Content Calendar (Next 4 Weeks)

| Week | Pillar | Title |
|---|---|---|
| W1 | BOI | "BOI Filing Deadline 2024: What Foreign Companies Need to Know" |
| W1 | SOC 2 | "How to Respond to a SOC 2 Questionnaire in Under 30 Minutes" |
| W1 | GDPR | "The 5 Things Your DPA Must Include in 2024 (Article 28 Checklist)" |
| W1 | VARA | "VARA Licensing in Dubai: Which Category Is Right for Your Crypto Business?" |
| W2 | BOI | "Beneficial Owner Definition: FinCEN's 5 Exemption Categories Explained" |
| W2 | SOC 2 | "SOC 2 Vendor Security Questionnaire Template (Free Download)" |
| W2 | PSP | "EMI License EU vs UK: Cost, Timeline, and Requirements Compared 2024" |
| W2 | Singapore | "MAS Digital Payment Token License: The Complete 2024 Application Guide" |
| W3 | Crypto tax | "How to Generate a Crypto Transaction History Report for Tax Purposes" |
| W3 | GDPR | "GDPR Data Processing Agreement for SaaS: Clause-by-Clause Breakdown" |
| W3 | India | "India DPDPA Compliance Checklist for B2B SaaS Companies" |
| W3 | BOI | "CTA Compliance Checklist: 12 Things to Do Before the BOI Deadline" |
| W4 | LexAudit | "What Is a Compliance Health Score and Why Your SaaS Needs One" |
| W4 | VARA | "ADGM vs VARA vs DIFC: Which UAE Crypto Framework Should You Register Under?" |
| W4 | SOC 2 | "AI Tools for SOC 2 Compliance: What Works and What Doesn't" |
| W4 | Hub | "How to Track 50+ Regulatory Jurisdictions Without a Compliance Team" |
