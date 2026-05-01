'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'

interface BriefItem {
  readonly title: string
  readonly link: string
  readonly slug: string
  readonly pubDate: string
  readonly category: string
  readonly description: string
}

interface BriefResponse {
  readonly items: ReadonlyArray<BriefItem>
  readonly fetchedAt: string
  readonly degraded?: boolean
}

function relativeAge(pubDate: string): string {
  const t = Date.parse(pubDate)
  if (Number.isNaN(t)) return ''
  const ms = Date.now() - t
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 14) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

/**
 * Today's Brief — live regulatory feed pulled from
 * blog.bizlegal-ai.com via /api/today-brief (server-cached 10 min).
 *
 * Rendered as a client component so the page stays static-shell
 * cacheable but the section hydrates with live data on mount. If
 * the feed is empty or degraded, we render a single CTA card
 * rather than fake/placeholder posts. No fabricated content.
 */
export default function TodaysBrief() {
  const [items, setItems] = useState<ReadonlyArray<BriefItem>>([])
  const [degraded, setDegraded] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/today-brief', { headers: { accept: 'application/json' } })
      .then((r) => r.json() as Promise<BriefResponse>)
      .then((body) => {
        if (cancelled) return
        setItems(body.items ?? [])
        setDegraded(Boolean(body.degraded) || (body.items?.length ?? 0) === 0)
        setLoaded(true)
      })
      .catch(() => {
        if (cancelled) return
        setDegraded(true)
        setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!loaded) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass-card" style={{ padding: 24, opacity: 0.4 }}>
            <div
              style={{
                height: 12,
                background: 'var(--bg-highest)',
                borderRadius: 2,
                marginBottom: 16,
                width: '40%',
              }}
            />
            <div
              style={{
                height: 14,
                background: 'var(--bg-highest)',
                borderRadius: 2,
                marginBottom: 8,
                width: '90%',
              }}
            />
            <div
              style={{
                height: 14,
                background: 'var(--bg-highest)',
                borderRadius: 2,
                width: '60%',
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  if (degraded) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        <a
          href="https://blog.bizlegal-ai.com/blog"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', textDecoration: 'none' }}
        >
          <div className="glass-card" style={{ padding: 24 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--primary)',
                padding: '2px 8px',
                border: '1px solid var(--outline)',
                borderRadius: 4,
              }}
            >
              Intelligence Desk
            </span>
            <h3
              style={{
                fontSize: 15,
                color: 'var(--white)',
                lineHeight: 1.4,
                marginTop: 16,
                marginBottom: 8,
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
              }}
            >
              Read the latest regulatory analysis on the Intelligence blog →
            </h3>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--muted)',
                letterSpacing: '0.1em',
              }}
            >
              blog.bizlegal-ai.com
            </div>
          </div>
        </a>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16,
      }}
    >
      {items.map((item) => (
        <a
          key={item.link}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', textDecoration: 'none' }}
        >
          <div className="glass-card" style={{ padding: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--primary)',
                  padding: '2px 8px',
                  border: '1px solid var(--outline)',
                  borderRadius: 4,
                }}
              >
                {item.category}
              </span>
            </div>
            <h3
              style={{
                fontSize: 15,
                color: 'var(--white)',
                lineHeight: 1.4,
                marginBottom: 12,
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
              }}
            >
              {item.title}
            </h3>
            {item.description ? (
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--on-surface-var)',
                  lineHeight: 1.6,
                  marginBottom: 12,
                }}
              >
                {item.description.slice(0, 160)}
                {item.description.length > 160 ? '…' : ''}
              </p>
            ) : null}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--muted)',
                letterSpacing: '0.1em',
              }}
            >
              {relativeAge(item.pubDate)}
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

export function TodaysBriefHeader() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 48,
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      <div>
        <div className="quantum-label" style={{ marginBottom: 12 }}>
          — Today&apos;s Brief
        </div>
        <h2 className="quantum-h2">Live regulatory signals.</h2>
      </div>
      <Link
        href="https://blog.bizlegal-ai.com/blog"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--muted)',
          fontSize: 13,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.08em',
        }}
      >
        Full feed <ChevronRight size={14} />
      </Link>
    </div>
  )
}
