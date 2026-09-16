import type { Metadata } from 'next'
import IntervalSwitch from './IntervalSwitch'
import OpportunityCard from '@/app/components/radar/OpportunityCard'
import DisclaimerBlock from '@/app/components/radar/DisclaimerBlock'
import { SAMPLE_OPPORTUNITIES } from '@/lib/fixtures/sample'
import { fromFixture } from '@/lib/radar/map'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'BrainX pricing: Radar $99/mo or $999/yr, Radar + Build $249/mo or $2,499/yr. Weekly evidence-first opportunity radar with a written expert review layer.',
  alternates: { canonical: '/pricing' },
}

const STEPS = [
  'Define your radar profile — up to 5, across real estate, legal & compliance, AI/fintech regulation.',
  'BrainX runs the weekly radar against your profile.',
  'New opportunities appear with a real run timestamp.',
  'Every opportunity carries an evidence vault — at least 3 verified sources.',
  'You choose what to pursue — request BUILD THIS for a full brief.',
  'Radar + Build adds a written, async expert review of each brief.',
]

const NOT_PROMISED = [
  'No guaranteed contracts.',
  'No guaranteed revenue.',
  'No fabricated evidence — ever.',
  'No fake citations.',
  'No automatic legal conclusions.',
]

const FAQ = [
  { q: 'What am I actually paying for?', a: 'A weekly, evidence-verified opportunity radar plus, on the higher tier, a written expert review layer on your BUILD THIS briefs. Not a chatbot, not a research subscription you have to read yourself.' },
  { q: 'Can I cancel?', a: 'Card billing is a PayPal subscription — cancel anytime from your PayPal account, access continues until the paid period ends. Crypto is a single yearly invoice with no auto-renewal.' },
  { q: 'What does the score mean?', a: 'A transparent seven-factor weighted score (BrainX Decision Score v1), shown with its own weights on every opportunity. It is a decision aid, not a guarantee.' },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

export default function PricingPage() {
  const sample = fromFixture(SAMPLE_OPPORTUNITIES[0]!)

  return (
    <div className="bx-container" style={{ paddingBlock: 'var(--bl-space-section)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      <p className="bx-label" style={{ marginBottom: 12 }}>Pricing</p>
      <h1 className="bx-h2" style={{ maxWidth: 640, marginBottom: 14 }}>Intelligence that ends with an opportunity.</h1>
      <p className="bx-lede" style={{ maxWidth: 560, marginBottom: 40 }}>
        No outcome guarantees. No fabricated evidence. You see where money, pain and
        regulatory complexity intersect — and what to sell.
      </p>

      <IntervalSwitch />

      <section style={{ marginTop: 64 }}>
        <p className="bx-label" style={{ marginBottom: 14 }}>What does BrainX actually deliver?</p>
        <OpportunityCard o={sample} href={`/sample/${sample.slug}`} compact />
      </section>

      <section style={{ marginTop: 64, maxWidth: 640 }}>
        <h2 className="bx-h3" style={{ marginBottom: 18 }}>What happens after I subscribe?</h2>
        <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {STEPS.map((s, i) => (
            <li key={i} style={{ fontSize: 14, color: 'var(--bl-text-muted)', lineHeight: 1.6 }}>{s}</li>
          ))}
        </ol>
      </section>

      <section style={{ marginTop: 48, maxWidth: 640 }}>
        <h2 className="bx-h3" style={{ marginBottom: 14 }}>What BrainX does not promise</h2>
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {NOT_PROMISED.map((s) => <li key={s} style={{ fontSize: 14, color: 'var(--bl-text-muted)' }}>{s}</li>)}
        </ul>
      </section>

      <section style={{ marginTop: 64, maxWidth: 640 }}>
        <h2 className="bx-h3" style={{ marginBottom: 18 }}>Questions</h2>
        <div className="bx-grid" style={{ gap: 14 }}>
          {FAQ.map((f) => (
            <div key={f.q} className="bx-card bx-card--flat">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{f.q}</h3>
              <p className="bx-muted" style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 48 }}>
        <DisclaimerBlock />
      </section>
    </div>
  )
}
