import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import './globals.css'

const SITE = 'https://bench.bizlegal-ai.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Bench — The Evaluation Lab for Legal AI',
    template: '%s · Bench',
  },
  description:
    'Bench measures how accurately AI systems perform legal work — by jurisdiction, against expert-labeled gold standards. Accuracy scores, hallucination rates, error taxonomy, remediation. EU · UK · UAE.',
  alternates: { canonical: '/' },
  openGraph: {
    siteName: 'Bench by BizLegal AI',
    type: 'website',
    url: SITE,
  },
}

const DISCLAIMER =
  'Bench provides measurement and benchmarking services for AI systems. Nothing on this site or in a Bench report is legal advice, and no attorney-client relationship is formed. Bench does not operate a lawyer referral service.'

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Bench by BizLegal AI',
  alternateName: 'Bench — The Evaluation Lab for Legal AI',
  url: SITE,
  description:
    'Bench measures how accurately AI systems perform legal work — by jurisdiction, against expert-labeled gold standards. Accuracy scores, hallucination rates, error taxonomy, remediation. EU, UK, UAE.',
  parentOrganization: {
    '@type': 'Organization',
    name: 'BizLegal AI',
    url: 'https://bizlegal-ai.com',
  },
  areaServed: ['EU', 'GB', 'AE'],
  knowsAbout: [
    'legal AI evaluation',
    'AI benchmark',
    'legal AI hallucination rate',
    'MiCA',
    'UK GDPR',
    'VARA',
  ],
} as const

const NAV = [
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/sample', label: 'Sample report' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/experts', label: 'For experts' },
] as const

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <header className="site-header">
          <div className="shell site-header__inner">
            <Link href="/" className="wordmark">
              Bench
              <span className="wordmark__by">by BizLegal AI</span>
            </Link>
            <nav className="site-nav" aria-label="Main navigation">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
              <Link href="/audit/request" className="btn btn--primary">
                Request an audit
              </Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="shell">
            <p style={{ margin: 0, maxWidth: '72ch' }}>{DISCLAIMER}</p>
            <p style={{ margin: '12px 0 0' }}>
              <Link href="/legal/terms">Terms of service</Link> ·{' '}
              <Link href="/legal/dpa">Data processing</Link> ·{' '}
              <Link href="/methodology">Methodology</Link> ·{' '}
              <a href="https://bizlegal-ai.com">bizlegal-ai.com</a>
            </p>
            <p style={{ margin: '12px 0 0' }}>
              © {new Date().getFullYear()} BizLegal AI / DOR INNOVATIONS
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
