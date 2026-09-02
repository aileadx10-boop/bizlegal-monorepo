import type { Metadata } from 'next'
import { LegalPage } from '../components/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service — SellerRadar',
  description: 'Terms governing SellerRadar audits, impact reports, and monitor subscriptions.',
  alternates: { canonical: 'https://sellerradar.bizlegal-ai.com/terms' },
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        SellerRadar provides Amazon fee-change impact estimates &ldquo;as is&rdquo;. A
        $49 audit is a one-time purchase of a per-SKU impact report computed from your
        uploaded catalog and the fee schedules current at analysis time. A $99/month
        monitor subscription adds weekly re-scans when schedules update, personal
        impact alert emails, and a change-history dashboard, and renews until
        cancelled.
      </p>
      <p>
        You may only upload catalogs you own or are authorized to analyze. Reports are
        estimates computed from published fee schedules and your stated unit economics —
        they are not accounting records, and actual settlements may differ. You agree
        not to misrepresent report contents.
      </p>
      <p>
        One-time audits are non-refundable once produced unless damaged or defective;
        defective output is redelivered or refunded. Monitor subscriptions can be
        cancelled anytime and remain active to the end of the paid period.
      </p>
      <p>
        SellerRadar provides no financial, tax, or repricing advice and guarantees no
        savings. Liability is limited to the amount paid for the report or subscription
        period at issue. Governed by the laws of the State of Israel; operator: DOR
        INNOVATIONS.
      </p>
    </LegalPage>
  )
}
