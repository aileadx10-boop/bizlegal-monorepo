# Product Schema — Reviews Checklist (2026-07-10)

## The GSC warning

Google Search Console flagged 3 non-critical issues in
`apps/hub/app/page.tsx` for `bizlegal-ai.com`:

1. **Missing `availability` in `offers`** — fixed in commit pending
2. **Missing `aggregateRating`** — INTENTIONALLY OMITTED, see below
3. **Missing `review`** — INTENTIONALLY OMITTED, see below

## Why aggregateRating and review are NOT in the schema

Google's structured data guidelines (and schema.org policy) explicitly
**forbid fabricated reviews and ratings.** Quoting Google's
"Spammy structured content" policy:

> "We don't allow review markup to be added to pages that don't have
>  user-generated reviews. Review markup should only be added to pages
>  that have authentic user reviews."

If we add `aggregateRating: { ratingValue: "4.8", reviewCount: "23" }`
to a Product schema and there are no real reviews backing that, the
site can be removed from Google search results entirely (manual action).

**The current state (2026-07-10):** no customer testimonials on the
hub, no third-party review platform (G2/Capterra/Trustpilot) profile
for BizLegal AI, no `review` schema on any product page. The honest
data is: 0 reviews, no rating.

The schema fix in commit pending adds the 5 fields that are
factually true (availability, sku, brand, image, seller) and omits
the 2 that would be fabricated.

## How to add real reviews when they exist

Once you have authentic customer reviews, here is the recipe:

### Sources
- **Direct testimonials** on the hub (`/testimonials` page, in the
  hero, or in product-specific pages) — must include real name,
  real company, real permission to publish.
- **G2 / Capterra / Trustpilot / GetApp profile** for BizLegal AI.
  Apply to all 4 platforms; reviews come in over 2-6 months.
- **Twitter/LinkedIn public posts** mentioning BizLegal AI
  positively (with permission to quote). The `author` field can be
  a `Person` with their real profile URL.

### Schema template (paste this into the Product once 5+ reviews exist)

```json
{
  "@type": "Product",
  ...
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "<mean of authentic reviews, 1-5>",
    "reviewCount": "<total count of authentic reviews>",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "<real name>" },
      "datePublished": "<YYYY-MM-DD>",
      "reviewBody": "<verbatim quote from real review>",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "<the rating they gave, 1-5>",
        "bestRating": "5"
      }
    }
  ]
}
```

### Guardrails
- Only use reviews that are <12 months old
- Don't round up ratings ("3.7" not "5.0")
- Don't truncate or paraphrase the `reviewBody` — verbatim only
- Don't include reviews from anyone who hasn't used the product
  in the last 12 months
- Don't include reviews from employees, contractors, or
  investors (conflict of interest)
- Display the same reviews on the page the schema is on —
  the schema and the visible content MUST match

## How to know when it's safe to add

Minimum thresholds before adding `aggregateRating`:
- 5+ authentic reviews
- Each from a real customer
- Each with permission to publish
- Each <12 months old
- Each visible on the same page (or a /testimonials page linked
  from the product page)

## Related
- `apps/hub/app/page.tsx` lines 230-240 — the schema fix comment
- `services/seo-agents/seo_content_writer.py` — the content engine
  that should be pointed at the /testimonials page when it exists
