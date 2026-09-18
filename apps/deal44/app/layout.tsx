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

/** GEO/AEO enrichment — Organization / WebSite / Product / FAQPage JSON-LD. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}#org`,
      name: 'DEAL44',
      url: SITE,
      description: 'חדר עסקה משותף לעסקאות נדל"ן — כל הצדדים, כל המועדים, חדר אחד.',
      brand: 'DEAL44',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}#website`,
      name: 'DEAL44',
      url: SITE,
      inLanguage: ['he', 'en'],
      publisher: { '@id': `${SITE}#org` },
    },
    {
      '@type': 'Product',
      '@id': `${SITE}#product`,
      name: 'DEAL44 Deal Room',
      description:
        'מרחב משימות משותף לעסקת נדל"ן: כל הצדדים, כל המועדים, חדר אחד. תזכורות יוצאות לפני המועד.',
      brand: { '@id': `${SITE}#org` },
      offers: [
        {
          '@type': 'Offer',
          name: 'הקמת חדר עסקה (ILS)',
          priceCurrency: 'ILS',
          price: '2500',
          priceValidUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        },
        {
          '@type': 'Offer',
          name: 'Deal room setup (USD)',
          priceCurrency: 'USD',
          price: '679',
          priceValidUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        },
      ],
      isRelatedTo: `${SITE}#product-detail`,
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'מה זה DEAL44?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'מרחב משימות משותף (deal room) לעסקת נדל"ן: כל הצדדים רואים את אותה רשימת משימות ואותם מועדים, ותזכורות יוצאות לפני כל מועד קריטי.',
          },
        },
        {
          '@type': 'Question',
          name: 'כמה עולה DEAL44?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'הקמה חד-פעמית של ₪2,500 (או $679 עבור הגרסה האנגלית) + ₪349 לחודש. הצפנת תשלומים: ILS דרך קריפטו בלבד, USD בשני המסלולים.',
          },
        },
        {
          '@type': 'Question',
          name: 'למי זה מיועד?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'למתווכי נדל"ן ולצדדים לעסקה בישראל — קונה, מוכר, בנק, עורכי דין, ורישום בטאבו / רמ"י / חברה משכנת.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
