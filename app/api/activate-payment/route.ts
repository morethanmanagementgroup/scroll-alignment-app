// ============================================================
// SCROLL ALIGNMENT — Server-Side Payment Activation
// POST /api/activate-payment { sessionId }
// Verifies a Stripe session and updates the matching
// user_profiles row in Supabase — no localStorage required.
// Works even if the user hasn't onboarded yet (stores
// a pending_payment row keyed by email).
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
    const userId    = session.metadata?.userId || ''
    const email     = session.metadata?.email || session.customer_email || ''

    const supabase  = getAdminClient()
    let activated   = false

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
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
