import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { GUIDES, getGuide } from '@/content/guides'
import DisclaimerBlock from '@/app/components/radar/DisclaimerBlock'

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = getGuide(params.slug)
  if (!guide) return {}
  return { title: guide.title, description: guide.description, alternates: { canonical: `/guides/${guide.slug}` } }
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug)
  if (!guide) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <article className="bx-container" style={{ paddingBlock: 'var(--bl-space-section)', maxWidth: 720 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="bx-eyebrow" style={{ marginBottom: 12 }}>Guide · Published {guide.publishedAt}</p>
      <h1 className="bx-h2" style={{ marginBottom: 24 }}>{guide.title}</h1>
      <div className="bx-grid" style={{ gap: 18, marginBottom: 40 }}>
        {guide.paragraphs.map((p, i) => (
          <p key={i} style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--bl-text-muted)' }}>{p}</p>
        ))}
      </div>

      <section style={{ marginBottom: 40 }}>
        <h2 className="bx-h3" style={{ fontSize: 17, marginBottom: 14 }}>Sources</h2>
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {guide.citations.map((c) => (
            <li key={c.url} style={{ fontSize: 13.5 }}>
              <a href={c.url} target="_blank" rel="noopener nofollow" className="bx-link">{c.title}</a>
              <span className="bx-muted"> — {c.publisher}</span>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 className="bx-h3" style={{ fontSize: 17, marginBottom: 14 }}>Questions</h2>
        <div className="bx-grid" style={{ gap: 12 }}>
          {guide.faqs.map((f) => (
            <div key={f.q} className="bx-card bx-card--flat">
              <h3 style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 6 }}>{f.q}</h3>
              <p className="bx-muted" style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 className="bx-h3" style={{ fontSize: 17, marginBottom: 14 }}>Related</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {guide.internalLinks.map((l) => (
            <Link key={l.href} href={l.href} className="bx-chip">{l.label}</Link>
          ))}
        </div>
      </section>

      <DisclaimerBlock />
    </article>
  )
}
