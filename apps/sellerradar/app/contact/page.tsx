import type { Metadata } from 'next'
import { LegalPage } from '../components/LegalPage'

export const metadata: Metadata = {
  title: 'Contact — SellerRadar',
  description: 'Reach the SellerRadar team — report questions, CSV parsing issues, monitor subscription help.',
  alternates: { canonical: 'https://sellerradar.bizlegal-ai.com/contact' },
}

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <p>
        Questions about a fee change, an impact report, or a CSV that won&apos;t
        parse? Email us — we respond within one business day.
      </p>
      <p>
        <a href="mailto:intelligence@bizlegal-ai.com" style={{ color: 'var(--bl-accent)' }}>
          intelligence@bizlegal-ai.com
        </a>
      </p>
      <p>
        Include your report reference (SR-…) or order ID so we can locate your records.
        For payment issues, include the PayPal order ID or NOWPayments invoice ID.
      </p>
    </LegalPage>
  )
}
