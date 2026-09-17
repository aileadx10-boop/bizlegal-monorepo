export function GET() {
  if (process.env.NODE_ENV === 'production' || process.env.DEMO_MODE !== '1') {
    return Response.json({ error: 'not_found' }, { status: 404 })
  }
  return Response.json({ ok: true, demo: true })
}
