/**
 * GapPage — canonical row type for the `public.gap_pages` Supabase table.
 *
 * This file is the single source of truth for the row shape. Consumers:
 *
 *   - apps/forge/apps/web/app/sitemap.ts — pulls slim projection
 *   - apps/forge/apps/web/app/gap/[jurisdiction]/[slug]/page.tsx — full row
 *   - apps/forge/apps/web/app/api/scout/route.ts (writer side, untyped today)
 *
 * Schema source: apps/forge/infra/gap_pages_table.sql (base) + the
 * 2026-05-09 migration `services/hetzner/supabase/migration-gap-pages-
 * enrich.sql` (W3.2 enrichment columns).
 *
 * Audit reference: TYPE-DESIGN-WEEK3PRE-2026-05-09.md F-6.
 */

/**
 * Sub-products that gap-pages can route their CTA to. Mirrors the
 * `gap_pages.cta_product` CHECK constraint (post-W3.2 enrichment migration).
 */
export type GapCtaProduct =
  | 'forge'
  | 'tracr'
  | 'brai'
  | 'lexaudit'
  | 'docai'
  | 'leadforge'

/**
 * Editorial categorisation produced by brain.py (filter classification
 * over the source RSS item before drafting). Constrained for sitemap-
 * index categorisation + dashboard filters.
 */
export type GapCategory =
  | 'regulation'
  | 'enforcement'
  | 'guidance'
  | 'jurisdiction-arbitrage'

/**
 * Structured FAQ entry. Renderer at `gap/[jurisdiction]/[slug]/page.tsx`
 * emits FAQPage JSON-LD when ≥1 entry exists. brain.py is responsible for
 * generating these — the W3.2 prompt update lands the field.
 */
export type GapFaqEntry = { readonly q: string; readonly a: string }

/**
 * Full row shape. All fields except `slug`, `title`, `jurisdiction`,
 * `risk_score`, `summary`, `cta_product`, `published_at` are optional —
 * back-fill rows pre-W3.2 enrichment have null/empty enrichment fields.
 */
export type GapPage = {
  readonly id?: string
  readonly slug: string
  readonly jurisdiction: string
  readonly title: string
  readonly risk_score: number
  readonly summary: string
  readonly regulation: string
  readonly cta_product: GapCtaProduct
  readonly cta_url?: string | null
  readonly meta_description?: string | null
  readonly value_props?: ReadonlyArray<string> | null
  readonly lead_magnet_title?: string | null
  readonly lead_magnet_url?: string | null

  // W3.2 enrichment columns.
  readonly category?: GapCategory | null
  readonly primary_keyword?: string | null
  readonly secondary_keywords?: ReadonlyArray<string> | null
  readonly tags?: ReadonlyArray<string> | null
  readonly faqs?: ReadonlyArray<GapFaqEntry> | null

  // E-E-A-T fields surfaced by the page renderer's ATTRIBUTION block.
  readonly author_name?: string | null
  readonly author_role?: string | null
  readonly author_bio?: string | null
  readonly reviewer_name?: string | null
  readonly reviewer_role?: string | null
  readonly reviewed_at?: string | null

  readonly published_at: string
  readonly updated_at?: string | null
  readonly created_at?: string | null
}

/**
 * Slim projection used by sitemap.ts — only fields needed for `<url>` and
 * `<lastmod>` emission. `updated_at` falls back to `published_at` when
 * the row pre-dates the W3.2 trigger.
 */
export type GapPageSitemapRow = Pick<
  GapPage,
  'slug' | 'jurisdiction' | 'published_at' | 'updated_at'
>

/**
 * Type-guard for `gap.faqs` JSONB rows. The audit (type-design F-9)
 * flagged the implicit narrowing in the renderer — use this guard to
 * filter the column safely.
 */
export function isFaqEntry(x: unknown): x is GapFaqEntry {
  if (typeof x !== 'object' || x === null) return false
  const r = x as { q?: unknown; a?: unknown }
  return typeof r.q === 'string' && typeof r.a === 'string'
}

/**
 * Build the canonical public URL for a gap-page. Centralised so sitemap,
 * page metadata, and Article/JSON-LD all agree on slug/jurisdiction
 * normalisation.
 */
export function gapPageUrl(row: Pick<GapPage, 'slug' | 'jurisdiction'>): string {
  const j = (row.jurisdiction || 'global').toLowerCase().replace(/\s+/g, '-')
  return `https://forge.bizlegal-ai.com/gap/${j}/${row.slug}`
}
