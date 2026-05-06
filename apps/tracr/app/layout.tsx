import type { Metadata } from 'next'
import './globals.css'
import './styles/theme-v2.css'
import CookieConsent from './components/CookieConsent'
import { ThemeToggle } from './components/ui-v2/ThemeToggle'
import { ThemeProvider, themeFOUCScript, SiteShell } from '@bizlegal/themes'
import { TRACR_CONTENT } from './landing-content'

const LANDING_FOUC = themeFOUCScript({
  primary: 'royal-dark',
  alternate: 'royal-light',
  storageKey: 'tracr-theme',
})

export const metadata: Metadata = {
  title: 'TRACR — AI Regulatory Risk Scanner',
  description: 'AI-powered compliance scan across EU (MiCA), GDPR, SEC, VARA frameworks. Know your regulatory exposure in 60 seconds. Powered by BizLegal AI.',
  keywords: 'blockchain forensics, regulatory compliance, crypto AML, risk scanner, GDPR, MiCA',
  openGraph: {
    title: 'TRACR — AI Regulatory Risk Scanner',
    description: 'AI-powered compliance scan across EU (MiCA), GDPR, SEC, VARA frameworks.',
    url: 'https://tracr.bizlegal-ai.com',
    siteName: 'TRACR by BizLegal AI',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,300;9..144,0,400;9..144,1,300;9..144,1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Theme V2 — set data-theme synchronously to avoid flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bl-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        {/* Subdomain Design Pass FOUC — sets CSS vars for the LandingV2 themes (royal-dark/royal-light). */}
        <script dangerouslySetInnerHTML={{ __html: LANDING_FOUC }} />
      </head>
      <body>
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, background: 'var(--bl-bg-low, #0b1326)', borderBottom: '1px solid var(--bl-divider, rgba(255,255,255,0.06))', color: 'var(--bl-text-muted, #636680)', fontFamily: 'var(--bl-font-body, DM Sans, sans-serif)' }}>
          <a href="https://bizlegal-ai.com" style={{ color: 'inherit', textDecoration: 'none' }}>&larr; Back to BizLegal AI</a>
          <ThemeToggle size={24} />
        </div>
        <div style={{ paddingTop: '36px' }}>
          <ThemeProvider primary="royal-dark" alternate="royal-light" storageKey="tracr-theme">
            <SiteShell
              brand={TRACR_CONTENT.brand}
              nav={TRACR_CONTENT.nav.map((n) => ({
                label: n.label,
                href: n.href.startsWith('#') ? `/${n.href}` : n.href,
              }))}
              cta={TRACR_CONTENT.heroPrimaryCta}
              footer={{
                tagline: TRACR_CONTENT.footerTagline,
                disclaimer: TRACR_CONTENT.disclaimer,
              }}
              stickyLead={{ label: 'Run free wallet provenance screen →', href: '/decision-tree' }}
            >
              {children}
            </SiteShell>
          </ThemeProvider>
        </div>
        <CookieConsent />
      </body>
    </html>
  )
}
