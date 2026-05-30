import { NextResponse } from 'next/server'
import { getSession, getUserProfile } from '../../../../lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ authenticated: false })
  }

  const profile = await getUserProfile(session.user.id)
  return NextResponse.json({
    authenticated: true,
    user: session.user,
    profile,
  })
}
