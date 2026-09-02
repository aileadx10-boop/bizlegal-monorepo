import type { Metadata } from 'next'
import { LegalPage } from '../components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy — FalseEcho',
  description: 'What FalseEcho collects (scan submissions, email addresses, payment records) and how it is used.',
  alternates: { canonical: 'https://falseecho.bizlegal-ai.com/privacy' },
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        FalseEcho (operated by DOR INNOVATIONS / BizLegal AI) collects only what the
        service needs: the entity name, optional URL or pasted content you submit for
        scanning, your email address for report delivery, and payment records from our
        processors (PayPal, NOWPayments). Engine responses captured during a scan are
        stored as evidence records with cryptographic hash anchors.
      </p>
      <p>
        We use this data to run the scans you request, deliver evidence packs, process
        payment, and — for monitor-tier subscribers — re-scan on a daily cadence. We do
        not sell personal data. Email sequences include one-click unsubscribe.
      </p>
      <p>
        Evidence records may be surfaced on public, indexable evidence pages
        (/seo/…) showing the engine, probe question, flag status, timestamp, and
        hash — never full responses or your email address.
      </p>
      <p>
        We use cookies for consent preferences and optional privacy-respecting
        analytics (Plausible, when enabled). Questions: intelligence@bizlegal-ai.com.
      </p>
    </LegalPage>
  )
}
