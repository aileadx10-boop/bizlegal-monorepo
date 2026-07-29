import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLesson, allLessonParams } from '@/lib/academy/tracks'
import { FOUNDER_NOTE_LABEL, NOT_ADVICE, lessonHref, trackHref } from '@/lib/academy/types'
import { GUIDES } from '@/lib/guides'
import TrackSignup from '../../TrackSignup'

type Props = { params: { track: string; lesson: string } }

export function generateStaticParams() {
  return allLessonParams()
}

export function generateMetadata({ params }: Props): Metadata {
  const found = getLesson(params.track, params.lesson)
  if (!found) return { title: 'Lesson Not Found' }
  const { track, lesson } = found
  const url = `https://bizlegal-ai.com${lessonHref(track.slug, lesson.slug)}`
  return {
    title: `${lesson.title} | ${track.name}`,
    description: lesson.summary,
    alternates: { canonical: url },
    // Gated lessons are not readable, so they must not be offered to search.
    robots: lesson.free ? undefined : { index: false, follow: true },
    openGraph: { title: lesson.title, description: lesson.summary, url, type: 'article' },
  }
}

export default function LessonPage({ params }: Props) {
  const found = getLesson(params.track, params.lesson)
  if (!found) notFound()
  const { track, lesson } = found

  const guide = lesson.sourceGuide ? GUIDES.find((g) => g.href === lesson.sourceGuide) : undefined
  const index = track.lessons.findIndex((l) => l.slug === lesson.slug)
  const next = track.lessons[index + 1]

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Learn', item: 'https://bizlegal-ai.com/learn' },
      {
        '@type': 'ListItem',
        position: 2,
        name: track.name,
        item: `https://bizlegal-ai.com${trackHref(track.slug)}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: lesson.title,
        item: `https://bizlegal-ai.com${lessonHref(track.slug, lesson.slug)}`,
      },
    ],
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: 'var(--outline)', marginBottom: 28 }}>
        <Link href="/learn" style={{ color: 'var(--outline)' }}>Learn</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <Link href={trackHref(track.slug)} style={{ color: 'var(--outline)' }}>{track.name}</Link>
      </nav>

      <article>
        <header style={{ marginBottom: 36 }}>
          <div
            style={{
              display: 'flex',
              gap: 16,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--outline)',
              marginBottom: 14,
            }}
          >
            <span>Lesson 0{index + 1}</span>
            <span>{lesson.minutes} min read</span>
          </div>

          <h1 style={{ fontSize: 'clamp(25px, 3.4vw, 34px)', lineHeight: 1.2, marginBottom: 16 }}>
            {lesson.title}
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--on-surface-var)' }}>{lesson.summary}</p>
        </header>

        {/* Gated lessons show the outline only — headings, no body. Nothing is
            hidden client-side, so there is no paywall to defeat. */}
        {lesson.free ? (
          lesson.sections.map((section) => (
            <section key={section.heading} style={{ marginBottom: 34 }}>
              <h2 style={{ fontSize: 19, lineHeight: 1.35, marginBottom: 14 }}>{section.heading}</h2>

              {section.paragraphs.map((p, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: 'var(--on-surface-var)',
                    marginBottom: 14,
                  }}
                >
                  {p}
                </p>
              ))}

              {section.bullets && (
                <ul style={{ margin: '0 0 8px', paddingLeft: 20 }}>
                  {section.bullets.map((b, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: 14.5,
                        lineHeight: 1.7,
                        color: 'var(--on-surface-var)',
                        marginBottom: 12,
                      }}
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))
        ) : (
          <>
            <section style={{ marginBottom: 32 }}>
              <span className="section-label">What this lesson covers</span>
              <ul style={{ margin: '0 0 8px', paddingLeft: 20 }}>
                {lesson.sections.map((section) => (
                  <li
                    key={section.heading}
                    style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--on-surface-var)', marginBottom: 10 }}
                  >
                    {section.heading}
                  </li>
                ))}
              </ul>
            </section>

            <section style={{ marginBottom: 36 }}>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--on-surface-var)', marginBottom: 18 }}>
                This lesson is written but not open yet. Leave your email and you will hear when it
                is.
              </p>
              <TrackSignup
                track={track.slug}
                prompt={`Tell me when "${lesson.title}" opens.`}
              />
            </section>
          </>
        )}

        {/* Founder case placeholder. Renders visibly AS a placeholder — an invented
            case study would destroy the only thing that makes this track credible. */}
        {lesson.free && lesson.founderNote && (
          <aside
            style={{
              background: 'var(--bg-low)',
              border: '0.5px dashed var(--outline-var)',
              borderRadius: 10,
              padding: '18px 20px',
              marginBottom: 34,
            }}
          >
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--outline)',
                marginBottom: 8,
              }}
            >
              {FOUNDER_NOTE_LABEL}
            </span>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--on-surface-var)', margin: 0 }}>
              {lesson.founderNote}
            </p>
          </aside>
        )}

        {guide && (
          <section style={{ marginBottom: 34 }}>
            <span className="section-label">Go deeper</span>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--on-surface-var)', marginBottom: 10 }}>
              This lesson is the orientation. The full reference is here:
            </p>
            <Link href={guide.href} style={{ fontSize: 15, fontWeight: 600 }}>
              {guide.title} →
            </Link>
          </section>
        )}

        {lesson.cta && (
          <section
            style={{
              background: 'var(--bg-low)',
              border: '0.5px solid var(--outline-var)',
              padding: '22px 24px',
              marginBottom: 34,
            }}
          >
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--on-surface-var)', marginBottom: 16 }}>
              {lesson.cta.note}
            </p>
            <a href={lesson.cta.href} className="btn-primary" style={{ fontSize: 13 }}>
              {lesson.cta.label} →
            </a>
          </section>
        )}

        <nav
          aria-label="Lesson navigation"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            borderTop: '0.5px solid var(--outline-var)',
            paddingTop: 22,
            marginBottom: 32,
          }}
        >
          <Link href={trackHref(track.slug)} style={{ fontSize: 13 }}>
            ← All lessons in this track
          </Link>
          {next && next.free && (
            <Link href={lessonHref(track.slug, next.slug)} style={{ fontSize: 13 }}>
              Next: {next.title} →
            </Link>
          )}
        </nav>
      </article>

      <div className="ai-disclosure">
        <span aria-hidden="true">i</span>
        <span>{NOT_ADVICE}</span>
      </div>
    </main>
  )
}
