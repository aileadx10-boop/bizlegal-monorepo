'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'What is a BOI report and why do I need one?',
    a: 'The Beneficial Ownership Information (BOI) report is required by the Corporate Transparency Act (CTA). Most US businesses must file with FinCEN disclosing beneficial owners (25%+ ownership or substantial control). Failure to file results in $500/day penalties.',
  },
  {
    q: 'Who needs to file a BOI report?',
    a: 'Most US corporations, LLCs, and similar entities created or registered to do business in any US state. There are 23 exemption categories, but most small businesses do not qualify for exemptions.',
  },
  {
    q: 'What happens if I don\'t file?',
    a: 'Penalties of $500 per day for each day the violation continues. Willful violations can result in fines up to $10,000 and/or 2 years imprisonment. Our report helps you avoid these penalties.',
  },
  {
    q: 'How long does delivery take?',
    a: 'All reports are delivered within 24 hours of payment confirmation. Most are delivered within 2-4 hours.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept cryptocurrency (BTC, ETH, USDT, and 100+ coins via NOWPayments) and card/bank payments (credit card, debit, bank transfer via Payoneer).',
  },
  {
    q: 'Is this legal advice?',
    a: 'No. Forge publishes regulatory intelligence, not legal advice. Our reports are machine-assisted, practitioner-reviewed analysis for informational purposes. For legal advice, consult a licensed attorney in your jurisdiction.',
  },
  {
    q: 'What is the Regulatory Passport?',
    a: 'A comprehensive jurisdiction-by-jurisdiction compliance roadmap for tech companies expanding internationally. Covers 12 markets: UK, EU, US, Singapore, Australia, Canada, Germany, Netherlands, UAE, Japan, Hong Kong, and Switzerland.',
  },
  {
    q: 'How does the Web Compliance Scanner work?',
    a: 'Enter your website URL and select a compliance vertical (CIPA, GDPR, etc.). We run a free preview scan showing potential issues. The full report includes detailed findings, fix scripts, policy addendums, and remediation guides.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Yes. If we find no compliance issues in your scan, or if you\'re unsatisfied with the report quality, contact us within 7 days for a full refund. See our Refund Policy for details.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We never sell your data. Reports are delivered via secure email and are accessible only to you.',
  },
  {
    q: 'Can I get a sample report?',
    a: 'Yes. Contact us at support@bizlegal-ai.com and we\'ll send you a redacted sample report so you can see exactly what you\'ll receive.',
  },
  {
    q: 'Do you offer ongoing monitoring?',
    a: 'Currently we provide one-off reports. We\'re working on a subscription monitoring service. Join our newsletter to be notified when it launches.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
        <p className="text-forge-muted text-lg">
          Everything you need to know about Forge Compliance Engine.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <div key={i} className="card overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-forge-card/50 transition-colors"
            >
              <span className="font-semibold text-white pr-4">{faq.q}</span>
              <span className="text-forge-accent text-xl flex-shrink-0">
                {openIndex === i ? '−' : '+'}
              </span>
            </button>
            {openIndex === i && (
              <div className="px-6 pb-4 text-forge-muted text-sm leading-relaxed border-t border-forge-border pt-4">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 card text-center p-8">
        <h2 className="text-xl font-bold text-white mb-3">Still have questions?</h2>
        <p className="text-forge-muted mb-4">
          Our team is here to help. Email us and we&apos;ll respond within 24 hours.
        </p>
        <a href="mailto:support@bizlegal-ai.com" className="btn-primary inline-block">
          Contact Support →
        </a>
      </div>
    </div>
  )
}
