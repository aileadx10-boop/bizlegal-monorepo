import type { LandingV2Content } from '@bizlegal/themes'

export const SELLERRADAR_CONTENT: LandingV2Content = {
  brand: 'SellerRadar',
  nav: [
    { label: 'How it works', href: '#brief' },
    { label: 'Fee changes', href: '#audits' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ],
  heroEyebrow: 'Amazon fee-change impact monitoring',
  heroHeadline: (
    <>
      Amazon changed its fees. <em>Here&apos;s what it costs you.</em>
    </>
  ),
  heroSub:
    'SellerRadar diffs every Amazon fee-schedule change — referral, FBA fulfillment, and storage — against YOUR catalog. Upload a seller CSV export and get the dollar impact per SKU per year, not another dashboard of charts.',
  heroPrimaryCta: { label: 'Upload a catalog CSV', href: '/analyze' },
  heroQuickFormPlaceholder: 'you@yourstore.com',
  briefIntro:
    'Sellers already pay for tools that show them data. Nobody tells them the dollar impact of a fee change on their own catalog. SellerRadar does exactly one thing: change → impact → alert.',
  briefSteps: [
    {
      title: 'Upload your catalog',
      body: 'A CSV export with SKU, category, dimensions, weight, COGS, price, and estimated monthly units. Flexible header mapping — real Seller Central exports parse as-is. No Amazon credentials, no SP-API.',
    },
    {
      title: 'We diff the fee schedules',
      body: 'Every fee row is versioned with its source URL and effective date. We compute your per-unit fee stack before and after the change — referral %, FBA fulfillment by size/weight tier, and monthly storage.',
    },
    {
      title: 'You get dollars, not data',
      body: '"This change reduces your margin by X% on Y SKUs, estimated $Z/year." Per-SKU breakdown in the $49 audit; the $99/mo monitor re-scans weekly when schedules update and emails your personal impact.',
    },
  ],
  auditsTitle: 'Fee changes we track',
  auditsSub:
    'The three Amazon fee types covered in v1 — every schedule row carries a source URL and effective date. Your audit computes the delta against your own catalog.',
  audits: [
    { date: 'Type 01', tag: 'Referral', title: 'Referral fee % changes by category — a 1-point move on apparel reprices every unit you sell' },
    { date: 'Type 02', tag: 'FBA fulfillment', title: 'Size/weight tier repricing — a few cents per unit compounds to thousands per year at volume' },
    { date: 'Type 03', tag: 'Storage', title: 'Monthly storage rate moves per cubic foot — quiet, recurring, and easy to miss' },
    { date: 'Coming', tag: 'v2', title: 'Inbound placement fees, aged-inventory surcharges, and PPC cost analysis (post-MVP scope)' },
  ],
  spotlightQuote:
    'Amazon bumped fulfillment fees in February and my "profitable" SKU was suddenly break-even. I found out from my accountant in April. A dollar number per SKU the week the fee changed would have saved me a quarter of dead pricing.',
  spotlightMeta: '— Amazon FBA seller, ~$1.2M annual revenue (anonymized intake interview)',
  spotlightStats: [
    { num: '3', lbl: 'fee types tracked per SKU' },
    { num: '$/SKU/yr', lbl: 'impact output — not charts' },
    { num: '1 CSV', lbl: 'no API keys, no Amazon approval needed' },
  ],
  pricingTitle: 'Pricing',
  pricingSub: 'One audit to price the change. One subscription to never miss the next one.',
  tiers: [
    {
      name: 'Free impact check',
      price: '$0',
      cadence: '— top-line only',
      features: ['CSV upload + parse', 'Catalog-level dollar impact', 'Affected SKU count', 'Upgrade to per-SKU detail anytime'],
      cta: 'Run the check',
      href: '/analyze',
    },
    {
      name: 'SellerRadar Audit',
      price: '$49',
      cadence: '/one-time',
      features: [
        'Full per-SKU impact breakdown',
        'Before/after margin per SKU',
        'Fee-type attribution (referral vs FBA vs storage)',
        'Email delivery + permanent report link',
      ],
      cta: 'Order the audit',
      href: '/pricing',
      featured: true,
    },
    {
      name: 'SellerRadar Monitor',
      price: '$99',
      cadence: '/month',
      features: [
        'Everything in the Audit',
        'Weekly re-scan when schedules update',
        'Alert email with YOUR personal impact',
        'Monitor dashboard + change history',
      ],
      cta: 'Start monitoring',
      href: '/pricing',
    },
  ],
  contactTitle: 'Talk to a human',
  contactSub:
    'Questions about a fee change, a report, or a CSV that won\u2019t parse? We respond within a business day.',
  footerTagline: 'Amazon fee-change impact, in dollars per SKU.',
  disclaimer:
    'SellerRadar computes estimates from published Amazon fee schedules and the unit economics you upload. Impact figures are estimates — verify against your settlement reports. We provide no financial, tax, or repricing advice, and no savings are guaranteed.',
}
