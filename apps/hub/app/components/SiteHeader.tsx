import Link from 'next/link'
import { navigationLinks, productLinks } from '@/app/lib/site-content'

type SiteHeaderProps = {
  ctaHref?: string
  ctaLabel?: string
}

export function SiteHeader({
  ctaHref = productLinks.brai,
  ctaLabel = 'Start Free Risk Scan',
}: SiteHeaderProps) {
  const isExternal = ctaHref.startsWith('http')

  return (
    <header className="site-header">
      {/* Announcement bar */}
      <div className="announcement-bar">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <span className="pulse-dot" />
          <span>
            New: VARA 2025 Regulatory Risk Report is live &mdash;{' '}
          </span>
          <Link
            href="/posts"
            style={{
              color: 'var(--accent-mint)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            Access the Intelligence Hub &rarr;
          </Link>
        </div>
      </div>

      <div className="container nav-shell">
        <Link className="brand-mark" href="/">
          <span className="brand-mark__eyebrow">BizLegal AI</span>
          <span className="brand-mark__title">BizLegal AI</span>
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          {navigationLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/tools" style={{ color: 'var(--muted)' }}>
            Tools
          </Link>
          <Link href="/calculators" style={{ color: 'var(--muted)' }}>
            Calculators
          </Link>
        </nav>

        <div className="nav-actions">
          <Link
            className="button button-ghost"
            href="/posts"
            style={{ fontSize: '0.9rem' }}
          >
            Intelligence Hub
          </Link>
          {isExternal ? (
            <a className="button button-primary" href={ctaHref}>
              {ctaLabel}
            </a>
          ) : (
            <Link className="button button-primary" href={ctaHref}>
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
