import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ order?: string; product?: string }>
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const { order: orderId, product } = await searchParams

  let confirmed = false
  let productName: string | null = product ?? null

  if (orderId) {
    try {
      const supabase = getSupabase()
      if (supabase) {
        const { data } = await supabase
          .from('payment_orders')
          .select('status, product')
          .eq('id', orderId)
          .single()
        if (data) {
          confirmed = data.status === 'active'
          if (data.product) productName = data.product as string
        }
      }
    } catch {
      // best-effort — fall through to generic message
    }
  }

  return (
    <main
      style={{
        background: '#0e1322',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Manrope', sans-serif",
        padding: '40px 24px',
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: '100%',
          textAlign: 'center',
          color: '#dee1f7',
        }}
      >
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 22,
            color: '#dee1f7',
            marginBottom: 32,
          }}
        >
          BizLegal <span style={{ color: '#e9c349' }}>•</span> AI
        </div>

        <div
          style={{
            fontSize: 48,
            marginBottom: 16,
          }}
        >
          {confirmed ? '✓' : '⏳'}
        </div>

        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 28,
            color: '#dee1f7',
            marginBottom: 12,
            lineHeight: 1.2,
          }}
        >
          {confirmed ? 'Payment received' : 'Payment processing'}
        </h1>

        {productName && (
          <p
            style={{
              fontSize: 13,
              color: '#e9c349',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            {productName}
          </p>
        )}

        <p style={{ color: '#c3c6d7', fontSize: 15, lineHeight: 1.65, marginBottom: 24 }}>
          {confirmed
            ? 'Your order is confirmed. You will receive a confirmation email shortly with next steps and access instructions.'
            : 'Your payment is processing — crypto confirmations can take a few minutes. You will receive an email once confirmed.'}
        </p>

        {orderId && (
          <p
            style={{
              color: '#8d90a0',
              fontSize: 12,
              fontFamily: "'Courier New', monospace",
              marginBottom: 32,
            }}
          >
            Order: {orderId}
          </p>
        )}

        <a
          href="https://bizlegal-ai.com"
          style={{
            display: 'inline-block',
            background: '#2563eb',
            color: '#eeefff',
            padding: '12px 28px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          Return to BizLegal AI →
        </a>

        <p
          style={{
            marginTop: 32,
            fontSize: 12,
            color: '#8d90a0',
            lineHeight: 1.6,
          }}
        >
          Questions? Email{' '}
          <a href="mailto:team@bizlegal-ai.com" style={{ color: '#b4c5ff' }}>
            team@bizlegal-ai.com
          </a>
        </p>
      </div>
    </main>
  )
}
