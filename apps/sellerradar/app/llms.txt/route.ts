import { buildLlmsTxt } from '@bizlegal/themes/seo'
import { TIER_PRICES_USD } from '@/lib/tiers'

/**
 * /llms.txt — AEO surface for AI crawlers (fleet convention, see hub and
 * bench). Body is assembled by packages/themes/src/seo.ts so the shape stays
 * identical across surfaces; the facts below come from lib/tiers.ts and the
 * pricing page, and must not outrun them. No outcome claims: this file says
 * what the product computes, never what it will save anyone.
 */

export const dynamic = 'force-static'

const HOST = 'https://sellerradar.bizlegal-ai.com'

export function GET(): Response {
  const body = buildLlmsTxt({
    name: 'SellerRadar — Amazon fee-change impact reports',
    host: HOST,
    summary: [
      'SellerRadar (sellerradar.bizlegal-ai.com, by BizLegal AI) computes what an',
      'Amazon fee-schedule change does to a seller’s catalog, SKU by SKU:',
      'referral, FBA fulfillment and storage fees, before/after margin, and the',
      'monthly and annual dollar delta. Input is a catalog CSV; fee data comes from',
      'curated, in-repo fee-schedule fixtures with a source URL and effective date',
      'on every rate.',
    ].join('\n'),
    links: [
      { label: 'Free impact check', path: '/analyze', note: 'upload a catalog CSV, get the catalog-level dollar impact and affected-SKU count.' },
      {
        label: 'Pricing',
        path: '/pricing',
        note: `Audit $${TIER_PRICES_USD.audit} one-time (per-SKU breakdown, fee citations, permanent report link); Monitor $${TIER_PRICES_USD.monitor}/month (weekly re-scan when a schedule changes, alert email with the recomputed impact).`,
      },
      { label: 'Disclaimer', path: '/disclaimer', note: 'what the numbers are and are not.' },
      { label: 'Terms', path: '/terms' },
      { label: 'Privacy', path: '/privacy' },
      { label: 'Contact', path: '/contact' },
    ],
    notes: [
      'Every figure is an estimate computed from published fee schedules and the seller’s own uploaded unit economics — verify against your settlement reports.',
      'No savings, ranking or outcome is promised. Not financial, tax or legal advice.',
      'Report pages (/report/…) are per-customer and are not indexed.',
    ],
  })

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
