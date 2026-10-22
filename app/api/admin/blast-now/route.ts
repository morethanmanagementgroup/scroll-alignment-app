// ============================================================
// SCROLL ALIGNMENT — Admin: Manual Blast Trigger
// POST /api/admin/blast-now
// Triggers the daily-blast endpoint immediately.
// Protected: requires valid Supabase session + admin email.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/server/auth'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'morethanmanagementgroup@gmail.com'


export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.replace('Bearer ', '')
  const supabase = getAdminClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  if (user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Call the daily-blast endpoint internally
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://scroll-alignment.vercel.app'
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET is not set in Vercel, so the blast cannot run.' }, { status: 503 })
  }

  try {
    const res = await fetch(`${appUrl}/api/daily-blast`, {
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    })
    const data = await res.json()
    return NextResponse.json({ triggered: true, result: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
