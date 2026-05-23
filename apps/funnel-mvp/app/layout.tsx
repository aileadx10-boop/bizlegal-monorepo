import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://funnel.bizlegal-ai.com'),
  title: {
    default: 'BizLegal AI — Contract Risk Report ($97 one-time)',
    template: '%s | BizLegal AI Funnel',
  },
  description:
    'Upload a contract. Get a free 2-issue preview in under 60 seconds. Pay $97 once for the full risk report (anomalies, missing protections, ambiguities, remediation guidance). Decision-support, not legal advice.',
  openGraph: {
    type: 'website',
    siteName: 'BizLegal AI Funnel',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://funnel.bizlegal-ai.com' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.outbound-links.js"
          />
        )}
      </head>
      <body>
        <a href="https://bizlegal-ai.com" className="topbar">
          ← Back to BizLegal AI
        </a>
        <main>{children}</main>
        <footer className="site-footer">
          <p>
            BizLegal AI provides decision-support, not legal advice. For a binding opinion, consult a licensed attorney in your jurisdiction.
          </p>
          <p>© 2026 DOR INNOVATIONS · team@bizlegal-ai.com</p>
        </footer>
      </body>
    </html>
  )
}
