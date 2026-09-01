import { NextRequest, NextResponse } from 'next/server'
import { resolveCheckoutPrice } from '@/lib/payments/price-map'

export const dynamic = 'force-dynamic'

/**
 * GET /api/payments/price?product=&tier=&interval=
 *
 * Server-side price resolution for the /checkout page. The page calls
 * this on load so the price displayed (and later charged) comes from the
 * server-side price map — never from the `amount` query param, which a
 * buyer could edit (fleet finding F2). Unknown SKUs 404 so the page can
 * show an error instead of charging an arbitrary amount.
 */
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams
  const product = sp.get('product')?.trim() ?? ''
  const tier = sp.get('tier')?.trim() ?? ''
  const interval = sp.get('interval')?.trim() ?? ''
  if (!product || !tier || !interval) {
    return NextResponse.json(
      { ok: false, error: 'product, tier, interval required' },
      { status: 400 },
    )
  }
  const resolved = resolveCheckoutPrice(product, tier, interval)
  if (!resolved.ok) {
    return NextResponse.json(
      { ok: false, error: resolved.error, message: resolved.message },
      { status: 404 },
    )
  }
  return NextResponse.json({ ok: true, amount_cents: resolved.amountCents })
}
