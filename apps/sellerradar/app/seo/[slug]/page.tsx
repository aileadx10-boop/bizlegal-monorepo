import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { listSchedules } from '../../../lib/schedules'
import { diffFeeTypes, FeeType, SizeTier } from '../../../lib/fees'

/**
 * Programmatic SEO (spec §4): /seo/[fee-type]-change-[date] pages generated
 * from the versioned fee fixtures. Each page states the change with
 * citations (source URL + effective date) and embeds the impact-calculator
 * CTA (/analyze). Indexable, static, rebuilt when a new fixture lands.
 */

const BASE = 'https://sellerradar.bizlegal-ai.com'

const FEE_TYPE_META: Record<FeeType, { label: string; blurb: string }> = {
  referral: {
    label: 'Referral fee %',
    blurb: 'The percentage of each sale Amazon takes by category. A one-point move reprices every unit you sell.',
  },
  fba_fulfillment: {
    label: 'FBA fulfillment fee',
    blurb: 'The per-unit pick, pack, and ship fee by size/weight tier. A few cents per unit compounds to thousands per year at volume.',
  },
  storage: {
    label: 'Monthly storage fee',
    blurb: 'The per-cubic-foot monthly charge for inventory sitting in FBA warehouses. Quiet, recurring, and easy to miss.',
  },
}

interface ParsedSlug {
  feeType: FeeType
  date: string
}

function parseSlug(slug: string): ParsedSlug | null {
  const idx = slug.lastIndexOf('-change-')
  if (idx <= 0) return null
  const feeType = slug.slice(0, idx) as FeeType
  const date = slug.slice(idx + '-change-'.length)
  if (!Object.prototype.hasOwnProperty.call(FEE_TYPE_META, feeType)) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  return { feeType, date }
}

export function generateStaticParams() {
  const schedules = listSchedules()
  const prev = schedules[schedules.length - 2]
  const curr = schedules[schedules.length - 1]
  return diffFeeTypes(prev, curr).map((feeType) => ({
    slug: `${feeType}-change-${curr.effective_date}`,
  }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const parsed = parseSlug(params.slug)
  if (!parsed) return { title: 'Fee change — SellerRadar' }
  const meta = FEE_TYPE_META[parsed.feeType]
  return {
    title: `Amazon ${meta.label} change (${parsed.date}) — what it costs per SKU · SellerRadar`,
    description: `Amazon ${meta.label.toLowerCase()} changed effective ${parsed.date}. See the before/after rates with sources, then compute the dollar impact on your own catalog.`,
    alternates: { canonical: `${BASE}/seo/${params.slug}` },
  }
}

export default function FeeChangePage({ params }: { params: { slug: string } }) {
  const parsed = parseSlug(params.slug)
  if (!parsed) notFound()

  const schedules = listSchedules()
  const prev = schedules[schedules.length - 2]
  const curr = schedules[schedules.length - 1]
  if (curr.effective_date !== parsed.date) notFound()

  const meta = FEE_TYPE_META[parsed.feeType]

  // Build the before/after rows for this fee type.
  let rows: { key: string; oldVal: string; newVal: string; changed: boolean }[] = []
  if (parsed.feeType === 'referral') {
    const keys = Array.from(new Set([...Object.keys(prev.referral_pct), ...Object.keys(curr.referral_pct)])).sort()
    rows = keys.map((k) => {
      const o = prev.referral_pct[k]
      const n = curr.referral_pct[k]
      return {
        key: k,
        oldVal: o != null ? `${(o * 100).toFixed(0)}%` : '—',
        newVal: n != null ? `${(n * 100).toFixed(0)}%` : '—',
        changed: o !== n,
      }
    })
  } else if (parsed.feeType === 'fba_fulfillment') {
    const tiers: SizeTier[] = ['small_standard', 'large_standard', 'large_bulky', 'oversize']
    rows = tiers.map((t) => {
      const o = prev.fba_fulfillment[t]
      const n = curr.fba_fulfillment[t]
      return {
        key: t.replace(/_/g, ' '),
        oldVal: `$${o.toFixed(2)}`,
        newVal: `$${n.toFixed(2)}`,
        changed: o !== n,
      }
    })
  } else {
    rows = (['standard', 'oversize'] as const).map((k) => {
      const o = prev.storage_per_cuft_monthly[k]
      const n = curr.storage_per_cuft_monthly[k]
      return {
        key: `${k} (per cu ft / month)`,
        oldVal: `$${o.toFixed(2)}`,
        newVal: `$${n.toFixed(2)}`,
        changed: o !== n,
      }
    })
  }

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Amazon ${meta.label} change effective ${parsed.date}`,
    datePublished: parsed.date,
    author: { '@type': 'Organization', name: 'SellerRadar by BizLegal AI', url: BASE },
    mainEntityOfPage: `${BASE}/seo/${params.slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <section className="bl-section" style={{ paddingTop: 'clamp(3rem, 2rem + 3vw, 5rem)' }}>
        <div className="bl-container-narrow">
          <span className="bl-tag" style={{ marginBottom: '1rem' }}>
            Fee change · effective {parsed.date}
          </span>
          <h1
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h2)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--bl-text)',
              margin: '1rem 0 1.5rem',
            }}
          >
            Amazon {meta.label} changed on {parsed.date}
          </h1>
          <p style={{ color: 'var(--bl-text-muted)', fontSize: 'var(--bl-text-body)', lineHeight: 1.75, margin: '0 0 2rem' }}>
            {meta.blurb} The table below shows the published rates before
            (schedule {prev.version}, effective {prev.effective_date}) and
            after (schedule {curr.version}, effective {curr.effective_date}).
            Source:{' '}
            <a href={curr.source_url} style={{ color: 'var(--bl-accent)' }} rel="noopener noreferrer">
              {curr.source_url}
            </a>
          </p>

          <div className="bl-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--bl-text-small)' }}>
              <thead>
                <tr style={{ color: 'var(--bl-text-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category / tier</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Before</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>After</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.key}
                    style={{
                      borderTop: '1px solid var(--bl-divider)',
                      color: r.changed ? 'var(--bl-text)' : 'var(--bl-text-subtle)',
                      fontWeight: r.changed ? 600 : 400,
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>{r.key}</td>
                    <td style={{ padding: '12px 16px' }}>{r.oldVal}</td>
                    <td style={{ padding: '12px 16px' }}>{r.newVal}{r.changed ? ' ▲' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Impact-calculator embed (spec §4) */}
          <div
            className="bl-card"
            style={{ marginTop: '2rem', padding: 'clamp(1.5rem, 1rem + 1vw, 2.5rem)', textAlign: 'center', borderColor: 'var(--bl-accent)' }}
          >
            <h2
              style={{
                fontFamily: 'var(--bl-font-display)',
                fontSize: 'var(--bl-text-h3)',
                fontWeight: 700,
                color: 'var(--bl-text)',
                margin: '0 0 0.75rem',
              }}
            >
              What does this change cost YOUR catalog?
            </h2>
            <p style={{ color: 'var(--bl-text-muted)', fontSize: 'var(--bl-text-small)', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
              Upload a seller CSV export (SKU, category, dimensions, weight,
              COGS, price, est. monthly units) and get the dollar impact per
              SKU per year. Free top-line check — no Amazon credentials.
            </p>
            <Link href="/analyze" className="bl-btn-primary">
              Compute my impact — free →
            </Link>
          </div>

          <p style={{ fontSize: 'var(--bl-text-small)', color: 'var(--bl-text-subtle)', marginTop: '2rem', lineHeight: 1.7 }}>
            Rates are curated snapshots of published Amazon fee schedules.
            Impact figures are estimates — verify against your settlement
            reports. Not financial or tax advice.
          </p>
        </div>
      </section>
    </>
  )
}
