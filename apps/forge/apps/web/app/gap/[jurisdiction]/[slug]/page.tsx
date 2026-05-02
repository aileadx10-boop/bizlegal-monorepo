import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

interface GapPageParams {
  params: { jurisdiction: string; slug: string }
}

const ctaUrls: Record<string, string> = {
  tracr: 'https://tracr.bizlegal-ai.com',
  brai: 'https://brai.bizlegal-ai.com',
  lexaudit: 'https://lexaudit.bizlegal-ai.com',
  docai: 'https://docai.bizlegal-ai.com',
  forge: 'https://forge.bizlegal-ai.com',
}

async function getGapPage(slug: string) {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase
    .from('gap_pages')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

export async function generateMetadata({ params }: GapPageParams): Promise<Metadata> {
  const gap = await getGapPage(params.slug)
  if (!gap) return { title: 'Not Found' }
  return {
    title: gap.title,
    description: gap.meta_description || gap.summary?.slice(0, 160),
    openGraph: {
      title: gap.title,
      description: gap.meta_description || gap.summary?.slice(0, 160),
      url: `https://forge.bizlegal-ai.com/gap/${gap.jurisdiction}/${gap.slug}`,
    },
  }
}

function RiskBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#ef4444' : score >= 50 ? '#f59e0b' : '#22c55e'
  const label = score >= 80 ? 'CRITICAL' : score >= 50 ? 'HIGH' : 'MODERATE'
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 9999, border: `1px solid ${color}`, background: `${color}15` }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
      <span style={{ color, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>{label} RISK — {score}/100</span>
    </div>
  )
}

export default async function GapPage({ params }: GapPageParams) {
  const gap = await getGapPage(params.slug)
  if (!gap) notFound()

  const ctaUrl = ctaUrls[gap.cta_product] || 'https://forge.bizlegal-ai.com'
  const valueProps: string[] = gap.value_props || []

  return (
    <main className="min-h-screen bg-forge-dark text-forge-text">
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Risk Badge */}
        <div className="mb-6">
          <RiskBadge score={gap.risk_score} />
        </div>

        {/* Regulation tag */}
        <div className="mb-4">
          <span className="text-xs uppercase tracking-widest text-forge-muted">
            {gap.jurisdiction?.toUpperCase()} — {gap.regulation}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-8">
          {gap.title}
        </h1>

        {/* Summary */}
        <div className="border-l-2 border-forge-accent pl-6 mb-12">
          <p className="text-lg text-forge-text-secondary leading-relaxed">
            {gap.summary}
          </p>
        </div>

        {/* Value Props */}
        {valueProps.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {valueProps.map((prop, i) => (
              <div key={i} className="border border-forge-border rounded-xl p-6 bg-forge-dark/50">
                <div className="w-8 h-8 rounded-full bg-forge-accent/20 flex items-center justify-center mb-4">
                  <span className="text-forge-accent font-bold text-sm">{i + 1}</span>
                </div>
                <p className="text-sm text-forge-text-secondary leading-relaxed">{prop}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="border border-forge-border rounded-2xl p-8 md:p-12 text-center bg-gradient-to-b from-forge-dark to-forge-dark/80 mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">
            Don&apos;t wait for enforcement
          </h2>
          <p className="text-forge-text-secondary mb-8 max-w-lg mx-auto">
            Get ahead of this regulation with automated compliance tooling. Audit your exposure in minutes.
          </p>
          <a
            href={ctaUrl}
            className="inline-block bg-forge-accent hover:bg-forge-accent-hover text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Start Compliance Audit →
          </a>
        </div>

        {/* Lead Magnet */}
        {gap.lead_magnet_title && (
          <div className="border border-forge-border rounded-xl p-8 bg-forge-dark/50">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <span className="text-xs uppercase tracking-widest text-forge-accent font-semibold mb-2 block">Free Resource</span>
                <h3 className="text-xl font-bold text-white mb-2">{gap.lead_magnet_title}</h3>
                <p className="text-sm text-forge-muted">Download the checklist to ensure your organization meets every requirement.</p>
              </div>
              <div className="flex-shrink-0">
                <a
                  href={`/api/lead-magnet?slug=${gap.slug}&redirect=${encodeURIComponent(gap.lead_magnet_url || '/thank-you')}`}
                  className="inline-block border border-forge-accent text-forge-accent hover:bg-forge-accent hover:text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                >
                  Get Free Checklist
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Published date */}
        {gap.published_at && (
          <p className="mt-8 text-xs text-forge-muted text-center">
            Published {new Date(gap.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>
    </main>
  )
}
