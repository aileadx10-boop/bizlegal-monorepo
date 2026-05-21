import type { Metadata } from 'next'
import { SurfaceDashboard } from '../_components/SurfaceDashboard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ops · Subdomains — BizLegal AI',
  description: 'All product subdomains: BRAI, TRACR, LexAudit, DocAI, Forge, LeadForge, Blog.',
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

const SUBDOMAINS = ['brai', 'tracr', 'lexaudit', 'docai', 'forge', 'leadforge', 'blog'] as const

const REGISTRY = [
  { id: 'brai', label: 'brai.bizlegal-ai.com', note: 'Regulatory risk reports $19 one-time → $599-1999/mo retainer', url: 'https://brai.bizlegal-ai.com' },
  { id: 'tracr', label: 'tracr.bizlegal-ai.com', note: 'Wallet forensics $29-799', url: 'https://tracr.bizlegal-ai.com' },
  { id: 'lexaudit', label: 'lexaudit.bizlegal-ai.com', note: 'Compliance monitor $49-599/mo', url: 'https://lexaudit.bizlegal-ai.com' },
  { id: 'docai', label: 'docai.bizlegal-ai.com', note: 'SQA + DPA $19 one-time, $49/mo', url: 'https://docai.bizlegal-ai.com' },
  { id: 'forge', label: 'forge.bizlegal-ai.com', note: 'BOI Kit $149, Passport $297', url: 'https://forge.bizlegal-ai.com' },
  { id: 'leadforge', label: 'leadforge.bizlegal-ai.com', note: 'Lead-gen surface', url: 'https://leadforge.bizlegal-ai.com' },
  { id: 'blog', label: 'blog.bizlegal-ai.com', note: 'Content (CF Pages) — curator output', url: 'https://blog.bizlegal-ai.com' },
]

export default function OpsSubdomainsPage({ searchParams }: PageProps) {
  const expected = process.env.OPS_DASHBOARD_TOKEN ?? ''
  const provided = (searchParams.token ?? searchParams.t ?? '').trim()
  if (!expected || !provided || !timingSafeEq(expected, provided)) {
    return <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--bl-font-mono)', fontSize: 14 }}>404 — not found</main>
  }
  return (
    <SurfaceDashboard
      token={provided}
      surfaceId="subdomains"
      title="Subdomains — Products"
      subtitle="6 product subdomains + blog · per-product health and event stream"
      sources={Array.from(SUBDOMAINS)}
      probeSources={Array.from(SUBDOMAINS)}
      registry={REGISTRY}
    />
  )
}
