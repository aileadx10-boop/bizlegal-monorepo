import type { Metadata } from 'next'
import { AffiliateSignupForm } from './AffiliateSignupForm'

export const metadata: Metadata = {
  title: 'BizLegal AI Affiliate Program — Earn 30% on every paying customer you bring',
  description: '30% first-month MRR, 20% recurring for 11 months, 15% on one-time products. Crypto or wire payouts. 90-day attribution window. No minimums.',
  alternates: { canonical: 'https://bizlegal-ai.com/affiliates' },
}

const RATES: ReadonlyArray<{ label: string; pct: string; example: string }> = [
  { label: 'First-month MRR', pct: '30%', example: '$49/mo plan → $14.70 to you the first month' },
  { label: 'Recurring (mo 2–12)', pct: '20%', example: '$49/mo plan → $9.80/mo for the next 11 months' },
  { label: 'One-time products', pct: '15%', example: '$149 BOI Kit → $22.35 to you' },
]

const FAQ: ReadonlyArray<{ q: string; a: string }> = [
  { q: 'When do I get paid?', a: 'Weekly reconciliation runs every Friday at 10:30 UTC. Crypto payouts settle same-day; bank wire batches Monday.' },
  { q: 'How does attribution work?', a: 'When someone clicks your /track/<your-code> link, we set a 90-day first-touch cookie. Any paid order from that browser inside the window credits you, regardless of which BizLegal product they buy.' },
  { q: 'Do you pay on refunds?', a: 'No — commissions are computed off net (post-refund) revenue. If a buyer chargebacks, the matching commission is clawed back from your next payout.' },
  { q: 'Can I run paid ads?', a: 'Yes, on your own brand keywords. Not on "BizLegal AI" or any of our subdomain names — that\'s grounds for ban without notice.' },
  { q: 'What gets me banned?', a: 'Cookie-stuffing, fake signups to inflate clicks, posting our checkout URLs without disclosure, or any astroturfing on Reddit/HN. We watch the affiliate_clicks tape weekly.' },
]

export default function AffiliatesPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bl-bg)', color: 'var(--bl-text)' }}>
      <section className="bl-hero-bg" style={{ paddingTop: 'clamp(4rem, 2rem + 4vw, 6rem)', paddingBottom: 'clamp(2rem, 1.5rem + 2vw, 3rem)' }}>
        <div className="bl-container" style={{ maxWidth: 880 }}>
          <span className="bl-tag" style={{ marginBottom: '1rem' }}>Affiliate Program</span>
          <h1
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h1)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              margin: '1.5rem 0 1rem',
            }}
          >
            Send us a customer.<br />
            <span className="bl-grad-text">Earn 30% on month one.</span>
          </h1>
          <p style={{ fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)', color: 'var(--bl-text-muted)', lineHeight: 1.6, margin: 0, maxWidth: 720 }}>
            30% on first-month MRR, 20% for the next 11 months, 15% on one-time products.
            Crypto or wire payouts. 90-day attribution. No minimums, no contracts, no quotas.
          </p>
        </div>
      </section>

      <section className="bl-section" style={{ background: 'var(--bl-bg-low)', borderTop: '1px solid var(--bl-divider)', borderBottom: '1px solid var(--bl-divider)' }}>
        <div className="bl-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'clamp(1rem, 0.5rem + 1vw, 1.5rem)' }}>
          {RATES.map((r) => (
            <div key={r.label} className="bl-card" style={{ display: 'grid', gap: 6 }}>
              <span className="bl-label" style={{ color: 'var(--bl-text-muted)', fontSize: 10 }}>{r.label}</span>
              <div style={{ fontFamily: 'var(--bl-font-display)', fontSize: 'clamp(2rem, 1.2rem + 2vw, 3rem)', fontWeight: 800, color: 'var(--bl-accent)', letterSpacing: '-0.02em' }}>{r.pct}</div>
              <p style={{ fontSize: 13, color: 'var(--bl-text-muted)', lineHeight: 1.5, margin: 0 }}>{r.example}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bl-section">
        <div className="bl-container-narrow">
          <AffiliateSignupForm />
        </div>
      </section>

      <section className="bl-section" style={{ background: 'var(--bl-bg-low)', borderTop: '1px solid var(--bl-divider)' }}>
        <div className="bl-container-narrow">
          <h2 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 'var(--bl-text-h2)', fontWeight: 800, marginTop: 0, marginBottom: '2rem', letterSpacing: '-0.025em' }}>
            FAQ
          </h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {FAQ.map((item) => (
              <div key={item.q} className="bl-card">
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{item.q}</h3>
                <p style={{ fontSize: 14, color: 'var(--bl-text-muted)', lineHeight: 1.6, margin: 0 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
