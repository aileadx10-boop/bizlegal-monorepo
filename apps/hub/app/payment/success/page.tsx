import { createClient } from '@supabase/supabase-js'
import { crossSellFor, type CrossSellSurface } from '@bizlegal/nurture-enqueue/cross-sell'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ order?: string; product?: string }>
}

function surfaceFor(product: string | null): CrossSellSurface | null {
  if (!product) return null
  const p = product.toLowerCase()
  if (p.startsWith('cp_') || p.includes('casepage')) return 'casepage'
  if (p.startsWith('sf_') || p.includes('sincefiled')) return 'sincefiled'
  if (p.includes('brainx')) return 'brainx'
  if (p.includes('deal44')) return 'deal44'
  if (p.includes('falseecho')) return 'falseecho'
  if (p.includes('sellerradar')) return 'sellerradar'
  if (p.includes('leaseparse')) return 'leaseparse'
  if (p.includes('tracr')) return 'tracr'
  if (p.includes('docai')) return 'docai'
  if (p.includes('lexaudit')) return 'lexaudit'
  if (p.includes('passport')) return 'forge_passport'
  if (p.includes('boi')) return 'forge_boi'
  if (p.includes('leadforge')) return 'leadforge'
  return null
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

  const surface = surfaceFor(productName)
  const offers = surface ? crossSellFor(surface) : []

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
          {productName === 'practice_revenue_report'
            ? confirmed
              ? 'Your full Practice Revenue Report is unlocked. The link is in your email; you can also refresh the report page you came from.'
              : 'Your payment is processing — crypto confirmations can take a few minutes. The unlock link for your Practice Revenue Report arrives by email once confirmed.'
            : confirmed
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

        {offers.length > 0 && (
            <div style={{ marginTop: 40, textAlign: 'left' }}>
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#8d90a0',
                  marginBottom: 12,
                  textAlign: 'center',
                }}
              >
                Also from the fleet
              </p>
              <div style={{ display: 'grid', gap: 12 }}>
                {offers.map((offer) => (
                  <a
                    key={offer.url}
                    href={offer.url}
                    style={{
                      display: 'block',
                      padding: '16px 18px',
                      border: '1px solid #2a3148',
                      borderRadius: 8,
                      textDecoration: 'none',
                      color: '#dee1f7',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{offer.headline}</div>
                    <div style={{ fontSize: 13, color: '#c3c6d7', lineHeight: 1.55, marginBottom: 8 }}>{offer.blurb}</div>
                    <div style={{ fontSize: 12, color: '#e9c349' }}>
                      {offer.product} · {offer.price} →
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

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
