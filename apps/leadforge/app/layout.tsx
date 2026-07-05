import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, themeFOUCScript, SiteShell } from '@bizlegal/themes';
import StructuredData from "./structured-data"

export const metadata: Metadata = {
  metadataBase: new URL('https://leadforge.bizlegal-ai.com'),
  title: {
    default: "LeadForge",
    template: "%s | LeadForge",
  },
  description:
    "LeadForge powers the main deals funnel while Pipeforge handles the unclaimed funds upsell inside one unified Next.js deployment.",
  // W3.4 — GSC verification. Set NEXT_PUBLIC_GSC_VERIFICATION in Vercel env.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://leadforge.bizlegal-ai.com",
    siteName: "BizLegal AI",
    title: "LeadForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadForge",
    creator: "@bizlegalhubbot",
  },
  alternates: {
    canonical: "https://leadforge.bizlegal-ai.com",
  },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
};

// Daybreak only — no toggle.
const LANDING_FOUC = themeFOUCScript({
  primary: 'daybreak',
  alternate: null,
  storageKey: 'leadforge-theme',
});

// CrossLinkBanner — drives traffic to the AIA retainer page on hub
function CrossLinkBanner() {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 9999,
      background: 'linear-gradient(90deg, #0ea5e9 0%, #8b5cf6 100%)',
      color: 'white', padding: '8px 16px', fontSize: 14,
      textAlign: 'center', fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    }}>
      <span style={{ marginRight: 12 }}>LeadForge buyer-intent is part of BizLegal. 24/7 ops, $2,500/mo.</span>
      <a href="https://hub.bizlegal-ai.com/services/compliance-ops"
         style={{ color: 'white', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }}>
        See the offer &rarr;
      </a>
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <StructuredData />

        {/* Subdomain Design Pass FOUC — applies the Daybreak theme CSS vars before paint. */}
        <script dangerouslySetInnerHTML={{ __html: LANDING_FOUC }} />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.outbound-links.js"
          />
        )}
      </head>
      <body className="font-sans antialiased">
        <CrossLinkBanner />
        <ThemeProvider primary="daybreak" alternate={null} storageKey="leadforge-theme">
          <SiteShell
            brand="LeadForge"
            nav={[
              { label: 'Pipeline', href: '/#pipeline' },
              { label: 'Decision tree', href: '/decision-tree' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Contact', href: '/contact' },
            ]}
            cta={{ label: 'Run free lead-intake screen', href: '/decision-tree' }}
            footer={{
              tagline: 'Lead intake & deal routing for compliance practices',
              disclaimer:
                'LeadForge is intake automation — not legal advice. Each routed lead retains a named human reviewer for high-stakes engagements.',
            }}
            stickyLead={{ label: 'Run free lead-intake screen →', href: '/decision-tree' }}
            chromeSuppressPaths={[
              '/login',
              '/signup',
              '/dashboard',
              '/admin',
              '/account',
              '/certificate',
              '/api',
              '/',
            ]}
          >
            {children}
          </SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
