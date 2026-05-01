import Link from 'next/link'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/app/components/SiteFooter'
import { SiteHeader } from '@/app/components/SiteHeader'

type LegalSection = {
  title: string
  body: ReadonlyArray<string>
  bullets?: ReadonlyArray<string>
}

type LegalPageShellProps = {
  eyebrow: string
  title: string
  description: string
  updatedLabel: string
  sections: ReadonlyArray<LegalSection>
  aside?: ReactNode
}

export function LegalPageShell({
  eyebrow,
  title,
  description,
  updatedLabel,
  sections,
  aside,
}: LegalPageShellProps) {
  return (
    <>
      <SiteHeader ctaHref="/posts" ctaLabel="Open Intelligence Hub" />
      <main className="legal-shell">
        <section className="container legal-hero">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="hero-actions">
            <Link className="button button-secondary" href="/security">
              Security Center
            </Link>
            <Link className="button button-ghost" href="/faq">
              Read FAQ
            </Link>
          </div>
        </section>
        <section className="container legal-grid">
          <div className="legal-content">
            {sections.map((section) => (
              <article key={section.title} className="legal-section-card">
                <h2>{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets?.length ? (
                  <ul className="list-clean">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
          <aside className="legal-aside">
            <div className="info-card">
              <span className="info-card__label">Updated</span>
              <strong>{updatedLabel}</strong>
              <p>
                These trust pages are part of the core product shell so buyers can validate legal,
                compliance, and platform boundaries quickly.
              </p>
            </div>
            <div className="info-card">
              <span className="info-card__label">Need commercial detail?</span>
              <p>
                The intelligence hub maps research intent into product flows, while these pages make
                the platform boundaries explicit.
              </p>
              <Link href="/posts">Browse posts</Link>
            </div>
            {aside}
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
