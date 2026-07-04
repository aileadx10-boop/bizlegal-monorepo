'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'

export interface QualifierChatProps {
  /** Page hint forwarded to /api/qualify (e.g. "custom-build"). */
  context?: string
  className?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SESSION_KEY = 'bl_qualifier_session_id'

const GREETING =
  "I'm the BizLegal AI async consultant — an AI, reviewed by Moses. Tell me what's slowing you down on the compliance side and I'll point you at the smallest thing that fixes it."

const STARTER_CHIPS = [
  'MiCA/CASP licensing',
  'SOC 2 questionnaires',
  'Custom compliance AI build',
] as const

/**
 * BizLegal AI — QualifierChat.
 *
 * Minimal async-qualifier chat widget (Engine 3 of the revenue machine).
 * Talks to /api/qualify, persists the session id in sessionStorage so a
 * visitor can navigate away and resume. On API failure the widget degrades
 * to a plain mailto line — the funnel never dead-ends.
 */
export default function QualifierChat({ context, className }: QualifierChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: GREETING },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const sessionIdRef = useRef<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      sessionIdRef.current = window.sessionStorage.getItem(SESSION_KEY)
    } catch {
      // sessionStorage unavailable (private mode) — session lives per page load
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy])

  async function send(text: string) {
    const message = text.trim()
    if (!message || busy) return
    setBusy(true)
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: message }])
    try {
      const res = await fetch('/api/qualify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current ?? undefined,
          message,
          context,
        }),
      })
      const data = (await res.json()) as { sessionId?: string; reply?: string; error?: string }
      if (!res.ok || !data.reply) {
        setFailed(true)
        return
      }
      if (data.sessionId) {
        sessionIdRef.current = data.sessionId
        try {
          window.sessionStorage.setItem(SESSION_KEY, data.sessionId)
        } catch {
          // best-effort persistence only
        }
      }
      setFailed(false)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply as string }])
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void send(input)
  }

  const showChips = messages.length === 1 && !busy

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--bl-border, var(--outline-var, #2a3148))',
        borderRadius: 'var(--bl-radius-lg, 12px)',
        background: 'var(--bl-surface, var(--bg-low, #12172a))',
        overflow: 'hidden',
        maxWidth: 640,
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--bl-divider, var(--outline-var, #2a3148))',
          fontFamily: 'var(--bl-font-mono, ui-monospace)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--bl-text-muted, var(--muted, #8d90a0))',
        }}
      >
        Async consultant · AI, human-reviewed · No calls, ever
      </div>

      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: 16,
          height: 320,
          overflowY: 'auto',
        }}
      >
        {messages.map((m, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
            key={`${m.role}-${i}`}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: 14,
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
              background:
                m.role === 'user'
                  ? 'var(--bl-accent-soft, rgba(37,99,235,0.15))'
                  : 'var(--bl-bg-low, var(--bg-2, #161b2b))',
              border: '1px solid var(--bl-border, var(--outline-var, #2a3148))',
              color: 'var(--bl-text, var(--on-surface, #dee1f7))',
            }}
          >
            {m.content}
          </div>
        ))}
        {busy && (
          <div
            style={{
              alignSelf: 'flex-start',
              padding: '10px 14px',
              fontSize: 13,
              color: 'var(--bl-text-subtle, var(--muted, #8d90a0))',
            }}
          >
            Thinking…
          </div>
        )}
        {failed && (
          <p
            role="alert"
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.5,
              color: 'var(--bl-text-muted, var(--muted, #8d90a0))',
            }}
          >
            The consultant is offline right now. Email{' '}
            <a href="mailto:team@bizlegal-ai.com?subject=Compliance question (qualifier offline)">
              team@bizlegal-ai.com
            </a>{' '}
            — same brain, slightly slower.
          </p>
        )}
      </div>

      {showChips && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 16px 12px' }}>
          {STARTER_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => void send(chip)}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: '1px solid var(--bl-border, var(--outline-var, #2a3148))',
                background: 'transparent',
                color: 'var(--bl-text-muted, var(--muted, #8d90a0))',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        style={{
          display: 'flex',
          gap: 8,
          padding: 12,
          borderTop: '1px solid var(--bl-divider, var(--outline-var, #2a3148))',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your compliance bottleneck…"
          maxLength={2000}
          disabled={busy}
          aria-label="Message the async consultant"
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid var(--bl-border, var(--outline-var, #2a3148))',
            background: 'var(--bl-bg, var(--bg, #0e1322))',
            color: 'var(--bl-text, var(--on-surface, #dee1f7))',
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid var(--bl-accent, #2563eb)',
            background: 'var(--bl-accent, #2563eb)',
            color: '#eeefff',
            fontSize: 14,
            fontWeight: 600,
            cursor: busy || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: busy || !input.trim() ? 0.6 : 1,
          }}
        >
          {busy ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
