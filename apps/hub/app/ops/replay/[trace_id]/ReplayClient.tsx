'use client'

/**
 * ReplayClient — Phase 4 of PLATFORM-BUILD-2026-07-02
 *
 * Interactive trace replay UI. Cycles through events with a 500ms delay
 * to simulate watching the agent run step-by-step.
 */

import { type ReactNode, useCallback, useState } from 'react'

export interface TraceEvent {
  service: string
  status: string
  last_action: string | null
  pinged_at: string
  metadata: Record<string, unknown>
}

interface Props {
  events: TraceEvent[]
}

function statusBadge(status: string): ReactNode {
  let bg = '#1f2937'
  let color = '#9ca3af'
  let label = status

  switch (status) {
    case 'alive':
      bg = '#064e3b'
      color = '#6ee7b7'
      label = 'alive'
      break
    case 'degraded':
      bg = '#78350f'
      color = '#fcd34d'
      label = 'degraded'
      break
    case 'dead':
    case 'error':
      bg = '#7f1d1d'
      color = '#fca5a5'
      label = status
      break
    case 'starting':
    case 'stopping':
      bg = '#1c1f26'
      color = '#6b7280'
      break
  }

  return (
    <span
      style={{
        display: 'inline-block',
        background: bg,
        color,
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
  )
}

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function ReplayClient({ events }: Props) {
  const [visibleCount, setVisibleCount] = useState(events.length)
  const [replaying, setReplaying] = useState(false)
  const [done, setDone] = useState(false)

  const startReplay = useCallback(() => {
    if (replaying) return
    setVisibleCount(0)
    setDone(false)
    setReplaying(true)

    let i = 0
    const tick = () => {
      i += 1
      setVisibleCount(i)
      if (i >= events.length) {
        setReplaying(false)
        setDone(true)
        return
      }
      setTimeout(tick, 500)
    }

    setTimeout(tick, 400)
  }, [events.length, replaying])

  const visibleEvents = events.slice(0, visibleCount)

  return (
    <section>
      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <button
          onClick={startReplay}
          disabled={replaying}
          style={{
            background: replaying ? '#1f2937' : '#1d4ed8',
            color: replaying ? '#6b7280' : '#dbeafe',
            border: '1px solid ' + (replaying ? '#374151' : '#2563eb'),
            padding: '7px 16px',
            borderRadius: 6,
            cursor: replaying ? 'default' : 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {replaying ? '⏳ Replaying...' : '▶ Replay'}
        </button>

        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {replaying
            ? `${visibleCount} / ${events.length} events`
            : done
            ? `Replay complete — ${events.length} events`
            : `${events.length} events total`}
        </span>

        {done && (
          <span style={{ fontSize: 12, color: '#10b981' }}>✓ done</span>
        )}
      </div>

      {/* Event timeline */}
      <div style={{ display: 'grid', gap: 6 }}>
        {events.map((ev, idx) => {
          const visible = idx < visibleCount
          return (
            <div
              key={idx}
              style={{
                background: '#111',
                border: '1px solid #1f2937',
                borderRadius: 6,
                padding: '10px 14px',
                display: 'grid',
                gridTemplateColumns: '80px 180px 1fr auto',
                gap: 12,
                alignItems: 'center',
                opacity: visible ? 1 : 0.15,
                transition: 'opacity 0.3s ease',
              }}
            >
              {/* Timestamp */}
              <span style={{ fontSize: 12, color: '#6b7280', fontVariantNumeric: 'tabular-nums' }}>
                {fmtTime(ev.pinged_at)}
              </span>

              {/* Service */}
              <code style={{ fontSize: 12, color: '#c4b5fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ev.service}
              </code>

              {/* Action */}
              <span style={{ fontSize: 13, color: '#d4d4d4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ev.last_action ?? <em style={{ color: '#4b5563' }}>—</em>}
              </span>

              {/* Status badge */}
              <div>{statusBadge(ev.status)}</div>
            </div>
          )
        })}
      </div>

      {events.length === 0 && (
        <div
          style={{
            padding: 32,
            textAlign: 'center',
            color: '#4b5563',
            fontSize: 14,
            border: '1px dashed #1f2937',
            borderRadius: 8,
          }}
        >
          No events found for this trace ID.
        </div>
      )}

      {visibleEvents.length > 0 && (
        <details style={{ marginTop: 20 }}>
          <summary
            style={{
              cursor: 'pointer',
              fontSize: 12,
              color: '#6b7280',
              userSelect: 'none',
            }}
          >
            Latest event metadata
          </summary>
          <pre
            style={{
              marginTop: 8,
              background: '#111',
              border: '1px solid #1f2937',
              borderRadius: 6,
              padding: 12,
              fontSize: 11,
              color: '#a3e635',
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(visibleEvents[visibleEvents.length - 1]?.metadata ?? {}, null, 2)}
          </pre>
        </details>
      )}
    </section>
  )
}
