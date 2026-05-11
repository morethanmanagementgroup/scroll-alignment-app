// ============================================================
// SCROLL ALIGNMENT — Record Referral
// POST /api/record-referral { sessionId, referralCode }
// Called from success page after payment verified.
// Finds the referrer by code, credits their balance,
// and inserts a row in the referrals table.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

const REFERRAL_PERCENT = 0.10  // 10% of amount paid

export async function POST(req: NextRequest) {
  try {
    const { sessionId, referralCode } = await req.json()

    if (!sessionId || !referralCode) {
      return NextResponse.json({ error: 'sessionId and referralCode required' }, { status: 400 })
    }

    // Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const isPaid =
      session.payment_status === 'paid' ||
      session.payment_status === 'no_payment_required' ||
      session.status === 'complete'

    if (!isPaid) {
      return NextResponse.json({ recorded: false, reason: 'not_paid' })
    }

    // Calculate referrer's earnings (10% of amount paid, in dollars)
    const amountPaidCents = session.amount_total ?? 0
    const earned = parseFloat(((amountPaidCents / 100) * REFERRAL_PERCENT).toFixed(2))
    const referredEmail = session.customer_email ?? session.metadata?.email ?? ''

    const supabase = getAdminClient()

    // Prevent double-recording
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ recorded: false, reason: 'already_recorded' })
    }

    // Find referrer by their referral code in user_profiles JSONB
    const { data: referrerRows } = await supabase
      .from('user_profiles')
      .select('id, profile')
      .filter('profile->>referralCode', 'eq', referralCode)

    if (!referrerRows || referrerRows.length === 0) {
      // Code doesn't match any user — record orphaned referral anyway
      await supabase.from('referrals').insert({
        referrer_code: referralCode,
        referrer_user_id: null,
        referred_email: referredEmail,
        stripe_session_id: sessionId,
        amount_earned: earned,
      })
      return NextResponse.json({ recorded: true, referrerFound: false, earned })
    }

    const referrerRow = referrerRows[0]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = referrerRow.profile as any

    // Credit referrer
    const newBalance = parseFloat(((profile.referralBalance ?? 0) + earned).toFixed(2))
    const newCount   = (profile.referralCount ?? 0) + 1
    const updatedProfile = { ...profile, referralBalance: newBalance, referralCount: newCount }

    await Promise.all([
      // Update referrer's profile
      supabase
        .from('user_profiles')
        .update({ profile: updatedProfile, updated_at: new Date().toISOString() })
        .eq('id', referrerRow.id),

      // Insert referral record
      supabase.from('referrals').insert({
        referrer_code: referralCode,
        referrer_user_id: referrerRow.id,
        referred_email: referredEmail,
        stripe_session_id: sessionId,
        amount_earned: earned,
      }),
    ])

    return NextResponse.json({
      recorded: true,
      referrerFound: true,
      referrerId: referrerRow.id,
      earned,
      newBalance,
    })

  } catch (err) {
    console.error('[record-referral]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
