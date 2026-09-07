'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { t, taskLabel, dirFor, langFor, type Locale, type DictKey } from '@/lib/i18n'
import { fmtDate, fmtDaysLeft } from '@/lib/i18n/format'
import { canToggleTask, canManageRoom } from '@/lib/rooms/access'

export interface RoomTask {
  id: string
  key: string
  label_key: string | null
  label_text: string | null
  phase: string
  assignee_role: string
  due_date: string | null
  days_until: number | null
  statutory: boolean
  status: string
  completed_at: string | null
}

export interface RoomParty {
  id: string
  role: string
  display_name: string
}

export interface RoomPayload {
  title: string
  locale: Locale
  anchors: Record<string, string>
  phases: string[]
  warnings: string[]
  party: { id: string; role: string; display_name: string; locale: Locale }
  parties: RoomParty[]
  tasks: RoomTask[]
}

function dueColour(days: number | null): string {
  if (days === null) return 'var(--muted)'
  if (days < 0 || days <= 1) return 'var(--danger)'
  if (days <= 7) return 'var(--warn)'
  return 'var(--muted)'
}

export default function RoomView({ token, initial }: { token: string; initial: RoomPayload }) {
  const [room, setRoom] = useState<RoomPayload>(initial)
  const [busy, setBusy] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const locale = room.party.locale

  // The document is Hebrew/RTL by default. A party whose own locale is English
  // gets an LTR document rather than English text laid out right-to-left.
  useEffect(() => {
    document.documentElement.lang = langFor(locale)
    document.documentElement.dir = dirFor(locale)
  }, [locale])

  const toggle = useCallback(
    async (task: RoomTask, completed: boolean) => {
      setBusy(task.id)
      const previous = room
      setRoom((r) => ({
        ...r,
        tasks: r.tasks.map((x) =>
          x.id === task.id
            ? {
                ...x,
                status: completed ? 'done' : 'open',
                completed_at: completed ? new Date().toISOString() : null,
              }
            : x,
        ),
      }))
      try {
        const res = await fetch(`/api/r/${token}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task_id: task.id, completed }),
        })
        if (!res.ok) setRoom(previous)
      } catch {
        setRoom(previous)
      } finally {
        setBusy(null)
      }
    },
    [room, token],
  )

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/r/${token}`)
    if (!res.ok) return
    const data = (await res.json()) as { ok: boolean; room: RoomPayload }
    if (data.ok) setRoom(data.room)
  }, [token])

  const addTask = useCallback(
    async (form: FormData, el: HTMLFormElement) => {
      setAdding(true)
      try {
        const due = String(form.get('due_date') ?? '')
        const res = await fetch(`/api/r/${token}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label_text: String(form.get('label_text') ?? ''),
            phase: String(form.get('phase') ?? ''),
            assignee_role: String(form.get('assignee_role') ?? ''),
            due_date: due || null,
            statutory: false,
          }),
        })
        if (res.ok) {
          el.reset()
          await refresh()
        }
      } finally {
        setAdding(false)
      }
    },
    [token, refresh],
  )

  const done = room.tasks.filter((x) => x.status === 'done').length
  const total = room.tasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const byPhase = useMemo(() => {
    return room.phases
      .map((phase) => ({ phase, tasks: room.tasks.filter((x) => x.phase === phase) }))
      .filter((group) => group.tasks.length > 0)
  }, [room])

  const roleLabel = (role: string): string => t(locale, `role.${role}` as DictKey) || role

  return (
    <main>
      <h1>{room.title}</h1>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>
        {roleLabel(room.party.role)}
        {room.anchors.closing ? ` · ${t(locale, 'room.closing')} ${fmtDate(locale, room.anchors.closing)}` : ''}
      </p>

      {/* Warnings are never hidden: an unreviewed checklist or an unconfigured
          holiday table changes how much weight these dates can carry. */}
      {room.warnings.map((w) => {
        const key = w.startsWith('missing_anchor') ? 'warn.missing_anchor' : `warn.${w}`
        return (
          <div className="notice" key={w}>
            {t(locale, key as DictKey)}
          </div>
        )
      })}

      <div className="card">
        <div className="between" style={{ marginBottom: '0.5rem' }}>
          <p className="label">{t(locale, 'room.progress')}</p>
          <span className="muted">{t(locale, 'room.tasks_done', { done, total })}</span>
        </div>
        <div className="bar">
          <span className={pct === 100 ? 'full' : ''} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {total === 0 && <p className="muted">{t(locale, 'room.no_tasks')}</p>}

      {byPhase.map(({ phase, tasks }) => {
        const phaseDone = tasks.filter((x) => x.status === 'done').length
        return (
          <div className="card" key={phase}>
            <div className="between" style={{ marginBottom: '0.6rem' }}>
              <p className="label">{t(locale, `phase.${phase}` as DictKey) || phase}</p>
              <span className="muted">
                {phaseDone}/{tasks.length}
              </span>
            </div>

            {tasks.map((task) => {
              const mine = canToggleTask(room.party.role, task.assignee_role)
              const isDone = task.status === 'done'
              return (
                <label
                  className="row"
                  key={task.id}
                  style={{ cursor: mine ? 'pointer' : 'default', opacity: busy === task.id ? 0.6 : 1 }}
                >
                  <input
                    type="checkbox"
                    checked={isDone}
                    disabled={!mine || busy === task.id}
                    onChange={(e) => void toggle(task, e.target.checked)}
                  />
                  <span style={{ flex: 1 }}>
                    <span className={isDone ? 'strike' : ''}>
                      {taskLabel(locale, task.label_key, task.label_text)}
                    </span>
                    {task.statutory && (
                      <span className="pill" style={{ marginInlineStart: '0.5rem' }}>
                        {t(locale, 'room.statutory')}
                      </span>
                    )}
                    <span className="muted" style={{ display: 'block' }}>
                      {roleLabel(task.assignee_role)}
                      {' · '}
                      {task.due_date ? (
                        <span style={{ color: dueColour(task.days_until) }}>
                          {t(locale, 'room.due')} {fmtDate(locale, task.due_date)}
                          {task.days_until !== null && !isDone
                            ? ` (${fmtDaysLeft(locale, task.days_until)})`
                            : ''}
                        </span>
                      ) : (
                        t(locale, 'room.no_date')
                      )}
                      {isDone && task.completed_at
                        ? ` · ${t(locale, 'room.done_on', { date: fmtDate(locale, task.completed_at.slice(0, 10)) })}`
                        : ''}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        )
      })}

      {/* Broker-only. The Israeli template ships unreviewed, so a real room
          starts empty and the broker types the contract's dates in by hand.
          This form is therefore the Phase-0 path, not a convenience. */}
      {canManageRoom(room.party.role) && (
        <div className="card">
          <p className="label" style={{ marginBottom: '0.6rem' }}>
            {t(locale, 'room.add_task')}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void addTask(new FormData(e.currentTarget), e.currentTarget)
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
                    <option key={p} value={p}>
                      {t(locale, `phase.${p}` as DictKey) || p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{t(locale, 'room.task_owner')}</span>
                <select name="assignee_role" defaultValue={room.party.role}>
                  {[...new Set(room.parties.map((p) => p.role))].map((r) => (
                    <option key={r} value={r}>
                      {roleLabel(r)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{t(locale, 'room.task_due')}</span>
                <input name="due_date" type="date" />
              </label>
            </div>
            <button className="btn" type="submit" disabled={adding}>
              {adding ? t(locale, 'intake.sending') : t(locale, 'room.add_task')}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <p className="label" style={{ marginBottom: '0.6rem' }}>
          {t(locale, 'room.parties')}
        </p>
        {room.parties.map((p) => (
          <div className="row" key={p.id}>
            <span style={{ flex: 1 }}>{p.display_name}</span>
            <span className="muted">{roleLabel(p.role)}</span>
          </div>
        ))}
      </div>

      <footer>
        <p className="muted">{t(locale, 'landing.disclaimer')}</p>
      </footer>
    </main>
  )
}
