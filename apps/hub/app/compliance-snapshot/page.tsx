import type { Metadata } from 'next'
import { ComplianceSnapshotClient } from './client'

export const metadata: Metadata = {
  title: 'Compliance Health Snapshot — $9, 60 seconds | BizLegal AI',
  description:
    'Paste your privacy policy or vendor contract. Get a 60-second compliance health snapshot with 3 specific risk flags and 1 fix you can ship today. No signup. $9 one-time.',
  keywords: [
    'compliance health check',
    'GDPR quick scan',
    'SOC 2 readiness check',
    'vendor contract risk',
    'privacy policy audit',
  ],
  openGraph: {
    title: 'Compliance Health Snapshot — $9, 60 seconds',
    description:
      'Paste a doc. Get 3 risk flags + 1 fix. No signup. Used by 12,000+ founders, GCs, and compliance leads.',
    type: 'website',
    url: 'https://hub.bizlegal-ai.com/compliance-snapshot',
  },
  alternates: { canonical: 'https://hub.bizlegal-ai.com/compliance-snapshot' },
}

export default function Page() {
  return <ComplianceSnapshotClient />
}
