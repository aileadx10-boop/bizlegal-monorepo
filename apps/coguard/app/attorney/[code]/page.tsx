import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

interface Message {
  id: number
  channel: string
  sender_id: string | null
  subject: string | null
  raw_body: string
  body_sha256: string
  neutralized_body: string | null
  hostility_score: number | null
  flags: string[]
  received_at: string
}

interface BinderRow {
  id: string
  subscriber_id: string
  date_from: string
  date_to: string
  status: string
  bates_start: number | null
  bates_end: number | null
}

async function getBinderData(code: string): Promise<{ binder: BinderRow; messages: Message[] } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  const supabase = createClient(url, key)

  const { data: binder } = await supabase
    .from('coguard_binders')
    .select('id, subscriber_id, date_from, date_to, status, bates_start, bates_end')
    .eq('attorney_access_code', code)
    .eq('status', 'ready')
    .single()

  if (!binder) return null

  const { data: messages } = await supabase
    .from('coguard_messages')
    .select('id, channel, sender_id, subject, raw_body, body_sha256, neutralized_body, hostility_score, flags, received_at')
    .eq('subscriber_id', binder.subscriber_id)
    .gte('received_at', binder.date_from)
    .lte('received_at', binder.date_to)
    .order('received_at', { ascending: true })

  // Log access
  await supabase
    .from('coguard_attorney_access')
    .upsert({ access_code: code, subscriber_id: binder.subscriber_id, binder_id: binder.id, last_accessed_at: new Date().toISOString() }, { onConflict: 'access_code' })

  return { binder, messages: messages ?? [] }
}

export default async function AttorneyPortalPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const data = await getBinderData(code)

  if (!data) return notFound()

  const { binder, messages } = data

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) 1.5rem' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-block', background: '#f0fdf4', color: '#15803d', borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
          ATTORNEY READ-ONLY PORTAL
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>Co-Parenting Communication Log</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
          {binder.date_from.slice(0, 10)} – {binder.date_to.slice(0, 10)} · {messages.length} messages · Bates {binder.bates_start}–{binder.bates_end}
        </p>
      </div>

      <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 10, padding: 14, marginBottom: 28, fontSize: 13, color: '#92400e' }}>
        <strong>Chain-of-custody notice:</strong> Every message below was cryptographically fingerprinted (SHA-256) at the moment of receipt or sending. Bodies cannot be altered after logging. Verify integrity: hash the body text and compare to the recorded SHA-256.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((msg, index) => {
          const batesNum = binder.bates_start ? binder.bates_start + index : index + 1
          const batesLabel = `BL-${String(batesNum).padStart(7, '0')}`
          const isHighConflict = (msg.hostility_score ?? 0) > 0.6

          return (
            <div key={msg.id} style={{ border: `1px solid ${isHighConflict ? '#fecdd3' : '#e5e7eb'}`, borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#6b7280' }}>{batesLabel}</span>
                  <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 9999, background: msg.channel === 'incoming' ? '#dbeafe' : '#d1fae5', color: msg.channel === 'incoming' ? '#1e40af' : '#065f46', fontWeight: 600 }}>
                    {msg.channel === 'incoming' ? '← Received' : '→ Sent'}
                  </span>
                  {isHighConflict && (
                    <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 9999, background: '#fee2e2', color: '#991b1b', fontWeight: 600 }}>
                      ⚠ High conflict
                    </span>
                  )}
                  {(msg.flags ?? []).map(f => (
                    <span key={f} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 9999, background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>{f}</span>
                  ))}
                </div>
                <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{new Date(msg.received_at).toLocaleString()}</span>
              </div>
              {msg.subject && <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{msg.subject}</p>}
              <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{msg.raw_body}</p>
              <p style={{ margin: '10px 0 0', fontSize: 11, fontFamily: 'monospace', color: '#9ca3af', wordBreak: 'break-all' }}>SHA-256: {msg.body_sha256}</p>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 32, padding: 20, background: '#f9fafb', borderRadius: 10, fontSize: 13, color: '#6b7280' }}>
        This document was generated by CoGuard for reference in legal proceedings. Admissibility is subject to the rules of evidence in your jurisdiction. CoGuard is not a law firm and this portal does not constitute legal advice.
      </div>
    </main>
  )
}
