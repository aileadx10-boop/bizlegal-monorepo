import type { NextRequest } from 'next/server'
import { grantEntitlement } from '@/lib/store'

const UNLOCK_PRODUCTS = new Set(['cp_solo_49', 'cp_firm_149', 'cp_setup_490'])

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production' || process.env.DEMO_MODE !== '1') {
    return Response.json({ error: 'not_found' }, { status: 404 })
  }
  const p = new URL(req.url).searchParams.get('product_id') ?? 'unknown'
  if (UNLOCK_PRODUCTS.has(p)) {
    const result = await grantEntitlement()
    if (!result.ok) return Response.json(result, { status: 500 })
  }
  return Response.json({ ok: true, product_id: p, entitlement: UNLOCK_PRODUCTS.has(p) ? 'granted' : 'not_applicable', demo: true })
}
