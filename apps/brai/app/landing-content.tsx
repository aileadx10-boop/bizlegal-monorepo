import type { LandingV2Content } from '@bizlegal/themes'

export const BRAI_CONTENT: LandingV2Content = {
  brand: 'BRAI',
  nav: [
    { label: 'Audits', href: '#audits' },
    { label: 'Spotlight', href: '#spotlight' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ],
  heroEyebrow: 'Sanctions screening · Source-cited',
  heroHeadline: (
    <>
      Sanctions screening, <em>source-cited.</em>
    </>
  ),
  heroSub:
    'BRAI screens names, entities, and on-chain counterparties against the OFAC SDN, EU consolidated, UN Security Council, and UK OFSI lists — with confidence scoring and primary-source citations regulators expect to see.',
  heroPrimaryCta: { label: 'Run free sanctions screen', href: '/decision-tree' },
  heroQuickFormPlaceholder: 'you@company.com',
  briefIntro:
    'A 60-second sanctions-exposure screen returning a real preliminary signal across OFAC, EU, UK, and on-chain risk — and a deliverable shaped to your scenario.',
  briefSteps: [
    {
      title: 'Run the screen',
      body: 'Five questions across geography, counterparty verifiability, volume, and process maturity. No signup until verdict.',
    },
    {
      title: 'Get the brief',
      body: 'Within 5 minutes: a screen of your shape vs current OFAC + EU + UK + UN lists with confidence scoring and citations.',
    },
    {
      title: 'Decide your move',
      body: 'Run the periodic monitor, escalate to a full BRAI report, or talk to sanctions counsel we route you to.',
    },
  ],
  auditsTitle: 'Recent on-chain + traditional list deltas',
  auditsSub:
    'A live cross-section of sanctions-list updates BRAI captures. Every entry traces to the regulator gazette.',
  audits: [
    { date: '2026 Apr', tag: 'OFAC', title: 'Tornado Cash redesignation update — successor-address coverage clarified' },
    { date: '2026 Apr', tag: 'OFAC', title: 'Russia-related blocking sanctions — second-tier partner network expansion' },
    { date: '2026 Mar', tag: 'EU', title: 'EU consolidated list 14th package update — DPRK proliferation finance designations' },
    { date: '2026 Mar', tag: 'UK OFSI', title: 'UK 2024 General License renewal cycle — wind-down extensions' },
    { date: '2026 Feb', tag: 'UN', title: 'UN Security Council 1267 Sanctions Committee — quarterly update' },
  ],
  spotlightQuote:
    'Our acquisition target had three counterparty wallets that traced through a known mixer. BRAI surfaced the chain and the citations a week before the closing memo. We restructured the deal.',
  spotlightMeta: '— GC, mid-market crypto fund',
  spotlightStats: [
    { num: '4', lbl: 'sanctions regimes screened in parallel (OFAC / EU / UN / UK)' },
    { num: '24h', lbl: 'list-update detection lag' },
    { num: '100%', lbl: 'screens with primary-source citations' },
  ],
  pricingTitle: 'Pricing',
  pricingSub: 'Pick the cadence that matches your counterparty volume. Cancel anytime.',
  tiers: [
    {
      name: 'Self-serve',
      price: 'Free',
      cadence: '— 4-email sequence',
      features: ['Sanctions-exposure screen', '4 educational emails over 7 days', 'One-page exposure shape'],
      cta: 'Run the screen',
      href: '/decision-tree',
    },
    {
      name: 'BRAI Full Report',
      price: '$49',
      cadence: '/report',
      features: [
        'OFAC + EU + UN + UK screen',
        'On-chain provenance + counterparty map',
        'Confidence scoring with citations',
        '12 months stored evidence trail',
      ],
      cta: 'Run a report',
      href: '/network',
      featured: true,
    },
    {
      name: 'Periodic Monitor',
      price: '$199',
      cadence: '/mo',
      features: [
        'Daily list-delta detection on watched counterparties',
        'Email alert + impact note per change',
        'Quarterly human-reviewed brief',
      ],
      cta: 'Talk to us',
      href: '#contact',
    },
  ],
  contactTitle: 'Talk to a human',
  contactSub:
    "Walk us through your sanctions-exposure question. We respond within a business day, never with form-letter copy.",
  footerTagline: 'Sanctions screening, source-cited.',
  disclaimer:
    'BRAI screens against OFAC SDN (31 CFR Chapter V), EU Council consolidated list, UK OFSI consolidated list, and UN Security Council sanctions. We are software providing regulatory intelligence, not a law firm; outcomes depend on your specific facts.',
}
