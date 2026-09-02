import type { Metadata } from 'next'
import { LegalPage } from '../components/LegalPage'

export const metadata: Metadata = {
  title: 'Disclaimer — SellerRadar',
  description: 'SellerRadar publishes fee-impact estimates, not financial advice. Read the scope limits of our reports.',
  alternates: { canonical: 'https://sellerradar.bizlegal-ai.com/disclaimer' },
}

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer">
      <p>
        <strong>Estimates, not settlements.</strong> SellerRadar computes the dollar
        impact of Amazon fee-schedule changes from curated, versioned fee fixtures
        (each row carries a source URL and effective date) and the unit economics in
        the CSV you upload — price, COGS, dimensions, weight, estimated monthly units.
      </p>
      <p>
        Every impact figure is an estimate — <strong>verify against your settlement
        reports</strong>. Real settlements include fees outside v1 scope (inbound
        placement, aged-inventory surcharges, returns processing, PPC), promotions,
        and per-unit events our model does not see.
      </p>
      <p>
        SellerRadar is not an accounting, tax, or financial advisory service and
        provides no repricing recommendations. No savings are guaranteed. Fee
        fixtures are curated snapshots; Amazon may change, interpret, or apply fees
        differently than published.
      </p>
      <p style={{ fontSize: 'var(--bl-text-small)', color: 'var(--bl-text-subtle)' }}>
        Disclosure version {process.env.NEXT_PUBLIC_DISCLAIMER_VERSION ?? 'v1.0.0-p1'} ·
        Operated by DOR INNOVATIONS (BizLegal AI).
      </p>
    </LegalPage>
  )
}
