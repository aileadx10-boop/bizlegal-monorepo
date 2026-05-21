import type { Metadata } from 'next'
import { SurfaceDashboard } from '../_components/SurfaceDashboard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ops · Hetzner — BizLegal AI',
  description: 'Hetzner curator pipeline: scout, brain, publisher, bot — daily content engine.',
  robots: { index: false, follow: false, nocache: true },
}

interface PageProps {
  searchParams: { t?: string; token?: string }
}

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

const REGISTRY = [
  { id: 'scout', label: 'scout.py', note: '06:00 UTC daily · RSS → Ollama rank → top-3 picks' },
  { id: 'auto-pick', label: 'auto_pick.py', note: '10:00 UTC daily · fallback if no manual pick' },
  { id: 'brain', label: 'brain.py', note: 'On-demand · Sonnet 4.6 long-form MDX draft' },
  { id: 'publisher', label: 'publisher.py (FastAPI :8082)', note: 'Numeric-claim verification → commit to bizlegal-ea', url: 'https://publisher.bizlegal-ai.com/healthz' },
  { id: 'bot', label: '@BIZLEGALFORGEBOT', note: 'Long-poll Telegram daemon · pick/deploy/regen/reject' },
  { id: 'firecrawl', label: 'firecrawl_enrich.py', note: 'Q1 helper · structured extract for top-3 picks' },
]

export default function OpsHetznerPage({ searchParams }: PageProps) {
  const expected = process.env.OPS_DASHBOARD_TOKEN ?? ''
  const provided = (searchParams.token ?? searchParams.t ?? '').trim()
  if (!expected || !provided || !timingSafeEq(expected, provided)) {
    return <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--bl-font-mono)', fontSize: 14 }}>404 — not found</main>
  }
  return (
    <SurfaceDashboard
      token={provided}
      surfaceId="hetzner"
      title="Hetzner — Curator"
      subtitle="Daily content engine · scout → brain → publisher · @BIZLEGALFORGEBOT gates"
      sources={['curator']}
      probeSources={['curator']}
      registry={REGISTRY}
    />
  )
}
