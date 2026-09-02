import { MetadataRoute } from 'next'
import { listSchedules } from '../lib/schedules'
import { diffFeeTypes } from '../lib/fees'

/**
 * SellerRadar sitemap — public marketing routes plus programmatic SEO pages
 * for each fee-type change between the two latest schedules
 * (/seo/[fee-type]-change-[date], spec §4).
 *
 * Excluded: /report/[report_ref], /analyze, /success (dynamic / per-user).
 */
const BASE = 'https://sellerradar.bizlegal-ai.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const schedules = listSchedules()
  const prev = schedules[schedules.length - 2]
  const curr = schedules[schedules.length - 1]
  const seoEntries: MetadataRoute.Sitemap = curr
    ? diffFeeTypes(prev, curr).map((feeType) => ({
        url: `${BASE}/seo/${feeType}-change-${curr.effective_date}`,
        lastModified: new Date(curr.effective_date),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    : []

  return [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/analyze`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    ...seoEntries,
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/disclaimer`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
