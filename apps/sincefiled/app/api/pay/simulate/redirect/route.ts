import type { NextRequest } from 'next/server'
import { grantEntitlement } from '@/lib/entitlement'

const UNLOCK_PRODUCTS = new Set(['sf_firm_49', 'sf_lifetime_329'])

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production' || process.env.DEMO_MODE !== '1') {
    return Response.json({ error: 'not_found' }, { status: 404 })
  }
  const product = new URL(req.url).searchParams.get('product_id') ?? 'unknown'
  if (UNLOCK_PRODUCTS.has(product)) {
    const result = await grantEntitlement({ productId: product })
    if (!result.ok) return Response.json(result, { status: 500 })
  }
  return Response.json({ ok: true, product_id: product, entitlement: UNLOCK_PRODUCTS.has(product) ? 'granted' : 'not_applicable', demo: true })
}
