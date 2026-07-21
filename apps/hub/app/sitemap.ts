import { MetadataRoute } from 'next'

/**
 * Hub sitemap — static routes only. Long-form content lives at
 * blog.bizlegal-ai.com which has its own sitemap.xml served by the
 * Cloudflare-Pages SEO factory. Listing blog URLs here would cause
 * SEO cannibalisation against the canonical blog subdomain.
 */
const BASE = 'https://bizlegal-ai.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    // Top-level
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/snapshot`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${BASE}/realestate`, lastModified: now, changeFrequency: 'weekly', priority: 0.92 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },

    // Hub product surfaces (revenue-driving)
    { url: `${BASE}/agents`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/risk-engine`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/jurisdictions`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    // /marketplace also 308-redirects; omitted (same rationale as the
    // subdomain landings below).

    // Subdomain-landing routes intentionally OMITTED from the hub
    // sitemap. Each is a 308 redirect to the canonical subdomain
    // (apps/hub/next.config.js redirects() block). Advertising them
    // here would waste Google's crawl budget and create the redirect
    // chain that the 2026-05-11 GSC report flagged as "Page redirects
    // to another URL." Each subdomain has its OWN sitemap (advertised
    // via sitemap-index.xml) so the destinations are still discoverable.
    //
    // Removed: /tracr, /brai, /docai, /lexaudit, /leadforge, /forge,
    // /marketplace (all 308s confirmed via curl, 2026-05-11).

    // Vertical SEO landing pages
    { url: `${BASE}/digital-asset-risk-analysis`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${BASE}/digital-asset-regulatory-intelligence`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${BASE}/cross-border-compliance`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${BASE}/mica-regulation-2025`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${BASE}/blockchain-report`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/calculators`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/methodology-library`, lastModified: now, changeFrequency: 'monthly', priority: 0.65 },

    // Trust + methodology surface (MoR-relevant)
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/trust`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/methodology`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/data-sources`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },

    // Legal
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/refund`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/acceptable-use`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/disclaimer`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/accessibility`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },

    // Newsletter (hub-owned signup; archive lives at blog subdomain)
    { url: `${BASE}/newsletter`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },

    // Tools (hub-owned, deterministic calculators)
    // Slugs mirror the PAGES array in app/tools/[slug]/page.tsx.
    { url: `${BASE}/tools`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/tools/gdpr-fine-estimator`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/tools/sanction-screener`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/tools/mica-asset-classifier`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/tools/contract-fixer`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },

    // Regulations (hub-owned reference pages)
    { url: `${BASE}/regulations`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/regulations/sec`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/regulations/mica`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/regulations/vara`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/regulations/gdpr`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/regulations/aml`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },

    // Buyer-intent guides (high-intent SEO, each linked to a product)
    { url: `${BASE}/guides`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${BASE}/guides/beneficial-ownership-information-filing`, lastModified: now, changeFrequency: 'monthly', priority: 0.72 },
    { url: `${BASE}/guides/gdpr-compliance-checklist-saas`, lastModified: now, changeFrequency: 'monthly', priority: 0.72 },
    { url: `${BASE}/guides/mica-regulation-crypto-compliance`, lastModified: now, changeFrequency: 'monthly', priority: 0.72 },
    { url: `${BASE}/guides/fractional-cco-vs-compliance-retainer`, lastModified: now, changeFrequency: 'monthly', priority: 0.72 },
    { url: `${BASE}/guides/blockchain-wallet-investigation`, lastModified: now, changeFrequency: 'monthly', priority: 0.72 },
    { url: `${BASE}/guides/compliance-health-score-saas`, lastModified: now, changeFrequency: 'monthly', priority: 0.72 },
  ]
}
