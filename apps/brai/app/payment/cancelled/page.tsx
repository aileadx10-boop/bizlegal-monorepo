export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ order?: string }>
}

export default async function PaymentCancelledPage({ searchParams }: PageProps) {
  const { order: orderId } = await searchParams

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
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', color: '#dee1f7' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, marginBottom: 32 }}>
          <span style={{ color: '#00e5a0' }}>BRAI</span>
        </div>

        <div style={{ fontSize: 48, marginBottom: 16 }}>✕</div>

        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 28,
            marginBottom: 12,
            lineHeight: 1.2,
          }}
        >
          Payment not completed
        </h1>

        <p style={{ color: '#c3c6d7', fontSize: 15, lineHeight: 1.65, marginBottom: 24 }}>
          The payment was cancelled before completion. You have not been charged.
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
          href="https://brai.bizlegal-ai.com/pricing"
          style={{
            display: 'inline-block',
            background: '#00c083',
            color: '#0e1322',
            padding: '12px 28px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          Back to pricing →
        </a>

        <p style={{ marginTop: 32, fontSize: 12, color: '#8d90a0', lineHeight: 1.6 }}>
          Questions? Email{' '}
          <a href="mailto:team@bizlegal-ai.com" style={{ color: '#7fe8c8' }}>
            team@bizlegal-ai.com
          </a>
          {orderId ? ' and include the order id above' : ''}.
        </p>
      </div>
    </main>
  )
}
