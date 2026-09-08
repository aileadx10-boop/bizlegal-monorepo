import type { Metadata } from 'next'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import { createClient } from '@supabase/supabase-js'
import { KIT_MARKDOWN, KIT_TITLE, KIT_VERSION, KIT_AUTHOR } from '@/lib/kit/ai-teammate-kit'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `${KIT_TITLE} — delivered copy`,
  robots: { index: false, follow: false },
}

/**
 * /kit?order=<payment_orders.id>
 *
 * O-018 — the readable, printable copy of the AI Teammate Kit, gated on a paid
 * order. "Save as PDF" from the browser's print dialog is the PDF; the
 * markdown download is /api/kit/download?order=<id>. Not indexed.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PAID_STATES = new Set(['active', 'paid'])

type Gate = { ok: true } | { ok: false; reason: 'missing' | 'not_found' | 'unpaid' | 'unavailable' }

async function checkOrder(order: string): Promise<Gate> {
  if (!UUID_RE.test(order)) return { ok: false, reason: 'missing' }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { ok: false, reason: 'unavailable' }
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await supabase
    .from('payment_orders')
    .select('product, status')
    .eq('id', order)
    .maybeSingle()
  if (error || !data) return { ok: false, reason: 'not_found' }
  if (data.product !== 'ai_teammate_kit' || !PAID_STATES.has(String(data.status))) {
    return { ok: false, reason: 'unpaid' }
  }
  return { ok: true }
}

const components: Components = {
  h1: ({ node: _node, ...props }) => (
    <h1 style={{ fontSize: '1.9rem', fontWeight: 700, lineHeight: 1.25, margin: '0 0 1rem' }} {...props} />
  ),
  h2: ({ node: _node, ...props }) => (
    <h2 style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.3, margin: '2.25rem 0 0.75rem' }} {...props} />
  ),
  p: ({ node: _node, ...props }) => <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: '0 0 1rem' }} {...props} />,
  li: ({ node: _node, ...props }) => <li style={{ lineHeight: 1.65, margin: '0 0 0.4rem' }} {...props} />,
  blockquote: ({ node: _node, ...props }) => (
    <blockquote
      style={{ borderLeft: '3px solid var(--primary, #1a56db)', margin: '1rem 0', padding: '0.5rem 1rem', opacity: 0.92 }}
      {...props}
    />
  ),
  table: ({ node: _node, ...props }) => (
    <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.92rem' }} {...props} />
    </div>
  ),
  th: ({ node: _node, ...props }) => (
    <th style={{ border: '1px solid var(--outline, #99a)', padding: '6px 10px', textAlign: 'left' }} {...props} />
  ),
  td: ({ node: _node, ...props }) => (
    <td style={{ border: '1px solid var(--outline, #99a)', padding: '6px 10px', verticalAlign: 'top' }} {...props} />
  ),
  hr: ({ node: _node, ...props }) => (
    <hr style={{ border: 'none', borderTop: '1px solid var(--outline, #99a)', margin: '2rem 0' }} {...props} />
  ),
}

const PRINT_CSS = '@media print { .kit-toolbar, nav, header, footer { display: none !important; } body { background: #fff; color: #111; } }'

export default async function KitPage({ searchParams }: { searchParams: { order?: string } }) {
  const order = (searchParams?.order ?? '').trim()
  const gate = await checkOrder(order)

  if (!gate.ok) {
    const message =
      gate.reason === 'unavailable'
        ? 'The order store is temporarily unavailable. Please try again in a few minutes.'
        : gate.reason === 'unpaid'
          ? 'This link belongs to an order that is not a paid AI Teammate Kit order.'
          : 'This link is missing or does not match an order.'
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px' }}>
        <span className="section-label">AI Teammate Kit</span>
        <h1 style={{ margin: '8px 0 12px' }}>Kit not available at this link</h1>
        <p style={{ color: 'var(--on-surface-var)', lineHeight: 1.7 }}>{message}</p>
        <p style={{ color: 'var(--on-surface-var)', lineHeight: 1.7 }}>
          If you paid for the kit, use the link in your delivery email. If that link fails, reply to that email and it
          will be resent. To buy the kit, see{' '}
          <Link href="/ai-practice-review" style={{ color: 'var(--primary, #1a56db)' }}>
            the AI practice review page
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px' }}>
      <div
        className="kit-toolbar"
        style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}
      >
        <span className="section-label">Delivered copy · {KIT_VERSION}</span>
        <a
          href={`/api/kit/download?order=${encodeURIComponent(order)}`}
          style={{ fontSize: 13, color: 'var(--primary, #1a56db)', textDecoration: 'underline' }}
        >
          Download as Markdown
        </a>
        <span style={{ fontSize: 13, color: 'var(--on-surface-var)' }}>
          For a PDF: print this page and choose &ldquo;Save as PDF&rdquo;.
        </span>
      </div>
      <style>{PRINT_CSS}</style>
      <article>
        <ReactMarkdown components={components}>{KIT_MARKDOWN}</ReactMarkdown>
      </article>
      <p style={{ marginTop: 40, fontSize: 12, color: 'var(--on-surface-var)' }}>
        {KIT_TITLE} · {KIT_VERSION} · {KIT_AUTHOR}. Personal copy for the purchaser; please do not redistribute.
      </p>
    </div>
  )
}
