import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MiCA Asset Classifier — EU Crypto Token Classification Tool | BizLegal AI',
  description: '8-question decision tree to classify your crypto-asset under EU Regulation 2023/1114 (MiCA). Identify ART, EMT, utility token, or other MiCA category in minutes.',
  openGraph: {
    title: 'MiCA Asset Classifier — EU Crypto Token Classification',
    description: 'Classify your token under EU MiCA: Asset-Referenced Token, E-Money Token, utility token, or other. Free 8-question tool.',
    url: 'https://bizlegal-ai.com/tools/mica-asset-classifier',
  },
  alternates: { canonical: 'https://bizlegal-ai.com/tools/mica-asset-classifier' },
}

const LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'MiCA Asset Classifier',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://bizlegal-ai.com/tools/mica-asset-classifier',
      description: '8-question decision tree to classify crypto-assets under EU Regulation 2023/1114 (Markets in Crypto-Assets). Identifies ART, EMT, utility tokens, fully decentralised assets, and NFTs.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      provider: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What are the three main MiCA token categories?',
          acceptedAnswer: { '@type': 'Answer', text: 'MiCA creates three main regulated categories: (1) Asset-Referenced Tokens (ARTs) — tokens referencing multiple assets, requiring NCA prior authorisation; (2) E-Money Tokens (EMTs) — tokens referencing a single official currency, requiring an e-money institution authorisation; (3) Other crypto-assets (Title II) — all other fungible tokens not exempt, requiring a whitepaper notified to the NCA 20 working days before the offering.' },
        },
        {
          '@type': 'Question',
          name: 'Are NFTs covered by MiCA?',
          acceptedAnswer: { '@type': 'Answer', text: 'Unique and non-fungible tokens (NFTs) are generally outside MiCA scope per Recital 10. However, if NFTs are issued in large fungible series or are fractionalized, they may fall within scope. ESMA guidance confirms case-by-case analysis is required.' },
        },
        {
          '@type': 'Question',
          name: 'When did MiCA come into force?',
          acceptedAnswer: { '@type': 'Answer', text: 'MiCA (Regulation (EU) 2023/1114) entered into force on 29 June 2023. Provisions for ARTs and EMTs applied from 30 June 2024. Provisions for other crypto-assets and CASPs applied from 30 December 2024.' },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://bizlegal-ai.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'MiCA Asset Classifier', item: 'https://bizlegal-ai.com/tools/mica-asset-classifier' },
      ],
    },
  ],
}

export default function MicaAssetClassifierLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      {children}
    </>
  )
}
