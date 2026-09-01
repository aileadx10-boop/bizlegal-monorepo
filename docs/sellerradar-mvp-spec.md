# SellerRadar — MVP Spec (Sabrina-style)

**Status:** approved for build · **Date:** 2026-08-24 · **Owner:** Moses (review) / agent marathon (build)

## 1. Objective

Marketplace fee-change impact monitoring. SellerRadar detects Amazon fee-schedule changes and tells each seller exactly what the change costs them per SKU per year. Archetype: "Change → Impact → Alert". Sellers already pay for tools that show them data; nobody tells them the dollar impact of a fee change on THEIR catalog.

## 2. User

- Marketplace sellers, $100K–$5M annual revenue, Amazon-first.
- Hang out on r/FulfillmentByAmazon, seller forums, faceless YouTube.
- Self-serve buyers when the value prop is a dollar number.

## 3. Success criteria

| # | Criterion | Verify |
|---|-----------|--------|
| 1 | Fee parser covers ≥ 3 fee types (referral, FBA fulfillment, storage) | Known historical fee changes detected from test fixtures |
| 2 | CSV upload parses real seller exports | 50-SKU test CSV parses < 10s, validation errors are human-readable |
| 3 | Margin calculator accurate within 10% | Fixture with known fee change → impact matches hand-computed value |
| 4 | Output speaks dollars | "This change reduces your margin by X% on Y SKUs, estimated $Z/year" |
| 5 | $49 audit + $99/mo monitor checkouts work | hub apex checkout, end-to-end test |
| 6 | Programmatic SEO live | fee-change event → indexable page < 1 hr |
| 7 | Build green | typecheck + `next build` exit 0 |

## 4. Scope

**In scope (MVP):**
- Next.js app at `apps/sellerradar` (deploys to `sellerradar.bizlegal-ai.com`)
- Landing, pricing, CSV upload flow, results/impact page, monitor dashboard
- Amazon fee schedules as versioned data (seeded from public docs; curated fixtures — NOT live scraping in v1)
- Fee types v1: referral fee %, FBA fulfillment fee (size/weight tiers), monthly storage fee
- Diff engine: current vs previous schedule → per-SKU impact = (new_fee − old_fee) × est. monthly units
- CSV upload: SKU, ASIN, category, dimensions, weight, COGS, price, est. monthly units (flexible header mapping)
- $49 one-time audit: CSV in → PDF impact report → email
- $99/mo monitor: weekly re-scan when schedules update, alert email with personal impact, dashboard
- Programmatic SEO: `/seo/[fee-type]-change-[date]` pages with impact-calculator embed
- Checkout via hub apex (`product=sellerradar`, `tier=audit|monitor`)
- Ops events via `@bizlegal/ops-log`

**Out of scope (MVP):**
- SP-API integration (needs Amazon Developer approval + US LLC — Moses, later)
- Etsy / TikTok Shop / Walmart (Amazon only)
- PPC fee analysis, inbound placement, aged-inventory surcharges (v2)
- No repricing advice, no "guaranteed savings" claims (liability shrinker)

## 5. Tech stack

- Next.js app in monorepo, mirrors `apps/brai` structure
- Supabase primary project: `fee_schedules` (fee_type, category, tier, rate, effective_date, source_url), `seller_skus`, `sellerradar_monitors`
- Fee data: curated JSON fixtures versioned in-repo (`apps/sellerradar/data/fee-schedules/`) + admin refresh path; live scraping deferred (Amazon blocks + ToS)
- CSV parsing: papaparse (already common in fleet — verify) or tiny hand-rolled parser
- PDF reports: fleet PDF pattern
- Recurring: NOWPayments re-bill cron + PayPal gated on `PAYPAL_PLAN_ID_SELLERRADAR_MONITOR_MONTHLY` (Moses handoff)

## 6. Timeline

Built in one marathon session after FalseEcho scaffold is proven. Deploy blocked only on: Vercel project + DNS (agent attempts), PayPal plan ID (Moses), real-money test (Moses).

## Liability shrinkers

- Impact figures labeled "estimate — verify against your settlement reports"
- Fee data citations: every schedule row carries source_url + effective_date
- No financial/tax advice disclaimer on every report
