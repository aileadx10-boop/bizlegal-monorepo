import Link from 'next/link'
import { dirFor, langFor, type Locale } from '@/lib/i18n'

/**
 * Shared shell for the static legal pages, bilingual.
 *
 * These exist because the product handles other people's property
 * transactions: names, addresses, prices and dates belonging to a buyer and a
 * seller who never signed up for anything. A surface that collects that and has
 * no privacy page is not finished.
 */
export interface Section {
  readonly heading: string
  readonly body: readonly string[]
}

export default function LegalPage({
  locale,
  title,
  updated,
  sections,
}: {
  locale: Locale
  title: string
  updated: string
  sections: readonly Section[]
}) {
  const dir = dirFor(locale)
  return (
    <main dir={dir} lang={langFor(locale)}>
      <h1>{title}</h1>
      <p className="muted" style={{ marginBottom: '2rem' }}>{updated}</p>
      {sections.map((section) => (
        <section key={section.heading} style={{ marginBottom: '1.75rem' }}>
          <h2>{section.heading}</h2>
          {section.body.map((paragraph, i) => (
            <p key={i} style={{ color: 'var(--body)' }}>{paragraph}</p>
          ))}
        </section>
      ))}
      <footer>
        <p className="muted">
          <Link href="/">DEAL44</Link>
        </p>
      </footer>
    </main>
  )
}
