import type { Metadata } from 'next'
import './globals.css'
import './styles/theme-v2.css'
import CookieConsent from './components/CookieConsent'
import LegalShield from '@/components/layout/LegalShield'
import { ThemeToggle } from './components/ui-v2/ThemeToggle'

export const metadata: Metadata = {
  title: 'LexAudit — Compliance Health Scores for Lawyers',
  description: 'Regulatory intelligence — not legal advice. LexAudit turns your AI-assisted matter workflow into a versioned, source-cited Compliance Health Score reviewed by a named analyst.',
  keywords: 'compliance health score, regulatory intelligence, AI audit trail, lawyer governance, attestation',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Theme V2 — set data-theme synchronously to avoid flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bl-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', background: '#050509', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#636680', fontFamily: "'DM Sans', sans-serif" }}>
          <a href="https://bizlegal-ai.com" style={{ color: 'inherit', textDecoration: 'none' }}>&larr; Back to BizLegal AI</a>
          <ThemeToggle size={24} />
        </div>
        <div style={{ paddingTop: '36px' }}>
          {children}
        </div>
        <LegalShield variant="micro" />
        <CookieConsent />
      </body>
    </html>
  )
}
