import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Compliance Reports from $15 | Forge',
  description: 'Transparent pricing for state transparency report kits, web compliance scans, and regulatory passports. No subscriptions. Crypto and card payments accepted.',
  keywords: 'compliance report pricing, state transparency report cost, web compliance scanner price, regulatory passport pricing',
  openGraph: {
    title: 'Forge Pricing — Simple, Transparent Compliance Report Pricing',
    description: 'No subscriptions, no hidden fees. State transparency kits from $97, web scans from $15, regulatory passports from $297. Crypto discount available.',
    url: 'https://forge.bizlegal-ai.com/pricing',
    siteName: 'Forge Compliance Engine',
    type: 'website',
  },
  alternates: { canonical: 'https://forge.bizlegal-ai.com/pricing' },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
