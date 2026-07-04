// app/products/risk-snapshot/page.tsx — $19 AI Compliance Risk Snapshot.
//
// Purchase-context flow (documented decision): the /checkout URL contract
// (product/tier/interval/amount/name) has nowhere to carry url + jurisdiction,
// so the form POSTs (plain form-encoded, no client JS needed) to
// /api/risk-snapshot/generate in intake mode. That route persists a pending
// contract_scans row (contract_type='risk_snapshot', keyed by email) and
// 303-redirects the browser to /checkout for the risk_snapshot SKU. Post-
// payment fulfillment picks the pending row back up by email.
// SKU: risk_snapshot in packages/payment/src/products.ts ($19 one-time).

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Compliance Risk Snapshot — $19 | BizLegal AI',
  description:
    'Paste your website, get a 2-page AI compliance risk report in ~10 minutes: jurisdiction exposure, framework gaps across GDPR, SOC 2, MiCA, and BOI, plus your 3 highest-priority fixes. $19 one-time.',
  alternates: { canonical: 'https://bizlegal-ai.com/products/risk-snapshot' },
  openGraph: {
    title: 'Your AI Compliance Risk Snapshot — $19',
    description:
      '2-page AI risk report in ~10 minutes: jurisdiction exposure, GDPR/SOC 2/MiCA/BOI gap checklist, and your top-3 priority fixes.',
    url: 'https://bizlegal-ai.com/products/risk-snapshot',
  },
}

const JURISDICTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'EU', label: 'European Union' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'UAE', label: 'United Arab Emirates' },
  { value: 'SG', label: 'Singapore' },
  { value: 'other', label: 'Other / multiple' },
]

const WHATS_INSIDE = [
  'Risk score 0-100 with severity band, computed from what your public site actually exposes',
  'Jurisdiction exposure table — where your site signals you operate vs. what that triggers',
  'Framework gap checklist: GDPR, SOC 2, MiCA, CTA/BOI, and CCPA where applicable',
  'Your 3 highest-priority fixes, each with an effort estimate',
  'Every finding cites the page it came from — nothing invented, unknowns marked "not detected"',
]

const FAQ = [
  {
    q: 'What is the turnaround time?',
    a: 'Around 10 minutes. The pipeline is fully automated: we scrape your public website, run the analysis, and email the finished 2-page report to the address you enter at checkout. If your site is slow to crawl it can take up to an hour; if nothing arrives, email team@bizlegal-ai.com and we re-run it.',
  },
  {
    q: 'What is the refund policy?',
    a: 'If the report fails to generate or does not arrive, we re-run it or refund the $19 in full — just reply to your receipt email. Because the report is delivered digitally and generated per-order, we do not refund delivered reports; see the refund policy for details.',
  },
  {
    q: 'Is this legal advice?',
    a: 'No. BizLegal AI is a software tool operated by DOR INNOVATIONS. It provides research and monitoring; it is not a law firm and does not provide legal advice. The snapshot is informational decision-support — confirm any finding with qualified counsel before relying on it.',
  },
  {
    q: 'What do you need from me?',
    a: 'Just your public website URL, your primary jurisdiction, and an email address. We only analyze publicly accessible pages — no logins, no document uploads, no access to your systems.',
  },
  {
    q: 'What happens after the snapshot?',
    a: 'The report ends with your top-3 fixes. If you want continuous coverage, DocAI Starter ($29/mo) handles contract and questionnaire risk, and LexAudit ($99/mo) monitors your compliance frameworks daily. Both are optional — the $19 snapshot is complete on its own.',
  },
]

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'AI Compliance Risk Snapshot',
  description:
    '2-page AI compliance risk report generated from your public website: risk score, jurisdiction exposure, GDPR/SOC 2/MiCA/BOI gap checklist, and top-3 priority fixes.',
  brand: { '@type': 'Organization', name: 'BizLegal AI' },
  url: 'https://bizlegal-ai.com/products/risk-snapshot',
  offers: {
    '@type': 'Offer',
    price: '19',
    priceCurrency: 'USD',
    url: 'https://bizlegal-ai.com/products/risk-snapshot',
    availability: 'https://schema.org/InStock',
  },
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

export default function RiskSnapshotPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Hero */}
        <section style={{ padding: '80px 32px 48px', maxWidth: 1100, margin: '0 auto' }}>
          <span className="section-label">Automated Risk Report</span>
          <h1 style={{ marginBottom: 20, maxWidth: 760 }}>
            Your AI Compliance Risk Snapshot — $19
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.8, maxWidth: 620, marginBottom: 32 }}>
            Paste your website, get a 2-page AI risk report in ~10 minutes: jurisdiction exposure,
            framework gaps (GDPR/SOC&nbsp;2/MiCA/BOI), and your 3 highest-priority fixes.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="trust-badge">Delivered by email in ~10 min</div>
            <div className="trust-badge">Findings cite their source page</div>
            <div className="trust-badge">$19 one-time — no subscription</div>
          </div>
        </section>

        {/* Order form — plain form POST; the generate route 303-redirects to /checkout */}
        <section style={{ maxWidth: 640, margin: '0 auto', padding: '0 32px 64px' }}>
          <form
            method="POST"
            action="/api/risk-snapshot/generate"
            className="glass-card"
            style={{ padding: 28, display: 'grid', gap: 16 }}
          >
            <input type="hidden" name="mode" value="intake" />
            <div>
              <label
                htmlFor="url"
                style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}
              >
                Company website URL
              </label>
              <input
                id="url"
                name="url"
                type="url"
                required
                placeholder="https://yourcompany.com"
                style={{ width: '100%', padding: '12px 14px', fontSize: 15, background: 'var(--bg-low)', border: '0.5px solid var(--outline-var)', color: 'var(--on-surface)' }}
              />
            </div>
            <div>
              <label
                htmlFor="jurisdiction"
                style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}
              >
                Primary jurisdiction
              </label>
              <select
                id="jurisdiction"
                name="jurisdiction"
                required
                defaultValue="US"
                style={{ width: '100%', padding: '12px 14px', fontSize: 15, background: 'var(--bg-low)', border: '0.5px solid var(--outline-var)', color: 'var(--on-surface)' }}
              >
                {JURISDICTIONS.map((j) => (
                  <option key={j.value} value={j.value}>{j.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="email"
                style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}
              >
                Email — where the report is delivered
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                style={{ width: '100%', padding: '12px 14px', fontSize: 15, background: 'var(--bg-low)', border: '0.5px solid var(--outline-var)', color: 'var(--on-surface)' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '14px 20px', fontSize: 15, fontWeight: 700 }}>
              Get my Snapshot — $19 →
            </button>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
              Continues to secure checkout (crypto or card). Use the same email at checkout —
              it&rsquo;s how we match your payment to this snapshot.
            </p>
          </form>
        </section>

        {/* What's inside */}
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 32px 64px' }}>
          <span className="section-label">What&rsquo;s inside</span>
          <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0', display: 'grid', gap: 12 }}>
            {WHATS_INSIDE.map((item) => (
              <li key={item} style={{ fontSize: 14, lineHeight: 1.7, paddingLeft: 22, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--secondary)' }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Sample report teaser */}
        <section style={{ background: 'var(--bg-low)', borderTop: '0.5px solid var(--outline-var)', borderBottom: '0.5px solid var(--outline-var)', padding: '56px 32px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <span className="section-label">Sample — what a snapshot looks like</span>
            <div className="glass-card" style={{ padding: 28, marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 16 }}>
                <span style={{ fontFamily: 'Newsreader, serif', fontSize: 48, fontWeight: 700, color: 'var(--secondary)', lineHeight: 1 }}>62</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--secondary)' }}>Elevated risk</span>
              </div>
              <div style={{ display: 'grid', gap: 10, fontSize: 13, lineHeight: 1.7 }}>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: 'var(--on-surface)' }}>Jurisdiction exposure:</strong>{' '}
                  EU users detected (pricing page in EUR, GDPR banner absent) — GDPR applies; US
                  entity signals suggest CTA/BOI filing obligations.
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: 'var(--on-surface)' }}>Framework gaps:</strong>{' '}
                  No privacy policy update since 2024 (found: /privacy); no SOC 2 mention on
                  security page; MiCA — not applicable (no crypto-asset services detected).
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: 'var(--on-surface)' }}>Fix #1 (½ day):</strong>{' '}
                  Publish an updated privacy policy covering EU data subjects — highest exposure,
                  lowest effort.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '64px 32px' }}>
          <span className="section-label">FAQ</span>
          <div style={{ display: 'grid', gap: 20, marginTop: 20 }}>
            {FAQ.map((f) => (
              <div key={f.q} className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, marginBottom: 8 }}>{f.q}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Upsell */}
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 32px 64px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: 12 }}>Want the fixes handled continuously?</h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 24, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            The snapshot tells you where you stand today.{' '}
            <strong style={{ color: 'var(--on-surface)' }}>DocAI Starter ($29/mo)</strong> reviews
            your contracts and security questionnaires, and{' '}
            <strong style={{ color: 'var(--on-surface)' }}>LexAudit ($99/mo)</strong> monitors your
            compliance frameworks daily.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://docai.bizlegal-ai.com/pricing" className="btn-cta" style={{ fontSize: 13, padding: '10px 18px' }}>DocAI Starter — $29/mo →</a>
            <a href="https://lexaudit.bizlegal-ai.com" className="btn-ghost" style={{ fontSize: 13, padding: '10px 18px' }}>LexAudit Monitor — $99/mo →</a>
          </div>
        </section>

        {/* Disclaimer footer */}
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 32px 64px' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
            BizLegal AI is a software tool operated by DOR INNOVATIONS. It provides research and
            monitoring; it is not a law firm and does not provide legal advice. The snapshot is
            informational, not legal advice. See <Link href="/disclaimer">disclaimer</Link>,{' '}
            <Link href="/terms">terms</Link>, and <Link href="/refund">refund policy</Link>.
          </p>
        </section>
      </div>
    </>
  )
}
