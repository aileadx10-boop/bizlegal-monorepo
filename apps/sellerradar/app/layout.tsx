import type { Metadata } from 'next'
import './globals.css'
import './styles/theme-v2.css'
import CookieConsent from './components/CookieConsent'
import { ThemeProvider, themeFOUCScript, SiteShell, AppRouteOnly } from '@bizlegal/themes'
import { SELLERRADAR_CONTENT } from './landing-content'
import StructuredData from './structured-data'

const LANDING_FOUC = themeFOUCScript({
  primary: 'royal-dark',
  alternate: 'royal-light',
  storageKey: 'sellerradar-theme',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://sellerradar.bizlegal-ai.com'),
  title: 'SellerRadar — Amazon Fee-Change Impact Monitoring',
  description:
    'SellerRadar detects Amazon fee-schedule changes and tells you exactly what the change costs per SKU per year. Upload a seller CSV export, get dollars not charts. $49 one-time audit, $99/mo monitoring. Powered by BizLegal AI.',
  keywords: 'Amazon fee change, FBA fee increase impact, referral fee calculator, FBA fulfillment fee 2026, Amazon storage fee impact, seller margin calculator',
  openGraph: {
    title: 'SellerRadar — Amazon Fee-Change Impact Monitoring',
    description: 'Amazon changed its fees. Here is what it costs you — per SKU, per year, in dollars.',
    url: 'https://sellerradar.bizlegal-ai.com',
    siteName: 'SellerRadar by BizLegal AI',
    type: 'website',
  },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
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
            __html: `(function(){try{var t=localStorage.getItem('bl-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);if(t=='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        {/* Subdomain Design Pass FOUC — sets CSS vars for the LandingV2 themes (royal-dark/royal-light). */}
        <script dangerouslySetInnerHTML={{ __html: LANDING_FOUC }} />
      </head>
      <body>
        {/* a11y A11Y-034 — legacy bl-theme bar hidden on marketing routes. */}
        <AppRouteOnly>
          <>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, background: 'var(--bl-bg-low, #0b1326)', borderBottom: '1px solid var(--bl-divider, rgba(255,255,255,0.06))', color: 'var(--bl-text-muted, #636680)', fontFamily: 'var(--bl-font-body, DM Sans, sans-serif)' }}>
              <a href="https://bizlegal-ai.com" style={{ color: 'inherit', textDecoration: 'none' }}>&larr; Back to BizLegal AI</a>
              <span style={{ fontFamily: 'var(--bl-font-mono, monospace)' }}>SellerRadar</span>
            </div>
            <div style={{ height: '36px' }} aria-hidden="true" />
          </>
        </AppRouteOnly>
        <div>
          <ThemeProvider primary="royal-dark" alternate="royal-light" storageKey="sellerradar-theme">
            <SiteShell
              brand={SELLERRADAR_CONTENT.brand}
              nav={SELLERRADAR_CONTENT.nav.map((n) => ({
                label: n.label,
                href: n.href.startsWith('#') ? `/${n.href}` : n.href,
              }))}
              cta={SELLERRADAR_CONTENT.heroPrimaryCta}
              footer={{
                tagline: SELLERRADAR_CONTENT.footerTagline,
                disclaimer: SELLERRADAR_CONTENT.disclaimer,
              }}
              stickyLead={{ label: 'Run a free impact check →', href: '/analyze' }}
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
