import type { Metadata } from 'next'
import './globals.css'
import './styles/theme-v2.css'
import NavBar from '@/components/layout/NavBar'
import TickerBar from '@/components/layout/TickerBar'
import Footer from '@/components/layout/Footer'
import CookieConsent from '@/components/CookieConsent'
import { CommandMenuWrapper } from './components/command-menu-wrapper'
import { StickyConversionBar } from './components/sticky-conversion-bar'
import { BackgroundGlow } from './components/ui/BackgroundGlow'
import { FloatingParticles } from './components/ui/FloatingParticles'

export const metadata: Metadata = {
  metadataBase: new URL('https://bizlegal-ai.com'),
  title: {
    default: 'BizLegal AI — Compliance Intelligence for Digital Assets',
    template: '%s | BizLegal AI'
  },
  description: 'Live regulatory intelligence for SEC, MiCA, VARA, and GDPR. Risk assessments, compliance tools, and human-reviewed analysis for fintech and crypto executives.',
  openGraph: {
    type: 'website',
    siteName: 'BizLegal AI',
    images: [{ url: '/api/og?title=BizLegal+AI+Compliance+Intelligence', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://bizlegal-ai.com' },
  // W3.4 — Google Search Console site verification. Set
  // NEXT_PUBLIC_GSC_VERIFICATION in Vercel env (a 43-char token GSC
  // issues at "Add property → HTML tag" flow). Renders only when
  // present so the slot is invisible until Moses adds the env var.
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Theme V2 — set data-theme synchronously to avoid flash on dark users.
            Reads localStorage[bl-theme] -> falls back to prefers-color-scheme -> light. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bl-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-[var(--bg)]">
        <BackgroundGlow />
        <FloatingParticles />
        <StickyConversionBar />
        <CommandMenuWrapper>
          <NavBar />
          <TickerBar />
          <main style={{ paddingTop: 92 }}>
            {children}
          </main>
          <Footer />
        </CommandMenuWrapper>
        <CookieConsent />
      </body>
    </html>
  )
}
