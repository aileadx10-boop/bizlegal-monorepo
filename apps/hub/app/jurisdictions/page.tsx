import type { Metadata } from 'next'
import { JurisdictionsClient } from './JurisdictionsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Jurisdiction Arbitrage — BizLegal AI',
  description:
    'Compare regulatory risk, compliance cost, speed-to-operate and enforcement aggression across 14 jurisdictions. Run a side-by-side comparison powered by Claude Sonnet 4.6.',
  alternates: { canonical: 'https://bizlegal-ai.com/jurisdictions' },
}

export default function JurisdictionsPage() {
  return <JurisdictionsClient />
}
