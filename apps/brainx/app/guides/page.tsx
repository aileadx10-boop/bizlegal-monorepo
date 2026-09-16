import type { Metadata } from 'next'
import Link from 'next/link'
import { GUIDES } from '@/content/guides'

export const metadata: Metadata = {
  title: 'Guides',
  description: 'Evidence-first guides on validating opportunities, 2026 compliance rule changes, and real estate compliance signals.',
  alternates: { canonical: '/guides' },
}

export default function GuidesIndexPage() {
  return (
    <div className="bx-container" style={{ paddingBlock: 'var(--bl-space-section)', maxWidth: 760 }}>
      <p className="bx-label" style={{ marginBottom: 12 }}>Guides</p>
      <h1 className="bx-h2" style={{ marginBottom: 32 }}>Evidence-first research on real opportunities.</h1>
      <div className="bx-grid" style={{ gap: 16 }}>
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="bx-card" style={{ display: 'block', textDecoration: 'none' }}>
            <h2 className="bx-h3" style={{ fontSize: 18, marginBottom: 8 }}>{g.title}</h2>
            <p className="bx-muted" style={{ fontSize: 13.5, lineHeight: 1.6 }}>{g.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
