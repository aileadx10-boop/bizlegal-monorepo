import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Custom Compliance AI Build | BizLegal AI',
  description:
    'We build a private, white-labeled compliance AI system for your fintech or Web3 company. Contract scanning, SOC 2/GDPR monitoring, compliance health dashboard. $40K build + $30K/yr.',
  keywords: [
    'custom compliance AI',
    'compliance software build',
    'SOC 2 automation',
    'GDPR compliance tool',
    'fintech compliance AI',
    'custom legal AI',
  ],
  openGraph: {
    title: 'Custom Compliance AI Build | BizLegal AI',
    description:
      'White-labeled compliance AI for Series B+ fintechs. SOC 2, GDPR, AML monitoring. Full security packet pre-built. 6-week delivery.',
    type: 'website',
    url: 'https://hub.bizlegal-ai.com/services/custom-build',
  },
}

const tiers = [
  {
    id: 'pilot',
    name: 'Pilot',
    price: '$2,500',
    period: 'one-time',
    tagline: 'Proof of concept in 2 weeks',
    description:
      'Run our compliance scanner against your 5 most critical vendor contracts. Get a prioritised risk report + one 60-min strategy session. No commitment beyond the pilot.',
    includes: [
      '5 contract scans (SOC 2 / GDPR / AML clauses)',
      'Compliance health score for each contract',
      'Risk priority report (PDF)',
      '60-min strategy call with Moses',
      'All findings in a private Notion dashboard',
    ],
    cta: 'Start a Pilot',
    highlighted: false,
    securityPacket: false,
  },
  {
    id: 'build',
    name: 'Build',
    price: '$15,000',
    period: 'one-time + $12K/yr',
    tagline: 'Your own compliance AI in 4 weeks',
    description:
      'White-labeled LexAudit + DocAI instance configured for your regulatory frameworks. Deployed to your subdomain. Includes SIG Lite + MSA + DPA pre-filled.',
    includes: [
      'Private LexAudit instance (your subdomain)',
      'DocAI contract scanner wired to your Slack',
      'Compliance health dashboard for your team',
      '2 frameworks (e.g. SOC 2 + GDPR)',
      'SIG Lite questionnaire pre-filled',
      'MSA + DPA ready to redline',
      '90-day hypercare post go-live',
    ],
    cta: 'Request a Build Proposal',
    highlighted: false,
    securityPacket: true,
  },
  {
    id: 'flagship',
    name: 'Flagship',
    price: '$40,000',
    period: 'build fee + $30K/yr',
    tagline: 'Full compliance AI for enterprise sales',
    description:
      'Custom-built compliance AI system that closes enterprise deals faster. SOC 2/GDPR/AML monitoring, contract risk scanning, compliance evidence dashboard your buyers see during vendor review.',
    includes: [
      'Private LexAudit + DocAI instance',
      'All frameworks your enterprise buyers require',
      'Compliance health dashboard with buyer-facing view',
      'Regulatory change alerts (email + Slack + Telegram)',
      'Full security packet: SOC 2 Type I status, SIG Lite, MSA, DPA, BCP',
      'CISO-ready documentation package',
      '6-week delivery from build fee receipt',
      '12-month maintenance SLA + on-call support',
      'Optional: $20K success fee (capped) on measurable outcome',
    ],
    cta: 'Book a 15-Min Call',
    highlighted: true,
    securityPacket: true,
  },
]

const faqs = [
  {
    q: 'Who is the custom build for?',
    a: 'Series B+ fintechs, crypto exchanges, and Web3 companies that are losing enterprise deals because compliance evidence is not ready when buyers ask. CFOs and COOs who want to cut $150K+/yr compliance consulting spend.',
  },
  {
    q: 'What does the security packet include?',
    a: 'SIG Lite questionnaire (pre-filled for your stack), MSA with Schedule A, GDPR-compliant DPA (Article 28), BCP with 4-hour RTO, and a SOC 2 Type I status letter. Everything your CISO needs in one zip.',
  },
  {
    q: 'How long does the build take?',
    a: '6 weeks from build fee receipt to go-live. Pilot: 2 weeks. Build: 4 weeks. Flagship: 6 weeks. Timeline is fixed — we scope before signing.',
  },
  {
    q: 'Is the success fee mandatory on Flagship?',
    a: 'No. The base Flagship is $40K build + $30K/yr. The optional success fee (up to $20K) is only added if both parties agree on a specific measurable outcome (e.g. first enterprise contract closed using compliance evidence).',
  },
  {
    q: 'Do you work with companies outside the US?',
    a: 'Yes. The system is GDPR-compliant (hosted on EU servers by default), supports multi-jurisdiction frameworks, and has clients in Israel, the UK, and the EU.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Custom Compliance AI Build',
      description:
        'White-labeled compliance AI system for Series B+ fintechs. Contract scanning, SOC 2/GDPR/AML monitoring, enterprise-ready security packet. $40K build + $30K/yr.',
      provider: {
        '@type': 'Organization',
        name: 'BizLegal AI',
        url: 'https://bizlegal-ai.com',
      },
      serviceType: 'ComplianceAI',
      url: 'https://hub.bizlegal-ai.com/services/custom-build',
      offers: [
        {
          '@type': 'Offer',
          name: 'Pilot',
          price: '2500',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Build',
          price: '15000',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Flagship',
          price: '40000',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
        { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://hub.bizlegal-ai.com/services' },
        { '@type': 'ListItem', position: 3, name: 'Custom Build', item: 'https://hub.bizlegal-ai.com/services/custom-build' },
      ],
    },
  ],
}

export default function CustomBuildPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="border-b border-gray-100 bg-gray-50 px-6 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
              Custom Build Program
            </p>
            <h1 className="mb-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Your own compliance AI.
              <br />
              Built in 6 weeks.
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              We build a private, white-labeled compliance AI for your fintech or Web3 company.
              SOC&nbsp;2, GDPR, and AML monitoring. Contract risk scanning. A compliance health
              dashboard your enterprise buyers see during vendor review.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:intelligence@bizlegal-ai.com?subject=Custom Compliance AI — 15-min call"
                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700"
              >
                Book a 15-min call
              </a>
              <a
                href="/compliance-snapshot"
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Try a free snapshot first
              </a>
            </div>
          </div>
        </section>

        {/* Security Packet callout */}
        <section className="border-b border-blue-100 bg-blue-50 px-6 py-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold text-blue-800">
              🔒 Security packet pre-built — SIG Lite questionnaire, MSA, DPA (GDPR Art. 28), BCP
              with 4h RTO. CISO reviews that normally take 6 weeks take under 2.
            </p>
          </div>
        </section>

        {/* Pricing tiers */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-3 text-center text-2xl font-bold text-gray-900">
              Three ways to start
            </h2>
            <p className="mb-12 text-center text-gray-500">
              Start with a Pilot to de-risk. Scale to Flagship when the ROI is clear.
            </p>
            <div className="grid gap-8 md:grid-cols-3">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`flex flex-col rounded-2xl border p-8 ${
                    tier.highlighted
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="mb-6">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-600">
                      {tier.name}
                    </p>
                    <div className="mb-1 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    </div>
                    <p className="text-sm text-gray-500">{tier.period}</p>
                    <p className="mt-3 text-sm font-medium text-gray-700">{tier.tagline}</p>
                    <p className="mt-2 text-sm text-gray-500">{tier.description}</p>
                  </div>
                  <ul className="mb-8 flex-1 space-y-2">
                    {tier.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-0.5 text-green-500">✓</span>
                        {item}
                      </li>
                    ))}
                    {tier.securityPacket && (
                      <li className="flex items-start gap-2 text-sm font-medium text-blue-700">
                        <span className="mt-0.5">🔒</span>
                        Full security packet included
                      </li>
                    )}
                  </ul>
                  <a
                    href={`mailto:intelligence@bizlegal-ai.com?subject=${encodeURIComponent(`BizLegal AI ${tier.name} — Custom Build inquiry`)}`}
                    className={`block rounded-lg py-3 text-center text-sm font-semibold transition ${
                      tier.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {tier.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-gray-100 bg-gray-50 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-2xl font-bold text-gray-900">How it works</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { step: '1', title: 'Scoping call (15 min)', desc: 'We confirm your frameworks, stack, and timeline. You get a fixed-scope proposal within 24 hours.' },
                { step: '2', title: 'Build + security packet (6 weeks)', desc: 'We configure a private instance of LexAudit + DocAI for your stack, deploy to your subdomain, and pre-fill the security packet.' },
                { step: '3', title: 'Go-live + hypercare (90 days)', desc: 'We hand over credentials, run your team through the dashboard, and stay on-call for 90 days post launch.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="rounded-xl bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
                    {step}
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
              Common questions
            </h2>
            <div className="space-y-6">
              {faqs.map(({ q, a }) => (
                <div key={q} className="border-b border-gray-100 pb-6">
                  <h3 className="mb-2 font-semibold text-gray-900">{q}</h3>
                  <p className="text-sm text-gray-600">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA footer */}
        <section className="border-t border-gray-100 bg-blue-600 px-6 py-16 text-center text-white">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-2xl font-bold">Ready to talk?</h2>
            <p className="mb-8 text-blue-100">
              15-minute call. No pitch deck. We look at your current compliance stack and tell you
              exactly what we can build and what it will cost.
            </p>
            <a
              href="mailto:intelligence@bizlegal-ai.com?subject=Custom Compliance AI — 15-min call"
              className="inline-flex items-center rounded-lg bg-white px-8 py-4 font-semibold text-blue-600 shadow hover:bg-blue-50"
            >
              Email Moses directly
            </a>
            <p className="mt-4 text-xs text-blue-200">
              intelligence@bizlegal-ai.com · Typical response within 4 hours
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
