import type { Metadata } from 'next'
import { OpsMasterClient } from './OpsMasterClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ops Master — BizLegal AI',
  description: 'Complete ecosystem status. Every surface, service, bot, cron, and gateway in one view.',
  robots: { index: false, follow: false, nocache: true },
}

interface PageProps {
  searchParams: { t?: string; token?: string }
}

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export default function OpsMasterPage({ searchParams }: PageProps) {
  const expected = process.env.OPS_DASHBOARD_TOKEN ?? ''
  const provided = (searchParams.token ?? searchParams.t ?? '').trim()

  if (!expected || !provided || !timingSafeEq(expected, provided)) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bl-bg)',
          color: 'var(--bl-text)',
          fontFamily: 'var(--bl-font-mono)',
          fontSize: 14,
        }}
      >
        404 — not found
      </main>
    )
  }

  return <OpsMasterClient token={provided} />
}
