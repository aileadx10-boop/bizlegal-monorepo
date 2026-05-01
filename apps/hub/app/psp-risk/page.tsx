import type { Metadata } from 'next'
import { PspRiskClient } from './PspRiskClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'PSP & MoR Risk Manager — BizLegal AI',
  description:
    'Pre-flight audit before applying to Stripe / PayPal / Square / Mercury / Wise / Revolut Business — or recovery support after a freeze. Pattern recognition against public AUP texts. Decision-support, not legal advice.',
  alternates: { canonical: 'https://bizlegal-ai.com/psp-risk' },
}

export default function PspRiskPage() {
  return <PspRiskClient />
}
