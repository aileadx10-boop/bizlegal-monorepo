import type { LandingV2Content } from '@bizlegal/themes'

export const TRACR_CONTENT: LandingV2Content = {
  brand: 'TRACR',
  nav: [
    { label: 'Audits', href: '#audits' },
    { label: 'Spotlight', href: '#spotlight' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ],
  heroEyebrow: 'Wallet provenance · court-grade',
  heroHeadline: (
    <>
      Wallet provenance, <em>court-grade.</em>
    </>
  ),
  heroSub:
    'TRACR produces hash-anchored wallet traces with counterparty risk scoring + primary-source citations — the audit trail IRS, FinCEN, and OFAC enforcement actions expect to see.',
  heroPrimaryCta: { label: 'Run free wallet-trace screen', href: '/decision-tree' },
  heroQuickFormPlaceholder: 'you@firm.com',
  briefIntro:
    'A 60-second wallet-exposure screen across IRS digital-asset reporting, FinCEN MSB / Travel Rule, and OFAC counterparty risk — and a deliverable shaped to your scenario.',
  briefSteps: [
    {
      title: 'Run the screen',
      body: 'Five questions across volume, counterparty risk, US-person nexus, and cross-border movement. No signup until verdict.',
    },
    {
      title: 'Get the brief',
      body: 'Within 5 minutes: a TRACR Bronze report shape — wallet trace + counterparty risk graph + 1-year history with hash-anchored evidence.',
    },
    {
      title: 'Decide your move',
      body: 'Upgrade to Silver for court-ready prose, run periodic monitoring, or talk to a digital-asset counsel we route you to.',
    },
  ],
  auditsTitle: 'Recent on-chain enforcement actions',
  auditsSub:
    'A live cross-section of IRS / FinCEN / OFAC enforcement matters TRACR captures. Every entry traces to the docket.',
  audits: [
    { date: '2026 Apr', tag: 'IRS', title: 'Form 1040 digital-asset question — Q1 enforcement sweep targeting partial disclosures' },
    { date: '2026 Apr', tag: 'OFAC', title: 'Designated-mixer transitive exposure — clarification on indirect-receipt liability' },
    { date: '2026 Mar', tag: 'FinCEN', title: 'MSB Travel Rule supervisory letter — covered transaction threshold guidance' },
    { date: '2026 Mar', tag: 'CFTC', title: 'Commodity-pool definition update — DeFi pool aggregator inclusion' },
    { date: '2026 Feb', tag: 'SEC', title: 'Custody Rule amendments — qualified-custodian guidance for digital-asset advisers' },
  ],
  spotlightQuote:
    'TRACR pulled the on-chain provenance for a $4M counterparty wallet in 11 minutes. The audit trail held up under examiner review without follow-up questions.',
  spotlightMeta: '— Compliance head, regulated digital-asset platform',
  spotlightStats: [
    { num: '11min', lbl: 'avg time to deliver Bronze trace report' },
    { num: '1y', lbl: 'history depth, hash-anchored, in every report' },
    { num: '4', lbl: 'regulator regimes referenced (IRS / FinCEN / OFAC / SEC)' },
  ],
  pricingTitle: 'Pricing',
  pricingSub: 'One-time forensic reports per wallet. Monthly monitoring for active counterparties.',
  tiers: [
    {
      name: 'Self-serve',
      price: 'Free',
      cadence: '— 4-email sequence',
      features: ['Wallet-exposure screen', '4 educational emails over 7 days', 'One-page disclosure-readiness shape'],
      cta: 'Run the screen',
      href: '/decision-tree',
    },
    {
      name: 'TRACR Bronze',
      price: '$149',
      cadence: '/report',
      features: [
        'Wallet trace + counterparty graph',
        '1-year history with hash anchors',
        'Citations to applicable IRS / FinCEN guidance',
        'Defensible audit trail',
      ],
      cta: 'Run a report',
      href: '/analyze',
      featured: true,
    },
    {
      name: 'TRACR Silver',
      price: '$299',
      cadence: '/report',
      features: [
        'Bronze + court-ready prose',
        'For freezing-order applications',
        'Practitioner-reviewed narrative',
      ],
      cta: 'Talk to us',
      href: '#contact',
    },
  ],
  contactTitle: 'Talk to a human',
  contactSub:
    "Walk us through your wallet-trace question. We respond within a business day, never with form-letter copy.",
  footerTagline: 'Wallet provenance, court-grade.',
  disclaimer:
    'TRACR is software providing forensic-quality wallet traces. We are not a law firm; reports are evidence, not legal opinion. Citations reference IRS Notice 2014-21, the FinCEN Travel Rule (31 CFR § 1010.410), OFAC sanctions guidance, and applicable agency precedent.',
}
