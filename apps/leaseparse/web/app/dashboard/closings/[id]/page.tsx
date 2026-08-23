'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const C = {
  surface: '#111520',
  border: '#1e2430',
  text: '#e8e6e3',
  muted: '#8b93a7',
  body: '#c3c9d6',
  accent: '#3b72e8',
  success: '#2db66e',
  warn: '#e8a325',
  danger: '#e05450',
} as const

type ChecklistPhase = 'contract' | 'diligence' | 'financing' | 'closing' | 'post_closing'

interface ChecklistTask {
  key: string
  label: string
  phase: ChecklistPhase
  due_date: string
  assignee: string
  completed_at: string | null
}

interface Deadline {
  key: string
  label: string
  due_date: string
  days_until: number
  offset_business_days: number
}

interface Transaction {
  id: string
  transaction_type: string
  closing_date: string
  status: string
  checklist: ChecklistTask[]
  deadlines: Deadline[]
}

const TX_LABELS: Record<string, string> = {
  residential_purchase: 'Residential Purchase',
  residential_refi: 'Refinance',
  commercial: 'Commercial',
  exchange_1031: '1031 Exchange',
}

const PHASE_LABELS: Record<ChecklistPhase, string> = {
  contract: 'Contract',
  diligence: 'Due Diligence',
  financing: 'Financing',
  closing: 'Closing',
  post_closing: 'Post-Closing',
}

const PHASE_ORDER: ChecklistPhase[] = ['contract', 'diligence', 'financing', 'closing', 'post_closing']

function fmtDate(iso: string): string {
  if (!iso) return '—'
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

function daysUntilColor(days: number): string {
  if (days < 0) return C.danger
  if (days <= 7) return C.danger
  if (days <= 21) return C.warn
  return C.muted
}

interface RouteContext { params: { id: string } }

export default function ClosingPage({ params }: RouteContext) {
  const { id } = params
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/closings/${id}`)
      if (res.status === 404) { setErr('not_found'); return }
      const data = await res.json() as { ok: boolean; transaction: Transaction; error?: string }
      if (data.ok) setTransaction(data.transaction)
      else setErr(data.error ?? 'load_failed')
    } catch {
      setErr('network_error')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { void load() }, [load])

  async function toggleTask(taskKey: string, completed: boolean) {
    if (!transaction) return
    setToggling(taskKey)

    // Optimistic update
    setTransaction(prev => prev ? {
      ...prev,
      checklist: prev.checklist.map(t =>
        t.key === taskKey ? { ...t, completed_at: completed ? new Date().toISOString() : null } : t
      ),
    } : null)

    try {
      await fetch(`/api/closings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_key: taskKey, completed }),
      })
    } catch { /* revert is not worth the complexity here — PATCH is best-effort */ }
    finally {
      setToggling(null)
    }
  }

  if (loading) return <main style={{ padding: '2rem 1.5rem', color: C.muted }}>Loading...</main>
  if (err || !transaction) return (
    <main style={{ padding: '2rem 1.5rem' }}>
      <Link href="/dashboard" style={{ color: C.accent, textDecoration: 'none', fontSize: '0.875rem' }}>← Dashboard</Link>
      <p style={{ color: C.danger, marginTop: '1rem' }}>{err ?? 'Not found'}</p>
    </main>
  )

  const tasks = transaction.checklist
  const completedCount = tasks.filter(t => t.completed_at).length
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  const byPhase = PHASE_ORDER.reduce<Record<ChecklistPhase, ChecklistTask[]>>((acc, phase) => {
    acc[phase] = tasks.filter(t => t.phase === phase)
    return acc
  }, { contract: [], diligence: [], financing: [], closing: [], post_closing: [] })

  const card: React.CSSProperties = {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
    padding: '1rem 1.25rem',
    marginBottom: '1rem',
  }

  const label: React.CSSProperties = {
    fontSize: '0.7rem',
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    margin: 0,
  }

  return (
    <main style={{ maxWidth: '52rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Nav */}
      <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem' }}>
        <Link href="/dashboard" style={{ color: C.accent, textDecoration: 'none' }}>← Dashboard</Link>
      </p>

      {/* Header */}
      <h1 style={{ fontSize: '1.3rem', margin: '0 0 0.25rem' }}>
        {TX_LABELS[transaction.transaction_type] ?? transaction.transaction_type}
      </h1>
      <p style={{ fontSize: '0.8rem', color: C.muted, margin: '0 0 1.5rem' }}>
        Closing {fmtDate(transaction.closing_date)} · {transaction.status}
      </p>

      {/* Progress bar */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <p style={label}>Progress</p>
          <span style={{ fontSize: '0.8rem', color: C.body }}>{completedCount} / {tasks.length} tasks ({progressPct}%)</span>
        </div>
        <div style={{ height: '6px', background: C.border, borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct === 100 ? C.success : C.accent, borderRadius: '3px', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Deadline milestones */}
      {transaction.deadlines.length > 0 && (
        <div style={card}>
          <p style={{ ...label, margin: '0 0 0.75rem' }}>Deadline Milestones</p>
          {transaction.deadlines.map(dl => (
            <div key={dl.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: `1px solid ${C.border}`, fontSize: '0.875rem' }}>
              <span style={{ color: C.body }}>{dl.label}</span>
              <span style={{ color: daysUntilColor(dl.days_until), whiteSpace: 'nowrap', marginLeft: '1rem', fontSize: '0.8rem' }}>
                {fmtDate(dl.due_date)}
                {dl.days_until !== undefined && (
                  <span style={{ marginLeft: '0.4rem' }}>
                    ({dl.days_until < 0 ? `${Math.abs(dl.days_until)}d ago` : dl.days_until === 0 ? 'today' : `${dl.days_until}d`})
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Checklist by phase */}
      {PHASE_ORDER.map(phase => {
        const phaseTasks = byPhase[phase]
        if (phaseTasks.length === 0) return null
        const phaseCompleted = phaseTasks.filter(t => t.completed_at).length

        return (
          <div key={phase} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <p style={label}>{PHASE_LABELS[phase]}</p>
              <span style={{ fontSize: '0.75rem', color: phaseCompleted === phaseTasks.length ? C.success : C.muted }}>
                {phaseCompleted}/{phaseTasks.length}
              </span>
            </div>

            {phaseTasks.map(task => (
              <label
                key={task.key}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  padding: '0.4rem 0',
                  borderBottom: `1px solid ${C.border}`,
                  cursor: 'pointer',
                  opacity: toggling === task.key ? 0.6 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={task.completed_at !== null}
                  disabled={toggling === task.key}
                  onChange={e => void toggleTask(task.key, e.target.checked)}
                  style={{ marginTop: '0.15rem', accentColor: C.success, width: '14px', height: '14px', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontSize: '0.875rem',
                    color: task.completed_at ? C.muted : C.body,
                    textDecoration: task.completed_at ? 'line-through' : 'none',
                  }}>
                    {task.label}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: C.muted, marginTop: '0.1rem' }}>
                    {task.assignee} · due {fmtDate(task.due_date)}
                    {task.completed_at && (
                      <span style={{ color: C.success }}> · done {fmtDate(task.completed_at.slice(0, 10))}</span>
                    )}
                  </span>
                </div>
              </label>
            ))}
          </div>
        )
      })}
    </main>
  )
}
