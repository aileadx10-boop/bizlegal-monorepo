/**
 * SinceFiled deterministic interval prediction.
 * No LLM. Returns only allowed copy: "days since", "predicted due", disclaimer.
 */
export type Obligation = {
  id: string
  obligationType: string
  lastEventAt: string
  intervalDays: number
  jurisdiction: string
}

export type Prediction = {
  daysSince: number
  daysUntil: number | null
  predictedDue: string | null
  disclaimer: string
}

const DISCLAIMER = 'Estimate — verify against jurisdiction rules. Not legal advice.'

export function predict(obligation: Obligation, nowIso?: string): Prediction {
  const now = nowIso ? new Date(nowIso) : new Date()
  const last = new Date(obligation.lastEventAt)
  const ms = now.getTime() - last.getTime()
  const daysSince = Math.max(0, Math.floor(ms / 86_400_000))
  const daysUntil = obligation.intervalDays > 0 ? Math.max(0, obligation.intervalDays - daysSince) : null
  let predictedDue: string | null = null
  if (daysUntil !== null) {
    const due = new Date(last.getTime() + obligation.intervalDays * 86_400_000)
    predictedDue = due.toISOString()
  }
  return { daysSince, daysUntil, predictedDue, disclaimer: DISCLAIMER }
}
