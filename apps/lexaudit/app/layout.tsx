import type { Metadata } from 'next'
import './globals.css'
import './styles/theme-v2.css'
import CookieConsent from './components/CookieConsent'
import LegalShield from '@/components/layout/LegalShield'
import { ThemeToggle } from './components/ui-v2/ThemeToggle'
import { ThemeProvider, themeFOUCScript } from '@bizlegal/themes'

export const metadata: Metadata = {
  title: 'LexAudit — Compliance Health Scores for Lawyers',
  description: 'Regulatory intelligence — not legal advice. LexAudit turns your AI-assisted matter workflow into a versioned, source-cited Compliance Health Score reviewed by a named analyst.',
  keywords: 'compliance health score, regulatory intelligence, AI audit trail, lawyer governance, attestation',
}

const LANDING_FOUC = themeFOUCScript({
  primary: 'twilight',
  alternate: 'daybreak',
  storageKey: 'lex-theme',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', background: '#050509', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#636680', fontFamily: "'DM Sans', sans-serif" }}>
          <a href="https://bizlegal-ai.com" style={{ color: 'inherit', textDecoration: 'none' }}>&larr; Back to BizLegal AI</a>
          <ThemeToggle size={24} />
        </div>
        <div style={{ paddingTop: '36px' }}>
          <ThemeProvider primary="twilight" alternate="daybreak" storageKey="lex-theme">
            {children}
          </ThemeProvider>
        </div>
        <LegalShield variant="micro" />
        <CookieConsent />
      </body>
    </html>
  )
}
