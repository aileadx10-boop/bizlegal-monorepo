import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CTA/BOI Report Filing — $149 | Forge Compliance Engine',
  description: 'File your Corporate Transparency Act Beneficial Ownership Information report with FinCEN. Reduce $500/day exposure. Guided process, delivered in 2–5 minutes, practitioner-reviewed.',
  keywords: 'BOI report, CTA compliance, FinCEN filing, beneficial ownership, Corporate Transparency Act, $500 penalty',
  openGraph: {
    title: 'File Your BOI Report Before $500/Day Penalties Stack Up',
    description: 'Corporate Transparency Act compliance. FinCEN Form 1 generation, ownership analysis, and annual reminders. $149 flat fee.',
    url: 'https://forge.bizlegal-ai.com/boi',
    siteName: 'Forge Compliance Engine',
    type: 'website',
  },
  alternates: { canonical: 'https://forge.bizlegal-ai.com/boi' },
}

export default function BOILayout({ children }: { children: React.ReactNode }) {
  return children
}
