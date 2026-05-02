import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Web Compliance Scanner — CIPA, GDPR, TCPA | Forge',
  description: 'Free website compliance scan in 60 seconds. Detect CIPA §631 wiretapping, GDPR cookie violations, TCPA/10DLC exposure, and more. Fix scripts included.',
  keywords: 'website compliance scanner, CIPA compliance, GDPR audit, TCPA compliance, web privacy scan, free compliance check',
  openGraph: {
    title: 'Free Compliance Scanner — Find Regulatory Exposure in 60 Seconds',
    description: 'Scan your website for CIPA, GDPR, CCPA, TCPA, and 10+ regulatory violations. Free preview, fix scripts included.',
    url: 'https://forge.bizlegal-ai.com/audit',
    siteName: 'Forge Compliance Engine',
    type: 'website',
  },
  alternates: { canonical: 'https://forge.bizlegal-ai.com/audit' },
}

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return children
}
