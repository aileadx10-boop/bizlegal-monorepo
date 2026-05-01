import type { Metadata } from 'next'
import { RiskEngineClient } from './RiskEngineClient'

export const metadata: Metadata = {
  title: 'Risk Engine — BizLegal AI',
  description: 'Full-spectrum regulatory risk analysis across 50+ jurisdictions. Quantify enforcement probability, financial exposure, and compliance gaps.',
}

export default function RiskEnginePage() {
  return <RiskEngineClient />
}
