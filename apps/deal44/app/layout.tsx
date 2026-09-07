import type { Metadata } from 'next'
import './globals.css'

/**
 * Hebrew and right-to-left by default, because the first market is Israel and a
 * product that ships English-first and translates later never quite stops
 * reading like a translation.
 *
 * A room served to an English-speaking party re-stamps `lang`/`dir` on the
 * document for that party's own locale — see app/r/[token]/RoomView.tsx.
 *
 * No SiteShell from @bizlegal/themes: its chrome is LTR-biased and untested in
 * RTL, and a mirrored-but-broken navbar is worse than no navbar.
 */

const SITE = process.env.NEXT_PUBLIC_DEAL44_SITE_URL ?? 'https://deal44.bizlegal-ai.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'DEAL44 — חדר עסקה לנדל"ן',
  description:
    'רשימת משימות משותפת לעסקת נדל"ן: כל הצדדים, כל המועדים, חדר אחד. תזכורות יוצאות לפני המועד.',
  alternates: { canonical: SITE },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: SITE,
    siteName: 'DEAL44',
    title: 'DEAL44 — חדר עסקה לנדל"ן',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.outbound-links.js"
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  )
}
