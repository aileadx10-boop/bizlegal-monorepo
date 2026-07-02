import type { Metadata } from 'next'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * GET /ops/spy?t=$OPS_DASHBOARD_TOKEN
 *
 * Phase 5 of PLATFORM-BUILD-2026-07-02 — Spy subsystem dashboard.
 *
 * Shows competitor intelligence gathered by services/spy/*.py scripts,
 * grouped into 4 sections:
 *   1. Pricing Intel   (competitor_pricing.py)
 *   2. Content Gaps    (competitor_content.py)
 *   3. Backlink Opps   (competitor_backlinks.py)
 *   4. Social Signals  (competitor_social.py)
 *
 * Token-gated by OPS_DASHBOARD_TOKEN. Returns 404 on mismatch.
 */

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ops · Spy — BizLegal AI',
  description: 'Competitor intelligence dashboard. Internal use.',
  robots: { index: false, follow: false, nocache: true },
}

interface PageProps {
  searchParams: { t?: string; token?: string }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------
function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

interface SpyRow {
  id: string
  intel_type: string
  competitor: string | null
  finding: string
  source_url: string | null
  relevance_score: number
  created_at: string
}

type IntelGroup = {
  type: string
  label: string
  command: string
  rows: SpyRow[]
}

async function loadSpyIntel(sb: SupabaseClient): Promise<IntelGroup[] | null> {
  const { data, error } = await sb
    .from('spy_intel')
    .select('id, intel_type, competitor, finding, source_url, relevance_score, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    // Table may not exist yet
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      return null
    }
    throw error
  }

  const rows = (data ?? []) as SpyRow[]

  const groups: IntelGroup[] = [
    {
      type: 'pricing',
      label: 'Pricing Intel',
      command: 'python3 services/spy/competitor_pricing.py',
      rows: rows.filter((r) => r.intel_type === 'pricing'),
    },
    {
      type: 'content_gap',
      label: 'Content Gaps',
      command: 'python3 services/spy/competitor_content.py',
      rows: rows.filter((r) => r.intel_type === 'content_gap'),
    },
    {
      type: 'backlink_opportunity',
      label: 'Backlink Opportunities',
      command: 'python3 services/spy/competitor_backlinks.py',
      rows: rows.filter((r) => r.intel_type === 'backlink_opportunity'),
    },
    {
      type: 'social_signal',
      label: 'Social Signals',
      command: 'python3 services/spy/competitor_social.py',
      rows: rows.filter((r) => r.intel_type === 'social_signal'),
    },
  ]

  return groups
}

// ---------------------------------------------------------------------------
// Design tokens (dark theme matching /ops/live)
// ---------------------------------------------------------------------------
const C = {
  bg: '#0a0a0f',
  card: '#14141c',
  border: '#23232f',
  text: '#e8e8f0',
  dim: '#8a8a9a',
  green: '#3ddc84',
  red: '#ff5c6c',
  amber: '#ffb648',
  blue: '#5b9dff',
  purple: '#a78bfa',
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        background: color + '22',
        color,
        border: `1px solid ${color}44`,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
  )
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? C.green : score >= 40 ? C.amber : C.dim
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 80 }}>
      <div
        style={{
          flex: 1,
          height: 4,
          background: C.border,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, color, minWidth: 28 }}>{score}</span>
    </div>
  )
}

function EmptySection({ command }: { command: string }) {
  return (
    <div
      style={{
        padding: '18px 20px',
        color: C.dim,
        fontSize: 13,
        fontFamily: 'ui-monospace, monospace',
      }}
    >
      No intel yet — run:{' '}
      <code
        style={{
          background: '#1e1e2e',
          padding: '2px 8px',
          borderRadius: 4,
          color: C.amber,
        }}
      >
        {command}
      </code>
    </div>
  )
}

function SectionHeader({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 18px',
        borderBottom: `1px solid ${C.border}`,
        background: '#0f0f1a',
      }}
    >
      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color }}>{label}</h2>
      <span
        style={{
          fontSize: 12,
          color: C.dim,
          background: C.border,
          padding: '2px 10px',
          borderRadius: 12,
        }}
      >
        {count} item{count !== 1 ? 's' : ''}
      </span>
    </div>
  )
}

function IntelRow({ row, isLast }: { row: SpyRow; isLast: boolean }) {
  const competitorColor: Record<string, string> = {
    vanta: C.blue,
    drata: C.purple,
    sprinto: C.green,
    chainalysis: C.amber,
  }
  const compColor = competitorColor[row.competitor ?? ''] ?? C.dim
  const date = new Date(row.created_at)
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div
      style={{
        padding: '14px 18px',
        borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 12,
        alignItems: 'start',
      }}
    >
      <div>
        {row.competitor && (
          <div style={{ marginBottom: 6 }}>
            <Badge label={row.competitor} color={compColor} />
          </div>
        )}
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: C.text,
            lineHeight: 1.5,
          }}
        >
          {row.finding}
        </p>
        {row.source_url && (
          <a
            href={row.source_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              marginTop: 6,
              fontSize: 11,
              color: C.blue,
              textDecoration: 'none',
            }}
          >
            {row.source_url.slice(0, 70)}{row.source_url.length > 70 ? '…' : ''}
          </a>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', minWidth: 100 }}>
        <ScoreBar score={row.relevance_score ?? 50} />
        <span style={{ fontSize: 11, color: C.dim }}>{dateStr}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function SpyPage({ searchParams }: PageProps) {
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
          background: C.bg,
          color: C.dim,
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
      <main style={{ minHeight: '100vh', background: C.bg, color: C.red, padding: 40, fontFamily: 'system-ui' }}>
        Supabase env not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY).
      </main>
    )
  }

  let groups: IntelGroup[] | null = null
  let loadError: string | null = null

  try {
    groups = await loadSpyIntel(sb)
  } catch (err) {
    loadError = err instanceof Error ? err.message : String(err)
  }

  const totalRows = groups ? groups.reduce((n, g) => n + g.rows.length, 0) : 0
  const now = new Date().toUTCString()

  const sectionColors: Record<string, string> = {
    pricing: C.blue,
    content_gap: C.green,
    backlink_opportunity: C.amber,
    social_signal: C.purple,
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: C.bg,
        color: C.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '40px 28px 80px',
      }}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Spy — Competitor Intel</h1>
          <span style={{ fontSize: 12, color: C.dim }}>{now}</span>
        </div>
        <p style={{ color: C.dim, fontSize: 13, marginTop: 4, marginBottom: 24 }}>
          Pricing, content gaps, backlink opportunities, and social signals gathered by{' '}
          <code style={{ color: C.amber }}>services/spy/*.py</code>.
          {totalRows > 0 && (
            <> &nbsp;{totalRows} finding{totalRows !== 1 ? 's' : ''} in the last 50 rows.</>
          )}
        </p>

        {/* Error / table-not-found state */}
        {loadError && (
          <div
            style={{
              background: 'rgba(255,92,108,0.08)',
              border: `1px solid ${C.red}`,
              borderRadius: 10,
              padding: '14px 18px',
              marginBottom: 24,
              fontSize: 13,
              color: C.red,
            }}
          >
            Supabase error: {loadError}
          </div>
        )}

        {groups === null && !loadError && (
          <div
            style={{
              background: 'rgba(255,182,72,0.08)',
              border: `1px solid ${C.amber}`,
              borderRadius: 10,
              padding: '20px 22px',
              marginBottom: 24,
              fontSize: 14,
            }}
          >
            <p style={{ margin: 0, color: C.amber, fontWeight: 600 }}>
              No spy intel yet — table does not exist or is empty.
            </p>
            <p style={{ margin: '10px 0 0', color: C.dim, fontSize: 13 }}>
              Apply the migration first:
            </p>
            <code
              style={{
                display: 'block',
                marginTop: 8,
                padding: '10px 14px',
                background: '#1e1e2e',
                borderRadius: 6,
                color: C.amber,
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              SUPABASE_DB_URL=&quot;...&quot; bash apps/hub/supabase/migrations/20260703_apply_migrations.sh
              <br />
              {'\n'}
              # Then run the spy scripts:
              <br />
              python3 services/spy/competitor_pricing.py
              <br />
              python3 services/spy/competitor_content.py
              <br />
              python3 services/spy/competitor_backlinks.py
              <br />
              python3 services/spy/competitor_social.py
            </code>
          </div>
        )}

        {/* Intel sections */}
        {groups && groups.map((group) => (
          <div
            key={group.type}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 20,
            }}
          >
            <SectionHeader
              label={group.label}
              count={group.rows.length}
              color={sectionColors[group.type] ?? C.text}
            />
            {group.rows.length === 0 ? (
              <EmptySection command={group.command} />
            ) : (
              group.rows.map((row, i) => (
                <IntelRow key={row.id} row={row} isLast={i === group.rows.length - 1} />
              ))
            )}
          </div>
        ))}

        {/* Footer */}
        <p style={{ color: C.dim, fontSize: 12, marginTop: 32 }}>
          Internal. Token-gated. Run <code>python3 services/spy/competitor_pricing.py --dry-run</code> to test without writing.
        </p>
      </div>
    </main>
  )
}
