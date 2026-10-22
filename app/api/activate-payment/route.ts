// ============================================================
// SCROLL ALIGNMENT — Server-Side Payment Activation
// POST /api/activate-payment { sessionId }
// Verifies a Stripe session and updates the matching
// user_profiles row in Supabase — no localStorage required.
// Works even if the user hasn't onboarded yet (stores
// a pending_payment row keyed by email).
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getAdminClient, getAuthUser } from '@/lib/server/auth'

export const dynamic = 'force-dynamic'

// Payment status is server-owned: this route (after verifying the
// Stripe session) is the only place a membership is switched on.
// If the caller is signed in, the payment is attached to THEIR
// account, so a buyer who used a different email at checkout is
// still activated. A Stripe session can only activate one account.

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    // Verify with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const isPaid =
      session.payment_status === 'paid' ||
      session.payment_status === 'no_payment_required' ||
      session.status === 'complete'

    if (!isPaid) {
      return NextResponse.json({ activated: false, reason: 'not_paid' })
    }

    const plan      = session.metadata?.plan || 'reading'
    const caller    = await getAuthUser(req)
    const userId    = caller?.id || session.metadata?.userId || ''
    const email     = session.metadata?.email || session.customer_email || ''

    const supabase  = getAdminClient()
    let activated   = false

    // One Stripe session → one account.
    const { data: claimed } = await supabase
      .from('user_profiles')
      .select('id')
      .filter('profile->>stripeSessionId', 'eq', sessionId)
    if (claimed && claimed.length > 0) {
      if (userId && claimed.some(r => r.id === userId)) {
        return NextResponse.json({ activated: true, alreadyActive: true, plan })
      }
      return NextResponse.json({ activated: false, reason: 'session_already_used' }, { status: 409 })
    }

    // ── Try by userId (most reliable) ────────────────────────
    if (userId) {
      const { data: row } = await supabase
        .from('user_profiles')
        .select('id, profile')
        .eq('id', userId)
        .single()

      if (row) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profile = { ...(row.profile as any), isPaid: true, plan, stripeSessionId: sessionId }
        await supabase
          .from('user_profiles')
          .update({ profile, updated_at: new Date().toISOString() })
          .eq('id', userId)
        activated = true
      }
    }

    // ── Fallback: try by email ────────────────────────────────
    if (!activated && email) {
      const { data: rows } = await supabase
        .from('user_profiles')
        .select('id, profile')
        .eq('email', email)

      if (rows && rows.length > 0) {
        const row = rows[0]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profile = { ...(row.profile as any), isPaid: true, plan, stripeSessionId: sessionId }
        await supabase
          .from('user_profiles')
          .update({ profile, updated_at: new Date().toISOString() })
          .eq('id', row.id)
        activated = true
      }
    }

    // ── No profile yet — store pending payment by email ───────
    // When they complete onboarding, the pending will be applied
    if (!activated && email) {
      await supabase
        .from('pending_payments')
        .upsert({ email, session_id: sessionId, plan, created_at: new Date().toISOString() }, { onConflict: 'email' })
      // (table may not exist yet — that's fine, we'll handle gracefully)
    }

    return NextResponse.json({ activated, plan, email, userId })

  } catch (err) {
    console.error('[activate-payment]', err)
    return NextResponse.json({ error: 'Activation failed' }, { status: 500 })
  }
}
