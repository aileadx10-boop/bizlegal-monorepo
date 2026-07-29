import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TRACKS, getTrack } from '@/lib/academy/tracks'
import { lessonHref, trackHref } from '@/lib/academy/types'
import TrackSignup from '../TrackSignup'

type Props = { params: { track: string } }

export function generateStaticParams() {
  return TRACKS.map((t) => ({ track: t.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const track = getTrack(params.track)
  if (!track) return { title: 'Track Not Found' }
  const url = `https://bizlegal-ai.com${trackHref(track.slug)}`
  return {
    title: `${track.name} | BizLegal AI Learn`,
    description: track.promise,
    alternates: { canonical: url },
    openGraph: { title: track.name, description: track.promise, url, type: 'website' },
  }
}

export default function TrackPage({ params }: Props) {
  const track = getTrack(params.track)
  if (!track) notFound()

  const minutes = track.lessons.reduce((sum, l) => sum + l.minutes, 0)
  const gated = track.lessons.filter((l) => !l.free)

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Learn', item: 'https://bizlegal-ai.com/learn' },
      {
        '@type': 'ListItem',
        position: 3,
        name: track.name,
        item: `https://bizlegal-ai.com${trackHref(track.slug)}`,
      },
    ],
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: 'var(--outline)', marginBottom: 28 }}>
        <Link href="/" style={{ color: 'var(--outline)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <Link href="/learn" style={{ color: 'var(--outline)' }}>Learn</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span>{track.name}</span>
      </nav>

      <header style={{ marginBottom: 40 }}>
        <span className="section-label">{track.audience}</span>
        <h1 style={{ fontSize: 'clamp(26px, 3.6vw, 38px)', lineHeight: 1.15, marginBottom: 16 }}>
          {track.name}
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--on-surface-var)' }}>{track.promise}</p>
        <div
          style={{
            display: 'flex',
            gap: 18,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--outline)',
            marginTop: 18,
          }}
        >
          <span>{track.lessons.length} lessons</span>
          <span>~{minutes} min total</span>
          <span>Text only</span>
        </div>
      </header>

      <section aria-labelledby="lessons-heading" style={{ marginBottom: 44 }}>
        <h2 id="lessons-heading" className="section-label" style={{ display: 'block' }}>
          Lessons
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {track.lessons.map((lesson, i) =>
            lesson.free ? (
              <Link
                key={lesson.slug}
                href={lessonHref(track.slug, lesson.slug)}
                className="tool-card-compact"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>
                    0{i + 1} · {lesson.title}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--green)',
                      flexShrink: 0,
                    }}
                  >
                    {lesson.minutes} min
                  </span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--on-surface-var)', margin: 0 }}>
                  {lesson.summary}
                </p>
              </Link>
            ) : (
              <div
                key={lesson.slug}
                style={{
                  background: 'var(--bg-low)',
                  border: '0.5px dashed var(--outline-var)',
                  borderRadius: 10,
                  padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--outline)' }}>
                    0{i + 1} · {lesson.title}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--outline)',
                      flexShrink: 0,
                    }}
                  >
                    Not open yet
                  </span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--on-surface-var)', margin: 0 }}>
                  {lesson.summary}
                </p>
              </div>
            ),
          )}
        </div>
      </section>

      {gated.length > 0 && (
        <section aria-labelledby="waitlist-heading" style={{ marginBottom: 40 }}>
          <h2 id="waitlist-heading" className="section-label" style={{ display: 'block' }}>
            The rest of the track
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--on-surface-var)', marginBottom: 18 }}>
            {gated.length} further {gated.length === 1 ? 'lesson is' : 'lessons are'} written but not
            open yet. Leave your email and you will hear when they are — no charge until then, and
            nothing else sent in the meantime.
          </p>
          <TrackSignup
            track={track.slug}
            prompt={`Tell me when the full ${track.name} track opens.`}
          />
        </section>
      )}

      <div className="ai-disclosure">
        <span aria-hidden="true">i</span>
        <span>
          Educational material about how legal and compliance processes work. Not legal advice, not a
          substitute for counsel in your jurisdiction, and carrying no CLE, CPE, or other
          professional credit.
        </span>
      </div>
    </main>
  )
}
