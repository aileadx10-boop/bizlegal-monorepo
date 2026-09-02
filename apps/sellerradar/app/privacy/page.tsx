import type { Metadata } from 'next'
import { LegalPage } from '../components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy — SellerRadar',
  description: 'What SellerRadar collects (catalog CSV uploads, email addresses, payment records) and how it is used.',
  alternates: { canonical: 'https://sellerradar.bizlegal-ai.com/privacy' },
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        SellerRadar (operated by DOR INNOVATIONS / BizLegal AI) collects only what the
        service needs: the catalog CSV you upload (SKU, ASIN, category, dimensions,
        weight, COGS, price, estimated monthly units), your email address for report
        delivery, and payment records from our processors (PayPal, NOWPayments).
      </p>
      <p>
        We use this data to compute the fee-change impact reports you request, deliver
        them by email, process payment, and — for monitor-tier subscribers — re-scan
        your catalog when fee schedules update. We do not sell personal data and do not
        share your catalog economics with third parties. Email sequences include
        one-click unsubscribe.
      </p>
      <p>
        Programmatic SEO pages (/seo/…) describe fee-schedule changes only — they never
        contain your SKUs, prices, margins, or email address.
      </p>
      <p>
        We use cookies for consent preferences and optional privacy-respecting
        analytics (Plausible, when enabled). Questions: intelligence@bizlegal-ai.com.
      </p>
    </LegalPage>
  )
}
