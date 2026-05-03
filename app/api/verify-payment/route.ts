import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const isPaid =
      session.payment_status === 'paid' || session.status === 'complete'

    if (!isPaid) {
      return NextResponse.json({ paid: false })
    }

    return NextResponse.json({
      paid: true,
      plan: session.metadata?.plan || 'reading',
      userId: session.metadata?.userId || '',
      email: session.metadata?.email || session.customer_email || '',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed'
    console.error('[verify-payment]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
