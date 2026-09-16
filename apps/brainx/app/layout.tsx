import type { Metadata } from 'next'
import './globals.css'
import './styles/theme-v2.css'
import { ThemeProvider, themeFOUCScript, SiteShell } from '@bizlegal/themes'
import { BRAINX_CONTENT } from './landing-content'
import StructuredData from './structured-data'

const LANDING_FOUC = themeFOUCScript({
  primary: 'royal-dark',
  alternate: 'royal-light',
  storageKey: 'brainx-theme',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://brainx.bizlegal-ai.com'),
  title: {
    default: 'BrainX — Opportunity Radar',
    template: '%s · BrainX',
  },
  description:
    'BrainX finds business opportunities you can actually sell and shows the evidence behind each one. A weekly, evidence-first radar across real estate compliance, legal practice growth, and AI/fintech regulation. $99/mo.',
  keywords:
    'opportunity intelligence, legal market intelligence, regulatory opportunity radar, compliance product opportunities, real estate compliance opportunities, AI fintech regulation opportunities',
  openGraph: {
    title: 'BrainX — Opportunity Radar',
    description: 'Find the next thing worth selling — with the evidence behind it.',
    url: 'https://brainx.bizlegal-ai.com',
    siteName: 'BrainX by BizLegal AI',
    type: 'website',
  },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } } : {}),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script defer data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.outbound-links.js" />
        )}
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Content-layer (--bl-*) theme — set data-theme synchronously to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bl-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        {/* SiteShell chrome (THEME_VAR_KEYS: royal-dark/royal-light). */}
        <script dangerouslySetInnerHTML={{ __html: LANDING_FOUC }} />
      </head>
      <body>
        <ThemeProvider primary="royal-dark" alternate="royal-light" storageKey="brainx-theme">
          <SiteShell
            brand={BRAINX_CONTENT.brand}
            nav={BRAINX_CONTENT.nav}
            cta={BRAINX_CONTENT.heroPrimaryCta}
            footer={{ tagline: BRAINX_CONTENT.footerTagline, disclaimer: BRAINX_CONTENT.disclaimer }}
            chromeSuppressPaths={['/radar', '/enter', '/access', '/api']}
          >
            {children}
          </SiteShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
