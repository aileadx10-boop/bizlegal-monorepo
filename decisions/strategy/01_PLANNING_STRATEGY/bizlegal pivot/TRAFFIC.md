# BizLegal-AI — Traffic engine

**Goal:** drive qualified traffic to the revenue surfaces (Forge BOI Kit $149, Pro $149/mo, TRACR $149-500, OCI realestate referrals). Single most leveraged metric in [FINANCIALS.md](FINANCIALS.md).

**Constraints:**
- Ethical only (respect robots.txt, no auth-required content, no fake accounts, no auto-posting that violates platform ToS).
- Mostly autonomous (low Moses-time per week).
- Compounding (organic SEO + community presence > paid bursts).
- **All scrapers run on Hetzner CX32 (existing) using n8n + Crawlee + Ollama on laptop GPU via tunnel. Zero new infra cost.**

---

## 1. The funnel, ranked by leverage

```
                 Audience
                    │
     ┌──────────────┴────────────────┐
     │                               │
  Discovery scrapers           Content scrapers
  (where do they live?)        (what works there?)
     │                               │
     └──────────────┬────────────────┘
                    ▼
          Posting cadence (weekly)
            ├─ LinkedIn (Moses voice)
            ├─ Reddit (r/CTAReporting, r/UAE, r/CryptoCurrency, r/SmallBusiness)
            ├─ HackerNews (Show HN: Forge BOI Kit, when ready)
            ├─ Twitter/X (compliance niche)
            └─ Substack cross-post (regulator-of-the-week)
                    │
                    ▼
                  Blog
        (blog.bizlegal-ai.com — Hetzner curator)
                    │
                    ▼
                  Hub
        (bizlegal-ai.com — Today's Brief + Product Digest)
                    │
                    ▼
        Product surfaces (Forge / Pro / TRACR / OCI)
                    │
                    ▼
                Revenue
```

---

## 2. The four scraper agents

Each is a **separate n8n workflow** on Hetzner. Output is a Telegram digest to Moses 1-2× per week — Moses skims, picks 3-5 actions, executes manually. No auto-posting.

### Scraper 1 — `discovery-scout`
**Cadence:** weekly Sunday 20:00 UTC.

**Sources:**
- Reddit JSON API: top posts past 7 days from r/CryptoCurrency, r/Bitcoin, r/UAE, r/dubai, r/SmallBusiness, r/CTAReporting, r/legalpracticemanagement, r/CommercialRealEstate, r/RealEstateInvesting, r/ynab (for budgeting/family-office adjacents).
- HackerNews: search "BOI report", "FinCEN", "MiCA", "VARA", "compliance" past 30d.
- LinkedIn (via SerpAPI free tier): public posts mentioning "compliance officer", "BOI report", "Reg D 506c", "DIFC SPV".
- Indeed + LinkedIn jobs: "compliance officer" + jurisdiction tags.

**Filter:** Ollama `llama3.2:3b-instruct` (laptop GPU) returns relevance score 1-5 per post for our 4 personas (US LLC owner, UAE founder, crypto investigator, real-estate syndicator).

**Output:** Telegram digest with top 10 ranked actions, format:
```
[Score 5] r/CTAReporting: "BOI deadline confused — am I exempt?" (124 comments)
URL: https://reddit.com/r/CTAReporting/...
Suggested action: comment with link to bizlegal-ai.com/forge/boi (free assessment) + 1-paragraph clarification.
```

**Implementation:** ~200 lines of n8n workflow + a 30-line Ollama call.

### Scraper 2 — `content-winner`
**Cadence:** weekly Monday 06:00 UTC.

**Sources:**
- Top 50 posts past 14d from each compliance/fintech Substack: Matt Levine, Bits About Money, Fintech Brainfood, Net Interest, Money Stuff (already public).
- Top 50 posts past 14d from r/Bitcoin / r/CryptoCurrency / r/SmallBusiness sorted by upvotes.
- LinkedIn top compliance posts past 14d (via SerpAPI or a public tool).

**Filter:** Ollama extracts "what's the hook?" + "what format?" + "what jurisdiction?" + "is this in our wheelhouse?".

**Output:** Telegram digest of 5 winning content patterns + a draft hook for our blog factory:
```
Pattern: "Regulator X just did Y. Here's what 3 affected groups should do."
Top examples:
  1. https://substack.com/.../mica-cmu-letter (3200 likes, 89 reposts)
  2. https://reddit.com/.../sec-enforcement-summary (1100 upvotes)
Suggested blog post for Hetzner curator:
  Title: "FinCEN's BOI 2026-04 update: what 3 LLC archetypes need to do this week"
```

This is the seed for the Hetzner scout flow. Currently the scout uses RSS only — adding `content-winner` output as a 6th source dramatically improves blog topic quality.

**Implementation:** ~150 lines.

### Scraper 3 — `partner-prospect` (OCI revenue path)
**Cadence:** weekly Tuesday 06:00 UTC.

**Sources:**
- Public RERA registry (UAE realtors with active licenses) — filter by "commercial" + "JV" + "DIFC" experience.
- LinkedIn Sales Navigator alternative free APIs (e.g., RocketReach trial, Apollo.io free tier 50/mo) for US securities lawyers Reg D 506(c).
- Public attorney directories (e.g., Avvo, Martindale-Hubbell) filtered by practice area + jurisdiction.
- Crunchbase free tier for family offices in UAE/SG/EU.

**Filter:** Ollama scores 0-10 on "would they accept a finder-fee referral arrangement" based on profile signals (size, fee bands, partner mentions).

**Output:** Telegram digest of 5-10 ranked partner candidates per week + a draft outreach email:
```
[Score 8] John Smith, Greenberg Traurig
  Practice: Reg D 506(c), Texas multifamily syndication
  LinkedIn: ...
  Fit: closes 2-5 deals/mo at $25-50K avg legal fee → 15% finder = $3.7K-7.5K per close
Draft email:
  Subject: 506(c) deal flow — 15% intro on a closed engagement?
  Body: ...
```

**Implementation:** ~250 lines (more complex source mix).

**Critical:** Moses sends every outreach **manually**. This scraper is a **shortlister, not a sender**. Auto-emailing prospects without an existing relationship is illegal in many jurisdictions (GDPR/CAN-SPAM/CASL) and unethical regardless.

### Scraper 4 — `backlink-opportunity`
**Cadence:** monthly first Monday 06:00 UTC.

**Sources:**
- Crawlee + a small index of regulator pages, fintech directories, compliance resource pages.
- Find broken external links pointing OUT of those pages → opportunity to suggest BizLegal as a replacement.
- Find pages that link to our competitors → outreach for a mention.
- Find guest-post submissions open at industry blogs.

**Filter:** Ollama scores domain authority (using a free DA estimate via Open PageRank API) + topical fit.

**Output:** Telegram digest of 3-5 high-leverage outreach targets per month + draft pitch.

**Implementation:** ~200 lines.

---

## 3. Posting cadence (the human side)

Scrapers find **opportunities**. Moses posts the **content**. Mix:

### Weekly (Moses, ~2 hours total)
- **Mon:** post 1 LinkedIn — pull from `content-winner` digest.
- **Wed:** post 1 Reddit comment in a relevant thread from `discovery-scout` digest.
- **Fri:** post 1 Twitter/X thread with the week's blog post link.

### Monthly (Moses, ~4 hours)
- 1 deep-cut LinkedIn article (1500 words) on a regulator-of-the-month topic.
- 1 outbound to 3-5 partner prospects (OCI revenue path) from `partner-prospect` digest.
- 1 Substack cross-post.

### Compounding (set-and-forget)
- Hetzner blog factory ships 2-3 posts/week → 100-150/year.
- Each post earns 5-50 organic visits/mo at peak after Google indexes (8-26 weeks lag).
- Year 2 baseline: 5,000-15,000 organic visits/mo to the blog → ~1,000-3,000 visitors clicking through to product pages → 5-15 BOI Kit sales/mo just from organic.

---

## 4. Distribution checklist for each new blog post

1. Hetzner publisher commits MDX + hero image → blog.bizlegal-ai.com auto-rebuilds.
2. Auto-tweet a thread (3 tweets: hook + 1 stat + link + visual).
3. Auto-post to LinkedIn page (different framing than Twitter; 250 words).
4. Add to next week's "Today's Brief" mirror on hub homepage (already automated via blog-feed.ts).
5. Cross-post to a relevant Substack via "Notes" feature.
6. Monthly: round-up post on r/CryptoCurrency / r/SmallBusiness / r/UAE — "Top 5 compliance posts I read this month" with 1 of ours bundled in.

Items 2-5 are zero-effort once n8n is wired. Hetzner can run them automatically. Item 6 is human, monthly.

---

## 5. Top-of-funnel measurement

Three numbers, weekly review:

| Metric | Source | Target by month 3 |
|---|---|---|
| Unique visitors to bizlegal-ai.com / week | Cloudflare Analytics | 500 |
| Click-through to a product page / week | CF Analytics | 100 |
| Conversions (any payment / lead capture) / week | Supabase | 5 |

If conversions stall at 0-1: top of funnel is fine, mid-funnel is broken (homepage or product page CTA).
If clicks stall at <20: top of funnel is the problem.

---

## 6. Implementation sequence

### Week 1 (this week, 2026-04-27 → 2026-05-03)
1. Ship `discovery-scout` n8n workflow (highest ROI, simplest).
2. Wire its Telegram digest → Moses receives Sunday 20:00 UTC.
3. Moses spends 30 min Mon morning picking 3 actions to execute.

### Week 2-3
4. Ship `content-winner`. Feed its output into the Hetzner curator's scout flow.
5. Ship `partner-prospect`. First 3 partner-outreach emails go out from Moses (manual).

### Week 4
6. Ship `backlink-opportunity`. Lower priority — runs monthly.

### Month 2+
7. Wire auto-distribution n8n workflow: blog publish → Twitter + LinkedIn auto-post (Moses approves each via Telegram before fire).
8. Monthly: human-review the metrics in §5; double down on what's working, kill what isn't.

---

## 7. What NOT to build

- ❌ Automated posting to platforms that ban it (Reddit, LinkedIn, Twitter/X all have anti-bot ToS).
- ❌ Fake accounts. Moses posts as Moses, period.
- ❌ Mass cold email harvested from scrapers — illegal under CAN-SPAM (US), CASL (Canada), GDPR (EU). Outreach must be manually personalized + opt-out documented.
- ❌ Any scraper that requires bypassing auth or solving CAPTCHAs. If it's that hard, the data isn't worth it.
- ❌ Scrapers for paid content (Substack paid tier, Bloomberg, etc.). Public-only.

---

## 8. Code skeleton (where the scrapers live)

```
bizlegal-ea/
└── projects/
    ├── traffic-scrapers/                 # NEW
    │   ├── discovery-scout/
    │   │   ├── workflow.json             # n8n export
    │   │   ├── prompts/score.txt
    │   │   └── README.md
    │   ├── content-winner/
    │   ├── partner-prospect/
    │   └── backlink-opportunity/
    └── bizlegal-lead-intake/             # existing EA Worker
```

Each subdir is a self-contained n8n workflow + Ollama prompt + README. Imports cleanly into n8n. Zero infra changes.

---

## 9. Estimated impact (P50 path)

If all 4 scrapers ship by end of May 2026, Moses posts on cadence, and the blog factory keeps shipping 2-3/week:

| Month | Hub visitors / mo | Conversions / mo | Net revenue / mo |
|---|---|---|---|
| May | 800 | 4 | $1,500 |
| Jun | 1,500 | 8 | $2,500 |
| Jul | 2,500 | 12 | $3,500 |
| Aug | 4,000 | 18 | $4,800 |
| Sep | 6,000 | 25 | $7,000 |
| Oct | 8,500 | 35 | $9,500 |

Compounding kicks in around month 3. By month 6, organic + community traffic exceeds anything paid would buy.
