import type { NextRequest } from 'next/server'
import { grantEntitlement } from '@/lib/store'

const UNLOCK_PRODUCTS = new Set(['cp_solo_49', 'cp_firm_149', 'cp_setup_490'])

export async function GET(req: NextRequest) {
  const p = new URL(req.url).searchParams.get('product_id') ?? 'unknown'
  if (UNLOCK_PRODUCTS.has(p)) {
    await grantEntitlement()
  }
  return Response.json({ ok: true, product_id: p, entitlement: UNLOCK_PRODUCTS.has(p) ? 'granted' : 'not_applicable', demo: true })
}
