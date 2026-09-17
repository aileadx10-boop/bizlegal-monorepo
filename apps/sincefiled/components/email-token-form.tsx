'use client'

import { useState } from 'react'

export default function EmailTokenForm({
  firmName,
  obligations,
}: {
  firmName: string
  obligations: Array<{ id: string; obligationType: string }>
}) {
  const [message, setMessage] = useState<string | null>(null)

  async function generate(obligationId: string) {
    const response = await fetch('/api/emails/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ obligationId }),
    })
    const data = await response.json()
    setMessage(data.ok ? `Token: ${data.token}` : (data.error ?? 'Generation failed'))
  }

  return (
    <>
      <p>Firm: {firmName}</p>
      {message && <pre>{message}</pre>}
      <ul>
        {obligations.map((obligation) => (
          <li key={obligation.id}>
            {obligation.obligationType}{' '}
            <button type="button" onClick={() => generate(obligation.id)}>Generate token</button>
          </li>
        ))}
      </ul>
    </>
  )
}
