'use client'

/**
 * SiteShell — global brand-coherent header + footer + sticky lead
 * badge that wraps every route on a subdomain.
 *
 * Mounts in each subdomain's `app/layout.tsx` so the visual identity
 * (brand mark, nav, theme toggle, ember CTA, footer, sticky lead
 * magnet) is present on every page, not just the homepage.
 *
 * For full-template subdomains (LexAudit, BRAI, TRACR), LandingV2
 * delegates its nav + footer to this shell so the homepage doesn't
 * double up. For rebrand-only subdomains (DocAI, LeadForge, Forge),
 * the existing custom homepages render as `{children}` inside the
 * shell — their internal nav must be stripped so they don't double
 * up either.
 */

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { ThemeToggleButton } from './provider'
import { StickyLeadBadge } from './StickyLeadBadge'

export const siteShellCSS = `
.bl-shell { min-height: 100vh; display: flex; flex-direction: column; background: var(--ink, #0B0717); color: var(--paper, #E9E5F5); font-family: var(--lex-body, 'Inter', system-ui, sans-serif); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
.bl-shell a { color: inherit; text-decoration: none; }
.bl-shell button { font-family: inherit; }
.bl-shell main { flex: 1; }

/* Nav (mirrors lex-nav so LandingV2 inheritance is seamless) */
.bl-nav { position: sticky; top: 0; z-index: 50; display: flex; justify-content: space-between; align-items: center; padding: 18px 32px; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); background: linear-gradient(180deg, color-mix(in srgb, var(--ink) 78%, transparent), color-mix(in srgb, var(--ink) 30%, transparent)); border-bottom: 1px solid var(--line-2, rgba(233,229,245,.06)); }
.bl-brand { display: flex; align-items: center; gap: 10px; font-family: var(--lex-display, 'Fraunces', serif); font-weight: 300; font-size: 22px; letter-spacing: 0.02em; color: var(--paper); }
.bl-brand .mark { width: 22px; height: 22px; display: grid; place-items: center; color: var(--brand); }
.bl-navmid { display: flex; gap: 28px; font-size: 13px; color: var(--paper-dim, rgba(233,229,245,.66)); font-weight: 400; }
.bl-navmid a { padding: 6px 0; transition: color 200ms ease; }
.bl-navmid a:hover { color: var(--paper); }
.bl-navend { display: flex; align-items: center; gap: 10px; }
.bl-nav-cta { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px 10px 18px; border-radius: 999px; background: linear-gradient(135deg, var(--ember, #FFB347), var(--ember-2, #FF3D00)); color: #fff; font-size: 12.5px; font-weight: 500; letter-spacing: .01em; border: 0; cursor: pointer; box-shadow: 0 10px 28px -10px color-mix(in srgb, var(--ember-2, #FF3D00) 70%, transparent), inset 0 1px 0 rgba(255,255,255,0.28); transition: transform 200ms ease, box-shadow 250ms ease; }
.bl-nav-cta:hover { transform: translateY(-1px); }
.bl-nav-cta .pulse { width: 8px; height: 8px; border-radius: 99px; background: #fff; animation: bl-pulse 2.2s ease-out infinite; }
@keyframes bl-pulse { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,.6); } 70% { box-shadow: 0 0 0 10px rgba(255,255,255,0); } 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); } }

/* Footer */
.bl-footer { padding: 48px 24px 24px; background: var(--footer-bg, color-mix(in srgb, var(--ink) 92%, var(--paper) 8%)); color: var(--paper-dim, rgba(233,229,245,.66)); font-size: 13px; border-top: 1px solid var(--line-2, rgba(233,229,245,.06)); }
.bl-footer-inner { max-width: 1080px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 24px; justify-content: space-between; align-items: center; }
.bl-footer-disc { font-size: 11px; color: var(--paper-dim, rgba(233,229,245,.5)); margin-top: 24px; max-width: 1080px; margin-left: auto; margin-right: auto; line-height: 1.6; }

/* Prose (privacy / terms / disclaimer / etc.) */
.bl-prose { max-width: 760px; margin: 0 auto; padding: 64px 24px 96px; color: var(--paper, #E9E5F5); line-height: 1.7; font-size: 16px; }
.bl-prose h1 { font-family: var(--lex-display, 'Fraunces', serif); font-weight: 300; font-size: clamp(36px, 5vw, 56px); letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 32px; color: var(--paper); }
.bl-prose h2 { font-family: var(--lex-display, 'Fraunces', serif); font-weight: 300; font-size: clamp(24px, 3vw, 32px); letter-spacing: -0.01em; margin: 48px 0 16px; color: var(--paper); }
.bl-prose h3 { font-size: 18px; font-weight: 600; margin: 32px 0 12px; color: var(--paper); }
.bl-prose p { margin: 0 0 16px; color: var(--paper-dim, rgba(233,229,245,.86)); }
.bl-prose ul, .bl-prose ol { margin: 0 0 16px; padding-left: 24px; color: var(--paper-dim, rgba(233,229,245,.86)); }
.bl-prose li { margin: 8px 0; }
.bl-prose a { color: var(--brand-soft, var(--brand)); border-bottom: 1px solid currentColor; }
.bl-prose a:hover { color: var(--paper); }
.bl-prose code { background: var(--surface-2, rgba(0,0,0,.28)); padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
.bl-prose hr { margin: 32px 0; border: 0; border-top: 1px solid var(--line-2, rgba(233,229,245,.08)); }
`

const DEFAULT_BRAND_MARK = (
  <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M11 2 L19 6 V12 C19 16 15 19 11 20 C7 19 3 16 3 12 V6 Z" fill="currentColor" opacity="0.9" />
    <path d="M11 7 L11 14" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="11" cy="16.5" r="1" fill="#fff" />
  </svg>
)

export interface SiteShellProps {
  readonly brand: string
  readonly nav: ReadonlyArray<{ label: string; href: string }>
  readonly cta: { label: string; href: string }
  readonly footer: {
    readonly tagline: string
    readonly disclaimer: string
    readonly links?: ReadonlyArray<{ label: string; href: string }>
  }
  /** Sticky lead badge — vertical-aware label + decision-tree href.
   *  Pass `null` to disable globally for this subdomain. */
  readonly stickyLead: { label: string; href: string } | null
  /** Routes where the sticky lead badge should NOT render. Defaults
   *  to suppress on /decision-tree*, /thank-you*, /api*. */
  readonly stickyLeadSuppressPaths?: ReadonlyArray<string>
  /** Routes where the entire shell chrome (nav + footer + badge)
   *  should be hidden — typically app-internal routes that have
   *  their own dashboard/auth UI. Children render raw. */
  readonly chromeSuppressPaths?: ReadonlyArray<string>
  readonly children: React.ReactNode
}

const DEFAULT_FOOTER_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: '/contact' },
]

const DEFAULT_SUPPRESS: ReadonlyArray<string> = ['/decision-tree', '/thank-you', '/api']

const DEFAULT_CHROME_SUPPRESS: ReadonlyArray<string> = [
  '/login',
  '/signup',
  '/dashboard',
  '/admin',
  '/account',
  '/certificate',
  '/api',
]

function pathMatches(pathname: string, prefixes: ReadonlyArray<string>): boolean {
  for (const p of prefixes) {
    if (pathname === p || pathname.startsWith(p + '/')) return true
  }
  return false
}

export function SiteShell(props: SiteShellProps): React.ReactElement {
  const {
    brand,
    nav,
    cta,
    footer,
    stickyLead,
    stickyLeadSuppressPaths = DEFAULT_SUPPRESS,
    chromeSuppressPaths = DEFAULT_CHROME_SUPPRESS,
    children,
  } = props
  const footerLinks = footer.links ?? DEFAULT_FOOTER_LINKS
  const pathname = usePathname() ?? '/'
  const suppressChrome = pathMatches(pathname, chromeSuppressPaths)
  const showBadge =
    !suppressChrome && stickyLead !== null && !pathMatches(pathname, stickyLeadSuppressPaths)

  // App-internal routes (login/dashboard/etc.) — render children raw.
  if (suppressChrome) {
    return <>{children}</>
  }

  return (
    <div className="bl-shell">
      <style dangerouslySetInnerHTML={{ __html: siteShellCSS }} />

      <header className="bl-nav" role="banner">
        <a href="/" className="bl-brand" aria-label={`${brand} home`}>
          <span className="mark">{DEFAULT_BRAND_MARK}</span>
          <span>{brand}</span>
        </a>
        <nav className="bl-navmid" aria-label="Primary">
          {nav.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="bl-navend">
          <ThemeToggleButton />
          <a className="bl-nav-cta" href={cta.href}>
            <span className="pulse" />
            {cta.label}
          </a>
        </div>
      </header>

      <main>{children}</main>

      <footer className="bl-footer" role="contentinfo">
        <div className="bl-footer-inner">
          <div>
            <strong style={{ color: 'var(--paper)', fontFamily: 'var(--lex-display)', fontWeight: 300 }}>
              {brand}
            </strong>
            <span style={{ marginLeft: 8 }}>· {footer.tagline}</span>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {footerLinks.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <p className="bl-footer-disc">{footer.disclaimer}</p>
      </footer>

      {showBadge && stickyLead !== null ? (
        <StickyLeadBadge href={stickyLead.href} label={stickyLead.label} />
      ) : null}
    </div>
  )
}

export default SiteShell
