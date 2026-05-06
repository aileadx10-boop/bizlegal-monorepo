import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Playfair_Display } from "next/font/google";

import "./globals.css";
import "./styles/theme-v2.css";
import CookieConsent from "@/components/CookieConsent";
import { ThemeToggle } from "./components/ui-v2/ThemeToggle";
import { ThemeProvider, themeFOUCScript, SiteShell, AppRouteOnly } from '@bizlegal/themes';

const LANDING_FOUC = themeFOUCScript({
  primary: 'royal-dark',
  alternate: 'royal-light',
  storageKey: 'docai-theme',
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "DocAI | Institutional Legal Documents",
  description:
    "Unified DocAI by BizLegal AI: generate attorney-grade contracts, review agreements, and unlock gated risk reports in one Next.js app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
        {/* Subdomain Design Pass FOUC — sets CSS vars for the LandingV2 themes (royal-dark/royal-light). */}
        <script dangerouslySetInnerHTML={{ __html: LANDING_FOUC }} />
      </head>
      <body className={`${dmSans.variable} ${dmMono.variable} ${playfair.variable}`}>
        {/* a11y A11Y-034 — legacy bl-theme bar hidden on marketing routes. */}
        <AppRouteOnly>
          <>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'var(--bl-bg-low, #0b1326)', borderBottom: '1px solid var(--bl-divider, rgba(218,226,253,0.08))', color: 'var(--bl-text-muted, rgba(218,226,253,0.4))', fontFamily: 'var(--bl-font-mono, var(--font-mono))' }}>
              <a href="https://bizlegal-ai.com" style={{ color: 'inherit', textDecoration: 'none' }}>← Back to BizLegal AI</a>
              <ThemeToggle size={24} />
            </div>
            <div style={{ height: '36px' }} aria-hidden="true" />
          </>
        </AppRouteOnly>
        <ThemeProvider primary="royal-dark" alternate="royal-light" storageKey="docai-theme">
          <div>
            <SiteShell
              brand="DocAI"
              nav={[
                { label: 'Scan', href: '/#scan' },
                { label: 'Decision tree', href: '/decision-tree' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Contact', href: '/contact' },
              ]}
              cta={{ label: 'Run free privacy screen', href: '/decision-tree' }}
              footer={{
                tagline: 'Document privacy & compliance, source-cited',
                disclaimer:
                  'DocAI is regulatory intelligence — not legal advice. For a binding opinion, consult a licensed attorney in your jurisdiction.',
              }}
              stickyLead={{ label: 'Run free DocAI privacy screen →', href: '/decision-tree' }}
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
          </div>
        </ThemeProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
