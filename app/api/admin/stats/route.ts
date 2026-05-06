// ============================================================
// SCROLL ALIGNMENT — Admin: User Stats
// GET /api/admin/stats
// Returns total users, paid count, email opt-in count.
// Protected: requires valid Supabase session + admin email.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'morethanmanagementgroup@gmail.com'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function GET(req: NextRequest) {
  // Validate caller is admin via Authorization header (Supabase JWT)
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the token and check the email
  const token = authHeader.replace('Bearer ', '')
  const supabase = getAdminClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch all user profiles
  const { data: rows, error: dbErr } = await supabase
    .from('user_profiles')
    .select('email, profile')

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 })
  }

  const total = rows?.length ?? 0
  let paid = 0
  let emailOptIn = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users: any[] = []

  for (const row of (rows ?? [])) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = row.profile as any
    if (profile?.isPaid) paid++
    if (profile?.dailyEmail && profile?.isPaid) emailOptIn++
    users.push({
      firstName:     profile?.firstName ?? '—',
      email:         profile?.email ?? row.email ?? '—',
      isPaid:        profile?.isPaid ?? false,
      plan:          profile?.plan ?? 'free',
      dailyEmail:    profile?.dailyEmail ?? false,
      lifePathNumber: profile?.lifePathNumber ?? '—',
      chineseZodiac: profile?.chineseZodiac ?? '—',
      currentFocus:  profile?.currentFocus ?? '—',
      createdAt:     profile?.createdAt ?? '—',
    })
  }

  // Sort: paid first, then by name
  users.sort((a, b) => {
    if (a.isPaid && !b.isPaid) return -1
    if (!a.isPaid && b.isPaid) return 1
    return a.firstName.localeCompare(b.firstName)
  })

  return NextResponse.json({ total, paid, emailOptIn, users })
}
