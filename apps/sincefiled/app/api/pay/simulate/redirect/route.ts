import type { NextRequest } from 'next/server'
import { grantEntitlement } from '@/lib/entitlement'

const UNLOCK_PRODUCTS = new Set(['sf_firm_49', 'sf_lifetime_329'])

export async function GET(req: NextRequest) {
  const product = new URL(req.url).searchParams.get('product_id') ?? 'unknown'
  if (UNLOCK_PRODUCTS.has(product)) {
    await grantEntitlement({ productId: product })
  }
  return Response.json({ ok: true, product_id: product, entitlement: UNLOCK_PRODUCTS.has(product) ? 'granted' : 'not_applicable', demo: true })
}
