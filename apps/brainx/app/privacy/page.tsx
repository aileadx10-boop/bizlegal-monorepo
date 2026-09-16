import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy', alternates: { canonical: '/privacy' } }

export default function PrivacyPage() {
  return (
    <div className="bl-prose">
      <h1>Privacy</h1>
      <p>
        BrainX (brainx.bizlegal-ai.com) is operated by BizLegal AI / DOR INNOVATIONS. This
        page describes what data BrainX collects and how it is used.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Email address, when you subscribe to the weekly opportunity pick or purchase a subscription.</li>
        <li>Payment metadata (never card details) processed by our payment providers, PayPal and NOWPayments.</li>
        <li>Radar profile settings you configure — vertical, label, keywords.</li>
        <li>BUILD THIS requests and the resulting briefs, tied to your subscriber account.</li>
      </ul>
      <h2>How we use it</h2>
      <p>
        To deliver access to your radar, send the weekly opportunity pick you opted into
        (double opt-in, with one-click unsubscribe), fulfil BUILD THIS requests, and provide
        support. We do not sell your data.
      </p>
      <h2>Consent and unsubscribing</h2>
      <p>
        The free weekly opportunity pick requires double opt-in confirmation before any
        email is sent, and every marketing email carries an unsubscribe link. Suppression
        requests are honored fleet-wide across BizLegal AI surfaces.
      </p>
      <h2>Data storage</h2>
      <p>
        Radar and subscription data is stored in a dedicated Neon Postgres database.
        Email consent records are shared with the BizLegal AI fleet&apos;s consent store so a
        suppression or unsubscribe request applies everywhere, not just on BrainX.
      </p>
      <h2>Contact</h2>
      <p>Questions about your data: see the <a href="/contact">contact page</a>.</p>
      <hr />
      <p>Last updated 2026-09-16.</p>
    </div>
  )
}
