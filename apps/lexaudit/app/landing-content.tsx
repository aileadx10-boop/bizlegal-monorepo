import type { LandingV2Content } from '@bizlegal/themes'

/**
 * LexAudit landing content. Layout = shared LandingV2 template; only
 * copy + audits + tiers vary per subdomain.
 */
export const LEXAUDIT_CONTENT: LandingV2Content = {
  brand: 'LexAudit',
  nav: [
    { label: 'Audits', href: '#audits' },
    { label: 'Spotlight', href: '#spotlight' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ],
  heroEyebrow: 'Compliance drift, watched in real time',
  heroHeadline: (
    <>
      Compliance drift, <em>watched in real time.</em>
    </>
  ),
  heroSub:
    'LexAudit tracks every regulator that touches your operations and emails you the moment guidance shifts — so you respond before a complaint, not after one.',
  heroPrimaryCta: { label: 'Run free 60-second screen', href: '/decision-tree' },
  heroQuickFormPlaceholder: 'you@firm.com',
  briefIntro:
    'A 60-second compliance-cadence screen that returns a real preliminary signal — not a marketing quiz — and a deliverable shaped to your scenario.',
  briefSteps: [
    {
      title: 'Run the screen',
      body: 'Five questions across regulator attention, jurisdiction, and materiality. No signup until you see the verdict.',
    },
    {
      title: 'Get the brief',
      body: 'Within 5 minutes: a one-page baseline + the cadence (continuous monitor / baseline audit / self-serve) that fits your profile.',
    },
    {
      title: 'Decide your move',
      body: 'Keep the 4-email educational sequence, run the LexAudit Compliance Monitor, or talk to a compliance counsel we route you to.',
    },
  ],
  auditsTitle: 'Recent watched audits',
  auditsSub:
    'A live cross-section of guidance updates LexAudit captures across regulators. Every entry is source-cited.',
  audits: [
    { date: '2026 Apr', tag: 'SEC', title: 'Marketing Rule sweep — third wave: lookback to investment-advisor websites updated post-Q1' },
    { date: '2026 Apr', tag: 'CFPB', title: 'Section 1071 small-business data-collection compliance bulletin — covered financial institutions' },
    { date: '2026 Mar', tag: 'FinCEN', title: 'Investment-adviser AML rule effective-date guidance + travel-rule clarifications' },
    { date: '2026 Mar', tag: 'STATE', title: 'NYDFS Part 500 cybersecurity amendment — third-party service-provider attestations' },
    { date: '2026 Feb', tag: 'FTC', title: 'Made in USA enforcement updates — labor-cost calculation precedent shift' },
  ],
  spotlightQuote:
    'We discovered a CFPB Section 1071 update three weeks before our quarterly review would have caught it. That window was the difference between a clean filing and a remediation plan.',
  spotlightMeta: '— Compliance lead, mid-market consumer-finance firm',
  spotlightStats: [
    { num: '14d', lbl: 'avg lead time before competitor public guidance' },
    { num: '$0', lbl: 'reactive remediation cost in the last quarter' },
    { num: '100%', lbl: 'audits with a documented monitor citation' },
  ],
  pricingTitle: 'Pricing',
  pricingSub: 'Pick the cadence that matches your regulator footprint. Cancel anytime.',
  tiers: [
    {
      name: 'Self-serve',
      price: 'Free',
      cadence: '— 4-email sequence',
      features: ['Compliance-cadence screen', '4 educational emails over 7 days', 'One-page baseline shape'],
      cta: 'Run the screen',
      href: '/decision-tree',
    },
    {
      name: 'Compliance Monitor',
      price: '$99',
      cadence: '/mo',
      features: [
        'Daily semantic-diff on tracked frameworks',
        'Email alert + impact note per change',
        'SEC + CFPB + FinCEN + state AGs',
        'One human-reviewed brief per quarter',
      ],
      cta: 'Start monitoring',
      href: 'https://bizlegal-ai.com/checkout?product=lexaudit&tier=monitor&interval=monthly&amount=9900&name=LexAudit+Compliance+Monitor',
      featured: true,
    },
    {
      name: 'Boutique',
      price: '$199',
      cadence: '/mo',
      features: [
        'Compliance Monitor + cert renewal',
        'Slack/email reachability for impact triage',
        'Priority quarterly review',
      ],
      cta: 'Talk to us',
      href: '#contact',
    },
  ],
  contactTitle: 'Talk to a human',
  contactSub:
    "Tell us briefly what you're hoping we help with. We respond within a business day, never with form-letter copy.",
  footerTagline: 'Compliance drift, watched in real time.',
  disclaimer:
    'LexAudit is software providing regulatory intelligence. We are not a law firm and do not provide legal advice. Tracked frameworks include SEC, CFPB, FinCEN, FTC, state AGs, EU and UK regulators, and OFAC sanctions lists. Outcomes depend on your specific facts; confirm with qualified counsel.',
}
