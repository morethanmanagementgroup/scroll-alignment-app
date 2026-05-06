// ============================================================
// SCROLL ALIGNMENT — Admin: Daily Theme
// GET  /api/admin/theme?date=YYYY-MM-DD  → fetch theme for date
// POST /api/admin/theme                  → save theme
// Protected: requires valid Supabase session + admin email.
// Themes are stored in Supabase `admin_themes` table.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { AdminDailyTheme } from '@/lib/types'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'morethanmanagementgroup@gmail.com'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  const token = authHeader.replace('Bearer ', '')
  const supabase = getAdminClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  return user?.email === ADMIN_EMAIL
}

// ─── GET: Fetch theme for a date ─────────────────────────────
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const date = req.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ theme: null })

  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('admin_themes')
    .select('data')
    .eq('date', date)
    .single()

  if (error || !data) return NextResponse.json({ theme: null })
  return NextResponse.json({ theme: data.data as AdminDailyTheme })
}

// ─── POST: Save/update theme for a date ──────────────────────
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const theme = body.theme as AdminDailyTheme
  if (!theme?.date) {
    return NextResponse.json({ error: 'date required' }, { status: 400 })
  }

  const supabase = getAdminClient()
  const { error } = await supabase
    .from('admin_themes')
    .upsert({ date: theme.date, data: theme }, { onConflict: 'date' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, date: theme.date })
}
