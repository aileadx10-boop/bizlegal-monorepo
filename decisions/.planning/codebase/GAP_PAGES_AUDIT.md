# Retroactive gap_pages Audit — 2026-05-05

Ran `quality_gate.audit()` against the 3 rows currently in `gap_pages` on Supabase project `ydghhcuuopqzgqcicubg`.

## Result: all 3 fail every BLOCK gate

| slug | citations | visuals | words | FAQ | em-dash density |
|---|---|---|---|---|---|
| fincen-travel-rule-defi-compliance | 0 | 0 | 106 | none | ok |
| fincen-kyc-defi-stablecoin-compliance | 0 | 0 | 105 | none | 9.5/1000 (limit 3) |
| fincen-defi-bo-audit-guidance-2026 | 0 | 0 | 118 | none | ok |

All have `value_props` arrays (3 each) but the `summary` field is the only prose body — ~100 words.

## Why these failed (and what it means)

These rows are **seeded teasers**, not curator output. The Forge gap-page renderer at `apps/forge/apps/web/app/gap/[jurisdiction]/[slug]/page.tsx` displays:
- Risk badge + jurisdiction + regulation
- Title + 1-paragraph summary
- 3 value-prop cards
- CTA button
- Optional lead-magnet card

That's an upsell landing page, not an article. quality_gate's 800-word minimum and ≥3-citation rule were designed for the full curator pipeline that writes MDX to:
- `aileadx10-boop/bizlegal-ea` blog (always) — full articles, where quality_gate properly applies
- `aileadx10-boop/forge` repo dual-deploy (conditional on FORGE_AFFINITY_TERMS) — also full articles

The Supabase `gap_pages` table is a **separate surface** populated by manual seeds (or possibly an n8n job). Curator publisher does NOT write to it.

## Recommendation: don't backfill now; redirect or rebuild later

Three options ranked by ROI:

### Option A — Redirect `/gap/{country}/{slug}` to corresponding blog article (recommended, ~30 min once articles exist)

Once the curator pipeline produces a full article in `bizlegal-ea/blog/{slug}.mdx` for one of these topics, add a redirect rule in Forge `next.config.js` so `/gap/united-states/fincen-defi-bo-audit-guidance-2026` 301-redirects to `https://blog.bizlegal-ai.com/blog/fincen-defi-bo-audit-guidance-2026`. Search engines consolidate ranking signal on the canonical full article. Forge keeps the lead-capture sidebar via interstitial or via a dedicated `/products/{slug}` route.

### Option B — Treat gap_pages as legitimate teaser pages with relaxed quality bar (~2 hours)

Add a `body_full` jsonb column to `gap_pages` with the full article text (citations + mermaid + FAQ). Update the renderer to show that instead of just the summary. Run a one-shot script that, for each existing row, calls Claude Sonnet with the row's regulation + jurisdiction context to produce the full body, runs quality_gate, writes back. Cost: ~$1 × 3 = $3.

### Option C — Backfill manually (~9 hours, lowest ROI)

Hand-write the missing citations + diagrams + FAQs for each of the 3 pages. Suited for one-off important pages but not a scalable pattern.

## What I'm doing about it

**Adding a per-source quality bar:** quality_gate stays strict for FULL articles (the curator drafts → blog/forge MDX). For the 3 existing gap_pages teasers, I'm leaving them as-is and queueing **Option A** as a Phase AA Week 3 task (right after we have ≥1 full article in each cluster to redirect to).

Until then, the 3 gap_pages will:
- Continue serving the schema.org JSON-LD I just added (Article + BreadcrumbList)
- Pull rendering authority from Forge's domain
- Drive lead-magnet captures via the sidebar
- Not rank organically (too thin) — fine, they're not the SEO surface

**Track this:** `decisions/.planning/codebase/GAP_PAGES_AUDIT.md` (this file).
