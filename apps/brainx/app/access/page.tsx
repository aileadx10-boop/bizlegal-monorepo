import type { Metadata } from 'next'
import AccessForm from './AccessForm'

export const metadata: Metadata = { robots: { index: false, follow: false }, title: 'Access your radar — BrainX' }

const REASON_COPY: Record<string, string> = {
  missing: 'Sign in to see your radar — enter the email you subscribed with and we’ll send a link.',
  invalid: 'That link has expired or was already used. Request a fresh one below.',
  expired: 'Your session expired. Request a fresh sign-in link below.',
}

export default function AccessPage({ searchParams }: { searchParams: { reason?: string } }) {
  const reason = searchParams?.reason
  const message = (reason && REASON_COPY[reason]) || REASON_COPY.missing

  return (
    <main className="bx-container" style={{ paddingBlock: 'var(--bl-space-section, 6rem)', maxWidth: 480 }}>
      <p className="bx-label">Subscriber access</p>
      <h1 className="bx-h2" style={{ marginTop: 8 }}>Sign in to your radar.</h1>
      <p className="bx-muted" style={{ marginTop: 8, marginBottom: 28 }}>{message}</p>
      <AccessForm />
      <p className="bx-muted" style={{ marginTop: 24, fontSize: 13 }}>
        Not a subscriber yet? <a href="/pricing" className="bx-link">See pricing →</a>
      </p>
    </main>
  )
}
