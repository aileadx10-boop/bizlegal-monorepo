import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Disclaimer', alternates: { canonical: '/disclaimer' } }

export default function DisclaimerPage() {
  return (
    <div className="bl-prose">
      <h1>Disclaimer</h1>
      <p>
        BrainX is decision-support software, not a law firm. Using BrainX does not create
        an attorney-client relationship, and nothing on this site, in an opportunity card,
        or in a BUILD THIS brief is legal advice.
      </p>
      <h2>What the score means</h2>
      <p>
        The BrainX Decision Score is a weighted decision aid computed from the evidence
        attached to an opportunity. It is not a guarantee of commercial success, legal
        compliance, or any outcome. A high score means the available evidence supports
        pursuing the opportunity further — not that pursuing it will succeed.
      </p>
      <h2>What the evidence is</h2>
      <p>
        Every opportunity cites at least three independently verifiable public sources.
        BrainX does not fabricate URLs, quotes, or statistics. Where evidence is thin or
        missing, the analyst scores conservatively and says so in the opportunity&apos;s
        stated reasoning — a gap in evidence is never treated as a positive signal.
      </p>
      <h2>What BUILD THIS is</h2>
      <p>
        A BUILD THIS brief is a hypothesis: a proposed offer, buyer, deliverable, and
        pricing structure derived from the cited evidence. Pricing shown in a brief is
        labelled a hypothesis, not market-confirmed pricing. Nothing in a brief is a
        guarantee that the proposed product will sell, that the pricing is achievable, or
        that the suggested outbound channels are lawful in every jurisdiction without
        independent review.
      </p>
      <h2>Verify before you act</h2>
      <p>
        Every regulatory or legal claim on BrainX should be checked against the primary
        source cited before you rely on it, and you should consult qualified counsel in
        the relevant jurisdiction before making legal, regulatory, or compliance decisions.
      </p>
      <hr />
      <p>Last updated 2026-09-16.</p>
    </div>
  )
}
