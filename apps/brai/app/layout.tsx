import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"
import "./styles/theme-v2.css"
import { ThemeProvider, themeFOUCScript, SiteShell } from '@bizlegal/themes'
import { BRAI_CONTENT } from './landing-content'
import StructuredData from "./structured-data"

export const metadata: Metadata = {
  metadataBase: new URL('https://brai.bizlegal-ai.com'),
  title: "BRAI — Blockchain Regulatory Intelligence",
  description:
    "BRAI produces compliance posture reports for digital-asset ventures. Human-reviewed. Not legal advice.",
  // W3.4 — GSC verification. Set NEXT_PUBLIC_GSC_VERIFICATION in Vercel env
  // (a 43-char token GSC issues at "Add property → HTML tag" flow). Renders
  // only when present, mirroring the hub pattern.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://brai.bizlegal-ai.com",
    siteName: "BizLegal AI",
    title: "BRAI — Blockchain Regulatory Intelligence",
  },
  twitter: {
    card: "summary_large_image",
    title: "BRAI — Blockchain Regulatory Intelligence",
    creator: "@bizlegalhubbot",
  },
  alternates: {
    canonical: "https://brai.bizlegal-ai.com",
  },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
}

const LANDING_FOUC = themeFOUCScript({
  primary: 'royal-dark',
  alternate: 'royal-light',
  storageKey: 'brai-theme',
})

export default function RootLayout({ children }: { children: ReactNode }) {
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
        {/* Subdomain Design Pass — Fraunces + Inter for the LandingV2 homepage. */}
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,300;9..144,0,400;9..144,1,300;9..144,1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        {/* Existing bl-theme FOUC (light/dark) — kept for /pricing, /methodology, /trust. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bl-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        {/* Subdomain Design Pass FOUC — sets CSS vars for the LandingV2 themes (royal-dark/royal-light). */}
        <script dangerouslySetInnerHTML={{ __html: LANDING_FOUC }} />
      </head>
      <body>
        <ThemeProvider primary="royal-dark" alternate="royal-light" storageKey="brai-theme">
          <SiteShell
            brand={BRAI_CONTENT.brand}
            nav={BRAI_CONTENT.nav.map((n) => ({
              label: n.label,
              href: n.href.startsWith('#') ? `/${n.href}` : n.href,
            }))}
            cta={BRAI_CONTENT.heroPrimaryCta}
            footer={{
              tagline: BRAI_CONTENT.footerTagline,
              disclaimer: BRAI_CONTENT.disclaimer,
            }}
            stickyLead={{ label: 'Run free sanctions screen →', href: '/decision-tree' }}
          >
            {children}
          </SiteShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
