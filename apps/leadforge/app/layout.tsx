import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, themeFOUCScript, SiteShell } from '@bizlegal/themes';

export const metadata: Metadata = {
  metadataBase: new URL('https://leadforge.bizlegal-ai.com'),
  title: {
    default: "LeadForge",
    template: "%s | LeadForge",
  },
  description:
    "LeadForge powers the main deals funnel while Pipeforge handles the unclaimed funds upsell inside one unified Next.js deployment.",
  // W3.4 — GSC verification. Set NEXT_PUBLIC_GSC_VERIFICATION in Vercel env.
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
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
