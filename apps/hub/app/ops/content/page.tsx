import type { Metadata } from 'next'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * GET /ops/content?t=$OPS_DASHBOARD_TOKEN
 *
 * Content engine dashboard (goal M.7, lite pass). One server-rendered view
 * over the content pipeline tables:
 *
 *   published_content — counts by product, by content_type, by day (30d),
 *                       plus the most recent items.
 *   content_queue     — pipeline status counts (pending/processing/
 *                       published/failed) and a failure alert.
 *
 * External analytics (Google Search Console, LinkedIn, YouTube) are NOT
 * wired in this pass — the engagement JSONB column is shown raw where
 * present and everything else is deferred.
 *
 * Both tables come from migration 20260906_content_queue.sql. If they are
 * missing (or the query fails for any reason) the page renders an empty
 * state with a migration note instead of a 500.
 *
 * Token-gated by OPS_DASHBOARD_TOKEN (same secret as /ops). Returns a bare
 * 404 on mismatch so the route's existence isn't leaked.
 */

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Content Pipeline — BizLegal AI',
  description: 'Content engine state: published output, pipeline status, failures. Internal use.',
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

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const DAY_MS = 24 * 60 * 60 * 1000
const MIGRATION_NOTE = 'run migration 20260906_content_queue.sql'

// Matches the published shape from the marketing pipeline (20260906):
//   id UUID, queue_id UUID, product TEXT, content_type TEXT, title TEXT,
//   url TEXT, platform TEXT, engagement JSONB, published_at TIMESTAMP
interface PublishedRow {
  id: string
  queue_id: string | null
  product: string | null
  content_type: string | null
  title: string | null
  url: string | null
  platform: string | null
  engagement: Record<string, unknown> | null
  published_at: string
}

// content_queue shape is only partially fixed (status TEXT with
// pending/processing/published/failed) — read defensively and tolerate
// whatever timestamp column the migration ships.
interface QueueRow {
  id?: string
  status?: string | null
  created_at?: string | null
  updated_at?: string | null
  [key: string]: unknown
}

interface ContentSnapshot {
  generatedAt: string
  publishedMissing: string | null
  queueMissing: string | null
  publishedTotal30d: number
  byProduct: Array<{ key: string; n: number }>
  byType: Array<{ key: string; n: number }>
  byDay: Array<{ day: string; n: number }>
  recent: PublishedRow[]
  queueByStatus: Array<{ status: string; n: number }>
  failedLast24h: number
}

function countBy<T>(rows: T[], keyFn: (row: T) => string): Array<{ key: string; n: number }> {
  const agg: Record<string, number> = {}
  for (const row of rows) {
    const key = keyFn(row)
    agg[key] = (agg[key] ?? 0) + 1
  }
  return Object.entries(agg)
    .map(([key, n]) => ({ key, n }))
    .sort((a, b) => b.n - a.n)
}

async function loadContent(sb: SupabaseClient): Promise<ContentSnapshot> {
  const now = Date.now()
  const since30d = new Date(now - 30 * DAY_MS).toISOString()
  const cutoff24h = now - DAY_MS

  const [publishedRes, queueRes] = await Promise.all([
    sb
      .from('published_content')
      .select('id, queue_id, product, content_type, title, url, platform, engagement, published_at')
      .gte('published_at', since30d)
      .order('published_at', { ascending: false })
      .limit(2000),
    sb.from('content_queue').select('*').limit(2000),
  ])

  const publishedMissing = publishedRes.error
    ? publishedRes.error.message
    : null
  const queueMissing = queueRes.error ? queueRes.error.message : null

  const published = (publishedRes.data ?? []) as PublishedRow[]
  const queue = (queueRes.data ?? []) as QueueRow[]

  // Per-day histogram, always 30 slots (oldest first) so the bar chart
  // keeps its shape even on quiet stretches.
  const dayKeys: string[] = []
  const dayAgg: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now - i * DAY_MS).toISOString().slice(0, 10)
    dayKeys.push(day)
    dayAgg[day] = 0
  }
  for (const row of published) {
    const day = (row.published_at ?? '').slice(0, 10)
    if (day in dayAgg) dayAgg[day] += 1
  }

  let failedLast24h = 0
  for (const row of queue) {
    if ((row.status ?? '').toLowerCase() !== 'failed') continue
    const ts = Date.parse(row.updated_at ?? row.created_at ?? '')
    if (Number.isFinite(ts) && ts >= cutoff24h) failedLast24h += 1
    else if (!Number.isFinite(ts)) failedLast24h += 1 // no timestamp: count it, don't hide failures
  }

  const queueByStatus = countBy(queue, (r) => (r.status ?? 'unknown').toLowerCase()).map(({ key, n }) => ({
    status: key,
    n,
  }))

  return {
    generatedAt: new Date().toISOString(),
    publishedMissing,
    queueMissing,
    publishedTotal30d: published.length,
    byProduct: countBy(published, (r) => r.product ?? 'unknown'),
    byType: countBy(published, (r) => r.content_type ?? 'unknown'),
    byDay: dayKeys.map((day) => ({ day, n: dayAgg[day] })),
    recent: published.slice(0, 15),
    queueByStatus,
    failedLast24h,
  }
}

const COLORS = {
  bg: '#0a0a0f',
  card: '#14141c',
  border: '#23232f',
  text: '#e8e8f0',
  dim: '#8a8a9a',
  green: '#3ddc84',
  red: '#ff5c6c',
  amber: '#ffb648',
  blue: '#5b9dff',
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub?: string
  tone?: 'good' | 'bad' | 'warn' | 'neutral'
}) {
  const accent =
    tone === 'good' ? COLORS.green : tone === 'bad' ? COLORS.red : tone === 'warn' ? COLORS.amber : COLORS.text
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: '20px 22px',
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: COLORS.dim }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: accent, marginTop: 6, lineHeight: 1.1 }}>{value}</div>
      {sub ? <div style={{ fontSize: 13, color: COLORS.dim, marginTop: 6 }}>{sub}</div> : null}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 34 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{title}</h2>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 18 }}>
        {children}
      </div>
    </section>
  )
}

/** Simple CSS bar list — recharts is not a hub dependency, so no chart lib. */
function BarList({ rows, empty }: { rows: Array<{ key: string; n: number }>; empty: string }) {
  if (rows.length === 0) return <div style={{ color: COLORS.dim, fontSize: 14 }}>{empty}</div>
  const max = Math.max(...rows.map((r) => r.n), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((row) => (
        <div key={row.key} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          <span style={{ width: 160, flexShrink: 0, color: COLORS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.key}
          </span>
          <div style={{ flex: 1, background: COLORS.border, borderRadius: 4, height: 14, overflow: 'hidden' }}>
            <div style={{ width: `${(row.n / max) * 100}%`, height: '100%', background: COLORS.blue, borderRadius: 4 }} />
          </div>
          <span style={{ width: 40, textAlign: 'right', color: COLORS.dim }}>{row.n}</span>
        </div>
      ))}
    </div>
  )
}

function MissingTableNote({ table, detail }: { table: string; detail: string | null }) {
  return (
    <div
      style={{
        background: 'rgba(255,182,72,0.08)',
        border: `1px solid ${COLORS.amber}`,
        borderRadius: 12,
        padding: '16px 20px',
        fontSize: 14,
        color: COLORS.amber,
      }}
    >
      Table <code>{table}</code> is not queryable — {MIGRATION_NOTE}, then redeploy.
      {detail ? <div style={{ marginTop: 6, fontSize: 12, color: COLORS.dim }}>Supabase said: {detail}</div> : null}
    </div>
  )
}

function engagementSummary(engagement: Record<string, unknown> | null): string {
  if (!engagement) return '—'
  const parts: string[] = []
  for (const key of ['views', 'likes', 'comments', 'shares', 'clicks']) {
    const v = engagement[key]
    if (typeof v === 'number') parts.push(`${key} ${v}`)
  }
  return parts.length > 0 ? parts.join(' · ') : '—'
}

export default async function ContentOpsPage({ searchParams }: PageProps) {
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
          background: COLORS.bg,
          color: COLORS.dim,
          fontFamily: 'ui-monospace, monospace',
          fontSize: 14,
        }}
      >
        404 — not found
      </main>
    )
  }

  const sb = getSupabase()
  if (!sb) {
    return (
      <main style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.red, padding: 40, fontFamily: 'system-ui' }}>
        Supabase env not configured on hub (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY).
      </main>
    )
  }

  const s = await loadContent(sb)
  const tablesDown = s.publishedMissing !== null && s.queueMissing !== null
  const failedTone = s.failedLast24h > 3 ? 'bad' : s.failedLast24h > 0 ? 'warn' : 'good'

  return (
    <main
      style={{
        minHeight: '100vh',
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '40px 28px 80px',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Content Pipeline</h1>
          <span style={{ fontSize: 12, color: COLORS.dim }}>
            live · {new Date(s.generatedAt).toUTCString()}
          </span>
        </div>
        <p style={{ color: COLORS.dim, fontSize: 14, marginTop: 6 }}>
          What the content engine shipped, what is queued, and what is on fire. Live reads from{' '}
          <code>published_content</code> and <code>content_queue</code>. External analytics (GSC, LinkedIn,
          YouTube) are deferred — engagement figures come from the pipeline&apos;s own JSONB payload.
        </p>

        {/* Failure alert: >3 failed queue items in the last 24h */}
        {s.failedLast24h > 3 ? (
          <div
            style={{
              marginTop: 20,
              background: 'rgba(255,92,108,0.10)',
              border: `1px solid ${COLORS.red}`,
              borderRadius: 12,
              padding: '16px 20px',
              fontSize: 15,
              color: COLORS.red,
            }}
          >
            ⚠️ <strong>{s.failedLast24h} content pipeline failure(s) in the last 24h.</strong> Check the queue
            workers before trusting any numbers below.
          </div>
        ) : null}

        {tablesDown ? (
          <div style={{ marginTop: 20 }}>
            <MissingTableNote table="published_content / content_queue" detail={s.publishedMissing} />
          </div>
        ) : null}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 14,
            marginTop: 20,
          }}
        >
          <Stat
            label="Published (30d)"
            value={s.publishedMissing !== null ? '—' : String(s.publishedTotal30d)}
            sub={s.publishedMissing !== null ? MIGRATION_NOTE : `${s.recent.length} most recent shown below`}
            tone={s.publishedMissing !== null ? 'warn' : s.publishedTotal30d > 0 ? 'good' : 'warn'}
          />
          <Stat
            label="Queue items"
            value={s.queueMissing !== null ? '—' : String(s.queueByStatus.reduce((sum, r) => sum + r.n, 0))}
            sub={s.queueMissing !== null ? MIGRATION_NOTE : 'across all pipeline statuses'}
            tone={s.queueMissing !== null ? 'warn' : 'neutral'}
          />
          <Stat
            label="Failed (24h)"
            value={s.queueMissing !== null ? '—' : String(s.failedLast24h)}
            sub={s.queueMissing !== null ? MIGRATION_NOTE : 'alert threshold: more than 3'}
            tone={s.queueMissing !== null ? 'warn' : failedTone}
          />
        </div>

        <Card title="Published by product (30d)">
          {s.publishedMissing !== null ? (
            <MissingTableNote table="published_content" detail={s.publishedMissing} />
          ) : (
            <BarList rows={s.byProduct} empty="Nothing published in the last 30 days." />
          )}
        </Card>

        <Card title="Published by content type (30d)">
          {s.publishedMissing !== null ? (
            <MissingTableNote table="published_content" detail={s.publishedMissing} />
          ) : (
            <BarList rows={s.byType} empty="Nothing published in the last 30 days." />
          )}
        </Card>

        <Card title="Published per day (last 30 days)">
          {s.publishedMissing !== null ? (
            <MissingTableNote table="published_content" detail={s.publishedMissing} />
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 90 }}>
                {(() => {
                  const max = Math.max(...s.byDay.map((d) => d.n), 1)
                  return s.byDay.map((d) => (
                    <div
                      key={d.day}
                      title={`${d.day}: ${d.n}`}
                      style={{
                        flex: 1,
                        height: `${Math.max((d.n / max) * 100, d.n > 0 ? 6 : 2)}%`,
                        background: d.n > 0 ? COLORS.blue : COLORS.border,
                        borderRadius: 2,
                      }}
                    />
                  ))
                })()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: COLORS.dim, marginTop: 6 }}>
                <span>{s.byDay[0]?.day}</span>
                <span>{s.byDay[s.byDay.length - 1]?.day}</span>
              </div>
            </div>
          )}
        </Card>

        <Card title="Pipeline status">
          {s.queueMissing !== null ? (
            <MissingTableNote table="content_queue" detail={s.queueMissing} />
          ) : s.queueByStatus.length === 0 ? (
            <div style={{ color: COLORS.dim, fontSize: 14 }}>Queue is empty.</div>
          ) : (
            <div>
              {s.queueByStatus.map((row, i) => (
                <div
                  key={row.status}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 4px',
                    borderTop: i === 0 ? 'none' : `1px solid ${COLORS.border}`,
                    fontSize: 14,
                  }}
                >
                  <span
                    style={{
                      color:
                        row.status === 'published'
                          ? COLORS.green
                          : row.status === 'failed'
                            ? COLORS.red
                            : row.status === 'processing'
                              ? COLORS.blue
                              : COLORS.amber,
                    }}
                  >
                    {row.status}
                  </span>
                  <span style={{ color: COLORS.dim }}>{row.n} item(s)</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Recent published items">
          {s.publishedMissing !== null ? (
            <MissingTableNote table="published_content" detail={s.publishedMissing} />
          ) : s.recent.length === 0 ? (
            <div style={{ color: COLORS.dim, fontSize: 14 }}>No published items in the last 30 days.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: COLORS.dim }}>
                    <th style={{ padding: '6px 8px', fontWeight: 500 }}>Published</th>
                    <th style={{ padding: '6px 8px', fontWeight: 500 }}>Product</th>
                    <th style={{ padding: '6px 8px', fontWeight: 500 }}>Type</th>
                    <th style={{ padding: '6px 8px', fontWeight: 500 }}>Title</th>
                    <th style={{ padding: '6px 8px', fontWeight: 500 }}>Platform</th>
                    <th style={{ padding: '6px 8px', fontWeight: 500 }}>Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {s.recent.map((row) => (
                    <tr key={row.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                      <td style={{ padding: '8px', color: COLORS.dim, whiteSpace: 'nowrap' }}>
                        {(row.published_at ?? '').slice(0, 10)}
                      </td>
                      <td style={{ padding: '8px' }}>{row.product ?? '—'}</td>
                      <td style={{ padding: '8px' }}>{row.content_type ?? '—'}</td>
                      <td style={{ padding: '8px', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.url ? (
                          <a href={row.url} style={{ color: COLORS.blue }} target="_blank" rel="noreferrer">
                            {row.title ?? row.url}
                          </a>
                        ) : (
                          (row.title ?? '—')
                        )}
                      </td>
                      <td style={{ padding: '8px', color: COLORS.dim }}>{row.platform ?? '—'}</td>
                      <td style={{ padding: '8px', color: COLORS.dim }}>{engagementSummary(row.engagement)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <p style={{ color: COLORS.dim, fontSize: 12, marginTop: 28 }}>
          Internal. Token-gated. Sources: <code>published_content</code> and <code>content_queue</code> in the
          live Supabase project (migration 20260906_content_queue.sql).
        </p>
      </div>
    </main>
  )
}
