import type { LandingV2Content } from '@bizlegal/themes'

export const FALSEECHO_CONTENT: LandingV2Content = {
  brand: 'FalseEcho',
  nav: [
    { label: 'How it works', href: '#brief' },
    { label: 'Signals', href: '#audits' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ],
  heroEyebrow: 'AI falsehood monitoring · evidence-grade',
  heroHeadline: (
    <>
      AI is answering questions about you. <em>Prove what it says.</em>
    </>
  ),
  heroSub:
    'FalseEcho probes ChatGPT, Claude, Perplexity, and Google AI Overviews for claims about you or your firm — and captures every answer as a hash-anchored evidence record (SHA-256 + UTC timestamp) you can hand to counsel.',
  heroPrimaryCta: { label: 'Run a free exposure check', href: '/scan' },
  heroQuickFormPlaceholder: 'you@firm.com',
  briefIntro:
    'A 4-engine probe battery against the name buyers, clients, and courts are already asking AI about — and an evidence pack built for the moment you need to act on it.',
  briefSteps: [
    {
      title: 'Probe the engines',
      body: 'A 25-prompt battery — name variants, trust questions, controversy probes — runs against ChatGPT, Claude, Perplexity, and Google AI Overviews. No signup until you see the exposure count.',
    },
    {
      title: 'Capture the evidence',
      body: 'Every answer is stored with a SHA-256 hash, UTC timestamp, and scan sequence. Recompute the hash from the record — it matches, or the record was tampered with.',
    },
    {
      title: 'Decide your move',
      body: 'We publish signals, you decide. The $29 evidence pack states facts and sources — never legal conclusions. The $149/mo monitor re-scans daily and alerts on new falsehoods.',
    },
  ],
  auditsTitle: 'What AI engines get wrong',
  auditsSub:
    'The failure shapes FalseEcho is built to catch. Illustrative categories — your scan captures what the engines actually say about you.',
  audits: [
    { date: 'Shape 01', tag: 'ChatGPT', title: 'Wrong-person merge — a firm attributed a same-name stranger\u2019s lawsuit, sanctions, or closure' },
    { date: 'Shape 02', tag: 'Claude', title: 'Invented disciplinary record — a "license suspended" claim with no bar association source' },
    { date: 'Shape 03', tag: 'Perplexity', title: 'Stale event presented as current — an old, resolved dispute summarized as ongoing' },
    { date: 'Shape 04', tag: 'Google AIO', title: 'Fabricated reviews consensus — "clients report…" claims with no underlying review corpus' },
    { date: 'Shape 05', tag: 'All engines', title: 'Competitor contamination — another company\u2019s controversy attached to your name' },
  ],
  spotlightQuote:
    'A prospect asked ChatGPT if our firm was trustworthy. It cited a lawsuit against a firm 900 miles away with a similar name. We lost the intake and never knew why — until we saw the answer in writing.',
  spotlightMeta: '— Managing partner, US consumer law firm (anonymized intake interview)',
  spotlightStats: [
    { num: '4', lbl: 'AI answer engines probed per scan' },
    { num: '25', lbl: 'prompts per entity battery' },
    { num: 'SHA-256', lbl: 'hash anchor on every captured answer' },
  ],
  pricingTitle: 'Pricing',
  pricingSub: 'One audit to see the damage. One subscription to watch it.',
  tiers: [
    {
      name: 'Free exposure check',
      price: '$0',
      cadence: '— 3-prompt probe',
      features: ['4-engine quick probe', 'Flag count + exposure score', 'Upgrade to full pack anytime'],
      cta: 'Run the check',
      href: '/scan',
    },
    {
      name: 'FalseEcho Audit',
      price: '$29',
      cadence: '/one-time',
      features: [
        'Full 25-prompt battery × 4 engines',
        'Hash-anchored evidence pack',
        'Claude-graded flag narratives',
        'Email delivery + permanent report link',
      ],
      cta: 'Order the audit',
      href: '/scan',
      featured: true,
    },
    {
      name: 'FalseEcho Monitor',
      price: '$149',
      cadence: '/month',
      features: [
        'Daily re-scan of your entity',
        'Alert email on new falsehoods',
        'Weekly evidence summary',
        'Scan history + diff vs previous',
      ],
      cta: 'Start monitoring',
      href: '/pricing',
    },
  ],
  contactTitle: 'Talk to a human',
  contactSub:
    'Describe what an AI engine said about you or your firm. We respond within a business day — evidence first, never form-letter copy.',
  footerTagline: 'AI falsehood monitoring, evidence-grade.',
  disclaimer:
    'FalseEcho is software that captures what AI answer engines say. We are not a law firm; evidence packs state facts and sources, never legal conclusions or defamation determinations. We do not guarantee detection completeness — engines change answers constantly. Reviewed pipeline: automated capture, human review available on request.',
}
