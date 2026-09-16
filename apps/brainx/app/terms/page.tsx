import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms', alternates: { canonical: '/terms' } }

export default function TermsPage() {
  return (
    <div className="bl-prose">
      <h1>Terms</h1>
      <p>
        These terms govern use of BrainX (brainx.bizlegal-ai.com), operated by BizLegal AI
        / DOR INNOVATIONS.
      </p>
      <h2>The service</h2>
      <p>
        BrainX is a weekly, operator-run opportunity radar. Radar tier subscribers get
        access to the current radar, up to 5 radar profiles, and 2 BUILD THIS briefs per
        month. Radar + Build subscribers get unlimited BUILD THIS briefs and a written,
        asynchronous expert review layer, capped at 4 reviewed briefs per month.
      </p>
      <h2>Billing</h2>
      <p>
        Card billing is a recurring PayPal subscription and can be cancelled at any time
        from your PayPal account; access continues until the end of the paid period.
        Crypto billing is a single yearly invoice with no automatic renewal.
      </p>
      <h2>No guarantees</h2>
      <p>
        BrainX does not guarantee that any opportunity will produce revenue, that any
        BUILD THIS brief&apos;s pricing hypothesis is achievable, or that any regulatory
        reading is complete or current at the time you read it. See the <a href="/disclaimer">disclaimer</a>.
      </p>
      <h2>Acceptable use</h2>
      <p>
        You may not use BUILD THIS outputs to construct or purchase contact lists for cold
        outreach that violates applicable anti-spam or data-protection law. Suggested
        outbound channels in a brief are segment descriptions, not vetted contact lists.
      </p>
      <h2>Changes</h2>
      <p>We may update these terms; material changes will be reflected here with a new date.</p>
      <hr />
      <p>Last updated 2026-09-16.</p>
    </div>
  )
}
