import type { Metadata } from 'next'
import { LegalPage } from '../components/LegalPage'

export const metadata: Metadata = {
  title: 'Disclaimer — FalseEcho',
  description: 'FalseEcho publishes evidence signals, not legal conclusions. Read the scope limits of our AI falsehood monitoring.',
  alternates: { canonical: 'https://falseecho.bizlegal-ai.com/disclaimer' },
}

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer">
      <p>
        <strong>We publish signals, you decide.</strong> FalseEcho records what AI
        answer engines (ChatGPT, Claude, Perplexity, Google AI Overviews) return in
        response to a standardized prompt battery about a person or firm, and anchors
        each captured answer with a SHA-256 hash, UTC timestamp, and scan sequence.
      </p>
      <p>
        FalseEcho is not a law firm and does not provide legal advice. Evidence packs
        state facts and sources. They never conclude that a statement is defamation,
        libel, or any other legal wrong — that determination belongs to qualified
        counsel and, ultimately, a court.
      </p>
      <p>
        We do not guarantee detection completeness. AI engines change their answers
        constantly; an answer captured at scan time may differ from what the engine
        returns later, and a clean scan is not proof that no false claim exists.
      </p>
      <p>
        Reviewed pipeline: automated capture, human review available on request.
        Correction-request drafts, when provided, are drafts for human review only —
        FalseEcho does not submit corrections to any platform on your behalf.
      </p>
      <p style={{ fontSize: 'var(--bl-text-small)', color: 'var(--bl-text-subtle)' }}>
        Disclosure version {process.env.NEXT_PUBLIC_DISCLAIMER_VERSION ?? 'v1.0.0-p1'} ·
        Operated by DOR INNOVATIONS (BizLegal AI).
      </p>
    </LegalPage>
  )
}
