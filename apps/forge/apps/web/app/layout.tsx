import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './styles/theme-v2.css'
import { CommandMenuWrapper } from './components/command-menu-wrapper'
import { StickyConversionBar } from './components/sticky-conversion-bar'
import CookieConsent from './components/CookieConsent'
import LegalShield from '@/components/layout/LegalShield'
import { ThemeToggle } from './components/ui-v2/ThemeToggle'
import { ThemeProvider, themeFOUCScript } from '@bizlegal/themes'

// Daybreak only — no toggle.
const LANDING_FOUC = themeFOUCScript({
  primary: 'daybreak',
  alternate: null,
  storageKey: 'forge-theme',
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Forge Compliance Engine — Continuous Regulatory Intelligence',
    template: '%s | Forge Compliance',
  },
  description: 'Multi-framework regulatory compliance briefs for US businesses and Israeli tech companies expanding globally. BOI/CTA filing, Regulatory Passport, Web Compliance Scanner.',
  keywords: ['BOI report', 'CTA compliance', 'FinCEN filing', 'regulatory passport', 'web compliance scanner', 'Israeli tech compliance', 'GDPR', 'CIPA'],
  openGraph: {
    title: 'Forge Compliance Engine — Continuous Regulatory Intelligence',
    description: 'Reduce $500/day BOI exposure. Compliance Snapshots delivered in 2–5 minutes.',
    url: 'https://forge.bizlegal-ai.com',
    siteName: 'Forge Compliance Engine',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forge Compliance Engine',
    description: 'Continuous regulatory intelligence. Reduce $500/day BOI exposure.',
  },
  robots: {
    index: true,
    follow: true,
  },
    verification: {
          google: 'WpGQcDSI9oB9_aT4PWWOH6MazCT19BE-ab3UUjB_PKk',
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,300;9..144,0,400;9..144,1,300;9..144,1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        {/* Theme V2 — set data-theme synchronously to avoid flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bl-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        {/* Subdomain Design Pass FOUC — applies the Daybreak theme CSS vars before paint. */}
        <script dangerouslySetInnerHTML={{ __html: LANDING_FOUC }} />
      </head>
      <body className="min-h-screen bg-forge-dark text-forge-text font-sans antialiased">
        <a href="https://bizlegal-ai.com" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '6px 0', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', background: '#0f172a', borderBottom: '1px solid #1e293b', color: '#64748b', textDecoration: 'none', fontFamily: 'Inter, sans-serif', transition: 'color 0.2s' }}>&larr; Back to BizLegal AI</a>
        <div style={{ paddingTop: '32px' }}>
        <StickyConversionBar />
        <CommandMenuWrapper>
        <ThemeProvider primary="daybreak" alternate={null} storageKey="forge-theme">
        {/* Skip-to-main link (WCAG 2.4.1) */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded">
          Skip to main content
        </a>
        {/* HEADER NAV */}
        <header className="sticky top-0 z-50 border-b border-forge-border bg-forge-dark/80 backdrop-blur-xl" role="banner">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight text-white hover:text-forge-accent transition-colors" aria-label="Forge home">
              Forge<span className="text-forge-accent" aria-hidden="true">.</span>
            </a>
            <nav className="hidden md:flex items-center gap-8 text-sm text-forge-text-secondary" aria-label="Primary">
              <a href="/boi" className="hover:text-white transition-colors">BOI Report</a>
              <a href="/passport" className="hover:text-white transition-colors">Regulatory Passport</a>
              <a href="/audit" className="hover:text-white transition-colors">Web Scanner</a>
              <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="/faq" className="hover:text-white transition-colors">FAQ</a>
            </nav>
            <div className="flex items-center gap-3">
              <ThemeToggle size={32} />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-forge-text-secondary bg-forge-border rounded border border-forge-border" aria-hidden="true">⌘K</kbd>
              <a href="/boi" className="btn-primary text-sm px-4 py-2 hidden sm:inline-block">
                File BOI — $149
              </a>
            </div>
          </div>
        </header>

        <main id="main-content" tabIndex={-1}>{children}</main>

        {/* FOOTER */}
        <footer className="border-t border-forge-border bg-forge-dark" role="contentinfo">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div>
                <div className="text-xl font-bold text-white mb-3">Forge<span className="text-forge-accent" aria-hidden="true">.</span></div>
                <p className="text-sm text-forge-muted leading-relaxed">
                  Continuous compliance scanning. Practitioner-reviewed regulatory intelligence for modern businesses.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-forge-muted">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                  <span>Multi-framework coverage live</span>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Products</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/boi" className="text-forge-muted hover:text-forge-accent transition-colors">BOI/CTA Report — $149</a></li>
                  <li><a href="/passport" className="text-forge-muted hover:text-forge-accent transition-colors">Regulatory Passport — $1,500</a></li>
                  <li><a href="/audit" className="text-forge-muted hover:text-forge-accent transition-colors">Web Compliance Scanner — from $99</a></li>
                  <li><a href="/pricing" className="text-forge-muted hover:text-forge-accent transition-colors">Compare Plans</a></li>
                </ul>
              </div>

              {/* Compliance */}
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Compliance</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/audit" className="text-forge-muted hover:text-forge-accent transition-colors">CIPA §631</a></li>
                  <li><a href="/audit" className="text-forge-muted hover:text-forge-accent transition-colors">GDPR / CCPA</a></li>
                  <li><a href="/audit" className="text-forge-muted hover:text-forge-accent transition-colors">10DLC / TCPA</a></li>
                  <li><a href="/audit" className="text-forge-muted hover:text-forge-accent transition-colors">ISO 27001</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Contact</h3>
                <ul className="space-y-2 text-sm text-forge-muted">
                  <li><span aria-hidden="true">📧</span> <a href="mailto:support@bizlegal-ai.com" className="hover:text-forge-accent">support@bizlegal-ai.com</a></li>
                  <li><span aria-hidden="true">🕐</span> 24h response time</li>
                  <li><span aria-hidden="true">🌍</span> US & Israel</li>
                </ul>
                <div className="mt-4 flex gap-3">
                  <a
                    href="https://www.linkedin.com/company/bizlegal-ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-forge-muted hover:text-forge-accent transition-colors"
                    aria-label="BizLegal AI on LinkedIn (opens in new tab)"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a
                    href="https://x.com/bizlegal_ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-forge-muted hover:text-forge-accent transition-colors"
                    aria-label="BizLegal AI on X / Twitter (opens in new tab)"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-forge-border pt-6 flex flex-wrap items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-sm text-forge-muted">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                SSL Secured
              </div>
              <div className="flex items-center gap-2 text-sm text-forge-muted">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                NOWPayments Verified
              </div>
              <div className="flex items-center gap-2 text-sm text-forge-muted">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                256-bit Encryption
              </div>
              <div className="flex items-center gap-2 text-sm text-forge-muted">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Practitioner-Reviewed
              </div>
            </div>

            {/* Legal */}
            <div className="border-t border-forge-border pt-6 text-center text-xs text-forge-muted space-y-2">
              <div className="flex flex-wrap justify-center gap-4 mb-3">
                <a href="/terms" className="hover:text-forge-accent transition-colors">Terms of Service</a>
                <a href="/privacy" className="hover:text-forge-accent transition-colors">Privacy Policy</a>
                <a href="/refund" className="hover:text-forge-accent transition-colors">Refund Policy</a>
                <a href="/disclaimer" className="hover:text-forge-accent transition-colors">Disclaimer</a>
                <a href="/acceptable-use" className="hover:text-forge-accent transition-colors">Acceptable Use</a>
              </div>
              <p>Not legal advice. For legal advice, consult a licensed attorney.</p>
              <p>Forge Compliance Engine provides regulatory intelligence, not legal opinion.</p>
              <p className="mt-2">BizLegal-AI · operated by DOR INNOVATIONS · worldwide remote · team@bizlegal-ai.com · UAE FZE registration in progress</p>
              <p className="mt-1">© {new Date().getFullYear()} Forge Compliance Engine · BizLegal AI · All rights reserved.</p>
            </div>
          </div>
          <LegalShield variant="micro" />
        </footer>
        </ThemeProvider>
        </CommandMenuWrapper>
        <CookieConsent />
        </div>
      </body>
    </html>
  )
}
