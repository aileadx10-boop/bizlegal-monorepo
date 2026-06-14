import type { Metadata } from "next";
import "./globals.css";
import "./styles/theme-v2.css";
import CookieConsent from "@/components/CookieConsent";
import { ThemeProvider, themeFOUCScript, SiteShell } from '@bizlegal/themes';

/**
 * DocAI layout.
 *
 * 2026-05-11 cleanup (Moses brand audit):
 *   - Removed the dark <AppRouteOnly> "← Back to BizLegal AI" + legacy
 *     ThemeToggle bar that pinned itself at z-index 9999 with a navy
 *     background, hijacking every Daybreak page with a forced-dark strip.
 *     SiteShell nav already provides the back-to-hub anchor via the brand
 *     mark; no duplicate UI needed.
 *   - Removed the legacy `data-theme=light|dark` FOUC script. The
 *     <ThemeProvider primary='daybreak'> below + themeFOUCScript handle
 *     the only theme attribute that actually matters now.
 *   - Removed '/' from chromeSuppressPaths so SiteShell renders its nav
 *     + footer (with all legal-shield links) on the homepage. Previously
 *     suppressed → users couldn't reach /methodology /trust /terms /etc
 *     from the home page footer.
 *   - footer.links now surfaces every legal-shield page the site owns
 *     (was only 4 of the 13).
 */

const LANDING_FOUC = themeFOUCScript({
  primary: 'daybreak',
  alternate: null,
  storageKey: 'docai-theme',
});


export const metadata: Metadata = {
  metadataBase: new URL('https://docai.bizlegal-ai.com'),
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
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.outbound-links.js"
          />
        )}
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,300;9..144,0,400;9..144,1,300;9..144,1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        {/* Daybreak FOUC — sync sets data-bl-theme-v2 before paint. */}
        <script dangerouslySetInnerHTML={{ __html: LANDING_FOUC }} />
      </head>
      <body>
        <ThemeProvider primary="daybreak" alternate={null} storageKey="docai-theme">
          <SiteShell
            brand="DocAI"
            nav={[
              { label: 'Scan', href: '/#scan' },
              { label: 'Generate', href: '/#generate' },
              { label: 'Decision tree', href: '/decision-tree' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Methodology', href: '/methodology' },
              { label: 'Trust', href: '/trust' },
            ]}
            cta={{ label: 'Run free privacy screen', href: '/decision-tree' }}
            footer={{
              tagline: 'Document privacy & compliance, source-cited',
              disclaimer:
                'DocAI is regulatory intelligence — not legal advice. For a binding opinion, consult a licensed attorney in your jurisdiction.',
              // Full legal-shield + methodology coverage in the footer.
              // Was previously falling through to the SiteShell default
              // which only included Disclaimer / Privacy / Terms / Contact.
              // Without these the only way to reach /methodology, /trust,
              // /refund, /acceptable-use, /dpa was direct-URL navigation
              // — failing the revenue-vs-liability rule.
              links: [
                { label: 'About', href: '/about' },
                { label: 'Methodology', href: '/methodology' },
                { label: 'Trust', href: '/trust' },
                { label: 'DPA Negotiator', href: '/dpa' },
                { label: 'SQA Auto-fill', href: '/sqa' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Contact', href: '/contact' },
                { label: 'Disclaimer', href: '/disclaimer' },
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
                { label: 'Refund', href: '/refund' },
                { label: 'Acceptable use', href: '/acceptable-use' },
              ],
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
              // '/' REMOVED 2026-05-11 — was hiding the SiteShell footer
              // with all legal-shield links from the homepage. Restoring
              // chrome on home so methodology/trust/legal pages are
              // reachable without typing the URL.
            ]}
          >
            {children}
          </SiteShell>
        </ThemeProvider>
        <CookieConsent />
      </body>
    </html>
  );
}

