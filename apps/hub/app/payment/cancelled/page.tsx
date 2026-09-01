export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ order?: string; product?: string; reason?: string }>
}

const REASONS: Record<string, string> = {
  capture_failed:
    'Your payment was approved at PayPal but could not be completed on our side. You have not been charged. Please try again — if it keeps failing, email us and we will sort it out.',
  capture_error:
    'Something went wrong while confirming your payment. If PayPal shows a completed charge, forward the receipt to us and we will activate your order manually.',
  missing_order: 'This payment link is incomplete. Please return to the pricing page and start checkout again.',
  unknown_order: 'We could not find this order. Please return to the pricing page and start checkout again.',
}

export default async function PaymentCancelledPage({ searchParams }: PageProps) {
  const { order: orderId, product, reason } = await searchParams
  const detail = (reason && REASONS[reason]) ??
    'The payment was cancelled before completion. You have not been charged.'

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
          BizLegal <span style={{ color: '#e9c349' }}>•</span> AI
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

        {product && (
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
            {product}
          </p>
        )}

        <p style={{ color: '#c3c6d7', fontSize: 15, lineHeight: 1.65, marginBottom: 24 }}>
          {detail}
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
          href="https://bizlegal-ai.com/pricing"
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
          Back to pricing →
        </a>

        <p style={{ marginTop: 32, fontSize: 12, color: '#8d90a0', lineHeight: 1.6 }}>
          Questions? Email{' '}
          <a href="mailto:team@bizlegal-ai.com" style={{ color: '#b4c5ff' }}>
            team@bizlegal-ai.com
          </a>
          {orderId ? ' and include the order id above' : ''}.
        </p>
      </div>
    </main>
  )
}
