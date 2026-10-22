// GET /api/me/entitlement — the signed-in user's membership, decided server-side.
import { NextRequest, NextResponse } from 'next/server'
import { entitlementOf, getAuthUser, getProfile } from '@/lib/server/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ authenticated: false, isPaid: false, plan: 'free', isAdmin: false })
  const profile = await getProfile(user.id)
  const e = entitlementOf(profile, user.email)
  return NextResponse.json({ authenticated: true, ...e })
}
