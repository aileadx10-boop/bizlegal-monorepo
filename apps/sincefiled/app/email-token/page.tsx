import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { readFirmState } from '@/lib/state/store'
import { verifyToken } from '@/lib/auth'
import EmailTokenForm from '@/components/email-token-form'

export default async function EmailTokenPage() {
  const session = verifyToken(cookies().get('sf_session')?.value ?? '')
  if (!session) redirect('/login')
  const firm = await readFirmState(session.email)
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 520, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>Email log tokens</h1>
      <p>Generate an opaque token for an obligation.</p>
      <EmailTokenForm firmName={firm.firmName} obligations={firm.obligations.map((o) => ({ id: o.id, obligationType: o.obligationType }))} />
    </main>
  )
}
