import type { Metadata } from 'next'
import { LegalPage } from '../components/LegalPage'

export const metadata: Metadata = {
  title: 'Contact — FalseEcho',
  description: 'Reach the FalseEcho team — evidence questions, scan issues, human review requests.',
  alternates: { canonical: 'https://falseecho.bizlegal-ai.com/contact' },
}

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <p>
        Questions about a scan, an evidence record, or a human review of your
        evidence pack? Email us — we respond within one business day.
      </p>
      <p>
        <a href="mailto:intelligence@bizlegal-ai.com" style={{ color: 'var(--bl-accent)' }}>
          intelligence@bizlegal-ai.com
        </a>
      </p>
      <p>
        Include your scan reference (FE-…) or order ID so we can locate your records.
        For payment issues, include the PayPal order ID or NOWPayments invoice ID.
      </p>
    </LegalPage>
  )
}
