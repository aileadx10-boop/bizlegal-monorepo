import type { Metadata } from 'next'
import { LegalPage } from '../components/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service — FalseEcho',
  description: 'Terms governing FalseEcho scans, evidence packs, and monitor subscriptions.',
  alternates: { canonical: 'https://falseecho.bizlegal-ai.com/terms' },
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        FalseEcho provides AI-answer-engine scans and hash-anchored evidence packs
        &ldquo;as is&rdquo;. A $29 audit is a one-time purchase of a single 25-prompt,
        4-engine scan and its evidence pack. A $149/month monitor subscription adds
        daily re-scans, new-falsehood alerts, and weekly summaries, and renews until
        cancelled.
      </p>
      <p>
        You may only scan entities you are, own, represent, or have authorization to
        evaluate. You agree not to use evidence packs to harass, to misrepresent their
        contents, or to submit automated corrections to any platform — correction
        drafts we provide are for your human review only.
      </p>
      <p>
        One-time scans are non-refundable once produced unless damaged or defective;
        defective output is redelivered or refunded. Monitor subscriptions can be
        cancelled anytime and remain active to the end of the paid period.
      </p>
      <p>
        FalseEcho is not a law firm and provides no legal advice. Liability is limited
        to the amount paid for the scan or subscription period at issue. Governed by
        the laws of the State of Israel; operator: DOR INNOVATIONS.
      </p>
    </LegalPage>
  )
}
