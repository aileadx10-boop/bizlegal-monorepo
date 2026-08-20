import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider, themeFOUCScript, SiteShell } from '@bizlegal/themes'

const FOUC = themeFOUCScript({
  primary: 'midnight',
  alternate: null,
  storageKey: 'coguard-theme',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://coguard.bizlegal-ai.com'),
  title: 'CoGuard — Professional Co-Parenting Communication',
  description:
    'AI-powered BIFF message neutralization and SHA-256 court-admissible communication logging. Draft clean. Send confident. Build your case.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://coguard.bizlegal-ai.com',
    siteName: 'CoGuard',
    title: 'CoGuard — Professional Co-Parenting Communication',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoGuard — Professional Co-Parenting Communication',
  },
  alternates: { canonical: 'https://coguard.bizlegal-ai.com' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: FOUC }} />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.outbound-links.js"
          />
        )}
      </head>
      <body>
        <ThemeProvider primary="midnight" alternate={null} storageKey="coguard-theme">
          <SiteShell
            brand="CoGuard"
            nav={[
              { label: 'How it works', href: '/#how' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Dashboard', href: '/dashboard' },
            ]}
            cta={{ label: 'Start free trial', href: '/pricing' }}
            footer={{
              tagline: 'Draft clean. Send confident. Build your case.',
              disclaimer:
                'CoGuard is a communication drafting and documentation tool. It is not legal advice and does not create an attorney-client relationship. Have your attorney verify admissibility of any documentation in your jurisdiction.',
              links: [
                { label: 'Pricing', href: '/pricing' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
                { label: 'Refund', href: '/refund' },
                { label: 'Disclaimer', href: '/disclaimer' },
                { label: 'Contact', href: '/contact' },
              ],
            }}
            chromeSuppressPaths={['/login', '/dashboard', '/attorney', '/api']}
          >
            {children}
          </SiteShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
