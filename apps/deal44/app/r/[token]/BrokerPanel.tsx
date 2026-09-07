'use client'

import { useState } from 'react'
import { t, type Locale, type DictKey } from '@/lib/i18n'
import type { RoomPayload } from './RoomView'

/**
 * Everything only the broker can do, in one place.
 *
 * Split out of RoomView because a party's view and the broker's controls are
 * different jobs, and because the room file was heading past the point where
 * you can hold it in your head.
 *
 * Every action here is also enforced server-side against the role the link
 * token resolved to — this component decides what to show, never what is
 * allowed.
 */
export default function BrokerPanel({
  token,
  room,
  onChanged,
}: {
  token: string
  room: RoomPayload
  onChanged: () => Promise<void>
}) {
  const locale: Locale = room.party.locale
  const [busy, setBusy] = useState<string | null>(null)
  const [newLink, setNewLink] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const roleLabel = (role: string) => t(locale, `role.${role}` as DictKey) || role
  const roles = [...new Set([...room.parties.map((p) => p.role), ...room.tasks.map((x) => x.assignee_role)])]

  async function post(path: string, body: unknown, tag: string) {
    setBusy(tag)
    setNote(null)
    try {
      const res = await fetch(`/api/r/${token}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setNote(String(json.error ?? res.status))
        return null
      }
      await onChanged()
      return json
    } catch {
      setNote('network_error')
      return null
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      {/* Add a task. This is the path that matters while a template is still a
          draft: the broker types the contract's own dates straight in. */}
      <div className="card">
        <p className="label" style={{ marginBottom: '0.6rem' }}>{t(locale, 'room.add_task')}</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            const el = e.currentTarget
            const ok = await post(
              '/tasks',
              {
                label_text: String(form.get('label_text') ?? ''),
                phase: String(form.get('phase') ?? ''),
                assignee_role: String(form.get('assignee_role') ?? ''),
                due_date: String(form.get('due_date') ?? '') || null,
                statutory: false,
              },
              'task',
            )
            if (ok) el.reset()
          }}
        >
          <label className="field">
            <span>{t(locale, 'room.task_label')}</span>
            <input name="label_text" required maxLength={300} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <label className="field">
              <span>{t(locale, 'room.task_phase')}</span>
              <select name="phase" defaultValue={room.phases[0]}>
                {room.phases.map((p) => (
                  <option key={p} value={p}>{t(locale, `phase.${p}` as DictKey) || p}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t(locale, 'room.task_owner')}</span>
              <select name="assignee_role" defaultValue={room.party.role}>
                {roles.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
              </select>
            </label>
            <label className="field">
              <span>{t(locale, 'room.task_due')}</span>
              <input name="due_date" type="date" />
            </label>
          </div>
          <button className="btn" type="submit" disabled={busy === 'task'}>
            {busy === 'task' ? t(locale, 'intake.sending') : t(locale, 'room.add_task')}
          </button>
        </form>
      </div>

      {/* Move the signing or delivery date. Closings slip; the checklist has to
          follow, or the room starts lying the moment it does. */}
      <div className="card">
        <p className="label" style={{ marginBottom: '0.6rem' }}>{t(locale, 'room.change_dates')}</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            const anchors: Record<string, string> = {}
            for (const key of ['signing', 'closing']) {
              const value = String(form.get(key) ?? '')
              if (value) anchors[key] = value
            }
            if (Object.keys(anchors).length === 0) return
            const res = await post('/anchors', { anchors }, 'anchors')
            if (res) setNote(t(locale, 'room.rescheduled', { n: Number(res.rescheduled ?? 0) }))
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <label className="field">
              <span>{t(locale, 'room.signing')}</span>
              <input name="signing" type="date" defaultValue={room.anchors.signing ?? ''} />
            </label>
            <label className="field">
              <span>{t(locale, 'room.closing')}</span>
              <input name="closing" type="date" defaultValue={room.anchors.closing ?? ''} />
            </label>
          </div>
          <button className="btn" type="submit" disabled={busy === 'anchors'}>
            {busy === 'anchors' ? t(locale, 'intake.sending') : t(locale, 'room.change_dates')}
          </button>
        </form>
      </div>

      {/* Add a party mid-transaction. Rebuilding the room to add one person
          would invalidate everyone else's link. */}
      <div className="card">
        <p className="label" style={{ marginBottom: '0.6rem' }}>{t(locale, 'room.add_party')}</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            const el = e.currentTarget
            const res = await post(
              '/parties',
              {
                role: String(form.get('role') ?? ''),
                name: String(form.get('name') ?? ''),
                email: String(form.get('email') ?? ''),
                locale,
                send_invite: form.get('send_invite') === 'on',
              },
              'party',
            )
            if (res) {
              el.reset()
              setNewLink(String(res.url ?? ''))
            }
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <label className="field">
              <span>{t(locale, 'room.task_owner')}</span>
              <select name="role" defaultValue="buyer_lawyer">
                {['buyer', 'seller', 'buyer_lawyer', 'seller_lawyer', 'mortgage_broker', 'agent', 'lender', 'title'].map((r) => (
                  <option key={r} value={r}>{roleLabel(r)}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t(locale, 'intake.name')}</span>
              <input name="name" required maxLength={120} />
            </label>
            <label className="field">
              <span>{t(locale, 'intake.email')}</span>
              <input name="email" type="email" required maxLength={200} />
            </label>
          </div>
          <label className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" name="send_invite" defaultChecked />
            <span style={{ margin: 0 }}>{t(locale, 'room.send_invite')}</span>
          </label>
          <button className="btn" type="submit" disabled={busy === 'party'}>
            {busy === 'party' ? t(locale, 'intake.sending') : t(locale, 'room.add_party')}
          </button>
        </form>

        {/* Shown once. The database keeps only a hash, so this link cannot be
            recovered afterwards — copy it now or resend the invite. */}
        {newLink && (
          <p className="notice" style={{ marginTop: '0.9rem', wordBreak: 'break-all' }}>
            {t(locale, 'room.link_once')}
            <br />
            <code>{newLink}</code>
          </p>
        )}
      </div>

      {note && <p className="muted">{note}</p>}
    </>
  )
}
