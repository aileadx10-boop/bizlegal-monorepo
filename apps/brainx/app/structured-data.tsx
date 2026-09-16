const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://brainx.bizlegal-ai.com/#org',
      name: 'BrainX',
      url: 'https://brainx.bizlegal-ai.com',
      parentOrganization: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://brainx.bizlegal-ai.com/#app',
      name: 'BrainX Opportunity Radar',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'Weekly evidence-first opportunity radar across real estate compliance, legal practice growth, and AI/fintech regulation. Every opportunity carries at least 3 verified sources and a seven-factor BrainX Decision Score.',
      offers: [
        { '@type': 'Offer', name: 'Radar (monthly)', price: '99.00', priceCurrency: 'USD', url: 'https://brainx.bizlegal-ai.com/pricing' },
        { '@type': 'Offer', name: 'Radar (yearly)', price: '999.00', priceCurrency: 'USD', url: 'https://brainx.bizlegal-ai.com/pricing' },
        { '@type': 'Offer', name: 'Radar + Build (monthly)', price: '249.00', priceCurrency: 'USD', url: 'https://brainx.bizlegal-ai.com/pricing' },
        { '@type': 'Offer', name: 'Radar + Build (yearly)', price: '2499.00', priceCurrency: 'USD', url: 'https://brainx.bizlegal-ai.com/pricing' },
      ],
    },
  ],
}

export default function StructuredData(): JSX.Element {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
}
