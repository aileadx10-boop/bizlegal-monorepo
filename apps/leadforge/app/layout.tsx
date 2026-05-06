import type { Metadata } from "next";
import { JetBrains_Mono, Sora, Syne } from "next/font/google";
import "./globals.css";
import { ThemeProvider, themeFOUCScript, SiteShell } from '@bizlegal/themes';

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    default: "LeadForge",
    template: "%s | LeadForge",
  },
  description:
    "LeadForge powers the main deals funnel while Pipeforge handles the unclaimed funds upsell inside one unified Next.js deployment.",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,300;9..144,0,400;9..144,1,300;9..144,1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        {/* Subdomain Design Pass FOUC — applies the Daybreak theme CSS vars before paint. */}
        <script dangerouslySetInnerHTML={{ __html: LANDING_FOUC }} />
      </head>
      <body
        className={`${sora.variable} ${syne.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
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
