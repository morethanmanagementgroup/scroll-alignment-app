// ============================================================
// SCROLL ALIGNMENT — Admin: Manual Blast Trigger
// POST /api/admin/blast-now
// Triggers the daily-blast endpoint immediately.
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
  const cronSecret = process.env.CRON_SECRET ?? ''

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
