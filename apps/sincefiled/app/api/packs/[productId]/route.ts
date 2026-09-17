import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { grantedPacks, isPackProduct, renderPackPdf } from '@/lib/packs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: { productId: string } }) {
  const session = verifyToken(req.cookies.get('sf_session')?.value ?? '')
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 })
  if (!isPackProduct(params.productId)) return Response.json({ error: 'not_found' }, { status: 404 })
  const grants = await grantedPacks(session.email)
  if (!grants.includes(params.productId)) return Response.json({ error: 'not_found' }, { status: 404 })
  const pdf = await renderPackPdf(params.productId)
  return new Response(Buffer.from(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${params.productId}-rhythm-pack.pdf"`,
      'cache-control': 'private, no-store',
    },
  })
}
