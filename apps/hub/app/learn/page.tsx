import type { Metadata } from 'next'
import Link from 'next/link'
import { TRACKS } from '@/lib/academy/tracks'
import { trackHref, lessonHref } from '@/lib/academy/types'

export const metadata: Metadata = {
  title: 'Learn — Practical Legal & Compliance Training | BizLegal AI',
  description:
    'Two short, text-first tracks: using AI on real estate transaction documents, and legal and compliance literacy for founders. Free lessons, no video, no signup to read.',
  alternates: { canonical: 'https://bizlegal-ai.com/learn' },
  openGraph: {
    title: 'Learn — BizLegal AI',
    description:
      'Practical training on real estate transaction documents and founder compliance literacy. Text-first, free lessons.',
    url: 'https://bizlegal-ai.com/learn',
    type: 'website',
  },
}

export default function LearnIndexPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Learn', item: 'https://bizlegal-ai.com/learn' },
    ],
  }

  // Only free lessons are advertised to search — the gated ones are not readable yet.
  const courseLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'BizLegal AI — Learn',
    url: 'https://bizlegal-ai.com/learn',
    numberOfItems: TRACKS.length,
    itemListElement: TRACKS.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      url: `https://bizlegal-ai.com${trackHref(t.slug)}`,
      description: t.promise,
    })),
  }

  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseLd) }} />

      <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: 'var(--outline)', marginBottom: 28 }}>
        <Link href="/" style={{ color: 'var(--outline)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span>Learn</span>
      </nav>

      <header style={{ marginBottom: 48 }}>
        <span className="section-label">Learn</span>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.15, marginBottom: 16 }}>
          Short, practical training on the documents that decide your deals
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--on-surface-var)', maxWidth: '62ch' }}>
          Two tracks. Text-first, no video, no account needed to read. Each track opens with free
          lessons so you can judge the material before paying for anything.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {TRACKS.map((track) => {
          const free = track.lessons.filter((l) => l.free).length
          const total = track.lessons.length
          const minutes = track.lessons.reduce((sum, l) => sum + l.minutes, 0)

          return (
            <section
              key={track.slug}
              aria-labelledby={`track-${track.slug}`}
              style={{
                background: 'var(--bg-low)',
                border: '0.5px solid var(--outline-var)',
                padding: '28px 26px',
              }}
            >
              <span className="tag" style={{ marginBottom: 12, display: 'inline-block' }}>
                {track.audience}
              </span>

              <h2 id={`track-${track.slug}`} style={{ fontSize: 24, marginBottom: 10, marginTop: 0 }}>
                <Link href={trackHref(track.slug)} style={{ textDecoration: 'none' }}>
                  {track.name}
                </Link>
              </h2>

              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--on-surface-var)', marginBottom: 18 }}>
                {track.promise}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: 18,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--outline)',
                  marginBottom: 20,
                }}
              >
                <span>{total} lessons</span>
                <span>{free} free</span>
                <span>~{minutes} min</span>
              </div>

              <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 22px' }}>
                {track.lessons.map((lesson, i) => (
                  <li
                    key={lesson.slug}
                    style={{
                      display: 'flex',
                      gap: 14,
                      alignItems: 'baseline',
                      padding: '10px 0',
                      borderTop: i === 0 ? 'none' : '0.5px solid var(--outline-var)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--outline)',
                        minWidth: 22,
                      }}
                    >
                      0{i + 1}
                    </span>
                    <span style={{ flex: 1, fontSize: 14, lineHeight: 1.5 }}>
                      {lesson.free ? (
                        <Link href={lessonHref(track.slug, lesson.slug)}>{lesson.title}</Link>
                      ) : (
                        <span style={{ color: 'var(--outline)' }}>{lesson.title}</span>
                      )}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: lesson.free ? 'var(--green)' : 'var(--outline)',
                      }}
                    >
                      {lesson.free ? 'Free' : 'Soon'}
                    </span>
                  </li>
                ))}
              </ol>

              <Link href={trackHref(track.slug)} className="btn-primary" style={{ fontSize: 13 }}>
                Open the {track.name.split(' ').slice(0, 2).join(' ')} track →
              </Link>
            </section>
          )
        })}
      </div>

      <div className="ai-disclosure" style={{ marginTop: 40 }}>
        <span aria-hidden="true">i</span>
        <span>
          These tracks are educational material about how legal and compliance processes work. They
          are not legal advice, do not create an attorney-client relationship, and carry no CLE, CPE,
          or other professional credit.
        </span>
      </div>
    </main>
  )
}
