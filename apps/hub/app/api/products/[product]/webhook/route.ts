import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * DEPRECATED — this route has no HMAC verification and writes to the
 * legacy 'orders' table. It is blocked to prevent spoofed payment
 * confirmations.
 *
 * All payment webhooks must go through the canonical authenticated routes:
 *   POST /api/payments/nowpayments/webhook  (HMAC-verified)
 *   POST /api/payments/paypal/webhook       (PayPal signature-verified)
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { product: string } }
) {
  console.warn('[webhook/deprecated] blocked request for product:', params.product)
  return NextResponse.json(
    { error: 'This webhook endpoint is deprecated. Use /api/payments/nowpayments/webhook.' },
    { status: 403 }
  )
}
