// app/services/custom-build/page.tsx — high-ticket custom-build offer page.
//
// 3-tier ladder (Pilot $2,500 / Build $15,000 / Flagship $40,000 + 20% rev
// share). Async-only sales motion: no calls — the embedded QualifierChat
// qualifies the buyer and routes them into a private deal room. Pilot is
// direct self-checkout via /checkout (same URL contract as /pricing —
// product/tier/interval/amount/name query params). SKUs live in
// packages/payment/src/products.ts (custom_build_pilot / custom_build_build /
// custom_build_flagship).

import type { Metadata } from 'next'
import Link from 'next/link'
import QualifierChat from '@/components/conversion/QualifierChat'

export const metadata: Metadata = {
  title: 'Custom Compliance AI Build — BizLegal AI',
  description:
    'We build custom compliance AI systems for B2B SaaS, fintech, and crypto teams. $2,500 two-week pilot, $15,000 full build, or $40,000 flagship system with 20% revenue share. Fully async — no sales calls, scope agreed in writing, you own the code.',
  alternates: { canonical: 'https://bizlegal-ai.com/services/custom-build' },
  openGraph: {
    title: 'Custom Compliance AI Build — BizLegal AI',
    description:
      'Custom compliance AI systems built async — $2,500 pilot to $40K flagship builds with 20% revenue share. No sales calls; chat with our AI consultant, get a private deal room, delivery starts in 48h.',
    url: 'https://bizlegal-ai.com/services/custom-build',
  },
}

function checkoutHref(
  product: string,
  tier: string,
  interval: 'one-time' | 'monthly' | 'yearly',
  amountCents: number,
  displayName: string,
): string {
  const params = new URLSearchParams({
    product,
    tier,
    interval,
    amount: String(amountCents),
    name: displayName,
  })
  return `/checkout?${params.toString()}`
}

const PILOT_CHECKOUT = checkoutHref(
  'custom_build_pilot',
  'pilot',
  'one-time',
  250000,
  'Compliance AI Pilot (2 weeks)',
)

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Chat with our AI consultant',
    desc: 'Describe your compliance workflow and stack in the chat below. It asks the same scoping questions a senior consultant would — asynchronously, whenever suits you.',
  },
  {
    step: '02',
    title: 'Get a private deal room with scope + price',
    desc: 'Within one business day you receive a private deal room link: written scope, fixed price, delivery timeline, and the exact acceptance criteria. Nothing verbal, everything in writing.',
  },
  {
    step: '03',
    title: 'Pay by wire or card — delivery starts in 48h',
    desc: 'Approve the scope, pay by bank wire or card, and the build starts within 48 hours. Weekly async Loom + text updates until handover.',
  },
]

const TIERS = [
  {
    id: 'pilot',
    name: 'Pilot',
    price: '$2,500',
    priceNote: 'one-time · self-checkout',
    desc: '2-week single-workflow compliance agent on your stack — e.g. a security-questionnaire autoresponder trained on your docs, a DPA triage bot, or an evidence-collection agent for your next audit.',
    features: [
      'One compliance workflow, fully automated',
      'Built on your stack (your cloud, your repo)',
      '2-week delivery, written acceptance criteria',
      'Weekly async Loom + text updates',
      'You own the code at handover',
    ],
    cta: { label: 'Start the Pilot — $2,500 →', href: PILOT_CHECKOUT, kind: 'checkout' as const },
  },
  {
    id: 'build',
    name: 'Build',
    price: '$15,000',
    priceNote: '6 weeks · 50% upfront by wire',
    desc: 'Full custom compliance AI: multi-workflow system covering intake, analysis, evidence, and reporting — integrated with your existing tools and trained on your internal documentation.',
    features: [
      'Full compliance AI system, 3-5 workflows',
      '6-week delivery, milestone schedule in the deal room',
      '50% upfront by bank wire, 50% at acceptance',
      'Integrations with your CRM / ticketing / docs',
      'Weekly async Loom + text updates',
      'You own the code and the models config',
    ],
    cta: { label: 'Scope my Build →', href: '#qualifier', kind: 'qualifier' as const },
  },
  {
    id: 'flagship',
    name: 'Flagship',
    price: '$40,000',
    priceNote: '+ 20% revenue share · contractual',
    desc: 'A full revenue-generating AI system — not just internal tooling. We build, launch, and iterate a compliance AI product on your distribution, and share in the upside contractually.',
    features: [
      'Revenue-generating AI product, end to end',
      '20% revenue share, set out in the contract',
      'Launch + iteration support post-delivery',
      'Deal room includes revenue model + share mechanics',
      'Weekly async Loom + text updates',
      'You own the code; rev share governs revenue only',
    ],
    cta: { label: 'Qualify for Flagship →', href: '#qualifier', kind: 'qualifier' as const },
  },
]

const FAQ = [
  {
    q: 'Why no sales calls?',
    a: 'Calls optimize for persuasion; writing optimizes for precision. Every scope, price, and acceptance criterion lives in your deal room in writing — so there is nothing to misremember and nothing to renegotiate later. Winning is all we do, and async is how we do it: you get senior-level scoping without booking a single meeting.',
  },
  {
    q: 'Why a revenue share on the Flagship tier?',
    a: 'Because the Flagship build is a revenue-generating product, not internal tooling. The 20% share (contractual, defined in the deal room before you pay anything) aligns us with your outcome: we only win when the system actually produces revenue. It also lets us price the build at $40K instead of the $100K+ an equivalent agency build would cost.',
  },
  {
    q: 'What is the timeline?',
    a: 'Pilot: 2 weeks from payment. Build: 6 weeks with a milestone schedule agreed in the deal room. Flagship: scoped individually, typically 8-12 weeks to launch. Delivery starts within 48 hours of payment on every tier.',
  },
  {
    q: 'What stack do you build on?',
    a: 'Yours. We build on your cloud (Vercel, AWS, GCP, Azure), in your repository, using Claude-family models plus deterministic pipelines for the compliance-critical steps. If you have no stack yet, we provision a standard TypeScript + Postgres setup and hand you the keys.',
  },
  {
    q: "What if we're not technical?",
    a: 'That is the normal case. The qualifier chat translates your workflow description into a technical scope for you — you never write a requirements document. During delivery you get weekly Loom videos in plain language, and at handover we include a runbook your ops team can follow without engineers.',
  },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Custom Compliance AI Build',
  serviceType: 'Custom compliance AI system development',
  provider: {
    '@type': 'Organization',
    name: 'BizLegal AI (DOR INNOVATIONS)',
    url: 'https://bizlegal-ai.com',
  },
  areaServed: 'Worldwide',
  url: 'https://bizlegal-ai.com/services/custom-build',
  description:
    'Custom compliance AI systems built asynchronously: $2,500 two-week pilot, $15,000 full build, $40,000 flagship system with 20% contractual revenue share.',
  offers: [
    {
      '@type': 'Offer',
      name: 'Compliance AI Pilot (2 weeks)',
      price: '2500',
      priceCurrency: 'USD',
      url: 'https://bizlegal-ai.com/services/custom-build',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Custom Compliance AI Build (6 weeks)',
      price: '15000',
      priceCurrency: 'USD',
      url: 'https://bizlegal-ai.com/services/custom-build',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Flagship Custom AI System (+20% revenue share)',
      price: '40000',
      priceCurrency: 'USD',
      url: 'https://bizlegal-ai.com/services/custom-build',
      availability: 'https://schema.org/InStock',
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function CustomBuildPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Hero */}
        <section style={{ padding: '80px 32px 56px', maxWidth: 1100, margin: '0 auto' }}>
          <span className="section-label">Custom Builds · Done-For-You</span>
          <h1 style={{ marginBottom: 20, maxWidth: 820 }}>
            We build custom compliance AI systems. $40K flagship builds with 20% revenue share —
            or start with a $2,500 pilot.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.8, maxWidth: 620, marginBottom: 32 }}>
            Winning is all we do — async, no sales calls. Scope in writing, delivery in weeks,
            and you own the code.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href={PILOT_CHECKOUT} className="btn-primary">Start the $2,500 Pilot →</a>
            <a href="#qualifier" className="btn-ghost">Scope a bigger build →</a>
          </div>
        </section>

        {/* How it works */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 64px' }}>
          <span className="section-label">How it works</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginTop: 20 }}>
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="glass-card" style={{ padding: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--secondary)', marginBottom: 12 }}>
                  STEP {s.step}
                </div>
                <h3 style={{ fontSize: 17, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tiers */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 64px' }}>
          <span className="section-label">Three tiers, fixed prices</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginTop: 20 }}>
            {TIERS.map((t) => (
              <div key={t.id} className="glass-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: 8 }}>
                    {t.name}
                  </div>
                  <div style={{ fontFamily: 'Newsreader, serif', fontSize: 34, fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1 }}>
                    {t.price}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{t.priceNote}</div>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.7 }}>{t.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                  {t.features.map((f) => (
                    <li key={f} style={{ fontSize: 13, lineHeight: 1.5, paddingLeft: 18, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: 'var(--secondary)' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '0.5px solid var(--outline-var)' }}>
                  <a href={t.cta.href} className="btn-cta" style={{ fontSize: 13, padding: '10px 18px', display: 'inline-block' }}>
                    {t.cta.label}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Guarantee / assurance */}
        <section style={{ background: 'var(--bg-low)', borderTop: '0.5px solid var(--outline-var)', borderBottom: '0.5px solid var(--outline-var)', padding: '56px 32px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="ai-disclosure">
              <span style={{ flexShrink: 0, fontSize: 16 }}>🤝</span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--on-surface)', marginBottom: 4 }}>Our assurance</div>
                Scope is agreed in writing in your private deal room before any payment — no verbal
                promises, no scope drift. You get weekly async Loom + text updates during delivery,
                and you own the code at handover. If a delivered milestone doesn&rsquo;t match its
                written acceptance criteria, we fix it before the next milestone bills.
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '64px 32px' }}>
          <span className="section-label">Questions we get</span>
          <div style={{ display: 'grid', gap: 20, marginTop: 20 }}>
            {FAQ.map((f) => (
              <div key={f.q} className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, marginBottom: 8 }}>{f.q}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Qualifier chat */}
        <section id="qualifier" style={{ maxWidth: 800, margin: '0 auto', padding: '0 32px 80px' }}>
          <span className="section-label">Start here — the AI consultant</span>
          <h2 style={{ margin: '12px 0 16px' }}>Scope your build in one async chat.</h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 24, maxWidth: 620 }}>
            Answer a few questions about your workflow and stack. You&rsquo;ll get a private deal
            room with written scope and a fixed price — usually within one business day.
          </p>
          <QualifierChat context="custom-build" />
        </section>

        {/* Trust footer */}
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 32px 64px' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
            BizLegal AI is a software and engineering service operated by DOR INNOVATIONS. It is
            not a law firm and does not provide legal advice. See our{' '}
            <Link href="/disclaimer">disclaimer</Link> and <Link href="/terms">terms</Link>.
            Questions: <a href="mailto:team@bizlegal-ai.com">team@bizlegal-ai.com</a>.
          </p>
        </section>
      </div>
    </>
  )
}
