// ============================================================
// SCROLL ALIGNMENT — Send Daily Scroll (Single User)
// Used for:
//   1. Test sends (admin sends to self)
//   2. Opt-in confirmation email (first send on toggle)
//   3. Manual re-send if user requests
//
// POST body: { userId: string, email: string, testMode?: boolean }
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildDailyScrollEmail } from '@/lib/email/dailyScrollEmail'
import { generateDailyScrollTemplate } from '@/lib/scrollEngine'
import type { User, DailyScroll } from '@/lib/types'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, testMode = false } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://scroll-alignment.vercel.app'
    const today  = new Date().toISOString().split('T')[0]
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
    }

    // Fetch the user profile from Supabase
    const supabase = getAdminClient()
    const { data: row, error } = await supabase
      .from('user_profiles')
      .select('email, profile')
      .eq('id', userId)
      .single()

    if (error || !row) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user: User = (row.profile as any) as User
    const toEmail = user.email || row.email

    if (!toEmail) {
      return NextResponse.json({ error: 'No email on file' }, { status: 400 })
    }

    // Generate scroll
    const scroll: DailyScroll = generateDailyScrollTemplate(user, today)

    // Build HTML email
    const html = buildDailyScrollEmail(user, scroll, appUrl)

    // Build subject
    const dateLabel = new Date(today + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    })
    const subject = testMode
      ? `[TEST] ✦ Your Daily Scroll — ${dateLabel}`
      : `✦ Your Daily Scroll — ${dateLabel}`

    // Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Scroll Alignment <onboarding@resend.dev>',
        to: [toEmail],
        subject,
        html,
        tags: [
          { name: 'type', value: testMode ? 'test-scroll' : 'daily-scroll' },
          { name: 'userId', value: userId },
        ],
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error('[send-daily-scroll] Resend error:', detail)
      return NextResponse.json({ error: 'Failed to send email', detail }, { status: 502 })
    }

    const result = await res.json()
    return NextResponse.json({
      success: true,
      emailId: result.id,
      to: toEmail,
      date: today,
      testMode,
    })

  } catch (err) {
    console.error('[send-daily-scroll] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
