import type { Metadata } from 'next'
import './globals.css'
import './styles/theme-v2.css'
import CookieConsent from './components/CookieConsent'
import LegalShield from '@/components/layout/LegalShield'
import { ThemeToggle } from './components/ui-v2/ThemeToggle'
import { ThemeProvider, themeFOUCScript, SiteShell, AppRouteOnly } from '@bizlegal/themes'
import { LEXAUDIT_CONTENT } from './landing-content'
import StructuredData from "./structured-data"

export const metadata: Metadata = {
  metadataBase: new URL('https://lexaudit.bizlegal-ai.com'),
  title: 'LexAudit — Compliance Health Scores for Lawyers',
  description: 'Regulatory intelligence — not legal advice. LexAudit turns your AI-assisted matter workflow into a versioned, source-cited Compliance Health Score reviewed by a named analyst.',
  keywords: 'compliance health score, regulatory intelligence, AI audit trail, lawyer governance, attestation',
  // W3.4 — GSC verification. Set NEXT_PUBLIC_GSC_VERIFICATION in Vercel env.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lexaudit.bizlegal-ai.com",
    siteName: "BizLegal AI",
    title: "LexAudit — Compliance Health Scores",
  },
  twitter: {
    card: "summary_large_image",
    title: "LexAudit — Compliance Health Scores",
    creator: "@bizlegalhubbot",
  },
  alternates: {
    canonical: "https://lexaudit.bizlegal-ai.com",
  },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
}

const LANDING_FOUC = themeFOUCScript({
  primary: 'twilight',
  alternate: 'daybreak',
  storageKey: 'lex-theme',
})

function CrossLinkBanner() {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 9999,
      background: 'linear-gradient(90deg, #0ea5e9 0%, #8b5cf6 100%)',
      color: 'white', padding: '8px 16px', fontSize: 14,
      textAlign: 'center', fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    }}>
      <span style={{ marginRight: 12 }}>LexAudit compliance monitor is part of BizLegal. 24/7 ops, $2,500/mo.</span>
      <a href="https://hub.bizlegal-ai.com/services/compliance-ops"
         style={{ color: 'white', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }}>
        See the offer &rarr;
      </a>
    </div>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <StructuredData />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.outbound-links.js"
          />
        )}
        {/* Existing app fonts (DM Sans + Playfair) for /login, /dashboard, /certificate, etc. */}
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Subdomain Design Pass — Fraunces + Inter for the LandingV2 homepage. */}
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,300;9..144,0,400;9..144,1,300;9..144,1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        {/* Existing bl-theme FOUC for /login & /dashboard (light/dark switch) — sets data-theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bl-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        {/* Subdomain Design Pass FOUC — sets CSS vars for the LandingV2 themes (twilight/daybreak).
            Uses parallel data-bl-theme-v2 attribute so it doesn't clobber bl-theme above. */}
        <script dangerouslySetInnerHTML={{ __html: LANDING_FOUC }} />
      </head>
      <body>
        <CrossLinkBanner />
        {/* a11y A11Y-034 — legacy bl-theme bar (light/dark for /login, /dashboard,
            /certificate) hidden on marketing routes since SiteShell already
            provides nav + theme toggle there. Eliminates the duplicate-toggle
            confusion the a11y audit flagged. */}
        <AppRouteOnly>
          <>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', background: '#050509', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#636680', fontFamily: "'DM Sans', sans-serif" }}>
              <a href="https://bizlegal-ai.com" style={{ color: 'inherit', textDecoration: 'none' }}>&larr; Back to BizLegal AI</a>
              <ThemeToggle size={24} />
            </div>
            {/* Spacer for the fixed legacy bar; only when bar is visible. */}
            <div style={{ height: '36px' }} aria-hidden="true" />
          </>
        </AppRouteOnly>
        <div>
          <ThemeProvider primary="twilight" alternate="daybreak" storageKey="lex-theme">
            <SiteShell
              brand={LEXAUDIT_CONTENT.brand}
              nav={LEXAUDIT_CONTENT.nav.map((n) => ({
                label: n.label,
                href: n.href.startsWith('#') ? `/${n.href}` : n.href,
              }))}
              cta={LEXAUDIT_CONTENT.heroPrimaryCta}
              footer={{
                tagline: LEXAUDIT_CONTENT.footerTagline,
                disclaimer: LEXAUDIT_CONTENT.disclaimer,
              }}
              stickyLead={{ label: 'Run free compliance screen →', href: '/decision-tree' }}
            >
              {children}
            </SiteShell>
          </ThemeProvider>
        </div>
        <LegalShield variant="micro" />
        <CookieConsent />
      </body>
    </html>
  )
}
