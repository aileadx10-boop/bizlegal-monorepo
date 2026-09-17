import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { readFirmState } from '@/lib/state/store'
import { verifyToken } from '@/lib/auth'
import { predict } from '@/lib/predict'
import { assertToneSafe } from '@/lib/tone'
import ObligationsClient from '@/components/obligations-client'

export default async function DashboardPage() {
  const session = verifyToken(cookies().get('sf_session')?.value ?? '')
  if (!session) redirect('/login')
  const firm = await readFirmState(session.email)
  const rows = firm.obligations.map((o) => ({ id: o.id, obligationType: o.obligationType, jurisdiction: o.jurisdiction, ...predict(o) }))
  const copy = 'Days since, predicted due, no guilt. Estimate — verify against jurisdiction rules. Not legal advice.'
  const toneOk = assertToneSafe(copy)
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>SinceFiled — {firm.firmName}</h1>
      {!toneOk ? <p style={{ color: 'red' }}>TONE_SHIELD_VIOLATION</p> : <p>No guilt. No streaks. Predictions are estimates.</p>}
      <ObligationsClient rows={rows} />
      <p style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>{copy}</p>
    </main>
  )
}
