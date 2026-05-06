// ============================================================
// SCROLL ALIGNMENT — Daily Blast Cron Endpoint
// Triggered by Vercel Cron at 11:00 UTC (7am Eastern)
// Queries all opted-in paid users from Supabase and sends
// their personalized Daily Scroll via Resend.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildDailyScrollEmail } from '@/lib/email/dailyScrollEmail'
import { generateDailyScrollTemplate } from '@/lib/scrollEngine'
import type { User, DailyScroll } from '@/lib/types'

// ─── Supabase admin client (service role — bypasses RLS) ─────
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// ─── Send one email via Resend REST API ───────────────────────
async function sendScrollEmail(
  toEmail: string,
  toName: string,
  html: string,
  date: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false

  const subject = `✦ Your Daily Scroll — ${new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`

  try {
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
        tags: [{ name: 'type', value: 'daily-scroll' }],
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

// ─── GET: Triggered by Vercel Cron ────────────────────────────
export async function GET(req: NextRequest) {
  // Validate cron secret to prevent unauthorized triggers
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://scroll-alignment.vercel.app'
  const today  = new Date().toISOString().split('T')[0]

  let sent = 0
  let skipped = 0
  let failed = 0

  try {
    const supabase = getAdminClient()

    // Fetch all paid users who have opted into daily emails
    // profile JSONB contains the full User object including dailyEmail flag
    const { data: rows, error } = await supabase
      .from('user_profiles')
      .select('id, email, profile')
      .not('profile', 'is', null)

    if (error) {
      console.error('[daily-blast] Supabase query error:', error)
      return NextResponse.json({ error: 'DB error', detail: error.message }, { status: 500 })
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: 'No users found', sent: 0 })
    }

    // Process users in batches to avoid hitting Resend rate limits
    for (const row of rows) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profile = row.profile as any
        if (!profile) { skipped++; continue }

        const user: User = profile as User

        // Only send to paid users who opted in
        if (!user.isPaid || !user.dailyEmail) { skipped++; continue }

        // Use the email from the profile (fallback to row email)
        const toEmail = user.email || row.email
        if (!toEmail) { skipped++; continue }

        // Generate today's scroll for this user
        const scroll: DailyScroll = generateDailyScrollTemplate(user, today)

        // Build the HTML email
        const html = buildDailyScrollEmail(user, scroll, appUrl)

        // Send via Resend
        const ok = await sendScrollEmail(toEmail, user.firstName, html, today)
        if (ok) {
          sent++
        } else {
          failed++
        }

        // Small delay between sends to be kind to Resend rate limits
        await new Promise(resolve => setTimeout(resolve, 150))

      } catch (userErr) {
        console.error('[daily-blast] Error processing user:', row.id, userErr)
        failed++
      }
    }

    return NextResponse.json({
      message: 'Daily blast complete',
      date: today,
      sent,
      skipped,
      failed,
      total: rows.length,
    })

  } catch (err) {
    console.error('[daily-blast] Fatal error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Vercel will also call this as POST from the cron trigger in some configs
export const POST = GET
